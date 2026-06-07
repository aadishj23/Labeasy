import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import { signupLabSchema } from "@/lib/validation";
import { verifyOtp } from "@/lib/otp";
import { prismaErrorResponse, isAdminEmail } from "@/lib/api";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      lab_name,
      owner_name,
      email,
      phone,
      password,
      license_no,
      gst_no,
      address,
      state,
      city,
      pincode,
      otp,
    } = body;

    const parsedData = signupLabSchema.safeParse(body);
    if (!parsedData.success) {
      return Response.json(parsedData.error, { status: 400 });
    }

    if (isAdminEmail(email)) {
      return Response.json(
        { message: "This email address is not available." },
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const lab = await prisma.lab.create({
      data: {
        id: nanoid(),
        lab_name,
        owner_name,
        email,
        phone,
        password: hashedPassword,
        license_no,
        gst_no,
        address,
        state,
        city,
        pincode,
      },
    });

    return Response.json(
      { message: "Lab created successfully", lab },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /signuplab route:", error);
    const friendly = prismaErrorResponse(error);
    if (friendly) return friendly;
    return Response.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
