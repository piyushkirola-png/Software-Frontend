export interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId: number;
  orderNumber: string;
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  total: number;
  buyerName?: string | null;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
  buyerAddress?: string | null;
  buyerGstin?: string | null;
  buyerState?: string | null;
  pdfUrl?: string | null;
  generatedAt: string;
}