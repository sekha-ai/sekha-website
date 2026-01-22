// Custom JavaScript for Sekha documentation

// Add copy button feedback
document.addEventListener('DOMContentLoaded', function() {
  // Track copy button clicks
  const copyButtons = document.querySelectorAll('.md-clipboard');
  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Analytics or feedback here
      console.log('Code copied');
    });
  });

  // External link indicators
  const links = document.querySelectorAll('a[href^="http"]');
  links.forEach(link => {
    if (!link.hostname.includes('sekha.dev')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
});