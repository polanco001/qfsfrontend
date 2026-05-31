
      import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Intro() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      const flash = document.getElementById('intro-flash');
      if (flash) flash.classList.remove('hidden');
    }, 600);
    const t2 = setTimeout(() => {
      const flash = document.getElementById('intro-flash');
      const rings = document.getElementById('intro-rings');
      const letters = document.getElementById('intro-letters');
      const tagline = document.getElementById('intro-tagline');
      if (flash) flash.classList.add('hidden');
      if (rings) rings.classList.remove('hidden');
      if (letters) letters.classList.remove('hidden');
      if (tagline) tagline.classList.remove('hidden');
    }, 1200);
    const t3 = setTimeout(() => setFadeOut(true), 3000);
    const t4 = setTimeout(() => navigate('/marketing'), 3600);

    const skip = () => navigate('/marketing');
    window.addEventListener('click', skip);
    window.addEventListener('keydown', skip);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      window.removeEventListener('click', skip);
      window.removeEventListener('keydown', skip);
    };
  }, [navigate]);

  return (
    <div className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-600 ${fadeOut ? 'opacity-0 pointer-events-none' : ''}`}>
      <div className="relative text-center w-full max-w-[90%] px-4 sm:px-0">
        <div id="intro-flash" className="absolute inset-0 bg-gradient-radial from-amber-500/20 to-transparent animate-flash hidden" />
        <div id="intro-rings" className="absolute inset-0 flex items-center justify-center hidden">
          <div className="absolute w-32 h-32 rounded-full border-2 border-amber-500 animate-ping-ring" />
          <div className="absolute w-32 h-32 rounded-full border-2 border-amber-500 animate-ping-ring delay-300" />
          <div className="absolute w-32 h-32 rounded-full border-2 border-amber-500 animate-ping-ring delay-600" />
        </div>
        <div id="intro-letters" className="flex gap-1 justify-center hidden">
          <span className="text-[clamp(60px,18vw,180px)] font-black text-blue-600 animate-letter">Q</span>
          <span className="text-[clamp(60px,18vw,180px)] font-black text-blue-600 animate-letter animation-delay-150">F</span>
          <span className="text-[clamp(60px,18vw,180px)] font-black text-blue-600 animate-letter animation-delay-300">S</span>
        </div>
        <p id="intro-tagline" className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] text-amber-400 uppercase mt-3 animate-tagline hidden">
          Quantum Financial System
        </p>
      </div>
    </div>
  );
}