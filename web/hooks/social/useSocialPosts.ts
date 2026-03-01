"use client";
import { useAppMutation } from "@/hooks/useAppMutation";
import {
  createSocialPost,
  updateSocialPost,
  deleteSocialPost,
  likeSocialPost,
  unlikeSocialPost,
} from "@/actions/social";
import { UpdatePostDto } from "@/types/models/social";

export function useCreatePost() {
  return useAppMutation(
    async (data: FormData) => createSocialPost(data),
    {
      invalidateQueries: ["social"],
      toastConfig: {
        success: "¡Publicación creada!",
        error: "Error al crear la publicación",
      },
    }
  );
}

export function useUpdatePost() {
  return useAppMutation(
    async ({ postId, data }: { postId: string; data: UpdatePostDto }) =>
      updateSocialPost(postId, data),
    {
      invalidateQueries: ["social"],
      toastConfig: {
        success: "Publicación actualizada",
        error: "Error al actualizar",
      },
    }
  );
}

export function useDeletePost() {
  return useAppMutation(
    async (postId: string) => deleteSocialPost(postId),
    {
      invalidateQueries: ["social"],
      toastConfig: {
        success: "Publicación eliminada",
        error: "Error al eliminar",
      },
    }
  );
}

export function useToggleLikePost() {
  return useAppMutation(
    async ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      isLiked ? unlikeSocialPost(postId) : likeSocialPost(postId),
    {
      invalidateQueries: ["social"],
      toastVisibility: { showSuccess: false, showLoading: false },
    }
  );
}
