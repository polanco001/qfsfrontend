import { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Menu } from 'lucide-react';
import { ChatWidget } from './ChatWidget';

export default function MarketingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => prev === index ? null : index);
  };

  // Scroll animations
  useEffect(() => {
    const elements = document.querySelectorAll(
      '.feat-card, .serv-card, .step-c, .news-item, .testi-card, .mf-item'
    );
    elements.forEach(el => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transition = 'opacity 0.6s ease';
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = '1';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Nav shrink on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const scrollY = window.scrollY;
        navRef.current.style.padding = scrollY > 60 ? '0.7rem 2rem' : '1rem 2rem';
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openVideo = () => setIsVideoOpen(true);
  const closeVideo = () => setIsVideoOpen(false);

  return (
    <div className="bg-[#080a0e] text-white min-h-screen">
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --gold:#0e4fa5;
          --gold-light:#0c14f9;
          --gold-dim:#7a6540;
          --bg:#080a0e;
          --bg2:#0d1018;
          --bg3:#101420;
          --surface:#161c28;
          --surface2:#1e2535;
          --border:rgba(200,169,110,0.15);
          --border2:rgba(200,169,110,0.07);
          --text:#e8eaf0;
          --muted:#7a8099;
        }
        html{scroll-behavior:smooth}
        body{
          font-family:"DM Sans",sans-serif;
          background:var(--bg);
          color:var(--text);
          overflow-x:hidden;
          line-height:1.7;
        }
        h1,h2,h3,h4,h5{font-family:"Syne",sans-serif;line-height:1.15}
        a{text-decoration:none}

        /* NAV */
        nav{
          position:fixed;top:0;left:0;right:0;z-index:200;
          display:flex;align-items:center;justify-content:space-between;
          padding:1rem 2rem;
          background:rgba(8,10,14,0.88);
          backdrop-filter:blur(18px);
          border-bottom:1px solid var(--border2);
          transition:padding 0.3s;
        }
        .logo{
          font-family:"Syne",sans-serif;font-size:1.3rem;font-weight:800;
          color:var(--gold);letter-spacing:0.04em;
        }
        .logo span{color:var(--text)}
        .nav-links{display:flex;align-items:center;gap:2rem;list-style:none}
        .nav-links a{color:var(--muted);font-size:0.88rem;font-weight:500;transition:color 0.2s}
        .nav-links a:hover{color:var(--gold)}
        .nav-ctas{display:flex;gap:0.65rem}
        .btn-o{
          padding:0.48rem 1.2rem;border:1px solid var(--border);border-radius:6px;
          color:var(--gold);font-size:0.83rem;font-weight:500;transition:all 0.2s;
          font-family:"DM Sans",sans-serif;background:transparent;cursor:pointer;
        }
        .btn-o:hover{background:rgba(200,169,110,0.07)}
        .btn-s{
          padding:0.48rem 1.2rem;
          background:linear-gradient(135deg,var(--gold-dim),var(--gold));
          border-radius:6px;color:#060708;font-size:0.83rem;font-weight:700;
          font-family:"DM Sans",sans-serif;border:none;transition:opacity 0.2s;cursor:pointer;
        }
        .btn-s:hover{opacity:0.88}

        /* HERO */
        #hero{
          min-height:100vh;display:flex;flex-direction:column;align-items:center;
          justify-content:center;text-align:center;padding:9rem 2rem 5rem;position:relative;overflow:hidden;
        }
        .hero-grid{ /* ... */ }
        .hero-glow{ /* ... */ }
        .hero-badge{ /* ... */ }
        #hero h1{ /* ... */ }
        #hero p.hero-sub{ /* ... */ }
        .hero-btns{ /* ... */ }
        .btn-hero-p{ /* ... */ }
        .btn-hero-s{ /* ... */ }
        .stats-bar{ /* ... */ }
        .stat{ /* ... */ }

        /* SECTIONS – same as before, omitted for brevity but you must keep the entire CSS from the previous complete version */

        /* MOBILE */
        .hamburger{display:none;cursor:pointer;color:white;background:none;border:none}
        @media(max-width:640px){
          .nav-links,.nav-ctas{display:none}
          .hamburger{display:block}
          .mobile-menu{ /* ... */ }
        }
      `}</style>

      {/* NAV – unchanged from your last working version */}
      <nav ref={navRef}>
        <a href="#" className="logo">QFS<span> World Vaults</span></a>
        <ul className="nav-links desktop-only">
          <li><a href="#features">Features</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#banking">Why QFS</a></li>
          <li><a href="#how">Get Started</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        {/* NO login/register buttons in the nav anymore */}
        <button className="hamburger" onClick={() => setMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </nav>

      {/* MOBILE MENU – same as before */}

      {/* HERO */}
      <section id="hero">
        <div className="hero-grid"></div>
        <div className="hero-glow"></div>
        <div className="hero-badge"><span></span> Powered by Quantum Financial System</div>
        <h1>Gateway to Encrypt, Back Up &amp; Secure Your Assets</h1>
        <p className="hero-sub">The easiest, safest, and fastest way to secure &amp; back up your crypto assets — protected by quantum-grade encryption.</p>

        {/* ✅ LOGIN / REGISTER BUTTONS – centered, large, glowing */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '2rem',
          marginBottom: '2rem',
        }}>
          <a
            href="/login"
            style={{
              padding: '1rem 2.5rem',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'transparent',
              border: '2px solid #0e4fa5',
              color: '#0e4fa5',
              boxShadow: '0 0 20px rgba(14,79,165,0.3)',
              textDecoration: 'none',
            }}
          >
            Login
          </a>
          <a
            href="/signup"
            style={{
              padding: '1rem 2.5rem',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'linear-gradient(135deg, #0c14f9, #0e4fa5)',
              color: '#fff',
              boxShadow: '0 0 25px rgba(14,79,165,0.4)',
              textDecoration: 'none',
              border: 'none',
            }}
          >
            Register Free
          </a>
        </div>

        <div className="hero-btns" style={{ marginTop: '1rem' }}>
          <a href="/signup" className="btn-hero-p">Connect Wallet</a>
          <a href="/login" className="btn-hero-s">Explore Now →</a>
        </div>
        <div className="stats-bar">
          <div className="stat"><h3>63+</h3><p>Countries Covered</p></div>
          <div className="stat"><h3>30M+</h3><p>Global Investors</p></div>
          <div className="stat"><h3>700+</h3><p>Secured Wallets</p></div>
          <div className="stat"><h3>$1.36B</h3><p>Secured Volume</p></div>
        </div>
      </section>

      {/* ... rest of sections (Features, Services, etc.) unchanged ... */}

      <ChatWidget />
    </div>
  );
}