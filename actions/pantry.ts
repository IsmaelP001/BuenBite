"use server";

import { ApiClient } from "@/services/apiClient";
import { CreatePantryDto, PantryItem, PendingPurchase } from "@/types/models/pantry";

const apiClient = new ApiClient();
export async function getUserPantryItems() {
  return apiClient.pantryService.getUserPantryItems();
}

export async function getPantryById(ingredidentId: string) {
  return apiClient.pantryService.getPantryById(ingredidentId);
}

export async function createPantryItem(dto: CreatePantryDto[]) {
  return apiClient.pantryService.createPantryItem(dto);
}

export async function getPantryTransactions(pantryId: string) {
  return apiClient.pantryService.getPantryTransactions(pantryId);
}

export async function registerPendingPurchase(data: PendingPurchase) {
  return apiClient.pantryService.registerPendingPurchase(data);
}
export async function updatePantryItem(data: Partial<PantryItem>) {
  return apiClient.pantryService.updatePantryItem(data);
}

