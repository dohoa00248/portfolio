document.addEventListener('DOMContentLoaded', () => {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebarMenu');

  // Toggle Sidebar (mobile)
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('show');
    });

    // Click outside closes sidebar
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('show');
      }
    });
  }

  const accountToggle = document.getElementById('accountToggle');
  const accountMenu = document.getElementById('accountMenu');

  // Toggle Account Menu
  if (accountToggle && accountMenu) {
    accountToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      accountMenu.classList.toggle('d-none');
    });

    // Click outside closes account menu
    document.addEventListener('click', (e) => {
      if (
        !accountMenu.contains(e.target) &&
        !accountToggle.contains(e.target)
      ) {
        accountMenu.classList.add('d-none');
      }
    });
  }
});
