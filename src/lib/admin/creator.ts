/** Email del creador — acceso al panel /admin */
export const CREATOR_EMAIL =
  process.env.NEVAJOBS_CREATOR_EMAIL ?? "alemv.mlg@gmail.com";

export function isCreatorEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === CREATOR_EMAIL.toLowerCase();
}
