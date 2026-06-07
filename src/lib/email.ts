import { Resend } from "resend";

let resendClient = null;
function getResend() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const shell = (heading: string, intro: string, inner: string) => `
  <div style="background:#070b14;padding:40px 0;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#0f1623;border:1px solid #1e293b;border-radius:16px;padding:32px;color:#e2e8f0;">
      <h1 style="margin:0 0 4px;font-size:20px;color:#ffffff;">${heading}</h1>
      <p style="margin:0 0 20px;font-size:14px;color:#94a3b8;">${intro}</p>
      ${inner}
      <p style="margin:24px 0 0;font-size:12px;color:#64748b;">— The Labeasy team</p>
    </div>
  </div>`;

/**
 * Notify the patient (confirmation) and the lab (new booking) after payment.
 * Fire-and-forget friendly: failures are swallowed so they never block checkout.
 */
export async function notifyOrderConfirmed(opts: {
  patientEmail?: string | null;
  patientName?: string | null;
  labEmail?: string | null;
  labName?: string | null;
  items: { test_name: string }[];
  total: number; // paise
}) {
  const from = process.env.RESEND_FROM_EMAIL;
  const amount = `₹${Math.round(opts.total / 100)}`;
  const list = `<ul style="margin:0 0 16px;padding-left:18px;font-size:14px;color:#e2e8f0;">${opts.items
    .map((i) => `<li>${i.test_name}</li>`)
    .join("")}</ul>`;
  const totalRow = `<p style="margin:0 0 4px;font-size:15px;color:#38bdf8;"><strong>Total paid: ${amount}</strong></p>`;

  const sends: Promise<unknown>[] = [];

  if (opts.patientEmail) {
    sends.push(
      getResend().emails.send({
        from,
        to: opts.patientEmail,
        subject: "Your Labeasy booking is confirmed",
        html: shell(
          "Booking confirmed",
          `Your tests at ${opts.labName ?? "the lab"} are booked.`,
          list + totalRow
        ),
      })
    );
  }
  if (opts.labEmail) {
    sends.push(
      getResend().emails.send({
        from,
        to: opts.labEmail,
        subject: "New booking on Labeasy",
        html: shell(
          "New booking received",
          `${opts.patientName ?? "A patient"} booked the following tests.`,
          list + totalRow
        ),
      })
    );
  }

  try {
    await Promise.allSettled(sends);
  } catch {
    /* never block on email */
  }
}

const STATUS_EMAIL: Record<
  string,
  { subject: string; heading: string; intro: string }
> = {
  CONFIRMED: {
    subject: "Your Labeasy booking is confirmed",
    heading: "Booking confirmed",
    intro: "Your booking is confirmed. We'll keep you posted on each step.",
  },
  SAMPLE_COLLECTED: {
    subject: "Sample collected — Labeasy",
    heading: "Sample collected",
    intro: "Your sample has been collected and is on its way to the lab.",
  },
  PROCESSING: {
    subject: "Your tests are being processed — Labeasy",
    heading: "Processing your tests",
    intro: "The lab is now processing your sample. Your report is on the way.",
  },
  REPORT_READY: {
    subject: "Your report is ready — Labeasy",
    heading: "Report ready",
    intro: "Good news — your report is ready. View it from your bookings.",
  },
  COMPLETED: {
    subject: "Your report is ready — Labeasy",
    heading: "Report ready",
    intro:
      "Your report is ready and your order is complete — view or download it from your bookings.",
  },
  CANCELLED: {
    subject: "Your Labeasy booking was cancelled",
    heading: "Booking cancelled",
    intro: "This booking has been cancelled. Any eligible refund will follow.",
  },
};

/**
 * Email the patient when an order moves to a new lifecycle status.
 * Fire-and-forget: failures are swallowed so they never block the request.
 */
export async function notifyOrderStatus(opts: {
  patientEmail?: string | null;
  labName?: string | null;
  status: string;
  items: { test_name: string }[];
}) {
  const copy = STATUS_EMAIL[opts.status];
  if (!copy || !opts.patientEmail) return;

  const from = process.env.RESEND_FROM_EMAIL;
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
  const list = `<ul style="margin:0 0 16px;padding-left:18px;font-size:14px;color:#e2e8f0;">${opts.items
    .map((i) => `<li>${i.test_name}</li>`)
    .join("")}</ul>`;
  const labRow = opts.labName
    ? `<p style="margin:0 0 16px;font-size:13px;color:#94a3b8;">Lab: ${opts.labName}</p>`
    : "";
  const cta = site
    ? `<a href="${site}/bookings" style="display:inline-block;margin-top:8px;background:#38bdf8;color:#04121f;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:8px;">View booking</a>`
    : "";

  try {
    await getResend().emails.send({
      from,
      to: opts.patientEmail,
      subject: copy.subject,
      html: shell(copy.heading, copy.intro, labRow + list + cta),
    });
  } catch {
    /* never block on email */
  }
}

const PURPOSE_COPY = {
  signup: {
    subject: "Verify your Labeasy account",
    heading: "Verify your email",
    intro: "Use the code below to finish creating your Labeasy account.",
  },
  reset: {
    subject: "Reset your Labeasy password",
    heading: "Reset your password",
    intro: "Use the code below to reset your Labeasy password.",
  },
};

/** Remind a patient it's time to re-test. Fire-and-forget friendly. */
export async function notifyTestReminder(opts: {
  patientEmail?: string | null;
  testName: string;
}) {
  if (!opts.patientEmail) return;
  const from = process.env.RESEND_FROM_EMAIL;
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://labeasy.in";
  const cta = `<a href="${site}/tests" style="display:inline-block;margin-top:8px;background:#38bdf8;color:#04121f;font-size:14px;font-weight:600;text-decoration:none;padding:10px 18px;border-radius:10px;">Book again</a>`;
  try {
    await getResend().emails.send({
      from,
      to: opts.patientEmail,
      subject: `Time to re-test: ${opts.testName}`,
      html: shell(
        "Re-test reminder",
        `It's time to repeat your ${opts.testName}.`,
        `<p style="margin:0 0 8px;font-size:14px;color:#e2e8f0;">Staying on top of your health is easier with regular check-ups. Book your ${opts.testName} on Labeasy whenever you're ready.</p>${cta}`
      ),
    });
  } catch {
    /* swallow */
  }
}

export async function sendOtpEmail(to, code, purpose = "signup") {
  const copy = PURPOSE_COPY[purpose] ?? PURPOSE_COPY.signup;
  const from = process.env.RESEND_FROM_EMAIL;

  const html = `
  <div style="background:#070b14;padding:40px 0;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#0f1623;border:1px solid #1e293b;border-radius:16px;padding:32px;color:#e2e8f0;">
      <h1 style="margin:0 0 4px;font-size:20px;color:#ffffff;">${copy.heading}</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;">${copy.intro}</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="display:inline-block;font-size:34px;font-weight:700;letter-spacing:10px;color:#38bdf8;background:#0b1220;border:1px solid #1e293b;border-radius:12px;padding:16px 24px;">${code}</span>
      </div>
      <p style="margin:0;font-size:13px;color:#94a3b8;">This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.</p>
      <p style="margin:24px 0 0;font-size:12px;color:#64748b;">— The Labeasy team</p>
    </div>
  </div>`;

  const { data, error } = await getResend().emails.send({
    from,
    to,
    subject: copy.subject,
    html,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }
  return data;
}
