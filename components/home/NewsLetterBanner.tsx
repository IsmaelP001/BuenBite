'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

const NewsletterBanner = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("¡Gracias por suscribirte!");
      setEmail("");
    }
  };

  return (
    <section className="mb-10 mt-5 rounded-2xl bg-linear-to-r from-primary/10 via-accent/10 to-primary/10 p-6 border border-primary/20">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Recetas semanales en tu correo</h3>
            <p className="text-muted-foreground text-sm">Recibe las mejores recetas y tips de cocina</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 flex-1 max-w-md">
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="default">
            <Sparkles className="h-4 w-4 mr-1" />
            Suscribirse
          </Button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterBanner;
