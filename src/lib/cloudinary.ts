import { v2 as cloudinary } from "cloudinary";

// The SDK auto-reads CLOUDINARY_URL from the environment on import.
cloudinary.config({ secure: true });

export async function uploadToCloudinary(
  buffer: Buffer,
  mime: string,
  folder = "labeasy/lab-docs"
): Promise<string> {
  const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;
  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "auto",
  });
  return res.secure_url;
}

export { cloudinary };
