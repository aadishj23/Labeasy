import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

const DOC_TYPES = ["license", "gst", "nabl", "other"];
const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 5 * 1024 * 1024;

// List the current lab's verification documents + status.
export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const lab = await prisma.lab.findUnique({
    where: { id: auth.labID },
    select: {
      status: true,
      accreditations: true,
      documents: { orderBy: { created_at: "desc" } },
    },
  });
  if (!lab) return unauthorized();

  return Response.json({
    status: lab.status,
    accreditations: lab.accreditations,
    documents: lab.documents,
  });
}

// Upload a verification document to Cloudinary.
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
  const type = String(form.get("type") || "other");

  if (!(file instanceof File)) {
    return Response.json({ message: "A file is required." }, { status: 400 });
  }
  if (!DOC_TYPES.includes(type)) {
    return Response.json({ message: "Invalid document type." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ message: "File must be under 5 MB." }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return Response.json(
      { message: "Only PDF, JPG, or PNG files are allowed." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToCloudinary(buffer, file.type);
    const doc = await prisma.labDocument.create({
      data: { lab_id: auth.labID as string, type, url },
    });
    return Response.json({ document: doc });
  } catch (e) {
    console.error("Lab document upload failed:", e);
    return Response.json(
      { message: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
