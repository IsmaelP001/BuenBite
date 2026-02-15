import { Button } from "@/components/ui/button";
import { ChefHat, Sparkles } from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-background to-accent/10 p-6 md:p-8 mb-8">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Qzk2QjAiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>La forma inteligente de cocinar</span>
          </div>
          
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
            Tu despensa, tus recetas,
            <span className="text-primary"> tu plan perfecto</span>
          </h1>
          
          <p className="text-muted-foreground text-sm md:text-base mb-5 max-w-xl">
            Administra ingredientes, descubre recetas personalizadas y planifica tus comidas.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button variant="hero" size="lg" asChild>
              <Link href="/auth/signin">
                <ChefHat className="h-4 w-4" />
                Comenzar Gratis
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/recipes">
                Ver Recetas
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
