// utils/styleUtils.js
export function resetAppStyles() {
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.style.display = 'grid';
    appElement.style.gridTemplateColumns = '1fr 1fr';
    appElement.style.padding = '0 2rem';
  }
}

export function setAppStylesForHome() {
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.style.display = 'block';
    appElement.style.gridTemplateColumns = '';
    appElement.style.padding = '';
  }
}

export function setAppStylesForEditBlog() {
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.style.display = 'flex';
    appElement.style.justifyContent = 'center';
    appElement.style.alignItems = 'center';
    appElement.style.height = '100vh'; // Ensure full viewport height
    appElement.style.padding = '0';
  }
}

export function setAppStylesForBlogDetail() {
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.style.display = 'flex';
    appElement.style.justifyContent = 'center';
    appElement.style.alignItems = 'flex-start'; // Align items to the start of the container
    appElement.style.padding = '2rem'; // Adjust padding if needed
  }
}
