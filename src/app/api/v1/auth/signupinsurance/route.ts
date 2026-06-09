import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { isStrongPassword, PASSWORD_RULE } from "@/lib/password";
import { verifyOtp } from "@/lib/otp";
import { emailExists } from "@/lib/identity";

const MAX_BYTES = 10 * 1024 * 1024;
const LICENSE_MIME = ["application/pdf", "image/jpeg", "image/png"];

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ message: "Invalid submission." }, { status: 400 });
  }

  const g = (k: string) => String(form.get(k) ?? "").trim();
  const name = g("name");
  const email = g("email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const description = g("description");
  const otp = g("otp");
  const license = form.get("license");

  if (!name || !email || !password || !description) {
    return Response.json({ message: "All fields are required." }, { status: 400 });
  }
  if (!isStrongPassword(password)) {
    return Response.json({ message: PASSWORD_RULE }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ message: "Enter a valid email." }, { status: 400 });
  }
  if (!(license instanceof File)) {
    return Response.json({ message: "Please upload your license." }, { status: 400 });
  }
  if (license.size > MAX_BYTES || !LICENSE_MIME.includes(license.type)) {
    return Response.json(
      { message: "License must be a PDF/JPG/PNG under 10 MB." },
      { status: 400 }
    );
  }

  if (await emailExists(email)) {
    return Response.json(
      { message: "An account with this email already exists." },
      { status: 409 }
    );
  }
  const nameTaken = await prisma.insuranceCompany.findUnique({ where: { name } });
  if (nameTaken) {
    return Response.json(
      { message: "A company with this name already exists." },
      { status: 409 }
    );
  }

  const validOtp = await verifyOtp(email, "signup", otp);
  if (!validOtp) {
    return Response.json(
      { message: "Invalid or expired verification code." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await license.arrayBuffer());
    const license_url = await uploadToCloudinary(
      buffer,
      license.type,
      "labeasy/licenses"
    );
    const hashed = await bcrypt.hash(password, 10);

    const company = await prisma.insuranceCompany.create({
      data: { name, email, password: hashed, description, license_url, status: "PENDING" },
    });

    await createSession({
      type: "insurance",
      insuranceid: company.id,
      name: company.name,
    });
    return Response.json({ type: "insurance", name: company.name }, { status: 200 });
  } catch (e) {
    console.error("Insurance signup failed:", e);
    return Response.json(
      { message: "Could not create account. Please try again." },
      { status: 500 }
    );
  }
}
