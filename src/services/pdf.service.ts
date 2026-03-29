/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Expense } from './expense.model';
import type { Trip } from '../types';
import type { Debt } from '../utils/settlementCalculator';
import { isNativePlatform } from '../utils/helper';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';

(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs ?? (pdfFonts as any).vfs;

const PINK = '#FF7DA1';
const GRAY = '#888888';

const fmt = (n: number) => Math.round(n).toLocaleString();

function fixBase64(base64: string): string {
  base64 = base64.replace(/(\r\n|\n|\r)/gm, '');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  return base64;
}

async function savePdfNative(pdfDoc: any, fileName: string): Promise<void> {
  return new Promise((resolve) => {
    pdfDoc.getBase64(async (rawBase64: string) => {
      try {
        const base64Data = fixBase64(rawBase64);

        // Write to Cache — no extra entitlements needed on any iOS version
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        // @capacitor/share uses UIActivityViewController — works on all iOS, no private entitlements
        await Share.share({ title: fileName, files: [result.uri] });
        resolve();
      } catch (err: any) {
        alert(`[PDF] Error: ${err?.message ?? JSON.stringify(err)}`);
        resolve();
      }
    });
  });
}

// ─── Expense PDF ─────────────────────────────────────────────────────────────

function buildExpenseDocDefinition(expense: Expense): object {
  const payer = expense.participants.find(p => p.userId === expense.payerId);
  const date = new Date(expense.createdAt || '').toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const hasDiscount =
    expense.beforeDiscountTotal !== undefined &&
    expense.beforeDiscountTotal !== expense.actualTotal;

  const content: any[] = [
    { text: 'Ezbill', style: 'logo' },
    { text: expense.description, style: 'title' },
    { text: `Generated on ${new Date().toLocaleString()}  ·  ${date}`, style: 'meta' },

    // Summary box
    {
      table: {
        widths: ['*', '*', '*'],
        body: [[
          hasDiscount
            ? { stack: [{ text: 'BEFORE DISCOUNT', style: 'boxLabel' }, { text: fmt(expense.beforeDiscountTotal!), style: 'boxValueStrike' }] }
            : { stack: [{ text: 'TOTAL AMOUNT', style: 'boxLabel' }, { text: fmt(expense.totalAmount), style: 'boxValue' }] },
          hasDiscount
            ? { stack: [{ text: 'AFTER DISCOUNT', style: 'boxLabel' }, { text: fmt(expense.actualTotal ?? expense.totalAmount), style: 'boxValue' }] }
            : { stack: [{ text: 'TYPE', style: 'boxLabel' }, { text: expense.type === 'BILL' ? 'Itemized Bill' : 'Lump Sum', style: 'boxValueSm' }] },
          { stack: [{ text: 'PARTICIPANTS', style: 'boxLabel' }, { text: String(expense.participants.length), style: 'boxValue' }] },
        ]],
      },
      layout: { fillColor: '#fff5f7', hLineWidth: () => 0, vLineWidth: () => 0 },
      margin: [0, 0, 0, 16],
    },

    { text: 'PAID BY', style: 'sectionHeader' },
    {
      table: { widths: ['*'], body: [[{ text: payer?.name ?? 'Unknown', style: 'payerName' }]] },
      layout: { fillColor: '#f9fafb', hLineWidth: () => 0, vLineWidth: () => 0 },
      margin: [0, 0, 0, 16],
    },

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
                ...(p.userId === expense.payerId ? [{ text: 'PAID', style: 'paidBadge' }] : []),
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
              { stack: [{ text: item.name, bold: true, fontSize: 10 }, { text: assignees, color: GRAY, fontSize: 8, margin: [0, 2, 0, 0] }] },
              { text: `${item.quantity} × ${fmt(item.price)}`, alignment: 'center', fontSize: 10 },
              { text: fmt(item.quantity * item.price), alignment: 'right', bold: true, fontSize: 10 },
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
  const docDef = buildExpenseDocDefinition(expense);
  const fileName = `${expense.description.replace(/\s+/g, '_')}.pdf`;
  const pdfDoc = (pdfMake as any).createPdf(docDef);

  if (!isNativePlatform()) {
    pdfDoc.download(fileName);
    return;
  }
  await savePdfNative(pdfDoc, fileName);
}

// ─── Trip PDF ─────────────────────────────────────────────────────────────────

function buildTripDocDefinition(trip: Trip, expenses: Expense[], debts: Debt[]): object {
  const content: any[] = [
    { text: 'Ezbill', style: 'logo' },
    { text: `${trip.name} ${trip.emoji ?? ''}`, style: 'title' },
    { text: `Generated on ${new Date().toLocaleString()}`, style: 'meta' },

    // Summary box
    {
      table: {
        widths: ['*', '*', '*'],
        body: [[
          { stack: [{ text: 'TOTAL SPENT', style: 'boxLabel' }, { text: fmt(trip.spent || 0), style: 'boxValue' }] },
          { stack: [{ text: 'EXPENSES', style: 'boxLabel' }, { text: String(expenses.length), style: 'boxValue' }] },
          { stack: [{ text: 'MEMBERS', style: 'boxLabel' }, { text: String(trip.participants.length), style: 'boxValue' }] },
        ]],
      },
      layout: { fillColor: '#fff5f7', hLineWidth: () => 0, vLineWidth: () => 0 },
      margin: [0, 0, 0, 16],
    },

    // Expenses table
    { text: 'EXPENSES', style: 'sectionHeader' },
    {
      table: {
        widths: ['*', 'auto', 'auto'],
        headerRows: 1,
        body: [
          [
            { text: 'Description', style: 'tableHeader' },
            { text: 'Paid by', style: 'tableHeader', alignment: 'center' },
            { text: 'Amount', style: 'tableHeader', alignment: 'right' },
          ],
          ...expenses.map(exp => {
            const payer = trip.participants.find(p => p.userId === exp.payerId);
            return [
              { text: exp.description, fontSize: 10 },
              { text: payer?.name ?? 'Unknown', alignment: 'center', fontSize: 10, color: GRAY },
              { text: fmt(exp.totalAmount), alignment: 'right', bold: true, fontSize: 10 },
            ];
          }),
          // Total row
          [
            { text: 'TOTAL', bold: true, colSpan: 2, fontSize: 10 },
            {},
            { text: fmt(trip.spent || 0), alignment: 'right', bold: true, color: PINK, fontSize: 10 },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 16],
    },
  ];

  // Settlement / balances section
  if (debts.length > 0) {
    content.push({ text: 'SETTLEMENTS', style: 'sectionHeader' });
    content.push({
      table: {
        widths: ['*', 'auto', '*'],
        headerRows: 1,
        body: [
          [
            { text: 'From', style: 'tableHeader' },
            { text: 'Amount', style: 'tableHeader', alignment: 'center' },
            { text: 'To', style: 'tableHeader', alignment: 'right' },
          ],
          ...debts.map(d => [
            { text: d.fromName, fontSize: 10 },
            { text: fmt(d.amount), alignment: 'center', bold: true, color: PINK, fontSize: 10 },
            { text: d.toName, alignment: 'right', fontSize: 10 },
          ]),
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 16],
    });
  } else {
    content.push({ text: 'All settled up!', color: '#22c55e', bold: true, margin: [0, 0, 0, 16] });
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
      tableHeader: { fontSize: 9, bold: true, color: GRAY },
    },
  };
}

export async function exportTripToPDF(trip: Trip, expenses: Expense[], debts: Debt[]): Promise<void> {
  const docDef = buildTripDocDefinition(trip, expenses, debts);
  const fileName = `${trip.name.replace(/\s+/g, '_')}_trip.pdf`;
  const pdfDoc = (pdfMake as any).createPdf(docDef);

  if (!isNativePlatform()) {
    pdfDoc.download(fileName);
    return;
  }
  await savePdfNative(pdfDoc, fileName);
}

// ─── Share text ────────────────────────────────────────────────────────────────

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

export async function shareTripSummary(trip: Trip, expenses: Expense[], debts: Debt[]): Promise<void> {
  const expenseLines = expenses.map(e => `  • ${e.description}: ${fmt(e.totalAmount)}`).join('\n');
  const debtLines = debts.length > 0
    ? debts.map(d => `  • ${d.fromName} → ${d.toName}: ${fmt(d.amount)}`).join('\n')
    : '  All settled up!';

  const text = `🧳 ${trip.name} ${trip.emoji ?? ''}
💰 Total spent: ${fmt(trip.spent || 0)}
👥 ${trip.participants.length} members

Expenses:
${expenseLines}

Settlements:
${debtLines}

— Ezbill`;

  if (navigator.share) {
    await navigator.share({ title: trip.name, text });
  } else {
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }
}
