
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeaveRequest } from "@/models/types";

// Formulario simple para crear nueva solicitud
function LeaveRequestForm({ onSubmit, onClose }: { onSubmit: (data: any) => void, onClose: () => void }) {
  const [form, setForm] = useState({
    type: "vacaciones",
    start_date: "",
    end_date: "",
    reason: "",
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-3"
        onSubmit={e => {
          e.preventDefault();
          onSubmit(form);
        }}
      >
        <h3 className="font-bold text-lg mb-2">Nueva solicitud</h3>
        <div>
          <label className="block text-sm mb-1">Tipo</label>
          <select
            className="border rounded w-full px-2 py-1"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          >
            <option value="vacaciones">Vacaciones</option>
            <option value="enfermedad">Baja enfermedad</option>
            <option value="personal">Asunto personal</option>
            <option value="maternidad">Maternidad</option>
            <option value="paternidad">Paternidad</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Desde</label>
          <input
            className="border rounded w-full px-2 py-1"
            type="date"
            value={form.start_date}
            onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Hasta</label>
          <input
            className="border rounded w-full px-2 py-1"
            type="date"
            value={form.end_date}
            onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Motivo (opcional)</label>
          <textarea
            className="border rounded w-full px-2 py-1"
            rows={2}
            value={form.reason}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Solicitar</Button>
        </div>
      </form>
    </div>
  );
}

// Main
export function LeaveRequestsPage() {
  const { user } = useAuth();
  const { requests, createRequest, updateRequestStatus, loading } = useLeaveRequests();
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // para loading de aprobar/rechazar

  // Filtrar según rol
  let filtered = requests;
  if (user?.role === "empleado") {
    filtered = requests.filter(r => r.user_id === user.id);
  } else if (user?.role === "responsable") {
    filtered = requests.filter(r => r.user_id === user.id || (r.user_id !== user.id && r.user_name !== "RRHH" && r.user_id.startsWith("team-"))); // Simula miembros de equipo propio (mock data)
  }

  const handleCreate = async (data: any) => {
    await createRequest({
      ...data,
      user_id: user!.id,
      user_name: user!.name,
      days_count: 1,
    });
    setShowForm(false);
  };

  const handleUpdateStatus = async (id: string, status: "aprobada" | "rechazada") => {
    setActionLoading(id + status);
    await updateRequestStatus(id, status);
    setActionLoading(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mis Solicitudes</h2>
        {user?.role === "empleado" && (
          <Button onClick={() => setShowForm(true)} className="gap-1">
            <Plus className="w-4 h-4" /> Nueva solicitud
          </Button>
        )}
      </div>

      {showForm && <LeaveRequestForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead>Días</TableHead>
              <TableHead>Estado</TableHead>
              {user?.role !== "empleado" && <TableHead>Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.user_name}</TableCell>
                <TableCell className="capitalize">{req.type}</TableCell>
                <TableCell>
                  {formatDate(req.start_date, "dd/MM/yyyy")}<br/>-<br/>{formatDate(req.end_date, "dd/MM/yyyy")}
                </TableCell>
                <TableCell>{req.days_count}</TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded capitalize ${
                    req.status === "pendiente"
                      ? "bg-amber-100 text-amber-700"
                      : req.status === "aprobada"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {req.status}
                  </span>
                </TableCell>
                {user?.role === "responsable" || user?.role === "rrhh" ? (
                  <TableCell>
                    {req.status === "pendiente" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === req.id + "aprobada"}
                          onClick={() => handleUpdateStatus(req.id, "aprobada")}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1 text-green-700" />Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionLoading === req.id + "rechazada"}
                          onClick={() => handleUpdateStatus(req.id, "rechazada")}
                        >
                          <XCircle className="w-4 h-4 mr-1 text-red-700" />Rechazar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                ) : user?.role === "empleado" ? (
                  <TableCell>
                    {req.status === "pendiente" && (
                      <span className="text-gray-400 italic">-</span>
                    )}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && !loading && (
          <div className="p-6 text-gray-500 text-center">No hay solicitudes</div>
        )}
      </div>
    </div>
  );
}

export default LeaveRequestsPage;
