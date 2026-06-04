import { useState } from 'react';
import { ArrowLeft, Crown, Zap, Sparkles, CreditCard, Check } from 'lucide-react';
import PaymentMethodModal from './PaymentMethodModal';

interface CardTopupModalProps { onClose: () => void; }

interface CardProduct {
  id: string;
  name: string;
  tag: string;
  description: string;
  front: (name: string) => React.ReactNode;
  back: () => React.ReactNode;
}

/* ─── shared card shell ────────────────────────────────────────────────────── */
const CARD_W = '100%';
const CARD_H = 200;

function CardShell({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: CARD_W, height: CARD_H, borderRadius: 18, position: 'relative',
      overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── QFS Silver ────────────────────────────────────────────────────────────── */
function SilverFront({ name }: { name: string }) {
  return (
    <CardShell style={{ background: 'linear-gradient(135deg,#c0c0c0 0%,#e8e8e8 30%,#a8a8a8 60%,#d4d4d4 100%)' }}>
      {/* shimmer */}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.55) 50%,transparent 60%)', pointerEvents:'none' }} />
      {/* chip */}
      <div style={{ position:'absolute', top:24, left:24, width:42, height:32, borderRadius:6, background:'linear-gradient(135deg,#d4af37,#f5e27a,#c9a227)', boxShadow:'0 2px 8px rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:28, height:20, border:'1.5px solid rgba(139,100,20,0.6)', borderRadius:3, display:'grid', gridTemplateColumns:'1fr 1fr' }}>
          {[0,1,2,3].map(i=><div key={i} style={{ border:'0.5px solid rgba(139,100,20,0.4)' }} />)}
        </div>
      </div>
      {/* wave lines */}
      <svg style={{ position:'absolute', right:0, top:0, height:'100%', opacity:0.12 }} viewBox="0 0 120 200" preserveAspectRatio="none">
        {[0,20,40,60,80,100].map(x=>(
          <path key={x} d={`M${x} 0 Q${x+30} 100 ${x} 200`} stroke="#fff" strokeWidth="18" fill="none"/>
        ))}
      </svg>
      {/* number */}
      <div style={{ position:'absolute', bottom:54, left:24, right:24 }}>
        <p style={{ fontFamily:'monospace', fontSize:17, letterSpacing:'0.2em', color:'#2a2a2a', fontWeight:700, textShadow:'0 1px 0 rgba(255,255,255,0.6)' }}>
          •••• •••• •••• 4582
        </p>
      </div>
      {/* name + expiry */}
      <div style={{ position:'absolute', bottom:18, left:24, right:24, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <p style={{ fontSize:9, color:'#555', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>Card holder</p>
          <p style={{ fontSize:13, fontWeight:700, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.05em', minHeight:16 }}>
            {name || 'YOUR NAME'}
          </p>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:9, color:'#555', letterSpacing:'0.1em', marginBottom:2 }}>EXPIRES</p>
          <p style={{ fontSize:13, fontWeight:700, color:'#1a1a1a' }}>12/28</p>
        </div>
      </div>
      {/* QFS badge */}
      <div style={{ position:'absolute', top:22, right:20, display:'flex', alignItems:'center', gap:4 }}>
        <Sparkles size={14} color="#555" />
        <span style={{ fontSize:12, fontWeight:900, color:'#333', letterSpacing:'0.12em' }}>QFS SILVER</span>
      </div>
      {/* visa */}
      <div style={{ position:'absolute', bottom:18, right:24 }}>
        <span style={{ fontFamily:'serif', fontStyle:'italic', fontWeight:900, fontSize:22, color:'#1a1a6e', letterSpacing:'-1px' }}>VISA</span>
      </div>
    </CardShell>
  );
}

function SilverBack() {
  return (
    <CardShell style={{ background:'linear-gradient(135deg,#a0a0a0 0%,#d0d0d0 50%,#909090 100%)' }}>
      <div style={{ position:'absolute', top:28, left:0, right:0, height:44, background:'#1a1a1a' }} />
      <div style={{ position:'absolute', top:90, left:16, right:16 }}>
        <div style={{ background:'linear-gradient(90deg,#f0f0f0,#fff)', borderRadius:4, height:36, display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:12 }}>
          <span style={{ fontFamily:'monospace', fontSize:16, letterSpacing:'0.15em', color:'#1a1a1a', fontWeight:700 }}>•••  7 2 4</span>
        </div>
        <p style={{ fontSize:9, color:'#555', marginTop:4, textAlign:'right' }}>CVV</p>
      </div>
      <div style={{ position:'absolute', bottom:16, left:16, right:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <p style={{ fontSize:9, color:'#777', maxWidth:180, lineHeight:1.4 }}>This card is property of QFS. If found, please return to nearest bank.</p>
        <span style={{ fontFamily:'serif', fontStyle:'italic', fontWeight:900, fontSize:18, color:'#1a1a6e' }}>VISA</span>
      </div>
    </CardShell>
  );
}

/* ─── QFS Gold ────────────────────────────────────────────────────────────── */
function GoldFront({ name }: { name: string }) {
  return (
    <CardShell style={{ background:'linear-gradient(135deg,#b8860b 0%,#ffd700 30%,#daa520 60%,#f5c842 85%,#b8860b 100%)' }}>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.5) 50%,transparent 65%)', pointerEvents:'none' }} />
      {/* embossed texture */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg,rgba(0,0,0,0.03) 0px,rgba(0,0,0,0.03) 1px,transparent 1px,transparent 8px)', pointerEvents:'none' }} />
      {/* chip */}
      <div style={{ position:'absolute', top:24, left:24, width:42, height:32, borderRadius:6, background:'linear-gradient(135deg,#8B6914,#f5d060,#8B6914)', boxShadow:'0 3px 10px rgba(0,0,0,0.4)' }}>
        <div style={{ position:'absolute', inset:4, border:'1px solid rgba(139,100,20,0.5)', borderRadius:3, display:'grid', gridTemplateColumns:'1fr 1fr' }}>
          {[0,1,2,3].map(i=><div key={i} style={{ border:'0.5px solid rgba(139,100,20,0.3)' }} />)}
        </div>
      </div>
      {/* crown */}
      <div style={{ position:'absolute', top:20, right:20, display:'flex', alignItems:'center', gap:5 }}>
        <Crown size={16} color="#7a5200" />
        <span style={{ fontSize:12, fontWeight:900, color:'#7a5200', letterSpacing:'0.12em' }}>QFS GOLD</span>
      </div>
      {/* hologram circle */}
      <div style={{ position:'absolute', bottom:22, right:70, width:36, height:36, borderRadius:'50%', background:'conic-gradient(#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)', opacity:0.7, boxShadow:'0 0 10px rgba(255,200,0,0.6)' }} />
      <div style={{ position:'absolute', bottom:30, left:24, right:24 }}>
        <p style={{ fontFamily:'monospace', fontSize:16, letterSpacing:'0.2em', color:'#3d2800', fontWeight:800, textShadow:'0 1px 0 rgba(255,255,200,0.8)' }}>•••• •••• •••• 8793</p>
      </div>
      <div style={{ position:'absolute', bottom:10, left:24, right:24, display:'flex', justifyContent:'space-between' }}>
        <div>
          <p style={{ fontSize:9, color:'#7a5200', letterSpacing:'0.1em', marginBottom:1 }}>CARD HOLDER</p>
          <p style={{ fontSize:13, fontWeight:800, color:'#3d2800', textTransform:'uppercase', letterSpacing:'0.04em', minHeight:16 }}>{name || 'YOUR NAME'}</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:9, color:'#7a5200', letterSpacing:'0.1em', marginBottom:1 }}>EXPIRES</p>
          <p style={{ fontSize:13, fontWeight:800, color:'#3d2800' }}>12/30</p>
        </div>
      </div>
      <div style={{ position:'absolute', bottom:12, right:20 }}>
        <span style={{ fontFamily:'serif', fontStyle:'italic', fontWeight:900, fontSize:22, color:'#3d2800' }}>GOLD</span>
      </div>
    </CardShell>
  );
}

function GoldBack() {
  return (
    <CardShell style={{ background:'linear-gradient(135deg,#b8860b,#daa520,#b8860b)' }}>
      <div style={{ position:'absolute', top:28, left:0, right:0, height:44, background:'#1a1a1a' }} />
      <div style={{ position:'absolute', top:90, left:16, right:16 }}>
        <div style={{ background:'linear-gradient(90deg,#fffde7,#fff)', borderRadius:4, height:36, display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:12 }}>
          <span style={{ fontFamily:'monospace', fontSize:16, letterSpacing:'0.15em', color:'#3d2800', fontWeight:700 }}>•••  5 8 1</span>
        </div>
        <p style={{ fontSize:9, color:'#7a5200', marginTop:4, textAlign:'right' }}>CVV</p>
      </div>
      <div style={{ position:'absolute', bottom:16, left:16, right:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <p style={{ fontSize:9, color:'#7a5200', maxWidth:180, lineHeight:1.4 }}>QFS Gold — premium membership card. Property of QFS Financial.</p>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'conic-gradient(#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)', opacity:0.7 }} />
      </div>
    </CardShell>
  );
}

/* ─── Trump Gold ──────────────────────────────────────────────────────────── */
function TrumpFront({ name }: { name: string }) {
  return (
    <CardShell style={{ background:'linear-gradient(135deg,#c9970c 0%,#f7d060 25%,#e8a800 50%,#fbe89a 70%,#c9970c 100%)' }}>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(110deg,transparent 30%,rgba(255,255,255,0.6) 50%,transparent 70%)', pointerEvents:'none' }} />
      {/* diagonal stripes subtle */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(-45deg,rgba(255,255,255,0.04) 0px,rgba(255,255,255,0.04) 2px,transparent 2px,transparent 12px)', pointerEvents:'none' }} />
      {/* eagle watermark */}
      <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', opacity:0.08, fontSize:90, lineHeight:1 }}>🦅</div>
      {/* top bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:6, background:'linear-gradient(90deg,#b22234,#b22234 33%,#fff 33%,#fff 66%,#3c3b6e 66%)' }} />
      {/* chip */}
      <div style={{ position:'absolute', top:22, left:22, width:42, height:32, borderRadius:6, background:'linear-gradient(135deg,#a07000,#f5e27a,#a07000)', boxShadow:'0 3px 12px rgba(0,0,0,0.5)' }}>
        <div style={{ position:'absolute', inset:4, border:'1px solid rgba(139,100,0,0.5)', borderRadius:3, display:'grid', gridTemplateColumns:'1fr 1fr' }}>
          {[0,1,2,3].map(i=><div key={i} style={{ border:'0.5px solid rgba(139,100,0,0.3)' }} />)}
        </div>
      </div>
      {/* TRUMP branding */}
      <div style={{ position:'absolute', top:18, right:16, textAlign:'right' }}>
        <p style={{ fontFamily:'Georgia,serif', fontSize:22, fontWeight:900, color:'#3d2800', letterSpacing:'0.15em', lineHeight:1, textShadow:'0 1px 0 rgba(255,255,200,0.8)' }}>TRUMP</p>
        <p style={{ fontFamily:'Georgia,serif', fontSize:9, fontWeight:700, color:'#7a5200', letterSpacing:'0.35em' }}>GOLD CARD</p>
        <Zap size={12} color="#7a5200" style={{ marginLeft:'auto', marginTop:2 }} />
      </div>
      {/* number */}
      <div style={{ position:'absolute', bottom:46, left:22 }}>
        <p style={{ fontFamily:'monospace', fontSize:15, letterSpacing:'0.22em', color:'#3d2800', fontWeight:800, textShadow:'0 1px 0 rgba(255,255,200,0.9)' }}>•••• •••• •••• 4501</p>
      </div>
      {/* name + expiry */}
      <div style={{ position:'absolute', bottom:12, left:22, right:22, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <p style={{ fontSize:8, color:'#7a5200', letterSpacing:'0.15em', marginBottom:1 }}>CARD HOLDER</p>
          <p style={{ fontSize:13, fontWeight:800, color:'#3d2800', textTransform:'uppercase', letterSpacing:'0.04em', minHeight:16 }}>{name || 'YOUR NAME'}</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:8, color:'#7a5200', letterSpacing:'0.1em', marginBottom:1 }}>EXPIRES</p>
          <p style={{ fontSize:13, fontWeight:800, color:'#3d2800' }}>01/29</p>
        </div>
      </div>
      {/* USA bottom label */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:5, background:'linear-gradient(90deg,#b22234,#b22234 33%,#fff 33%,#fff 66%,#3c3b6e 66%)' }} />
    </CardShell>
  );
}

function TrumpBack() {
  return (
    <CardShell style={{ background:'linear-gradient(135deg,#c9970c,#f7d060,#c9970c)' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:5, background:'linear-gradient(90deg,#b22234,#b22234 33%,#fff 33%,#fff 66%,#3c3b6e 66%)' }} />
      <div style={{ position:'absolute', top:30, left:0, right:0, height:44, background:'#1a1a1a' }} />
      <div style={{ position:'absolute', top:92, left:16, right:16 }}>
        <div style={{ background:'linear-gradient(90deg,#fffde7,#fff)', borderRadius:4, height:36, display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:12 }}>
          <span style={{ fontFamily:'monospace', fontSize:16, letterSpacing:'0.15em', color:'#3d2800', fontWeight:700 }}>•••  3 1 7</span>
        </div>
        <p style={{ fontSize:9, color:'#7a5200', marginTop:4, textAlign:'right' }}>CVV</p>
      </div>
      <div style={{ position:'absolute', bottom:16, left:16, right:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <p style={{ fontSize:9, color:'#7a5200', maxWidth:180, lineHeight:1.4 }}>Trump Gold — Exclusive limited edition card. Authorized use only.</p>
        <div style={{ fontSize:28, opacity:0.6 }}>🦅</div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:5, background:'linear-gradient(90deg,#b22234,#b22234 33%,#fff 33%,#fff 66%,#3c3b6e 66%)' }} />
    </CardShell>
  );
}

/* ─── Medbed ─────────────────────────────────────────────────────────────── */
function MedbedFront({ name }: { name: string }) {
  return (
    <CardShell style={{ background:'linear-gradient(135deg,#1a0533 0%,#4a1060 30%,#7b2d8b 60%,#9b59b6 100%)' }}>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(110deg,transparent 30%,rgba(200,100,255,0.25) 50%,transparent 70%)', pointerEvents:'none' }} />
      {/* glow dots */}
      {[[0.15,0.2],[0.7,0.6],[0.4,0.85],[0.85,0.3]].map(([x,y],i)=>(
        <div key={i} style={{ position:'absolute', left:`${x*100}%`, top:`${y*100}%`, width:60, height:60, borderRadius:'50%', background:'radial-gradient(circle,rgba(180,100,255,0.4),transparent 70%)', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
      ))}
      {/* chip */}
      <div style={{ position:'absolute', top:22, left:22, width:42, height:32, borderRadius:6, background:'linear-gradient(135deg,#8b00d4,#cc88ff,#8b00d4)', boxShadow:'0 0 15px rgba(150,0,255,0.6)' }}>
        <div style={{ position:'absolute', inset:4, border:'1px solid rgba(200,100,255,0.4)', borderRadius:3, display:'grid', gridTemplateColumns:'1fr 1fr' }}>
          {[0,1,2,3].map(i=><div key={i} style={{ border:'0.5px solid rgba(200,100,255,0.3)' }} />)}
        </div>
      </div>
      {/* top-right */}
      <div style={{ position:'absolute', top:20, right:18, textAlign:'right' }}>
        <p style={{ fontSize:12, fontWeight:900, color:'#e8aaff', letterSpacing:'0.14em' }}>MEDBED</p>
        <p style={{ fontSize:8, color:'#c084fc', letterSpacing:'0.2em' }}>HEALING CARD</p>
      </div>
      {/* pulse icon */}
      <div style={{ position:'absolute', right:18, bottom:44, opacity:0.9 }}>
        <svg width="44" height="22" viewBox="0 0 44 22">
          <polyline points="0,11 8,11 12,2 16,20 20,6 24,16 28,11 44,11" stroke="#c084fc" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* number */}
      <div style={{ position:'absolute', bottom:46, left:22 }}>
        <p style={{ fontFamily:'monospace', fontSize:15, letterSpacing:'0.22em', color:'#f0d0ff', fontWeight:700 }}>•••• •••• •••• 2024</p>
      </div>
      {/* name + expiry */}
      <div style={{ position:'absolute', bottom:12, left:22, right:22, display:'flex', justifyContent:'space-between' }}>
        <div>
          <p style={{ fontSize:8, color:'#c084fc', letterSpacing:'0.12em', marginBottom:1 }}>CARD HOLDER</p>
          <p style={{ fontSize:13, fontWeight:700, color:'#f5e6ff', textTransform:'uppercase', letterSpacing:'0.04em', minHeight:16 }}>{name || 'YOUR NAME'}</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:8, color:'#c084fc', letterSpacing:'0.1em', marginBottom:1 }}>EXPIRES</p>
          <p style={{ fontSize:13, fontWeight:700, color:'#f5e6ff' }}>01/30</p>
        </div>
      </div>
    </CardShell>
  );
}

function MedbedBack() {
  return (
    <CardShell style={{ background:'linear-gradient(135deg,#1a0533,#4a1060,#1a0533)' }}>
      <div style={{ position:'absolute', top:28, left:0, right:0, height:44, background:'#0a0a0a' }} />
      <div style={{ position:'absolute', top:90, left:16, right:16 }}>
        <div style={{ background:'linear-gradient(90deg,#2d0050,#4a0080)', borderRadius:4, height:36, display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:12, border:'1px solid rgba(192,132,252,0.3)' }}>
          <span style={{ fontFamily:'monospace', fontSize:16, letterSpacing:'0.15em', color:'#e8aaff', fontWeight:700 }}>•••  9 4 2</span>
        </div>
        <p style={{ fontSize:9, color:'#c084fc', marginTop:4, textAlign:'right' }}>CVV</p>
      </div>
      <div style={{ position:'absolute', bottom:16, left:16, right:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <p style={{ fontSize:9, color:'#c084fc', maxWidth:200, lineHeight:1.4 }}>Medbed Healing Card. Authorized sessions only. Property of MedBed Corp.</p>
        <svg width="32" height="16" viewBox="0 0 44 22">
          <polyline points="0,11 8,11 12,2 16,20 20,6 24,16 28,11 44,11" stroke="#c084fc" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </CardShell>
  );
}

/* ─── 3D Flip Card ──────────────────────────────────────────────────────────── */
function FlipCard({ front, back, flipped, onClick }: {
  front: React.ReactNode; back: React.ReactNode; flipped: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{ width:'100%', height:CARD_H, cursor:'pointer', perspective:1200, WebkitPerspective:1200 }}
    >
      <div style={{
        width:'100%', height:'100%', position:'relative',
        transformStyle:'preserve-3d', WebkitTransformStyle:'preserve-3d',
        transition:'transform 0.7s cubic-bezier(0.4,0.2,0.2,1)',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Front */}
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden' }}>
          {front}
        </div>
        {/* Back */}
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', transform:'rotateY(180deg)' }}>
          {back}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export function CardTopupModal({ onClose }: CardTopupModalProps) {
  const [step, setStep] = useState<'pick-type' | 'pick-card' | 'detail' | 'payment'>('pick-type');
  const [cardType, setCardType] = useState<'qfs' | 'medbed' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');

  const qfsCards: CardProduct[] = [
    { id:'qfs_silver', name:'QFS Silver Card', tag:'Silver · VISA', description:'Entry-level QFS card with essential benefits and worldwide acceptance.', front:(n)=><SilverFront name={n} />, back:()=><SilverBack /> },
    { id:'qfs_gold',   name:'QFS Gold Card',   tag:'Gold · Priority', description:'Premium gold card with priority support, lower fees, and exclusive perks.', front:(n)=><GoldFront name={n} />,   back:()=><GoldBack /> },
    { id:'trump_gold', name:'Trump Gold Card', tag:'Limited Edition', description:'Exclusive Trump-branded gold card with prestige access and unique privileges.', front:(n)=><TrumpFront name={n} />, back:()=><TrumpBack /> },
  ];

  const medbedCard: CardProduct = {
    id:'medbed', name:'Medbed Card', tag:'Healing · Credits', description:'Access Medbed healing sessions at authorized centers worldwide.',
    front:(n)=><MedbedFront name={n} />, back:()=><MedbedBack />,
  };

  const allCards = step === 'pick-card' && cardType === 'qfs' ? qfsCards : [medbedCard];
  const selected = [...qfsCards, medbedCard].find(c => c.id === selectedId);

  const handleSelectCard = (id: string) => {
    if (flippedId === id) { setFlippedId(null); return; }
    setSelectedId(id);
    setStep('detail');
  };

  if (step === 'payment') {
    return <PaymentMethodModal onClose={onClose} onComplete={() => { alert(`${selected?.name} purchase submitted for ${cardholderName}!`); onClose(); }} />;
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0, width:'100%' }}>

      {/* ── Back button ────────────────────────────────────────── */}
      {step !== 'pick-type' && (
        <button
          onClick={() => {
            if (step === 'detail') { setSelectedId(null); setFlippedId(null); setCardholderName(''); setStep(cardType === 'medbed' ? 'pick-type' : 'pick-card'); }
            else if (step === 'pick-card') { setCardType(null); setStep('pick-type'); }
          }}
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'rgba(255,255,255,0.6)', fontSize:14, cursor:'pointer', padding:'0 0 16px', fontWeight:500 }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}

      {/* ══ STEP 1: Pick type ═══════════════════════════════════════════════ */}
      {step === 'pick-type' && (
        <div>
          <p style={{ textAlign:'center', fontSize:11, letterSpacing:'0.2em', color:'rgba(255,255,255,0.45)', marginBottom:20, textTransform:'uppercase' }}>Select a Card Type</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { id:'qfs',    label:'QFS Card',    sub:'Silver / Gold / Trump', color:'#2563eb', bg:'rgba(37,99,235,0.12)', border:'rgba(37,99,235,0.35)', icon:<CreditCard size={28} color="#60a5fa" /> },
              { id:'medbed', label:'Medbed Card',  sub:'Healing session credits', color:'#9333ea', bg:'rgba(147,51,234,0.12)', border:'rgba(147,51,234,0.35)', icon:<CreditCard size={28} color="#c084fc" /> },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => { setCardType(t.id as any); setStep(t.id === 'medbed' ? 'pick-card' : 'pick-card'); }}
                style={{
                  padding:'24px 12px', borderRadius:20, border:`1.5px solid ${t.border}`,
                  background:t.bg, cursor:'pointer', textAlign:'center',
                  backdropFilter:'blur(12px)', transition:'all 0.2s',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:10,
                }}
              >
                <div style={{ width:56, height:56, borderRadius:'50%', background:`rgba(${t.id==='qfs'?'37,99,235':'147,51,234'},0.15)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {t.icon}
                </div>
                <div>
                  <p style={{ color:'#fff', fontWeight:700, fontSize:15, marginBottom:3 }}>{t.label}</p>
                  <p style={{ color:'rgba(255,255,255,0.45)', fontSize:11 }}>{t.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ STEP 2: Pick card (gallery) ═════════════════════════════════════ */}
      {step === 'pick-card' && (
        <div>
          <p style={{ textAlign:'center', fontSize:11, letterSpacing:'0.2em', color:'rgba(255,255,255,0.45)', marginBottom:4, textTransform:'uppercase' }}>
            {cardType === 'qfs' ? 'Choose your QFS Card' : 'Medbed Card'}
          </p>
          <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:20 }}>Tap a card to flip · tap again to select</p>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {(cardType === 'qfs' ? qfsCards : [medbedCard]).map(card => (
              <div key={card.id} style={{ borderRadius:22, border: selectedId===card.id ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px solid rgba(255,255,255,0.08)', overflow:'hidden', background:'rgba(255,255,255,0.04)', backdropFilter:'blur(12px)', transition:'border 0.2s' }}>
                {/* Card flip area */}
                <div style={{ padding:'16px 16px 0' }}>
                  <FlipCard
                    front={card.front('')}
                    back={card.back()}
                    flipped={flippedId === card.id}
                    onClick={() => setFlippedId(prev => prev === card.id ? null : card.id)}
                  />
                </div>
                {/* Info + select */}
                <div style={{ padding:'12px 16px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <div style={{ minWidth:0 }}>
                    <p style={{ color:'#fff', fontWeight:700, fontSize:14, marginBottom:2 }}>{card.name}</p>
                    <p style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>{card.tag}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedId(card.id); setStep('detail'); setCardholderName(''); }}
                    style={{
                      flexShrink:0, padding:'8px 16px', borderRadius:12,
                      border:'none', cursor:'pointer', fontWeight:700, fontSize:13,
                      background:'rgba(255,255,255,0.12)', color:'#fff',
                      backdropFilter:'blur(8px)', transition:'all 0.2s',
                      display:'flex', alignItems:'center', gap:6,
                    }}
                  >
                    Select <ArrowLeft size={13} style={{ transform:'rotate(180deg)' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ STEP 3: Detail + cardholder name ════════════════════════════════ */}
      {step === 'detail' && selected && (
        <div>
          <p style={{ textAlign:'center', fontSize:11, letterSpacing:'0.2em', color:'rgba(255,255,255,0.45)', marginBottom:20, textTransform:'uppercase' }}>Personalize your Card</p>

          {/* Live card preview with flip */}
          <div style={{ marginBottom:20 }}>
            <FlipCard
              front={selected.front(cardholderName)}
              back={selected.back()}
              flipped={flippedId === selected.id}
              onClick={() => setFlippedId(prev => prev === selected.id ? null : selected.id)}
            />
            <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:8 }}>Tap card to flip</p>
          </div>

          {/* Card info */}
          <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'14px 16px', marginBottom:16 }}>
            <p style={{ color:'#fff', fontWeight:700, fontSize:15, marginBottom:3 }}>{selected.name}</p>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:12, lineHeight:1.5 }}>{selected.description}</p>
          </div>

          {/* Benefits */}
          <div style={{ marginBottom:20, display:'flex', flexDirection:'column', gap:6 }}>
            {['Worldwide acceptance', 'Instant activation', 'Secure encrypted chip', '24/7 support access'].map(b => (
              <div key={b} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Check size={10} color="#4ade80" />
                </div>
                <span style={{ color:'rgba(255,255,255,0.6)', fontSize:12 }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Name input */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:600, marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={e => setCardholderName(e.target.value.toUpperCase())}
              placeholder="JOHN DOE"
              style={{
                width:'100%', padding:'13px 16px', borderRadius:14,
                background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(255,255,255,0.15)',
                color:'#fff', fontSize:15, fontWeight:600, letterSpacing:'0.15em',
                outline:'none', boxSizing:'border-box', caretColor:'#fff',
                transition:'border 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor='rgba(255,255,255,0.4)')}
              onBlur={e => (e.target.style.borderColor='rgba(255,255,255,0.15)')}
            />
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginTop:5 }}>This name will appear on your card</p>
          </div>

          {/* Purchase button */}
          <button
            onClick={() => {
              if (!cardholderName.trim()) { alert('Please enter the cardholder name'); return; }
              setStep('payment');
            }}
            disabled={!cardholderName.trim()}
            style={{
              width:'100%', padding:'15px 0', borderRadius:16, border:'none',
              cursor: cardholderName.trim() ? 'pointer' : 'not-allowed',
              fontWeight:800, fontSize:16, letterSpacing:'0.04em',
              background: cardholderName.trim()
                ? 'linear-gradient(135deg,#2563eb,#1d4ed8)'
                : 'rgba(255,255,255,0.08)',
              color: cardholderName.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
              boxShadow: cardholderName.trim() ? '0 8px 24px rgba(37,99,235,0.4)' : 'none',
              transition:'all 0.3s',
            }}
          >
            Purchase Now
          </button>
        </div>
      )}
    </div>
  );
}
