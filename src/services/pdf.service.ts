/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Expense } from './expense.model';
import { isNativePlatform } from '../utils/helper';
import pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';

(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs ?? (pdfFonts as any).vfs;

const PINK = '#FF7DA1';
const GRAY = '#888888';

const fmt = (n: number) => Math.round(n).toLocaleString();

function buildDocDefinition(expense: Expense): object {
  const payer = expense.participants.find(p => p.userId === expense.payerId);
  const date = new Date(expense.createdAt || '').toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const hasDiscount =
    expense.beforeDiscountTotal !== undefined &&
    expense.beforeDiscountTotal !== expense.actualTotal;

  const content: any[] = [
    // Header
    { text: 'Ezbill', style: 'logo' },
    { text: expense.description, style: 'title' },
    {
      text: `Generated on ${new Date().toLocaleString()}  ·  ${date}`,
      style: 'meta',
    },

    // Summary box
    {
      table: {
        widths: ['*', '*', '*'],
        body: [[
          hasDiscount
            ? { stack: [
                { text: 'BEFORE DISCOUNT', style: 'boxLabel' },
                { text: fmt(expense.beforeDiscountTotal!), style: 'boxValueStrike' },
              ]}
            : { stack: [
                { text: 'TOTAL AMOUNT', style: 'boxLabel' },
                { text: fmt(expense.totalAmount), style: 'boxValue' },
              ]},
          hasDiscount
            ? { stack: [
                { text: 'AFTER DISCOUNT', style: 'boxLabel' },
                { text: fmt(expense.actualTotal ?? expense.totalAmount), style: 'boxValue' },
              ]}
            : { stack: [
                { text: 'TYPE', style: 'boxLabel' },
                { text: expense.type === 'BILL' ? 'Itemized Bill' : 'Lump Sum', style: 'boxValueSm' },
              ]},
          { stack: [
            { text: 'PARTICIPANTS', style: 'boxLabel' },
            { text: String(expense.participants.length), style: 'boxValue' },
          ]},
        ]],
      },
      layout: { fillColor: '#fff5f7', hLineWidth: () => 0, vLineWidth: () => 0 },
      margin: [0, 0, 0, 16],
    },

    // Payer
    { text: 'PAID BY', style: 'sectionHeader' },
    {
      table: {
        widths: ['*'],
        body: [[
          { text: payer?.name ?? 'Unknown', style: 'payerName' },
        ]],
      },
      layout: { fillColor: '#f9fafb', hLineWidth: () => 0, vLineWidth: () => 0 },
      margin: [0, 0, 0, 16],
    },

    // Participants split
    { text: 'PARTICIPANTS SPLIT', style: 'sectionHeader' },
    {
      table: {
        widths: ['*', 'auto', 'auto'],
        headerRows: 1,
        body: [
          [
            { text: 'Name', style: 'tableHeader' },
            { text: 'Split', style: 'tableHeader', alignment: 'center' },
            { text: 'Amount', style: 'tableHeader', alignment: 'right' },
          ],
          ...expense.participants.map(p => [
            {
              stack: [
                { text: p.name ?? p.userId, bold: p.userId === expense.payerId },
                ...(p.userId === expense.payerId
                  ? [{ text: 'PAID', style: 'paidBadge' }]
                  : []),
              ],
            },
            { text: p.splitType, alignment: 'center', color: GRAY, fontSize: 9 },
            { text: fmt(p.calculatedAmount || 0), alignment: 'right', bold: true },
          ]),
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 16],
    },
  ];

  // Bill items section
  if (expense.type === 'BILL' && expense.items?.length) {
    content.push({ text: 'RECEIPT ITEMS', style: 'sectionHeader' });
    content.push({
      table: {
        widths: ['*', 'auto', 'auto'],
        headerRows: 1,
        body: [
          [
            { text: 'Item', style: 'tableHeader' },
            { text: 'Qty × Price', style: 'tableHeader', alignment: 'center' },
            { text: 'Total', style: 'tableHeader', alignment: 'right' },
          ],
          ...expense.items.map(item => {
            const assignees = item.splits
              .filter(s => s.calculatedAmount > 0)
              .map(s => {
                const p = expense.participants.find(u => u.userId === s.userId);
                return `${p?.name ?? s.userId} (${fmt(s.calculatedAmount)})`;
              }).join(', ');
            return [
              {
                stack: [
                  { text: item.name, bold: true, fontSize: 10 },
                  { text: assignees, color: GRAY, fontSize: 8, margin: [0, 2, 0, 0] },
                ],
              },
              {
                text: `${item.quantity} × ${fmt(item.price)}`,
                alignment: 'center',
                fontSize: 10,
              },
              {
                text: fmt(item.quantity * item.price),
                alignment: 'right',
                bold: true,
                fontSize: 10,
              },
            ];
          }),
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 16],
    });
  }

  return {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 50],
    content,
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: 'Generated by Ezbill', color: GRAY, fontSize: 8 },
        { text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', color: GRAY, fontSize: 8 },
      ],
      margin: [40, 10],
    }),
    defaultStyle: { fontSize: 11, lineHeight: 1.4 },
    styles: {
      logo: { fontSize: 22, bold: true, color: PINK, margin: [0, 0, 0, 4] },
      title: { fontSize: 18, bold: true, margin: [0, 0, 0, 4] },
      meta: { fontSize: 9, color: GRAY, italics: true, margin: [0, 0, 0, 16] },
      sectionHeader: { fontSize: 9, bold: true, color: GRAY, letterSpacing: 1, margin: [0, 0, 0, 6] },
      boxLabel: { fontSize: 8, bold: true, color: GRAY, margin: [8, 8, 8, 2] },
      boxValue: { fontSize: 20, bold: true, color: PINK, margin: [8, 0, 8, 8] },
      boxValueSm: { fontSize: 12, bold: true, color: PINK, margin: [8, 0, 8, 8] },
      boxValueStrike: { fontSize: 14, bold: true, color: '#cccccc', decoration: 'lineThrough', margin: [8, 0, 8, 8] },
      payerName: { fontSize: 13, bold: true, margin: [10, 8, 10, 8] },
      tableHeader: { fontSize: 9, bold: true, color: GRAY },
      paidBadge: { fontSize: 7, bold: true, color: '#22c55e' },
    },
  };
}


export async function exportExpenseToPDF(expense: Expense): Promise<void> {
  const docDef = buildDocDefinition(expense);
  const fileName = `${expense.description.replace(/\s+/g, '_')}.pdf`;
  const pdfDoc = (pdfMake as any).createPdf(docDef);

  if (!isNativePlatform()) {
    pdfDoc.download(fileName);
    return;
  }

  // Native (iOS / Android): get PDF as base64 → Blob → File → native share sheet
  // No cap sync or FileOpener plugin needed — navigator.share is supported in WKWebView (iOS 15+)
  return new Promise((resolve) => {
    pdfDoc.getBase64(async (rawBase64: string) => {
      try {
        const binary = atob(rawBase64.replace(/(\r\n|\n|\r)/gm, ''));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const file = new File([bytes], fileName, { type: 'application/pdf' });
        await navigator.share({ files: [file], title: expense.description });
        resolve();
      } catch (err) {
        console.error('PDF share failed:', err);
        // Fallback: share text summary
        await shareExpense(expense);
        resolve();
      }
    });
  });
}

export function buildShareText(expense: Expense): string {
  const payer = expense.participants.find(p => p.userId === expense.payerId);
  const date = new Date(expense.createdAt || '').toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const splits = expense.participants
    .map(p => `  • ${p.name}: ${fmt(p.calculatedAmount || 0)}${p.userId === expense.payerId ? ' (paid)' : ''}`)
    .join('\n');
  const totalLine =
    expense.beforeDiscountTotal !== undefined && expense.beforeDiscountTotal !== expense.actualTotal
      ? `💰 Total: ${fmt(expense.actualTotal ?? expense.totalAmount)} (was ${fmt(expense.beforeDiscountTotal)})`
      : `💰 Total: ${fmt(expense.totalAmount)}`;

  return `💸 ${expense.description}
📅 ${date}
${totalLine}
👤 Paid by: ${payer?.name ?? 'Unknown'}

Split:
${splits}

— Ezbill`;
}

export async function shareExpense(expense: Expense): Promise<void> {
  const text = buildShareText(expense);
  if (navigator.share) {
    await navigator.share({ title: expense.description, text });
  } else {
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }
}
