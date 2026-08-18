function guessTitle(fileName) {
  return fileName.replace(/\.(docx?|pdf)$/i, "");
}

async function parseDocx(file) {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value;
}

async function parsePdf(file) {
  const [pdfjsLib, { default: pdfWorkerUrl }] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const paragraphs = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    if (pageText.trim()) paragraphs.push(pageText.trim());
  }
  return paragraphs.map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`).join("");
}

export async function parseMeetingFile(file) {
  const lower = file.name.toLowerCase();
  let html;
  if (lower.endsWith(".docx")) {
    html = await parseDocx(file);
  } else if (lower.endsWith(".pdf")) {
    html = await parsePdf(file);
  } else {
    throw new Error("僅支援 .docx 或 .pdf 檔案");
  }
  return { title: guessTitle(file.name), html };
}
