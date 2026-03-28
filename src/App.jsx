import { useState, useEffect, useRef, useCallback } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const SIGNS = [
  { name: "Aries", symbol: "♈", dates: "Mar 21–Apr 19", element: "Fire", ruling: "Mars" },
  { name: "Taurus", symbol: "♉", dates: "Apr 20–May 20", element: "Earth", ruling: "Venus" },
  { name: "Gemini", symbol: "♊", dates: "May 21–Jun 20", element: "Air", ruling: "Mercury" },
  { name: "Cancer", symbol: "♋", dates: "Jun 21–Jul 22", element: "Water", ruling: "Moon" },
  { name: "Leo", symbol: "♌", dates: "Jul 23–Aug 22", element: "Fire", ruling: "Sun" },
  { name: "Virgo", symbol: "♍", dates: "Aug 23–Sep 22", element: "Earth", ruling: "Mercury" },
  { name: "Libra", symbol: "♎", dates: "Sep 23–Oct 22", element: "Air", ruling: "Venus" },
  { name: "Scorpio", symbol: "♏", dates: "Oct 23–Nov 21", element: "Water", ruling: "Pluto" },
  { name: "Sagittarius", symbol: "♐", dates: "Nov 22–Dec 21", element: "Fire", ruling: "Jupiter" },
  { name: "Capricorn", symbol: "♑", dates: "Dec 22–Jan 19", element: "Earth", ruling: "Saturn" },
  { name: "Aquarius", symbol: "♒", dates: "Jan 20–Feb 18", element: "Air", ruling: "Uranus" },
  { name: "Pisces", symbol: "♓", dates: "Feb 19–Mar 20", element: "Water", ruling: "Neptune" },
];
const EL = { Fire: "#ff6b35", Earth: "#7fa16a", Water: "#5ba4cf", Air: "#c9a84c" };
const TONES = [
  { id: "playful", label: "✨ Playful", desc: "Witty & fun", free: true },
  { id: "serious", label: "🔮 Serious", desc: "Deep & honest", free: true },
  { id: "savage", label: "🔥 Savage", desc: "No filter", free: false },
  { id: "therapist", label: "💆 Therapist", desc: "Warm & healing", free: false },
];
const PREMIUM_FEATURES = [
  "🔥 Savage mode — zero-filter cosmic truth",
  "💆 Therapist mode — deep healing verdicts",
  "🙏 Who Apologizes First predictions",
  "🌙 Weekly couple's horoscope",
  "📜 Unlimited verdict history",
  "🖼️ Beautiful shareable image cards",
];

// ─── Storage helpers ──────────────────────────────────────────────────────────
async function loadStorage(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function saveStorage(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

// ─── Compatibility ────────────────────────────────────────────────────────────
function getCompatibility(s1, s2) {
  const comp = { Fire: "Air", Air: "Fire", Earth: "Water", Water: "Earth" };
  const hard = { Fire: "Water", Water: "Fire", Earth: "Air", Air: "Earth" };
  if (s1.element === s2.element) return { score: 82 + Math.floor(Math.random() * 12), label: "Kindred Spirits", color: "#7fa16a" };
  if (comp[s1.element] === s2.element) return { score: 74 + Math.floor(Math.random() * 16), label: "Magnetic Tension", color: "#c9a84c" };
  if (hard[s1.element] === s2.element) return { score: 48 + Math.floor(Math.random() * 22), label: "Growth Catalyst", color: "#ff6b35" };
  return { score: 60 + Math.floor(Math.random() * 20), label: "Complex Chemistry", color: "#5ba4cf" };
}

// ───────────────── Canvas Share Card ──────────────────────────────────────────────────────────────
function drawShareCard(canvas, { verdict, p1, p2, p1color, p2color, compat }) {
  const W = 1080, H = 1080;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#08060f";
  ctx.fillRect(0, 0, W, H);

  // Starfield
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    const r = Math.random() * 1.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,220,${0.2 + Math.random() * 0.5})`; ctx.fill();
  }

  // Gradient orb top
  const g1 = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 600);
  g1.addColorStop(0, "rgba(180,100,20,0.35)"); g1.addColorStop(1, "transparent");
  ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

  // Gradient orb bottom
  const g2 = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, 500);
  g2.addColorStop(0, "rgba(60,40,120,0.3)"); g2.addColorStop(1, "transparent");
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = "rgba(201,133,58,0.4)"; ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = "rgba(201,133,58,0.15)"; ctx.lineWidth = 1;
  ctx.strokeRect(52, 52, W - 104, H - 104);

  // Header label
  ctx.fillStyle = "#c9853a"; ctx.font = "500 26px Georgia";
  ctx.textAlign = "center"; ctx.letterSpacing = "6px";
  ctx.fillText("COSMIC COURT VERDICT", W / 2, 130);

  // Divider line
  ctx.strokeStyle = "rgba(201,133,58,0.3)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(160, 155); ctx.lineTo(W - 160, 155); ctx.stroke();

  // Partners
  ctx.font = "bold 52px Georgia"; ctx.textAlign = "left";
  ctx.fillStyle = p1color; ctx.fillText(`${p1.sign.symbol} ${p1.name}`, 100, 240);
  ctx.fillStyle = "rgba(255,255,220,0.3)"; ctx.font = "400 40px Georgia";
  ctx.textAlign = "center"; ctx.fillText("vs", W / 2, 240);
  ctx.font = "bold 52px Georgia"; ctx.textAlign = "right";
  ctx.fillStyle = p2color; ctx.fillText(`${p2.name} ${p2.sign.symbol}`, W - 100, 240);

  // Signs subtitle
  ctx.font = "italic 28px Georgia"; ctx.textAlign = "left";
  ctx.fillStyle = p1color + "aa"; ctx.fillText(p1.sign.name, 100, 285);
  ctx.textAlign = "right"; ctx.fillStyle = p2color + "aa";
  ctx.fillText(p2.sign.name, W - 100, 285);

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(100, 315); ctx.lineTo(W - 100, 315); ctx.stroke();

  // Score bar
  const s1 = verdict.partner1_score ?? 50, s2 = verdict.partner2_score ?? 50;
  const total = s1 + s2 || 100;
  const barX = 100, barY = 350, barW = W - 200, barH = 32, barR = 16;

  // Bar background
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  roundRect(ctx, barX, barY, barW, barH, barR); ctx.fill();

  // P1 bar
  const p1w = (s1 / total) * barW;
  const grad1 = ctx.createLinearGradient(barX, 0, barX + p1w, 0);
  grad1.addColorStop(0, p1color + "88"); grad1.addColorStop(1, p1color);
  ctx.fillStyle = grad1;
  roundRect(ctx, barX, barY, p1w - 2, barH, { tl: barR, tr: 4, br: 4, bl: barR }); ctx.fill();

  // P2 bar
  const p2x = barX + p1w + 2, p2w = (s2 / total) * barW - 2;
  const grad2 = ctx.createLinearGradient(p2x, 0, p2x + p2w, 0);
  grad2.addColorStop(0, p2color); grad2.addColorStop(1, p2color + "88");
  ctx.fillStyle = grad2;
  roundRect(ctx, p2x, barY, p2w, barH, { tl: 4, tr: barR, br: barR, bl: 4 }); ctx.fill();

  // Score labels
  ctx.font = "bold 26px Georgia"; ctx.fillStyle = "#fff"; ctx.textAlign = "left";
  ctx.fillText(`${s1}%`, barX + 14, barY + 22);
  ctx.textAlign = "right"; ctx.fillText(`${s2}%`, barX + barW - 14, barY + 22);

  // Compat
  if (compat) {
    ctx.font = "italic 26px Georgia"; ctx.textAlign = "center";
    ctx.fillStyle = compat.color;
    ctx.fillText(`${compat.label}  · ${compat.score}% Compatible`, W / 2, 420);
  }

  // Headline box
  ctx.fillStyle = "rgba(201,133,58,0.1)";
  roundRect(ctx, 80, 450, W - 160, 200, 20); ctx.fill();
  ctx.strokeStyle = "rgba(201,133,58,0.3)"; ctx.lineWidth = 1.5;
  roundRect(ctx, 80, 450, W - 160, 200, 20); ctx.stroke();

  ctx.fillStyle = "#f0e8d5"; ctx.textAlign = "center";
  const lines = wrapText(ctx, `"${verdict.headline}"`, W - 220, "italic 36px Georgia");
  lines.forEach((line, i) => {
    ctx.font = "italic 36px Georgia";
    ctx.fillText(line, W / 2, 520 + i * 52);
  });

  // Apology
  if (verdict.apologizes_first) {
    ctx.fillStyle = "rgba(140,110,220,0.15)";
    roundRect(ctx, 80, 675, W - 160, 110, 16); ctx.fill();
    ctx.strokeStyle = "rgba(140,110,220,0.35)"; ctx.lineWidth = 1;
    roundRect(ctx, 80, 675, W - 160, 110, 16); ctx.stroke();
    ctx.font = "24px Georgia"; ctx.fillStyle = "#8a7a9a"; ctx.textAlign = "center";
    ctx.fillText("🙏  WHO APOLOGIZES FIRST", W / 2, 710);
    ctx.font = "italic bold 38px Georgia"; ctx.fillStyle = "#c9b0f0";
    ctx.fillText(verdict.apologizes_first, W / 2, 760);
  }

  // Resolution snippet
  ctx.fillStyle = "rgba(80,160,120,0.12)";
  roundRect(ctx, 80, 810, W - 160, 160, 16); ctx.fill();
  ctx.strokeStyle = "rgba(80,180,140,0.28)"; ctx.lineWidth = 1;
  roundRect(ctx, 80, 810, W - 160, 160, 16); ctx.stroke();
  ctx.font = "22px Georgia"; ctx.fillStyle = "#7a6a50"; ctx.textAlign = "left";
  ctx.fillText("✨  PATH TO PEACE", 110, 845);
  const resLines = wrapText(ctx, verdict.resolution, W - 240, "italic 28px Georgia").slice(0, 3);
  resLines.forEach((line, i) => {
    ctx.font = "italic 28px Georgia"; ctx.fillStyle = "#d4c4a0";
    ctx.fillText(line, 110, 885 + i * 38);
  });

  // Footer
  ctx.strokeStyle = "rgba(201,133,58,0.2)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(160, 998); ctx.lineTo(W - 160, 998); ctx.stroke();
  ctx.font = "22px Georgia"; ctx.fillStyle = "#5a4a3a"; ctx.textAlign = "center";
  ctx.fillText("cosmic-court.app  ✨  Powered by the Stars", W / 2, 1030);
}

function roundRect(ctx, x, y, w, h, r) {
  if (typeof r === "number") r = { tl: r, tr: r, br: r, bl: r };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y); ctx.arcTo(x + w, y, x + w, y + r.tr, r.tr);
  ctx.lineTo(x + w, y + h - r.br); ctx.arcTo(x + w, y + h, x + w - r.br, y + h, r.br);
  ctx.lineTo(x + r.bl, y + h); ctx.arcTo(x, y + h, x, y + h - r.bl, r.bl);
  ctx.lineTo(x, y + r.tl); ctx.arcTo(x, y, x + r.tl, y, r.tl);
  ctx.closePath();
}

function wrapText(ctx, text, maxW, font) {
  ctx.font = font;
  const words = text.split(" "); const lines = []; let cur = "";
  for (const word of words) {
    const test = cur ? cur + " " + word : word;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = word; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// ───────────────── Main App ──────────────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [step, setStep] = useState(0);
  const [p1, setP1] = useState({ name: "", sign: null });
  const [p2, setP2] = useState({ name: "", sign: null });
  const [dispute, setDispute] = useState("");
  const [tone, setTone] = useState("playful");
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [compat, setCompat] = useState(null);
  const [selectingFor, setSelectingFor] = useState(null);
  const [history, setHistory] = useState([]);
  const [horoscope, setHoroscope] = useState(null);
  const [horoscopeLoading, setHoroscopeLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareGenerated, setShareGenerated] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadStorage("cosmic-court-history").then(h => h && setHistory(h));
    loadStorage("cosmic-court-pro").then(v => v && setIsPro(true));
    // Handle return from Stripe checkout
    const params = new URLSearchParams(window.location.search);
    if (params.get("pro") === "true") {
      setIsPro(true);
      saveStorage("cosmic-court-pro", true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const p1color = p1.sign ? EL[p1.sign.element] : "#c9a84c";
  const p2color = p2.sign ? EL[p2.sign.element] : "#c9a84c";

  useEffect(() => {
    if (p1.sign && p2.sign) setCompat(getCompatibility(p1.sign, p2.sign));
    else setCompat(null);
  }, [p1.sign, p2.sign]);

  const requirePro = (reason, cb) => {
    if (isPro) { cb(); return; }
    setUpgradeReason(reason); setShowUpgrade(true);
  };

  const activatePro = async () => {
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      // Fallback: grant access locally (dev mode)
      setIsPro(true); saveStorage("cosmic-court-pro", true); setShowUpgrade(false);
    }
  };

  const callAI = async () => {
    const selectedTone = TONES.find(t => t.id === tone);
    if (!selectedTone.free && !isPro) {
      setUpgradeReason(`${selectedTone.label} mode is a Cosmic Pro feature`);
      setShowUpgrade(true); return;
    }
    setLoading(true); setStep(3);
    const toneMap = {
      playful: "witty, fun, and a little teasing — like a clever best friend",
      serious: "deep, empathetic, and psychologically grounded",
      savage: "brutally honest, no-filter, comedically savage but ultimately fair",
      therapist: "warm, healing, and compassionate like a skilled couples therapist",
    };
    try {
      const includeApology = isPro;
      const prompt = `You are a mystical relationship counselor. Your tone is: ${toneMap[tone]}.

Partner 1: ${p1.name} (${p1.sign.name}, ${p1.sign.element}, ruled by ${p1.sign.ruling})
Partner 2: ${p2.name} (${p2.sign.name}, ${p2.sign.element}, ruled by ${p2.sign.ruling})
Dispute: "${dispute}"

Respond ONLY with a JSON object (no markdown, no backticks):
{
  "headline": "One punchy verdict sentence",
  "partner1_score": 0-100,
  "partner2_score": 0-100,
  "cosmic_analysis": "2-3 sentences on the astrological dynamic at play",
  "partner1_insight": "One cheeky sentence about ${p1.name}'s ${p1.sign.name} nature in this conflict",
  "partner2_insight": "One cheeky sentence about ${p2.name}'s ${p2.sign.name} nature in this conflict",
  "resolution": "2-3 actionable sign-specific sentences to resolve this",
  "cosmic_warning": "One playful warning if unresolved"${includeApology ? `,
  "apologizes_first": "either '${p1.name}' or '${p2.name}' — just the name",
  "apologize_reason": "One sentence explaining why that sign will cave first"` : ""}
}`;
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const parsed = JSON.parse(data.content.map(i => i.text || "").join("").replace(/```json|```/g, "").trim());
      setVerdict(parsed);
      const entry = {
        id: Date.now(), date: new Date().toLocaleDateString(),
        p1: { name: p1.name, sign: p1.sign.name, symbol: p1.sign.symbol },
        p2: { name: p2.name, sign: p2.sign.name, symbol: p2.sign.symbol },
        dispute: dispute.slice(0, 80) + (dispute.length > 80 ? "…" : ""),
        headline: parsed.headline, p1score: parsed.partner1_score, p2score: parsed.partner2_score, tone,
      };
      const newHistory = [entry, ...history].slice(0, isPro ? 50 : 5);
      setHistory(newHistory); saveStorage("cosmic-court-history", newHistory);
    } catch { setVerdict({ error: true }); }
    setLoading(false);
  };

  const loadHoroscope = () => requirePro("Weekly horoscope is a Cosmic Pro feature", async () => {
    if (!p1.sign || !p2.sign) return;
    setHoroscopeLoading(true);
    try {
      const prompt = `Generate a playful weekly relationship horoscope for a couple.
Sign 1: ${p1.sign.name} (${p1.sign.element}, ruled by ${p1.sign.ruling})
Sign 2: ${p2.sign.name} (${p2.sign.element}, ruled by ${p2.sign.ruling})
Respond ONLY with JSON (no markdown):
{"title":"catchy title","overview":"2 sentences","challenge":"one sentence","opportunity":"one sentence","ritual":"one specific activity","lucky_day":"day of week","vibe":"3-word vibe"}`;
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      setHoroscope(JSON.parse(data.content.map(i => i.text || "").join("").replace(/```json|```/g, "").trim()));
    } catch { setHoroscope({ error: true }); }
    setHoroscopeLoading(false);
  });

  const openShareCard = () => requirePro("Shareable image cards are a Cosmic Pro feature", () => {
    setShowShareCard(true); setShareGenerated(false);
    setTimeout(() => {
      if (canvasRef.current && verdict) {
        drawShareCard(canvasRef.current, { verdict, p1, p2, p1color, p2color, compat });
        setShareGenerated(true);
      }
    }, 100);
  });

  const downloadCard = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.download = "cosmic-court-verdict.png";
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  const reset = () => { setStep(0); setVerdict(null); setDispute(""); setTone("playful"); setShareGenerated(false); };
  const fullReset = () => { reset(); setP1({ name: "", sign: null }); setP2({ name: "", sign: null }); setCompat(null); };

  return (
    <div style={{ minHeight: "100vh", background: "#08060f", fontFamily: "Georgia, serif", color: "#f0e8d5", overflowX: "hidden" }}>
      {/* Stars bg */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: Array.from({ length: 16 }, (_, i) =>
          `radial-gradient(${i % 3 === 0 ? "1.5" : "1"}px ${i % 3 === 0 ? "1.5" : "1"}px at ${6 + i * 6}% ${8 + (i * 37 % 82)}%, rgba(255,255,220,${0.25 + (i % 3) * 0.15}) 0%, transparent 100%)`
        ).join(","),
      }} />

      {/* Upgrade modal */}
      {showUpgrade && <UpgradeModal reason={upgradeReason} onClose={() => setShowUpgrade(false)} onActivate={activatePro} />}

      {/* Share card modal */}
      {showShareCard && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(4,3,10,0.97)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#7a6a50", textTransform: "uppercase", marginBottom: 16 }}>Your Share Card</div>
          <div style={{ width: "100%", maxWidth: 420, aspectRatio: "1/1", background: "#08060f", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(201,133,58,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!shareGenerated && <div style={{ color: "#5a4a3a", fontStyle: "italic" }}>Rendering…</div>}
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: shareGenerated ? "block" : "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, width: "100%", maxWidth: 420 }}>
            <button onClick={() => setShowShareCard(false)} style={{ ...btn("rgba(255,255,255,0.07)", true), flex: 1 }}>← Back</button>
            <button onClick={downloadCard} style={{ ...btn("#c9853a"), flex: 2 }}>⬇ Download Image</button>
          </div>
          <p style={{ fontSize: 12, color: "#3a2a1a", marginTop: 10, fontStyle: "italic" }}>Save and share on Instagram, TikTok, or anywhere</p>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "0 18px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", padding: "40px 0 18px" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 10, letterSpacing: 6, color: "#7a6a50", textTransform: "uppercase" }}>Celestial Arbitration</div>
            {isPro && <span style={{ fontSize: 10, background: "linear-gradient(135deg,#f5d878,#e8952a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 2, fontWeight: 700 }}>✨ PRO</span>}
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem,7vw,3.4rem)", fontWeight: 400, margin: "0 0 4px", lineHeight: 1, background: "linear-gradient(135deg, #f5d878 0%, #e8952a 55%, #c06020 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1px" }}>
            Cosmic Court
          </h1>
          <p style={{ color: "#7a6a50", fontSize: 14, margin: "0 0 20px", fontStyle: "italic" }}>Let the stars settle your disputes</p>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,200,100,0.12)", borderRadius: 50, padding: 4, gap: 2 }}>
              {[["home", "⚖️ Court"], ["horoscope", "🌙 Weekly"], ["history", "📝 History"]].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} style={{
                  background: tab === id ? "rgba(201,133,58,0.3)" : "transparent",
                  border: tab === id ? "1px solid rgba(201,133,58,0.4)" : "1px solid transparent",
                  borderRadius: 50, padding: "7px 14px", color: tab === id ? "#f0d090" : "#7a6a50",
                  fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif", transition: "all 0.2s",
                }}>{label}</button>
              ))}
            </div>
            {!isPro && (
              <button onClick={() => { setUpgradeReason("Unlock the full cosmic experience"); setShowUpgrade(true); }} style={{
                background: "linear-gradient(135deg,rgba(245,216,120,0.15),rgba(232,149,42,0.15))",
                border: "1px solid rgba(245,216,120,0.3)", borderRadius: 50, padding: "8px 16px",
                color: "#f0d090", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif",
              }}>✨ Go Pro</button>
            )}
          </div>
        </div>

        {/* HOME */}
        {tab === "home" && (
          <>
            {selectingFor !== null && <ZodiacPicker onSelect={sign => { if (selectingFor === 1) setP1(p => ({ ...p, sign })); else setP2(p => ({ ...p, sign })); setSelectingFor(null); }} onClose={() => setSelectingFor(null)} />}

            {step === 0 && (
              <div style={{ animation: "fadeIn 0.5s ease", textAlign: "center" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.12)", borderRadius: 20, padding: "36px 28px", marginBottom: 16 }}>
                  <div style={{ fontSize: 54, marginBottom: 16 }}>⚖️✨</div>
                  <p style={{ fontSize: 16, lineHeight: 1.75, color: "#d4c4a0", maxWidth: 400, margin: "0 auto 24px" }}>
                    Every couple fights. But not every couple has the cosmos on their side. Enter your signs, pick a vibe, and receive a celestially-informed verdict.
                  </p>
                  <button onClick={() => setStep(1)} style={btn("#c9853a")}>Begin the Hearing →</button>
                </div>
                {!isPro && <ProTeaser onUpgrade={() => { setUpgradeReason("Unlock the full cosmic experience"); setShowUpgrade(true); }} />}
              </div>
            )}

            {step === 1 && (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  {[[p1, setP1, 1, p1color], [p2, setP2, 2, p2color]].map(([partner, setPartner, num, color]) => (
                    <div key={num} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}28`, borderRadius: 16, padding: "18px 14px" }}>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a6a50", textTransform: "uppercase", marginBottom: 12 }}>Partner {num}</div>
                      <input value={partner.name} onChange={e => setPartner(p => ({ ...p, name: e.target.value }))} placeholder="Name" style={inputSt} />
                      <button onClick={() => setSelectingFor(num)} style={{ width: "100%", background: partner.sign ? `${color}18` : "rgba(255,255,255,0.04)", border: `1px solid ${partner.sign ? color + "55" : "rgba(255,200,100,0.14)"}`, borderRadius: 10, padding: "11px 8px", color: partner.sign ? color : "#7a6a50", fontSize: partner.sign ? 18 : 12, cursor: "pointer", fontFamily: "Georgia, serif", transition: "all 0.2s", textAlign: "center", lineHeight: 1.3 }}>
                        {partner.sign ? <><div>{partner.sign.symbol} {partner.sign.name}</div><div style={{ fontSize: 10, opacity: 0.8 }}>{partner.sign.element}</div></> : "Choose Sign ✨"}
                      </button>
                    </div>
                  ))}
                </div>

                {compat && (
                  <div style={{ background: `${compat.color}12`, border: `1px solid ${compat.color}35`, borderRadius: 14, padding: "14px 18px", marginBottom: 14, animation: "fadeIn 0.4s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                      <span style={{ fontSize: 10, letterSpacing: 3, color: "#7a6a50", textTransform: "uppercase" }}>Compatibility</span>
                      <span style={{ color: compat.color, fontSize: 13, fontStyle: "italic" }}>{compat.label}</span>
                    </div>
                    <div style={{ height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${compat.score}%`, background: `linear-gradient(90deg,${compat.color}80,${compat.color})`, borderRadius: 4, transition: "width 1.2s ease" }} />
                    </div>
                    <div style={{ textAlign: "right", fontSize: 12, color: compat.color, marginTop: 4 }}>{compat.score}%</div>
                  </div>
                )}

                {/* Tone selector */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.1)", borderRadius: 14, padding: "16px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a6a50", textTransform: "uppercase", marginBottom: 10 }}>Verdict Tone</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {TONES.map(t => {
                      const locked = !t.free && !isPro;
                      return (
                        <button key={t.id} onClick={() => locked ? (setUpgradeReason(`${t.label} mode is a Cosmic Pro feature`), setShowUpgrade(true)) : setTone(t.id)} style={{
                          background: tone === t.id ? "rgba(201,133,58,0.22)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${tone === t.id ? "rgba(201,133,58,0.5)" : "rgba(255,200,100,0.1)"}`,
                          borderRadius: 10, padding: "10px 6px", cursor: "pointer", fontFamily: "Georgia, serif",
                          textAlign: "center", transition: "all 0.2s", opacity: locked ? 0.7 : 1, position: "relative",
                        }}>
                          <div style={{ fontSize: 16 }}>{t.label.split(" ")[0]}</div>
                          <div style={{ fontSize: 11, color: tone === t.id ? "#f0d090" : "#7a6a50", marginTop: 3 }}>{t.label.split(" ").slice(1).join(" ")}</div>
                          <div style={{ fontSize: 10, color: "#4a3a2a", marginTop: 2 }}>{t.desc}</div>
                          {locked && <div style={{ position: "absolute", top: 4, right: 6, fontSize: 9, color: "#c9a84c" }}>PRO</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.1)", borderRadius: 14, padding: "16px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a6a50", textTransform: "uppercase", marginBottom: 10 }}>The Dispute</div>
                  <textarea value={dispute} onChange={e => setDispute(e.target.value)} placeholder="Describe what you're fighting about…" rows={4} style={{ ...inputSt, resize: "vertical", lineHeight: 1.6 }} />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(0)} style={{ ...btn("rgba(255,255,255,0.07)", true), padding: "12px 20px" }}>← Back</button>
                  <button onClick={callAI} disabled={!p1.name || !p1.sign || !p2.name || !p2.sign || dispute.length < 8}
                    style={{ ...btn("#c9853a"), flex: 1, opacity: (!p1.name || !p1.sign || !p2.name || !p2.sign || dispute.length < 8) ? 0.38 : 1 }}>
                    Summon the Verdict ✨
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <div style={{ fontSize: 48, animation: "spin 3s linear infinite", display: "inline-block" }}>☿</div>
                    <p style={{ color: "#7a6a50", fontStyle: "italic", marginTop: 16 }}>Consulting the celestial archives…</p>
                  </div>
                ) : verdict?.error ? (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <p style={{ color: "#ff6b6b" }}>The stars went silent. Try again.</p>
                    <button onClick={reset} style={btn("#c9853a")}>Retry</button>
                  </div>
                ) : verdict ? (
                  <VerdictDisplay verdict={verdict} p1={p1} p2={p2} p1color={p1color} p2color={p2color}
                    compat={compat} tone={tone} isPro={isPro}
                    onShare={openShareCard}
                    onUpgrade={(reason) => { setUpgradeReason(reason); setShowUpgrade(true); }}
                    onNewDispute={reset} onFullReset={fullReset} />
                ) : null}
              </div>
            )}
          </>
        )}

        {/* HOROSCOPE */}
        {tab === "horoscope" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            {selectingFor !== null && <ZodiacPicker onSelect={sign => { if (selectingFor === 1) setP1(p => ({ ...p, sign })); else setP2(p => ({ ...p, sign })); setSelectingFor(null); }} onClose={() => setSelectingFor(null)} />}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.12)", borderRadius: 18, padding: "28px 22px" }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🌙</div>
                <div style={{ fontSize: 11, letterSpacing: 4, color: "#7a6a50", textTransform: "uppercase" }}>Weekly Couple's Horoscope</div>
                {!isPro && <div style={{ marginTop: 8, fontSize: 12, color: "#c9a84c", fontStyle: "italic" }}>✨ Cosmic Pro feature</div>}
              </div>
              {(!p1.sign || !p2.sign) ? (
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#7a6a50", fontStyle: "italic", marginBottom: 18, fontSize: 14 }}>Set both signs to receive your weekly forecast</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    {[[p1, 1, p1color], [p2, 2, p2color]].map(([partner, num, color]) => (
                      <button key={num} onClick={() => setSelectingFor(num)} style={{ background: partner.sign ? `${color}18` : "rgba(255,255,255,0.04)", border: `1px solid ${partner.sign ? color + "50" : "rgba(255,200,100,0.14)"}`, borderRadius: 12, padding: "16px", cursor: "pointer", fontFamily: "Georgia, serif", color: partner.sign ? color : "#7a6a50", fontSize: partner.sign ? 16 : 12, textAlign: "center" }}>
                        {partner.sign ? `${partner.sign.symbol} ${partner.sign.name}` : `Partner ${num} Sign ✨`}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 18 }}>
                    <span style={{ color: p1color }}>{p1.sign.symbol} {p1.sign.name}</span>
                    <span style={{ color: "#4a3a2a" }}>✨</span>
                    <span style={{ color: p2color }}>{p2.sign.symbol} {p2.sign.name}</span>
                  </div>
                  {!horoscope && !horoscopeLoading && (
                    <button onClick={loadHoroscope} style={{ ...btn(isPro ? "#5ba4cf" : "#c9853a"), width: "100%" }}>
                      {isPro ? "✨ Generate This Week's Forecast" : "✨ Unlock Weekly Horoscope (Pro)"}
                    </button>
                  )}
                  {horoscopeLoading && <div style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 36, animation: "spin 4s linear infinite", display: "inline-block" }}>🌙</div><p style={{ color: "#7a6a50", fontStyle: "italic", marginTop: 12 }}>Reading the celestial tides…</p></div>}
                  {horoscope && !horoscope.error && (
                    <div style={{ animation: "fadeIn 0.5s ease" }}>
                      <div style={{ textAlign: "center", marginBottom: 18 }}>
                        <div style={{ fontSize: "clamp(1rem,4vw,1.3rem)", color: "#f0d090", fontStyle: "italic", marginBottom: 5 }}>{horoscope.title}</div>
                        <div style={{ fontSize: 11, color: "#7a6a50", letterSpacing: 2 }}>{horoscope.vibe?.toUpperCase()}</div>
                      </div>
                      <SCard title="🌟 This Week" color="rgba(180,150,80,0.12)" bc="rgba(180,150,80,0.25)"><p style={{ color: "#d4c4a0", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{horoscope.overview}</p></SCard>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "12px 0" }}>
                        <SCard title="⚡ Watch Out" color="rgba(255,100,50,0.1)" bc="rgba(255,100,50,0.25)"><p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 13 }}>{horoscope.challenge}</p></SCard>
                        <SCard title="✨ Opportunity" color="rgba(80,180,120,0.1)" bc="rgba(80,180,120,0.25)"><p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 13 }}>{horoscope.opportunity}</p></SCard>
                      </div>
                      <SCard title="💫 Ritual for Two" color="rgba(90,140,210,0.1)" bc="rgba(90,140,210,0.25)"><p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 14 }}>{horoscope.ritual}</p></SCard>
                      <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#7a6a50" }}>Lucky day: <span style={{ color: "#c9a84c" }}>{horoscope.lucky_day}</span></div>
                      <button onClick={() => { setHoroscope(null); loadHoroscope(); }} style={{ ...btn("rgba(255,255,255,0.07)", true), width: "100%", marginTop: 14 }}>↻ Regenerate</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#7a6a50", textTransform: "uppercase" }}>
                Past Verdicts {!isPro && <span style={{ color: "#4a3a2a", fontSize: 10 }}>(last 5 — Pro saves 50)</span>}
              </div>
              {history.length > 0 && <button onClick={() => { setHistory([]); saveStorage("cosmic-court-history", []); }} style={{ fontSize: 11, color: "#4a3a2a", background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif" }}>Clear All</button>}
            </div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#3a2a1a", fontStyle: "italic" }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>📝</div>
                No verdicts yet. Bring your disputes to the court.
              </div>
            ) : history.map(entry => (
              <div key={entry.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.1)", borderRadius: 14, padding: "16px 18px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 14, color: "#d4c4a0" }}>{entry.p1.symbol} {entry.p1.name} vs {entry.p2.symbol} {entry.p2.name}</span>
                  <span style={{ fontSize: 11, color: "#3a2a1a" }}>{entry.date}</span>
                </div>
                <p style={{ fontSize: 13, color: "#6a5a4a", fontStyle: "italic", margin: "0 0 7px", lineHeight: 1.5 }}""{entry.dispute}"</p>
                <p style={{ fontSize: 13, color: "#c9a84c", margin: "0 0 9px", lineHeight: 1.4 }}""{entry.headline}"</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#6a5a4a", background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "3px 10px" }}>{entry.p1.name}: {entry.p1score}%</span>
                  <span style={{ fontSize: 11, color: "#6a5a4a", background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "3px 10px" }}>{entry.p2.name}: {entry.p2score}%</span>
                  <span style={{ fontSize: 11, color: "#3a2a1a", background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "3px 10px", marginLeft: "auto" }}>{entry.tone}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%,100%{opacity:.6}50%{opacity:1} }
        * { box-sizing:border-box; }
        textarea,input { outline:none; }
        textarea::placeholder,input::placeholder { color:#3a2818; }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,200,100,.15);border-radius:2px}
      `}</style>
    </div>
  );
}

// ───────────────── Upgrade Modal ──────────────────────────────────────────────────────────────────────────────────
function UpgradeModal({ reason, onClose, onActivate }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(4,3,10,0.97)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0e0b1a", border: "1px solid rgba(245,216,120,0.25)", borderRadius: 24, padding: "36px 28px", width: "100%", maxWidth: 440, textAlign: "center", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>✨</div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#c9a84c", textTransform: "uppercase", marginBottom: 10 }}>Cosmic Pro</div>
        <h2 style={{ fontSize: "clamp(1.3rem,5vw,1.7rem)", fontWeight: 400, margin: "0 0 8px", background: "linear-gradient(135deg,#f5d878,#e8952a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Unlock the Full Experience
        </h2>
        <p style={{ fontSize: 14, color: "#7a6a50", fontStyle: "italic", marginBottom: 24 }}>{reason}</p>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.1)", borderRadius: 14, padding: "20px 18px", marginBottom: 24, textAlign: "left" }}>
          {PREMIUM_FEATURES.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < PREMIUM_FEATURES.length - 1 ? 12 : 0 }}>
              <span style={{ fontSize: 15 }}>{f.split(" ")[0]}</span>
              <span style={{ fontSize: 14, color: "#d4c4a0" }}>{f.split(" ").slice(1).join(" ")}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "linear-gradient(135deg,rgba(245,216,120,0.12),rgba(232,149,42,0.1))", border: "1px solid rgba(245,216,120,0.2)", borderRadius: 14, padding: "16px", marginBottom: 20 }}>
          <div style={{ fontSize: "clamp(1.6rem,6vw,2.2rem)", fontWeight: 400, background: "linear-gradient(135deg,#f5d878,#e8952a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>$5.99</div>
          <div style={{ fontSize: 12, color: "#7a6a50" }}>/ month · Cancel anytime</div>
        </div>

        <button onClick={onActivate} style={{ ...btn("#c9853a"), width: "100%", fontSize: 16, padding: "14px", marginBottom: 10 }}>
          ✨ Activate Cosmic Pro
        </button>
        <button onClick={onClose} style={{ ...btn("rgba(255,255,255,0.05)", true), width: "100%", fontSize: 13 }}>
          Continue with Free
        </button>
        <p style={{ fontSize: 11, color: "#3a2a1a", marginTop: 12, fontStyle: "italic" }}>
          Demo: clicking "Activate" grants Pro access instantly
        </p>
      </div>
    </div>
  );
}

// ───────────────── Pro Teaser ──────────────────────────────────────────────────────────────────────────────────
function ProTeaser({ onUpgrade }) {
  return (
    <div style={{ background: "linear-gradient(135deg,rgba(245,216,120,0.07),rgba(180,70,20,0.06))", border: "1px solid rgba(245,216,120,0.18)", borderRadius: 16, padding: "20px 22px", marginTop: 0, textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#c9a84c", textTransform: "uppercase" }}>Cosmic Pro</div>
        <div style={{ fontSize: 13, color: "#7a6a50" }}>$5.99/mo</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {PREMIUM_FEATURES.slice(0, 4).map((f, i) => (
          <div key={i} style={{ fontSize: 12, color: "#7a6a50", display: "flex", gap: 6 }}>
            <span>{f.split(" ")[0]}</span>
            <span style={{ color: "#5a4a3a" }}>{f.split(" ").slice(1).join(" ")}</span>
          </div>
        ))}
      </div>
      <button onClick={onUpgrade} style={{ ...btn("#c9853a"), width: "100%", fontSize: 13 }}>✨ Unlock Cosmic Pro</button>
    </div>
  );
}

// ───────────────── Verdict Display ──────────────────────────────────────────────────────────────────────────────────
function VerdictDisplay({ verdict, p1, p2, p1color, p2color, compat, tone, isPro, onShare, onUpgrade, onNewDispute, onFullReset }) {
  const s1 = verdict.partner1_score ?? 50, s2 = verdict.partner2_score ?? 50, total = s1 + s2 || 100;
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,rgba(201,133,58,0.18) 0%,rgba(180,70,20,0.1) 100%)", border: "1px solid rgba(201,133,58,0.4)", borderRadius: 18, padding: "24px 22px", textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#c9853a", textTransform: "uppercase", marginBottom: 10 }}>The Cosmic Verdict</div>
        <p style={{ fontSize: "clamp(1rem,3.5vw,1.15rem)", lineHeight: 1.55, margin: "0 0 10px", color: "#f0e8d5", fontStyle: "italic" }}""{verdict.headline}"</p>
        <div style={{ fontSize: 11, color: "#5a4a3a", letterSpacing: 2 }}>{tone.toUpperCase()} · {p1.sign.symbol} {p1.sign.name} × {p2.sign.symbol} {p2.sign.name}</div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.1)", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
          <span style={{ color: p1color, fontWeight: 600 }}>{p1.name} {p1.sign.symbol}</span>
          <span style={{ color: "#4a3a2a", fontSize: 11 }}>Rightness</span>
          <span style={{ color: p2color, fontWeight: 600 }}>{p2.sign.symbol} {p2.name}</span>
        </div>
        <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", gap: 2 }}>
          <div style={{ width: `${(s1 / total) * 100}%`, background: `linear-gradient(90deg,${p1color}80,${p1color})`, borderRadius: "8px 0 0 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", fontWeight: 700, transition: "width 1s ease" }}>{s1 > 22 ? `${s1}%` : ""}</div>
          <div style={{ width: `${(s2 / total) * 100}%`, background: `linear-gradient(90deg,${p2color},${p2color}80)`, borderRadius: "0 8px 8px 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", fontWeight: 700, transition: "width 1s ease" }}>{s2 > 22 ? `${s2}%` : ""}</div>
        </div>
        {compat && <div style={{ marginTop: 9, textAlign: "center", fontSize: 12 }}><span style={{ color: "#4a3a2a" }}>Compatibility: </span><span style={{ color: compat.color }}>{compat.label} · {compat.score}%</span></div>}
      </div>

      <SCard title="☿ Cosmic Dynamic" color="rgba(180,150,80,0.13)" bc="rgba(180,150,80,0.28)">
        <p style={{ color: "#d4c4a0", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{verdict.cosmic_analysis}</p>
      </SCard>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "12px 0" }}>
        <SCard title={`${p1.sign.symbol} ${p1.name}`} color={`${p1color}12`} bc={`${p1color}32`}><p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 13 }}>{verdict.partner1_insight}</p></SCard>
        <SCard title={`${p2.sign.symbol} ${p2.name}`} color={`${p2color}12`} bc={`${p2color}32`}><p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 13 }}>{verdict.partner2_insight}</p></SCard>
      </div>

      {/* Who apologizes — gated */}
      {isPro && verdict.apologizes_first ? (
        <div style={{ background: "linear-gradient(135deg,rgba(100,80,180,0.14),rgba(60,50,120,0.1))", border: "1px solid rgba(140,110,220,0.28)", borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#8a7a9a", textTransform: "uppercase", marginBottom: 10 }}>🙏 Who Apologizes First</div>
          <div style={{ fontSize: "clamp(1rem,4vw,1.2rem)", color: "#c9b0f0", fontStyle: "italic", marginBottom: 8 }}>{verdict.apologizes_first}</div>
          <p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 14 }}>{verdict.apologize_reason}</p>
        </div>
      ) : !isPro && (
        <button onClick={() => onUpgrade("Unlock 'Who Apologizes First' predictions with Cosmic Pro")} style={{ width: "100%", background: "rgba(140,110,220,0.08)", border: "1px dashed rgba(140,110,220,0.3)", borderRadius: 14, padding: "18px 20px", cursor: "pointer", marginBottom: 12, fontFamily: "Georgia, serif", textAlign: "left" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#6a5a7a", textTransform: "uppercase", marginBottom: 8 }}>🙏 Who Apologizes First</div>
          <div style={{ fontSize: 14, color: "#5a4a6a", fontStyle: "italic" }}>Unlock with Cosmic Pro ✨</div>
        </button>
      )}

      <SCard title="✨ Path to Peace" color="rgba(80,160,120,0.1)" bc="rgba(80,180,140,0.28)"><p style={{ color: "#d4c4a0", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{verdict.resolution}</p></SCard>
      <SCard title="⚠ Cosmic Warning" color="rgba(180,60,60,0.1)" bc="rgba(210,80,60,0.28)"><p style={{ color: "#d4c4a0", lineHeight: 1.7, margin: 0, fontSize: 14, fontStyle: "italic" }}>{verdict.cosmic_warning}</p></SCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
        <button onClick={onShare} style={{ ...btn(isPro ? "rgba(91,164,207,0.2)" : "rgba(255,255,255,0.06)", true), fontSize: 13, padding: "12px", position: "relative" }}>
          🖼️ Share Card
          {!isPro && <span style={{ position: "absolute", top: 4, right: 8, fontSize: 9, color: "#c9a84c" }}>PRO</span>}
        </button>
        <button onClick={onNewDispute} style={{ ...btn("#c9853a"), fontSize: 13, padding: "12px" }}>✨ New Dispute</button>
      </div>
      <button onClick={onFullReset} style={{ ...btn("rgba(255,255,255,0.04)", true), width: "100%", marginTop: 10, fontSize: 12, color: "#3a2a1a" }}>Change Partners</button>
    </div>
  );
}

// ───────────────── Zodiac Picker ──────────────────────────────────────────────────────────────────────────────────
function ZodiacPicker({ onSelect, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(4,3,10,0.96)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }} onClick={onClose}>
      <div style={{ background: "#0e0c1a", border: "1px solid rgba(255,200,100,0.18)", borderRadius: 20, padding: "26px 20px", width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#7a6a50", textTransform: "uppercase", marginBottom: 18, textAlign: "center" }}>Choose a Sign</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9 }}>
          {SIGNS.map(sign => (
            <button key={sign.name} onClick={() => onSelect(sign)} style={{ background: `${EL[sign.element]}12`, border: `1px solid ${EL[sign.element]}38`, borderRadius: 11, padding: "13px 6px", color: "#f0e8d5", cursor: "pointer", fontFamily: "Georgia, serif", textAlign: "center", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = `${EL[sign.element]}28`}
              onMouseLeave={e => e.currentTarget.style.background = `${EL[sign.element]}12`}>
              <div style={{ fontSize: 20 }}>{sign.symbol}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{sign.name}</div>
              <div style={{ fontSize: 9, color: EL[sign.element], marginTop: 2 }}>{sign.element}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ ...btn("rgba(255,255,255,0.05)", true), width: "100%", marginTop: 14 }}>Cancel</button>
      </div>
    </div>
  );
}

function SCard({ title, color, bc, children }) {
  return (
    <div style={{ background: color, border: `1px solid ${bc}`, borderRadius: 13, padding: "16px 18px", marginBottom: 12 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a6a50", textTransform: "uppercase", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
const inputSt = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,200,100,0.15)", borderRadius: 8, padding: "10px 11px", color: "#f0e8d5", fontSize: 14, fontFamily: "Georgia, serif", marginBottom: 10 };
function btn(bg, secondary = false) {
  return { background: secondary ? bg : `linear-gradient(135deg,${bg},${bg}bb)`, border: secondary ? "1px solid rgba(255,200,100,0.13)" : "1px solid rgba(255,200,100,0.3)", borderRadius: 11, padding: "12px 24px", color: secondary ? "#9b8a6a" : "#fff", fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: 0.4, transition: "all 0.2s" };
}
dient(barX, 0, barX + p1w, 0);
  grad1.addColorStop(0, p1color + "88"); grad1.addColorStop(1, p1color);
  ctx.fillStyle = grad1;
  roundRect(ctx, barX, barY, p1w - 2, barH, { tl: barR, tr: 4, br: 4, bl: barR }); ctx.fill();

  // P2 bar
  const p2x = barX + p1w + 2, p2w = (s2 / total) * barW - 2;
  const grad2 = ctx.createLinearGradient(p2x, 0, p2x + p2w, 0);
  grad2.addColorStop(0, p2color); grad2.addColorStop(1, p2color + "88");
  ctx.fillStyle = grad2;
  roundRect(ctx, p2x, barY, p2w, barH, { tl: 4, tr: barR, br: barR, bl: 4 }); ctx.fill();

  // Score labels
  ctx.font = "bold 26px Georgia"; ctx.fillStyle = "#fff"; ctx.textAlign = "left";
  ctx.fillText(`${s1}%`, barX + 14, barY + 22);
  ctx.textAlign = "right"; ctx.fillText(`${s2}%`, barX + barW - 14, barY + 22);

  // Compat
  if (compat) {
    ctx.font = "italic 26px Georgia"; ctx.textAlign = "center";
    ctx.fillStyle = compat.color;
    ctx.fillText(`${compat.label}  · ${compat.score}% Compatible`, W / 2, 420);
  }

  // Headline box
  ctx.fillStyle = "rgba(201,133,58,0.1)";
  roundRect(ctx, 80, 450, W - 160, 200, 20); ctx.fill();
  ctx.strokeStyle = "rgba(201,133,58,0.3)"; ctx.lineWidth = 1.5;
  roundRect(ctx, 80, 450, W - 160, 200, 20); ctx.stroke();

  ctx.fillStyle = "#f0e8d5"; ctx.textAlign = "center";
  const lines = wrapText(ctx, `"${verdict.headline}"`, W - 220, "italic 36px Georgia");
  lines.forEach((line, i) => {
    ctx.font = "italic 36px Georgia";
    ctx.fillText(line, W / 2, 520 + i * 52);
  });

  // Apology
  if (verdict.apologizes_first) {
    ctx.fillStyle = "rgba(140,110,220,0.15)";
    roundRect(ctx, 80, 675, W - 160, 110, 16); ctx.fill();
    ctx.strokeStyle = "rgba(140,110,220,0.35)"; ctx.lineWidth = 1;
    roundRect(ctx, 80, 675, W - 160, 110, 16); ctx.stroke();
    ctx.font = "24px Georgia"; ctx.fillStyle = "#8a7a9a"; ctx.textAlign = "center";
    ctx.fillText("🙏  WHO APOLOGIZES FIRST", W / 2, 710);
    ctx.font = "italic bold 38px Georgia"; ctx.fillStyle = "#c9b0f0";
    ctx.fillText(verdict.apologizes_first, W / 2, 760);
  }

  // Resolution snippet
  ctx.fillStyle = "rgba(80,160,120,0.12)";
  roundRect(ctx, 80, 810, W - 160, 160, 16); ctx.fill();
  ctx.strokeStyle = "rgba(80,180,140,0.28)"; ctx.lineWidth = 1;
  roundRect(ctx, 80, 810, W - 160, 160, 16); ctx.stroke();
  ctx.font = "22px Georgia"; ctx.fillStyle = "#7a6a50"; ctx.textAlign = "left";
  ctx.fillText("✨  PATH TO PEACE", 110, 845);
  const resLines = wrapText(ctx, verdict.resolution, W - 240, "italic 28px Georgia").slice(0, 3);
  resLines.forEach((line, i) => {
    ctx.font = "italic 28px Georgia"; ctx.fillStyle = "#d4c4a0";
    ctx.fillText(line, 110, 885 + i * 38);
  });

  // Footer
  ctx.strokeStyle = "rgba(201,133,58,0.2)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(160, 998); ctx.lineTo(W - 160, 998); ctx.stroke();
  ctx.font = "22px Georgia"; ctx.fillStyle = "#5a4a3a"; ctx.textAlign = "center";
  ctx.fillText("cosmic-court.app  ✨  Powered by the Stars", W / 2, 1030);
}ect(ctx, x, y, w, h, r) {
  if (typeof r === "number") r = { tl: r, tr: r, br: r, bl: r };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y); ctx.arcTo(x + w, y, x + w, y + r.tr, r.tr);
  ctx.lineTo(x + w, y + h - r.br); ctx.arcTo(x + w, y + h, x + w - r.br, y + h, r.br);
  ctx.lineTo(x + r.bl, y + h); ctx.arcTo(x, y + h, x, y + h - r.bl, r.bl);
  ctx.lineTo(x, y + r.tl); ctx.arcTo(x, y, x + r.tl, y, r.tl);
  ctx.closePath();
}

function wrapText(ctx, text, maxW, font) {
  ctx.font = font;
  const words = text.split(" "); const lines = []; let cur = "";
  for (const word of words) {
    const test = cur ? cur + " " + word : word;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = word; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// ───────────────── Main App ──────────────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [step, setStep] = useState(0);
  const [p1, setP1] = useState({ name: "", sign: null });
  const [p2, setP2] = useState({ name: "", sign: null });
  const [dispute, setDispute] = useState("");
  const [tone, setTone] = useState("playful");
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [compat, setCompat] = useState(null);
  const [selectingFor, setSelectingFor] = useState(null);
  const [history, setHistory] = useState([]);
  const [horoscope, setHoroscope] = useState(null);
  const [horoscopeLoading, setHoroscopeLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareGenerated, setShareGenerated] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadStorage("cosmic-court-history").then(h => h && setHistory(h));
    loadStorage("cosmic-court-pro").then(v => v && setIsPro(true));
    // Handle return from Stripe checkout
    const params = new URLSearchParams(window.location.search);
    if (params.get("pro") === "true") {
      setIsPro(true);
      saveStorage("cosmic-court-pro", true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const p1color = p1.sign ? EL[p1.sign.element] : "#c9a84c";
  const p2color = p2.sign ? EL[p2.sign.element] : "#c9a84c";

  useEffect(() => {
    if (p1.sign && p2.sign) setCompat(getCompatibility(p1.sign, p2.sign));
    else setCompat(null);
  }, [p1.sign, p2.sign]);

  const requirePro = (reason, cb) => {
    if (isPro) { cb(); return; }
    setUpgradeReason(reason); setShowUpgrade(true);
  };

  const activatePro = async () => {
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      // Fallback: grant access locally (dev mode)
      setIsPro(true); saveStorage("cosmic-court-pro", true); setShowUpgrade(false);
    }
  }; const callAI = async () => {
    const selectedTone = TONES.find(t => t.id === tone);
    if (!selectedTone.free && !isPro) {
      setUpgradeReason(`${selectedTone.label} mode is a Cosmic Pro feature`);
      setShowUpgrade(true); return;
    }
    setLoading(true); setStep(3);
    const toneMap = {
      playful: "witty, fun, and a little teasing — like a clever best friend",
      serious: "deep, empathetic, and psychologically grounded",
      savage: "brutally honest, no-filter, comedically savage but ultimately fair",
      therapist: "warm, healing, and compassionate like a skilled couples therapist",
    };
    try {
      const includeApology = isPro;
      const prompt = `You are a mystical relationship counselor. Your tone is: ${toneMap[tone]}.

Partner 1: ${p1.name} (${p1.sign.name}, ${p1.sign.element}, ruled by ${p1.sign.ruling})
Partner 2: ${p2.name} (${p2.sign.name}, ${p2.sign.element}, ruled by ${p2.sign.ruling})
Dispute: "${dispute}"

Respond ONLY with a JSON object (no markdown, no backticks):
{
  "headline": "One punchy verdict sentence",
  "partner1_score": 0-100,
  "partner2_score": 0-100,
  "cosmic_analysis": "2-3 sentences on the astrological dynamic at play",
  "partner1_insight": "One cheeky sentence about ${p1.name}'s ${p1.sign.name} nature in this conflict",
  "partner2_insight": "One cheeky sentence about ${p2.name}'s ${p2.sign.name} nature in this conflict",
  "resolution": "2-3 actionable sign-specific sentences to resolve this",
  "cosmic_warning": "One playful warning if unresolved"${includeApology ? `,
  "apologizes_first": "either '${p1.name}' or '${p2.name}' — just the name",
  "apologize_reason": "One sentence explaining why that sign will cave first"` : ""}
}`;
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const parsed = JSON.parse(data.content.map(i => i.text || "").join("").replace(/```json|```/g, "").trim());
      setVerdict(parsed);
      const entry = {
        id: Date.now(), date: new Date().toLocaleDateString(),
        p1: { name: p1.name, sign: p1.sign.name, symbol: p1.sign.symbol },
        p2: { name: p2.name, sign: p2.sign.name, symbol: p2.sign.symbol },
        dispute: dispute.slice(0, 80) + (dispute.length > 80 ? "…" : ""),
        headline: parsed.headline, p1score: parsed.partner1_score, p2score: parsed.partner2_score, tone,
      };
      const newHistory = [entry, ...history].slice(0, isPro ? 50 : 5);
      setHistory(newHistory); saveStorage("cosmic-court-history", newHistory);
    } catch { setVerdict({ error: true }); }
    setLoading(false);
  };

  const loadHoroscope = () => requirePro("Weekly horoscope is a Cosmic Pro feature", async () => {
    if (!p1.sign || !p2.sign) return;
    setHoroscopeLoading(true);
    try {
      const prompt = `Generate a playful weekly relationship horoscope for a couple.
Sign 1: ${p1.sign.name} (${p1.sign.element}, ruled by ${p1.sign.ruling})
Sign 2: ${p2.sign.name} (${p2.sign.element}, ruled by ${p2.sign.ruling})
Respond ONLY with JSON (no markdown):
{"title":"catchy title","overview":"2 sentences","challenge":"one sentence","opportunity":"one sentence","ritual":"one specific activity","lucky_day":"day of week","vibe":"3-word vibe"}`;
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      setHoroscope(JSON.parse(data.content.map(i => i.text || "").join("").replace(/```json|```/g, "").trim()));
    } catch { setHoroscope({ error: true }); }
    setHoroscopeLoading(false);
  });

  const openShareCard = () => requirePro("Shareable image cards are a Cosmic Pro feature", () => {
    setShowShareCard(true); setShareGenerated(false);
    setTimeout(() => {
      if (canvasRef.current && verdict) {
        drawShareCard(canvasRef.current, { verdict, p1, p2, p1color, p2color, compat });
        setShareGenerated(true);
      }
    }, 100);
  });

  const downloadCard = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.download = "cosmic-court-verdict.png";
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  const reset = () => { setStep(0); setVerdict(null); setDispute(""); setTone("playful"); setShareGenerated(false); };
  const fullReset = () => { reset(); setP1({ name: "", sign: null }); setP2({ name: "", sign: null }); setCompat(null); };
  return (
    <div style={{ minHeight: "100vh", background: "#08060f", fontFamily: "Georgia, serif", color: "#f0e8d5", overflowX: "hidden" }}>
      {/* Stars bg */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: Array.from({ length: 16 }, (_, i) =>
          `radial-gradient(${i % 3 === 0 ? "1.5" : "1"}px ${i % 3 === 0 ? "1.5" : "1"}px at ${6 + i * 6}% ${8 + (i * 37 % 82)}%, rgba(255,255,220,${0.25 + (i % 3) * 0.15}) 0%, transparent 100%)`
        ).join(","),
      }} />

      {/* Upgrade modal */}
      {showUpgrade && <UpgradeModal reason={upgradeReason} onClose={() => setShowUpgrade(false)} onActivate={activatePro} />}

      {/* Share card modal */}
      {showShareCard && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(4,3,10,0.97)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#7a6a50", textTransform: "uppercase", marginBottom: 16 }}>Your Share Card</div>
          <div style={{ width: "100%", maxWidth: 420, aspectRatio: "1/1", background: "#08060f", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(201,133,58,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!shareGenerated && <div style={{ color: "#5a4a3a", fontStyle: "italic" }}>Rendering…</div>}
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: shareGenerated ? "block" : "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, width: "100%", maxWidth: 420 }}>
            <button onClick={() => setShowShareCard(false)} style={{ ...btn("rgba(255,255,255,0.07)", true), flex: 1 }}>← Back</button>
            <button onClick={downloadCard} style={{ ...btn("#c9853a"), flex: 2 }}>⬇ Download Image</button>
          </div>
          <p style={{ fontSize: 12, color: "#3a2a1a", marginTop: 10, fontStyle: "italic" }}>Save and share on Instagram, TikTok, or anywhere</p>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "0 18px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", padding: "40px 0 18px" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 10, letterSpacing: 6, color: "#7a6a50", textTransform: "uppercase" }}>Celestial Arbitration</div>
            {isPro && <span style={{ fontSize: 10, background: "linear-gradient(135deg,#f5d878,#e8952a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 2, fontWeight: 700 }}>✨ PRO</span>}
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem,7vw,3.4rem)", fontWeight: 400, margin: "0 0 4px", lineHeight: 1, background: "linear-gradient(135deg, #f5d878 0%, #e8952a 55%, #c06020 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1px" }}>
            Cosmic Court
          </h1>
          <p style={{ color: "#7a6a50", fontSize: 14, margin: "0 0 20px", fontStyle: "italic" }}>Let the stars settle your disputes</p>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,200,100,0.12)", borderRadius: 50, padding: 4, gap: 2 }}>
              {[["home", "⚖️ Court"], ["horoscope", "🌙 Weekly"], ["history", "📝 History"]].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} style={{
                  background: tab === id ? "rgba(201,133,58,0.3)" : "transparent",
                  border: tab === id ? "1px solid rgba(201,133,58,0.4)" : "1px solid transparent",         borderRadius: 50, padding: "7px 14px", color: tab === id ? "#f0d090" : "#7a6a50",
                  fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif", transition: "all 0.2s",
                }}>{label}</button>
              ))}
            </div>
            {!isPro && (
              <button onClick={() => { setUpgradeReason("Unlock the full cosmic experience"); setShowUpgrade(true); }} style={{
                background: "linear-gradient(135deg,rgba(245,216,120,0.15),rgba(232,149,42,0.15))",
                border: "1px solid rgba(245,216,120,0.3)", borderRadius: 50, padding: "8px 16px",
                color: "#f0d090", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif",
              }}>✨ Go Pro</button>
            )}
          </div>
        </div>

        {/* HOME */}
        {tab === "home" && (
          <>
            {selectingFor !== null && <ZodiacPicker onSelect={sign => { if (selectingFor === 1) setP1(p => ({ ...p, sign })); else setP2(p => ({ ...p, sign })); setSelectingFor(null); }} onClose={() => setSelectingFor(null)} />}

            {step === 0 && (
              <div style={{ animation: "fadeIn 0.5s ease", textAlign: "center" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.12)", borderRadius: 20, padding: "36px 28px", marginBottom: 16 }}>
                  <div style={{ fontSize: 54, marginBottom: 16 }}>⚖️✨</div>
                  <p style={{ fontSize: 16, lineHeight: 1.75, color: "#d4c4a0", maxWidth: 400, margin: "0 auto 24px" }}>
                    Every couple fights. But not every couple has the cosmos on their side. Enter your signs, pick a vibe, and receive a celestially-informed verdict.
                  </p>
                  <button onClick={() => setStep(1)} style={btn("#c9853a")}>Begin the Hearing →</button>
                </div>
                {!isPro && <ProTeaser onUpgrade={() => { setUpgradeReason("Unlock the full cosmic experience"); setShowUpgrade(true); }} />}
              </div>
            )}

            {step === 1 && (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  {[[p1, setP1, 1, p1color], [p2, setP2, 2, p2color]].map(([partner, setPartner, num, color]) => (
                    <div key={num} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}28`, borderRadius: 16, padding: "18px 14px" }}>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a6a50", textTransform: "uppercase", marginBottom: 12 }}>Partner {num}</div>
                      <input value={partner.name} onChange={e => setPartner(p => ({ ...p, name: e.target.value }))} placeholder="Name" style={inputSt} />
                      <button onClick={() => setSelectingFor(num)} style={{ width: "100%", background: partner.sign ? `${color}18` : "rgba(255,255,255,0.04)", border: `1px solid ${partner.sign ? color + "55" : "rgba(255,200,100,0.14)"}`, borderRadius: 10, padding: "11px 8px", color: partner.sign ? color : "#7a6a50", fontSize: partner.sign ? 18 : 12, cursor: "pointer", fontFamily: "Georgia, serif", transition: "all 0.2s", textAlign: "center", lineHeight: 1.3 }}>
                        {partner.sign ? <><div>{partner.sign.symbol} {partner.sign.name}</div><div style={{ fontSize: 10, opacity: 0.8 }}>{partner.sign.element}</div></> : "Choose Sign ✨"}
                      </button>
                    </div>
                  ))}
                </div>

                {compat && (
                  <div style={{ background: `${compat.color}12`, border: `1px solid ${compat.color}35`, borderRadius: 14, padding: "14px 18px", marginBottom: 14, animation: "fadeIn 0.4s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                      <span style={{ fontSize: 10, letterSpacing: 3, color: "#7a6a50", textTransform: "uppercase" }}>Compatibility</span>
                      <span style={{ color: compat.color, fontSize: 13, fontStyle: "italic" }}>{compat.label}</span>
                    </div>
                    <div style={{ height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${compat.score}%`, background: `linear-gradient(90deg,${compat.color}80,${compat.color})`, borderRadius: 4, transition: "width 1.2s ease" }} />
                    </div>
                    <div style={{ textAlign: "right", fontSize: 12, color: compat.color, marginTop: 4 }}>{compat.score}%</div>
                  </div>
                )}

                {/* Tone selector */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.1)", borderRadius: 14, padding: "16px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a6a50", textTransform: "uppercase", marginBottom: 10 }}>Verdict Tone</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {TONES.map(t => {
                      const locked = !t.free && !isPro;
                      return (
                        <button key={t.id} onClick={() => locked ? (setUpgradeReason(`${t.label} mode is a Cosmic Pro feature`), setShowUpgrade(true)) : setTone(t.id)} style={{
                          background: tone === t.id ? "rgba(201,133,58,0.22)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${tone === t.id ? "rgba(201,133,58,0.5)" : "rgba(255,200,100,0.1)"}`,
                          borderRadius: 10, padding: "10px 6px", cursor: "pointer", fontFamily: "Georgia, serif",
                          textAlign: "center", transition: "all 0.2s", opacity: locked ? 0.7 : 1, position: "relative",         }}>
                          <div style={{ fontSize: 16 }}>{t.label.split(" ")[0]}</div>
                          <div style={{ fontSize: 11, color: tone === t.id ? "#f0d090" : "#7a6a50", marginTop: 3 }}>{t.label.split(" ").slice(1).join(" ")}</div>
                          <div style={{ fontSize: 10, color: "#4a3a2a", marginTop: 2 }}>{t.desc}</div>
                          {locked && <div style={{ position: "absolute", top: 4, right: 6, fontSize: 9, color: "#c9a84c" }}>PRO</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.1)", borderRadius: 14, padding: "16px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a6a50", textTransform: "uppercase", marginBottom: 10 }}>The Dispute</div>
                  <textarea value={dispute} onChange={e => setDispute(e.target.value)} placeholder="Describe what you're fighting about…" rows={4} style={{ ...inputSt, resize: "vertical", lineHeight: 1.6 }} />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(0)} style={{ ...btn("rgba(255,255,255,0.07)", true), padding: "12px 20px" }}>← Back</button>
                  <button onClick={callAI} disabled={!p1.name || !p1.sign || !p2.name || !p2.sign || dispute.length < 8}
                    style={{ ...btn("#c9853a"), flex: 1, opacity: (!p1.name || !p1.sign || !p2.name || !p2.sign || dispute.length < 8) ? 0.38 : 1 }}>
                    Summon the Verdict ✨
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <div style={{ fontSize: 48, animation: "spin 3s linear infinite", display: "inline-block" }}>☿</div>
                    <p style={{ color: "#7a6a50", fontStyle: "italic", marginTop: 16 }}>Consulting the celestial archives…</p>
                  </div>
                ) : verdict?.error ? (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <p style={{ color: "#ff6b6b" }}>The stars went silent. Try again.</p>
                    <button onClick={reset} style={btn("#c9853a")}>Retry</button>
                  </div>
                ) : verdict ? (
                  <VerdictDisplay verdict={verdict} p1={p1} p2={p2} p1color={p1color} p2color={p2color}
                    compat={compat} tone={tone} isPro={isPro}
                    onShare={openShareCard}
                    onUpgrade={(reason) => { setUpgradeReason(reason); setShowUpgrade(true); }}
                    onNewDispute={reset} onFullReset={fullReset} />
                ) : null}
              </div>
            )}
          </>
        )}

        {/* HOROSCOPE */}
        {tab === "horoscope" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            {selectingFor !== null && <ZodiacPicker onSelect={sign => { if (selectingFor === 1) setP1(p => ({ ...p, sign })); else setP2(p => ({ ...p, sign })); setSelectingFor(null); }} onClose={() => setSelectingFor(null)} />}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.12)", borderRadius: 18, padding: "28px 22px" }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🌙</div>
                <div style={{ fontSize: 11, letterSpacing: 4, color: "#7a6a50", textTransform: "uppercase" }}>Weekly Couple's Horoscope</div>
                {!isPro && <div style={{ marginTop: 8, fontSize: 12, color: "#c9a84c", fontStyle: "italic" }}>✨ Cosmic Pro feature</div>}
              </div>
              {(!p1.sign || !p2.sign) ? (
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#7a6a50", fontStyle: "italic", marginBottom: 18, fontSize: 14 }}>Set both signs to receive your weekly forecast</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    {[[p1, 1, p1color], [p2, 2, p2color]].map(([partner, num, color]) => (
                      <button key={num} onClick={() => setSelectingFor(num)} style={{ background: partner.sign ? `${color}18` : "rgba(255,255,255,0.04)", border: `1px solid ${partner.sign ? color + "50" : "rgba(255,200,100,0.14)"}`, borderRadius: 12, padding: "16px", cursor: "pointer", fontFamily: "Georgia, serif", color: partner.sign ? color : "#7a6a50", fontSize: partner.sign ? 16 : 12, textAlign: "center" }}>
                        {partner.sign ? `${partner.sign.symbol} ${partner.sign.name}` : `Partner ${num} Sign ✨`}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (<div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 18 }}>
                    <span style={{ color: p1color }}>{p1.sign.symbol} {p1.sign.name}</span>
                    <span style={{ color: "#4a3a2a" }}>✨</span>
                    <span style={{ color: p2color }}>{p2.sign.symbol} {p2.sign.name}</span>
                  </div>
                  {!horoscope && !horoscopeLoading && (
                    <button onClick={loadHoroscope} style={{ ...btn(isPro ? "#5ba4cf" : "#c9853a"), width: "100%" }}>
                      {isPro ? "✨ Generate This Week's Forecast" : "✨ Unlock Weekly Horoscope (Pro)"}
                    </button>
                  )}
                  {horoscopeLoading && <div style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 36, animation: "spin 4s linear infinite", display: "inline-block" }}>🌙</div><p style={{ color: "#7a6a50", fontStyle: "italic", marginTop: 12 }}>Reading the celestial tides…</p></div>}
                  {horoscope && !horoscope.error && (
                    <div style={{ animation: "fadeIn 0.5s ease" }}>
                      <div style={{ textAlign: "center", marginBottom: 18 }}>
                        <div style={{ fontSize: "clamp(1rem,4vw,1.3rem)", color: "#f0d090", fontStyle: "italic", marginBottom: 5 }}>{horoscope.title}</div>
                        <div style={{ fontSize: 11, color: "#7a6a50", letterSpacing: 2 }}>{horoscope.vibe?.toUpperCase()}</div>
                      </div>
                      <SCard title="🌟 This Week" color="rgba(180,150,80,0.12)" bc="rgba(180,150,80,0.25)"><p style={{ color: "#d4c4a0", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{horoscope.overview}</p></SCard>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "12px 0" }}>
                        <SCard title="⚡ Watch Out" color="rgba(255,100,50,0.1)" bc="rgba(255,100,50,0.25)"><p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 13 }}>{horoscope.challenge}</p></SCard>
                        <SCard title="✨ Opportunity" color="rgba(80,180,120,0.1)" bc="rgba(80,180,120,0.25)"><p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 13 }}>{horoscope.opportunity}</p></SCard>
                      </div>
                      <SCard title="💫 Ritual for Two" color="rgba(90,140,210,0.1)" bc="rgba(90,140,210,0.25)"><p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 14 }}>{horoscope.ritual}</p></SCard>
                      <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#7a6a50" }}>Lucky day: <span style={{ color: "#c9a84c" }}>{horoscope.lucky_day}</span></div>
                      <button onClick={() => { setHoroscope(null); loadHoroscope(); }} style={{ ...btn("rgba(255,255,255,0.07)", true), width: "100%", marginTop: 14 }}>↻ Regenerate</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#7a6a50", textTransform: "uppercase" }}>
                Past Verdicts {!isPro && <span style={{ color: "#4a3a2a", fontSize: 10 }}>(last 5 — Pro saves 50)</span>}
              </div>
              {history.length > 0 && <button onClick={() => { setHistory([]); saveStorage("cosmic-court-history", []); }} style={{ fontSize: 11, color: "#4a3a2a", background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif" }}>Clear All</button>}
            </div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#3a2a1a", fontStyle: "italic" }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>📝</div>
                No verdicts yet. Bring your disputes to the court.
              </div>
            ) : history.map(entry => (
              <div key={entry.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.1)", borderRadius: 14, padding: "16px 18px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 14, color: "#d4c4a0" }}>{entry.p1.symbol} {entry.p1.name} vs {entry.p2.symbol} {entry.p2.name}</span>
                  <span style={{ fontSize: 11, color: "#3a2a1a" }}>{entry.date}</span>
                </div>
                <p style={{ fontSize: 13, color: "#6a5a4a", fontStyle: "italic", margin: "0 0 7px", lineHeight: 1.5 }}""{entry.dispute}"</p>
                <p style={{ fontSize: 13, color: "#c9a84c", margin: "0 0 9px", lineHeight: 1.4 }}""{entry.headline}"</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#6a5a4a", background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "3px 10px" }}>{entry.p1.name}: {entry.p1score}%</span>
                  <span style={{ fontSize: 11, color: "#6a5a4a", background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "3px 10px" }}>{entry.p2.name}: {entry.p2score}%</span>
                  <span style={{ fontSize: 11, color: "#3a2a1a", background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "3px 10px", marginLeft: "auto" }}>{entry.tone}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%,100%{opacity:.6}50%{opacity:1} }
        * { box-sizing:border-box; }
        textarea,input { outline:none; }
        textarea::placeholder,input::placeholder { color:#3a2818; }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,200,100,.15);border-radius:2px}
      `}</style>
    </div>
  );
}
// ───────────────── Upgrade Modal ──────────────────────────────────────────────────────────────────────────────────
function UpgradeModal({ reason, onClose, onActivate }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(4,3,10,0.97)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0e0b1a", border: "1px solid rgba(245,216,120,0.25)", borderRadius: 24, padding: "36px 28px", width: "100%", maxWidth: 440, textAlign: "center", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>✨</div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#c9a84c", textTransform: "uppercase", marginBottom: 10 }}>Cosmic Pro</div>
        <h2 style={{ fontSize: "clamp(1.3rem,5vw,1.7rem)", fontWeight: 400, margin: "0 0 8px", background: "linear-gradient(135deg,#f5d878,#e8952a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Unlock the Full Experience
        </h2>
        <p style={{ fontSize: 14, color: "#7a6a50", fontStyle: "italic", marginBottom: 24 }}>{reason}</p>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.1)", borderRadius: 14, padding: "20px 18px", marginBottom: 24, textAlign: "left" }}>
          {PREMIUM_FEATURES.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < PREMIUM_FEATURES.length - 1 ? 12 : 0 }}>
              <span style={{ fontSize: 15 }}>{f.split(" ")[0]}</span>
              <span style={{ fontSize: 14, color: "#d4c4a0" }}>{f.split(" ").slice(1).join(" ")}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "linear-gradient(135deg,rgba(245,216,120,0.12),rgba(232,149,42,0.1))", border: "1px solid rgba(245,216,120,0.2)", borderRadius: 14, padding: "16px", marginBottom: 20 }}>
          <div style={{ fontSize: "clamp(1.6rem,6vw,2.2rem)", fontWeight: 400, background: "linear-gradient(135deg,#f5d878,#e8952a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>$5.99</div>
          <div style={{ fontSize: 12, color: "#7a6a50" }}>/ month · Cancel anytime</div>
        </div>

        <button onClick={onActivate} style={{ ...btn("#c9853a"), width: "100%", fontSize: 16, padding: "14px", marginBottom: 10 }}>
          ✨ Activate Cosmic Pro
        </button>
        <button onClick={onClose} style={{ ...btn("rgba(255,255,255,0.05)", true), width: "100%", fontSize: 13 }}>
          Continue with Free
        </button>
        <p style={{ fontSize: 11, color: "#3a2a1a", marginTop: 12, fontStyle: "italic" }}>
          Demo: clicking "Activate" grants Pro access instantly
        </p>
      </div>
    </div>
  );
}
// ───────────────── Pro Teaser ──────────────────────────────────────────────────────────────────────────────────
function ProTeaser({ onUpgrade }) {
  return (
    <div style={{ background: "linear-gradient(135deg,rgba(245,216,120,0.07),rgba(180,70,20,0.06))", border: "1px solid rgba(245,216,120,0.18)", borderRadius: 16, padding: "20px 22px", marginTop: 0, textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#c9a84c", textTransform: "uppercase" }}>Cosmic Pro</div>
        <div style={{ fontSize: 13, color: "#7a6a50" }}>$5.99/mo</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {PREMIUM_FEATURES.slice(0, 4).map((f, i) => (
          <div key={i} style={{ fontSize: 12, color: "#7a6a50", display: "flex", gap: 6 }}>
            <span>{f.split(" ")[0]}</span>
            <span style={{ color: "#5a4a3a" }}>{f.split(" ").slice(1).join(" ")}</span>
          </div>
        ))}
      </div>
      <button onClick={onUpgrade} style={{ ...btn("#c9853a"), width: "100%", fontSize: 13 }}>✨ Unlock Cosmic Pro</button>
    </div>
  );
}
// ───────────────── Verdict Display ──────────────────────────────────────────────────────────────────────────────────
function VerdictDisplay({ verdict, p1, p2, p1color, p2color, compat, tone, isPro, onShare, onUpgrade, onNewDispute, onFullReset }) {
  const s1 = verdict.partner1_score ?? 50, s2 = verdict.partner2_score ?? 50, total = s1 + s2 || 100;
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,rgba(201,133,58,0.18) 0%,rgba(180,70,20,0.1) 100%)", border: "1px solid rgba(201,133,58,0.4)", borderRadius: 18, padding: "24px 22px", textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#c9853a", textTransform: "uppercase", marginBottom: 10 }}>The Cosmic Verdict</div>
        <p style={{ fontSize: "clamp(1rem,3.5vw,1.15rem)", lineHeight: 1.55, margin: "0 0 10px", color: "#f0e8d5", fontStyle: "italic" }}""{verdict.headline}"</p>
        <div style={{ fontSize: 11, color: "#5a4a3a", letterSpacing: 2 }}>{tone.toUpperCase()} · {p1.sign.symbol} {p1.sign.name} × {p2.sign.symbol} {p2.sign.name}</div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,100,0.1)", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
          <span style={{ color: p1color, fontWeight: 600 }}>{p1.name} {p1.sign.symbol}</span>
          <span style={{ color: "#4a3a2a", fontSize: 11 }}>Rightness</span>
          <span style={{ color: p2color, fontWeight: 600 }}>{p2.sign.symbol} {p2.name}</span>
        </div>
        <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", gap: 2 }}>
          <div style={{ width: `${(s1 / total) * 100}%`, background: `linear-gradient(90deg,${p1color}80,${p1color})`, borderRadius: "8px 0 0 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", fontWeight: 700, transition: "width 1s ease" }}>{s1 > 22 ? `${s1}%` : ""}</div>
          <div style={{ width: `${(s2 / total) * 100}%`, background: `linear-gradient(90deg,${p2color},${p2color}80)`, borderRadius: "0 8px 8px 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", fontWeight: 700, transition: "width 1s ease" }}>{s2 > 22 ? `${s2}%` : ""}</div>
        </div>
        {compat && <div style={{ marginTop: 9, textAlign: "center", fontSize: 12 }}><span style={{ color: "#4a3a2a" }}>Compatibility: </span><span style={{ color: compat.color }}>{compat.label} · {compat.score}%</span></div>}
      </div>

      <SCard title="☿ Cosmic Dynamic" color="rgba(180,150,80,0.13)" bc="rgba(180,150,80,0.28)">
        <p style={{ color: "#d4c4a0", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{verdict.cosmic_analysis}</p>
      </SCard>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "12px 0" }}>
        <SCard title={`${p1.sign.symbol} ${p1.name}`} color={`${p1color}12`} bc={`${p1color}32`}><p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 13 }}>{verdict.partner1_insight}</p></SCard>
        <SCard title={`${p2.sign.symbol} ${p2.name}`} color={`${p2color}12`} bc={`${p2color}32`}><p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 13 }}>{verdict.partner2_insight}</p></SCard>
      </div>
      {/* Who apologizes — gated */}
      {isPro && verdict.apologizes_first ? (
        <div style={{ background: "linear-gradient(135deg,rgba(100,80,180,0.14),rgba(60,50,120,0.1))", border: "1px solid rgba(140,110,220,0.28)", borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#8a7a9a", textTransform: "uppercase", marginBottom: 10 }}>🙏 Who Apologizes First</div>
          <div style={{ fontSize: "clamp(1rem,4vw,1.2rem)", color: "#c9b0f0", fontStyle: "italic", marginBottom: 8 }}>{verdict.apologizes_first}</div>
          <p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 14 }}>{verdict.apologize_reason}</p>
        </div>
      ) : !isPro && (
        <button onClick={() => onUpgrade("Unlock 'Who Apologizes First' predictions with Cosmic Pro")} style={{ width: "100%", background: "rgba(140,110,220,0.08)", border: "1px dashed rgba(140,110,220,0.3)", borderRadius: 14, padding: "18px 20px", cursor: "pointer", marginBottom: 12, fontFamily: "Georgia, serif", textAlign: "left" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#6a5a7a", textTransform: "uppercase", marginBottom: 8 }}>🙏 Who Apologizes First</div>
          <div style={{ fontSize: 14, color: "#5a4a6a", fontStyle: "italic" }}>Unlock with Cosmic Pro ✨</div>
        </button>
      )}

      <SCard title="✨ Path to Peace" color="rgba(80,160,120,0.1)" bc="rgba(80,180,140,0.28)"><p style={{ color: "#d4c4a0", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{verdict.resolution}</p></SCard>
      <SCard title="⚠ Cosmic Warning" color="rgba(180,60,60,0.1)" bc="rgba(210,80,60,0.28)"><p style={{ color: "#d4c4a0", lineHeight: 1.7, margin: 0, fontSize: 14, fontStyle: "italic" }}>{verdict.cosmic_warning}</p></SCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
        <button onClick={onShare} style={{ ...btn(isPro ? "rgba(91,164,207,0.2)" : "rgba(255,255,255,0.06)", true), fontSize: 13, padding: "12px", position: "relative" }}>
          🖼️ Share Card
          {!isPro && <span style={{ position: "absolute", top: 4, right: 8, fontSize: 9, color: "#c9a84c" }}>PRO</span>}
        </button>
        <button onClick={onNewDispute} style={{ ...btn("#c9853a"), fontSize: 13, padding: "12px" }}>✨ New Dispute</button>
      </div>
      <button onClick={onFullReset} style={{ ...btn("rgba(255,255,255,0.04)", true), width: "100%", marginTop: 10, fontSize: 12, color: "#3a2a1a" }}>Change Partners</button>
    </div>
  );
}
// ───────────────── Zodiac Picker ──────────────────────────────────────────────────────────────────────────────────
function ZodiacPicker({ onSelect, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(4,3,10,0.96)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }} onClick={onClose}>
      <div style={{ background: "#0e0c1a", border: "1px solid rgba(255,200,100,0.18)", borderRadius: 20, padding: "26px 20px", width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#7a6a50", textTransform: "uppercase", marginBottom: 18, textAlign: "center" }}>Choose a Sign</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9 }}>
          {SIGNS.map(sign => (
            <button key={sign.name} onClick={() => onSelect(sign)} style={{ background: `${EL[sign.element]}12`, border: `1px solid ${EL[sign.element]}38`, borderRadius: 11, padding: "13px 6px", color: "#f0e8d5", cursor: "pointer", fontFamily: "Georgia, serif", textAlign: "center", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = `${EL[sign.element]}28`}
              onMouseLeave={e => e.currentTarget.style.background = `${EL[sign.element]}12`}>
              <div style={{ fontSize: 20 }}>{sign.symbol}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{sign.name}</div>
              <div style={{ fontSize: 9, color: EL[sign.element], marginTop: 2 }}>{sign.element}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ ...btn("rgba(255,255,255,0.05)", true), width: "100%", marginTop: 14 }}>Cancel</button>
      </div>
    </div>
  );
}

function SCard({ title, color, bc, children }) {
  return (
    <div style={{ background: color, border: `1px solid ${bc}`, borderRadius: 13, padding: "16px 18px", marginBottom: 12 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a6a50", textTransform: "uppercase", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
const inputSt = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,200,100,0.15)", borderRadius: 8, padding: "10px 11px", color: "#f0e8d5", fontSize: 14, fontFamily: "Georgia, serif", marginBottom: 10 };
function btn(bg, secondary = false) {
  return { background: secondary ? bg : `linear-gradient(135deg,${bg},${bg}bb)`, border: secondary ? "1px solid rgba(255,200,100,0.13)" : "1px solid rgba(255,200,100,0.3)", borderRadius: 11, padding: "12px 24px", color: secondary ? "#9b8a6a" : "#fff", fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: 0.4, transition: "all 0.2s" };
}v>

      <SCard title="☿ Cosmic Dynamic" color="rgba(180,150,80,0.13)" bc="rgba(180,150,80,0.28)">
        <p style={{ color: "#d4c4a0", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{verdict.cosmic_analysis}</p>
      </SCard>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "12px 0" }}>
        <SCard title={`${p1.sign.symbol} ${p1.name}`} color={`${p1color}12`} bc={`${p1color}32`}><p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 13 }}>{verdict.partner1_insight}</p></SCard>
        <SCard title={`${p2.sign.symbol} ${p2.name}`} color={`${p2color}12`} bc={`${p2color}32`}><p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 13 }}>{verdict.partner2_insight}</p></SCard>
      </div>

      {/* Who apologizes — gated */}
      {isPro && verdict.apologizes_first ? (
        <div style={{ background: "linear-gradient(135deg,rgba(100,80,180,0.14),rgba(60,50,120,0.1))", border: "1px solid rgba(140,110,220,0.28)", borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#8a7a9a", textTransform: "uppercase", marginBottom: 10 }}>🙏 Who Apologizes First</div>
          <div style={{ fontSize: "clamp(1rem,4vw,1.2rem)", color: "#c9b0f0", fontStyle: "italic", marginBottom: 8 }}>{verdict.apologizes_first}</div>
          <p style={{ color: "#d4c4a0", lineHeight: 1.6, margin: 0, fontSize: 14 }}>{verdict.apologize_reason}</p>
        </div>
      ) : !isPro && (
        <button onClick={() => onUpgrade("Unlock 'Who Apologizes First' predictions with Cosmic Pro")} style={{ width: "100%", background: "rgba(140,110,220,0.08)", border: "1px dashed rgba(140,110,220,0.3)", borderRadius: 14, padding: "18px 20px", cursor: "pointer", marginBottom: 12, fontFamily: "Georgia, serif", textAlign: "left" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#6a5a7a", textTransform: "uppercase", marginBottom: 8 }}>🙏 Who Apologizes First</div>
          <div style={{ fontSize: 14, color: "#5a4a6a", fontStyle: "italic" }}>Unlock with Cosmic Pro ✨</div>
        </button>
      )}

      <SCard title="✨ Path to Peace" color="rgba(80,160,120,0.1)" bc="rgba(80,180,140,0.28)"><p style={{ color: "#d4c4a0", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{verdict.resolution}</p></SCard>
      <SCard title="⚠ Cosmic Warning" color="rgba(180,60,60,0.1)" bc="rgba(210,80,60,0.28)"><p style={{ color: "#d4c4a0", lineHeight: 1.7, margin: 0, fontSize: 14, fontStyle: "italic" }}>{verdict.cosmic_warning}</p></SCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
        <button onClick={onShare} style={{ ...btn(isPro ? "rgba(91,164,207,0.2)" : "rgba(255,255,255,0.06)", true), fontSize: 13, padding: "12px", position: "relative" }}>
          🖼️ Share Card
          {!isPro && <span style={{ position: "absolute", top: 4, right: 8, fontSize: 9, color: "#c9a84c" }}>PRO</span>}
        </button>
        <button onClick={onNewDispute} style={{ ...btn("#c9853a"), fontSize: 13, padding: "12px" }}>✨ New Dispute</button>
      </div>
      <button onClick={onFullReset} style={{ ...btn("rgba(255,255,255,0.04)", true), width: "100%", marginTop: 10, fontSize: 12, color: "#3a2a1a" }}>Change Partners</button>
    </div>
  );
}

// ───────────────── Zodiac Picker ──────────────────────────────────────────────────────────────────────────────────
function ZodiacPicker({ onSelect, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(4,3,10,0.96)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }} onClick={onClose}>
      <div style={{ background: "#0e0c1a", border: "1px solid rgba(255,200,100,0.18)", borderRadius: 20, padding: "26px 20px", width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#7a6a50", textTransform: "uppercase", marginBottom: 18, textAlign: "center" }}>Choose a Sign</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9 }}>
          {SIGNS.map(sign => (
            <button key={sign.name} onClick={() => onSelect(sign)} style={{ background: `${EL[sign.element]}12`, border: `1px solid ${EL[sign.element]}38`, borderRadius: 11, padding: "13px 6px", color: "#f0e8d5", cursor: "pointer", fontFamily: "Georgia, serif", textAlign: "center", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = `${EL[sign.element]}28`}
              onMouseLeave={e => e.currentTarget.style.background = `${EL[sign.element]}12`}>
              <div style={{ fontSize: 20 }}>{sign.symbol}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{sign.name}</div>
              <div style={{ fontSize: 9, color: EL[sign.element], marginTop: 2 }}>{sign.element}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ ...btn("rgba(255,255,255,0.05)", true), width: "100%", marginTop: 14 }}>Cancel</button>
      </div>
    </div>
  );
}

function SCard({ title, color, bc, children }) {
  return (
    <div style={{ background: color, border: `1px solid ${bc}`, borderRadius: 13, padding: "16px 18px", marginBottom: 12 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a6a50", textTransform: "uppercase", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
const inputSt = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,200,100,0.15)", borderRadius: 8, padding: "10px 11px", color: "#f0e8d5", fontSize: 14, fontFamily: "Georgia, serif", marginBottom: 10 };
function btn(bg, secondary = false) {
  return { background: secondary ? bg : `linear-gradient(135deg,${bg},${bg}bb)`, border: secondary ? "1px solid rgba(255,200,100,0.13)" : "1px solid rgba(255,200,100,0.3)", borderRadius: 11, padding: "12px 24px", color: secondary ? "#9b8a6a" : "#fff", fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: 0.4, transition: "all 0.2s" };
  }
