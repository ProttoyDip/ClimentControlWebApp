import { motion } from 'framer-motion';
import { Home, LayoutDashboard, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass-card fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-6xl w-full px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 bg-linear-to-r from-cyan-400 to-pink-500 rounded-xl flex items-center justify-center shadow-glow"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <span className="text-xl font-bold text-black">🌡️</span>
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-slate-900 to-emerald-600 bg-clip-text text-transparent">
              ClimateControl
            </h1>
            <p className="eyebrow">Smart Home Automation</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-2">
          <Link 
            to="/" 
            className={twMerge(clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 transition-colors',
              location.pathname === '/' && 'bg-slate-100'
            ))}
          >
            <Home size={20} />
            <span className="hidden md:inline">Home</span>
          </Link>
          <Link 
            to="/dashboard" 
            className={twMerge(clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 transition-colors',
              location.pathname === '/dashboard' && 'bg-slate-100'
            ))}
          >
            <LayoutDashboard size={20} />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          {user && (
            <motion.button
              onClick={handleLogout}
              className="neon-btn flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

