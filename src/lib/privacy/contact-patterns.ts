/** Detecta emails y teléfonos en texto extraído de CVs. */
export const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export const PHONE_REGEX =
  /(?:\+|00)?(?:\d[\s().-]?){9,15}\d/g;

export function containsContactInfo(text: string): boolean {
  return EMAIL_REGEX.test(text) || PHONE_REGEX.test(text);
}

export function findContactSpans(text: string): Array<{ start: number; end: number }> {
  const spans: Array<{ start: number; end: number }> = [];
  for (const regex of [EMAIL_REGEX, PHONE_REGEX]) {
    regex.lastIndex = 0;
    let match = regex.exec(text);
    while (match) {
      spans.push({ start: match.index, end: match.index + match[0].length });
      match = regex.exec(text);
    }
  }
  return spans;
}

export function maskContactInText(text: string): string {
  return text
    .replace(EMAIL_REGEX, "[email protegido]")
    .replace(PHONE_REGEX, "[teléfono protegido]");
}
