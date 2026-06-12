// Context menu for number to text conversion
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'number-to-text',
    title: 'Đọc số tiền bằng chữ',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'number-to-text') {
    const selectedText = info.selectionText.replace(/[^0-9]/g, '');
    const num = parseInt(selectedText);
    
    if (!isNaN(num)) {
      const text = numberToVietnameseText(num);
      
      // Copy to clipboard
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (textToCopy) => {
          navigator.clipboard.writeText(textToCopy);
        },
        args: [text]
      });
      
      // Show notification
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (result) => {
          const div = document.createElement('div');
          div.style.cssText = 'position:fixed;top:20px;right:20px;background:#2ecc71;color:white;padding:16px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:999999;font-family:sans-serif;font-size:14px;max-width:400px;word-wrap:break-word;';
          div.innerHTML = `<strong>✓ Đã copy:</strong><br>${result}`;
          document.body.appendChild(div);
          setTimeout(() => div.remove(), 3000);
        },
        args: [text]
      });
    }
  }
});

// Clipboard history tracking
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveToHistory') {
    chrome.storage.local.get(['clipboardHistory'], (result) => {
      let history = result.clipboardHistory || [];
      
      // Only save numbers (MST, invoice numbers, amounts)
      if (/^\d+$/.test(request.text.replace(/[^0-9]/g, '')) && request.text.length >= 5) {
        // Remove duplicates
        history = history.filter(item => item !== request.text);
        // Add to front
        history.unshift(request.text);
        // Keep only last 20
        history = history.slice(0, 20);
        
        chrome.storage.local.set({ clipboardHistory: history });
      }
    });
  }
});

// Keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-calculator') {
    chrome.action.openPopup();
  } else if (command === 'number-to-text') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          const selection = window.getSelection().toString();
          if (selection) {
            chrome.runtime.sendMessage({ action: 'convertNumber', text: selection });
          }
        }
      });
    });
  } else if (command === 'open-clipboard') {
    chrome.action.openPopup();
  }
});

// Number to Vietnamese text converter (shared function)
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
