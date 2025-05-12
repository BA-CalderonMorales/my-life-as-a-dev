
document.addEventListener('DOMContentLoaded', function() {
  // Only run on landing page
  if (!document.body.classList.contains('landing-page')) {
    return;
  }

  // Add smooth scrolling to all internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      
      if (targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 100, // Offset to account for fixed header
            behavior: 'smooth'
          });
          
          // Update URL without page reload
          history.pushState(null, null, `#${targetId}`);
        }
      }
    });
  });

  // Add parallax effect to hero section
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    window.addEventListener('scroll', function() {
      const scrollPosition = window.pageYOffset;
      if (scrollPosition <= 600) {
        const translateY = scrollPosition * 0.3;
        heroSection.style.transform = `translateY(${translateY}px)`;
        heroSection.style.opacity = 1 - (scrollPosition / 600);
      }
    });
  }
  
  // Add scroll reveal animation
  const revealElements = document.querySelectorAll('.section-divider, .tabbed-experience, .final-cta, .featured-section');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  revealElements.forEach(element => {
    element.classList.add('reveal-element');
    revealObserver.observe(element);
  });
});
