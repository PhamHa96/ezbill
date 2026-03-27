import type { BillItem } from './expense.model';

/**
 * Simulates uploading an image to an AI OCR service and parsing receipt items
 */
export const mockOcrReceiptScan = async (_file: File): Promise<Omit<BillItem, 'id' | 'splits'>[]> => {
  // Simulate network processing delay (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Hardcoded receipt results mimicking realistic parsed data
  const parsedItems: Omit<BillItem, 'id' | 'splits'>[] = [
    { name: 'Ribeye Steak 🥩', price: 45.00, quantity: 2 },
    { name: 'Truffle Fries 🍟', price: 12.50, quantity: 1 },
    { name: 'Diet Coke 🥤', price: 3.50, quantity: 3 },
    { name: 'Service Charge 💳', price: 15.00, quantity: 1 }
  ];

  return parsedItems;
};
