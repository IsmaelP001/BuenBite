"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/authContext";

export default function SignOutButton() {
  const { signOut } = useAuth();

  return (
    <Button
      variant="outline"
      className="w-full justify-start text-destructive hover:text-destructive"
      onClick={signOut}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Cerrar sesión
    </Button>
  );
}
