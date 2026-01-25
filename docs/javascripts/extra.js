// Sekha Documentation - Custom JavaScript

// Analytics tracking (when GA is configured)
if (window.ga) {
  // Track external link clicks
  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.hostname !== window.location.hostname) {
      ga('send', 'event', 'outbound', 'click', e.target.href);
    }
  });
}

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// Add copy button feedback
document.addEventListener('DOMContentLoaded', function() {
  const copyButtons = document.querySelectorAll('.md-clipboard');
  copyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const originalTitle = this.title;
      this.title = 'Copied!';
      setTimeout(() => {
        this.title = originalTitle;
      }, 2000);
    });
  });
});

// Enhanced search tracking
if (typeof document$ !== 'undefined') {
  document$.subscribe(function() {
    const searchInput = document.querySelector('.md-search__input');
    if (searchInput) {
      searchInput.addEventListener('blur', function() {
        if (this.value && window.ga) {
          ga('send', 'event', 'search', 'query', this.value);
        }
      });
    }
  });
}

// Print current page info to console (development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('Sekha Docs - Development Mode');
  console.log('Page:', document.title);
  console.log('MkDocs version:', document.querySelector('meta[name="generator"]')?.content);
}
