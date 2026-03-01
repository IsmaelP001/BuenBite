"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getNextLevel, getXpProgress } from "@/lib/gamification-constants";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileStats {
  recipesCreated: number;
  followersCount: number;
  followingCount: number;
  level: string;
  xp: number;
  globalLevel: number;
  globalLevelName: string;
  currentStreak: number;
  pointsToday?: number;
  pointsThisWeek?: number;
}

interface MyProfile {
  user: { id: string; fullName: string; avatarUrl?: string | null };
  stats: ProfileStats;
}

interface ProfileCardProps {
  myProfile: MyProfile;
  formatCount?: (n: number) => string;
}

// ─── XP helpers ──────────────────────────────────────────────────────────────
function XpBar({ xp }: { xp: number }) {
  const { current, needed, percent } = getXpProgress(xp);
  const nextLevel = getNextLevel(xp);
  const pct = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div>
      <div className="pc-xp-header">
        <span className="pc-xp-label">Experiencia</span>
        <span>
          {nextLevel ? (
            <>
              <span className="pc-xp-current">{current.toLocaleString()}</span>
              <span className="pc-xp-total"> / {needed.toLocaleString()} XP</span>
            </>
          ) : (
            <span className="pc-xp-current">Nivel máximo</span>
          )}
        </span>
      </div>
      <div className="pc-xp-track">
        <div className="pc-xp-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string | number; label: string;  }) {
  return (
    <div className="pc-stat">
      <span className="pc-stat-value">{value}</span>
      <span className="pc-stat-label">{label}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ProfileCard({ myProfile, formatCount = (n) => n.toLocaleString() }: ProfileCardProps) {
  const { user, stats } = myProfile;
  const initials = user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <>
      <style>{`
        /* ── Card ── */
        .pc-root {
          position: relative;
          border-radius: 16px;
          background:
            linear-gradient(hsl(0 0% 100%), hsl(0 0% 100%)) padding-box,
            linear-gradient(135deg, hsl(38 92% 50% / 0.6), hsl(38 92% 70% / 0.15) 55%, hsl(35 20% 88%))
            border-box;
          border: 1.5px solid transparent;
          box-shadow:
            0 2px 10px hsl(38 92% 50% / 0.08),
            0 1px 3px hsl(25 10% 15% / 0.06);
          overflow: hidden;
          font-family: var(--font-geist-sans, system-ui, sans-serif);
        }

        /* amber top stripe */
        .pc-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, hsl(38 92% 50%), hsl(38 92% 62%), transparent);
          border-radius: 16px 16px 0 0;
        }

        /* dot-grid texture */
        .pc-root::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(hsl(38 92% 50% / 0.055) 1px, transparent 1px);
          background-size: 16px 16px;
          pointer-events: none;
        }

        .pc-inner {
          padding: 16px;
          position: relative;
          z-index: 1;
        }

        /* ── Profile Link ── */
        .pc-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          margin-bottom: 14px;
        }

        .pc-avatar-ring {
          border-radius: 50%;
          padding: 2px;
          background: linear-gradient(135deg, hsl(38 92% 50%), hsl(38 92% 68%));
          flex-shrink: 0;
          box-shadow: 0 0 0 3px hsl(38 92% 50% / 0.14);
        }

        .pc-avatar-wrap {
          display: block;
          border-radius: 50%;
          overflow: hidden;
          width: 50px;
          height: 50px;
        }

        .pc-name {
          font-size: 1rem;
          font-weight: 700;
          color: hsl(25 10% 15%);
          letter-spacing: -0.01em;
          line-height: 1.2;
          transition: color 0.15s;
        }
        .pc-link:hover .pc-name { color: hsl(38 80% 36%); }

        .pc-badges {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 5px;
          flex-wrap: wrap;
        }

        .pc-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 7px;
          border-radius: 99px;
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          border: 1px solid;
          line-height: 1.5;
        }

        .pc-badge-amber {
          background: hsl(38 92% 50% / 0.1);
          color: hsl(38 76% 34%);
          border-color: hsl(38 92% 50% / 0.28);
        }

        .pc-badge-muted {
          background: hsl(25 10% 15% / 0.05);
          color: hsl(25 10% 40%);
          border-color: hsl(25 10% 15% / 0.1);
        }

        .pc-badge-green {
          background: hsl(142 60% 42% / 0.1);
          color: hsl(142 60% 28%);
          border-color: hsl(142 60% 42% / 0.22);
        }

        /* ── XP Bar ── */
        .pc-xp-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 5px;
        }
        .pc-xp-label {
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: hsl(25 10% 50%);
          font-weight: 600;
        }
        .pc-xp-current {
          font-size: 0.78rem;
          font-weight: 800;
          color: hsl(38 76% 34%);
          font-variant-numeric: tabular-nums;
        }
        .pc-xp-total {
          font-size: 0.7rem;
          color: hsl(25 10% 55%);
          font-variant-numeric: tabular-nums;
        }
        .pc-xp-track {
          height: 6px;
          border-radius: 99px;
          background: hsl(38 92% 50% / 0.12);
          overflow: hidden;
        }
        .pc-xp-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, hsl(38 92% 44%), hsl(38 92% 56%));
          box-shadow: 0 0 6px hsl(38 92% 50% / 0.35);
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* ── Stats ── */
        .pc-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin-top: 12px;
        }

        .pc-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 8px 4px 7px;
          border-radius: 10px;
          background: hsl(40 33% 98%);
          border: 1px solid hsl(35 20% 90%);
          transition: border-color 0.15s, background 0.15s;
          cursor: default;
        }
        .pc-stat:hover {
          border-color: hsl(38 92% 50% / 0.3);
          background: hsl(38 92% 50% / 0.04);
        }

        .pc-stat-icon { font-size: 0.9rem; line-height: 1; }

        .pc-stat-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: hsl(25 10% 15%);
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
          line-height: 1.15;
        }

        .pc-stat-label {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: hsl(25 10% 50%);
          font-weight: 600;
        }
      `}</style>

      <div className="pc-root">
        <div className="pc-inner">

          {/* ── Avatar + Info ── */}
          <Link href={`/social/profile/${user.id}`} className="pc-link">
            <div className="pc-avatar-ring">
              <span className="pc-avatar-wrap">
                <Avatar className="h-full w-full rounded-full">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
                  <AvatarFallback
                    style={{
                      background: "hsl(38 92% 50% / 0.12)",
                      color: "hsl(38 76% 34%)",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                    }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </span>
            </div>

            <div>
              <p className="pc-name">{user.fullName}</p>
              <div className="pc-badges">
                <span className="pc-badge pc-badge-amber">⚔️ {stats.globalLevelName}</span>
                <span className="pc-badge pc-badge-muted">Nv. {stats.globalLevel}</span>
                {stats.currentStreak > 0 && (
                  <span className="pc-badge pc-badge-green">🔥 {stats.currentStreak}d</span>
                )}
              </div>
            </div>
          </Link>

          <XpBar xp={stats.xp} />
          <div className="pc-badges" style={{ marginTop: 8, marginBottom: 4 }}>
            <span className="pc-badge pc-badge-muted">
              +{stats.pointsToday ?? 0} pts hoy
            </span>
            <span className="pc-badge pc-badge-muted">
              +{stats.pointsThisWeek ?? 0} pts semana
            </span>
          </div>

          <div className="pc-stats">
            <StatPill value={stats.recipesCreated} label="Recetas"  />
            <StatPill value={formatCount(stats.followersCount)} label="Seguidores"  />
            <StatPill value={stats.followingCount} label="Siguiendo"  />
          </div>

        </div>
      </div>
    </>
  );
}
