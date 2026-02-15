import { SocialComment } from "@/types/models/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CommentItemProps {
  comment: SocialComment;
  isReply?: boolean;
  onReply?: (commentId: string) => void;
  onLike?: (commentId: string, isLiked: boolean) => void;
}

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

function formatTimeAgo(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHours = Math.round(diffMin / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
  const diffMonths = Math.round(diffDays / 30);
  return rtf.format(diffMonths, "month");
}

export default function CommentItem({ comment, isReply, onReply, onLike }: CommentItemProps) {
  const [liked, setLiked] = useState(comment.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(comment.likesCount);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    onLike?.(comment.id, liked);
  };

  return (
    <div className={cn("flex gap-2.5", isReply && "ml-10")}>
      <Avatar className={cn("shrink-0", isReply ? "w-7 h-7" : "w-8 h-8")}>
        <AvatarImage src={comment.author.avatarUrl ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
          {comment.author.fullName.split(" ").map((n) => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-secondary/60 rounded-xl px-3 py-2">
          <span className="text-xs font-semibold text-foreground">{comment.author.fullName}</span>
          <p className="text-sm text-foreground/90 leading-relaxed">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-[10px] text-muted-foreground">
            {formatTimeAgo(new Date(comment.createdAt))}
          </span>
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1 text-[10px] font-medium transition-colors",
              liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            )}
          >
            <Heart className={cn("w-3 h-3", liked && "fill-red-500")} aria-hidden="true" />
            {likesCount > 0 ? <span style={{ fontVariantNumeric: "tabular-nums" }}>{likesCount}</span> : null}
          </button>
          {!isReply && (
            <button
              onClick={() => onReply?.(comment.id)}
              className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Responder
            </button>
          )}
        </div>
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply onLike={onLike} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
