import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { notifyOrderStatus } from "@/lib/email";
import { creditOrderEarning } from "@/lib/wallet";
import { extractAnalytes } from "@/lib/ai-summary";

const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024;

// Lab uploads a report (PDF/image) against one of its orders.
export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ message: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  const orderId = String(form.get("orderId") || "");
  const orderItemId = form.get("orderItemId")
    ? String(form.get("orderItemId"))
    : null;

  if (!(file instanceof File)) {
    return Response.json({ message: "A file is required." }, { status: 400 });
  }
  if (!orderId) {
    return Response.json({ message: "orderId is required." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ message: "File must be under 10 MB." }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return Response.json(
      { message: "Only PDF, JPG, or PNG files are allowed." },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true } },
      lab: { select: { lab_name: true } },
      items: { select: { test_name: true } },
    },
  });
  if (!order || order.lab_id !== auth.labID) {
    return Response.json({ message: "Order not found." }, { status: 404 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToCloudinary(buffer, file.type, "labeasy/reports");

    // Auto-extract structured analyte values from the file (best-effort).
    const extracted = await extractAnalytes(
      buffer.toString("base64"),
      file.type
    );

    const report = await prisma.report.create({
      data: {
        order_id: order.id,
        order_item_id: orderItemId,
        user_id: order.user_id,
        lab_id: order.lab_id,
        file_url: url,
        results: extracted.length > 0 ? extracted : undefined,
        status: "READY",
      },
    });

    // Uploading a report completes the order (the only path to COMPLETED).
    const notTerminal = !["COMPLETED", "CANCELLED", "REFUNDED"].includes(
      order.status
    );
    if (notTerminal) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED" },
      });
      // Order is now complete — credit the lab's wallet.
      await creditOrderEarning({
        id: order.id,
        lab_id: order.lab_id,
        total: order.total,
      });
      void notifyOrderStatus({
        patientEmail: order.user?.email,
        labName: order.lab?.lab_name,
        status: "COMPLETED",
        items: order.items,
      });
    }

    return Response.json({ report, extractedCount: extracted.length });
  } catch (e) {
    console.error("Report upload failed:", e);
    return Response.json(
      { message: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
