
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, User, Briefcase, Shield } from "lucide-react";
import { User as UserType } from "@/models/types";

type LoginScreenProps = {
  users: UserType[];
  onLogin: (user: UserType) => void;
};

const roleIcons: Record<UserType["role"], React.ReactNode> = {
  empleado: <User className="w-5 h-5 text-blue-600" />,
  responsable: <Briefcase className="w-5 h-5 text-green-600" />,
  rrhh: <Shield className="w-5 h-5 text-purple-600" />,
};

export function LoginScreen({ users, onLogin }: LoginScreenProps) {
  const [selected, setSelected] = useState<UserType | null>(users[0]);
  const [loading, setLoading] = useState(false);

  const handleSelect = (user: UserType) => {
    setSelected(user);
  };

  const handleLogin = () => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      onLogin(selected);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center mb-1">Demo Login</h2>
          <p className="text-gray-500 text-center mb-6">Selecciona un usuario para simular el inicio de sesión y probar la app en diferentes roles.</p>
        </div>
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              className={`flex items-center px-4 py-3 rounded-lg border transition
                ${selected?.id === user.id ? "border-primary bg-primary/10" : "border-gray-200 bg-white"}
                hover:border-primary`}
              onClick={() => handleSelect(user)}
              disabled={loading}
            >
              <span className="mr-3">{roleIcons[user.role]}</span>
              <span className="flex-1 text-left">
                <span className="font-semibold">{user.name}</span>
                <span className="block text-xs text-gray-500">{user.email}</span>
                <span className={`block text-xs capitalize font-medium ${
                  user.role === "empleado"
                    ? "text-blue-600"
                    : user.role === "responsable"
                    ? "text-green-600"
                    : "text-purple-600"
                }`}>{user.role}</span>
              </span>
              {selected?.id === user.id && (
                <span className="ml-2 text-sm rounded px-2 py-0.5 text-primary bg-primary/10 font-semibold">Seleccionado</span>
              )}
            </button>
          ))}
        </div>
        <Button
          size="lg"
          className="w-full mt-2"
          onClick={handleLogin}
          disabled={loading || !selected}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Iniciando sesión...
            </span>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </div>
    </div>
  );
}

export default LoginScreen;
