import { DocumentState } from "../types";

export function generatePrintableHtml(data: DocumentState, paperSize: "A4" | "A3"): string {
  const margin = paperSize === "A4" ? "8mm 10mm" : "12mm 15mm";
  const maxWidth = paperSize === "A4" ? "190mm" : "270mm";

  const balloonRowsHtml = data.balloons
    .map(
      (b) => `
      <tr>
        <td style="width: 34px; text-align: center; font-family: -apple-system, sans-serif; font-weight: 700; border: 1px solid #0f172a; padding: 4px 2px;">${b.id}</td>
        <td style="text-align: center; font-family: 'Courier New', monospace; font-weight: 700; font-size: 13px; border: 1px solid #0f172a; padding: 4px 2px;">${b.davlat || ""}</td>
        <td style="width: 80px; text-align: center; font-family: 'Courier New', monospace; font-weight: 700; font-size: 13px; border: 1px solid #0f172a; padding: 4px 2px;">${b.turi || ""}</td>
        <td style="width: 115px; text-align: center; padding: 4px 2px; border: 1px solid #0f172a;">
          ${
            b.qrImg
              ? `<img src="${b.qrImg}" style="width: 65px; height: 65px; display: block; margin: 0 auto 3px; object-fit: contain;" />`
              : ""
          }
          <div style="font-family: 'Courier New', monospace; font-weight: 700; font-size: 11px; letter-spacing: 0.03em;">${b.raqamLabel || ""}</div>
        </td>
        <td style="width: 75px; text-align: center; font-family: 'Courier New', monospace; font-weight: 700; font-size: 13px; border: 1px solid #0f172a; padding: 4px 2px;">${b.sigimi || ""}</td>
        <td style="width: 80px; text-align: center; font-family: 'Courier New', monospace; font-weight: 700; font-size: 13px; border: 1px solid #0f172a; padding: 4px 2px;">${b.ogirligi || ""}</td>
        <td style="width: 105px; text-align: center; font-family: 'Courier New', monospace; font-weight: 700; font-size: 13px; border: 1px solid #0f172a; padding: 4px 2px;">${b.sanasi1 || ""}</td>
        <td style="width: 105px; text-align: center; font-family: 'Courier New', monospace; font-weight: 700; font-size: 13px; border: 1px solid #0f172a; padding: 4px 2px;">${b.sanasi2 || ""}</td>
      </tr>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <title>Guvohnoma № ${data.docNo || ""}</title>
  <style>
    @page {
      size: ${paperSize} portrait;
      margin: ${margin};
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 10px;
      background: #ffffff;
      color: #0f172a;
      font-family: 'Georgia', 'Times New Roman', serif;
      -webkit-font-smoothing: antialiased;
    }
    .print-actions-bar {
      max-width: ${maxWidth};
      margin: 0 auto 15px;
      padding: 12px 16px;
      background: #0f172a;
      color: #ffffff;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .print-btn-main {
      background: #f97316;
      color: #0f172a;
      border: none;
      font-weight: 800;
      font-size: 13px;
      padding: 8px 18px;
      border-radius: 3px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .print-btn-main:hover {
      background: #ea580c;
      color: #ffffff;
    }
    .sheet {
      width: 100%;
      max-width: ${maxWidth};
      margin: 0 auto;
      background: #ffffff;
      padding: 4px 6px;
      position: relative;
    }
    .corner-mark {
      position: absolute;
      top: 6px;
      left: 6px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      border: 1px solid #0f172a;
      padding: 1px 5px;
      display: inline-block;
    }
    .qr-corner {
      position: absolute;
      top: 4px;
      right: 6px;
    }
    .top-qr-img {
      width: 88px;
      height: 88px;
      display: block;
      border: 1px solid #0f172a;
      padding: 2px;
      object-fit: contain;
      background: #fff;
    }
    .header-row {
      text-align: center;
      margin-bottom: 6px;
      padding-right: 100px;
    }
    .ilova {
      font-size: 11.5px;
      letter-spacing: 0.12em;
      color: #475569;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 800;
      text-transform: uppercase;
    }
    .title-main {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.03em;
      margin: 4px 0 2px;
      color: #0f172a;
    }
    .subtitle {
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 4px;
      color: #1e293b;
    }
    .doc-no {
      display: flex;
      justify-content: center;
      gap: 6px;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13.5px;
      margin-bottom: 6px;
      font-weight: 800;
    }
    .doc-no .val {
      display: inline-block;
      min-width: 100px;
      border-bottom: 1.5px solid #0f172a;
      text-align: center;
      padding: 1px 4px;
      font-weight: 800;
    }
    .issue-date-row {
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11.5px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .issue-date-row .val {
      display: inline-block;
      min-width: 90px;
      border-bottom: 1.5px solid #0f172a;
      text-align: center;
      padding: 1px 4px;
      font-weight: 700;
    }
    .section-banner-title {
      text-align: center;
      font-weight: 800;
      font-size: 12.5px;
      letter-spacing: 0.02em;
      color: #0f172a;
      margin: 6px 0 6px;
      text-transform: uppercase;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    table.info {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      table-layout: fixed;
    }
    table.info td {
      border: 1px solid #0f172a;
      padding: 4px 6px;
      vertical-align: top;
      font-size: 11.5px;
    }
    .label {
      font-size: 9.5px;
      color: #475569;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: block;
      margin-bottom: 2px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .cell-val {
      font-family: 'Courier New', Courier, monospace;
      font-size: 14.5px;
      font-weight: 700;
      color: #0f172a;
      display: block;
      min-height: 18px;
      word-break: break-all;
    }
    .weight-line {
      font-size: 12px;
      margin: 6px 0 4px;
      display: flex;
      align-items: baseline;
      gap: 6px;
      font-weight: 600;
    }
    .weight-line .val {
      display: inline-block;
      min-width: 90px;
      border-bottom: 1.5px solid #0f172a;
      text-align: center;
      font-weight: 700;
      padding: 0 4px;
    }
    .rule-box-wrapper {
      margin: 8px 0 6px;
    }
    .rule-header-title {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 3px;
    }
    .rule-text {
      font-size: 11px;
      line-height: 1.7;
      color: #0f172a;
    }
    .rule-text .code {
      display: inline-block;
      border-bottom: 1px solid #0f172a;
      padding: 0 6px;
      font-family: 'Courier New', Courier, monospace;
      font-weight: 700;
      font-size: 12px;
    }
    .table-caption {
      text-align: center;
      font-weight: 700;
      font-size: 13px;
      margin: 12px 0 6px;
      color: #0f172a;
      letter-spacing: normal;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    table.balloons {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    table.balloons th,
    table.balloons td {
      border: 1px solid #0f172a;
      padding: 4px 4px;
      font-size: 11px;
      text-align: center;
      vertical-align: middle;
    }
    table.balloons th {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 800;
      background: #f1f5f9;
      color: #0f172a;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 170px 1fr;
      row-gap: 6px;
      column-gap: 10px;
      font-size: 12px;
      margin-top: 10px;
      align-items: end;
    }
    .footer-grid .flabel {
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      color: #0f172a;
      line-height: 1.25;
    }
    .footer-grid .flabel .underline-text {
      text-decoration: underline;
      display: block;
    }
    .footer-grid .fval {
      border-bottom: 1px solid #0f172a;
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      padding: 1px 4px;
      min-height: 20px;
      color: #0f172a;
    }
    .stamp-row {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      margin-top: 14px;
    }
    .stamp-box {
      text-align: center;
      width: 140px;
    }
    .stamp-qr-img {
      width: 95px;
      height: 95px;
      display: block;
      margin: 0 auto;
      object-fit: contain;
      filter: invert(21%) sepia(100%) saturate(7414%) hue-rotate(359deg) brightness(101%) contrast(117%);
    }
    @media print {
      body {
        padding: 0 !important;
      }
      .print-actions-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions-bar">
    <div style="font-size: 13px; font-weight: 700;">Kushon Texnik Ko'rik — Hujjatni Chop Etish</div>
    <button class="print-btn-main" onclick="window.print()">🖨️ Chop etish (Ctrl + P)</button>
  </div>

  <div class="sheet">
    <div class="corner-mark">( 1 )</div>
    
    <div class="qr-corner">
      ${data.topQr ? `<img class="top-qr-img" src="${data.topQr}" alt="Top QR" />` : ""}
    </div>

    <div class="header-row">
      <div class="ilova">ILOVA D (MAJBURIY)</div>
      <div class="title-main">GUVOHNOMA</div>
      <div class="doc-no">
        <span>№</span>
        <span class="val">${data.docNo || ""}</span>
      </div>
      <div class="issue-date-row">
        <span>Berilgan sana:</span>&nbsp;
        <span class="val">${data.issueDate || ""}</span>
        &nbsp;&nbsp;<span style="color: #94a3b8;">|</span>&nbsp;&nbsp;
        <span>Tugagan sana:</span>&nbsp;
        <span class="val">${data.expireDate || ""}</span>
      </div>
    </div>

    <div class="section-banner-title">
      ATB* GA O'RNATILGAN GAZBALON(LAR)JINI SINOVDAN O'TGANI HAQIDA MA'LUMOT
    </div>

    <table class="info">
      <tbody>
        <tr>
          <td style="width: 65%;">
            <span class="label">Avtoulov egasi</span>
            <span class="cell-val">${data.avtoulovEgasi || ""}</span>
          </td>
          <td style="width: 35%;">
            <span class="label">PINFL</span>
            <span class="cell-val">${data.pinfl || ""}</span>
          </td>
        </tr>
        <tr>
          <td>
            <span class="label">ATB* rusumi</span>
            <span class="cell-val">${data.atbRusumi || ""}</span>
          </td>
          <td>
            <span class="label">Davlat rag. belgisi</span>
            <span class="cell-val">${data.davlatRagBelgisi || ""}</span>
          </td>
        </tr>
        <tr>
          <td>
            <span class="label">Ishlab chiqar. yili</span>
            <span class="cell-val">${data.ishlabChiqarYili || ""}</span>
          </td>
          <td>
            <span class="label">Dvigatel raqami</span>
            <span class="cell-val">${data.dvigatelRaqami || ""}</span>
          </td>
        </tr>
        <tr>
          <td>
            <span class="label">Shassi raqami</span>
            <span class="cell-val">${data.shassiRaqami || ""}</span>
          </td>
          <td>
            <span class="label">Kuzov raqami</span>
            <span class="cell-val">${data.kuzovRaqami || ""}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="weight-line">
      <span style="font-weight: bold; text-decoration: underline;">Bosib o'tgan yo'li</span>
      <span class="val">${data.km || ""}</span>
      <span style="font-weight: bold;">KM</span>
    </div>

    <div class="rule-box-wrapper">
      <div class="rule-header-title">
        ATB* jamlanmasi meyoriy hujjatlar talabiga javob beradi
      </div>
      <div class="rule-text">
        Avtoulov <strong>CTG*</strong> tizimi bilan to'liq jixozlangan va qabul qilish - topshirish guvohnomaga № <span class="code">${data.ruleGuvohnomaNo || data.docNo || ""}</span> va javob beradi tamg'a № <span class="code">${data.ruleTamgaNo || ""}</span> "JAMLANMA" bo'yicha <strong>CTG*</strong> tizimlari <strong>TsH64</strong> - 19855069075:2014
      </div>
    </div>

    <div class="table-caption">
      O'rnatilgan<br />
      gaz<br />
      balon(lar)i<br />
      haqida<br />
      ma'lumot
    </div>

    <table class="balloons">
      <thead>
        <tr>
          <th style="width: 34px;">№</th>
          <th>Ishlab chiqargan davlat</th>
          <th style="width: 80px;">Turi</th>
          <th style="width: 115px;">Balon(lar) raqami</th>
          <th style="width: 75px;">Sig'imi (L)</th>
          <th style="width: 80px;">Og'irligi (kg)</th>
          <th style="width: 105px;">Sinovdan o'tkazilgan sanasi</th>
          <th style="width: 105px;">Sinovdan o'tkazilgan sana</th>
        </tr>
      </thead>
      <tbody>
        ${balloonRowsHtml}
      </tbody>
    </table>

    <div class="footer-grid">
      <div class="flabel">
        <span class="underline-text">Gazbalon(lar)ni</span>
        <span class="underline-text">sinovdan o'tkazgan</span>
        <span class="underline-text">korxona:</span>
      </div>
      <div class="fval">${data.footerKorxona || ""}</div>

      <div class="flabel">
        <span class="underline-text">Manzil:</span>
      </div>
      <div class="fval">${data.footerManzil || ""}</div>

      <div class="flabel">
        <span class="underline-text">Telefon:</span>
      </div>
      <div class="fval">${data.footerTelefon || ""}</div>

      <div class="flabel">
        <span class="underline-text">Buyurtmachi:</span>
      </div>
      <div class="fval">${data.footerBuyurtmachi || ""}</div>

      <div class="flabel">
        <span class="underline-text">Gazbalon(lar)ni</span>
        <span class="underline-text">sinovdan o'tkazgan</span>
        <span class="underline-text">shaxsi:</span>
      </div>
      <div class="fval">${data.footerShaxsi || ""}</div>
    </div>

    <div class="stamp-row">
      <div class="stamp-box">
        ${
          data.stampQr
            ? `<img class="stamp-qr-img" src="${data.stampQr}" alt="Stamp QR" />`
            : ""
        }
      </div>
    </div>
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.print();
        } catch(e){}
      }, 400);
    });
  </script>
</body>
</html>`;
}

/**
 * Direct browser print on current window
 */
export function directPrint(paperSize: "A4" | "A3") {
  const styleId = "dynamic-print-page-style";
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  const margin = paperSize === "A4" ? "8mm 10mm" : "12mm 15mm";
  styleEl.innerHTML = `@page { size: ${paperSize} portrait; margin: ${margin}; }`;
  window.focus();
  window.print();
}

/**
 * 100% Reliable HTML File Download (Instantly opens in any browser and prints flawlessly)
 */
export function downloadPrintableHtml(data: DocumentState, paperSize: "A4" | "A3") {
  const htmlContent = generatePrintableHtml(data, paperSize);
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Guvohnoma_${data.docNo || "hujjat"}_${paperSize}.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Open in clean Blob tab without restrictions
 */
export function openBlobPrintWindow(data: DocumentState, paperSize: "A4" | "A3"): string {
  const htmlContent = generatePrintableHtml(data, paperSize);
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  return url;
}
