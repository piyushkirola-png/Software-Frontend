export interface PaymentInitiateResponse {
  paymentId: number;
  gateway: string;
  gatewayOrderId: string;
  amount: number;
  currency: string;
  status: string;
  gatewayData: {
    paymentLink?: string;
    [key: string]: unknown;
  };
}

export interface Payment {
  id: number;
  orderId: number;
  orderNumber: string;
  gateway: string;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  amount: number;
  currency: string;
  status: "INITIATED" | "SUCCESS" | "FAILED";
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
}
