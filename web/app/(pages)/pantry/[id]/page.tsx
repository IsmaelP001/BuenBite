import { ArrowLeft, Link } from "lucide-react";
import PantryIngredientInfo from "@/components/pantry/pantryDetails/PantryIngredientInfo";
import TransactionHistory from "@/components/pantry/pantryDetails/TransactionHistory";
import RelatedRecipesSidebar from "@/components/pantry/pantryDetails/RelatedRecipesSidebar";

const PantryItemDetail = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 max-w-7xl mx-auto px-4">
        <Link href="/pantry" className="flex items-center gap-2 text-sm text-primary mb-4">
          <ArrowLeft className="w-4 h-4" />
          Volver a Mi Despensa
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PantryIngredientInfo />
            <TransactionHistory />
          </div>

          <RelatedRecipesSidebar />
        </div>
      </main>
    </div>
  );
};

export default PantryItemDetail;
