// Simple script for woman.html category interactions
document.addEventListener('DOMContentLoaded', function(){
  const cats = document.querySelectorAll('.category-bar .cat');
  cats.forEach(c => {
    c.addEventListener('click', function(){
      cats.forEach(x => x.classList.remove('active'));
      this.classList.add('active');
      console.log('Selected category:', this.textContent.trim());
    });
  });
});
