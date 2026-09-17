import { apiGet, apiPost } from "../../lib/api-client";
import { CheckoutRequest, Order } from "../../types/order";
import { PagedResponse } from "../../types/product";

export const orderService = {
  async checkout(data: CheckoutRequest): Promise<Order> {
    return apiPost<Order>("/orders/checkout", data);
  },

  async getMyOrders(): Promise<Order[]> {
    return apiGet<Order[]>("/orders");
  },

  async getMyOrdersPaginated(
    page = 0,
    size = 10
  ): Promise<PagedResponse<Order>> {
    return apiGet<PagedResponse<Order>>("/orders/paginated", { page, size });
  },

  async getById(orderId: number): Promise<Order> {
    return apiGet<Order>(`/orders/${orderId}`);
  },

  async getByNumber(orderNumber: string): Promise<Order> {
    return apiGet<Order>(`/orders/number/${orderNumber}`);
  },
};