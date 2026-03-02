
'use client'
import { useIngredientSelection } from "@/hooks/useIngredientSelection";
import useGetIngredients from "@/hooks/useGetIngredients";
import useAddItemsToPurchaseOrder from "@/hooks/useAddItemsToPurchaseOrder";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchBar } from "@/components/pantry/create/SearchBarResults";
import { SearchResults } from "@/components/pantry/create/SearchResults";
import { QuantityUnitForm } from "@/components/pantry/create/QuantityUnitForm";
import { NutritionalInfoCard } from "@/components/pantry/create/NutricionalInfoCard";
import { AddedIngredientsList } from "@/components/purchases/history/addIngredients/AddedIngredientList";
import { CreateIngredientDialog } from "@/components/pantry/create/CreateIngredientForm";

const PantryCreate = () => {
  const { id } = useParams();
  
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
      isFormValid,
    },
    form: { setQuantity, setUnit, setExpiryDate },
    actions: {
      selectIngredient,
      updateSearchQuery,
      addIngredient,
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

  const {  ingredients, isPending } = useGetIngredients({
    searchValue: searchQuery,
  });

  const { mutateAsync: addItemsToPurchaseMutation, isPending: isPendingSave } =
    useAddItemsToPurchaseOrder();

  const noResults =
    searchQuery.length > 2 && !isPending && ingredients?.length === 0;

  const handleSaveAllIngredients = async () => {
    const itemsToAdd = addedIngredients.map((item) => ({
      ingredientId: item.ingredient.id,
      measurementType: item.unit,
      amountToBuy: item.quantity,
      name: {
        en: item.ingredient.name_en,
        es: item.ingredient.name_es,
        fr: item.ingredient.name_fr,
      },
      category: item.ingredient.category,
      id: item.id,
    }));

    try {
      await addItemsToPurchaseMutation({
        purchaseId: id as string,
        items: itemsToAdd,
      });
      clearAll();
    } catch (error) {
      console.error("Error adding items to purchase order:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Añadir a orden de compra
            </h1>
            <p className="text-muted-foreground">Busca ingredientes</p>
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
                <SearchBar
                  value={searchQuery}
                  onChange={updateSearchQuery}
                />

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
                mode="purchase"
                selectedIngredient={selectedIngredient}
                quantity={quantity}
                unit={unit}
                expiryDate={expiryDate}
                onQuantityChange={setQuantity}
                onUnitChange={setUnit}
                onExpiryDateChange={setExpiryDate}
                onAddToPantry={addIngredient}
                disabled={!isFormValid}
              />
            )}
          </div>

          <div>
            {selectedIngredient ? (
              <NutritionalInfoCard ingredient={selectedIngredient} />
            ) : (
              <AddedIngredientsList
                isSaving={isPendingSave}
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
        onSubmit={closeCreateForm}
      />
    </div>
  );
};

export default PantryCreate;
