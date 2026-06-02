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
import { Modal } from './Modal';
import { ChatWidget } from './ChatWidget';

interface Notification {
  id: string;
  symbol: string;
  message: string;
  timestamp: Date;
}

export function MainLayout() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showMedbedModal, setShowMedbedModal] = useState(false);
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const handlePriceUpdate = (event: CustomEvent) => {
      const { symbol, price, changePercent } = event.detail;
      const prevPrice = previousPrices[symbol];
      if (prevPrice && Math.abs(changePercent) > 0.5) {
        const direction = changePercent > 0 ? 'increased' : 'decreased';
        const notification: Notification = {
          id: `${symbol}-${Date.now()}`,
          symbol,
          message: `${symbol} ${direction} by ${Math.abs(changePercent).toFixed(2)}% to $${price.toFixed(2)}`,
          timestamp: new Date(),
        };
        setNotifications(prev => [notification, ...prev].slice(0, 10));
      }
      setPreviousPrices(prev => ({ ...prev, [symbol]: price }));
    };
    window.addEventListener('crypto-price-update', handlePriceUpdate as EventListener);
    return () => window.removeEventListener('crypto-price-update', handlePriceUpdate as EventListener);
  }, [previousPrices]);

  const handleMenuItemClick = (item: string) => {
    if (item === 'card') setShowCardModal(true);
    else if (item === 'medbed') setShowMedbedModal(true);
    else if (item === 'giftcard') setShowGiftCardModal(true);
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
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar – handles its own mobile toggle internally */}
      <SideMenu
        activeItem={activeView}
        onItemClick={handleMenuItemClick}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          notificationCount={notifications.length}
          onNotificationClick={() => setShowNotifications(!showNotifications)}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        {showNotifications && (
          <NotificationPanel
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onClearAll={() => setNotifications([])}
          />
        )}
        {/* Main content area with scroll */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderView()}
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showCardModal} onClose={() => setShowCardModal(false)} title="Card Purchase">
        <CardTopupModal onClose={() => setShowCardModal(false)} />
      </Modal>
      <Modal isOpen={showMedbedModal} onClose={() => setShowMedbedModal(false)} title="Medbed Services">
        <MedbedModal onClose={() => setShowMedbedModal(false)} />
      </Modal>
      <Modal isOpen={showGiftCardModal} onClose={() => setShowGiftCardModal(false)} title="Redeem Gift Card">
        <GiftCardRedeemModal onClose={() => setShowGiftCardModal(false)} />
      </Modal>

      {/* Chat widget (always visible, bottom-left) */}
      <ChatWidget />
    </div>
  );
}
