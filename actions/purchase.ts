'use server'

import { ApiClient } from "@/services/apiClient"
import { AddItemsToPurchase, ConfirmPurchaseItem, PurchaseItemDto } from "@/types/models/purchase"

const apiClient = new ApiClient()

export async function getUserPurchases(){
    return apiClient.purchaseService.getUserPurchases()
}

export async function getPurchaseOrder(orderId:string){
    return apiClient.purchaseService.getPurchaseOrder(orderId)
}

export async function getPurchaseItems(purchaseId:string){
    return apiClient.purchaseService.getPurchaseItems(purchaseId)
}

export async function createPurchase(dto:PurchaseItemDto[]){
    return apiClient.purchaseService.createPurchase(dto)
}

export async function addItemsToPurchase(dto:AddItemsToPurchase){
    return apiClient.purchaseService.addItemsToPurchase(dto)
}

export async function confirmPurchase(dto:ConfirmPurchaseItem[]){
    return apiClient.purchaseService.confirmPurchase(dto)
}

export async function removePurchaseItem(purchaseItemId: string){
    return apiClient.purchaseService.removePurchaseItem(purchaseItemId)
}
















