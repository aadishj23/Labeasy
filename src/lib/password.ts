// Single source of truth for the password policy (used on client + server).
export const PASSWORD_RULE =
  "Use 8+ characters with an uppercase, a lowercase, a number, and a special character.";

export function isStrongPassword(pw: unknown): boolean {
  return (
    typeof pw === "string" &&
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
}
