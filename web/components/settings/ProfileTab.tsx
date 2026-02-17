"use client";
import React, { useState } from "react";
import { TabsContent } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Camera } from "lucide-react";
import { Separator } from "../ui/separator";
import { User } from "@supabase/supabase-js";

export default function ProfileTab({ user }: { user: User }) {
  if (!user) {
    return (
      <TabsContent value="profile" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del perfil</CardTitle>
            <CardDescription>
              Error al cargar la informacion del usuario
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
    );
  }
  return (
    <TabsContent value="profile" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del perfil</CardTitle>
          <CardDescription>
            Gestiona tu información personal y cómo otros te ven
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user?.user_metadata?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {user?.user_metadata?.name}
              </h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <Separator />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
