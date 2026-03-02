"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getRecipeTips } from "@/actions/recipes";
import useGetRecipeTips from "@/hooks/useGetRecipeTips";
import { useSaveRecipeTip } from "@/hooks/useSaveRecipeTip";
import { Camera, Lightbulb, X } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";
import { RecipeTip } from "@/types/models/recipes";
import { useInfiniteQuery } from "@tanstack/react-query";
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function RecipeTips() {
  const [showAddTipModal, setShowAddTipModal] = useState(false);
  const [tipComment, setTipComment] = useState("");
  const [tipImage, setTipImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showTipsListModal, setShowTipsListModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams();
  const { data: tipsPreview, isPending } = useGetRecipeTips({ limit: 2, page: 1 });
  const {
    data: tipsListData,
    isPending: isTipsListPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["recipe_tips_list", id],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      await getRecipeTips({
        recipeId: id as string,
        limit: 5,
        page: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.hasMore) return undefined;
      return (lastPage?.page ?? allPages.length) + 1;
    },
    enabled: showTipsListModal && Boolean(id),
  });
  const { handleSaveTip, isPending: isSavingTip } = useSaveRecipeTip();
  const tips = tipsPreview?.items ?? [];
  const tipsList = (tipsListData?.pages ?? []).flatMap(
    (page) => (page?.data ?? []) as RecipeTip[],
  );
  const handleModalChange = (open: boolean) => {
    if (!open) {
      setTipComment("");
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setTipImage(null);
      setImagePreview(null);
    }
    setShowAddTipModal(open);
  };

  const handleAddTip = async () => {
    const comment = tipComment.trim();
    if (!comment || !id) return;

    try {
      await handleSaveTip({
        recipeId: id as string,
        tip: comment,
        image: tipImage,
      });
      setTipComment("");
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setTipImage(null);
      setImagePreview(null);
      setShowAddTipModal(false);
    } catch (error) {
      console.error("Error guardando tip", error);
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setTipImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setTipImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTipsListModalChange = (open: boolean) => {
    setShowTipsListModal(open);
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h2 className="font-display text-xl font-semibold">
            Tips de la Comunidad
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTipsListModalChange(true)}
          >
            Ver lista de tips
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddTipModal(true)}
          >
            Añadir Tip
          </Button>
        </div>
      </div>
      {isPending && (
        <div className="flex items-center justify-center gap-2">
          <p>Cargando...</p>
        </div>
      )}
      {tips && tips.length > 0 ? (
        <div className="space-y-4">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="p-4 bg-secondary/30 rounded-lg border border-border/50"
            >
              <div className="flex items-start gap-3">
                {tip?.user?.fullName && (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {getInitials(tip?.user?.fullName)}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">
                    {tip.user?.fullName}
                  </p>
                  <p className="text-muted-foreground text-sm">{tip.tip}</p>
                  {tip?.image && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-border/60">
                      <Image
                        src={tip.image}
                        alt="Imagen del tip"
                        width={380}
                        height={220}
                        className="w-[200px] rounded-2xl max-w-sm h- max-h-[200px] object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2>No hay tips todavía. Sé el primero en compartir uno.</h2>
        </div>
      )}

      <Dialog open={showAddTipModal} onOpenChange={handleModalChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir tip</DialogTitle>
            <DialogDescription>
              Comparte un comentario útil sobre esta receta para la comunidad.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              value={tipComment}
              onChange={(e) => setTipComment(e.target.value)}
              placeholder="Ej: Yo la preparé a fuego medio y quedó mucho mejor."
              rows={4}
            />
            <div className="mt-3">
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors"
                >
                  <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Agrega una imagen a tu tip (opcional)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden border">
                  <Image
                    src={imagePreview}
                    alt="Preview tip"
                    width={380}
                    height={220}
                    className="w-full h-44 object-cover"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={handleRemoveImage}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleModalChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddTip}
              disabled={!tipComment.trim() || isSavingTip}
            >
              {isSavingTip ? "Guardando..." : "Guardar tip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTipsListModal} onOpenChange={handleTipsListModalChange}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Todos los tips</DialogTitle>
            <DialogDescription>
              Lista completa de tips de esta receta.
            </DialogDescription>
          </DialogHeader>

          {isTipsListPending ? (
            <p>Cargando tips...</p>
          ) : tipsList.length > 0 ? (
            <div className="space-y-3">
              {tipsList.map((tip) => (
                <div
                  key={tip.id}
                  className="p-4 bg-secondary/30 rounded-lg border border-border/50"
                >
                  <p className="font-medium text-sm mb-1">{tip.user?.fullName}</p>
                  <p className="text-muted-foreground text-sm">{tip.tip}</p>
                  {tip?.image && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-border/60">
                      <Image
                        src={tip.image}
                        alt="Imagen del tip"
                        width={380}
                        height={220}
                        className="w-[200px] rounded-2xl max-w-sm max-h-[200px] object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No hay tips para mostrar.</p>
          )}

          {hasNextPage && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Cargando..." : "Cargar más"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
