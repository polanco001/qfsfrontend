import { MessageCircle, Smartphone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SIGNAL_LINK = 'https://signal.me/#eu/ehC-awXtMJMFTlLxkiINBuUxy2P749qR4matJGPuhyZDibc18I5Mja_u2XZ9t6NB';

export function SupportPage() {
  const navigate = useNavigate();

  const handleOpenChatWidget = () => {
    // Go to dashboard where ChatWidget lives
    navigate('/');
    // Wait for render, then auto-open chat widget
    setTimeout(() => {
      const chatButton = document.querySelector('[aria-label="Open chat"]') as HTMLButtonElement;
      if (chatButton) {
        chatButton.click();
      }
    }, 400);
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

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/25 rounded-md px-2 py-1 mb-3">
            HELP & SUPPORT
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Contact Support</h1>
          <p className="text-sm text-white/40">Choose how you'd like to reach us</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Live Chat Option */}
          <button
            onClick={handleOpenChatWidget}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-white/10 hover:border-blue-500/50 transition-all bg-white/5 hover:bg-white/10"
          >
            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/25 rounded-full flex items-center justify-center">
              <MessageCircle size={28} className="text-blue-400" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-white">Live Chat</h3>
              <p className="text-xs text-white/40 mt-1">Chat with us in real-time</p>
            </div>
            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
              Recommended
            </span>
          </button>

          {/* Signal Option */}
          <a
            href={SIGNAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-white/10 hover:border-blue-500/50 transition-all bg-white/5 hover:bg-white/10"
          >
            <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/25 rounded-full flex items-center justify-center">
              <Smartphone size={28} className="text-purple-400" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-white">Signal</h3>
              <p className="text-xs text-white/40 mt-1">Chat on Signal for faster reply</p>
            </div>
            <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
              Faster Reply
            </span>
          </a>
        </div>

        {/* Footer info */}
        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-xs text-white/40 text-center">
            💬 All conversations are recorded for quality assurance.<br />
            Our support team typically responds within a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
