import { Resend } from "resend";

let resendClient = null;
function getResend() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
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
