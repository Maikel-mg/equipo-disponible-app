import React, { useState } from 'react';
import { useHolidays } from '@/hooks/useHolidays';
import { useAuth } from '@/contexts/AuthContext';
import { HolidayForm } from './HolidayForm';
import { HolidayTable } from './HolidayTable';
import { HolidayImport } from './HolidayImport';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Download, Upload, Trash2 } from 'lucide-react';
import { Holiday } from '@/models/types';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportToJSON } from '@/utils/exportHolidays';

export function HolidayManager() {
  const { holidays, loading, createHoliday, updateHoliday, deleteHoliday } = useHolidays();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | undefined>();
  const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);

  // Verificar si el usuario puede gestionar festivos (solo responsable y rrhh)
  const canManageHolidays = user?.role === 'responsable' || user?.role === 'rrhh';

  // NUEVO: Lógica para crear o editar
  const handleSubmitHoliday = async (holidayData: Omit<Holiday, 'id' | 'created_at' | 'created_by'>) => {
    try {
      if (editingHoliday) {
        await updateHoliday(editingHoliday.id, holidayData);
        toast({
          title: "Festivo actualizado",
          description: "El festivo se ha actualizado correctamente.",
        });
      } else {
        await createHoliday(holidayData);
        toast({
          title: "Festivo creado",
          description: "El festivo se ha añadido correctamente al calendario.",
        });
      }
      setIsFormOpen(false);
      setEditingHoliday(undefined);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo guardar el festivo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleImportHolidays = async (importedHolidays: Omit<Holiday, 'id' | 'created_at' | 'created_by'>[]) => {
    try {
      let imported = 0;
      for (const holidayData of importedHolidays) {
        try {
          await createHoliday(holidayData);
          imported++;
        } catch (e) {
          // Duplica: ignorado
        }
      }
      toast({
        title: "Festivos importados",
        description: `Se importaron ${imported} festivos. Duplicados ignorados.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron importar todos los festivos. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleEditHoliday = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setIsFormOpen(true);
  };

  const handleDeleteHoliday = async (holidayId: string) => {
    try {
      await deleteHoliday(holidayId);
      toast({
        title: "Festivo eliminado",
        description: "El festivo se ha eliminado del calendario.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el festivo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSelectedHolidays = async (ids?: string[]) => {
    // El parámetro opcional permite ser llamado con los ids de la tabla directamente
    const idsToDelete = Array.isArray(ids) ? ids : selectedHolidays;
    if (idsToDelete.length === 0) return;
    if (!window.confirm(`¿Seguro que deseas eliminar los ${idsToDelete.length} festivos seleccionados?`)) return;

    let deleted = 0;
    for (const id of idsToDelete) {
      try {
        await deleteHoliday(id);
        deleted++;
      } catch (e) {
        // Error ya informado por deleteHoliday
      }
    }
    setSelectedHolidays([]);
    toast({
      title: "Festivos eliminados",
      description: `Se han eliminado ${deleted} festivos seleccionados.`,
    });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingHoliday(undefined);
  };

  const handleExportHolidays = () => {
    if (holidays.length === 0) {
      toast({
        title: "Sin festivos",
        description: "No hay festivos para exportar.",
        variant: "destructive",
      });
      return;
    }
    // Simple dialog para elegir formato
    if (window.confirm("¿Exportar festivos como CSV? (Cancelar para JSON)")) {
      exportToCSV(holidays);
    } else {
      exportToJSON(holidays);
    }
    toast({
      title: "Exportación lista",
      description: "Festivos exportados correctamente.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Calendario Laboral
          </h1>
          <p className="text-gray-600 mt-1">
            {canManageHolidays ? 'Gestiona los días festivos y no laborables del año' : 'Consulta los días festivos y no laborables del año'}
          </p>
        </div>
        
        {canManageHolidays && (
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsImportOpen(true)}
                className="flex-1 sm:flex-none"
              >
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Importar Festivos</span>
                <span className="sm:hidden">Importar</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportHolidays}
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Exportar</span>
                <span className="sm:hidden">Exportar</span>
              </Button>
            </div>
            
            <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Festivo
            </Button>
          </div>
        )}
        
        {!canManageHolidays && (
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={handleExportHolidays}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        )}
      </div>

      {/* Botón de eliminar seleccionados - solo para gestores */}
      {canManageHolidays && selectedHolidays.length > 0 && (
        <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-md px-4 py-2">
          <span className="text-sm font-medium text-red-800">{selectedHolidays.length} festivos seleccionados</span>
          <Button
            variant="destructive"
            onClick={() => handleDeleteSelectedHolidays()}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Eliminar seleccionados
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedHolidays([])}
          >
            Cancelar selección
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Festivos</p>
              <p className="text-2xl font-bold text-gray-900">{holidays.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Nacionales</p>
              <p className="text-2xl font-bold text-gray-900">
                {holidays.filter(h => h.type === 'nacional').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Autonómicos</p>
              <p className="text-2xl font-bold text-gray-900">
                {holidays.filter(h => h.type === 'autonomico').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Empresa</p>
              <p className="text-2xl font-bold text-gray-900">
                {holidays.filter(h => h.type === 'empresa').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Holiday Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <HolidayTable
            holidays={holidays}
            onEdit={canManageHolidays ? handleEditHoliday : undefined}
            onDelete={canManageHolidays ? handleDeleteHoliday : undefined}
            loading={loading}
            onSelectionChange={canManageHolidays ? setSelectedHolidays : undefined}
            selectedIds={canManageHolidays ? selectedHolidays : []}
            onDeleteSelected={canManageHolidays ? handleDeleteSelectedHolidays : undefined}
          />
        </div>
      </div>

      {/* Holiday Form Modal - solo para gestores */}
      {canManageHolidays && (
        <HolidayForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleSubmitHoliday}
          holiday={editingHoliday}
        />
      )}

      {/* Holiday Import Modal - solo para gestores */}
      {canManageHolidays && (
        <HolidayImport
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImport={handleImportHolidays}
          existingHolidays={holidays}
        />
      )}
    </div>
  );
}
