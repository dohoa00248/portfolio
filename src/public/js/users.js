document.addEventListener('DOMContentLoaded', () => {
  const sidebarMenu = document.querySelector('#sidebarMenu');
  const sidebarToggle = document.querySelector('#sidebarToggle');

  if (!sidebarMenu || !sidebarToggle) {
    console.error('Error: Missing required elements in the DOM');
    return;
  }

  sidebarToggle.addEventListener('click', () => {
    sidebarMenu.classList.toggle('hide');
  });
});
