import { MessageCircle, Smartphone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SIGNAL_LINK = 'https://signal.me/#eu/ehC-awXtMJMFTlLxkiINBuUxy2P749qR4matJGPuhyZDibc18I5Mja_u2XZ9t6NB'; // ← PUT YOUR REAL SIGNAL LINK HERE

export function SupportPage() {
  const navigate = useNavigate();

  const handleOpenChatWidget = () => {
    // Find the floating chat button and click it
    const chatButton = document.querySelector('[aria-label="Open chat"]') as HTMLButtonElement;
    if (chatButton) {
      chatButton.click();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          Contact Support
        </h1>
        <p className="text-sm text-white/40 text-center mb-8">
          Choose how you'd like to reach us
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Live Chat Option */}
          <button
            onClick={handleOpenChatWidget}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-white/10 hover:border-blue-500/50 transition-colors bg-white/5"
          >
            <MessageCircle size={40} className="text-blue-400" />
            <div>
              <h3 className="font-semibold text-white">Live Chat</h3>
              <p className="text-xs text-white/40 mt-1">Chat with us in real-time</p>
            </div>
          </button>

          {/* Signal Option */}
          <a
            href={SIGNAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-white/10 hover:border-blue-500/50 transition-colors bg-white/5"
          >
            <Smartphone size={40} className="text-blue-400" />
            <div>
              <h3 className="font-semibold text-white">Signal</h3>
              <p className="text-xs text-white/40 mt-1">Chat with us on Signal for faster reply</p>
            </div>
          </a>
        </div>

        <p className="text-xs text-white/25 text-center mt-6">
          Our support team typically responds within a few minutes.
        </p>
      </div>
    </div>
  );
}
