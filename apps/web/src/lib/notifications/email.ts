import { Resend } from "resend";
import nodemailer from "nodemailer";
import type { UserSettings } from "@changd/database";

export interface EmailOptions {
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private resendClient?: Resend;
  private smtpTransporter?: nodemailer.Transporter;
  private from: string;
  private provider: string;

  constructor(settings: UserSettings) {
    this.from = settings.emailFrom;
    this.provider = settings.emailProvider;

    if (settings.resendApiKey) {
      this.resendClient = new Resend(settings.resendApiKey);
    }

    if (settings.smtpHost) {
      this.smtpTransporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort || 587,
        secure: settings.smtpSecure,
        auth: {
          user: settings.smtpUser ?? undefined,
          pass: settings.smtpPassword ?? undefined,
        },
      });
    }
  }

  async send(options: EmailOptions): Promise<void> {
    const errors: Error[] = [];

    // "both" = try Resend first, then SMTP
    // "resend" = only Resend
    // "smtp" = only SMTP

    if (this.provider !== "smtp" && this.resendClient) {
      try {
        await this.resendClient.emails.send({
          from: this.from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        });
        return;
      } catch (err) {
        errors.push(err as Error);
        if (this.provider === "resend") throw err;
      }
    }

    if (this.provider !== "resend" && this.smtpTransporter) {
      try {
        await this.smtpTransporter.sendMail({
          from: this.from,
          to: options.to.join(", "),
          subject: options.subject,
          html: options.html,
          text: options.text,
        });
        return;
      } catch (err) {
        errors.push(err as Error);
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `Email delivery failed: ${errors.map((e) => e.message).join("; ")}`
      );
    }

    // No provider configured — log for dev
    console.warn("[EmailService] No email provider configured. Email not sent:", options.subject);
  }

  async sendChangeAlert({
    to,
    jobName,
    url,
    diffPercentage,
    screenshotUrl,
    diffUrl,
    jobId,
    appUrl,
  }: {
    to: string[];
    jobName: string;
    url: string;
    diffPercentage: number;
    screenshotUrl: string;
    diffUrl?: string;
    jobId: string;
    appUrl: string;
  }) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: #f9fafb; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .header { background: #2563eb; padding: 24px 32px; color: white; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
    .header p { margin: 4px 0 0; opacity: 0.85; font-size: 14px; }
    .body { padding: 32px; }
    .stat { display: inline-block; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 20px; margin-bottom: 24px; }
    .stat .value { font-size: 32px; font-weight: 800; color: #dc2626; }
    .stat .label { font-size: 13px; color: #6b7280; margin-top: 2px; }
    .field { margin-bottom: 16px; }
    .field label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .field p { margin: 4px 0 0; font-size: 14px; color: #111; }
    .field a { color: #2563eb; text-decoration: none; }
    .screenshots { margin-top: 24px; }
    .screenshots h3 { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; }
    .screenshots img { width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; }
    .cta { margin-top: 32px; }
    .cta a { display: inline-block; background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .footer { padding: 20px 32px; border-top: 1px solid #f3f4f6; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🔍 Change Detected</h1>
      <p>${jobName}</p>
    </div>
    <div class="body">
      <div class="stat">
        <div class="value">${diffPercentage.toFixed(2)}%</div>
        <div class="label">Pixels Changed</div>
      </div>

      <div class="field">
        <label>URL</label>
        <p><a href="${url}">${url}</a></p>
      </div>
      <div class="field">
        <label>Detected At</label>
        <p>${new Date().toLocaleString()}</p>
      </div>

      <div class="screenshots">
        <h3>New Screenshot</h3>
        <img src="${screenshotUrl}" alt="New screenshot" />
      </div>

      ${
        diffUrl
          ? `
      <div class="screenshots" style="margin-top:16px;">
        <h3>Diff Highlight <span style="font-weight:400;color:#6b7280;">(red = changed)</span></h3>
        <img src="${diffUrl}" alt="Diff image" />
      </div>`
          : ""
      }

      <div class="cta">
        <a href="${appUrl}/jobs/${jobId}">View Full Details →</a>
      </div>
    </div>
    <div class="footer">
      <p>Sent by <strong>Changd</strong> · <a href="${appUrl}/settings" style="color:#9ca3af;">Manage Notifications</a></p>
    </div>
  </div>
</body>
</html>`;

    await this.send({
      to,
      subject: `Change Detected: ${jobName} (${diffPercentage.toFixed(2)}% changed)`,
      html,
    });
  }

  async sendJobFailureAlert({
    to,
    jobName,
    url,
    error,
    jobId,
    appUrl,
  }: {
    to: string[];
    jobName: string;
    url: string;
    error: string;
    jobId: string;
    appUrl: string;
  }) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: #f9fafb; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .header { background: #dc2626; padding: 24px 32px; color: white; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
    .body { padding: 32px; }
    .error-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; font-family: monospace; color: #991b1b; }
    .cta a { display: inline-block; background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .footer { padding: 20px 32px; border-top: 1px solid #f3f4f6; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>⚠️ Monitor Job Failed</h1>
    </div>
    <div class="body">
      <p><strong>${jobName}</strong> failed to run.</p>
      <p style="font-size:14px;color:#6b7280;">URL: <a href="${url}">${url}</a></p>
      <div class="error-box">${error}</div>
      <div class="cta">
        <a href="${appUrl}/jobs/${jobId}">View Job →</a>
      </div>
    </div>
    <div class="footer">
      <p>Sent by <strong>Changd</strong></p>
    </div>
  </div>
</body>
</html>`;

    await this.send({
      to,
      subject: `Job Failed: ${jobName}`,
      html,
    });
  }
}

// Global email sender using env-level Resend key (for system emails)
export async function sendSystemEmail(options: EmailOptions) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@changd.app",
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
