import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, MapPin, QrCode, Shield, Users, BarChart3,
  Smartphone, Globe, ArrowRight, CheckCircle, Menu, X, Cpu,
  Database, Cloud, Wifi, Lock, RefreshCw, Zap, Star, Server,
  Activity, Layers, GitBranch, Key, TrendingUp, Clock, Bell,
  ChevronDown, Fingerprint, Radio, ChevronRight, ExternalLink,
  Terminal, Eye, Sparkles, Gauge, BookOpen
} from 'lucide-react'
import './LandingPage.css'

/* ───────────────────────────────── data ─── */
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'How It Works', href: '#how' },
  { label: 'Tech', href: '#tech' },
]

const STATS = [
  { value: 99.9, suffix: '%', label: 'Accuracy Rate', icon: Gauge },
  { value: 50,   suffix: '+', label: 'Institutions',  icon: BookOpen },
  { value: 10,   suffix: 'K+', label: 'Active Students', icon: Users },
  { value: 0.3,  suffix: 's', label: 'Mark Time',     icon: Clock },
]

const FEATURES = [
  {
    icon: QrCode, title: 'Rolling QR & OTP',
    desc: 'Auto-expiring codes rotate every 30 seconds. Backup OTP channel keeps attendance flowing even without camera.',
    color: '#6366f1', glow: 'rgba(99,102,241,0.35)',
    tag: 'Anti-Replay',
  },
  {
    icon: MapPin, title: 'GPS Geofencing',
    desc: 'Configurable per-classroom radius. Students outside the virtual boundary simply cannot mark — no exceptions.',
    color: '#10b981', glow: 'rgba(16,185,129,0.35)',
    tag: 'Location Guard',
  },
  {
    icon: Wifi, title: 'WiFi Fingerprint',
    desc: 'Campus SSID acts as a silent, invisible second factor — unbeatable for admins, seamless for students.',
    color: '#f59e0b', glow: 'rgba(245,158,11,0.35)',
    tag: 'Multi-Factor',
  },
  {
    icon: BarChart3, title: 'Live Analytics',
    desc: 'Session heatmaps, absentee trends, export to PDF/CSV — real-time data flowing across every screen.',
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.35)',
    tag: 'Real-Time',
  },
  {
    icon: Shield, title: 'RBAC Security',
    desc: 'Three-tier role system (Admin › Teacher › Student) backed by JWT + refresh-token rotation and audit logs.',
    color: '#06b6d4', glow: 'rgba(6,182,212,0.35)',
    tag: 'Enterprise Auth',
  },
  {
    icon: Fingerprint, title: 'Anti-Spoofing',
    desc: 'Three simultaneous checks — GPS + WiFi + QR — make proxy attendance mathematically near-impossible.',
    color: '#ec4899', glow: 'rgba(236,72,153,0.35)',
    tag: 'Zero Fraud',
  },
]

const HOW_STEPS = [
  { step: '01', icon: Key,          title: 'Teacher Opens Session',   desc: 'Start a timetable slot — the system instantly generates a rolling QR and optional OTP pin.' },
  { step: '02', icon: Radio,        title: 'Device Checks Location',  desc: 'Student app silently verifies GPS is inside the classroom geofence and WiFi SSID matches.' },
  { step: '03', icon: QrCode,       title: 'Scan or Enter PIN',        desc: 'A single scan (or 6-digit OTP) triggers a signed API call that cannot be reused or replayed.' },
  { step: '04', icon: TrendingUp,   title: 'Dashboard Updates Live',  desc: 'PostgreSQL records, Redis caches, and the teacher dashboard refreshes — all within milliseconds.' },
]

const TECH = [
  { name: 'React 18',    color: '#61dafb', desc: 'Web Dashboard',   bg: 'rgba(97,218,251,0.08)' },
  { name: 'FastAPI',     color: '#009688', desc: 'REST Backend',     bg: 'rgba(0,150,136,0.08)' },
  { name: 'PostgreSQL',  color: '#336791', desc: 'Primary DB',       bg: 'rgba(51,103,145,0.08)' },
  { name: 'Flutter',     color: '#54C5F8', desc: 'Mobile App',       bg: 'rgba(84,197,248,0.08)' },
  { name: 'Docker',      color: '#2496ed', desc: 'Containers',       bg: 'rgba(36,150,237,0.08)' },
  { name: 'Redis',       color: '#dc382d', desc: 'Cache & Sessions', bg: 'rgba(220,56,45,0.08)' },
  { name: 'Nginx',       color: '#269539', desc: 'Load Balancer',    bg: 'rgba(38,149,57,0.08)' },
  { name: 'SQLAlchemy',  color: '#b5202e', desc: 'ORM Layer',        bg: 'rgba(181,32,46,0.08)' },
]

const MARQUEE_ITEMS = [
  'GPS Geofencing', 'QR Attendance', 'OTP Verification', 'WiFi Fingerprint',
  'Live Analytics', 'RBAC Security', 'JWT Auth', 'Docker Deploy',
  'Audit Logging', 'Code Rotation', 'Real-Time Sync', 'Mobile App',
]

/* ══════════════════ PARTICLE CANVAS ══════════════════ */
function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId, particles = []
    const N = 70
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    for (let i = 0; i < N; i++) particles.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.5 + 0.4,
    })
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(99,102,241,0.55)'; ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 130) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(99,102,241,${0.18 * (1 - d / 130)})`; ctx.lineWidth = 0.6; ctx.stroke()
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="particle-canvas" />
}

/* ══════════════════ COUNT-UP ══════════════════ */
function useCountUp(target, dur = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    const isFloat = !Number.isInteger(target)
    let cur = 0; const steps = 60; const inc = target / steps
    const t = setInterval(() => {
      cur = Math.min(cur + inc, target)
      setCount(isFloat ? parseFloat(cur.toFixed(1)) : Math.round(cur))
      if (cur >= target) clearInterval(t)
    }, dur / steps)
    return () => clearInterval(t)
  }, [start, target, dur])
  return count
}

/* ══════════════════ STAT CARD ══════════════════ */
function StatCard({ value, suffix, label, icon: Icon }) {
  const ref = useRef(null); const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect()
  }, [])
  const count = useCountUp(value, 1600, vis)
  return (
    <div ref={ref} className="stat-card">
      <div className="stat-card-icon"><Icon size={18} /></div>
      <span className="stat-num">{count}{suffix}</span>
      <span className="stat-lbl">{label}</span>
    </div>
  )
}

/* ══════════════════ TILT CARD ══════════════════ */
function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const x = ((e.clientX - left) / width - 0.5) * 22
    const y = ((e.clientY - top) / height - 0.5) * -22
    el.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg) scale(1.025)`
  }, [])
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateY(0) rotateX(0) scale(1)'
  }, [])
  return <div ref={ref} className={`tilt-wrap ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</div>
}

/* ══════════════════ 3D DEVICE ══════════════════ */
function DeviceMockup() {
  const [screenState, setScreenState] = useState(0)
  const screens = [
    {
      id: 'qr',
      content: (
        <div className="psc-qr">
          <div className="psc-qr-frame">
            <div className="psc-qr-grid">
              {[...Array(25)].map((_, i) => (
                <div key={i} className={`psc-qr-cell ${[0,1,2,3,4,5,9,10,12,14,15,19,20,21,22,23,24].includes(i) ? 'filled' : ''}`} />
              ))}
            </div>
            <div className="qr-corner qc-tl" /><div className="qr-corner qc-tr" />
            <div className="qr-corner qc-bl" />
          </div>
          <span className="psc-qr-label">Scan to Mark Attendance</span>
          <div className="psc-timer"><div className="psc-timer-bar" /></div>
        </div>
      )
    },
    {
      id: 'verifying',
      content: (
        <div className="psc-verifying">
          <motion.div
            className="verify-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MapPin size={18} />
            <span>Checking Geofence...</span>
            <motion.div className="spinner" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
          </motion.div>
          <motion.div
            className="verify-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
          >
            <Wifi size={18} />
            <span>Validating Network...</span>
            <motion.div className="spinner" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear', delay: 1.5 }} />
          </motion.div>
          <motion.div
            className="verify-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.2 }}
          >
            <Shield size={18} />
            <span>Securing Connection...</span>
            <motion.div className="spinner" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear', delay: 3 }} />
          </motion.div>
        </div>
      )
    },
    {
      id: 'success',
      content: (
        <div className="psc-success">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          >
            <CheckCircle size={48} className="success-icon" />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Attendance Marked
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Welcome, Priya!
          </motion.p>
        </div>
      )
    }
  ]

  useEffect(() => {
    const sequence = () => {
      setScreenState(0); // QR
      setTimeout(() => setScreenState(1), 4000); // Verifying
      setTimeout(() => setScreenState(2), 8000); // Success
    };
    sequence();
    const interval = setInterval(sequence, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="device-scene">
      <div className="ring ring1" /><div className="ring ring2" /><div className="ring ring3" />
      <div className="device-glow-orb" />
      <div className="phone-3d">
        <div className="phone-body">
          <div className="phone-notch" />
          <div className="scan-line" />
          <div className="phone-screen-inner">
            <div className="psc-top">
              <span className="psc-logo">🎓 SmartAttend</span>
              <Bell size={11} className="psc-bell" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={screenState}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="screen-content-wrapper"
              >
                {screens[screenState].content}
              </motion.div>
            </AnimatePresence>
            <div className="psc-stats">
              <div className="psc-stat-item"><TrendingUp size={9} /><span>32 / 40</span></div>
              <div className="psc-stat-item green"><CheckCircle size={9} /><span>Verified</span></div>
            </div>
            <div className="psc-badges">
              <span className="psc-badge"><MapPin size={8} /> GPS ✓</span>
              <span className="psc-badge"><Wifi size={8} /> WiFi ✓</span>
              <span className="psc-badge"><Shield size={8} /> Safe</span>
            </div>
          </div>
        </div>
      </div>
      <div className="chip chip-gps"><MapPin size={11} /> Location Verified</div>
      <div className="chip chip-users"><Users size={11} /> 32 Present</div>
      <div className="chip chip-secure"><Lock size={11} /> Encrypted</div>
      <div className="chip chip-time"><Clock size={11} /> Live Session</div>
    </div>
  )
}

/* ══════════════════ ARCHITECTURE DIAGRAM ══════════════════ */
const ARCH_LAYERS_V2 = [
  {
    id: 'client', label: 'Client Layer', color: '#6366f1', icon: Globe,
    desc: 'Flutter mobile app + React web dashboard',
    nodes: [
      { icon: Smartphone, label: 'Flutter App',   sub: 'Android / iOS', color: '#54C5F8' },
      { icon: Globe,       label: 'React Web',     sub: 'Admin Dashboard', color: '#61dafb' },
    ],
  },
  {
    id: 'gateway', label: 'API Gateway', color: '#06b6d4', icon: Server,
    desc: 'Nginx reverse proxy & load balancer',
    nodes: [
      { icon: Server, label: 'Nginx',   sub: 'Reverse Proxy / SSL', color: '#269539' },
    ],
  },
  {
    id: 'services', label: 'Application Layer', color: '#8b5cf6', icon: Cpu,
    desc: 'FastAPI microservice with RBAC & audit trail',
    nodes: [
      { icon: Activity,   label: 'FastAPI',  sub: 'REST + Auth + RBAC', color: '#009688' },
      { icon: Lock,       label: 'JWT Auth', sub: 'Access + Refresh tokens', color: '#f59e0b' },
    ],
  },
  {
    id: 'data', label: 'Data Layer', color: '#10b981', icon: Database,
    desc: 'Persistent storage + blazing-fast caching',
    nodes: [
      { icon: Database, label: 'PostgreSQL', sub: 'Primary Store', color: '#336791' },
      { icon: Cloud,    label: 'Redis',      sub: 'Cache / Sessions', color: '#dc382d' },
    ],
  },
]

const FLOW_LABELS = [
  { label: 'HTTPS', sub: 'JWT Bearer' },
  { label: 'Proxy', sub: 'SSL Termination' },
  { label: 'SQL / Cache', sub: 'ORM + Redis client' },
]

function ArchNode({ icon: Icon, label, sub, color }) {
  return (
    <div className="v2-arch-node" style={{ '--nc': color }}>
      <div className="v2-arch-node-icon"><Icon size={17} /></div>
      <div className="v2-arch-node-text">
        <span className="v2-arch-node-label">{label}</span>
        <span className="v2-arch-node-sub">{sub}</span>
      </div>
      <div className="v2-arch-node-dot" />
    </div>
  )
}

function ArchDiagramV2() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const legendItems = [
    { icon: Lock,      label: 'JWT + Refresh Tokens' },
    { icon: RefreshCw, label: 'Code Rotation (QR/OTP)' },
    { icon: Layers,    label: 'Docker Compose' },
    { icon: GitBranch, label: 'RBAC (Admin/Teacher/Student)' },
    { icon: Activity,  label: 'Audit Logging' },
    { icon: Zap,       label: 'Redis Caching' },
    { icon: MapPin,    label: 'GPS Geofencing' },
    { icon: Shield,    label: 'Anti-Spoofing Layer' },
  ]

  return (
    <div className="v2-arch-outer" ref={ref}>
      {/* ── Left: stacked layers ── */}
      <div className="v2-arch-main-col">
        {ARCH_LAYERS_V2.map((layer, li) => {
          const y = useTransform(scrollYProgress, [0, 1], [-100 * (ARCH_LAYERS_V2.length - li), 0])
          return (
            <div key={layer.id} className="v2-arch-row">
              <motion.div
                className="v2-arch-layer"
                style={{ '--lc': layer.color, y }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: li * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="v2-arch-layer-head">
                  <div className="v2-arch-layer-badge"
                    style={{ background: `${layer.color}18`, borderColor: `${layer.color}35` }}>
                    <layer.icon size={13} style={{ color: layer.color }} />
                    <span style={{ color: layer.color }}>{layer.label}</span>
                  </div>
                  <p className="v2-arch-layer-desc">{layer.desc}</p>
                </div>
                <div className="v2-arch-nodes">
                  {layer.nodes.map((n, ni) => <ArchNode key={ni} {...n} />)}
                </div>
                <div className="v2-arch-layer-glow"
                  style={{ background: `radial-gradient(ellipse at center, ${layer.color}12, transparent 70%)` }} />
              </motion.div>

              {li < ARCH_LAYERS_V2.length - 1 && (
                <motion.div className="v2-arch-connector"
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                  transition={{ delay: li * 0.12 + 0.3 }} viewport={{ once: true }}
                >
                  <div className="v2-conn-line">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="v2-conn-packet" style={{ animationDelay: `${i * 0.6}s` }} />
                    ))}
                  </div>
                  <div className="v2-conn-label">
                    <span className="v2-conn-main">{FLOW_LABELS[li].label}</span>
                    <span className="v2-conn-sub">{FLOW_LABELS[li].sub}</span>
                  </div>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>{/* end v2-arch-main-col */}

      {/* ── Right: sticky legend ── */}
      <div className="v2-arch-legend">
        {legendItems.map((item, i) => (
          <motion.div
            key={item.label}
            className="v2-legend-item"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <item.icon size={13} className="v2-legend-icon" />
            <span>{item.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


/* ══════════════════ DASHBOARD PREVIEW ══════════════════ */
function DashboardPreview() {
  const bars = [55, 78, 45, 92, 68, 88, 52, 80, 94, 60, 75, 85]
  return (
    <div className="dash-preview">
      <div className="dash-topbar">
        <div className="dash-breadcrumb">
          <span>Reports</span><ChevronRight size={12} /><span className="dash-active">Analytics</span>
        </div>
        <span className="dash-live"><span className="dash-dot" /> Live</span>
      </div>
      <div className="dash-kpis">
        {[
          { label: 'Present', val: '248', color: '#10b981', icon: '✓' },
          { label: 'Absent',  val: '32',  color: '#ef4444', icon: '✗' },
          { label: 'Rate',    val: '88.5%', color: '#6366f1', icon: '%' },
        ].map(k => (
          <div key={k.label} className="dash-kpi" style={{ '--kc': k.color }}>
            <span className="dash-kpi-icon">{k.icon}</span>
            <span className="dash-kpi-val">{k.val}</span>
            <span className="dash-kpi-lbl">{k.label}</span>
          </div>
        ))}
      </div>
      <div className="dash-chart-wrap">
        <span className="dash-chart-title">Attendance (%)</span>
        <div className="dash-chart">
          {bars.map((h, i) => (
            <div key={i} className="dash-bar-wrap">
              <div className="dash-bar" style={{ '--bh': `${h}%`, animationDelay: `${i * 0.07}s` }} />
            </div>
          ))}
        </div>
        <div className="dash-chart-axis">
          {['Mon','Tue','Wed','Thu','Fri','Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
      </div>
      <div className="dash-table-head">
        <span>Name</span><span>Status</span><span>Time</span>
      </div>
      {[
        { name: 'Rahul Sharma', status: 'Present', time: '09:02' },
        { name: 'Priya Nair',   status: 'Present', time: '09:04' },
        { name: 'Aman Verma',   status: 'Absent',  time: '—' },
        { name: 'Sneha Gupta',  status: 'Present', time: '09:06' },
      ].map((r, i) => (
        <div key={i} className="dash-row">
          <span className="dash-name"><span className="dash-avatar">{r.name[0]}</span>{r.name}</span>
          <span className={`dash-status ${r.status === 'Absent' ? 'absent' : ''}`}>{r.status}</span>
          <span className="dash-time">{r.time}</span>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════ MAIN PAGE ══════════════════ */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const heroY    = useTransform(scrollY, [0, 600], [0, 160])
  const heroOp   = useTransform(scrollY, [0, 500], [1, 0])
  const deviceY  = useTransform(scrollY, [0, 600], [0, -70])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="lp">
      <ParticleCanvas />
      <div className="lp-bg">
        <div className="orb o1"/><div className="orb o2"/>
        <div className="orb o3"/><div className="orb o4"/>
        <div className="grid-overlay"/>
      </div>

      {/* ════════ NAVBAR ════════ */}
      <nav className={`lp-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-brand" id="nav-logo">
            <div className="brand-icon-wrap"><GraduationCap size={18} /></div>
            <span>SmartAttend</span>
          </Link>
          <div className="nav-center">
            {NAV_LINKS.map(l => <a key={l.href} href={l.href} className="nav-link">{l.label}</a>)}
          </div>
          <div className="nav-right">
            <Link to="/auth/login" className="nav-btn-ghost" id="nav-login">Sign In</Link>
            <Link to="/auth/login" className="nav-btn-primary" id="nav-cta">Get Started →</Link>
          </div>
          <button className="nav-mobile-btn" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            {menuOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div className="nav-mobile-menu"
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            >
              {NAV_LINKS.map(l => <a key={l.href} href={l.href} className="nm-link" onClick={() => setMenuOpen(false)}>{l.label}</a>)}
              <Link to="/auth/login" className="nav-btn-primary w100" onClick={() => setMenuOpen(false)}>Get Started →</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ════════ HERO ════════ */}
      <section className="lp-hero" id="hero">
        <motion.div className="hero-text-col" style={{ y: heroY, opacity: heroOp }}>
          <motion.div className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          >
            <Sparkles size={13} className="badge-star" /> Next-Gen Attendance Platform
          </motion.div>
          <motion.h1 className="hero-h1"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}
          >
            Attendance<br />
            <span className="grad-text">Reinvented</span><br />
            with AI &amp;&nbsp;GPS
          </motion.h1>
          <motion.p className="hero-sub"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          >
            Multi-factor verification — GPS geofencing, rolling QR, WiFi fingerprint &amp; OTP — in a single beautiful platform trusted by 50+ institutions.
          </motion.p>
          <motion.div className="hero-actions"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          >
            <Link to="/auth/login" className="btn-hero-primary" id="hero-cta">
              Start Free Trial <ArrowRight size={15}/>
            </Link>
            <a href="#architecture" className="btn-hero-ghost">
              View Architecture <ChevronDown size={15}/>
            </a>
          </motion.div>
          <motion.div className="hero-tags"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
          >
            {['GPS Geofencing', 'Anti-Spoofing', 'RBAC Auth', 'Real-Time Sync', 'Mobile App'].map(t => (
              <span key={t} className="hero-tag"><CheckCircle size={10}/>{t}</span>
            ))}
          </motion.div>
        </motion.div>
        <motion.div className="hero-device-col" style={{ y: deviceY }}>
          <DeviceMockup />
        </motion.div>
      </section>

      {/* ════════ MARQUEE ════════ */}
      <div className="marquee-section">
        <div className="marquee-inner">
          <div className="marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="marquee-item"><Zap size={11}/>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ STATS ════════ */}
      <section className="lp-stats" id="stats">
        <div className="section-inner stats-grid">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="lp-features" id="features">
        <div className="section-inner">
          <div className="section-head">
            <div className="section-tag">Features</div>
            <h2 className="section-h2">Everything You Need.<br /><span className="grad-text">Nothing You Don't.</span></h2>
            <p className="section-sub">Six pillars of a fraud-proof, real-time attendance experience.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
              >
                <TiltCard>
                  <div className="feature-card" style={{ '--fc': f.color, '--fg': f.glow }}>
                    <div className="feature-card-glow"/>
                    <div className="fc-top">
                      <div className="feature-icon-wrap"><f.icon size={22}/></div>
                      <span className="feature-tag">{f.tag}</span>
                    </div>
                    <h3 className="feature-title">{f.title}</h3>
                    <p className="feature-desc">{f.desc}</p>
                    <div className="feature-bottom-line"/>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ ARCHITECTURE ════════ */}
      <section className="lp-arch" id="architecture">
        <div className="section-inner">
          <div className="section-head">
            <div className="section-tag">System Architecture</div>
            <h2 className="section-h2">Built for Scale.<br /><span className="grad-text">Designed for Clarity.</span></h2>
            <p className="section-sub">A layered, containerised architecture — from mobile client to PostgreSQL — with animated real-time data flow.</p>
          </div>
          <ArchDiagramV2 />
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="lp-how" id="how">
        <div className="section-inner">
          <div className="section-head">
            <div className="section-tag">How It Works</div>
            <h2 className="section-h2">Four Steps.<br /><span className="grad-text">Zero Proxies.</span></h2>
          </div>
          <div className="how-steps-v2">
            {HOW_STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                className="how-step-v2"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="how-step-v2-icon" style={{ '--icon-bg': `color-mix(in srgb, ${FEATURES[i % FEATURES.length].color} 20%, transparent)` }}>
                  <s.icon size={24} style={{ color: FEATURES[i % FEATURES.length].color }}/>
                </div>
                <div className="how-step-v2-num">{s.step}</div>
                <h3 className="how-step-v2-title">{s.title}</h3>
                <p className="how-step-v2-desc">{s.desc}</p>
              </motion.div>
            ))}
            <motion.div
              className="how-connector-line"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              viewport={{ once: true }}
            >
              <svg width="100%" height="100%" viewBox="0 0 1100 100" preserveAspectRatio="none">
                <motion.path
                  d="M 100,50 C 250,50 250,50 400,50 C 550,50 550,50 700,50 C 850,50 850,50 1000,50"
                  fill="transparent"
                  stroke="url(#grad-connector)"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />
                <defs>
                  <linearGradient id="grad-connector" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(99, 102, 241, 0.2)" />
                    <stop offset="50%" stopColor="rgba(99, 102, 241, 1)" />
                    <stop offset="100%" stopColor="rgba(99, 102, 241, 0.2)" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ LIVE DASHBOARD ════════ */}
      <section className="lp-demo" id="demo">
        <div className="section-inner demo-inner">
          <motion.div className="demo-text"
            initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          >
            <div className="section-tag">Live Preview</div>
            <h2 className="section-h2">Your Dashboard.<br /><span className="grad-text">Fully Real-Time.</span></h2>
            <p className="section-sub">Instant visibility across every session. Absentee alerts, QR refresh timers, and CSV export — all in one pane of glass.</p>
            <ul className="demo-list">
              {['Live feed per session, updated instantly', 'Exportable PDF & CSV reports', 'Admin, Teacher & Student views', 'Mobile-first, fully responsive layout'].map(item => (
                <li key={item}><CheckCircle size={14}/>{item}</li>
              ))}
            </ul>
            <Link to="/auth/login" className="btn-hero-primary" id="demo-cta" style={{ marginTop: '2rem', display: 'inline-flex' }}>
              Try the Dashboard <ArrowRight size={15}/>
            </Link>
          </motion.div>
          <motion.div className="demo-device"
            initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          >
            <div className="demo-glow"/>
            <DashboardPreview />
          </motion.div>
        </div>
      </section>

      {/* ════════ TECH STACK ════════ */}
      <section className="lp-tech" id="tech">
        <div className="section-inner">
          <div className="section-head">
            <div className="section-tag">Technology</div>
            <h2 className="section-h2">Built on a <span className="grad-text">Modern Stack</span></h2>
            <p className="section-sub">Industry-proven, open-source, battle-tested at scale.</p>
          </div>
          <div className="tech-grid">
            {TECH.map((t, i) => (
              <motion.div key={t.name} className="tech-tile"
                initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }} viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.04 }}
                style={{ background: t.bg }}
              >
                <div className="tech-dot-big" style={{ background: t.color }}/>
                <div className="tech-name">{t.name}</div>
                <div className="tech-desc-sm">{t.desc}</div>
                <div className="tech-tile-glow" style={{ '--tc': t.color }}/>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="lp-cta" id="cta">
        <div className="cta-orb cta-o1"/><div className="cta-orb cta-o2"/>
        <motion.div className="cta-box"
          initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <div className="cta-badge"><Zap size={12}/> Ready to Deploy</div>
          <h2 className="cta-h2">Stop Chasing Attendance.<br /><span className="grad-text">Let SmartAttend Handle It.</span></h2>
          <p className="cta-sub">Free to get started. Scales to your entire institution in minutes.</p>
          <div className="cta-row">
            <Link to="/auth/login" className="btn-hero-primary large" id="cta-main">
              Start Free Trial <ArrowRight size={17}/>
            </Link>
            <a href="#architecture" className="btn-hero-ghost">Explore Architecture</a>
          </div>
        </motion.div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="lp-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand-icon-wrap sm"><GraduationCap size={15}/></div>
            <span>SmartAttend</span>
          </div>
          <p className="footer-tagline">Making education smarter, one scan at a time.</p>
          <p className="footer-copy">© 2026 SmartAttend · Built with React, FastAPI &amp; ❤️</p>
        </div>
      </footer>
    </div>
  )
}
