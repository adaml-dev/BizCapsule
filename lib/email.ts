import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendInvitationEmail(
  to: string,
  inviteToken: string
): Promise<void> {
  const inviteUrl = `${APP_URL}/register?token=${inviteToken}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "You've been invited to BizCapsule",
      html: `
        <h1>Welcome to BizCapsule!</h1>
        <p>You've been invited to join BizCapsule. Click the link below to create your account:</p>
        <p><a href="${inviteUrl}">${inviteUrl}</a></p>
        <p>This invitation link will expire in 7 days.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    throw new Error("Failed to send invitation email");
  }
}

export async function sendApprovalNotificationEmail(to: string): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Your BizCapsule account has been approved",
      html: `
        <h1>Account Approved!</h1>
        <p>Your BizCapsule account has been approved by an administrator.</p>
        <p>You can now log in at: <a href="${APP_URL}">${APP_URL}</a></p>
      `,
    });
  } catch (error) {
    console.error("Failed to send approval notification:", error);
    // Don't throw error, approval should still work if email fails
  }
}

export async function sendAdminNotificationEmail(
  adminEmail: string,
  newUserEmail: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: "New user registration pending approval",
      html: `
        <h1>New User Registration</h1>
        <p>A new user has registered and is waiting for approval:</p>
        <p><strong>Email:</strong> ${newUserEmail}</p>
        <p>Please log in to the admin panel to approve or reject this user.</p>
        <p><a href="${APP_URL}/admin">${APP_URL}/admin</a></p>
      `,
    });
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    // Don't throw error, registration should still work if email fails
  }
}
