import { apiService } from './api.service';

export interface BillScanExpense {
  name: string;
  amount: number;
  quantity: number;
}

export interface BillScanResponse {
  expenses: BillScanExpense[];
  actualTotal: number;
  beforeDiscountTotal: number;
}

class BillService {
  /**
   * Scans a base64 receipt image and returns extracted items using AI backend API
   * POST /bill/scan
   */
  async scanBill(base64Image: string): Promise<BillScanResponse> {
    return apiService.post<BillScanResponse>('/bill/scan', {
      image: base64Image,
    });
  }
}

export const billService = new BillService();
