import { apiGet, apiPost, apiClient } from "../../lib/api-client";
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
    size = 10,
  ): Promise<PagedResponse<Order>> {
    return apiGet<PagedResponse<Order>>("/orders/paginated", { page, size });
  },

  async getMyOrdersFiltered(
    page = 0,
    size = 10,
    orderNumber?: string,
    status?: string,
    minTotal?: number,
    maxTotal?: number,
  ): Promise<PagedResponse<Order>> {
    const params: Record<string, unknown> = { page, size };
    if (orderNumber && orderNumber.trim())
      params.orderNumber = orderNumber.trim();
    if (status && status !== "ALL") params.status = status;
    if (minTotal !== undefined) params.minTotal = minTotal;
    if (maxTotal !== undefined) params.maxTotal = maxTotal;
    return apiGet<PagedResponse<Order>>("/orders/filtered", params);
  },

  async exportMyOrdersCsv(
    orderNumber?: string,
    status?: string,
    minTotal?: number,
    maxTotal?: number,
  ): Promise<void> {
    const params = new URLSearchParams();
    if (orderNumber && orderNumber.trim())
      params.append("orderNumber", orderNumber.trim());
    if (status && status !== "ALL") params.append("status", status);
    if (minTotal !== undefined) params.append("minTotal", String(minTotal));
    if (maxTotal !== undefined) params.append("maxTotal", String(maxTotal));

    const res = await apiClient.get(`/orders/export-csv?${params}`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([res.data], { type: "text/csv" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "my-orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async getById(orderId: number): Promise<Order> {
    return apiGet<Order>(`/orders/${orderId}`);
  },

  async getByNumber(orderNumber: string): Promise<Order> {
    return apiGet<Order>(`/orders/number/${orderNumber}`);
  },

  async exportCsv(): Promise<void> {
    const res = await apiClient.get("/admin/orders/export", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([res.data], { type: "text/csv" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async downloadInvoice(orderId: number): Promise<void> {
    const res = await apiClient.get(`/admin/orders/${orderId}/invoice`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([res.data], { type: "application/pdf" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `order-${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
