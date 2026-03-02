import { ChefHat, ShoppingCart, Calendar, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  { 
    icon: ChefHat, 
    label: "+5,000 Recetas", 
    description: "Explora y guarda tus favoritas",
    href: "/recipes" 
  },
  { 
    icon: ShoppingCart, 
    label: "Ahorra 30%", 
    description: "Administra despensa e ingredientes",
    href: "/pantry" 
  },
  { 
    icon: Calendar, 
    label: "Planifica tu semana", 
    description: "Crea menús balanceados fácilmente",
    href: "/tracking" 
  },
  { 
    icon: Sparkles, 
    label: "IA Personalizada", 
    description: "Recetas adaptadas a tus gustos",
    href: "/auth" 
  },
];

const InfoBanner = () => {
  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {features.map((feature, index) => (
          <Link
            key={index}
            href={feature.href}
            className="group flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-md"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <feature.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm mb-0.5">{feature.label}</div>
              <p className="text-xs text-muted-foreground leading-snug">
                {feature.description}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default InfoBanner;