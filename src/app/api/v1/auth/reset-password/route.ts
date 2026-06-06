import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";

export async function POST(request) {
  try {
    const { email, otp, newPassword, type } = await request.json();

    if (!email || !otp || !newPassword) {
      return Response.json(
        { message: "Email, code and new password are required" },
        { status: 400 }
      );
    }
    if (String(newPassword).length < 8) {
      return Response.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalized = email.toLowerCase().trim();

    const validOtp = await verifyOtp(normalized, "reset", otp);
    if (!validOtp) {
      return Response.json(
        { message: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Auto-detect whether the email belongs to a user or a lab.
    const [user, lab] = await Promise.all([
      prisma.user.findUnique({ where: { email: normalized } }),
      prisma.lab.findUnique({ where: { email: normalized } }),
    ]);

    if (!user && !lab) {
      return Response.json(
        { message: "No account found with this email." },
        { status: 404 }
      );
    }

    if (user) {
      await prisma.user.update({
        where: { email: normalized },
        data: { password: hashedPassword },
      });
    }
    if (lab) {
      await prisma.lab.update({
        where: { email: normalized },
        data: { password: hashedPassword },
      });
    }

    return Response.json({ message: "Password reset successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in /reset-password route:", error);
    return Response.json(
      { message: "Could not reset password. Please try again." },
      { status: 500 }
    );
  }
}
