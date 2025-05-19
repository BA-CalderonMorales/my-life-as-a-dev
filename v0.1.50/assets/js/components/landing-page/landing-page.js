/**
 * Brandon Calderon Morales Landing Page Component
 * 
 * A complete, immersive landing page experience with THREE.js background
 * and all content migrated from the static Markdown.
 */
import * as THREE from 'three';

export class LandingPage extends HTMLElement {
  constructor() {
    super();
    
    // Create shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Initialize properties
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.particles = [];
    this.mousePosition = { x: 0, y: 0 };
    this.lastMouseMoveTime = 0;
    this.mouseActive = false;
    this.animationFrame = null;
    this.currentRoleIndex = 0;
    this.roleChangeInterval = null;
    this.scrollPosition = 0;
    this.sections = [];
    this.activeSection = 0;
    
    // Profile data
    this.profileData = {
      name: "Brandon A. Calderon Morales",
      location: "Omaha, Nebraska, United States",
      tagline: "I build resilient code with strategic vision.",
      roles: [
        "Product-Minded Software Engineer",
        "DevOps Transformation Specialist",
        "Aspiring Platform Engineer",
        "Legacy Code Modernizer",
        "Technical Mentor",
        "Full-Stack Software Engineer"
      ],
      topSkills: [
        "DevOps Transformation",
        "CI/CD Pipeline Optimization",
        "Legacy Code Modernization",
        "Technical Mentorship",
        "Process Standardization"
      ],
      experience: {
        companies: [
          {
            name: "Fiserv",
            role: "Software Engineer, Sr. Professional",
            duration: "January 2024 - Present",
            location: "Omaha, Nebraska, United States",
            highlights: [
              "Spearheaded migration from Jenkins to GitHub Actions to optimize CI/CD workflows",
              "Resolved critical CI/CD issues and standardized workflows to boost team efficiency",
              "Mentored junior engineers and contributed to high-level design and user story creation"
            ]
          },
          {
            name: "Insight Global",
            role: "Web Services Developer",
            duration: "May 2023 - November 2023",
            location: "Bellevue, Nebraska, United States",
            highlights: [
              "Developed and maintained web services using C#, SQL, and JavaScript",
              "Managed design, implementation, refactoring, and bug fixes within a legacy codebase"
            ]
          },
          {
            name: "Leidos",
            role: "Software Engineer",
            duration: "October 2021 - May 2023",
            location: "Omaha, Nebraska, United States",
            highlights: [
              "Worked as both a Frontend and DevOps engineer",
              "Configured development environments using Linux, VS Code, and Vim",
              "Built and maintained shared React components and contributed to agile workflows"
            ]
          }
        ]
      },
      socialLinks: [
        { name: "LinkedIn", url: "https://www.linkedin.com/in/bcalderonmorales-cmoe", icon: "M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" },
        { name: "GitHub", url: "https://github.com/BA-CalderonMorales", icon: "M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" },
        { name: "Email", url: "mailto:brandon.ceemoe@gmail.com", icon: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" },
        { name: "Portfolio", url: "https://brandon-calderon-morales-portfolio.dev", icon: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z" }
      ],
      secondaryLinks: [
        { name: "YouTube", url: "https://www.youtube.com/@brandoncalderon7008", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
        { name: "Twitter", url: "https://x.com/BrandonACalder1", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
        { name: "Substack", url: "https://substack.com/@bmoedude", icon: "M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" },
        { name: "Blue Sky", url: "https://bsky.app/profile/moe-dude.bsky.social", icon: "M12.008 4L4 17.858h15.988L12.008 4zM12 12.5L9.5 17h4.988L12 12.5z" },
        { name: "DockerHub", url: "https://hub.docker.com/r/cmoe640/dev-environment", icon: "M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186h-2.12a.186.186 0 00-.185.185v1.888c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z" }
      ],
      featuredProjects: [
        {
          title: "AI Playground",
          icon: "🤖",
          description: "Experiment with interactive AI tools that I've built to enhance creativity and productivity.",
          url: "./ai-demo/ai-playground/playground"
        },
        {
          title: "Visual Experiments",
          icon: "🧪",
          description: "Check out my AI-assisted visual scenes and interactive experiments.",
          url: "./blog/life/"
        },
        {
          title: "AI Journey",
          icon: "📘",
          description: "Learn about how I've been integrating AI into documentation and creative projects.",
          url: "./ai-demo/"
        }
      ],
      featuredTools: [
        "Repository Explorer: Get AI-driven insights into code repositories",
        "Interactive Scene Creator: Generate 3D scenes with AI assistance",
        "Code Assistance: Leverage AI for code explanations and documentation"
      ]
    };
    
    // Setup the basic structure
    this.setupBaseStyles();
    this.setupContent();
  }
  
  /**
   * Setup base styles for the component
   */
  setupBaseStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100vh;
        overflow: hidden;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif;
        --primary-color: #0088ff;
        --secondary-color: #0066cc;
        --bg-color: #050716;
        --text-color: #ffffff;
        --accent-color: #00ccff;
        --section-padding: 2rem;
        color: var(--text-color);
        position: relative;
      }
      
      canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
      }
      
      .content-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
        z-index: 1;
        scroll-behavior: smooth;
        /* Hide scrollbar but keep functionality */
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
      }
      
      .content-container::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }
      
      section {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: var(--section-padding);
        position: relative;
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
      }
      
      section.active {
        opacity: 1;
        transform: translateY(0);
      }
      
      .hero-section {
        text-align: center;
      }
      
      h1, h2, h3, h4, h5, h6 {
        color: var(--text-color);
        margin-top: 0;
      }
      
      h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
        text-shadow: 0 0 10px rgba(0, 136, 255, 0.7);
      }
      
      h2 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
      }
      
      .subtitle {
        font-size: 1.5rem;
        opacity: 0.8;
        margin-bottom: 1rem;
      }
      
      .location {
        font-size: 1.2rem;
        opacity: 0.6;
      }
      
      .role-text {
        height: 2rem;
        font-size: 1.5rem;
        color: var(--accent-color);
        text-shadow: 0 0 5px var(--accent-color);
        margin: 0.5rem 0 1.5rem;
        transition: opacity 0.5s, transform 0.5s;
      }
      
      .tagline {
        font-size: 1.8rem;
        font-style: italic;
        margin: 2rem 0;
        text-shadow: 0 0 10px rgba(0, 136, 255, 0.5);
      }
      
      .scroll-indicator {
        position: absolute;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: bounce 2s infinite;
        cursor: pointer;
        z-index: 10;
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
          transform: translateY(0) translateX(-50%);
        }
        40% {
          transform: translateY(-20px) translateX(-50%);
        }
        60% {
          transform: translateY(-10px) translateX(-50%);
        }
      }
      
      .scroll-arrow svg {
        width: 40px;
        height: 40px;
        fill: var(--text-color);
      }
      
      .scroll-text {
        margin-top: 0.5rem;
        font-size: 0.9rem;
      }
      
      .social-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
        margin: 2rem 0;
      }
      
      .social-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background-color: rgba(0, 136, 255, 0.2);
        color: var(--text-color);
        border-radius: 4px;
        text-decoration: none;
        backdrop-filter: blur(5px);
        transition: background-color 0.3s, transform 0.3s;
        border: 1px solid rgba(0, 136, 255, 0.3);
      }
      
      .social-button:hover {
        background-color: rgba(0, 136, 255, 0.4);
        transform: translateY(-3px);
      }
      
      .social-button svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
      }
      
      .social-divider {
        width: 100%;
        text-align: center;
        margin: 1.5rem 0;
        font-size: 0.9rem;
        opacity: 0.7;
        position: relative;
      }
      
      .social-divider::before,
      .social-divider::after {
        content: "";
        position: absolute;
        top: 50%;
        width: 20%;
        height: 1px;
        background-color: rgba(255, 255, 255, 0.3);
      }
      
      .social-divider::before {
        left: 20%;
      }
      
      .social-divider::after {
        right: 20%;
      }
      
      .secondary-links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: center;
      }
      
      .secondary-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background-color: rgba(255, 255, 255, 0.1);
        color: var(--text-color);
        border-radius: 4px;
        text-decoration: none;
        transition: background-color 0.3s;
      }
      
      .secondary-link:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      .secondary-link svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }
      
      .feature-cards {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1.5rem;
        margin: 2rem 0;
        width: 100%;
        max-width: 1200px;
      }
      
      .feature-card {
        background-color: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border-radius: 8px;
        padding: 1.5rem;
        width: 100%;
        max-width: 330px;
        border: 1px solid rgba(0, 136, 255, 0.15);
        transition: transform 0.3s, box-shadow 0.3s;
        display: flex;
        flex-direction: column;
      }
      
      .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        border-color: rgba(0, 136, 255, 0.3);
      }
      
      .feature-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
      }
      
      .feature-card h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.5rem;
      }
      
      .feature-card p {
        flex-grow: 1;
        margin-bottom: 1.5rem;
        opacity: 0.8;
      }
      
      .feature-link {
        display: inline-block;
        padding: 0.5rem 1rem;
        background-color: rgba(0, 136, 255, 0.3);
        color: white;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s;
        text-align: center;
      }
      
      .feature-link:hover {
        background-color: rgba(0, 136, 255, 0.5);
      }
      
      .ai-tools-showcase {
        background-color: rgba(0, 0, 0, 0.25);
        padding: 1.5rem;
        border-radius: 8px;
        max-width: 800px;
        width: 100%;
        margin: 1rem auto;
        backdrop-filter: blur(5px);
      }
      
      .ai-tools-showcase h3 {
        margin-top: 0;
        text-align: center;
      }
      
      .tool-list {
        padding-left: 1.5rem;
        margin-bottom: 0;
      }
      
      .tool-list li {
        margin-bottom: 0.75rem;
      }
      
      .section-footer {
        text-align: center;
        padding: 1rem;
        margin-top: 2rem;
        font-size: 0.9rem;
        opacity: 0.7;
      }
      
      .navigation-dots {
        position: fixed;
        right: 2rem;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        z-index: 100;
      }
      
      .nav-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        cursor: pointer;
        transition: background-color 0.3s, transform 0.3s;
      }
      
      .nav-dot.active {
        background-color: var(--primary-color);
        transform: scale(1.3);
      }
      
      @media (max-width: 768px) {
        h1 {
          font-size: 2.5rem;
        }
        
        h2 {
          font-size: 2rem;
        }
        
        .subtitle {
          font-size: 1.2rem;
        }
        
        .navigation-dots {
          right: 1rem;
        }
        
        .feature-cards {
          flex-direction: column;
          align-items: center;
        }
      }
    `;
    
    this.shadowRoot.appendChild(style);
  }
  
  /**
   * Setup the content structure
   */
  setupContent() {
    // Canvas for THREE.js
    const canvas = document.createElement('canvas');
    this.shadowRoot.appendChild(canvas);
    
    // Content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'content-container';
    this.shadowRoot.appendChild(contentContainer);
    
    // Create sections
    this.createHeroSection(contentContainer);
    this.createAboutSection(contentContainer);
    this.createProjectsSection(contentContainer);
    this.createConnectSection(contentContainer);
    
    // Create navigation dots
    this.createNavigationDots();
    
    // Store reference to content container
    this.contentContainer = contentContainer;
    
    // Store canvas reference
    this.canvas = canvas;
  }
  
  /**
   * Create the hero section
   */
  createHeroSection(container) {
    const section = document.createElement('section');
    section.id = 'hero';
    section.className = 'hero-section active';
    section.dataset.index = '0';
    
    section.innerHTML = `
      <h1>${this.profileData.name}</h1>
      <div class="role-text" id="role-text">${this.profileData.roles[0]}</div>
      <div class="location">${this.profileData.location}</div>
      <div class="tagline">🚀 ${this.profileData.tagline} 🛠</div>
      
      <div class="scroll-indicator" id="scroll-down">
        <div class="scroll-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path>
          </svg>
        </div>
        <span class="scroll-text">Scroll down</span>
      </div>
    `;
    
    container.appendChild(section);
    this.sections.push(section);
  }
  
  /**
   * Create the about section
   */
  createAboutSection(container) {
    const section = document.createElement('section');
    section.id = 'about';
    section.className = 'about-section';
    section.dataset.index = '1';
    
    let skillsHTML = '';
    this.profileData.topSkills.forEach(skill => {
      skillsHTML += `<li>🔹 ${skill}</li>`;
    });
    
    section.innerHTML = `
      <h2>About Me</h2>
      <p class="subtitle">Mission-Driven Engineering | Resilience & Scale | Empower & Democratize</p>
      
      <div class="about-content">
        <p>I enjoy the challenge of learning new technologies, adapting to all scenarios, and championing efficiency within development teams. I'm also a father of two beautiful girls and a husband to a wonderful wife.</p>
        
        <h3>Top Skills</h3>
        <ul>
          ${skillsHTML}
        </ul>
      </div>
      
      <div class="experience-highlights">
        <h3>Experience Highlights</h3>
        ${this.generateExperienceHTML()}
      </div>
    `;
    
    container.appendChild(section);
    this.sections.push(section);
  }
  
  /**
   * Create the projects section
   */
  createProjectsSection(container) {
    const section = document.createElement('section');
    section.id = 'projects';
    section.className = 'projects-section';
    section.dataset.index = '2';
    
    let featuredProjectsHTML = '';
    this.profileData.featuredProjects.forEach(project => {
      featuredProjectsHTML += `
        <div class="feature-card">
          <div class="feature-icon">${project.icon}</div>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <a href="${project.url}" class="feature-link">Explore</a>
        </div>
      `;
    });
    
    let toolsHTML = '';
    this.profileData.featuredTools.forEach(tool => {
      toolsHTML += `<li>${tool}</li>`;
    });
    
    section.innerHTML = `
      <h2>Projects & Tools</h2>
      <p class="subtitle">Explore my work and experiments</p>
      
      <div class="feature-cards">
        ${featuredProjectsHTML}
      </div>
      
      <div class="ai-tools-showcase">
        <h3>Featured AI Tools</h3>
        <ul class="tool-list">
          ${toolsHTML}
        </ul>
      </div>
    `;
    
    container.appendChild(section);
    this.sections.push(section);
  }
  
  /**
   * Create the connect section
   */
  createConnectSection(container) {
    const section = document.createElement('section');
    section.id = 'connect';
    section.className = 'connect-section';
    section.dataset.index = '3';
    
    let socialButtonsHTML = '';
    this.profileData.socialLinks.forEach(link => {
      socialButtonsHTML += `
        <a href="${link.url}" class="social-button" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="${link.icon}"></path>
          </svg>
          ${link.name}
        </a>
      `;
    });
    
    let secondaryLinksHTML = '';
    this.profileData.secondaryLinks.forEach(link => {
      secondaryLinksHTML += `
        <a href="${link.url}" class="secondary-link" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="${link.icon}"></path>
          </svg>
          ${link.name}
        </a>
      `;
    });
    
    section.innerHTML = `
      <h2>Let's Connect! 🤝</h2>
      <p class="subtitle">Thanks for visiting my profile! I'm always open to new connections, collaborations, and conversations.</p>
      
      <div class="social-buttons">
        ${socialButtonsHTML}
      </div>
      
      <div class="social-divider">Other Platforms</div>
      
      <div class="secondary-links">
        ${secondaryLinksHTML}
      </div>
      
      <div class="section-footer">
        <p>© <span id="current-year">${new Date().getFullYear()}</span> Brandon A. Calderon Morales</p>
      </div>
    `;
    
    container.appendChild(section);
    this.sections.push(section);
  }
  
  /**
   * Create navigation dots
   */
  createNavigationDots() {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'navigation-dots';
    
    this.sections.forEach((section, index) => {
      const dot = document.createElement('div');
      dot.className = index === 0 ? 'nav-dot active' : 'nav-dot';
      dot.dataset.index = index;
      dot.addEventListener('click', () => {
        this.scrollToSection(index);
      });
      dotsContainer.appendChild(dot);
    });
    
    this.shadowRoot.appendChild(dotsContainer);
    this.navDots = dotsContainer.querySelectorAll('.nav-dot');
  }
  
  /**
   * Generate HTML for experience highlights
   */
  generateExperienceHTML() {
    let html = '<div class="experience-entries">';
    
    this.profileData.experience.companies.forEach(company => {
      html += `
        <div class="experience-entry">
          <h4>${company.role}</h4>
          <div class="company-details">
            <span class="company-name">${company.name}</span>
            <span class="duration">${company.duration}</span>
          </div>
          <ul class="highlights">
      `;
      
      company.highlights.forEach(highlight => {
        html += `<li>${highlight}</li>`;
      });
      
      html += `
          </ul>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }
  
  /**
   * Called when the element is added to the DOM
   */
  connectedCallback() {
    // Initialize THREE.js
    this.initThreeJS();
    
    // Start role animation
    this.startRoleAnimation();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start animation loop
    this.animate();
  }
  
  /**
   * Called when the element is removed from the DOM
   */
  disconnectedCallback() {
    // Stop role animation
    this.stopRoleAnimation();
    
    // Clean up event listeners
    this.contentContainer.removeEventListener('scroll', this.scrollHandler);
    window.removeEventListener('resize', this.resizeHandler);
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    
    // Stop animation
    this.stopAnimation();
    
    // Dispose of THREE.js resources
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
  
  /**
   * Initialize THREE.js scene
   */
  initThreeJS() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050716);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 10;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create particles
    this.createParticles();
  }
  
  /**
   * Create particle system
   */
  createParticles() {
    // Particle count based on performance consideration
    const particleCount = window.innerWidth > 768 ? 150 : 80;
    
    // Particle geometry
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    // Create particles with random positions
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      this.particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        originalZ: z
      });
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Particle material
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x0088ff,
      size: window.innerWidth > 768 ? 0.15 : 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    // Create points mesh
    this.particlePoints = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particlePoints);
    
    // Create line group for connections
    this.lineGroup = new THREE.Group();
    this.scene.add(this.lineGroup);
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Scroll handler
    this.scrollHandler = this.handleScroll.bind(this);
    this.contentContainer.addEventListener('scroll', this.scrollHandler);
    
    // Resize handler
    this.resizeHandler = this.handleResize.bind(this);
    window.addEventListener('resize', this.resizeHandler);
    
    // Mouse move handler
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    document.addEventListener('mousemove', this.mouseMoveHandler);
    
    // Scroll down button
    const scrollDownBtn = this.shadowRoot.querySelector('#scroll-down');
    if (scrollDownBtn) {
      scrollDownBtn.addEventListener('click', () => {
        this.scrollToSection(1);
      });
    }
  }
  
  /**
   * Start cycling through roles
   */
  startRoleAnimation() {
    const roleElement = this.shadowRoot.querySelector('#role-text');
    if (!roleElement) return;
    
    roleElement.textContent = this.profileData.roles[0];
    
    this.roleChangeInterval = setInterval(() => {
      this.currentRoleIndex = (this.currentRoleIndex + 1) % this.profileData.roles.length;
      
      // Fade out
      roleElement.style.opacity = 0;
      roleElement.style.transform = 'translateY(10px)';
      
      // After fade out, change text and fade in
      setTimeout(() => {
        roleElement.textContent = this.profileData.roles[this.currentRoleIndex];
        roleElement.style.opacity = 1;
        roleElement.style.transform = 'translateY(0)';
      }, 500);
    }, 3000);
  }
  
  /**
   * Stop role animation
   */
  stopRoleAnimation() {
    if (this.roleChangeInterval) {
      clearInterval(this.roleChangeInterval);
      this.roleChangeInterval = null;
    }
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Update camera
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    // Update renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  /**
   * Handle mouse movement
   */
  handleMouseMove(event) {
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.lastMouseMoveTime = Date.now();
    this.mouseActive = true;
  }
  
  /**
   * Handle scroll events
   */
  handleScroll() {
    const scrollPos = this.contentContainer.scrollTop;
    const windowHeight = window.innerHeight;
    
    // Find which section is visible
    let activeIndex = 0;
    this.sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const top = rect.top + scrollPos - this.contentContainer.offsetTop;
      
      if (scrollPos >= top - windowHeight / 2) {
        activeIndex = index;
      }
    });
    
    // Update active section and navigation dots
    if (activeIndex !== this.activeSection) {
      this.activeSection = activeIndex;
      
      // Update nav dots
      this.navDots.forEach((dot, index) => {
        if (index === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
      
      // Update section visibility
      this.sections.forEach((section, index) => {
        if (index === activeIndex) {
          section.classList.add('active');
        }
      });
    }
  }
  
  /**
   * Scroll to a specific section
   */
  scrollToSection(index) {
    const section = this.sections[index];
    if (section) {
      this.contentContainer.scrollTo({
        top: section.offsetTop,
        behavior: 'smooth'
      });
    }
  }
  
  /**
   * Update particle positions
   */
  updateParticles() {
    if (!this.particlePoints) return;
    
    const positionArray = this.particlePoints.geometry.attributes.position.array;
    
    // Update each particle
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      // Apply velocity
      particle.position.add(particle.velocity);
      
      // Bounce off boundaries
      if (Math.abs(particle.position.x) > 10) {
        particle.velocity.x *= -1;
      }
      if (Math.abs(particle.position.y) > 10) {
        particle.velocity.y *= -1;
      }
      if (Math.abs(particle.position.z) > 10) {
        particle.velocity.z *= -1;
      }
      
      // Apply mouse influence
      if (this.mouseActive && Date.now() - this.lastMouseMoveTime < 2000) {
        const mouseVector = new THREE.Vector3(
          this.mousePosition.x * 10,
          this.mousePosition.y * 10,
          0
        );
        
        const direction = new THREE.Vector3().subVectors(mouseVector, particle.position);
        const distance = direction.length();
        
        if (distance > 0.1) {
          direction.normalize();
          const factor = i % 2 === 0 ? 1 : -1;
          const strength = 0.0003;
          direction.multiplyScalar((strength * factor) / Math.max(0.1, distance * 0.1));
          particle.velocity.add(direction);
        }
      }
      
      // Apply scroll influence
      if (this.activeSection !== undefined) {
        // Adjust particle behavior based on active section
        const sectionInfluence = this.activeSection * 0.2;
        particle.velocity.multiplyScalar(0.99 + sectionInfluence * 0.01);
      }
      
      // Update position in geometry buffer
      positionArray[i * 3] = particle.position.x;
      positionArray[i * 3 + 1] = particle.position.y;
      positionArray[i * 3 + 2] = particle.position.z;
    }
    
    // Flag geometry for update
    this.particlePoints.geometry.attributes.position.needsUpdate = true;
  }
  
  /**
   * Update connections between particles
   */
  updateConnections() {
    if (!this.lineGroup) return;
    
    // Only update connections every few frames for performance
    if (Math.random() > 0.1) return;
    
    // Remove existing lines
    while (this.lineGroup.children.length > 0) {
      this.lineGroup.remove(this.lineGroup.children[0]);
    }
    
    // Maximum connections per particle
    const maxConnections = window.innerWidth > 768 ? 3 : 2;
    
    // Track connected pairs to avoid duplicates
    const connectedPairs = new Map();
    
    // Check for particles in proximity
    for (let i = 0; i < this.particles.length; i++) {
      const particle1 = this.particles[i];
      let connectionsCount = 0;
      
      for (let j = i + 1; j < this.particles.length; j++) {
        const particle2 = this.particles[j];
        
        // Skip if already connected
        const pairKey = `${i}-${j}`;
        if (connectedPairs.has(pairKey)) {
          continue;
        }
        
        // Calculate distance
        const distance = particle1.position.distanceTo(particle2.position);
        
        // Connect if close enough and below max connections
        if (distance < 3 && connectionsCount < maxConnections) {
          // Create line geometry
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            particle1.position,
            particle2.position
          ]);
          
          // Line color varies by section
          let lineColor = 0x0066cc;
          if (this.activeSection === 1) lineColor = 0x66aaff;
          if (this.activeSection === 2) lineColor = 0x00ccff;
          if (this.activeSection === 3) lineColor = 0x00ffcc;
          
          // Line material with opacity based on distance
          const lineMaterial = new THREE.LineBasicMaterial({
            color: lineColor,
            transparent: true,
            opacity: Math.min(0.5, 1 - (distance / 3))
          });
          
          // Create line and add to scene
          const line = new THREE.Line(lineGeometry, lineMaterial);
          this.lineGroup.add(line);
          
          // Mark as connected
          connectedPairs.set(pairKey, true);
          connectionsCount++;
        }
      }
    }
  }
  
  /**
   * Animation loop
   */
  animate() {
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
    
    // Update particles
    this.updateParticles();
    
    // Update connections
    this.updateConnections();
    
    // Gentle rotation speed varies by section
    let rotationSpeed = 0.001;
    if (this.activeSection === 1) rotationSpeed = 0.0015;
    if (this.activeSection === 2) rotationSpeed = 0.002;
    if (this.activeSection === 3) rotationSpeed = 0.0025;
    
    // Rotate particle system
    if (this.particlePoints) {
      this.particlePoints.rotation.y += rotationSpeed;
    }
    if (this.lineGroup) {
      this.lineGroup.rotation.y += rotationSpeed;
    }
    
    // Render
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * Stop animation
   */
  stopAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}

// Register custom element
customElements.define('landing-page', LandingPage);

export default LandingPage;
