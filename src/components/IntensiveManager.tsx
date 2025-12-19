
import React, { useState } from 'react';
import { useCalendarConfig } from '@/hooks/useCalendarConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Calendar as CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';

export function IntensiveManager() {
  const currentYear = new Date().getFullYear();
  const { config, specialDays, loading, updateConfig, addSpecialDay, deleteSpecialDay } = useCalendarConfig(currentYear);
  const { toast } = useToast();

  const [summerStart, setSummerStart] = useState('');
  const [summerEnd, setSummerEnd] = useState('');
  
  const [newSpecialDate, setNewSpecialDate] = useState('');
  const [newSpecialDesc, setNewSpecialDesc] = useState('');

  // Sincronizar estado local cuando cargan los datos
  React.useEffect(() => {
    if (config) {
      setSummerStart(config.summer_start_date);
      setSummerEnd(config.summer_end_date);
    }
  }, [config]);

  const handleSaveConfig = async () => {
    try {
      await updateConfig({
        year: currentYear,
        summer_start_date: summerStart,
        summer_end_date: summerEnd,
      });
      toast({ title: "Configuración guardada", description: "El periodo de verano se ha actualizado." });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la configuración.", variant: "destructive" });
    }
  };

  const handleAddSpecialDay = async () => {
    if (!newSpecialDate) return;
    try {
      await addSpecialDay({
        date: newSpecialDate,
        type: 'intensiva',
        description: newSpecialDesc
      });
      setNewSpecialDate('');
      setNewSpecialDesc('');
      toast({ title: "Día añadido", description: "El día intensivo especial se ha registrado." });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo añadir el día (puede que ya exista).", variant: "destructive" });
    }
  };

  const handleDeleteSpecialDay = async (id: string) => {
    try {
      await deleteSpecialDay(id);
      toast({ title: "Día eliminado", description: "El día especial ha sido borrado." });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el día.", variant: "destructive" });
    }
  };

  if (loading) return <div>Cargando configuración...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuración de Verano */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-orange-500" />
              Jornada Intensiva de Verano
            </CardTitle>
            <CardDescription>
              Define el rango de fechas en el que se aplica la jornada intensiva de lunes a jueves.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inicio Verano</Label>
                <Input 
                  type="date" 
                  value={summerStart} 
                  onChange={(e) => setSummerStart(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Fin Verano</Label>
                <Input 
                  type="date" 
                  value={summerEnd} 
                  onChange={(e) => setSummerEnd(e.target.value)} 
                />
              </div>
            </div>
            <Button onClick={handleSaveConfig} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Guardar Periodo {currentYear}
            </Button>
          </CardContent>
        </Card>

        {/* Añadir Día Especial */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" />
              Añadir Día Intensivo Suelto
            </CardTitle>
            <CardDescription>
              Marca días específicos (ej. vísperas de festivos) como jornada intensiva.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input 
                type="date" 
                value={newSpecialDate} 
                onChange={(e) => setNewSpecialDate(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción (Opcional)</Label>
              <Input 
                placeholder="Ej: Víspera de Navidad" 
                value={newSpecialDesc} 
                onChange={(e) => setNewSpecialDesc(e.target.value)} 
              />
            </div>
            <Button onClick={handleAddSpecialDay} variant="outline" className="w-full">
              Añadir Día Especial
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Días Especiales */}
      <Card>
        <CardHeader>
          <CardTitle>Días Intensivos Ad-hoc Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialDays.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    No hay días intensivos manuales registrados.
                  </TableCell>
                </TableRow>
              ) : (
                specialDays.map((day) => (
                  <TableRow key={day.id}>
                    <TableCell>{format(new Date(day.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{day.description || '-'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteSpecialDay(day.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
