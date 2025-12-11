-- Reconstrucción de BBDD Supabase para ipk-vacaciones
-- Generado a partir de types.ts

-- 1. Tabla Profiles (Usuarios)
-- Se crea primero porque es referenciada por teams y otras tablas
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'empleado', -- empleado, responsable, rrhh
    vacation_days_balance INTEGER DEFAULT 22,
    sick_days_balance INTEGER DEFAULT 3,
    team_id UUID, -- Se añade la FK después de crear la tabla teams para evitar referencia circular
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla Teams (Equipos)
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Añadir FK circular: profiles -> teams
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_team 
FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

-- 3. Tabla Leave Requests (Solicitudes de Ausencia)
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL, -- Desnormalización útil para UI
    type TEXT NOT NULL, -- vacaciones, enfermedad, asuntos_propios, etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, aprobada, rechazada
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_comments TEXT,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabla Holidays (Festivos)
CREATE TABLE IF NOT EXISTS public.holidays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- nacional, local, empresa
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabla Notifications (Notificaciones)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- info, warning, success, error
    is_read BOOLEAN DEFAULT FALSE,
    related_type TEXT, -- leave_request, holiday, etc.
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS) - Opcional pero recomendado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de Ejemplo (Ajustar según necesidad real de permisos)
-- Profiles: Todos pueden ver perfiles, solo el usuario o RRHH puede editar
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Teams: Visible por todos
CREATE POLICY "Teams are viewable by everyone" ON public.teams FOR SELECT USING (true);

-- Leave Requests: 
-- - Empleados ven las suyas
-- - Managers ven las de su equipo (requiere lógica más compleja o función de BD)
-- - RRHH ve todas
CREATE POLICY "Users can view own requests" ON public.leave_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create requests" ON public.leave_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Holidays: Visible por todos, gestión solo RRHH/Admin
CREATE POLICY "Holidays are viewable by everyone" ON public.holidays FOR SELECT USING (true);
