
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { USER_ROLES } from "@/config/constants";

export function RoleSwitcher() {
  const { user, setRole } = useAuth();

  if (!user) return null;

  return (
    <div
      className="fixed right-2 top-2 bg-white border shadow-lg rounded-lg px-3 py-1 z-50 flex items-center space-x-2"
      style={{ opacity: 0.85 }}
      title="Switch Rolle (sólo en modo demo)"
    >
      <span className="text-xs text-gray-500">Rol:</span>
      <select
        className="border px-1 rounded text-xs"
        value={user.role}
        onChange={(e) => setRole(e.target.value as any)}
      >
        {USER_ROLES.map((role) => (
          <option key={role.value} value={role.value}>{role.label}</option>
        ))}
      </select>
    </div>
  );
}
