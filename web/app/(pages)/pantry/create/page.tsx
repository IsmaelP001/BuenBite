"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Search } from "lucide-react";
import useGetIngredients from "@/hooks/useGetIngredients";
import { SearchBar } from "@/components/pantry/create/SearchBarResults";
import { SearchResults } from "@/components/pantry/create/SearchResults";
import { QuantityUnitForm } from "@/components/pantry/create/QuantityUnitForm";
import { NutritionalInfoCard } from "@/components/pantry/create/NutricionalInfoCard";
import { CreateIngredientDialog } from "@/components/pantry/create/CreateIngredientForm";
import { useIngredientSelection } from "@/hooks/useIngredientSelection";
import { AddedIngredientsList } from "@/components/purchases/history/addIngredients/AddedIngredientList";
import { CreatePantryDto } from "@/types/models/pantry";
import useCreatePantry from "@/hooks/useCreatePantry";
import { useRouter } from "next/navigation";
import useGetFilterActiveIngredients from "@/hooks/useGetFilterActiveIngredients";
import { QuickIngredientSuggestions } from "@/components/pantry/create/QuickIngredientSuggestions";
import { useMemo } from "react";

export interface NewIngredientForm {
  name: string;
  category: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  unit: string;
}

const PantryCreate = () => {
  const {
    state: {
      searchQuery,
      selectedIngredient,
      quantity,
      unit,
      expiryDate,
      addedIngredients,
      editingId,
      showCreateForm,
      newIngredient,
    },
    form: { setQuantity, setUnit, setExpiryDate },
    actions: {
      selectIngredient,
      updateSearchQuery,
      addIngredient,
      quickAddIngredient,
      updateIngredientQuantity,
      updateIngredientUnit,
      removeIngredient,
      editIngredient,
      openCreateForm,
      updateNewIngredientForm,
      closeCreateForm,
      clearAll,
      setShowCreateForm,
    },
  } = useIngredientSelection();
  const { mutateAsync: createPantryItemsMutation,isPending:isSaving } = useCreatePantry();
  const {  ingredients, isPending } = useGetIngredients({
    searchValue: searchQuery,
  });
  const {
    data: suggestedIngredients = [],
    isPending: isLoadingSuggestions,
  } = useGetFilterActiveIngredients();
  const router = useRouter()
  const addedIngredientIds = useMemo(
    () => new Set(addedIngredients.map((item) => item.ingredient.id)),
    [addedIngredients]
  );
  const noResults =
    searchQuery.length > 2 && !isPending && ingredients?.length === 0;

  const handleSaveAllIngredients = async () => {
    const itemsToAdd: CreatePantryDto[] = addedIngredients.map((item) => ({
      ingredientId: item.ingredient.id,
      measurementType: item.unit,
      measurementValue: item.quantity,
      expirationDate: item.expiryDate,
    }));

    try {
      await createPantryItemsMutation(itemsToAdd);
      router.back()
      clearAll();
    } catch (error) {
      console.error("Error adding items to purchase order:", error);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={()=>router.back()} variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Añadir a Despensa
            </h1>
            <p className="text-muted-foreground">
              Busca ingredientes o crea uno nuevo
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Buscar Ingrediente
                </CardTitle>
                <CardDescription>
                  Escribe el nombre del ingrediente que deseas añadir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <QuickIngredientSuggestions
                  suggestions={suggestedIngredients}
                  isPending={isLoadingSuggestions}
                  addedIngredientIds={addedIngredientIds}
                  onQuickAdd={quickAddIngredient}
                />

                <SearchBar value={searchQuery} onChange={updateSearchQuery} />

                {searchQuery.length > 0 && !selectedIngredient && (
                  <SearchResults
                    ingredients={ingredients}
                    isPending={isPending}
                    noResults={noResults}
                    searchQuery={searchQuery}
                    onSelectIngredient={selectIngredient}
                    onCreateClick={openCreateForm}
                  />
                )}
              </CardContent>
            </Card>

            {selectedIngredient && (
              <QuantityUnitForm
                mode='pantry'
                selectedIngredient={selectedIngredient}
                quantity={quantity}
                unit={unit}
                expiryDate={expiryDate}
                onQuantityChange={setQuantity}
                onUnitChange={setUnit}
                onExpiryDateChange={setExpiryDate}
                onAddToPantry={addIngredient}
              />
            )}
          </div>

          <div>
            {selectedIngredient ? (
              <NutritionalInfoCard ingredient={selectedIngredient} />
            ) : (
              <AddedIngredientsList
                isSaving={isSaving}
                items={addedIngredients}
                editingId={editingId}
                onQuantityChange={updateIngredientQuantity}
                onUnitChange={updateIngredientUnit}
                onEdit={editIngredient}
                onRemove={removeIngredient}
                onSave={handleSaveAllIngredients}
              />
            )}
          </div>
        </div>
      </main>
      <CreateIngredientDialog
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        formData={newIngredient}
        onFormChange={updateNewIngredientForm}
        onSubmit={(ing)=>selectIngredient(ing)}
        onClose={closeCreateForm}
      />
    </div>
  );
};

export default PantryCreate;
