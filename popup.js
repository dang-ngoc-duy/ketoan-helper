// ===== VAT CALCULATOR =====
const amountInput = document.getElementById('amount');
const vatTypeSelect = document.getElementById('vat-type');
const baseAmountSpan = document.getElementById('base-amount');
const vatAmountSpan = document.getElementById('vat-amount');
const totalAmountSpan = document.getElementById('total-amount');
const copyVatBtn = document.getElementById('copy-vat');

function formatNumber(num) {
  return Math.round(num).toLocaleString('vi-VN');
}

function calculateVAT() {
  const amount = parseFloat(amountInput.value.replace(/[^0-9]/g, '')) || 0;
  const type = vatTypeSelect.value;
  
  let baseAmount, vatAmount, totalAmount;
  
  if (type === 'add-8' || type === 'add-10') {
    const rate = type === 'add-8' ? 0.08 : 0.10;
    baseAmount = amount;
    vatAmount = amount * rate;
    totalAmount = amount + vatAmount;
  } else {
    const rate = type === 'remove-8' ? 1.08 : 1.10;
    totalAmount = amount;
    baseAmount = amount / rate;
    vatAmount = totalAmount - baseAmount;
  }
  
  baseAmountSpan.textContent = formatNumber(baseAmount);
  vatAmountSpan.textContent = formatNumber(vatAmount);
  totalAmountSpan.textContent = formatNumber(totalAmount);
}

amountInput.addEventListener('input', calculateVAT);
vatTypeSelect.addEventListener('change', calculateVAT);

copyVatBtn.addEventListener('click', () => {
  const text = `Tiền hàng: ${baseAmountSpan.textContent} đ\nThuế VAT: ${vatAmountSpan.textContent} đ\nTổng tiền: ${totalAmountSpan.textContent} đ`;
  navigator.clipboard.writeText(text);
  copyVatBtn.textContent = '✓ Đã copy!';
  setTimeout(() => {
    copyVatBtn.textContent = '📋 Copy kết quả';
  }, 1500);
});

// ===== NUMBER TO TEXT =====
const numberInput = document.getElementById('number-input');
const convertBtn = document.getElementById('convert-number');
const textResult = document.getElementById('text-result');
const copyTextBtn = document.getElementById('copy-text');

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

convertBtn.addEventListener('click', () => {
  const num = parseFloat(numberInput.value.replace(/[^0-9]/g, '')) || 0;
  const text = numberToVietnameseText(num);
  textResult.textContent = text;
  textResult.style.background = '#d4edda';
  textResult.style.color = '#155724';
  textResult.style.padding = '12px';
  textResult.style.borderRadius = '4px';
  copyTextBtn.style.display = 'block';
});

copyTextBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(textResult.textContent);
  copyTextBtn.textContent = '✓ Đã copy!';
  setTimeout(() => {
    copyTextBtn.textContent = '📋 Copy';
  }, 1500);
});

// ===== MULTI-CLIPBOARD =====
const tabButtons = document.querySelectorAll('.tab');
const savedTab = document.getElementById('saved-tab');
const historyTab = document.getElementById('history-tab');
const savedList = document.getElementById('saved-list');
const historyList = document.getElementById('history-list');
const addSavedBtn = document.getElementById('add-saved');
const clearHistoryBtn = document.getElementById('clear-history');

// Tab switching
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    if (btn.dataset.tab === 'saved') {
      savedTab.classList.add('active');
      historyTab.classList.remove('active');
    } else {
      savedTab.classList.remove('active');
      historyTab.classList.add('active');
    }
  });
});

// Load saved items
function loadSavedItems() {
  chrome.storage.sync.get(['savedItems'], (result) => {
    const items = result.savedItems || [];
    savedList.innerHTML = '';
    items.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'clipboard-item';
      div.innerHTML = `
        <div>
          <div class="clipboard-item-label">${item.label}</div>
          <div class="clipboard-item-value">${item.value}</div>
        </div>
        <button class="clipboard-item-delete" data-index="${index}">Xóa</button>
      `;
      div.addEventListener('click', (e) => {
        if (!e.target.classList.contains('clipboard-item-delete')) {
          navigator.clipboard.writeText(item.value);
          div.style.background = '#2ecc71';
          setTimeout(() => {
            div.style.background = '';
          }, 500);
        }
      });
      savedList.appendChild(div);
    });
    
    // Delete buttons
    document.querySelectorAll('.clipboard-item-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        items.splice(index, 1);
        chrome.storage.sync.set({ savedItems: items }, loadSavedItems);
      });
    });
  });
}

// Load history
function loadHistory() {
  chrome.storage.local.get(['clipboardHistory'], (result) => {
    const history = result.clipboardHistory || [];
    historyList.innerHTML = '';
    history.slice(0, 20).forEach((item) => {
      const div = document.createElement('div');
      div.className = 'clipboard-item';
      div.innerHTML = `<div class="clipboard-item-value">${item}</div>`;
      div.addEventListener('click', () => {
        navigator.clipboard.writeText(item);
        div.style.background = '#2ecc71';
        setTimeout(() => {
          div.style.background = '';
        }, 500);
      });
      historyList.appendChild(div);
    });
  });
}

// Add new saved item
addSavedBtn.addEventListener('click', () => {
  const label = prompt('Nhập tên:');
  if (!label) return;
  const value = prompt('Nhập nội dung:');
  if (!value) return;
  
  chrome.storage.sync.get(['savedItems'], (result) => {
    const items = result.savedItems || [];
    items.push({ label, value });
    chrome.storage.sync.set({ savedItems: items }, loadSavedItems);
  });
});

// Clear history
clearHistoryBtn.addEventListener('click', () => {
  if (confirm('Xóa toàn bộ lịch sử?')) {
    chrome.storage.local.set({ clipboardHistory: [] }, loadHistory);
  }
});

// Initialize
loadSavedItems();
loadHistory();
