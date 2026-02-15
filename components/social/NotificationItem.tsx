import { SocialNotification } from "@/types/models/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  UserPlus,
  Trophy,
  ChefHat,
  FileText,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NotificationItemProps {
  notification: SocialNotification;
  onMarkRead?: (id: string) => void;
}

const notifConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  post_liked: { icon: <Heart className="w-3.5 h-3.5 fill-current" aria-hidden="true" />, color: "text-red-500 bg-red-50 dark:bg-red-950/40" },
  comment_added: { icon: <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" },
  comment_liked: { icon: <Heart className="w-3.5 h-3.5 fill-current" aria-hidden="true" />, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/40" },
  new_follower: { icon: <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />, color: "text-green-500 bg-green-50 dark:bg-green-950/40" },
  achievement_unlocked: { icon: <Trophy className="w-3.5 h-3.5" aria-hidden="true" />, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40" },
  followed_user_posted: { icon: <FileText className="w-3.5 h-3.5" aria-hidden="true" />, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40" },
  followed_user_cooked: { icon: <ChefHat className="w-3.5 h-3.5" aria-hidden="true" />, color: "text-orange-500 bg-orange-50 dark:bg-orange-950/40" },
  recipe_cooked_by_follower: { icon: <ChefHat className="w-3.5 h-3.5" aria-hidden="true" />, color: "text-teal-500 bg-teal-50 dark:bg-teal-950/40" },
};

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

function getNotificationLink(notification: SocialNotification): string {
  if (notification.referenceType === "post") return `/social?post=${notification.referenceId}`;
  if (notification.referenceType === "user") return `/social/profile/${notification.referenceId}`;
  return "/social";
}

export default function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const config = notifConfig[notification.type] || { icon: <Bell className="w-3.5 h-3.5" aria-hidden="true" />, color: "text-muted-foreground bg-muted" };
  const link = getNotificationLink(notification);

  return (
    <Link
      href={link}
      className={cn(
        "flex items-start gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors",
        !notification.isRead && "bg-primary/3"
      )}
      onClick={() => !notification.isRead && onMarkRead?.(notification.id)}
    >
      <div className="relative shrink-0">
        <Avatar className="w-10 h-10">
          <AvatarImage src={notification.actor.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {notification.actor.fullName.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className={cn("absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center", config.color)}>
          {config.icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <span className="font-semibold text-foreground">{notification.actor.fullName}</span>{" "}
          <span className="text-muted-foreground">{notification.message}</span>
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formatTimeAgo(new Date(notification.createdAt))}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </Link>
  );
}
