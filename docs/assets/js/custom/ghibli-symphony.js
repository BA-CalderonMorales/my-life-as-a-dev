/**
 * Ghibli Symphony - Harmonious JavaScript interactions
 * Supporting the refined UI experience with smooth interactions
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize scroll reveal animations
  initScrollReveal();
  
  // Initialize scroll progress indicator
  initScrollProgress();
  
  // Initialize smooth scrolling
  initSmoothScroll();
  
  // Initialize typewriter effect
  initTypewriter();
});

/**
 * Initialize scroll reveal animations
 * Gently reveals elements as they enter the viewport
 */
function initScrollReveal() {
  // Get all elements with scroll reveal classes
  const revealElements = document.querySelectorAll('.scroll-reveal, .reveal-ltr, .reveal-rtl');
  const staggerItems = document.querySelectorAll('.stagger-item');
  
  // Create observer for standard reveal animations
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Once animated, no need to observe anymore
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });
  
  // Create observer for staggered animations
  const staggerObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      // Apply staggered delay to each item
      staggerItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('visible');
        }, index * 120); // 120ms delay between each item
      });
      
      // Once started, no need to observe anymore
      staggerObserver.unobserve(entries[0].target);
    }
  }, {
    threshold: 0.1
  });
  
  // Start observing elements
  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
  
  // If staggered items exist and have a parent, observe the parent
  if (staggerItems.length > 0) {
    const staggerParent = staggerItems[0].parentElement;
    staggerObserver.observe(staggerParent);
  }
}

/**
 * Initialize scroll progress indicator
 * Shows a progress bar at the top of the page
 */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  
  if (!progressBar) return;
  
  // Update progress on scroll
  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / windowHeight) * 100;
    
    progressBar.style.width = `${progress}%`;
    
    // Add visible class when scrolling starts
    if (scrolled > 50) {
      progressBar.classList.add('visible');
    } else {
      progressBar.classList.remove('visible');
    }
  });
}

/**
 * Initialize smooth scrolling for anchor links
 * Creates a gentle, pleasing scroll animation
 */
function initSmoothScroll() {
  // Get all scroll indicator elements
  const scrollLinks = document.querySelectorAll('.scroll-indicator, a[href^="#"]:not([href="#"])');
  
  scrollLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Get the target element
      const targetId = this.getAttribute('data-target') || this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Scroll smoothly to the target
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Initialize typewriter effect for text elements
 * Creates a typing animation effect
 */
function initTypewriter() {
  const typewriterElements = document.querySelectorAll('.typewriter-text');
  
  typewriterElements.forEach(element => {
    const texts = element.getAttribute('data-strings').split('|');
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100; // Base typing speed
    
    // Function to type next character
    function typeNextChar() {
      const currentText = texts[currentTextIndex];
      
      // If deleting text
      if (isDeleting) {
        element.textContent = currentText.substring(0, currentCharIndex - 1);
        currentCharIndex--;
        typingSpeed = 50; // Faster when deleting
      } 
      // If typing text
      else {
        element.textContent = currentText.substring(0, currentCharIndex + 1);
        currentCharIndex++;
        typingSpeed = 120; // Slower when typing
      }
      
      // When finished typing current text
      if (!isDeleting && currentCharIndex >= currentText.length) {
        isDeleting = true;
        typingSpeed = 1500; // Pause before deleting
      } 
      // When finished deleting
      else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentTextIndex = (currentTextIndex + 1) % texts.length; // Move to next text
        typingSpeed = 500; // Pause before typing next word
      }
      
      // Schedule next character
      setTimeout(typeNextChar, typingSpeed);
    }
    
    // Start the typing animation
    typeNextChar();
  });
}
