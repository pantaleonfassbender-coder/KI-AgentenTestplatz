/* Minimaler XLSX-Generator ohne Abhaengigkeiten (CSP: nur eigene Skripte).
   Erzeugt eine echte .xlsx-Arbeitsmappe (ZIP, ungepackt gespeichert) mit
   mehreren Blaettern; Zahlen als Zahlen, Texte als inlineStr.
   Verwendung: XlsxExport.build([{name:"Blatt", rows:[[...],[...]]}]) -> Blob */

window.XlsxExport = (function () {
  const enc = new TextEncoder();

  // CRC32 (Standard-Polynom)
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function colLetter(n) {
    let s = "";
    while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
    return s;
  }

  function sheetXml(rows) {
    const out = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'];
    rows.forEach((row, ri) => {
      out.push(`<row r="${ri + 1}">`);
      row.forEach((v, ci) => {
        if (v === null || v === undefined || v === "") return;
        const ref = colLetter(ci + 1) + (ri + 1);
        if (typeof v === "number" && isFinite(v)) {
          out.push(`<c r="${ref}"><v>${v}</v></c>`);
        } else {
          out.push(`<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`);
        }
      });
      out.push("</row>");
    });
    out.push("</sheetData></worksheet>");
    return out.join("");
  }

  function workbookParts(sheets) {
    const CT = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
      '<Default Extension="xml" ContentType="application/xml"/>',
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'];
    sheets.forEach((_, i) => CT.push(
      `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`));
    CT.push("</Types>");

    const rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '</Relationships>';

    const wbSheets = sheets.map((s, i) =>
      `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("");
    const workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      `<sheets>${wbSheets}</sheets></workbook>`;

    const wbRels = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'];
    sheets.forEach((_, i) => wbRels.push(
      `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`));
    wbRels.push(`<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`);
    wbRels.push("</Relationships>");

    const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<fonts count="1"><font><sz val="10"/><name val="Arial"/></font></fonts>' +
      '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Standard" xfId="0" builtinId="0"/></cellStyles>' +
      '</styleSheet>';

    const files = [
      { name: "[Content_Types].xml", text: CT.join("") },
      { name: "_rels/.rels", text: rootRels },
      { name: "xl/workbook.xml", text: workbook },
      { name: "xl/_rels/workbook.xml.rels", text: wbRels.join("") },
      { name: "xl/styles.xml", text: styles },
    ];
    sheets.forEach((s, i) => files.push({ name: `xl/worksheets/sheet${i + 1}.xml`, text: sheetXml(s.rows) }));
    return files;
  }

  function zip(files) {
    const DOS_TIME = 12 << 11;                       // 12:00
    const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;
    const chunks = [];
    let offset = 0;
    const central = [];

    function le(n, len) {
      const a = new Uint8Array(len);
      for (let i = 0; i < len; i++) { a[i] = n & 0xFF; n = Math.floor(n / 256); }
      return a;
    }
    function push(a) { chunks.push(a); offset += a.length; }

    for (const f of files) {
      const nameB = enc.encode(f.name);
      const dataB = enc.encode(f.text);
      const crc = crc32(dataB);
      const local = offset;
      push(new Uint8Array([0x50, 0x4B, 0x03, 0x04]));
      push(le(20, 2)); push(le(0x0800, 2)); push(le(0, 2));
      push(le(DOS_TIME, 2)); push(le(DOS_DATE, 2));
      push(le(crc, 4)); push(le(dataB.length, 4)); push(le(dataB.length, 4));
      push(le(nameB.length, 2)); push(le(0, 2));
      push(nameB); push(dataB);
      central.push({ nameB, crc, size: dataB.length, local });
    }

    const cdStart = offset;
    for (const e of central) {
      push(new Uint8Array([0x50, 0x4B, 0x01, 0x02]));
      push(le(20, 2)); push(le(20, 2)); push(le(0x0800, 2)); push(le(0, 2));
      push(le(DOS_TIME, 2)); push(le(DOS_DATE, 2));
      push(le(e.crc, 4)); push(le(e.size, 4)); push(le(e.size, 4));
      push(le(e.nameB.length, 2)); push(le(0, 2)); push(le(0, 2));
      push(le(0, 2)); push(le(0, 2)); push(le(0, 4)); push(le(e.local, 4));
      push(e.nameB);
    }
    const cdSize = offset - cdStart;
    push(new Uint8Array([0x50, 0x4B, 0x05, 0x06]));
    push(le(0, 2)); push(le(0, 2));
    push(le(central.length, 2)); push(le(central.length, 2));
    push(le(cdSize, 4)); push(le(cdStart, 4)); push(le(0, 2));

    let total = 0;
    for (const c of chunks) total += c.length;
    const out = new Uint8Array(total);
    let pos = 0;
    for (const c of chunks) { out.set(c, pos); pos += c.length; }
    return out;
  }

  function build(sheets) {
    const bytes = zip(workbookParts(sheets));
    return new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  return { build };
})();
