
import React, { useState } from 'react';
import { useHolidays } from '@/hooks/useHolidays';
import { HolidayForm } from './HolidayForm';
import { HolidayTable } from './HolidayTable';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Download, Upload } from 'lucide-react';
import { Holiday } from '@/models/types';
import { useToast } from '@/hooks/use-toast';

export function HolidayManager() {
  const { holidays, loading, createHoliday, deleteHoliday } = useHolidays();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | undefined>();

  const handleCreateHoliday = async (holidayData: Omit<Holiday, 'id' | 'created_at' | 'created_by'>) => {
    try {
      await createHoliday(holidayData);
      toast({
        title: "Festivo creado",
        description: "El festivo se ha añadido correctamente al calendario.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el festivo. Inténtalo de nuevo.",
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

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingHoliday(undefined);
  };

  const handleImportHolidays = () => {
    // TODO: Implementar importación de festivos desde archivo CSV/JSON
    toast({
      title: "Próximamente",
      description: "La funcionalidad de importación estará disponible pronto.",
    });
  };

  const handleExportHolidays = () => {
    // TODO: Implementar exportación de festivos a CSV/JSON
    toast({
      title: "Próximamente", 
      description: "La funcionalidad de exportación estará disponible pronto.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Calendario Laboral
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los días festivos y no laborables del año
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleImportHolidays}
            className="hidden sm:flex"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportHolidays}
            className="hidden sm:flex"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Festivo
          </Button>
        </div>
      </div>

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
            onEdit={handleEditHoliday}
            onDelete={handleDeleteHoliday}
            loading={loading}
          />
        </div>
      </div>

      {/* Holiday Form Modal */}
      <HolidayForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleCreateHoliday}
        holiday={editingHoliday}
      />
    </div>
  );
}
