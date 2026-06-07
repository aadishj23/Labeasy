import { v2 as cloudinary } from "cloudinary";
import { nanoid } from "nanoid";

// The SDK auto-reads CLOUDINARY_URL from the environment on import.
cloudinary.config({ secure: true });

const EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
};

export async function uploadToCloudinary(
  buffer: Buffer,
  mime: string,
  folder = "labeasy/lab-docs"
): Promise<string> {
  const isImage = mime.startsWith("image/");
  // PDFs (and other non-images) must go as `raw` — delivering a PDF via the
  // image pipeline is blocked by default on Cloudinary accounts (empty/403).
  const resource_type: "image" | "raw" = isImage ? "image" : "raw";

  const options: Record<string, unknown> = { folder, resource_type };
  if (!isImage) {
    // Keep a real extension so the file downloads with the correct type.
    options.public_id = `${nanoid(16)}.${EXT[mime] || "bin"}`;
  }

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err || !result) return reject(err || new Error("Upload failed"));
      resolve(result.secure_url);
    });
    stream.end(buffer);
  });
}

export { cloudinary };
