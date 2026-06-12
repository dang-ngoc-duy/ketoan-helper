// ===== CONTEXT MENUS =====
chrome.runtime.onInstalled.addListener(() => {
  // Parent menu
  chrome.contextMenus.create({
    id: 'ketoan-parent',
    title: '🧮 KeToan Helper',
    contexts: ['selection']
  });

  // Sub-menus
  chrome.contextMenus.create({
    id: 'read-number',
    parentId: 'ketoan-parent',
    title: '🔢 Đọc số tiền bằng chữ → Copy',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'vat-add-8',
    parentId: 'ketoan-parent',
    title: '➕ Cộng VAT 8% → Copy',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'vat-add-10',
    parentId: 'ketoan-parent',
    title: '➕ Cộng VAT 10% → Copy',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'vat-remove-8',
    parentId: 'ketoan-parent',
    title: '➖ Tách VAT 8% → Copy',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'vat-remove-10',
    parentId: 'ketoan-parent',
    title: '➖ Tách VAT 10% → Copy',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'separator-1',
    parentId: 'ketoan-parent',
    type: 'separator',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'save-clipboard',
    parentId: 'ketoan-parent',
    title: '📋 Lưu vào Clipboard cố định',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'format-number',
    parentId: 'ketoan-parent',
    title: '🔄 Format số (1.000.000) → Copy',
    contexts: ['selection']
  });
});

// ===== CONTEXT MENU CLICK HANDLER =====
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText;
  const numStr = selectedText.replace(/[^0-9]/g, '');
  const num = parseInt(numStr);

  if (isNaN(num) && info.menuItemId !== 'save-clipboard') return;

  let result = '';
  let title = '';

  switch (info.menuItemId) {
    case 'read-number':
      result = numberToVietnameseText(num);
      title = '🔢 Đọc số tiền';
      break;

    case 'vat-add-8': {
      const vat = num * 0.08;
      const total = num + vat;
      result = `Tiền hàng: ${formatNum(num)} đ\nThuế VAT 8%: ${formatNum(vat)} đ\nTổng tiền: ${formatNum(total)} đ`;
      title = '➕ VAT 8%';
      break;
    }

    case 'vat-add-10': {
      const vat = num * 0.10;
      const total = num + vat;
      result = `Tiền hàng: ${formatNum(num)} đ\nThuế VAT 10%: ${formatNum(vat)} đ\nTổng tiền: ${formatNum(total)} đ`;
      title = '➕ VAT 10%';
      break;
    }

    case 'vat-remove-8': {
      const base = num / 1.08;
      const vat = num - base;
      result = `Tiền hàng: ${formatNum(base)} đ\nThuế VAT 8%: ${formatNum(vat)} đ\nTổng tiền: ${formatNum(num)} đ`;
      title = '➖ Tách VAT 8%';
      break;
    }

    case 'vat-remove-10': {
      const base = num / 1.10;
      const vat = num - base;
      result = `Tiền hàng: ${formatNum(base)} đ\nThuế VAT 10%: ${formatNum(vat)} đ\nTổng tiền: ${formatNum(num)} đ`;
      title = '➖ Tách VAT 10%';
      break;
    }

    case 'format-number':
      result = formatNum(num);
      title = '🔄 Format số';
      break;

    case 'save-clipboard':
      // Save to clipboard storage
      chrome.storage.sync.get(['savedItems'], (data) => {
        const items = data.savedItems || [];
        items.push({ label: `Saved ${new Date().toLocaleString('vi-VN')}`, value: selectedText });
        chrome.storage.sync.set({ savedItems: items });
      });
      // Notify
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (msg) => {
          chrome.runtime.sendMessage({ action: 'showNotification', title: '📋 Đã lưu!', message: msg });
        },
        args: [`"${selectedText}" đã lưu vào clipboard cố định`]
      });
      return;
  }

  if (result) {
    // Copy to clipboard
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (textToCopy) => {
        navigator.clipboard.writeText(textToCopy);
      },
      args: [result]
    });

    // Show notification
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (t, msg) => {
        chrome.runtime.sendMessage({ action: 'showNotification', title: t, message: msg });
      },
      args: [title + ' ✓ Đã copy', result]
    });
  }
});

// ===== CLIPBOARD HISTORY =====
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveToHistory') {
    chrome.storage.local.get(['clipboardHistory'], (result) => {
      let history = result.clipboardHistory || [];
      if (request.text.length >= 4) {
        history = history.filter(item => item !== request.text);
        history.unshift(request.text);
        history = history.slice(0, 20);
        chrome.storage.local.set({ clipboardHistory: history });
      }
    });
  }
});

// ===== KEYBOARD SHORTCUTS =====
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-calculator' || command === 'open-clipboard') {
    chrome.action.openPopup();
  } else if (command === 'number-to-text') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          const text = window.getSelection().toString().trim();
          if (text) {
            const num = parseInt(text.replace(/[^0-9]/g, ''));
            if (!isNaN(num) && num >= 1000) {
              // Trigger the tooltip via custom event
              document.dispatchEvent(new CustomEvent('ketoan-shortcut', { detail: { action: 'read', num } }));
            }
          }
        }
      });
    });
  }
});

// ===== HELPER FUNCTIONS =====
function formatNum(num) {
  return Math.round(num).toLocaleString('vi-VN');
}

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
    if (ten === 0 && one !== 0) result += 'lẻ ';
    else if (ten === 1) result += 'mười ';
    else if (ten > 1) result += tens[ten] + ' ';
    if (one === 1 && ten > 1) result += 'mốt ';
    else if (one === 5 && ten > 0) result += 'lăm ';
    else if (one > 0) result += ones[one] + ' ';
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
