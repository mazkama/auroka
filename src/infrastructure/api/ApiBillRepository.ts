import { IBillRepository } from '@/domain/repositories/IBillRepository';
import { Bill, CreateBillDTO, UpdateBillDTO } from '@/domain/entities/bill';
import { apiFetch } from './apiClient';

export class ApiBillRepository implements IBillRepository {
  async getBills(status?: string, category?: string): Promise<Bill[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiFetch<Bill[]>(`/bills${query}`);
  }

  async createBill(dto: CreateBillDTO): Promise<Bill> {
    return await apiFetch<Bill>('/bills', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateBill(dto: UpdateBillDTO): Promise<Bill> {
    return await apiFetch<Bill>(`/bills/${dto.id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  async deleteBill(billId: string | number): Promise<boolean> {
    try {
      await apiFetch(`/bills/${billId}`, {
        method: 'DELETE',
      });
      return true;
    } catch {
      return false;
    }
  }

  async payBill(billId: string | number): Promise<{ success: boolean; message: string; data: Bill }> {
    return await apiFetch<{ success: boolean; message: string; data: Bill }>(`/bills/${billId}/pay`, {
      method: 'POST',
    });
  }
}
