// ===== FLOATING TOOLTIP =====
let tooltip = null;
let currentSelection = null;

function createTooltip() {
  tooltip = document.createElement('div');
  tooltip.id = 'ketoan-helper-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    line-height: 1.5;
    display: none;
    max-width: 400px;
    pointer-events: none;
  `;
  document.body.appendChild(tooltip);
  return tooltip;
}

function showTooltip(x, y, content) {
  if (!tooltip) tooltip = createTooltip();
  
  tooltip.innerHTML = content;
  tooltip.style.display = 'block';
  tooltip.style.left = x + 'px';
  tooltip.style.top = (y - tooltip.offsetHeight - 10) + 'px';
  
  // Auto-hide after 4s
  setTimeout(() => {
    if (tooltip) tooltip.style.display = 'none';
  }, 4000);
}

function hideTooltip() {
  if (tooltip) tooltip.style.display = 'none';
}

// ===== NUMBER TO VIETNAMESE TEXT =====
function numberToVietnameseText(num) {
  if (num === 0) return 'Không đồng';
  
  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
  
  function readGroup(n) {
    let hundred = Math.floor(n / 100);
    let ten = Math.floor((n % 100) / 10);
    let one = n % 10;
    
    let result = '';
    if (hundred > 0) result += ones[hundred] + ' trăm ';
    
    if (ten === 0 && one !== 0) {
      result += 'lẻ ';
    } else if (ten === 1) {
      result += 'mười ';
    } else if (ten > 1) {
      result += tens[ten] + ' ';
    }
    
    if (one === 1 && ten > 1) {
      result += 'mốt ';
    } else if (one === 5 && ten > 0) {
      result += 'lăm ';
    } else if (one > 0) {
      result += ones[one] + ' ';
    }
    
    return result.trim();
  }
  
  const billion = Math.floor(num / 1000000000);
  const million = Math.floor((num % 1000000000) / 1000000);
  const thousand = Math.floor((num % 1000000) / 1000);
  const unit = num % 1000;
  
  let result = '';
  if (billion > 0) result += readGroup(billion) + ' tỷ ';
  if (million > 0) result += readGroup(million) + ' triệu ';
  if (thousand > 0) result += readGroup(thousand) + ' nghìn ';
  if (unit > 0) result += readGroup(unit);
  
  result = result.trim();
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result + ' đồng chẵn';
}

// ===== VAT CALCULATION =====
function calculateVAT(amount, rate) {
  const base = amount;
  const vat = amount * rate;
  const total = amount + vat;
  return { base, vat, total };
}

function removeVAT(amount, rate) {
  const total = amount;
  const base = amount / (1 + rate);
  const vat = total - base;
  return { base, vat, total };
}

function formatNumber(num) {
  return Math.round(num).toLocaleString('vi-VN');
}

// ===== SELECTION HANDLER =====
document.addEventListener('mouseup', (e) => {
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (!text) {
      hideTooltip();
      return;
    }
    
    // Extract number
    const numStr = text.replace(/[^0-9]/g, '');
    const num = parseInt(numStr);
    
    if (isNaN(num) || num < 1000) {
      hideTooltip();
      return;
    }
    
    currentSelection = num;
    
    // Calculate VAT options
    const vat8 = calculateVAT(num, 0.08);
    const vat10 = calculateVAT(num, 0.10);
    const readText = numberToVietnameseText(num);
    
    const tooltipContent = `
      <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">💰 ${formatNumber(num)} đ</div>
      <div style="margin-bottom: 6px;">
        <span style="opacity: 0.8;">+ VAT 8%:</span> <strong>${formatNumber(vat8.total)} đ</strong>
      </div>
      <div style="margin-bottom: 6px;">
        <span style="opacity: 0.8;">+ VAT 10%:</span> <strong>${formatNumber(vat10.total)} đ</strong>
      </div>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 12px; opacity: 0.9;">
        ${readText}
      </div>
      <div style="margin-top: 8px; font-size: 11px; opacity: 0.7;">
        💡 Chuột phải để xem thêm options
      </div>
    `;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    showTooltip(rect.left + window.scrollX, rect.top + window.scrollY, tooltipContent);
  }, 10);
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
  const selection = window.getSelection().toString().trim();
  if (!selection) return;
  
  const numStr = selection.replace(/[^0-9]/g, '');
  const num = parseInt(numStr);
  if (isNaN(num) || num < 1000) return;
  
  let result = null;
  
  // Ctrl+Shift+8 = VAT 8%
  if (e.ctrlKey && e.shiftKey && e.key === '*') {
    e.preventDefault();
    const vat = calculateVAT(num, 0.08);
    result = `Tiền hàng: ${formatNumber(vat.base)} đ\nThuế VAT 8%: ${formatNumber(vat.vat)} đ\nTổng tiền: ${formatNumber(vat.total)} đ`;
  }
  
  // Ctrl+Shift+1 = VAT 10%
  if (e.ctrlKey && e.shiftKey && e.key === '!') {
    e.preventDefault();
    const vat = calculateVAT(num, 0.10);
    result = `Tiền hàng: ${formatNumber(vat.base)} đ\nThuế VAT 10%: ${formatNumber(vat.vat)} đ\nTổng tiền: ${formatNumber(vat.total)} đ`;
  }
  
  // Ctrl+Shift+T = Read text (already in manifest)
  if (e.ctrlKey && e.shiftKey && e.key === 'T') {
    e.preventDefault();
    result = numberToVietnameseText(num);
  }
  
  if (result) {
    navigator.clipboard.writeText(result);
    showNotification('✓ Đã copy!', result);
  }
});

// ===== NOTIFICATION =====
function showNotification(title, message) {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2ecc71;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 999999;
    font-family: sans-serif;
    font-size: 14px;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `;
  notif.innerHTML = `<strong>${title}</strong><br><span style="font-size:12px;opacity:0.9;">${message}</span>`;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// ===== ANIMATIONS =====
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ===== CONTEXT MENU MESSAGE HANDLER =====
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showNotification') {
    showNotification(request.title, request.message);
  }
});
