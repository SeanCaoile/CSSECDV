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
  