// Простая утилита для открытия HTML-отчёта в новом окне с диалогом печати браузера.

export function printReportHTML(opts: { title: string; reportCode: string; html: string }) {
  const { title, reportCode, html } = opts;
  const win = window.open('', '_blank', 'width=900,height=1200');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>${title} ${reportCode}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; color: #111; margin: 0; padding: 24px; line-height: 1.45; }
    .doc-header { text-align: center; margin-bottom: 24px; }
    .doc-header h1 { font-size: 18pt; margin: 0 0 4px; text-transform: uppercase; letter-spacing: .5px; }
    .doc-header p { margin: 2px 0; font-size: 11pt; color: #333; }
    .meta { display: flex; justify-content: space-between; margin: 16px 0 24px; font-size: 11pt; border-top: 1px solid #444; border-bottom: 1px solid #444; padding: 8px 0; }
    .meta strong { font-weight: bold; }
    h2.sec { font-size: 13pt; margin: 18px 0 8px; border-bottom: 1px solid #888; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; font-size: 10.5pt; }
    th, td { border: 1px solid #444; padding: 6px 8px; text-align: left; }
    th { background: #eee; font-weight: bold; }
    td.num, th.num { text-align: right; }
    .summary { font-size: 12pt; margin: 12px 0; }
    .summary div { margin: 4px 0; }
    .signature { margin-top: 48px; display: flex; justify-content: space-between; font-size: 11pt; }
    .signature .line { border-top: 1px solid #444; padding-top: 4px; min-width: 220px; text-align: center; }
    .actions { margin-bottom: 16px; text-align: right; }
    .actions button { padding: 8px 16px; cursor: pointer; font-size: 14px; }
    @media print { .actions { display: none; } body { padding: 0; } }
  </style></head><body>
  <div class="actions"><button onclick="window.print()">🖨 Печать / Сохранить в PDF</button></div>
  ${html}
  </body></html>`);
  win.document.close();
}

export function reportHeader(opts: { title: string; reportCode: string; dateFrom?: string; dateTo?: string; user: string }) {
  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('ru') : '—';
  return `
    <div class="doc-header">
      <p>ООО «НИКА ЛЮКС» — химчистка</p>
      <h1>${opts.title}</h1>
      <p>Код отчёта: <strong>${opts.reportCode}</strong></p>
    </div>
    <div class="meta">
      <span>Период с: <strong>${fmt(opts.dateFrom)}</strong> по: <strong>${fmt(opts.dateTo)}</strong></span>
      <span>Дата формирования: <strong>${new Date().toLocaleString('ru')}</strong></span>
      <span>Пользователь: <strong>${opts.user || '—'}</strong></span>
    </div>
  `;
}

export function signatureBlock() {
  return `
    <div class="signature">
      <div class="line">Ответственный сотрудник</div>
      <div class="line">Дата</div>
    </div>
  `;
}
