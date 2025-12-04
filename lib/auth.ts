import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SESSION_EXPIRY = "1h"; // Session token expiry
const INVITE_EXPIRY = "7d"; // Invitation token expiry

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session tokens
export interface SessionPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export function generateSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_EXPIRY });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch (error) {
    return null;
  }
}

// Invitation tokens
export interface InviteTokenPayload {
  invitationId: string;
  email: string;
}

export function generateInviteToken(payload: InviteTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: INVITE_EXPIRY });
}

export function verifyInviteToken(token: string): InviteTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as InviteTokenPayload;
  } catch (error) {
    return null;
  }
}

// Approve tokens (for email verification)
export interface ApproveTokenPayload {
  userId: string;
  email: string;
}

export function generateApproveToken(payload: ApproveTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: INVITE_EXPIRY });
}

export function verifyApproveToken(token: string): ApproveTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as ApproveTokenPayload;
  } catch (error) {
    return null;
  }
}
