'use server'

import { ApiClient } from "@/services/apiClient"
import { CreateIngredientDto, FilterIngredients } from "@/types/models/ingredient"

const apiClient = new ApiClient()

export async function getIngredients(filters?:FilterIngredients){
    return apiClient.ingredientService.getIngredients(filters)
}

export async function getFilterActiveIngredients(){
    return apiClient.ingredientService.getFilterActiveIngredients()
}

export async function createIngredient(dto:CreateIngredientDto){
    return apiClient.ingredientService.create(dto)
}

