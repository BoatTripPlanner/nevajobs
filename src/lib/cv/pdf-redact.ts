import "server-only";
import { PDFDocument, rgb } from "pdf-lib";
import { EMAIL_REGEX, PHONE_REGEX } from "@/lib/privacy/contact-patterns";

type RedactBox = { x: number; y: number; width: number; height: number };

function matchesContact(text: string): boolean {
  EMAIL_REGEX.lastIndex = 0;
  PHONE_REGEX.lastIndex = 0;
  return EMAIL_REGEX.test(text) || PHONE_REGEX.test(text);
}

async function findContactBoxes(pdfBytes: Uint8Array): Promise<RedactBox[][]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({ data: pdfBytes, useSystemFonts: true });
  const pdf = await loadingTask.promise;
  const boxesByPage: RedactBox[][] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();
    const pageBoxes: RedactBox[] = [];

    for (const item of textContent.items) {
      if (!("str" in item) || typeof item.str !== "string") continue;
      const str = item.str.trim();
      if (!str || !matchesContact(str)) continue;

      const transform = item.transform as number[];
      const x = transform[4] ?? 0;
      const y = transform[5] ?? 0;
      const fontHeight = Math.abs(transform[3] ?? 12);
      const width =
        "width" in item && typeof item.width === "number"
          ? item.width
          : str.length * fontHeight * 0.55;

      pageBoxes.push({
        x: x - 2,
        y: viewport.height - y - fontHeight - 2,
        width: width + 8,
        height: fontHeight + 6,
      });
    }

    boxesByPage.push(pageBoxes);
  }

  return boxesByPage;
}

/** Tapar emails y teléfonos detectados en el PDF + marca de agua. */
export async function redactContactFromPdf(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const boxesByPage = await findContactBoxes(pdfBytes);
  const doc = await PDFDocument.load(pdfBytes);
  const pages = doc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const boxes = boxesByPage[i] ?? [];

    for (const box of boxes) {
      page.drawRectangle({
        x: Math.max(0, box.x),
        y: Math.max(0, box.y),
        width: Math.min(box.width, width - box.x),
        height: Math.min(box.height, height - box.y),
        color: rgb(1, 1, 1),
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 0.5,
      });
      page.drawText("•••", {
        x: Math.max(0, box.x) + 2,
        y: Math.max(0, box.y) + 2,
        size: 8,
        color: rgb(0.55, 0.55, 0.55),
      });
    }

    page.drawText("Contacto protegido — desbloquea en Nevajobs", {
      x: 24,
      y: height - 28,
      size: 9,
      color: rgb(0.2, 0.45, 0.55),
    });
  }

  return doc.save();
}
