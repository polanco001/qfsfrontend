import { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Menu } from 'lucide-react';
import { ChatWidget } from './ChatWidget';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function MarketingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

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
        .hero-grid{
          position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(200,169,110,0.035) 1px,transparent 1px),
            linear-gradient(90deg,rgba(200,169,110,0.035) 1px,transparent 1px);
          background-size:64px 64px;
          mask-image:radial-gradient(ellipse 80% 60% at 50% 40%,black 0%,transparent 100%);
        }
        .hero-glow{
          position:absolute;width:800px;height:800px;border-radius:50%;
          background:radial-gradient(circle,rgba(200,169,110,0.06) 0%,transparent 70%);
          top:50%;left:50%;transform:translate(-50%,-55%);pointer-events:none;
        }
        .hero-badge{
          display:inline-flex;align-items:center;gap:0.5rem;padding:0.38rem 1rem;
          border:1px solid var(--border);border-radius:100px;font-size:0.78rem;
          color:var(--gold);background:rgba(200,169,110,0.05);margin-bottom:1.75rem;
          letter-spacing:0.06em;text-transform:uppercase;
        }
        .hero-badge span{
          width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block;
          animation:pulse 2s infinite;
        }
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        #hero h1{
          font-size:clamp(2.6rem,5.5vw,5rem);font-weight:800;letter-spacing:-0.02em;
          max-width:860px;line-height:1.06;margin-bottom:1.5rem;
          background:linear-gradient(155deg,#fff 0%,var(--gold-light) 45%,#fff 100%);
          -webkit-background-clip:text;background-clip:text;color:transparent;
        }
        #hero p.hero-sub{
          font-size:1.1rem;color:var(--muted);max-width:580px;font-weight:300;
          margin-bottom:2.5rem;line-height:1.8;
        }
        .hero-btns{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin-bottom:4rem}
        .hero-btns a{padding:0.82rem 2rem;border-radius:8px;font-size:0.95rem;font-weight:600;font-family:"DM Sans",sans-serif}
        .btn-hero-p{
          background:linear-gradient(135deg,#8a6530,var(--gold));
          color:#060708;box-shadow:0 0 40px rgba(200,169,110,0.2);transition:box-shadow 0.2s,transform 0.2s;
        }
        .btn-hero-p:hover{box-shadow:0 0 65px rgba(200,169,110,0.35);transform:translateY(-2px)}
        .btn-hero-s{
          border:1px solid var(--border);color:var(--text);background:rgba(255,255,255,0.03);transition:all 0.2s;
        }
        .btn-hero-s:hover{border-color:var(--gold);background:rgba(200,169,110,0.05)}

        /* NEW: large glowing Login/Register buttons */
        .hero-auth-btns {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 1rem;
        }
        .hero-auth-btns {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
}
.hero-auth-btns a {
  padding: 1rem 2.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  font-family: "DM Sans", sans-serif;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.btn-hero-login {
  background: transparent;
  border: 2px solid var(--gold);
  color: var(--gold);
  box-shadow: 0 0 20px rgba(200,169,110,0.3);
}
.btn-hero-login:hover {
  background: rgba(200,169,110,0.1);
  box-shadow: 0 0 40px rgba(200,169,110,0.6);
  transform: translateY(-3px);
}
.btn-hero-register {
  background: linear-gradient(135deg, var(--gold-light), var(--gold));
  color: #fff;
  box-shadow: 0 0 25px rgba(200,169,110,0.4);
  border: none;
}
.btn-hero-register:hover {
  box-shadow: 0 0 50px rgba(200,169,110,0.8);
  transform: translateY(-3px);
}

        /* STATS */
        .stats-bar{
          display:flex;justify-content:center;border:1px solid var(--border2);
          background:var(--surface);border-radius:14px;max-width:800px;margin:0 auto;overflow:hidden;
        }
        .stat{flex:1;padding:1.4rem 1.5rem;text-align:center;border-right:1px solid var(--border2)}
        .stat:last-child{border-right:none}
        .stat h3{font-size:1.7rem;color:var(--gold);font-weight:800;margin-bottom:0.2rem}
        .stat p{font-size:0.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em}

        /* SECTIONS */
        section{padding:6rem 2rem}
        .sec-inner{max-width:1200px;margin:0 auto}
        .sec-tag{
          font-size:0.73rem;letter-spacing:0.12em;text-transform:uppercase;
          color:var(--gold);font-weight:600;margin-bottom:0.85rem;
        }
        .sec-title{font-size:clamp(1.8rem,3vw,2.8rem);font-weight:700;margin-bottom:1rem;max-width:700px}
        .sec-sub{color:var(--muted);max-width:580px;font-size:0.95rem;line-height:1.8}
        .alt-bg{background:var(--bg2)}

        /* FEATURES */
        .feat6{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;margin-top:3.5rem}
        .feat-card{
          padding:1.75rem;border:1px solid var(--border2);border-radius:14px;background:var(--surface);
          transition:all 0.25s;position:relative;overflow:hidden;
        }
        .feat-card:hover{border-color:var(--border);transform:translateY(-3px)}
        .feat-card::before{
          content:"";position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,transparent,var(--gold-dim),transparent);opacity:0;transition:0.3s;
        }
        .feat-card:hover::before{opacity:1}
        .feat-icon{
          width:46px;height:46px;border-radius:10px;background:rgba(200,169,110,0.08);
          display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:1.1rem;
        }
        .feat-card h4{font-size:1rem;font-weight:700;margin-bottom:0.5rem}
        .feat-card p{font-size:0.85rem;color:var(--muted);line-height:1.75}
        .feat-link{display:inline-flex;align-items:center;gap:0.35rem;color:var(--gold);font-size:0.82rem;font-weight:600;margin-top:0.9rem;transition:gap 0.2s}
        .feat-link:hover{gap:0.6rem}

        /* SERVICES */
        .serv8{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-top:3.5rem}
        .serv-card{
          padding:1.5rem;border:1px solid var(--border2);border-radius:12px;background:var(--surface);
          transition:all 0.2s;text-align:center;
        }
        .serv-card:hover{border-color:var(--border);background:var(--surface2)}
        .serv-icon{font-size:1.8rem;margin-bottom:0.85rem;display:block}
        .serv-card h4{font-size:0.92rem;font-weight:700;margin-bottom:0.45rem}
        .serv-card p{font-size:0.8rem;color:var(--muted);line-height:1.65;margin-bottom:0.85rem}
        .serv-link{display:inline-block;font-size:0.78rem;font-weight:600;color:var(--gold);padding:0.3rem 0.75rem;border:1px solid var(--border);border-radius:6px;transition:all 0.2s}
        .serv-link:hover{background:rgba(200,169,110,0.08)}

        /* STEPS */
        .steps4{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;margin-top:3.5rem;position:relative}
        .steps4::before{
          content:"";position:absolute;top:28px;left:10%;right:10%;height:1px;
          background:linear-gradient(90deg,transparent,var(--border),transparent);
        }
        .step-c{text-align:center;position:relative}
        .step-num{
          width:52px;height:52px;border-radius:50%;
          background:linear-gradient(135deg,var(--gold-dim),var(--gold));
          display:flex;align-items:center;justify-content:center;font-family:"Syne",sans-serif;
          font-size:1.1rem;font-weight:800;color:#060708;margin:0 auto 1.25rem;
          border:3px solid var(--bg2);position:relative;z-index:1;
        }
        .step-c h4{font-size:0.95rem;font-weight:700;margin-bottom:0.5rem}
        .step-c p{font-size:0.82rem;color:var(--muted);line-height:1.7}
        .step-c a{display:inline-block;margin-top:0.85rem;font-size:0.8rem;color:var(--gold);font-weight:600;border:1px solid var(--border);padding:0.3rem 0.75rem;border-radius:6px;transition:all 0.2s}
        .step-c a:hover{background:rgba(200,169,110,0.08)}

        /* BANKING */
       /* --- BANKING & MEDBED RESPONSIVE FIX --- */

/* Mobile-First Layout for Grid Sections */
.bank-grid, 
.medbed-grid {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Default for Desktop */
    gap: 4rem;
    align-items: start;
    margin-top: 3.5rem;
}

/* Force Vertical Stack on Mobile */
@media (max-width: 768px) {
    .bank-grid, 
    .medbed-grid {
        display: flex !important;
        flex-direction: column !important;
        gap: 2rem !important;
        margin-top: 2rem !important;
    }

    /* Stack stats 1 per row on mobile to prevent squishing */
    .bank-stats {
        grid-template-columns: 1fr !important; 
    }

    /* Ensure visual boxes don't get cut off */
    .bank-visual, 
    .medbed-visual {
        min-height: 250px !important;
    }
}
        /* TESTIMONIALS */
        .testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;margin-top:3.5rem}
        .testi-card{padding:1.75rem;border:1px solid var(--border2);border-radius:14px;background:var(--surface)}
        .t-stars{color:var(--gold);font-size:0.83rem;margin-bottom:0.9rem;letter-spacing:0.1em}
        .t-quote{font-size:0.88rem;color:var(--muted);line-height:1.8;font-style:italic;margin-bottom:1.25rem}
        .t-author{display:flex;align-items:center;gap:0.75rem}
        .t-av{
          width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dim),var(--gold));
          display:flex;align-items:center;justify-content:center;font-family:"Syne",sans-serif;
          font-weight:800;font-size:0.78rem;color:#060708;
        }
        .t-name{font-size:0.88rem;font-weight:600}
        .t-loc{font-size:0.73rem;color:var(--muted)}

        /* CTA */
        .cta-band{
          text-align:center;padding:6rem 2rem;
          background:linear-gradient(135deg,rgba(200,169,110,0.05) 0%,transparent 50%,rgba(200,169,110,0.05) 100%);
          border-top:1px solid var(--border2);border-bottom:1px solid var(--border2);
        }
        .cta-band h2{font-size:clamp(1.8rem,3vw,2.8rem);font-weight:800;margin-bottom:1rem;max-width:700px;margin-left:auto;margin-right:auto}
        .cta-band p{color:var(--muted);margin-bottom:2rem;font-size:0.95rem}
        .cta-band a{
          padding:0.9rem 2.5rem;background:linear-gradient(135deg,#8a6530,var(--gold));
          color:#060708;font-weight:700;font-size:1rem;border-radius:8px;display:inline-block;transition:opacity 0.2s;
        }
        .cta-band a:hover{opacity:0.88}

        /* FAQ */
        .faq-wrap{max-width:780px;margin:3rem auto 0}
        .faq-item{border:1px solid var(--border2);border-radius:10px;margin-bottom:0.65rem;overflow:hidden;transition:border-color 0.2s}
        .faq-item.open{border-color:var(--border)}
        .faq-q{
          width:100%;background:var(--surface);border:none;padding:1.15rem 1.4rem;
          text-align:left;display:flex;justify-content:space-between;align-items:center;
          cursor:pointer;font-family:"DM Sans",sans-serif;font-size:0.92rem;font-weight:500;color:var(--text);gap:1rem;
        }
        .faq-q:hover{background:var(--surface2)}
        .faq-ic{
          width:20px;height:20px;flex-shrink:0;border:1px solid var(--border);border-radius:50%;
          display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:0.6rem;transition:transform 0.3s;
        }
        .faq-item.open .faq-ic{transform:rotate(180deg)}
        .faq-a{display:none;padding:0 1.4rem 1.15rem;font-size:0.86rem;color:var(--muted);line-height:1.8;background:var(--surface)}
        .faq-item.open .faq-a{display:block}

        /* FOOTER */
        footer{border-top:1px solid var(--border2);background:var(--bg);padding:4.5rem 2rem 2rem}
        .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:4rem;max-width:1200px;margin:0 auto 3rem}
        .footer-brand .logo{font-size:1.4rem;display:block;margin-bottom:1rem}
        .footer-brand p{font-size:0.83rem;color:var(--muted);line-height:1.8;max-width:280px}
        footer h5{font-family:"Syne",sans-serif;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--gold);margin-bottom:1.2rem}
        footer ul{list-style:none;display:flex;flex-direction:column;gap:0.55rem}
        footer ul li a{color:var(--muted);font-size:0.83rem;transition:color 0.2s}
        footer ul li a:hover{color:var(--gold)}
        .footer-bottom{
          max-width:1200px;margin:0 auto;border-top:1px solid var(--border2);
          padding-top:1.4rem;display:flex;justify-content:space-between;align-items:center;
          font-size:0.78rem;color:var(--muted);flex-wrap:wrap;gap:0.75rem;
        }

        /* MOBILE */
        .hamburger{display:none;cursor:pointer;color:white;background:none;border:none}
        @media(max-width:640px){
          .nav-links,.nav-ctas{display:none}
          .hamburger{display:block}
          .mobile-menu{
            display:flex;flex-direction:column;position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(8,10,14,0.98);backdrop-filter:blur(20px);z-index:300;
            align-items:center;justify-content:center;gap:2rem;
          }
          .mobile-menu a,.mobile-menu button{font-size:1.2rem;color:var(--text);font-family:"Syne",sans-serif;font-weight:600}
          .feat6,.serv8,.testi-grid{grid-template-columns:1fr}
          .steps4{grid-template-columns:1fr}
          .stats-bar{flex-direction:column}
          .stat{border-right:none;border-bottom:1px solid var(--border2)}
          .footer-grid{grid-template-columns:1fr}
          .bank-stats{grid-template-columns:1fr 1fr}
        }
      `}</style>

      {/* NAV */}
      <nav ref={navRef}>
        <a href="#" className="logo">QFS<span> World Vaults</span></a>
        <ul className="nav-links desktop-only">
          <li><a href="#features">Features</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#banking">Why QFS</a></li>
          <li><a href="#how">Get Started</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <div className="nav-ctas desktop-only">
          <a href="/login" className="btn-o">Login</a>
          <a href="/signup" className="btn-s">Register Free</a>
        </div>
        <button className="hamburger" onClick={() => setMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <button className="absolute top-4 right-4 text-white p-2" onClick={() => setMobileMenuOpen(false)}>
            <X size={28} />
          </button>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="#banking" onClick={() => setMobileMenuOpen(false)}>Why QFS</a>
          <a href="#how" onClick={() => setMobileMenuOpen(false)}>Get Started</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          <a href="/login" className="btn-o" onClick={() => setMobileMenuOpen(false)}>Login</a>
          <a href="/signup" className="btn-s" onClick={() => setMobileMenuOpen(false)}>Register Free</a>
        </div>
      )}

      {/* HERO */}
    <section id="hero">
  <div className="hero-grid"></div>
  <div className="hero-glow"></div>
  <div className="hero-badge"><span></span> Powered by Quantum Financial System</div>
  <h1>Gateway to Encrypt, Back Up &amp; Secure Your Assets</h1>
  <p className="hero-sub">The easiest, safest, and fastest way to secure &amp; back up your crypto assets — protected by quantum-grade encryption.</p>

  {/* ✅ Centered, clickable Login / Register buttons */}
  <div style={{
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '2rem',
    marginBottom: '2rem',
    position: 'relative',
    zIndex: 10,
  }}>
    <button
      onClick={() => navigate('/login')}
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
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      Login
    </button>
    <button
      onClick={() => navigate('/signup')}
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
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      Register Free
    </button>
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

      {/* FEATURES */}
      <section id="features" className="alt-bg">
        <div className="sec-inner">
          <div className="sec-tag">Our Platform</div>
          <h2 className="sec-title">Find &amp; Secure Your Crypto Now!</h2>
          <p className="sec-sub">
            Our comprehensive cybersecurity platform, driven by artificial intelligence, not only safeguards your organization — it empowers your financial future.
          </p>
          <div className="feat6">
            {[
              { icon: "🔗", title: "Connect to wallet", desc: "Connect decentralized apps to mobile wallets and enable full DAPP functionality with one click." },
              { icon: "🔍", title: "Missing Funds", desc: "Lost access to your funds or experiencing missing balances? Our recovery system traces and secures your assets." },
              { icon: "💸", title: "High Fee Solutions", desc: "Transaction fees too high? QFS routes your transfers through low-cost quantum channels for maximum savings." },
              { icon: "🛎️", title: "24/7 Support", desc: "Count on us for round-the-clock support — help whenever you need it, wherever you are in the world." },
              { icon: "🛡️", title: "Trusted & Secure", desc: "Your assets. On your terms. At your fingertips. Military-grade quantum encryption protects every transaction." },
              { icon: "🌐", title: "Explore Web3", desc: "It is the easiest, safest, and fastest way to secure & back up your crypto asset portfolio in the Web3 era." },
            ].map((feat, idx) => (
              <div key={idx} className="feat-card">
                <div className="feat-icon">{feat.icon}</div>
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
                <a href="/signup" className="feat-link">Get Started →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="sec-inner">
          <div className="sec-tag">Services</div>
          <h2 className="sec-title">Everything You Need in One Platform</h2>
          <p className="sec-sub">
            From spot trading to NFTs — QFS gives you access to a full suite of financial tools, all secured by quantum infrastructure.
          </p>
          <div className="serv8">
            {[
              { icon: "📊", title: "Spot Trading", desc: "Trade crypto with a comprehensive set of powerful tools to maximize your profits." },
              { icon: "📈", title: "Margin Trading", desc: "Borrow, trade, and repay. Leverage your assets with professional margin trading." },
              { icon: "⚡", title: "Crypto Derivatives", desc: "We are the best crypto exchange for trading crypto futures and derivatives." },
              { icon: "💰", title: "Web3 Earn", desc: "Invest and earn steady income with the help of a professional asset manager." },
              { icon: "🏦", title: "Buy Crypto", desc: "Purchase crypto quickly and easily on our popular industry-leading platform." },
              { icon: "🔬", title: "Advanced Trading", desc: "Borrow, trade, and repay using advanced strategies with full leverage control." },
              { icon: "🖼️", title: "NFT Trading", desc: "Discover, buy, and sell unique digital assets in our exclusive NFT marketplace." },
              { icon: "🚀", title: "Launchpad", desc: "Get early access to promising new crypto projects and tokens before public listing." },
            ].map((serv, idx) => (
              <div key={idx} className="serv-card">
                <span className="serv-icon">{serv.icon}</span>
                <h4>{serv.title}</h4>
                <p>{serv.desc}</p>
                <a href="/login" className="serv-link">View Details →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BANKING CRISIS */}
          <section id="banking">
  <div className="sec-inner">
    <div className="sec-tag">Why QFS Matters Now</div>
    <h2 className="sec-title">The Global Banking System Is Under Pressure</h2>
    <p className="sec-sub">Millions of people worldwide have experienced lost savings...</p>
    
    {/* The grid will automatically stack thanks to the CSS above */}
    <div className="bank-grid">
      <div>
        <div className="bank-visual">
          <div className="bank-video-thumb" onClick={openVideo}>
            <div className="play-btn">▶</div>
            <div className="video-label">Watch: Why People Are Moving Away</div>
          </div>
        </div>
              <div className="bank-stats">
                <div className="bstat"><h3>563</h3><p>US Bank Failures since 2000</p></div>
                <div className="bstat"><h3>$19T</h3><p>Global banking losses 2007–2023</p></div>
                <div className="bstat"><h3>48%</h3><p>Of adults distrust banks (2024 survey)</p></div>
                <div className="bstat"><h3>300M+</h3><p>People globally unbanked or underbanked</p></div>
              </div>
              <div className="bank-cta-box">
                <h4>Protect Your Wealth Before It's Too Late</h4>
                <p>When banks fail, account holders can lose access to their funds for weeks — or permanently. QFS keeps your assets in your control, always.</p>
                <a href="/signup" style={{ display: 'inline-block', padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #8a6530, var(--gold))', color: '#060708', fontWeight: 700, fontSize: '0.88rem', borderRadius: 8 }}>Secure My Assets Now →</a>
              </div>
            </div>
            <div className="bank-news">
              <div className="sec-tag" style={{ marginBottom: '1rem' }}>Recent Banking Concerns</div>
              {[
                { icon: "🏦", title: "Silicon Valley Bank Collapses — $175B in Customer Deposits at Risk", desc: "One of the largest US bank failures in history shocked depositors who found their accounts frozen overnight with no warning.", date: "March 2023" },
                { icon: "⚠️", title: "Credit Suisse Rescued in Emergency $3.2B Deal", desc: "The 166-year-old Swiss banking giant required emergency government-backed acquisition after a catastrophic loss of depositor confidence.", date: "March 2023" },
                { icon: "🔒", title: "Multiple Regional Banks Freeze Withdrawals", desc: "First Republic, Signature Bank and others froze customer withdrawals amid liquidity crises — leaving account holders unable to access their own money.", date: "2023–2024" },
                { icon: "📉", title: "Global Inflation Erodes Bank Savings at 40-Year High", desc: "With inflation outpacing interest rates in most countries, money sitting in traditional bank accounts is losing real value every single day.", date: "2022–2024" },
                { icon: "🌍", title: "Usa, Lebanon & Argentina: Bank Runs Leave Millions Stranded", desc: "Citizens in multiple developing nations were unable to access their savings as local currencies collapsed and banks imposed withdrawal caps.", date: "Ongoing" },
              ].map((news, idx) => (
                <div key={idx} className="news-item">
                  <div className="news-icon">{news.icon}</div>
                  <div>
                    <h5>{news.title}</h5>
                    <p>{news.desc}</p>
                    <div className="news-date">{news.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MED-BED */}
      <section id="medbed" className="alt-bg">
        <div className="sec-inner">
          <div className="sec-tag">QFS &amp; The New Economy</div>
          <h2 className="sec-title">Med-Beds &amp; the Quantum Financial Future</h2>
          <p className="sec-sub">
            The Quantum Financial System is more than banking — it is part of a broader vision of a new global economy that includes advanced healing technologies, humanitarian wealth redistribution, and sovereign financial freedom for every individual on earth.
          </p>
          <div className="medbed-grid">
            <div className="medbed-visual">
              <div className="medbed-icon-ring"><span className="medbed-emoji">🛏️</span></div>
            </div>
            <div>
              <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.85, marginBottom: '1.75rem' }}>
                Med-Beds are widely discussed as part of an emerging wave of quantum-based healing and regenerative technologies. Proponents believe these technologies — along with the QFS — represent a fundamental shift away from existing systems of control toward individual sovereignty, health, and financial freedom.
              </p>
              <div className="medbed-features">
                {[
                  { title: "Quantum Healing Technology", desc: "Med-Beds are described as advanced devices capable of cellular regeneration and full-body restoration — part of the same technological revolution that underpins the QFS." },
                  { title: "Humanitarian Wealth Projects", desc: "QFS is believed to hold vast humanitarian funds — including prosperity packages and restitution funds — that will be distributed globally as the new financial system activates." },
                  { title: "NESARA / GESARA Alignment", desc: "Many believe QFS operates in alignment with NESARA/GESARA — a global debt jubilee and economic reset designed to end financial slavery and restore prosperity to all nations." },
                  { title: "Secure Your Position Now", desc: "By securing your wallet on QFS today, you position yourself to receive and hold wealth that is protected from the collapse of the old financial order." },
                ].map((item, idx) => (
                  <div key={idx} className="mf-item">
                    <div className="mf-dot"></div>
                    <div>
                      <h5>{item.title}</h5>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO GET STARTED */}
      <section id="how">
        <div className="sec-inner">
          <div className="sec-tag">How To Get Started</div>
          <h2 className="sec-title">Up and Running in 4 Simple Steps</h2>
          <p className="sec-sub">
            Getting your assets protected on QFS is fast and free. Follow these steps to secure your financial future today.
          </p>
          <div className="steps4">
            {[
              { num: "01", title: "Connect Wallet", desc: "Click the connect wallet button to begin the registration and onboarding process on the QFS network." },
              { num: "02", title: "Select Wallet", desc: "Choose your preferred wallet to back up. We support all major wallets including MetaMask, Trust Wallet, Ledger, and more." },
              { num: "03", title: "Back Up Your Wallet", desc: "Your wallet backup — also known as your seed phrase, recovery phrase, or BIP-39 mnemonic — is encrypted and secured on QFS." },
              { num: "04", title: "Start Your Journey", desc: "A safe wallet backup means you can recover your assets in case of hardware failure, loss, or theft — anytime, from anywhere." },
            ].map((step, idx) => (
              <div key={idx} className="step-c">
                <div className="step-num">{step.num}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
                {idx === 0 && <a href="/signup">Connect Wallet →</a>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="alt-bg">
        <div className="sec-inner">
          <div className="sec-tag">Community</div>
          <h2 className="sec-title">Trusted by Investors Worldwide</h2>
          <div className="testi-grid">
            {[
              { stars: "★ ★ ★ ★ ★", quote: "After my bank froze my account for 3 weeks with no explanation, I moved everything to QFS. I sleep better knowing my crypto is in my control, not theirs.", author: "Marcus R.", loc: "United States", initial: "MR" },
              { stars: "★ ★ ★ ★ ★", quote: "J'ai perdu confiance dans les banques depuis 2023. QFS m'a donné une vraie alternative. Mon portefeuille est sécurisé, et j'ai le contrôle total.", author: "Amélie L.", loc: "France", initial: "AL" },
              { stars: "★ ★ ★ ★ ★", quote: "QFS gave me access to the new financial system before most people even know it exists. My assets are backed up, secured, and ready for whatever comes next.", author: "Chukwuemeka K.", loc: "Nigeria", initial: "CK" },
            ].map((test, idx) => (
              <div key={idx} className="testi-card">
                <div className="t-stars">{test.stars}</div>
                <p className="t-quote">"{test.quote}"</p>
                <div className="t-author">
                  <div className="t-av">{test.initial}</div>
                  <div>
                    <div className="t-name">{test.author}</div>
                    <div className="t-loc">{test.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <div className="cta-band">
        <div className="sec-inner" style={{ textAlign: 'center' }}>
          <div className="sec-tag" style={{ textAlign: 'center', marginBottom: '1rem' }}>Don't Wait</div>
          <h2>Secure Your Wealth Before the Next Bank Crisis</h2>
          <p>Join 30 million global investors who are already protecting their assets on the Quantum Financial System.</p>
          <a href="/signup">Connect Wallet — It's Free →</a>
        </div>
      </div>

      {/* FAQ */}
      <section id="faq">
        <div className="sec-inner">
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <div className="sec-tag" style={{ textAlign: 'center' }}>FAQ</div>
          </div>
          <h2 className="sec-title" style={{ textAlign: 'center', margin: '0 auto 1rem' }}>Frequently Asked Questions</h2>
          <p className="sec-sub" style={{ textAlign: 'center', margin: '0 auto 0' }}>Have more questions? Email us at support@qfsworldvaults.com</p>
          <div className="faq-wrap">
            {[
              { q: "What is QFS World Vaults?", a: "QFS World Vaults is a quantum-powered digital asset security platform. It protects your cryptocurrency wallets and digital assets from cyber attacks, market manipulation, and the instability of the traditional financial system." },
              { q: "Is registration free?", a: "Yes — completely free. Create your account today and begin securing your crypto wallet and digital assets with no obligations." },
              { q: "How do I connect my wallet?", a: "Register your free account → verify your identity → login to your dashboard → click \"Secure Wallet/Asset\" → follow the step-by-step instructions. Our team is available 24/7 to help." },
              { q: "What wallets are supported?", a: "QFS supports all major crypto wallets including MetaMask, Trust Wallet, Coinbase Wallet, Ledger, Trezor, Exodus, and many more. If you're unsure, contact our support team." },
              { q: "What is a Med-Bed and how does it relate to QFS?", a: "Med-Beds are advanced healing technologies that many believe are part of the same quantum technological revolution as the QFS. Holders of secured QFS wallets are believed to be positioned to participate in the broader new economy, including access to humanitarian programs and advanced technologies as they roll out globally." },
              { q: "What is NESARA / GESARA?", a: "NESARA (National Economic Security and Recovery Act) and GESARA (Global Economic Security and Recovery Act) refer to proposed global economic reforms including debt cancellation, gold-backed currencies, and wealth redistribution. Many believe the QFS is the backbone infrastructure for implementing these changes." },
              { q: "How are payouts and withdrawals processed?", a: "All withdrawals are submitted through your secure dashboard and reviewed by our team. Approved withdrawals are processed promptly. You will receive confirmation and notification at each stage." },
            ].map((faq, idx) => (
              <div key={idx} className={`faq-item ${openFaqIndex === idx ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => toggleFaq(idx)}>
                  {faq.q}<span className="faq-ic">▾</span>
                </button>
                <div className="faq-a">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="logo">QFS<span> World Vaults</span></a>
            <p>The Quantum Financial System — redefining global finance with unparalleled transparency, security, and speed. Protecting your wealth from a failing system.</p>
          </div>
          <div>
            <h5>Platform</h5>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#banking">Why QFS</a></li>
              <li><a href="#how">Get Started</a></li>
              <li><a href="/signup">Register</a></li>
              <li><a href="/login">Login</a></li>
            </ul>
          </div>
          <div>
            <h5>Services</h5>
            <ul>
              <li><a href="/login">Spot Trading</a></li>
              <li><a href="/login">Margin Trading</a></li>
              <li><a href="/login">Crypto Derivatives</a></li>
              <li><a href="/login">Web3 Earn</a></li>
              <li><a href="/login">NFT Trading</a></li>
              <li><a href="/login">Launchpad</a></li>
            </ul>
          </div>
          <div>
            <h5>Support</h5>
            <ul>
              <li><a href="mailto:support@qfsworldvaults.com">support@qfsworldvaults.com</a></li>
              <li><a href="#">Live Chat</a></li>
              <li><a href="#">Telegram</a></li>
              <li><a href="#">YouTube: XRPQFSTeam1</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2018–2025 QFS World Vaults. All rights reserved.</span>
          <span style={{ color: 'var(--gold-dim)' }}>Powered by Quantum Financial System</span>
        </div>
      </footer>

      {/* VIDEO MODAL */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden border border-[#0e4fa5]/30">
            <button onClick={closeVideo} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/80 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center z-50 transition-colors">
              <X className="h-4 w-4" />
            </button>
            <div className="p-4 border-b border-red-950/30 bg-[#000]">
              <h4 className="text-xs font-bold font-sans text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-red-400" /> System Crisis Coverage
              </h4>
            </div>
            <iframe
              title="Broadcast Player"
              src="https://www.youtube.com/embed/videoseries?list=PLFs4vir_WsTwEd-nJgVJCZPNL3HALHHpF&autoplay=1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
      <ChatWidget />
    </div>
  );
}
