'use client'
import { Button } from "@/components/ui/button";
import useGetRecipeCooked from "@/hooks/useGetRecipeCooked";
import { Camera, Heart } from "lucide-react";

export default function CommunityPhotos() {
  const { data: cookedByUsers } = useGetRecipeCooked();
  return (
    <>
      {cookedByUsers && cookedByUsers?.length > 0 ? (
        <div className="bg-card rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">
                Fotos de la Comunidad
              </h2>
            </div>
            <Button variant="outline" size="sm">
              Subir Foto
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cookedByUsers.map((photo) => (
              <div
                key={photo.id}
                className="relative group rounded-lg overflow-hidden aspect-square"
              >
                <img
                  src={photo.image}
                  alt={`Foto de ${photo.user?.fullName}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <p className="text-sm font-medium truncate">
                      {photo.user?.fullName}
                    </p>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span className="text-xs">{10}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ):null}
    </>
  );
}
