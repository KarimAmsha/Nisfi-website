"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  matchesUserFilter,
  type AccountStatus,
  type AdminUser,
  type Role,
  type UserFilter,
} from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { adminRepository } from "@/infrastructure/firebase/admin.repository";

const PREVIEW_USERS: AdminUser[] = [
  {
    uid: "uid_9f3a12",
    email: "aisha@example.com",
    displayName: "عائشة",
    role: "user",
    status: "active",
    createdAt: "2026-02-11T09:20:00.000Z",
    lastActiveAt: "2026-03-19T20:05:00.000Z",
  },
  {
    uid: "uid_2b7c88",
    email: "omar@example.com",
    displayName: "عمر",
    role: "user",
    status: "suspended",
    createdAt: "2026-01-30T14:00:00.000Z",
    lastActiveAt: "2026-03-10T11:40:00.000Z",
  },
  {
    uid: "uid_mod01",
    email: "layla.mod@example.com",
    displayName: "ليلى",
    role: "moderator",
    status: "active",
    createdAt: "2025-12-05T08:00:00.000Z",
    lastActiveAt: "2026-03-20T07:15:00.000Z",
  },
  {
    uid: "uid_ban77",
    email: "spam@example.com",
    displayName: null,
    role: "user",
    status: "banned",
    createdAt: "2026-03-01T22:30:00.000Z",
    lastActiveAt: "2026-03-02T00:10:00.000Z",
  },
];

export interface UseUsersAdminResult {
  users: AdminUser[];
  loading: boolean;
  error: boolean;
  preview: boolean;
  filter: UserFilter;
  setFilter: (next: UserFilter) => void;
  assignRole: (user: AdminUser, role: Role) => Promise<void>;
  setStatus: (user: AdminUser, status: AccountStatus) => Promise<void>;
  reload: () => void;
}

export function useUsersAdmin(): UseUsersAdminResult {
  const { configured, user } = useAuth();
  const [all, setAll] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<UserFilter>({});

  const load = useCallback(() => {
    if (!configured) {
      setAll(PREVIEW_USERS);
      setLoading(false);
      return;
    }
    if (!user) {
      setAll([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    adminRepository
      .listUsers()
      .then(setAll)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [configured, user]);

  useEffect(load, [load]);

  // Filtering is client-side so search/role/status feel instant.
  const users = useMemo(() => all.filter((u) => matchesUserFilter(u, filter)), [all, filter]);

  const assignRole = useCallback(
    async (target: AdminUser, role: Role) => {
      setAll((prev) => prev.map((u) => (u.uid === target.uid ? { ...u, role } : u)));
      if (configured) await adminRepository.assignRole(target.uid, role);
    },
    [configured],
  );

  const setStatus = useCallback(
    async (target: AdminUser, status: AccountStatus) => {
      setAll((prev) => prev.map((u) => (u.uid === target.uid ? { ...u, status } : u)));
      if (configured) await adminRepository.setAccountStatus(target.uid, status);
    },
    [configured],
  );

  return {
    users,
    loading,
    error,
    preview: !configured,
    filter,
    setFilter,
    assignRole,
    setStatus,
    reload: load,
  };
}
