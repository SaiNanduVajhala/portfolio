import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Briefcase, 
  Cpu, 
  Terminal as TerminalIcon, 
  Mail, 
  Sun, 
  Moon, 
  Download, 
  ExternalLink,
  MapPin,
  Clock,
  ChevronRight,
  Code
} from 'lucide-react';
import './MobilePortfolio.css';

// Brand icons as inline SVGs since newer lucide-react versions deprecate/exclude them
const GitHubIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
);

const LinkedInIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);

const KaggleIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .236.06.281.18.046.149.034.238-.036.27l-6.555 6.344 6.836 8.507c.095.104.117.208.075.328z" /></svg>
);

// Project data (consistent with desktop)
const projectsData = [
  {
    id: 1,
    title: "Emotion-Aware Multimodal Voice Assistant",
    description: "A full-duplex conversational AI system using FastAPI and WebSockets for real-time bi-directional audio/video. Integrated MediaPipe/DeepFace for emotion analysis with end-to-end latency under 1.5s.",
    tags: ["Python", "FastAPI", "WebSockets", "OpenAI"],
    category: "AI Agents",
    github: "https://github.com/SaiNanduVajhala/Voice_Model_with_full_duplex"
  },
  {
    id: 2,
    title: "CrewAI Trading Agent",
    description: "Multi-agent Python system using CrewAI that automatically generates daily US financial market summaries. Features specialized agents for search, summarizing, and reporting.",
    tags: ["Python", "CrewAI", "Groq LLM", "YAML"],
    category: "AI Agents",
    github: "https://github.com/SaiNanduVajhala/CrewAI-Trading-Agent"
  },
  {
    id: 3,
    title: "lexiRead",
    description: "A Dyslexic-Friendly Reading Tool designed to improve accessibility and reading comprehension with custom overlays and font styling.",
    tags: ["HTML", "CSS", "JavaScript", "Accessibility"],
    category: "Accessibility",
    github: "https://github.com/SaiNanduVajhala/lexiRead"
  },
  {
    id: 4,
    title: "Market Mood Trading Analysis",
    description: "A data-driven analysis proving the profitability of buying fear and selling greed in crypto markets using historical sentiment metrics.",
    tags: ["Python", "Data Analysis", "Trading Analytics"],
    category: "Data Science",
    github: "https://github.com/SaiNanduVajhala/market-mood-trading-analysis"
  },
  {
    id: 5,
    title: "Semantic Search Engine",
    description: "An advanced semantic search engine leveraging NLP sentence embeddings and high-dimensional vector similarity mapping to search documents conceptually rather than by exact keywords.",
    tags: ["Python", "NLP", "SentenceTransformers", "Data Science"],
    category: "Data Science",
    github: "https://github.com/SaiNanduVajhala/Semantic-Search"
  }
];

export default function MobilePortfolio({ theme, setTheme }) {
  const [activeTab, setActiveTab] = useState('home');
  const [cardFlipped, setCardFlipped] = useState(false);
  const [projectIndex, setProjectIndex] = useState(0);
  
  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState([
    { text: "System initialized. Welcome to Sai Nandu's portfolio CLI.", type: "system" },
    { text: "Tap shortcut pills below or type 'help' to begin.", type: "system" }
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalBodyRef = useRef(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const handleTerminalSubmit = (cmdText) => {
    const cmd = cmdText.trim().toLowerCase();
    if (!cmd) return;

    const newHistory = [...terminalHistory, { text: `> ${cmdText}`, type: "input" }];

    if (cmd === "help") {
      newHistory.push(
        { text: "Available commands:", type: "system" },
        { text: "  about     - Brief introduction & summary", type: "info" },
        { text: "  projects  - Show featured AI/ML projects", type: "info" },
        { text: "  skills    - List core programming & tech stack", type: "info" },
        { text: "  clear     - Clean up the terminal console screen", type: "info" }
      );
    } else if (cmd === "about") {
      newHistory.push({ text: "Sai Nandu Vajhala: AI/ML Engineering student specializing in building automated multi-agent networks, real-time voice intelligence, and cognitive full-duplex systems.", type: "success" });
    } else if (cmd === "projects") {
      newHistory.push(
        { text: "1. Emotion-Aware Voice Assistant (FastAPI, WebSockets)", type: "success" },
        { text: "2. CrewAI Trading Agent (Autonomous summarizer)", type: "success" },
        { text: "3. lexiRead (Accessibility engine for dyslexia)", type: "success" },
        { text: "4. Market Mood Analysis (Crypto Fear & Greed)", type: "success" },
        { text: "5. Semantic Search Engine (NLP sentence vector search)", type: "success" }
      );
    } else if (cmd === "skills") {
      newHistory.push({ text: "Languages: Python, Java, R, C | Tech: React, FastAPI, Node.js, CrewAI | DB: PostgreSQL, MongoDB, MySQL", type: "success" });
    } else if (cmd === "clear") {
      setTerminalHistory([]);
      return;
    } else {
      newHistory.push({ text: `Unknown command: '${cmd}'. Type 'help' for info.`, type: "error" });
    }

    setTerminalHistory(newHistory);
  };

  const handleInputChange = (e) => {
    setTerminalInput(e.target.value);
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    handleTerminalSubmit(terminalInput);
    setTerminalInput("");
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Tab change animation variants
  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="mobile-portfolio" data-theme={theme}>
      {/* Floating Theme Button (Bypasses top header constraint) */}
      <button className="mobile-theme-fab" onClick={toggleTheme} aria-label="Toggle Theme">
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Main Content Area with Switchable Views */}
      <main className="mobile-content">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mobile-hero"
            >
              {/* Brand Logo inside content area */}
              <div style={{ alignSelf: 'flex-start', margin: '5px 0 10px 5px', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.4rem', color: 'var(--accent)' }}>
                SV.
              </div>

              <span className="mobile-hero-role">AI/ML Engineer</span>
              <h1 className="mobile-hero-name">Sai Nandu Vajhala</h1>
              
              <p className="mobile-hero-description">
                Building intelligent agent networks, real-time voice systems, and cognitive automation.
              </p>

              {/* Call-to-action buttons */}
              <div className="mobile-btn-group">
                <button onClick={() => setActiveTab('projects')} className="mobile-btn-primary">
                  View Projects <ChevronRight size={18} />
                </button>
                <a href="./Sai_Nandu_Resume.pdf" download="Sai_Nandu_Resume.pdf" className="mobile-btn-secondary">
                  <Download size={18} /> Download Resume
                </a>
              </div>

              {/* Interactive ID Card (Tap to flip) */}
              <div className="mobile-id-container" onClick={() => setCardFlipped(!cardFlipped)}>
                <div className={`mobile-id-card ${cardFlipped ? 'is-flipped' : ''}`}>
                  {/* Front Face */}
                  <div className="mobile-id-face mobile-id-front">
                    <div className="mobile-id-header">
                      <span className="mobile-id-header-title">Portfolio ID</span>
                      <span className="mobile-id-header-sub">AI/ML Engineering</span>
                    </div>
                    <div className="mobile-id-avatar">SN</div>
                    <span className="mobile-id-name">Sai Nandu Vajhala</span>
                    <span className="mobile-id-role">AI/ML Engineer</span>
                    <div className="mobile-id-divider" />
                    <p className="mobile-id-details">
                      BTech · Sreyas Institute<br />
                      Hyderabad, India
                    </p>
                    <div className="mobile-id-barcode">
                      {[3, 5, 2, 7, 4, 6, 3, 5, 2, 4, 6, 3, 7, 5, 2, 4, 6, 3, 5, 4].map((h, i) => (
                        <span key={i} style={{ width: i % 3 === 0 ? '3px' : '1.5px', height: `${h * 1.5}px` }} />
                      ))}
                    </div>
                  </div>

                  {/* Back Face (Full contact rows like desktop) */}
                  <div className="mobile-id-face mobile-id-back">
                    <div>
                      <h4 className="mobile-id-back-title">🛡️ Contact Details</h4>
                      <div className="mobile-id-contact-list">
                        <div className="mobile-id-contact-item">
                          <div className="mobile-id-contact-icon"><Mail size={14} /></div>
                          <div>
                            <span className="mobile-id-contact-label">Email</span>
                            <span className="mobile-id-contact-value">vajhalasainandu@gmail.com</span>
                          </div>
                        </div>
                        <div className="mobile-id-contact-item">
                          <div className="mobile-id-contact-icon"><MapPin size={14} /></div>
                          <div>
                            <span className="mobile-id-contact-label">Location</span>
                            <span className="mobile-id-contact-value">Hyderabad, India</span>
                          </div>
                        </div>
                        <div className="mobile-id-contact-item">
                          <div className="mobile-id-contact-icon"><LinkedInIcon size={14} /></div>
                          <div>
                            <span className="mobile-id-contact-label">LinkedIn</span>
                            <span className="mobile-id-contact-value">vajhala-sai-nandu</span>
                          </div>
                        </div>
                        <div className="mobile-id-contact-item">
                          <div className="mobile-id-contact-icon"><GitHubIcon size={14} /></div>
                          <div>
                            <span className="mobile-id-contact-label">GitHub</span>
                            <span className="mobile-id-contact-value">SaiNanduVajhala</span>
                          </div>
                        </div>
                        <div className="mobile-id-contact-item">
                          <div className="mobile-id-contact-icon"><KaggleIcon size={14} /></div>
                          <div>
                            <span className="mobile-id-contact-label">Kaggle</span>
                            <span className="mobile-id-contact-value">vajhalasainandu</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mobile-id-back-footer">
                      <span>Open to opportunities</span>
                      <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 6px var(--accent)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div 
              key="projects"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mobile-projects-carousel"
            >
              {/* Top brand mark */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '5px 0 15px 5px' }}>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.4rem', color: 'var(--accent)' }}>
                  SV.
                </div>
              </div>

              <div className="mobile-section-title">
                <Briefcase size={20} className="text-accent" /> Featured Projects
              </div>

              {/* Single Project Display */}
              {projectsData[projectIndex] && (
                <div className="mobile-project-card">
                  <div>
                    <span className="mobile-project-category">
                      {projectsData[projectIndex].category}
                    </span>
                    <h3 className="mobile-project-title">
                      {projectsData[projectIndex].title}
                    </h3>
                    <p className="mobile-project-desc">
                      {projectsData[projectIndex].description}
                    </p>
                  </div>

                  <div>
                    <div className="mobile-project-tags">
                      {projectsData[projectIndex].tags.map((tag, idx) => (
                        <span key={idx} className="mobile-project-tag">{tag}</span>
                      ))}
                    </div>

                    <a 
                      href={projectsData[projectIndex].github}
                      target="_blank"
                      rel="noreferrer"
                      className="mobile-btn-primary"
                      style={{ height: '44px' }}
                    >
                      <Code size={16} /> View Code
                    </a>
                  </div>
                </div>
              )}

              {/* Carousel Indicators */}
              <div className="mobile-carousel-dots">
                {projectsData.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setProjectIndex(idx)}
                    className={`mobile-carousel-dot ${idx === projectIndex ? 'mobile-carousel-dot-active' : ''}`}
                    aria-label={`Go to project ${idx + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div 
              key="skills"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Top brand mark */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '5px 0 15px 5px' }}>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.4rem', color: 'var(--accent)' }}>
                  SV.
                </div>
              </div>

              {/* About card */}
              <div className="mobile-card">
                <h3 className="mobile-section-title">About Me</h3>
                <p className="mobile-about-text">
                  I am a highly motivated student pursuing a BTech in Artificial Intelligence and Machine Learning at <b>Sreyas Institute of Engineering and Technology.</b>
                </p>
                <p className="mobile-about-text">
                  I'm passionate about emerging cognitive paradigms, actively constructing autonomous agent networks, real-time voice architectures, and high-dimensional semantic search engines.
                </p>
                <div className="mobile-education">
                  <span className="mobile-education-degree">BTech in AI &amp; ML</span>
                  <div className="mobile-education-school">Sreyas Institute (2024 - 2027) · CGPA: 7.2</div>
                </div>
              </div>

              {/* Skills group card */}
              <div className="mobile-card">
                <h3 className="mobile-section-title"><Cpu size={20} className="text-accent" /> Technical Stack</h3>
                
                <div className="mobile-skill-group">
                  <div className="mobile-skill-group-title">🧠 AI/ML &amp; Data Science</div>
                  <div className="mobile-skill-grid">
                    {[
                      { name: "Python", color: "#3776AB" },
                      { name: "PyTorch", color: "#EE4C2C" },
                      { name: "TensorFlow", color: "#FF6F00" },
                      { name: "CrewAI", color: "#FF4B4B" },
                      { name: "Scikit-Learn", color: "#F7931E" },
                      { name: "NumPy", color: "#013243" },
                      { name: "Pandas", color: "#150458" }
                    ].map((s, i) => (
                      <span key={i} className="mobile-skill-tag">
                        <span className="mobile-skill-dot" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mobile-skill-group">
                  <div className="mobile-skill-group-title">⚡ Backend &amp; Web</div>
                  <div className="mobile-skill-grid">
                    {[
                      { name: "FastAPI", color: "#009688" },
                      { name: "React.js", color: "#61DAFB" },
                      { name: "Node.js", color: "#339933" },
                      { name: "Django", color: "#092E20" },
                      { name: "JavaScript", color: "#F7DF1E" },
                      { name: "HTML5/CSS3", color: "#E34F26" }
                    ].map((s, i) => (
                      <span key={i} className="mobile-skill-tag">
                        <span className="mobile-skill-dot" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mobile-skill-group">
                  <div className="mobile-skill-group-title">🗄️ Databases &amp; DevOps</div>
                  <div className="mobile-skill-grid">
                    {[
                      { name: "PostgreSQL", color: "#4169E1" },
                      { name: "MongoDB", color: "#47A248" },
                      { name: "MySQL", color: "#4479A1" },
                      { name: "Supabase", color: "#3ECF8E" },
                      { name: "Git & GitHub", color: "#F05032" }
                    ].map((s, i) => (
                      <span key={i} className="mobile-skill-tag">
                        <span className="mobile-skill-dot" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verified badges */}
              <div className="mobile-card">
                <h3 className="mobile-section-title">Verified Badges</h3>
                <div className="mobile-credentials-list">
                  <a href="https://catalog-education.oracle.com/pls/certview/sharebadge?id=7BE6ED30EE3083111B17C78B5EDF74C875F88216A2CE6EA4924CA511B0DD4AB5" target="_blank" rel="noreferrer" className="mobile-credential-item">
                    <div className="mobile-credential-badge">
                      <img src="https://brm-workforce.oracle.com/pdf/certview/images/OCI25AICFAV1.png" alt="Oracle Badge" style={{ height: '36px', objectFit: 'contain' }} />
                    </div>
                    <div className="mobile-credential-info">
                      <div className="mobile-credential-title">OCI 2025 AI Foundations</div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Oracle Certified Associate</span>
                    </div>
                    <ExternalLink size={14} className="text-secondary" />
                  </a>

                  <a href="https://www.credly.com/badges/4be3d2ac-f8bd-44ad-bcec-91d0d86c1ca9" target="_blank" rel="noreferrer" className="mobile-credential-item">
                    <div className="mobile-credential-badge">
                      <img src="https://images.credly.com/images/000655a5-3837-4c38-b906-2eb9c059ab36/linkedin_thumb_blob" alt="Google Badge" style={{ height: '36px', objectFit: 'contain' }} />
                    </div>
                    <div className="mobile-credential-info">
                      <div className="mobile-credential-title">Google Cloud ADK Agent Engineer</div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Credly Verified</span>
                    </div>
                    <ExternalLink size={14} className="text-secondary" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sandbox' && (
            <motion.div 
              key="sandbox"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Top brand mark */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '5px 0 15px 5px' }}>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.4rem', color: 'var(--accent)' }}>
                  SV.
                </div>
              </div>

              <div className="mobile-section-title">
                <TerminalIcon size={20} className="text-accent" /> Latent Terminal
              </div>

              {/* Interactive Terminal Container */}
              <div className="mobile-terminal">
                <div className="mobile-terminal-header">
                  <div className="mobile-terminal-dots">
                    <span className="mobile-terminal-dot mobile-terminal-dot-red" />
                    <span className="mobile-terminal-dot mobile-terminal-dot-yellow" />
                    <span className="mobile-terminal-dot mobile-terminal-dot-green" />
                  </div>
                  <span className="mobile-terminal-title">sainandu@latent-space:~</span>
                  <div style={{ width: '38px' }} />
                </div>

                <div className="mobile-terminal-body" ref={terminalBodyRef}>
                  {terminalHistory.map((item, index) => (
                    <div key={index} className={`mobile-terminal-line ${item.type}`}>
                      {item.text}
                    </div>
                  ))}
                  
                  <form onSubmit={onFormSubmit} className="mobile-terminal-prompt-line">
                    <span className="mobile-terminal-prompt">sainandu:~$</span>
                    <div className="mobile-terminal-input-wrapper">
                      <input 
                        type="text" 
                        value={terminalInput} 
                        onChange={handleInputChange} 
                        className="mobile-terminal-input"
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                    </div>
                  </form>
                </div>
              </div>

              {/* Quick Pills for Mobile CLI Shortcuts */}
              <div className="mobile-cli-shortcuts">
                {["help", "about", "projects", "skills", "clear"].map((cmd) => (
                  <button 
                    key={cmd}
                    onClick={() => handleTerminalSubmit(cmd)}
                    className="mobile-cli-pill"
                  >
                    <span>$</span> {cmd}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div 
              key="contact"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mobile-contact-list"
            >
              {/* Top brand mark */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '5px 0 15px 5px' }}>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.4rem', color: 'var(--accent)' }}>
                  SV.
                </div>
              </div>

              <div className="mobile-section-title">
                <Mail size={20} className="text-accent" /> Let's Connect
              </div>

              <div className="mobile-card" style={{ marginBottom: '10px', textAlign: 'center' }}>
                <p className="mobile-about-text" style={{ margin: 0 }}>
                  I'm always open to discussing new opportunities, projects, or collaborations in AI/ML, data science, and web applications.
                </p>
              </div>

              <a href="mailto:vajhalasainandu@gmail.com" className="mobile-contact-card">
                <div className="mobile-contact-icon-wrapper" style={{ background: 'rgba(23, 178, 106, 0.12)' }}>
                  <Mail size={20} className="text-accent" />
                </div>
                <div className="mobile-contact-details">
                  <span className="mobile-contact-label">Email</span>
                  <span className="mobile-contact-value">vajhalasainandu@gmail.com</span>
                </div>
                <ChevronRight size={16} className="text-secondary" style={{ marginLeft: 'auto' }} />
              </a>

              <a href="https://www.linkedin.com/in/vajhala-sai-nandu/" target="_blank" rel="noreferrer" className="mobile-contact-card">
                <div className="mobile-contact-icon-wrapper" style={{ background: 'rgba(66, 133, 244, 0.12)' }}>
                  <ExternalLink size={20} style={{ color: '#4285F4' }} />
                </div>
                <div className="mobile-contact-details">
                  <span className="mobile-contact-label">LinkedIn</span>
                  <span className="mobile-contact-value">vajhala-sai-nandu</span>
                </div>
                <ChevronRight size={16} className="text-secondary" style={{ marginLeft: 'auto' }} />
              </a>

              <a href="https://github.com/SaiNanduVajhala" target="_blank" rel="noreferrer" className="mobile-contact-card">
                <div className="mobile-contact-icon-wrapper" style={{ background: 'rgba(255, 255, 255, 0.12)' }}>
                  <Code size={20} style={{ color: '#FCFCFD' }} />
                </div>
                <div className="mobile-contact-details">
                  <span className="mobile-contact-label">GitHub</span>
                  <span className="mobile-contact-value">@SaiNanduVajhala</span>
                </div>
                <ChevronRight size={16} className="text-secondary" style={{ marginLeft: 'auto' }} />
              </a>

              <div className="mobile-card" style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={16} /> <span>Hyderabad, India — 500047</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  <Clock size={16} /> <span>IST (UTC +5:30)</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Nav Bar */}
      <nav className="mobile-navbar">
        <button 
          onClick={() => setActiveTab('home')} 
          className={`mobile-nav-item ${activeTab === 'home' ? 'mobile-nav-item-active' : ''}`}
        >
          <Home size={20} />
          <span>Home</span>
          {activeTab === 'home' && <motion.div layoutId="navDot" className="mobile-nav-dot" />}
        </button>
        <button 
          onClick={() => setActiveTab('projects')} 
          className={`mobile-nav-item ${activeTab === 'projects' ? 'mobile-nav-item-active' : ''}`}
        >
          <Briefcase size={20} />
          <span>Projects</span>
          {activeTab === 'projects' && <motion.div layoutId="navDot" className="mobile-nav-dot" />}
        </button>
        <button 
          onClick={() => setActiveTab('skills')} 
          className={`mobile-nav-item ${activeTab === 'skills' ? 'mobile-nav-item-active' : ''}`}
        >
          <Cpu size={20} />
          <span>Skills</span>
          {activeTab === 'skills' && <motion.div layoutId="navDot" className="mobile-nav-dot" />}
        </button>
        <button 
          onClick={() => setActiveTab('sandbox')} 
          className={`mobile-nav-item ${activeTab === 'sandbox' ? 'mobile-nav-item-active' : ''}`}
        >
          <TerminalIcon size={20} />
          <span>CLI</span>
          {activeTab === 'sandbox' && <motion.div layoutId="navDot" className="mobile-nav-dot" />}
        </button>
        <button 
          onClick={() => setActiveTab('contact')} 
          className={`mobile-nav-item ${activeTab === 'contact' ? 'mobile-nav-item-active' : ''}`}
        >
          <Mail size={20} />
          <span>Contact</span>
          {activeTab === 'contact' && <motion.div layoutId="navDot" className="mobile-nav-dot" />}
        </button>
      </nav>
    </div>
  );
}
