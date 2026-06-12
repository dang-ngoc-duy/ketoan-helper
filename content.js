// Track clipboard copy events for history
document.addEventListener('copy', (e) => {
  const text = window.getSelection().toString();
  if (text) {
    chrome.runtime.sendMessage({ action: 'saveToHistory', text: text });
  }
});

// Listen for keyboard shortcut triggers from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'convertNumber') {
    const num = parseInt(request.text.replace(/[^0-9]/g, ''));
    if (!isNaN(num)) {
      // Show overlay with converted text
      showOverlay(`Đã chuyển đổi: ${request.text}`);
    }
  }
});

function showOverlay(message) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 24px 32px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    z-index: 999999;
    font-family: sans-serif;
    font-size: 16px;
    max-width: 500px;
    text-align: center;
    animation: fadeIn 0.3s ease-in-out;
  `;
  overlay.textContent = message;
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    overlay.style.animation = 'fadeOut 0.3s ease-in-out';
    setTimeout(() => overlay.remove(), 300);
  }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
  @keyframes fadeOut {
    from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
  }
`;
document.head.appendChild(style);
