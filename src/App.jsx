import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import './index.css';

// Import 3D WebGL components
import CameraController from './components/CameraController';
import SpaceEnvironment from './components/SpaceEnvironment';
import Particles from './components/Particles';
import deloitteSimImg from './assets/deloitte_simulation.png';
import MobilePortfolio from './components/MobilePortfolio';
import { ShieldCheck, Brain, Zap, Database, Code, Download } from 'lucide-react';

// Predefined 3D coordinates for each sector in the Latent Space
const sectorCoordinates = {
  hero: [0, 0, 0],
  about: [-12, 5, -8],
  projects: [12, -5, -8],
  terminal: [0, -12, -10],
  skills: [-10, -7, -7],
  credentials: [10, 7, -8],
  contact: [0, 10, -6]
};

// Project data structure with filter categories
const projectsData = [
  {
    id: 1,
    title: "GPT-2 Code Completion using CodeXGLUE",
    description: "Fine-tuning GPT-2 for Python source code completion using the CodeXGLUE dataset. Achieved a validation perplexity of 3.28 using PyTorch, Hugging Face Transformers, mixed precision (FP16), and gradient checkpointing.",
    tags: ["Python", "PyTorch", "Hugging Face", "GPT-2", "NLP"],
    category: "data-science",
    github: "https://github.com/SaiNanduVajhala/code-completion-gpt2"
  },
  {
    id: 2,
    title: "Emotion-Aware Multimodal Voice Assistant",
    description: "A low-latency, full-duplex AI voice assistant combining real-time face tracking, demographic locking, and aggressive software echo cancellation. Adapts tone and voice dynamically based on user emotions and age.",
    tags: ["Python", "FastAPI", "WebSockets", "OpenAI"],
    category: "ai-agents",
    github: "https://github.com/SaiNanduVajhala/Voice_Model_with_full_duplex"
  },
  {
    id: 3,
    title: "lexiRead",
    description: "An AI-powered reading companion designed to instantly transform complex, dense texts into clear, digestible, and visually stress-free formats using Google Gemma. Features bionic typography and Socratic learning.",
    tags: ["HTML", "CSS", "JavaScript", "Accessibility"],
    category: "accessibility",
    github: "https://github.com/SaiNanduVajhala/lexiRead"
  },
  {
    id: 4,
    title: "Market Mood Trading Analysis",
    description: "An exploratory data analysis (EDA) investigating the relationship between cryptocurrency trader performance and market sentiment. Merges daily sentiment with historical execution data from Hyperliquid.",
    tags: ["Python", "Data Analysis", "Trading Analytics"],
    category: "data-science",
    github: "https://github.com/SaiNanduVajhala/market-mood-trading-analysis"
  },
  {
    id: 5,
    title: "CrewAI Trading Agent",
    description: "A multi-agent Python system using the CrewAI framework that automatically generates daily US financial market summaries. Features specialized agents for data collection, analysis, and bilingual Hindi/English reports.",
    tags: ["Python", "CrewAI", "Groq LLM", "YAML"],
    category: "ai-agents",
    github: "https://github.com/SaiNanduVajhala/CrewAI-Trading-Agent"
  }
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 160 : direction < 0 ? -160 : 0,
    opacity: 0,
    scale: 0.96
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: (direction) => ({
    x: direction < 0 ? 160 : direction > 0 ? -160 : 0,
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1]
    }
  })
};

// Custom inline SVG icons matching mobile view
const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);

const LinkedInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);

const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
);

const KaggleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .236.06.281.18.046.149.034.238-.036.27l-6.555 6.344 6.836 8.507c.095.104.117.208.075.328z" /></svg>
);

// Generate a mathematically even and beautiful starfield for the landing screen
const preloaderStars = (() => {
  const starsList = [];
  const cols = 20; // 20 columns
  const rows = 12; // 12 rows
  const colors = ['#FFFFFF', '#E6F0FF', '#B0D0FF', '#FFF3E3', '#FFEAE0'];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Base percentages for even grid layout
      const baseLeft = (c / cols) * 100;
      const baseTop = (r / rows) * 100;

      // Jitter offset within the grid cell to look natural but not clustered
      const jitterLeft = Math.random() * (100 / cols) * 0.9;
      const jitterTop = Math.random() * (100 / rows) * 0.9;

      const left = baseLeft + jitterLeft;
      const top = baseTop + jitterTop;

      // Fine, sharp stars (1px to 2.5px)
      const size = Math.random() * 1.5 + 1;
      const opacity = Math.random() * 0.65 + 0.35;
      const color = colors[Math.floor(Math.random() * colors.length)];

      const twinkleDuration = Math.random() * 3 + 2.5;
      const twinkleDelay = Math.random() * 5;

      starsList.push({
        left: `${left}%`,
        top: `${top}%`,
        size: `${size}px`,
        opacity,
        color,
        twinkleDuration: `${twinkleDuration}s`,
        twinkleDelay: `${twinkleDelay}s`
      });
    }
  }
  return starsList;
})();

function App() {
  const [theme, setTheme] = useState("dark");
  const [hasEntered, setHasEntered] = useState(false);
  const [activeSector, setActiveSector] = useState("hero");
  const [filter, setFilter] = useState("all");
  const [cardFlipped, setCardFlipped] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0); // -1 for left, 1 for right
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);


  // Terminal Simulator State
  const [terminalHistory, setTerminalHistory] = useState([
    { text: "System initialized. Welcome to Sai Nandu's portfolio command line.", type: "system" },
    { text: "Type 'help' to see list of available commands.", type: "system" }
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalBodyRef = useRef(null);

  // Spotlight Mouse Tracking Hook
  const useSpotlight = () => {
    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };
    return { onMouseMove: handleMouseMove };
  };

  const spotlight = useSpotlight();

  // Terminal Input logic
  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    const newHistory = [...terminalHistory, { text: `> ${terminalInput}`, type: "input" }];

    if (cmd === "help") {
      newHistory.push(
        { text: "Available commands:", type: "system" },
        { text: "  about     - Brief introduction & summary", type: "info" },
        { text: "  projects  - Show featured AI/ML projects", type: "info" },
        { text: "  skills    - List core programming & tech stack", type: "info" },
        { text: "  clear     - Clean up the terminal console screen", type: "info" }
      );
    } else if (cmd === "about") {
      newHistory.push({ text: "Vajhala Sai Nandu: B.Tech CSE student specializing in AI/ML, competitive programming, algorithmic problem-solving, and practical GenAI applications.", type: "success" });
    } else if (cmd === "projects") {
      newHistory.push(
        { text: "1. Emotion-Aware Multimodal Voice Assistant (FastAPI, WebSockets)", type: "success" },
        { text: "2. CrewAI Trading Agent (Autonomous summarizer)", type: "success" },
        { text: "3. lexiRead (Accessibility engine for dyslexia)", type: "success" },
        { text: "4. Market Mood Trading Analysis (Crypto Fear & Greed analyzer)", type: "success" },
        { text: "5. GPT-2 Code Completion using CodeXGLUE (Transformer code generation)", type: "success" }
      );
    } else if (cmd === "skills") {
      newHistory.push({ text: "Languages: Python, Java, R, C | Tech: React, FastAPI, Node.js, CrewAI | DB: PostgreSQL, MongoDB, MySQL", type: "success" });
    } else if (cmd === "clear") {
      setTerminalHistory([]);
      setTerminalInput("");
      return;
    } else {
      newHistory.push({ text: `Unknown command: '${cmd}'. Type 'help' for instructions.`, type: "error" });
    }

    setTerminalHistory(newHistory);
    setTerminalInput("");
  };

  // Scroll terminal internally to bottom without bouncing the main window
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const filteredProjects = filter === "all"
    ? projectsData
    : projectsData.filter(p => p.category === filter);

  return (
    <>
      {/* 1. Main Portfolio (loaded in parallel in background) */}
      {isMobile ? (
        <MobilePortfolio theme={theme} setTheme={setTheme} />
      ) : (
        <div style={{ width: '100%', height: '100%' }}>
          {/* 1. Ultra-Premium Glassmorphic HUD Navbar */}
          <nav className="hud-nav-bar">
            <div className="container hud-nav-content">
              <button onClick={() => setActiveSector("hero")} className="text-accent" style={{ background: 'none', border: 'none', fontWeight: 700, fontSize: '1.25rem', fontFamily: 'Space Grotesk', cursor: 'pointer' }}>SV.</button>

              {isMobile ? (
                <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {isMobileMenuOpen ? (
                      <>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </>
                    ) : (
                      <>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                      </>
                    )}
                  </svg>
                </button>
              ) : null}

              <div className={`hud-nav-links ${isMobile ? 'mobile-hidden' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                <button onClick={() => { setActiveSector("hero"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "hero" ? "hud-nav-btn-active" : ""}`}>Home</button>
                <button onClick={() => { setActiveSector("about"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "about" ? "hud-nav-btn-active" : ""}`}>About</button>
                <button onClick={() => { setActiveSector("projects"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "projects" ? "hud-nav-btn-active" : ""}`}>Projects</button>
                <button onClick={() => { setActiveSector("terminal"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "terminal" ? "hud-nav-btn-active" : ""}`}>Sandbox</button>
                <button onClick={() => { setActiveSector("skills"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "skills" ? "hud-nav-btn-active" : ""}`}>Skills</button>
                <button onClick={() => { setActiveSector("credentials"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "credentials" ? "hud-nav-btn-active" : ""}`}>Credentials</button>
                <button onClick={() => { setActiveSector("contact"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "contact" ? "hud-nav-btn-active" : ""}`}>Contact</button>
              </div>
            </div>
          </nav>

          {/* Particles background — desktop only */}
          {!isMobile && (
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
            }}>
              <Particles
                particleColors={['#C8C8C8', '#E0E0E0', '#A0A0A0', '#F0F0F0']}
                particleCount={180}
                particleSpread={8}
                speed={0.06}
                particleBaseSize={200}
                alphaParticles={true}
                moveParticlesOnHover={true}
                particleHoverFactor={0.4}
                sizeRandomness={1.2}
                disableRotation={false}
                pixelRatio={Math.min(window.devicePixelRatio, 1.5)}
              />
            </div>
          )}

          {/* 2. Full-Screen WebGL Canvas Universe */}
          <div className="canvas-container-3d">
            <Canvas
              camera={{ position: [0, 0, 6], fov: isMobile ? 68 : 55 }}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              dpr={[1, 1.5]}
            >
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1.2} />

              {/* Background galaxy environment & connecting neural pathways */}
              <SpaceEnvironment sectorCoordinates={sectorCoordinates} theme={theme} />

              {/* Smooth camera flight transitions */}
              <CameraController activeSector={activeSector} sectorCoordinates={sectorCoordinates} hasEntered={hasEntered} />

              {/* 🛸 SECTOR: HERO [0, 0, 0] */}
              <group position={sectorCoordinates.hero}>
                <Html
                  position={[0, -0.5, 0]}
                  transform
                  pixelPerfect
                  scale={0.66}
                  distanceFactor={4.5}
                  className="r3f-html-wrapper"
                  style={{
                    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                    opacity: activeSector === 'hero' ? 1 : 0,
                    visibility: activeSector === 'hero' ? 'visible' : 'hidden',
                    pointerEvents: activeSector === 'hero' ? 'auto' : 'none'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: isMobile ? '2rem' : '3rem', width: isMobile ? '340px' : '960px', alignItems: 'center', textAlign: isMobile ? 'center' : 'left', transform: 'scale(1.5)', transformOrigin: 'center' }}>
                    <div style={{ position: 'relative', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <h1 className="heading-lg" style={{ margin: 0, lineHeight: 1.1 }}>
                          Sai Nandu Vajhala.<br />
                          <span className="text-accent">AI/ML Engineer.</span>
                        </h1>
                        <p className="body-lg" style={{ margin: '1.5rem 0 2rem 0', fontSize: '1.2rem' }}>
                          BTech student in Artificial Intelligence &amp; Machine Learning.<br />
                          Building intelligent agents, real-time systems, and data-driven automation.
                        </p>
                        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: isMobile ? 'center' : 'flex-start', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                          <button onClick={() => setActiveSector("projects")} className="btn btn-premium-glow">View Projects</button>
                          <a href="./Vajhala_Sai_Nandu_AI_ML_Engineer_Resume.pdf" download="Vajhala_Sai_Nandu_AI_ML_Engineer_Resume.pdf" className="btn-neon-border" style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <Download size={16} style={{ marginRight: '8px' }} /> Download Resume
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="id-card-3d-container" style={{ transform: isMobile ? 'none' : 'translateX(50px)', margin: isMobile ? '0 auto' : '0' }}>

                      {/* Premium flip card — uses scaleX squeeze animation (CSS 3D backface-visibility broken in R3F Html) */}
                      <div className="id-card-wrapper" style={{ zIndex: 2 }} onMouseEnter={() => setCardFlipped(true)} onMouseLeave={() => setCardFlipped(false)}>
                        <div className="id-card">
                          <AnimatePresence>
                            {!cardFlipped ? (
                              <motion.div
                                key="front"
                                className="id-card-face id-card-front"
                                initial={{ scaleX: 0, opacity: 0.5 }}
                                animate={{ scaleX: 1, opacity: 1 }}
                                exit={{ scaleX: 0, opacity: 0.5 }}
                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                style={{ originX: 0.5 }}
                              >
                                <div className="id-card-front-top">
                                  <span className="id-card-front-top-label">Portfolio ID</span>
                                  <span className="id-card-front-top-company">AI/ML Engineering</span>
                                </div>
                                <div className="id-card-avatar">SN</div>
                                <div className="id-card-front-body">
                                  <span className="id-card-name">Sai Nandu Vajhala</span>
                                  <span className="id-card-role">AI/ML Engineer</span>
                                  <div className="id-card-divider" />
                                  <span className="id-card-dept">
                                    BTech · Sreyas Institute<br />Hyderabad, India
                                  </span>
                                  <div className="id-card-barcode">
                                    {[3, 5, 2, 7, 4, 6, 3, 5, 2, 4, 6, 3, 7, 5, 2, 4, 6, 3, 5, 4].map((h, i) => (
                                      <span key={i} style={{ width: i % 3 === 0 ? '3px' : '1.5px', height: `${h * 3}px` }} />
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="back"
                                className="id-card-face id-card-back"
                                initial={{ scaleX: 0, opacity: 0.5 }}
                                animate={{ scaleX: 1, opacity: 1 }}
                                exit={{ scaleX: 0, opacity: 0.5 }}
                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                style={{ originX: 0.5 }}
                              >
                                <div className="id-card-back-header">
                                  <span className="id-card-back-header-dot" />
                                  <span className="id-card-back-header-label">CONTACT DETAILS</span>
                                </div>
                                <div className="id-card-contact-row">
                                  <div className="id-card-contact-icon"><MailIcon /></div>
                                  <div className="id-card-contact-info">
                                    <span className="id-card-contact-label">Email</span>
                                    <span className="id-card-contact-value">
                                      <a href="https://mail.google.com/mail/?view=cm&to=vajhalasainandu@gmail.com" target="_blank" rel="noreferrer">vajhalasainandu@gmail.com</a>
                                    </span>
                                  </div>
                                </div>
                                <div className="id-card-contact-row">
                                  <div className="id-card-contact-icon"><MapPinIcon /></div>
                                  <div className="id-card-contact-info">
                                    <span className="id-card-contact-label">Location</span>
                                    <span className="id-card-contact-value">Hyderabad, India</span>
                                  </div>
                                </div>
                                <div className="id-card-contact-row">
                                  <div className="id-card-contact-icon"><LinkedInIcon /></div>
                                  <div className="id-card-contact-info">
                                    <span className="id-card-contact-label">LinkedIn</span>
                                    <span className="id-card-contact-value">
                                      <a href="https://www.linkedin.com/in/vajhala-sai-nandu/" target="_blank" rel="noreferrer">vajhala-sai-nandu</a>
                                    </span>
                                  </div>
                                </div>
                                <div className="id-card-contact-row">
                                  <div className="id-card-contact-icon"><GitHubIcon /></div>
                                  <div className="id-card-contact-info">
                                    <span className="id-card-contact-label">GitHub</span>
                                    <span className="id-card-contact-value">
                                      <a href="https://github.com/SaiNanduVajhala/" target="_blank" rel="noreferrer">SaiNanduVajhala</a>
                                    </span>
                                  </div>
                                </div>
                                <div className="id-card-contact-row">
                                  <div className="id-card-contact-icon"><KaggleIcon /></div>
                                  <div className="id-card-contact-info">
                                    <span className="id-card-contact-label">Kaggle</span>
                                    <span className="id-card-contact-value">
                                      <a href="https://www.kaggle.com/vajhalasainandu" target="_blank" rel="noreferrer">vajhalasainandu</a>
                                    </span>
                                  </div>
                                </div>
                                <div className="id-card-back-footer">
                                  <span className="id-card-back-footer-hint">Open to opportunities</span>
                                  <span style={{ width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 6px rgba(23,178,106,0.8)' }} />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="id-card-hint">
                          <span>↕</span> hover to flip
                        </div>
                      </div>
                    </div>
                  </div>
                </Html>
              </group>

              {/* 🧬 SECTOR: ABOUT [-12, 5, -8] */}
              <group position={sectorCoordinates.about}>
                <Html
                  position={[0, -0.5, 0]}
                  transform
                  distanceFactor={4.5}
                  className="r3f-html-wrapper"
                  style={{
                    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                    opacity: activeSector === 'about' ? 1 : 0,
                    visibility: activeSector === 'about' ? 'visible' : 'hidden',
                    pointerEvents: activeSector === 'about' ? 'auto' : 'none',
                    width: '1240px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1.5rem', width: '100%', alignItems: 'stretch' }}>
                    {/* Bento Block 1: About Me */}
                    <div className="glass-hud-card" style={{ width: '440px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                      <h2 className="heading-md" style={{ marginBottom: '1.25rem', fontSize: '2rem' }}>About Me</h2>
                      <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
                        Hello there! <b>I'm Vajhala Sai Nandu</b>, a B.Tech Computer Science student specializing in AI and Machine Learning, with a strong foundation in competitive programming and algorithmic problem-solving. My technical focus centers on building practical GenAI applications. I am deeply passionate about open-source contribution and continuously adapting to modern developer tools.
                      </p>

                      <div className="about-highlights-list" style={{ marginTop: 'auto' }}>
                        {[
                          "B.Tech CSE student specializing in AI & ML",
                          "Competitive Programming & Problem Solving",
                          "Machine Learning & GEN AI",
                          "Open Source and Continuous Learning"
                        ].map((hl, idx) => (
                          <div key={idx} className="about-highlight-item" style={{ fontSize: '0.9rem' }}>
                            <span className="about-highlight-dot" />
                            <span>{hl}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bento Block 2: Experience */}
                    <div className="glass-hud-card" style={{ width: '440px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                      <h2 className="heading-md" style={{ marginBottom: '1.25rem', fontSize: '2rem' }}>Experience</h2>
                      <div style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px', marginBottom: '0.25rem' }}>
                          <h4 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.05rem', fontWeight: '600' }}>Data Science Intern</h4>
                          <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Jun 2026 – Present</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--accent)', marginBottom: '0.75rem' }}>XYlofy AI — Remote</div>
                        <ul style={{ margin: 0, paddingLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                          <li style={{ marginBottom: '0.5rem' }}>Working on machine learning and data science projects involving data preprocessing, feature engineering, model training, and evaluation using Python.</li>
                          <li>Applying Pandas, NumPy, Scikit-learn, and Matplotlib for data analysis, visualization, and predictive modeling.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Bento Block 3: Academic Path */}
                    <div className="glass-hud-card" style={{ width: '320px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                      <h2 className="heading-md" style={{ marginBottom: '1.25rem', fontSize: '2rem' }}>Academic Path</h2>
                      <div style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '1.25rem' }}>
                        <h4 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.05rem', fontWeight: '600' }}>BTech in AI & ML</h4>
                        <p className="text-secondary" style={{ fontSize: '0.95rem', margin: '0.4rem 0' }}>Sreyas Institute</p>
                        <span className="text-secondary" style={{ fontSize: '0.85rem' }}>2024 - 2027</span>
                      </div>
                    </div>
                  </div>
                </Html>
              </group>

              {/* 🛸 SECTOR: PROJECTS [12, -5, -8] */}
              <group position={sectorCoordinates.projects}>
                <Html
                  position={[0, -1, 0]}
                  transform
                  distanceFactor={4.5}
                  className="r3f-html-wrapper"
                  style={{
                    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                    opacity: activeSector === 'projects' ? 1 : 0,
                    visibility: activeSector === 'projects' ? 'visible' : 'hidden',
                    pointerEvents: activeSector === 'projects' ? 'auto' : 'none'
                  }}
                >
                  <div style={{ width: isMobile ? '340px' : '920px' }} onWheel={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '1rem' : '0', marginBottom: '2rem' }}>
                      <h2 className="heading-md" style={{ margin: 0, fontSize: '2rem' }}>Featured Projects</h2>
                      <div className="filter-container" style={{ margin: 0 }}>
                        {["all", "ai-agents", "data-science", "accessibility"].map((cat) => {
                          const label = cat === "all" ? "All" : cat === "ai-agents" ? "AI Agents" : cat === "data-science" ? "Data Science" : "Accessibility";
                          const isActive = filter === cat;
                          return (
                            <button key={cat} className={`filter-btn ${isActive ? "active" : ""}`} onClick={() => { setFilter(cat); setCurrentProjectIndex(0); setSlideDirection(0); }}>
                              {isActive && <motion.span layoutId="activeFilterPill" className="filter-active-pill" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Relative Wrapper to mathematically lock arrow buttons to absolute 50% height of the card */}
                    <div style={{ position: 'relative', width: isMobile ? '100%' : '600px', height: '390px', margin: '2.5rem auto 1rem auto' }}>

                      {/* Left Arrow Button (Absolute Centered Outside Card) */}
                      <button
                        onClick={() => {
                          setSlideDirection(-1);
                          setCurrentProjectIndex((prev) => (prev === 0 ? filteredProjects.length - 1 : prev - 1));
                        }}
                        className="btn btn-premium-glow"
                        style={{
                          position: 'absolute',
                          left: isMobile ? '-10px' : '-22px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          borderRadius: '50%',
                          width: '44px',
                          height: '44px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border)',
                          backdropFilter: 'blur(10px)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          zIndex: 20
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M15 18l-6-6 6-6" /></svg>
                      </button>

                      {/* Slider Container holding the animated spotlight card */}
                      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
                        <AnimatePresence mode="wait" custom={slideDirection}>
                          {filteredProjects[currentProjectIndex] && (
                            <motion.div
                              key={filteredProjects[currentProjectIndex].id}
                              custom={slideDirection}
                              variants={slideVariants}
                              initial="enter"
                              animate="center"
                              exit="exit"
                              className="spotlight-card"
                              {...spotlight}
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                                boxShadow: 'var(--shadow-lg)'
                              }}
                            >
                              <div className="spotlight-glow" style={{ top: 'var(--mouse-y)', left: 'var(--mouse-x)' }}></div>
                              {/* Centered card padding and alignment */}
                              <div className="spotlight-content" style={{ padding: '2rem 2.2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                  {/* Centered header design */}
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', textAlign: 'center' }}>
                                    <span className="tag" style={{ textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.08em', alignSelf: 'center', padding: '3px 8px' }}>
                                      {filteredProjects[currentProjectIndex].category}
                                    </span>
                                    <h3 style={{ fontSize: '1.35rem', fontFamily: 'Space Grotesk', margin: 0, color: 'var(--text-primary)', lineHeight: 1.3, textAlign: 'center' }}>
                                      {filteredProjects[currentProjectIndex].title}
                                    </h3>
                                  </div>
                                  <p className="text-secondary custom-scrollbar" style={{ fontSize: '1.02rem', lineHeight: 1.65, marginTop: '0.5rem', height: '120px', overflowY: 'auto', paddingRight: '6px', textAlign: 'center' }}>
                                    {filteredProjects[currentProjectIndex].description}
                                  </p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  {/* Centered tag items */}
                                  <div className="card-tags" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', margin: '0.75rem 0 1.25rem 0' }}>
                                    {filteredProjects[currentProjectIndex].tags.map((tag, idx) => (
                                      <span key={idx} className="tag" style={{ fontSize: '0.8rem' }}>{tag}</span>
                                    ))}
                                  </div>

                                  {/* Symmetrical footer centering */}
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                                    <a
                                      href={filteredProjects[currentProjectIndex].github}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn btn-premium-glow"
                                      style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                    >
                                      <Code size={16} /> View Code
                                    </a>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                      Project {currentProjectIndex + 1} of {filteredProjects.length}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Right Arrow Button (Absolute Centered Outside Card) */}
                      <button
                        onClick={() => {
                          setSlideDirection(1);
                          setCurrentProjectIndex((prev) => (prev === filteredProjects.length - 1 ? 0 : prev + 1));
                        }}
                        className="btn btn-premium-glow"
                        style={{
                          position: 'absolute',
                          right: isMobile ? '-10px' : '-22px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          borderRadius: '50%',
                          width: '44px',
                          height: '44px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border)',
                          backdropFilter: 'blur(10px)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          zIndex: 20
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M9 18l6-6-6-6" /></svg>
                      </button>
                    </div>

                    {/* Dot Indicators */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                      {filteredProjects.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSlideDirection(idx > currentProjectIndex ? 1 : -1);
                            setCurrentProjectIndex(idx);
                          }}
                          style={{
                            width: idx === currentProjectIndex ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            background: idx === currentProjectIndex ? 'var(--accent)' : 'rgba(52, 64, 84, 0.5)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: idx === currentProjectIndex ? '0 0 8px var(--accent)' : 'none'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </Html>
              </group>

              {/* 🛸 SECTOR: SANDBOX (TERMINAL) [0, -12, -10] */}
              <group position={sectorCoordinates.terminal}>
                <Html
                  position={[0, -1.1, 0]}
                  transform
                  distanceFactor={4.5}
                  className="r3f-html-wrapper"
                  style={{
                    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                    opacity: activeSector === 'terminal' ? 1 : 0,
                    visibility: activeSector === 'terminal' ? 'visible' : 'hidden',
                    pointerEvents: activeSector === 'terminal' ? 'auto' : 'none'
                  }}
                >
                  <div className="glass-hud-card" style={{ width: isMobile ? '340px' : '720px' }}>
                    <h2 className="heading-md" style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Interactive Sandbox</h2>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Run commands inside this real-time portfolio console environment.</p>

                    <div className="terminal-container" style={{ height: '360px' }}>
                      <div className="terminal-header">
                        <div className="terminal-dots">
                          <div className="dot dot-red"></div>
                          <div className="dot dot-yellow"></div>
                          <div className="dot dot-green"></div>
                        </div>
                        <div className="terminal-title">bash - latent_shell</div>
                        <div></div>
                      </div>
                      <div className="terminal-body" ref={terminalBodyRef} style={{ height: '315px', fontSize: '0.88rem' }}>
                        {terminalHistory.map((item, index) => (
                          <div key={index} className={`terminal-line ${item.type}`}>{item.text}</div>
                        ))}
                        <form onSubmit={handleTerminalSubmit} className="terminal-input-line">
                          <span className="terminal-prompt" style={{ fontSize: '0.88rem' }}>sainandu@latent-space:~$</span>
                          <div style={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative' }}>
                            {terminalInput === "" && <span className="terminal-cursor" style={{ height: '14px' }}></span>}
                            <input type="text" value={terminalInput} onChange={(e) => setTerminalInput(e.target.value)} className="terminal-input" autoComplete="off" style={{ caretColor: 'transparent', fontSize: '0.88rem' }} />
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </Html>
              </group>

              {/* 🛸 SECTOR: SKILLS [-10, -7, -7] */}
              <group position={sectorCoordinates.skills}>
                <Html
                  position={[0, -1, 0]}
                  transform
                  distanceFactor={4.5}
                  className="r3f-html-wrapper"
                  style={{
                    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                    opacity: activeSector === 'skills' ? 1 : 0,
                    visibility: activeSector === 'skills' ? 'visible' : 'hidden',
                    pointerEvents: activeSector === 'skills' ? 'auto' : 'none'
                  }}
                >
                  <div style={{ width: isMobile ? '340px' : '920px' }}>
                    <h2 className="heading-md" style={{ marginBottom: '2rem', fontSize: '2rem' }}>Tech Stack & Dynamic Activity</h2>

                    <div className="skills-category-container" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1.25rem' }}>
                      <div className="skills-category-box" style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Brain size={18} style={{ color: 'var(--accent)' }} /> AI/ML &amp; Data Science
                        </h3>
                        <div className="skills-grid-uiverse">
                          {[
                            { name: "Python", color: "#3776AB" },
                            { name: "PyTorch", color: "#EE4C2C" },
                            { name: "TensorFlow", color: "#FF6F00" },
                            { name: "CrewAI", color: "#FF4B4B" },
                            { name: "Scikit-Learn", color: "#F7931E" },
                            { name: "Keras", color: "#D00000" },
                            { name: "NumPy", color: "#013243" },
                            { name: "Pandas", color: "#150458" },
                            { name: "SciPy", color: "#8CAAE6" },
                            { name: "Matplotlib", color: "#11557C" },
                            { name: "Plotly", color: "#3F4F75" },
                            { name: "R", color: "#276FDB" }
                          ].map((s, i) => (
                            <span
                              key={i}
                              className="skill-card-uiverse"
                            >
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--accent)',
                                boxShadow: '0 0 4px var(--accent)',
                                display: 'inline-block'
                              }} />
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="skills-category-box" style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Zap size={18} style={{ color: 'var(--accent)' }} /> Backends &amp; Web
                        </h3>
                        <div className="skills-grid-uiverse">
                          {[
                            { name: "FastAPI", color: "#009688" },
                            { name: "React.js", color: "#61DAFB" },
                            { name: "Node.js", color: "#339933" },
                            { name: "Express.js", color: "#808080" },
                            { name: "Django", color: "#092E20" },
                            { name: "Flask", color: "#000000" },
                            { name: "Angular.js", color: "#DD0031" },
                            { name: "Java", color: "#007396" },
                            { name: "JavaScript", color: "#F7DF1E" },
                            { name: "HTML5", color: "#E34F26" },
                            { name: "NPM", color: "#CB3837" },
                            { name: "Markdown", color: "#808080" }
                          ].map((s, i) => (
                            <span
                              key={i}
                              className="skill-card-uiverse"
                            >
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--accent)',
                                boxShadow: '0 0 4px var(--accent)',
                                display: 'inline-block'
                              }} />
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="skills-category-box" style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Database size={18} style={{ color: 'var(--accent)' }} /> Databases &amp; Pipelines
                        </h3>
                        <div className="skills-grid-uiverse">
                          {[
                            { name: "PostgreSQL", color: "#4169E1" },
                            { name: "MongoDB", color: "#47A248" },
                            { name: "MySQL", color: "#4479A1" },
                            { name: "Redis", color: "#DC382D" },
                            { name: "Supabase", color: "#3ECF8E" },
                            { name: "Git", color: "#F05032" },
                            { name: "GitHub", color: "#F0F6FC" }
                          ].map((s, i) => (
                            <span
                              key={i}
                              className="skill-card-uiverse"
                            >
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--accent)',
                                boxShadow: '0 0 4px var(--accent)',
                                display: 'inline-block'
                              }} />
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Html>
              </group>

              {/* 🛸 SECTOR: CREDENTIALS [10, 7, -8] */}
              <group position={sectorCoordinates.credentials}>
                <Html
                  position={[0, -1, 0]}
                  transform
                  distanceFactor={4.5}
                  className="r3f-html-wrapper"
                  style={{
                    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                    opacity: activeSector === 'credentials' ? 1 : 0,
                    visibility: activeSector === 'credentials' ? 'visible' : 'hidden',
                    pointerEvents: activeSector === 'credentials' ? 'auto' : 'none'
                  }}
                >
                  <div style={{ width: isMobile ? '340px' : '920px' }}>
                    <h2 className="heading-md" style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Credentials & Verified Badges</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1.5rem' }}>
                      <div className="credential-card oracle-card" style={{ padding: '1.5rem' }}>
                        <div className="credential-badge-img-wrapper" style={{ width: '64px', height: '64px' }}>
                          <img src="https://brm-workforce.oracle.com/pdf/certview/images/OCI25AICFAV1.png" alt="Oracle" style={{ width: '100%' }} />
                        </div>
                        <h3 style={{ fontSize: '1rem', marginTop: '1rem', fontFamily: 'Space Grotesk' }}>OCI 2025 AI Foundations Associate</h3>
                        <a href="https://catalog-education.oracle.com/pls/certview/sharebadge?id=7BE6ED30EE3083111B17C78B5EDF74C875F88216A2CE6EA4924CA511B0DD4AB5" target="_blank" rel="noreferrer" className="btn-neon-border" style={{ marginTop: '1.5rem', fontSize: '0.8rem', width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><ShieldCheck size={14} /> Verify Badge</a>
                      </div>

                      <div className="credential-card google-card" style={{ padding: '1.5rem' }}>
                        <div className="credential-badge-img-wrapper" style={{ width: '64px', height: '64px' }}>
                          <img src="https://images.credly.com/images/000655a5-3837-4c38-b906-2eb9c059ab36/linkedin_thumb_blob" alt="Google" style={{ width: '100%' }} />
                        </div>
                        <h3 style={{ fontSize: '1rem', marginTop: '1rem', fontFamily: 'Space Grotesk' }}>Engineer AI Agents with Agent Development Kit (ADK)</h3>
                        <a href="https://www.credly.com/badges/4be3d2ac-f8bd-44ad-bcec-91d0d86c1ca9" target="_blank" rel="noreferrer" className="btn-neon-border" style={{ marginTop: '1.5rem', fontSize: '0.8rem', width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><ShieldCheck size={14} /> Verify Badge</a>
                      </div>

                      <div className="credential-card deloitte-card" style={{ padding: '1.5rem' }}>
                        <div style={{ width: '120px', height: '54px', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: '4px' }}>
                          <img src={deloitteSimImg} alt="Deloitte Certificate" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <h3 style={{ fontSize: '1rem', marginTop: '1rem', fontFamily: 'Space Grotesk' }}>Deloitte Data Analytics Job Simulation</h3>
                        <a href="https://www.linkedin.com/posts/vajhala-sai-nandu_data-analytics-job-simulation-activity-7466083854416707585-ODuA?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFz19TIBtJJGw5Sx8AlQ19C-4c5UcVpjRww" target="_blank" rel="noreferrer" className="btn-neon-border" style={{ marginTop: '1.5rem', fontSize: '0.8rem', width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><ShieldCheck size={14} /> Verify Certificate</a>
                      </div>
                    </div>
                  </div>
                </Html>
              </group>

              {/* ✉️ SECTOR: CONTACT [0, 10, -6] */}
              <group position={sectorCoordinates.contact}>
                <Html
                  position={[0, -1, 0]}
                  transform
                  distanceFactor={4.5}
                  className="r3f-html-wrapper"
                  style={{
                    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                    opacity: activeSector === 'contact' ? 1 : 0,
                    visibility: activeSector === 'contact' ? 'visible' : 'hidden',
                    pointerEvents: activeSector === 'contact' ? 'auto' : 'none'
                  }}
                >
                  <div className="contact-hud-panel">
                    {/* Top header with animated gradient */}
                    <div className="contact-header">
                      <div className="contact-status-line">
                        <span className="contact-status-dot" />
                        <span style={{ fontSize: '0.75rem', fontFamily: 'Space Grotesk', color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase' }}>Available for opportunities</span>
                      </div>
                      <h2 className="contact-title">Let's Connect</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '440px', margin: '0 auto' }}>
                        Open to collaborations in AI/ML research, agent architectures, and full-stack engineering. Let's build something extraordinary.
                      </p>
                    </div>

                    {/* Two-column layout */}
                    <div className="contact-grid">
                      {/* Left: Info cards */}
                      <div className="contact-info-column">
                        <a href="https://mail.google.com/mail/?view=cm&to=vajhalasainandu@gmail.com" target="_blank" rel="noreferrer" className="contact-info-card" style={{ textDecoration: 'none' }}>
                          <div className="contact-icon-wrap" style={{ background: 'rgba(200, 200, 200, 0.10)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>Email</span>
                            <span style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '2px' }}>vajhalasainandu@gmail.com</span>
                          </div>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', opacity: 0.4 }}><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                        </a>

                        <div className="contact-info-card">
                          <div className="contact-icon-wrap" style={{ background: 'rgba(200, 200, 200, 0.10)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>Location</span>
                            <span style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '2px' }}>Hyderabad, India — 500047</span>
                          </div>
                        </div>

                        <div className="contact-info-card">
                          <div className="contact-icon-wrap" style={{ background: 'rgba(200, 200, 200, 0.10)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>Timezone</span>
                            <span style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '2px' }}>IST (UTC +5:30)</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Social links */}
                      <div className="contact-social-column">
                        <a href="https://github.com/SaiNanduVajhala" target="_blank" rel="noreferrer" className="contact-social-card">
                          <div className="contact-icon-wrap" style={{ background: 'rgba(200, 200, 200, 0.10)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                          </div>
                          <div>
                            <span className="contact-social-label">GitHub</span>
                            <span className="contact-social-handle">@SaiNanduVajhala</span>
                          </div>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', opacity: 0.4 }}><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                        </a>

                        <a href="https://www.linkedin.com/in/vajhala-sai-nandu/" target="_blank" rel="noreferrer" className="contact-social-card">
                          <div className="contact-icon-wrap" style={{ background: 'rgba(200, 200, 200, 0.10)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                          </div>
                          <div>
                            <span className="contact-social-label">LinkedIn</span>
                            <span className="contact-social-handle">vajhala-sai-nandu</span>
                          </div>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', opacity: 0.4 }}><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                        </a>

                        <a href="https://www.kaggle.com/vajhalasainandu" target="_blank" rel="noreferrer" className="contact-social-card">
                          <div className="contact-icon-wrap" style={{ background: 'rgba(200, 200, 200, 0.10)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .236.06.281.18.046.149.034.238-.036.27l-6.555 6.344 6.836 8.507c.095.104.117.208.075.328z" /></svg>
                          </div>
                          <div>
                            <span className="contact-social-label">Kaggle</span>
                            <span className="contact-social-handle">vajhalasainandu</span>
                          </div>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', opacity: 0.4 }}><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                        </a>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="contact-footer">
                      <div className="contact-footer-line" />
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.5px' }}>&copy; {new Date().getFullYear()} Sai Nandu Vajhala · Portfolio</p>
                    </div>
                  </div>
                </Html>
              </group>

            </Canvas>
          </div>
        </div>
      )}

      {/* 2. Splash Screen Overlay (slides out / blurs on enter) */}
      <AnimatePresence>
        {!hasEntered && (
          <motion.div
            key="splash"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: '-10px',
              zIndex: 99999,
              backgroundColor: '#000000',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#FFFFFF',
              fontFamily: "'Space Grotesk', sans-serif",
              textAlign: 'center',
              padding: '2rem',
              overflow: 'hidden',
              pointerEvents: 'auto',
              willChange: 'transform, opacity'
            }}
          >
            {/* Static, even, and beautifully spread-out starfield */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
              {preloaderStars.map((star, idx) => (
                <div
                  key={idx}
                  className="preloader-star"
                  style={{
                    left: star.left,
                    top: star.top,
                    width: star.size,
                    height: star.size,
                    backgroundColor: star.color,
                    opacity: star.opacity,
                    '--star-color': star.color,
                    '--twinkle-duration': star.twinkleDuration,
                    '--twinkle-delay': star.twinkleDelay,
                  }}
                />
              ))}
            </div>

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.h1
                initial={{ opacity: 0, y: -25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                style={{
                  fontSize: 'clamp(2.2rem, 6vw, 3.8rem)',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.25)'
                }}
              >
                Ad Astra Per Aspera
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                style={{
                  fontSize: '1.25rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '2.5rem',
                  fontStyle: 'italic',
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.1)'
                }}
              >
                To the stars through hardships.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{
                  scale: 1.04,
                  borderColor: 'rgba(255, 255, 255, 0.65)',
                  boxShadow: '0 0 25px rgba(255, 255, 255, 0.35), inset 0 0 8px rgba(255, 255, 255, 0.15)',
                  transition: { duration: 0.1, delay: 0 }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setHasEntered(true)}
                style={{
                  padding: '12px 36px',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(10, 10, 10, 0.75)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: '0 0 15px rgba(255, 255, 255, 0.04)'
                }}
              >
                Enter
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
