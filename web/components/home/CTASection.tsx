import { Button } from "@/components/ui/button";
import { ChefHat, ArrowRight } from "lucide-react";
import Link from "next/link";

const CTASection = () => {
  return (
    <section className="rounded-3xl bg-linear-to-r from-primary to-primary/80 p-8 md:p-12 lg:p-16 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary-foreground/10 mb-6">
          <ChefHat className="h-10 w-10 text-primary-foreground" />
        </div>
        
        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          ¿Listo para transformar tu cocina?
        </h2>
        
        <p className="text-primary-foreground/80 text-lg mb-8">
          Únete a miles de personas que ya están cocinando mejor, ahorrando dinero 
          y reduciendo el desperdicio de alimentos.
        </p>
        
        <Button
          variant="secondary"
          size="xl"
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          asChild
        >
          <Link href="/auth/signin">
            Crear Cuenta Gratis
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
