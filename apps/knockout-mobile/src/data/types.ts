/**
 * Domain types shared by the data layer and the screens.
 *
 * These mirror the database enums on purpose: `role` is the same union the Postgres
 * enum allows, so a new role has to be added in both places and the compiler says so.
 */
export const MEMBER_ROLES = ["rep", "manager", "admin"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export type MemberProfile = {
  id: string;
  orgId: string;
  teamId: string | null;
  role: MemberRole;
  displayName: string;
};

/** The person a rep is currently assigned to sell to. */
export type LeadStage = "new" | "contacted" | "appointment" | "won" | "lost";
