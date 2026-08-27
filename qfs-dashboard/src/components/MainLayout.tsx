import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { SideMenu } from './SideMenu';
import { Dashboard } from './Dashboard';
import { MarketPage } from './MarketPage';
import { KYCPage } from './KYCPage';
import { CryptoNews } from './CryptoNews';
import { NotificationPanel } from './NotificationPanel';
import { CardTopupModal } from './CardTopupModal';
import { MedbedModal } from './MedbedModal';
import { GiftCardRedeemModal } from './GiftCardRedeemModal';
import { SwapPage } from './SwapPage';
import { TransactionHistoryPage } from './TransactionHistoryPage';
import { SettingsPage } from './SettingsPage';
import { StakingPage } from './StakingPage';
import { WalletBackupModal } from './WalletBackupModal';
import { Modal } from './Modal';
import { ChatWidget } from './ChatWidget';
import { useApp } from '../context/AppContext';

export function MainLayout() {
  const navigate = useNavigate();
  const { user, fetchUser, notifications, clearAllNotifications, fetchLivePrices } = useApp();
  const [activeView, setActiveView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showMedbedModal, setShowMedbedModal] = useState(false);
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [showWalletBackup, setShowWalletBackup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const handleFocus = () => {
      fetchUser();
      fetchLivePrices();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchUser, fetchLivePrices]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUser();
      fetchLivePrices();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchUser, fetchLivePrices]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMenuItemClick = (item: string) => {
    if (item === 'card') setShowCardModal(true);
    else if (item === 'medbed') setShowMedbedModal(true);
    else if (item === 'giftcard') setShowGiftCardModal(true);
    else if (item === 'walletbackup') setShowWalletBackup(true);
    else if (item === 'support') navigate('/support');
    else if (item === 'admin') navigate('/admin');
    else setActiveView(item);
    setIsMobileMenuOpen(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'market': return <MarketPage />;
      case 'kyc': return <KYCPage />;
      case 'news': return <CryptoNews />;
      case 'swap': return <SwapPage />;
      case 'transactions': return <TransactionHistoryPage />;
      case 'settings': return <SettingsPage />;
      case 'staking': return <StakingPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <SideMenu
        activeItem={activeView}
        onItemClick={handleMenuItemClick}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          notificationCount={unreadCount}
          onNotificationClick={() => setShowNotifications(!showNotifications)}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {showNotifications && (
          <NotificationPanel
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onClearAll={() => clearAllNotifications()}
          />
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderView()}
        </div>
      </div>

      <Modal isOpen={showCardModal} onClose={() => setShowCardModal(false)} title="Card Purchase">
        <CardTopupModal onClose={() => setShowCardModal(false)} />
      </Modal>
      <Modal isOpen={showMedbedModal} onClose={() => setShowMedbedModal(false)} title="Medbed Services">
        <MedbedModal onClose={() => setShowMedbedModal(false)} />
      </Modal>
      <Modal isOpen={showGiftCardModal} onClose={() => setShowGiftCardModal(false)} title="Redeem Gift Card">
        <GiftCardRedeemModal onClose={() => setShowGiftCardModal(false)} />
      </Modal>
      <Modal isOpen={showWalletBackup} onClose={() => setShowWalletBackup(false)} title="Wallet Backup">
        <WalletBackupModal onClose={() => setShowWalletBackup(false)} />
      </Modal>

      <ChatWidget />
    </div>
  );
}