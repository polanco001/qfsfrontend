// src/components/SideMenu.tsx
import { useState, useEffect } from 'react';
import { 
  CreditCard, Repeat, Settings, History, ShieldCheck, HeadphonesIcon, 
  TrendingUp, Wallet, Newspaper, X, Menu, Tag, LayoutDashboard 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SideMenuProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function SideMenu({ activeItem, onItemClick, isOpen: externalIsOpen, onClose }: SideMenuProps) {
  const { user } = useApp();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, adminOnly: false },
    { id: 'card', label: 'Card', icon: CreditCard, adminOnly: false },
    { id: 'swap', label: 'Swap', icon: Repeat, adminOnly: false },
    { id: 'medbed', label: 'Medbed', icon: Wallet, adminOnly: false },
    { id: 'giftcard', label: 'Redeem Giftcard', icon: Tag, adminOnly: false },
    { id: 'transactions', label: 'Transaction History', icon: History, adminOnly: false },
    { id: 'kyc', label: 'KYC Verification', icon: ShieldCheck, adminOnly: false },
    { id: 'market', label: 'Market', icon: TrendingUp, adminOnly: false },
    { id: 'news', label: 'Crypto News', icon: Newspaper, adminOnly: false },
    { id: 'support', label: 'Support', icon: HeadphonesIcon, adminOnly: false },
    { id: 'settings', label: 'Settings', icon: Settings, adminOnly: false },
    { id: 'admin', label: 'Admin Panel', icon: LayoutDashboard, adminOnly: true },
  ];

  // ✅ Only show admin item to admin users
  const menuItems = allMenuItems.filter(item =>
    !item.adminOnly || user?.role === 'admin'
  );

  const closeMenu = () => {
    setInternalIsOpen(false);
    onClose?.();
  };

  const toggleMenu = () => {
    if (externalIsOpen !== undefined) {
      onClose?.();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleItemClick = (itemId: string) => {
    onItemClick(itemId);
    if (isMobile) closeMenu();
  };

  return (
    <>
      {/* Hamburger button (mobile only) */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900 dark:bg-slate-950 text-white hover:bg-slate-800 transition-colors md:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMenu} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full bg-slate-900 dark:bg-slate-950 
        border-r border-slate-800 dark:border-slate-700 
        transition-transform duration-300 ease-in-out
        ${isOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:w-64 w-64
      `}>
        <div className="flex flex-col h-full p-4">
          {isMobile && (
            <button onClick={closeMenu}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 md:hidden">
              <X size={20} />
            </button>
          )}
          <div className="mb-8 mt-12 md:mt-8">
            <h1 className="text-white text-xl sm:text-2xl font-bold whitespace-nowrap">QFS WORLD VAULT</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 whitespace-nowrap">Quantum Financial System</p>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isAdmin = item.id === 'admin';
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full ${
                    activeItem === item.id
                      ? 'bg-blue-600 text-white'
                      : isAdmin
                      ? 'text-purple-400 hover:bg-purple-900/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="whitespace-nowrap text-sm">{item.label}</span>
                  {isAdmin && (
                    <span className="ml-auto text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                      ADMIN
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}