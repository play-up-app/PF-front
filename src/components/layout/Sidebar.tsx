
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Trophy, Users, Bot, Settings, Plus, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Tournois', href: '/tournaments', icon: Trophy },
  { name: 'Équipes', href: '/teams', icon: Users },
  { name: 'Planning IA', href: '/planning', icon: Bot },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Tournoi Manager
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="md:hidden"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-100">
        <Link to="/tournaments/new">
          <Button 
            className="w-full justify-start space-x-2"
            onClick={() => setIsOpen(false)}
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau tournoi</span>
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Fermer le menu"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
