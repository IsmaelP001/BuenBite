"use client";
import { useAppMutation } from "@/hooks/useAppMutation";
import {
  addSocialComment,
  deleteSocialComment,
  likeSocialComment,
  unlikeSocialComment,
  getSocialComments,
} from "@/actions/social";
import { CreateCommentDto } from "@/types/models/social";
import { useQuery } from "@tanstack/react-query";

export function useGetComments(postId: string, enabled = true) {
  return useQuery({
    queryKey: ["social", "comments", postId],
    queryFn: async () => getSocialComments(postId),
    enabled,
    select: (data) => data.data,
  });
}

export function useAddComment() {
  return useAppMutation(
    async ({ postId, data }: { postId: string; data: CreateCommentDto }) =>
      addSocialComment(postId, data),
    {
      invalidateQueries: ["social"],
      toastConfig: {
        success: "Comentario publicado",
        error: "Error al comentar",
      },
    }
  );
}

export function useDeleteComment() {
  return useAppMutation(
    async (commentId: string) => deleteSocialComment(commentId),
    {
      invalidateQueries: ["social"],
      toastConfig: {
        success: "Comentario eliminado",
        error: "Error al eliminar comentario",
      },
    }
  );
}

export function useToggleLikeComment() {
  return useAppMutation(
    async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) =>
      isLiked ? unlikeSocialComment(commentId) : likeSocialComment(commentId),
    {
      invalidateQueries: ["social"],
      toastVisibility: { showSuccess: false, showLoading: false },
    }
  );
}
