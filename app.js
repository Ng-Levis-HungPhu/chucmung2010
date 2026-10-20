const API = (window.APP_CONFIG && window.APP_CONFIG.API_URL) || "";
const $ = (id) => document.getElementById(id);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const petals = (function () {
  const c = $("petals");
  const ctx = c.getContext("2d");
  let w, h;
  const resize = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
  resize();
  addEventListener("resize", resize);
  const colors = { hong: ["#f7a8c4", "#f27aa5", "#ffd1e0"], tim: ["#c9a8f2", "#a97be6", "#e6d6fb"], vang: ["#ffd37a", "#f5b942", "#ffe9b8"] };
  let palette = colors.hong;
  const pick = () => palette[Math.floor(Math.random() * palette.length)];
  const make = (y) => ({
    x: Math.random() * innerWidth, y,
    r: 5 + Math.random() * 7, s: 0.5 + Math.random() * 1.2,
    a: Math.random() * 6.28, v: 0.01 + Math.random() * 0.03, col: pick(),
  });
  const items = Array.from({ length: reduceMotion ? 0 : 35 }, () => make(Math.random() * innerHeight));
  (function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of items) {
      p.y += p.s; p.a += p.v; p.x += Math.sin(p.a) * 0.8;
      if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
      ctx.fillStyle = p.col; ctx.globalAlpha = 0.75;
      ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 6.28); ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(frame);
  })();
  return {
    setTheme(t) { palette = colors[t] || colors.hong; items.forEach((p) => (p.col = pick())); },
    burst() { if (!reduceMotion) for (let i = 0; i < 60; i++) items.push(make(-Math.random() * 300)); },
  };
})();

let typingTimer = null;
function typeText(el, text, done) {
  clearInterval(typingTimer);
  el.textContent = "";
  if (reduceMotion) { el.textContent = text; done(); return; }
  const chars = Array.from(text);
  let i = 0;
  typingTimer = setInterval(() => {
    el.textContent += chars[i++];
    if (i >= chars.length) { clearInterval(typingTimer); done(); }
  }, 35);
}

function playLetter(g) {
  $("letTo").textContent = g.to;
  $("letFrom").textContent = g.sender ? "— " + g.sender : "";
  $("letFrom").classList.remove("show");
  $("letter").hidden = false;
  typeText($("letMsg"), g.message, () => $("letFrom").classList.add("show"));
}
async function load() {
  $("error").hidden = true;
  $("loading").hidden = false;
  const wakeTimer = setTimeout(() => ($("wake").hidden = false), 3000);
  try {
    const res = await fetch("./greeting.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const g = await res.json();

    document.body.dataset.theme = g.theme || "hong";
    petals.setTheme(g.theme);
    document.title = "Lời chúc 20/10 🌸";
    $("envTo").textContent = g.to;
    $("loading").hidden = true;
    $("envelope").hidden = false;

    const open = () => {
      $("envelope").hidden = true;
      petals.burst();
      playLetter(g);
    };
    $("envelope").onclick = open;
    $("envelope").onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } };
    $("replay").onclick = () => { petals.burst(); playLetter(g); };
  } catch (e) {
    $("loading").hidden = true;
    $("errorText").textContent = "Chưa tải được lời chúc, vui lòng thử lại nhé.";
    $("error").hidden = false;
  } finally {
    clearTimeout(wakeTimer);
  }
}

$("retry").addEventListener("click", load);
load();
