
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Calendar, CheckCircle, Shield } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Gestión de
                </span>
                <br />
                <span className="text-gray-800">Vacaciones</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                La plataforma más elegante para gestionar solicitudes de vacaciones, 
                equipos y recursos humanos de tu empresa.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Comenzar Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-blue-500 px-8 py-4 text-lg font-semibold transition-all duration-300">
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simplificamos la gestión de recursos humanos con herramientas modernas y elegantes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Calendar,
                title: "Calendario Inteligente",
                description: "Visualiza y planifica las vacaciones de todo el equipo en tiempo real",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Users,
                title: "Gestión de Equipos",
                description: "Organiza y administra todos tus equipos desde una sola plataforma",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: CheckCircle,
                title: "Aprobaciones Rápidas",
                description: "Sistema de aprobaciones ágil y transparente para todos",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Shield,
                title: "Seguridad Total",
                description: "Protección de datos empresariales con los más altos estándares",
                gradient: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200/50">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: "500+", label: "Empresas confían en nosotros" },
              { number: "50K+", label: "Solicitudes procesadas" },
              { number: "99.9%", label: "Tiempo de actividad" }
            ].map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-xl opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg mb-4">¿Listo para transformar tu gestión de RRHH?</p>
          <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
            Empezar Gratis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
