import { SocialComment } from "@/types/models/social";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
  comments: SocialComment[];
  onAddComment: (content: string, parentCommentId?: string) => void;
  onLikeComment?: (commentId: string, isLiked: boolean) => void;
  isLoading?: boolean;
}

export default function CommentSection({
  comments,
  onAddComment,
  onLikeComment,
  isLoading,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim(), replyingTo ?? undefined);
    setNewComment("");
    setReplyingTo(null);
  };

  return (
    <div className="space-y-4">
      {/* Comment List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={(id) => setReplyingTo(id)}
            onLike={onLikeComment}
          />
        ))}
        {comments.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">
            Sé el primero en comentar 💬
          </p>
        )}
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg">
          <span className="text-xs text-primary font-medium">Respondiendo a un comentario</span>
          <button onClick={() => setReplyingTo(null)} className="text-xs text-muted-foreground hover:text-destructive ml-auto">
            Cancelar
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={replyingTo ? "Escribe tu respuesta…" : "Escribe un comentario…"}
          className="flex-1 bg-secondary/60 rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        <Button
          size="icon"
          className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!newComment.trim() || isLoading}
          onClick={handleSubmit}
          aria-label="Enviar comentario"
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
