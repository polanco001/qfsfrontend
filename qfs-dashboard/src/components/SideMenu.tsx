import { useState } from 'react';
import {
  CreditCard, Repeat, Settings, History, ShieldCheck, HeadphonesIcon,
  TrendingUp, Wallet, Newspaper, Tag, LayoutDashboard, Menu, X, BarChart3, Lock, Key
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SideMenuProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function SideMenu({ activeItem, onItemClick }: SideMenuProps) {
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, adminOnly: false },
    { id: 'market', label: 'Market', icon: BarChart3, adminOnly: false },
    { id: 'swap', label: 'Swap', icon: Repeat, adminOnly: false },
    { id: 'staking', label: 'Staking', icon: Lock, adminOnly: false },
    { id: 'card', label: 'Card', icon: CreditCard, adminOnly: false },
    { id: 'medbed', label: 'Medbed', icon: Wallet, adminOnly: false },
    { id: 'giftcard', label: 'Redeem Giftcard', icon: Tag, adminOnly: false },
    { id: 'transactions', label: 'Transaction History', icon: History, adminOnly: false },
    { id: 'kyc', label: 'KYC Verification', icon: ShieldCheck, adminOnly: false },
    { id: 'news', label: 'Crypto News', icon: Newspaper, adminOnly: false },
    { id: 'walletbackup', label: 'Wallet Backup', icon: Key, adminOnly: false },
    { id: 'support', label: 'Support', icon: HeadphonesIcon, adminOnly: false },
    { id: 'settings', label: 'Settings', icon: Settings, adminOnly: false },
    { id: 'admin', label: 'Admin Panel', icon: LayoutDashboard, adminOnly: true },
  ];

  const menuItems = allMenuItems.filter(item =>
    !item.adminOnly || user?.role === 'admin'
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900 dark:bg-slate-950 text-white hover:bg-slate-800 transition-colors"
      >
        <Menu size={20} />
      </button>

      <div
        className={`fixed top-0 left-0 z-40 h-full bg-slate-900 dark:bg-slate-950 border-r border-slate-800 dark:border-slate-700 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="self-end p-1 rounded-lg hover:bg-slate-800 text-white"
          >
            <X size={20} />
          </button>

          <div className="mb-8 mt-12">
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
                  onClick={() => {
                    onItemClick(item.id);
                    setIsOpen(false);
                  }}
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

      <div className={`transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'}`} />
    </>
  );
}