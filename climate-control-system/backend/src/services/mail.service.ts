import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dns from "node:dns";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";

dns.setDefaultResultOrder("ipv4first");

let transporter: nodemailer.Transporter | null = null;
let isPreviewTransport = false;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const isDevelopment = env.NODE_ENV !== "production";

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    if (isDevelopment) {
      transporter = nodemailer.createTransport({ jsonTransport: true });
      isPreviewTransport = true;
      console.warn("[mail] SMTP credentials are missing. Using development preview transport.");
      return transporter;
    }

    throw new ApiError(500, "SMTP is not configured");
  }

  const transportOptions: SMTPTransport.Options = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    requireTLS: !env.SMTP_SECURE,
    tls: {
      minVersion: "TLSv1.2"
    },
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  };

  transporter = nodemailer.createTransport(transportOptions);
  isPreviewTransport = false;

  console.info("[mail] Using SMTP transport", {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER,
    dnsOrder: "ipv4first"
  });

  return transporter;
}

function buildResetEmailTemplate(resetUrl: string) {
  return {
    text: `You requested a password reset for Smart Climate Control.\n\nReset your password: ${resetUrl}\n\nThis link expires soon. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 560px; margin: 0 auto;">
        <h2 style="margin: 0 0 12px;">Reset Your Password</h2>
        <p style="margin: 0 0 16px; color: #334155;">
          We received a request to reset your Smart Climate Control password.
        </p>
        <p style="margin: 0 0 22px;">
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 18px; border-radius: 8px; background: #0ea5e9; color: #ffffff; text-decoration: none; font-weight: 600;">
            Reset Password
          </a>
        </p>
        <p style="margin: 0 0 8px; color: #475569;">This link expires in ${env.PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes.</p>
        <p style="margin: 0; color: #64748b; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `
  };
}

export async function sendPasswordResetEmail(args: { toEmail: string; resetUrl: string }) {
  const client = getTransporter();
  const template = buildResetEmailTemplate(args.resetUrl);

  try {
    await client.sendMail({
      from: env.SMTP_FROM,
      to: args.toEmail,
      subject: "Reset Your Password",
      text: template.text,
      html: template.html
    });
  } catch (error) {
    if (isPreviewTransport && env.NODE_ENV !== "production") {
      console.warn("[mail] Password reset email not sent. Development preview:", {
        to: args.toEmail,
        resetUrl: args.resetUrl,
        error: error instanceof Error ? error.message : String(error)
      });
      return;
    }

    console.error("[mail] Password reset email failed", {
      to: args.toEmail,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}
