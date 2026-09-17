import { apiDelete, apiGet, apiPost, apiPut } from "../../lib/api-client";
import { Address, AddressRequest } from "../../types/address";

export const addressService = {
  async getAll(): Promise<Address[]> {
    return apiGet<Address[]>("/users/me/addresses");
  },

  async getOne(id: number): Promise<Address> {
    return apiGet<Address>(`/users/me/addresses/${id}`);
  },

  async create(data: AddressRequest): Promise<Address> {
    return apiPost<Address>("/users/me/addresses", data);
  },

  async update(id: number, data: AddressRequest): Promise<Address> {
    return apiPut<Address>(`/users/me/addresses/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiDelete<void>(`/users/me/addresses/${id}`);
  },

  async setDefault(id: number): Promise<Address> {
    return apiPost<Address>(`/users/me/addresses/${id}/default`);
  },
};