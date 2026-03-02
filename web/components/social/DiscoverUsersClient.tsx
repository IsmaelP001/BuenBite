"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDebounce } from "use-debounce";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSearchUsers } from "@/hooks/social/useSocialExplore";
import { useFollowUser, useGetFollowing, useUnfollowUser } from "@/hooks/social/useSocialFollows";
import { ArrowLeft, Search, Users } from "lucide-react";
import { Badge } from "../ui/badge";

const USERS_PER_PAGE = 12;

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((value) => value[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface DiscoverUsersClientProps {
  currentUserId: string;
}

export default function DiscoverUsersClient({
  currentUserId,
}: DiscoverUsersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [followOverrides, setFollowOverrides] = useState<Record<string, boolean>>({});
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [debouncedQuery] = useDebounce(searchQuery.trim(), 400);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const {
    data: searchResponse,
    isLoading,
    isFetching,
    isError,
  } = useSearchUsers({
    query: debouncedQuery,
    page,
    limit: USERS_PER_PAGE,
  });

  const { data: followingUsers = [] } = useGetFollowing(currentUserId, {
    enabled: Boolean(currentUserId),
    page: "1",
    limit: "200",
  });

  const followingSet = useMemo(
    () => new Set(followingUsers.map((user) => user.userId)),
    [followingUsers],
  );

  const users = searchResponse?.data ?? [];
  const hasMore = Boolean(searchResponse?.hasMore);
  const currentPage = searchResponse?.page ?? page;
  const hasUsers = users.length > 0;

  const isFollowingUser = (userId: string) =>
    followOverrides[userId] ?? followingSet.has(userId);

  const handleToggleFollow = (userId: string, currentlyFollowing: boolean) => {
    setPendingUserId(userId);
    setFollowOverrides((prev) => ({ ...prev, [userId]: !currentlyFollowing }));

    const rollback = () => {
      setFollowOverrides((prev) => ({ ...prev, [userId]: currentlyFollowing }));
    };

    if (currentlyFollowing) {
      unfollowUser.mutate(userId, {
        onError: rollback,
        onSettled: () => setPendingUserId(null),
      });
      return;
    }

    followUser.mutate(userId, {
      onError: rollback,
      onSettled: () => setPendingUserId(null),
    });
  };

  return (
    <MaxWidthWrapper maxWidth="max-w-4xl" className="py-6">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/social">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Descubrir usuarios</h1>
            <p className="text-sm text-muted-foreground">
              Busca perfiles para seguir en la comunidad
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {hasUsers
              ? `${users.length} usuarios en esta pagina`
              : "Sin resultados"}
          </p>
          <p className="text-xs text-muted-foreground">Pagina {currentPage}</p>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <Card className="p-6 text-sm text-muted-foreground">
              Cargando usuarios...
            </Card>
          ) : isError ? (
            <Card className="p-6 text-sm text-destructive">
              Ocurrio un error al cargar usuarios.
            </Card>
          ) : hasUsers ? (
            users.map((user) => (
              <Card
                key={user.userId}
                className="p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <Link href={`/social/profile/${user.userId}`}>
                    <Avatar className="h-14 w-14 ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                      <AvatarImage
                        src={user.avatarUrl ?? ""}
                        alt={user.fullName}
                      />
                      <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link
                        href={`/social/profile/${user.userId}`}
                        className="font-semibold hover:text-primary transition-colors truncate"
                      >
                        {user.fullName}
                      </Link>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary" className="text-xs gap-1">
                        {user.globalLevelName}
                      </Badge>
                      <Badge variant="secondary" className="text-xs gap-1">
                        LV{user.level}
                      </Badge>
                      <Badge variant="secondary" className="text-xs gap-1">
                        {user.totalExp} XP
                      </Badge>
                    </div>
                  </div>

                  {user.userId !== currentUserId ? (
                    <Button
                      variant={isFollowingUser(user.userId) ? "secondary" : "default"}
                      size="sm"
                      className="rounded-full shrink-0"
                      onClick={() =>
                        handleToggleFollow(
                          user.userId,
                          isFollowingUser(user.userId),
                        )
                      }
                      disabled={pendingUserId === user.userId}
                    >
                      {isFollowingUser(user.userId) ? "Siguiendo" : "Seguir"}
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-10 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium">No se encontraron usuarios</p>
              <p className="text-xs text-muted-foreground">
                Prueba con otro termino de busqueda.
              </p>
            </Card>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1 || isFetching}
          >
            Anterior
          </Button>
          <Button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!hasMore || isFetching}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
