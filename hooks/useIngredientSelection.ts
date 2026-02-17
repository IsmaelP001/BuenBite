import { useState, useCallback } from "react";
import { Ingredient } from "@/types/models/ingredient";
import { PantryIngredientInput } from "@/types/models/pantry";

export interface NewIngredientForm {
  name: string;
  category: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  unit: string;
}

const INITIAL_NEW_INGREDIENT: NewIngredientForm = {
  name: "",
  category: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  unit: "g",
};

export const useIngredientSelection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [addedIngredients, setAddedIngredients] = useState<PantryIngredientInput[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState<NewIngredientForm>(INITIAL_NEW_INGREDIENT);

  const resetForm = useCallback(() => {
    setSelectedIngredient(null);
    setQuantity("");
    setUnit("");
    setSearchQuery("");
    setExpiryDate(null);
    setEditingId(null);
  }, []);

  const selectIngredient = useCallback((ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setUnit(ingredient?.conversions?.allowed_units?.[0] || "");
    setSearchQuery(ingredient.name_es);
    setQuantity("");
    setExpiryDate(null);
    setEditingId(null);
  }, []);

  const updateSearchQuery = useCallback((value: string) => {
    setSearchQuery(value);
    if (selectedIngredient && value !== selectedIngredient.name_es) {
      setSelectedIngredient(null);
    }
  }, [selectedIngredient]);

  const addIngredient = useCallback(() => {
    if (!selectedIngredient || !quantity) return false;

    const newItem: PantryIngredientInput = {
      id: `${selectedIngredient.id}-${Date.now()}`,
      ingredient: selectedIngredient,
      quantity: parseFloat(quantity),
      unit,
      expiryDate,
      addedAt: new Date().toISOString(),
    };

    setAddedIngredients((prev) => [...prev, newItem]);
    resetForm();
    return true;
  }, [selectedIngredient, quantity, unit, expiryDate, resetForm]);

  const updateIngredientQuantity = useCallback((id: string, newQuantity: string) => {
    setAddedIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: parseFloat(newQuantity) } : item
      )
    );
  }, []);

  const updateIngredientUnit = useCallback((id: string, newUnit: string) => {
    setAddedIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unit: newUnit } : item
      )
    );
  }, []);

  const removeIngredient = useCallback((id: string) => {
    setAddedIngredients((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setSelectedIngredient(null);
    }
  }, [editingId]);

  const editIngredient = useCallback((item: PantryIngredientInput) => {
    setSelectedIngredient(item.ingredient);
    setQuantity(item.quantity.toString());
    setUnit(item.unit);
    setExpiryDate(item.expiryDate || null);
    setEditingId(item.id);
    setSearchQuery(item.ingredient.name_es);
  }, []);

  const openCreateForm = useCallback(() => {
    setNewIngredient((prev) => ({
      ...prev,
      name: searchQuery,
    }));
    setShowCreateForm(true);
  }, [searchQuery]);

  const updateNewIngredientForm = useCallback((data: Partial<NewIngredientForm>) => {
    setNewIngredient((prev) => ({ ...prev, ...data }));
  }, []);

  const closeCreateForm = useCallback(() => {
    setShowCreateForm(false);
    setNewIngredient({ ...INITIAL_NEW_INGREDIENT, name: searchQuery });
  }, [searchQuery]);

  const clearAll = useCallback(() => {
    setAddedIngredients([]);
    resetForm();
  }, [resetForm]);

  const isFormValid = Boolean(selectedIngredient && quantity && parseFloat(quantity) > 0);

  return {
    // State
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

    // Form setters
    form: {
      setQuantity,
      setUnit,
      setExpiryDate,
    },

    // Actions
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
      resetForm,
      clearAll,
      setShowCreateForm,
    },
  };
};