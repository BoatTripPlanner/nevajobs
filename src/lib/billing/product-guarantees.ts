/** Garantías incluidas en créditos sueltos y desbloqueos. */
export const CREDIT_REPLACEMENT_DAYS = 7;
export const CHAT_DAYS_AFTER_UNLOCK = 30;

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
