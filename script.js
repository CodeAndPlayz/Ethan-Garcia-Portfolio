const canvas = document.getElementById("particleCanvas"),
  ctx = canvas.getContext("2d"),
  header = document.querySelector(".site-header"),
  menuToggle = document.getElementById("menuToggle"),
  navLinks = document.getElementById("navLinks"),
  year = document.getElementById("year");
year.textContent = new Date().getFullYear();
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let width = 0,
  height = 0,
  dpr = 1,
  particles = [];
const pointer = { x: null, y: null, radius: 150 };
function resize() {
  const r = canvas.getBoundingClientRect();
  width = r.width;
  height = r.height;
  dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createParticles();
}
function createParticles() {
  const density = width < 600 ? 0.000045 : 0.000075,
    count = Math.min(115, Math.max(42, Math.floor(width * height * density)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    radius: Math.random() * 1.5 + 0.6,
  }));
}
function update() {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;
    if (pointer.x !== null) {
      const dx = pointer.x - p.x,
        dy = pointer.y - p.y,
        d = Math.sqrt(dx * dx + dy * dy);
      if (d < pointer.radius && d > 0) {
        const f = (pointer.radius - d) / pointer.radius,
          a = Math.atan2(dy, dx);
        p.vx -= Math.cos(a) * f * 0.015;
        p.vy -= Math.sin(a) * f * 0.015;
      }
    }
    p.vx *= 0.995;
    p.vy *= 0.995;
    p.vx = Math.max(-0.55, Math.min(0.55, p.vx));
    p.vy = Math.max(-0.55, Math.min(0.55, p.vy));
  }
}
function draw() {
  ctx.clearRect(0, 0, width, height);
  const max = width < 600 ? 105 : 135;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i],
        b = particles[j],
        dx = a.x - b.x,
        dy = a.y - b.y,
        d = Math.sqrt(dx * dx + dy * dy);
      if (d < max) {
        ctx.strokeStyle = `rgba(150,210,235,${(1 - d / max) * 0.22})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(190,225,240,.62)";
    ctx.fill();
  }
  if (pointer.x !== null) {
    const g = ctx.createRadialGradient(
      pointer.x,
      pointer.y,
      0,
      pointer.x,
      pointer.y,
      pointer.radius,
    );
    g.addColorStop(0, "rgba(118,228,255,.055)");
    g.addColorStop(1, "rgba(118,228,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, pointer.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
function animate() {
  update();
  draw();
  requestAnimationFrame(animate);
}
canvas.addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  pointer.x = e.clientX - r.left;
  pointer.y = e.clientY - r.top;
});
canvas.addEventListener("pointerleave", () => {
  pointer.x = null;
  pointer.y = null;
});
addEventListener("resize", resize);
resize();
if (!reduced) animate();
else draw();
addEventListener("scroll", () => {
  header.classList.toggle("scrolled", scrollY > 30);
  let current = "";
  document.querySelectorAll("main section[id]").forEach((s) => {
    if (scrollY >= s.offsetTop - 180) current = s.id;
  });
  document
    .querySelectorAll(".nav-links a")
    .forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === `#${current}`),
    );
});
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }),
);
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      }),
    { threshold: 0.12 },
  );
  reveals.forEach((e, i) => {
    e.style.transitionDelay = `${Math.min(i % 5, 4) * 60}ms`;
    observer.observe(e);
  });
} else reveals.forEach((e) => e.classList.add("visible"));