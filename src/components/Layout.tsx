import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { LayoutDashboard, ShoppingCart, Wallet, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  user: User;
  profile: UserProfile | null;
}

export const Layout: React.FC<LayoutProps> = ({ user, profile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Meus Pedidos', icon: ShoppingCart, path: '/orders' },
    { label: 'Carregar Conta', icon: Wallet, path: '/add-funds' },
    { label: 'Perfil', icon: UserIcon, path: '/profile' },
  ];

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-950 border-r border-slate-800 sticky top-0 h-screen">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-brand-primary/20">S</div>
            <h1 className="text-xl font-bold tracking-tight">
              Seguidores<span className="text-brand-primary">Express</span>
            </h1>
          </Link>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200",
                  isActive 
                    ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-brand-primary" : "")} />
                <span className="font-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center font-bold text-brand-primary">
                {profile?.name?.[0].toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{profile?.name || 'Usuário'}</p>
                <p className="text-[10px] text-slate-500 font-mono tracking-wider truncate uppercase">Saldo: {formatCurrency(profile?.balance || 0)}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3 text-slate-500 hover:text-red-400 transition-colors font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Header Mobile */}
      <header className="md:hidden bg-slate-950 border-b border-slate-800 p-5 sticky top-0 z-50 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center font-bold text-lg">S</div>
          <span className="font-bold text-lg">SeguidoresExpress</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="md:hidden fixed inset-0 z-40 bg-slate-950 pt-24 px-6 flex flex-col"
          >
            <nav className="space-y-3 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-lg font-bold",
                    location.pathname === item.path 
                      ? "bg-brand-primary/10 text-brand-primary border-brand-primary/30" 
                      : "text-slate-400 border-slate-800 bg-slate-900/50"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="pb-10 pt-6">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-6 py-4 text-red-400 font-bold bg-red-400/10 rounded-2xl border border-red-400/20"
              >
                <LogOut className="w-6 h-6" />
                Sair da Conta
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
