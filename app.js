
// Simple template engine to handle template inheritance
document.addEventListener('DOMContentLoaded', function() {
  // Process template inheritance
  const templates = document.querySelectorAll('[data-template]');
  templates.forEach(template => {
    const templateId = template.getAttribute('data-template');
    const templateContent = document.getElementById(templateId).content.cloneNode(true);
    
    // Process blocks
    const blocks = template.querySelectorAll('[data-block]');
    blocks.forEach(block => {
      const blockName = block.getAttribute('data-block');
      const targetBlock = templateContent.querySelector(`[data-block="${blockName}"]`);
      if (targetBlock) {
        targetBlock.innerHTML = block.innerHTML;
      }
    });
    
    // Replace template with processed content
    template.parentNode.replaceChild(templateContent, template);
  });
});
