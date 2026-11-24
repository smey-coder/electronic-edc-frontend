/**
 * Export helpers. No extra packages are needed.
 *
 * columns: [{ key, label, value: (row) => text }]
 * rows:    the objects to write (for example students)
 */

/* ------------------------------------------------------------------ */
/* CSV                                                                 */
/* ------------------------------------------------------------------ */
// Stops spreadsheet programs from running text such as =CMD(...) as a formula.
// Phone numbers like +855 12 345 678 are left as they are.
const needsGuard = (text) =>
  /^[=@\t\r]/.test(text) || (/^[+-]/.test(text) && !/^[+-][\d\s().,-]*$/.test(text));

const csvCell = (value) => {
  // eslint-disable-next-line no-control-regex
  let text = value == null ? '' : String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  if (needsGuard(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** CSV text with a BOM, so Excel shows Khmer and other non-English text correctly. */
export function toCsv(rows, columns) {
  const lines = [columns.map((column) => csvCell(column.label)).join(',')];
  rows.forEach((row) => lines.push(columns.map((column) => csvCell(column.value(row))).join(',')));
  return `\uFEFF${lines.join('\r\n')}`;
}

/* ------------------------------------------------------------------ */
/* Excel (.xlsx) written by hand: an .xlsx file is a zip of XML files  */
/* ------------------------------------------------------------------ */
const encoder = new TextEncoder();

const xmlEscape = (value) =>
  String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const columnName = (index) => {
  let name = '';
  let n = index;
  do {
    name = String.fromCharCode(65 + (n % 26)) + name;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return name;
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes) => {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

/** A zip file with the files stored as they are (no compression). */
function zip(files) {
  const parts = [];
  const central = [];
  let offset = 0;
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;

    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true); // names are UTF-8
    lv.setUint16(8, 0, true); // stored
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, name.length, true);
    local.set(name, 30);
    parts.push(local, file.data);

    const entry = new Uint8Array(46 + name.length);
    const cv = new DataView(entry.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    entry.set(name, 46);
    central.push(entry);

    offset += local.length + size;
  });

  const centralSize = central.reduce((total, entry) => total + entry.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  const all = [...parts, ...central, end];
  const result = new Uint8Array(all.reduce((total, part) => total + part.length, 0));
  let position = 0;
  all.forEach((part) => {
    result.set(part, position);
    position += part.length;
  });
  return result;
}

const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';

/**
 * Bytes of an .xlsx file. Every value is written as text, so IDs and phone numbers
 * keep their leading zeros and are never turned into numbers or formulas.
 */
export function toXlsx(rows, columns, sheetName = 'Sheet1') {
  const header = columns.map((column) => String(column.label));
  const body = rows.map((row) => columns.map((column) => String(column.value(row) ?? '')));

  const widths = header.map((label, index) => {
    const longest = Math.max(label.length, ...body.map((line) => line[index].length), 0);
    return Math.min(45, Math.max(10, longest + 3));
  });

  const cell = (text, rowNumber, columnIndex, styled) =>
    `<c r="${columnName(columnIndex)}${rowNumber}" t="inlineStr"${styled ? ' s="1"' : ''}><is><t xml:space="preserve">${xmlEscape(text)}</t></is></c>`;

  const sheetRows = [header, ...body]
    .map((line, rowIndex) => `<row r="${rowIndex + 1}">${line.map((text, columnIndex) => cell(text, rowIndex + 1, columnIndex, rowIndex === 0)).join('')}</row>`)
    .join('');

  const lastColumn = columnName(Math.max(0, columns.length - 1));
  const sheet =
    `${XML}<worksheet xmlns="${NS}">` +
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    `<cols>${widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join('')}</cols>` +
    `<sheetData>${sheetRows}</sheetData>` +
    `<autoFilter ref="A1:${lastColumn}${body.length + 1}"/>` +
    '</worksheet>';

  const styles =
    `${XML}<styleSheet xmlns="${NS}">` +
    '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>' +
    '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FF0F2438"/><bgColor indexed="64"/></patternFill></fill></fills>' +
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    '</styleSheet>';

  const safeName = String(sheetName).replace(/[[\]:*?/\\]/g, ' ').trim().slice(0, 31) || 'Sheet1';
  const files = [
    {
      name: '[Content_Types].xml',
      text:
        `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        '</Types>',
    },
    {
      name: '_rels/.rels',
      text:
        `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>',
    },
    {
      name: 'xl/workbook.xml',
      text:
        `${XML}<workbook xmlns="${NS}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
        `<sheets><sheet name="${xmlEscape(safeName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      text:
        `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        '</Relationships>',
    },
    { name: 'xl/styles.xml', text: styles },
    { name: 'xl/worksheets/sheet1.xml', text: sheet },
  ];

  return zip(files.map((file) => ({ name: file.name, data: encoder.encode(file.text) })));
}

/* ------------------------------------------------------------------ */
/* Download and print                                                  */
/* ------------------------------------------------------------------ */
export const MIME = {
  csv: 'text/csv;charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

/** Saves data as a file in the browser. */
export function downloadFile(data, filename, mime) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** Opens the browser print window with a clean table. Choose "Save as PDF" there. */
export function printTable({ title, subtitle, rows, columns }) {
  const head = columns.map((column) => `<th>${xmlEscape(column.label)}</th>`).join('');
  const body = rows
    .map((row, index) => `<tr><td class="n">${index + 1}</td>${columns.map((column) => `<td>${xmlEscape(column.value(row))}</td>`).join('')}</tr>`)
    .join('');

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${xmlEscape(title)}</title><style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: 'IBM Plex Sans', 'Noto Sans Khmer', 'Khmer OS', system-ui, sans-serif; color: #0f2438; font-size: 11px; margin: 0; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .meta { margin: 0 0 14px; color: #64748b; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #0f2438; color: #fff; text-align: left; padding: 6px 8px; font-weight: 600; }
    td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; word-break: break-word; }
    td.n { color: #94a3b8; width: 28px; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    tbody tr:nth-child(even) td { background: #f8fafc; }
  </style></head><body><h1>${xmlEscape(title)}</h1><p class="meta">${xmlEscape(subtitle)}</p>
  <table><thead><tr><th>#</th>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;

  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  const remove = () => setTimeout(() => frame.remove(), 500);
  frame.contentWindow.onafterprint = remove;
  setTimeout(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
  }, 300);
  setTimeout(() => frame.remove(), 5 * 60 * 1000); // clean up if the print window was left open
}

/** 2026-11-24 */
export const todayStamp = () => new Date().toISOString().slice(0, 10);

/** Keeps a file name safe on every system. */
export const safeFileName = (name, fallback = 'export') =>
  String(name ?? '')
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, '-')
    .replace(/\.(xlsx|csv|pdf)$/i, '')
    .slice(0, 80) || fallback;