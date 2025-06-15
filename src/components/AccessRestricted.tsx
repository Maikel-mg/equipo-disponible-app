
import React from 'react';
import { Users } from 'lucide-react';

interface AccessRestrictedProps {
  title?: string;
  message?: string;
}

export function AccessRestricted({ 
  title = "Acceso Restringido",
  message = "Solo el personal de Recursos Humanos puede gestionar usuarios."
}: AccessRestrictedProps) {
  return (
    <div className="p-8 text-center">
      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500">
        {message}
      </p>
    </div>
  );
}
