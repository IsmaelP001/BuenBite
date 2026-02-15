import {
  ChefHat,
  UtensilsCrossed,
  CalendarDays,
  Package,
  Users,
  Flame,
  ShoppingCart,
  Coffee,
  Sun,
  Moon,
  Cake,
  Cookie,
  Salad,
  History,
  Lightbulb,
  Plus,
  Heart,
  TrendingUp,
  Star,
  Apple,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWithWrapper";

const FooterLinkGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-4">
    <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-foreground">
      {title}
    </h3>
    <ul className="space-y-2">{children}</ul>
  </div>
);

const FooterLink = ({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon?: React.ElementType;
  label: string;
}) => (
  <li>
    <Link
      href={to}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
    >
      {Icon && (
        <Icon className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
      )}
      <span>{label}</span>
    </Link>
  </li>
);

const SocialLink = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
  >
    <Icon className="h-5 w-5" />
  </a>
);

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <MaxWidthWrapper>
        <>
          <div className="container py-12 lg:py-16">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
              <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-6">
                <Link href="/" className="inline-block">
                  <span className="font-display text-2xl font-bold">
                    Buen<span className="text-primary">Bite</span>
                  </span>
                </Link>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Tu compañero inteligente en la cocina. Descubre recetas,
                  planifica comidas y gestiona tu despensa de forma fácil y
                  divertida.
                </p>

                {/* Newsletter */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">
                    Suscríbete a nuestro newsletter
                  </h4>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      className="max-w-[200px] bg-background"
                    />
                    <Button variant="hero" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-2">
                  <SocialLink href="#" icon={Facebook} label="Facebook" />
                  <SocialLink href="#" icon={Instagram} label="Instagram" />
                  <SocialLink href="#" icon={Twitter} label="Twitter" />
                  <SocialLink href="#" icon={Youtube} label="Youtube" />
                </div>
              </div>

              {/* Recipes */}
              <FooterLinkGroup title="Recetas">
                <FooterLink
                  to="/recipes"
                  icon={ChefHat}
                  label="Todas las Recetas"
                />
                <FooterLink
                  to="/recipes?meal=breakfast&filterType=meal"
                  icon={Coffee}
                  label="Desayuno"
                />
                <FooterLink
                  to="/recipes?meal=lunch&filterType=meal"
                  icon={Sun}
                  label="Almuerzo"
                />
                <FooterLink
                  to="/recipes?meal=dinner&filterType=meal"
                  icon={Moon}
                  label="Cena"
                />
                <FooterLink
                  to="/recipes?meal=dessert&filterType=meal"
                  icon={Cake}
                  label="Postre"
                />
                <FooterLink
                  to="/recipes?meal=snack&filterType=meal"
                  icon={Cookie}
                  label="Snack"
                />
              </FooterLinkGroup>

              {/* Categories */}
              <FooterLinkGroup title="Categorías">
          
                <FooterLink
                  to="/user/favorites"
                  icon={Star}
                  label="Favoritas"
                />
                <FooterLink
                  to="/user/recipes"
                  icon={History}
                  label="Guardadas"
                />
              </FooterLinkGroup>

              {/* Planning */}
              <FooterLinkGroup title="Planificación">
                <FooterLink
                  to="/meal-plans"
                  icon={CalendarDays}
                  label="Planes de Comida"
                />
                <FooterLink
                  to="/tracking"
                  icon={Flame}
                  label="Tracking Calorías"
                />
                <FooterLink to="/pantry" icon={Package} label="Mi Despensa" />
                <FooterLink
                  to="/pantry/create"
                  icon={Plus}
                  label="Agregar Ingrediente"
                />
                <FooterLink
                  to="/pantry?filters=expiring"
                  icon={Apple}
                  label="Por Vencer"
                />
              </FooterLinkGroup>

              {/* Shopping & Community */}
              <FooterLinkGroup title="Compras">
                <FooterLink
                  to="/purchases"
                  icon={ShoppingCart}
                  label="Lista de Compras"
                />
                <FooterLink
                  to="/purchases/history"
                  icon={History}
                  label="Historial"
                />
             
              </FooterLinkGroup>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border">
            <div className="container py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground text-center md:text-left">
                  © {new Date().getFullYear()} KitchenCraft. Todos los derechos
                  reservados.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                  <Link
                    href="/privacy"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacidad
                  </Link>
                  <Link
                    href="/terms"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Términos
                  </Link>
                  <Link
                    href="/cookies"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cookies
                  </Link>
                  <Link
                    href="/contact"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contacto
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer;