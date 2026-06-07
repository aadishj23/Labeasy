import prisma from "@/lib/prisma";
import { createOtp, getResendWaitMs } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { isAdminEmail } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const { email, purpose, type, phone } = await request.json();

    if (!email || !purpose) {
      return Response.json({ message: "Email and purpose are required" }, { status: 400 });
    }
    if (!["signup", "reset"].includes(purpose)) {
      return Response.json({ message: "Invalid purpose" }, { status: 400 });
    }
    const accountType = type === "lab" ? "lab" : "user";
    const normalized = email.toLowerCase().trim();

    if (purpose === "signup") {
      if (isAdminEmail(normalized)) {
        return Response.json(
          { message: "This email address is not available." },
          { status: 409 }
        );
      }
      const existing =
        accountType === "lab"
          ? await prisma.lab.findUnique({ where: { email: normalized } })
          : await prisma.user.findUnique({ where: { email: normalized } });
      if (existing) {
        return Response.json(
          { message: "An account with this email already exists." },
          { status: 409 }
        );
      }
      // Catch duplicate phone early (before sending a code) for clearer feedback.
      if (phone) {
        const phoneTaken =
          accountType === "lab"
            ? await prisma.lab.findUnique({ where: { phone } })
            : await prisma.user.findUnique({ where: { phone } });
        if (phoneTaken) {
          return Response.json(
            { message: "This phone number is already registered." },
            { status: 409 }
          );
        }
      }
    } else {
      // reset: the email must belong to a user OR a lab
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
    }

    // Rate-limit: enforce a cooldown between codes for the same email + purpose.
    const waitMs = await getResendWaitMs(normalized, purpose);
    if (waitMs > 0) {
      return Response.json(
        {
          message: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another code.`,
        },
        { status: 429 }
      );
    }

    const code = await createOtp(normalized, purpose);
    await sendOtpEmail(normalized, code, purpose);

    return Response.json({ message: "Verification code sent" }, { status: 200 });
  } catch (error) {
    console.error("Error in /send-otp route:", error);
    return Response.json(
      { message: "Could not send verification code. Please try again." },
      { status: 500 }
    );
  }
}
