// Utilities for handling PDF rendering, base64 blob conversion, and dynamic generation

export function base64ToBlob(base64Data: string, contentType = 'application/pdf'): Blob {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const byteCharacters = atob(cleanBase64);
  const byteArrays: Uint8Array[] = [];

  const sliceSize = 512;
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays as any, { type: contentType });
}

export function getSafePreviewUrl(urlOrBase64?: string, mimeType = 'application/pdf'): string {
  if (!urlOrBase64) return '';
  if (urlOrBase64.startsWith('http://') || urlOrBase64.startsWith('https://') || urlOrBase64.startsWith('blob:')) {
    return urlOrBase64;
  }
  if (urlOrBase64.startsWith('data:')) {
    try {
      const blob = base64ToBlob(urlOrBase64, mimeType);
      return URL.createObjectURL(blob);
    } catch {
      return urlOrBase64;
    }
  }
  return urlOrBase64;
}

export function generateChapterPdfDataUri(material: {
  title: string;
  chapterCode?: string;
  badge?: string;
  summary?: string;
  content?: string;
  formula?: string;
  exampleCase?: string;
}): string {
  const sanitize = (text?: string) => (text || '').replace(/[()\\]/g, '\\$&').replace(/\n/g, ' ');

  const title = sanitize(material.title || 'Modul Pembelajaran');
  const code = sanitize(material.chapterCode || 'BAB 1.1');
  const badge = sanitize(material.badge || 'Teori');
  const summary = sanitize(material.summary || '-');
  const content = sanitize(material.content || '-');
  const formula = sanitize(material.formula || '-');
  const example = sanitize(material.exampleCase || '-');

  const stream = [
    'BT',
    '/F1 16 Tf',
    '50 785 Td',
    '(' + code + ': ' + title + ') Tj',
    'ET',
    'BT',
    '/F1 10 Tf',
    '50 760 Td',
    '(Kategori: ' + badge + ' | Modul Pembelajaran Matematika Kelas 7 SMP) Tj',
    'ET',
    'BT',
    '/F2 9 Tf',
    '50 740 Td',
    '(---------------------------------------------------------------------------------------------------------------------------------) Tj',
    'ET',
    'BT',
    '/F1 11 Tf',
    '50 710 Td',
    '(A. RINGKASAN MATERI:) Tj',
    'ET',
    'BT',
    '/F2 10 Tf',
    '50 690 Td',
    '(' + summary + ') Tj',
    'ET',
    'BT',
    '/F1 11 Tf',
    '50 645 Td',
    '(B. URAIAN KONSEP & TEORI:) Tj',
    'ET',
    'BT',
    '/F2 10 Tf',
    '50 625 Td',
    '(' + content + ') Tj',
    'ET',
    'BT',
    '/F1 11 Tf',
    '50 560 Td',
    '(C. RUMUS / KAIDAH MATEMATIS:) Tj',
    'ET',
    'BT',
    '/F2 10 Tf',
    '50 540 Td',
    '(' + formula + ') Tj',
    'ET',
    'BT',
    '/F1 11 Tf',
    '50 490 Td',
    '(D. CONTOH KASUS & PENYELESAIAN:) Tj',
    'ET',
    'BT',
    '/F2 10 Tf',
    '50 470 Td',
    '(' + example + ') Tj',
    'ET',
    'BT',
    '/F2 8 Tf',
    '50 40 Td',
    '(Fun Math World - Modul Pembelajaran Matematika Digital | Universitas Negeri Malang) Tj',
    'ET'
  ].join('\n');

  const streamLength = new TextEncoder().encode(stream).length;

  const lines = [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /MediaBox [0 0 595 842] /Contents 6 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj',
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    '6 0 obj << /Length ' + streamLength + ' >> stream\n' + stream + '\nendstream\nendobj'
  ];

  let currentOffset = 0;
  const xrefOffsets = [0];
  let fullDocBeforeXref = '';

  for (let i = 0; i < lines.length; i++) {
    xrefOffsets.push(currentOffset);
    const chunk = lines[i] + '\n';
    fullDocBeforeXref += chunk;
    currentOffset += new TextEncoder().encode(chunk).length;
  }

  let xref = 'xref\n0 ' + (lines.length + 1) + '\n0000000000 65535 f \n';
  for (let i = 1; i <= lines.length; i++) {
    const offsetStr = String(xrefOffsets[i]).padStart(10, '0');
    xref += offsetStr + ' 00000 n \n';
  }

  const startxref = currentOffset;
  const trailer = 'trailer << /Size ' + (lines.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF';

  const finalPdf = fullDocBeforeXref + xref + trailer;
  const base64 = btoa(unescape(encodeURIComponent(finalPdf)));
  return 'data:application/pdf;base64,' + base64;
}
