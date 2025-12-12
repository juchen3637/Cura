import { useProfile } from "./useProfile";

export type UserRole = "guest" | "user" | "admin";

export function useUserRole() {
  const { data: profile } = useProfile();

  const role: UserRole = profile?.role || "guest";
  const isGuest = role === "guest";
  const isUser = role === "user";
  const isAdmin = role === "admin";

  return {
    role,
    isGuest,
    isUser,
    isAdmin,
  };
}
