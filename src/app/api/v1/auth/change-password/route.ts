import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function POST(request) {
  const authData = verifyAuth(request);
  if (!authData) return unauthorized();

  try {
    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return Response.json(
        { message: "Old and new passwords are required" },
        { status: 400 }
      );
    }
    if (String(newPassword).length < 8) {
      return Response.json(
        { message: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const isLab = authData.type === "lab";
    const id = isLab ? authData.labID : authData.userID;

    const account = isLab
      ? await prisma.lab.findUnique({ where: { id } })
      : await prisma.user.findUnique({ where: { id } });

    if (!account) {
      return Response.json({ message: "Account not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(oldPassword, account.password);
    if (!isValid) {
      return Response.json(
        { message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    if (isLab) {
      await prisma.lab.update({ where: { id }, data: { password: hashedPassword } });
    } else {
      await prisma.user.update({ where: { id }, data: { password: hashedPassword } });
    }

    return Response.json({ message: "Password changed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in /change-password route:", error);
    return Response.json(
      { message: "Could not change password. Please try again." },
      { status: 500 }
    );
  }
}
