import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import { signupUserSchema } from "@/lib/validation";
import { verifyOtp } from "@/lib/otp";
import { prismaErrorResponse, isAdminEmail } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, otp } = body;

    const parsedData = signupUserSchema.safeParse(body);
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
    const user = await prisma.user.create({
      data: {
        id: nanoid(),
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    return Response.json(
      { message: "User created successfully", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /signupuser route:", error);
    const friendly = prismaErrorResponse(error);
    if (friendly) return friendly;
    return Response.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
