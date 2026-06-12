// ===== HELPER FUNCTIONS =====
function formatNumber(num) {
  return Math.round(num).toLocaleString('vi-VN');
}

function parseAmount(str) {
  return parseFloat(String(str).replace(/[^0-9]/g, '')) || 0;
}

// ===== TAB NAVIGATION =====
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tab + '-tab').classList.add('active');
  });
});

// ===== VAT CALCULATOR =====
const vatAmountInput = document.getElementById('vat-amount');
const vatTypeSelect = document.getElementById('vat-type');
const baseAmountSpan = document.getElementById('base-amount');
const vatAmountDisplay = document.getElementById('vat-amount-display');
const totalAmountSpan = document.getElementById('total-amount');
const copyVatBtn = document.getElementById('copy-vat');

function calculateVAT() {
  const amount = parseAmount(vatAmountInput.value);
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
  vatAmountDisplay.textContent = formatNumber(vatAmount);
  totalAmountSpan.textContent = formatNumber(totalAmount);
}

vatAmountInput.addEventListener('input', calculateVAT);
vatTypeSelect.addEventListener('change', calculateVAT);

copyVatBtn.addEventListener('click', () => {
  const text = `Tiền hàng: ${baseAmountSpan.textContent} đ\nThuế VAT: ${vatAmountDisplay.textContent} đ\nTổng tiền: ${totalAmountSpan.textContent} đ`;
  navigator.clipboard.writeText(text);
  flashButton(copyVatBtn, '✓ Đã copy!', '📋 Copy kết quả');
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

convertBtn.addEventListener('click', () => {
  const num = parseAmount(numberInput.value);
  const text = numberToVietnameseText(num);
  textResult.textContent = text;
  textResult.classList.add('success');
  copyTextBtn.style.display = 'block';
});

copyTextBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(textResult.textContent);
  flashButton(copyTextBtn, '✓ Đã copy!', '📋 Copy');
});

// ===== MST LOOKUP =====
const mstInput = document.getElementById('mst-input');
const lookupMstBtn = document.getElementById('lookup-mst');
const mstResult = document.getElementById('mst-result');
const copyMstBtn = document.getElementById('copy-mst');
let currentBusinessInfo = null;

lookupMstBtn.addEventListener('click', async () => {
  const mst = mstInput.value.trim();
  if (!mst) {
    mstResult.innerHTML = '<div class="error">Vui lòng nhập MST</div>';
    return;
  }

  mstResult.innerHTML = '<div class="loading">Đang tra cứu...</div>';
  copyMstBtn.style.display = 'none';

  const result = await lookupMST(mst);
  
  if (result.success) {
    currentBusinessInfo = result.data;
    mstResult.innerHTML = formatBusinessInfo(result.data);
    copyMstBtn.style.display = 'block';
  } else {
    mstResult.innerHTML = `<div class="error">${result.error}</div>`;
  }
});

copyMstBtn.addEventListener('click', () => {
  if (currentBusinessInfo) {
    navigator.clipboard.writeText(copyBusinessInfo(currentBusinessInfo));
    flashButton(copyMstBtn, '✓ Đã copy!', '📋 Copy thông tin');
  }
});

// ===== TAX CALCULATOR =====
const calcTaxBtn = document.getElementById('calculate-tax');
const taxResult = document.getElementById('tax-result');
const copyTaxBtn = document.getElementById('copy-tax');
let currentTaxResult = null;

calcTaxBtn.addEventListener('click', () => {
  const salary = parseAmount(document.getElementById('tax-salary').value);
  const dependents = parseInt(document.getElementById('tax-dependents').value) || 0;
  const insurance = parseAmount(document.getElementById('tax-insurance').value);
  const other = parseAmount(document.getElementById('tax-other').value);

  if (salary <= 0) {
    taxResult.innerHTML = '<div class="error">Vui lòng nhập lương gross</div>';
    return;
  }

  currentTaxResult = calculatePersonalIncomeTax(salary, dependents, insurance, other);
  taxResult.innerHTML = formatTaxResult(currentTaxResult);
  copyTaxBtn.style.display = 'block';
});

copyTaxBtn.addEventListener('click', () => {
  if (currentTaxResult) {
    navigator.clipboard.writeText(formatTaxResultForClipboard(currentTaxResult));
    flashButton(copyTaxBtn, '✓ Đã copy!', '📋 Copy kết quả');
  }
});

// ===== DEPRECIATION =====
const calcDepBtn = document.getElementById('calculate-dep');
const depResult = document.getElementById('dep-result');
const copyDepBtn = document.getElementById('copy-dep');
const depMethodSelect = document.getElementById('dep-method');
const residualGroup = document.getElementById('residual-group');
let currentDepResult = null;

depMethodSelect.addEventListener('change', () => {
  // Hide residual value for declining balance
  residualGroup.style.display = depMethodSelect.value === 'declining' ? 'none' : 'block';
});

calcDepBtn.addEventListener('click', () => {
  const cost = parseAmount(document.getElementById('dep-cost').value);
  const life = parseInt(document.getElementById('dep-life').value) || 1;
  const method = depMethodSelect.value;
  const residual = parseAmount(document.getElementById('dep-residual').value);

  if (cost <= 0) {
    depResult.innerHTML = '<div class="error">Vui lòng nhập nguyên giá</div>';
    return;
  }

  if (method === 'straight') {
    currentDepResult = straightLineDepreciation(cost, life, residual);
  } else {
    currentDepResult = decliningBalanceDepreciation(cost, life);
  }

  depResult.innerHTML = formatDepreciationResult(currentDepResult);
  copyDepBtn.style.display = 'block';
});

copyDepBtn.addEventListener('click', () => {
  if (currentDepResult) {
    navigator.clipboard.writeText(formatDepreciationForClipboard(currentDepResult));
    flashButton(copyDepBtn, '✓ Đã copy!', '📋 Copy kết quả');
  }
});

// ===== EXCHANGE RATE =====
const fetchRatesBtn = document.getElementById('fetch-rates');
const exchangeResult = document.getElementById('exchange-result');
const exchangeBankSelect = document.getElementById('exchange-bank');
let currentRates = null;

fetchRatesBtn.addEventListener('click', async () => {
  const bank = exchangeBankSelect.value;
  exchangeResult.innerHTML = '<div class="loading">Đang tải tỷ giá...</div>';

  const result = await fetchExchangeRates(bank);
  
  if (result.success) {
    currentRates = result.rates;
    exchangeResult.innerHTML = formatExchangeRates(result);
  } else {
    exchangeResult.innerHTML = `<div class="error">${result.error}</div>`;
  }
});

// Currency converter
const convertCurrencyBtn = document.getElementById('convert-currency');
const convertResult = document.getElementById('convert-result');

convertCurrencyBtn.addEventListener('click', async () => {
  const amount = parseAmount(document.getElementById('convert-amount').value);
  const from = document.getElementById('convert-from').value;
  const to = document.getElementById('convert-to').value;

  if (amount <= 0) {
    convertResult.innerHTML = '<div class="error">Vui lòng nhập số tiền</div>';
    return;
  }

  // Fetch rates if not loaded
  if (!currentRates) {
    convertResult.innerHTML = '<div class="loading">Đang tải tỷ giá...</div>';
    const result = await fetchExchangeRates('vcb');
    if (result.success) {
      currentRates = result.rates;
    } else {
      convertResult.innerHTML = '<div class="error">Không thể tải tỷ giá</div>';
      return;
    }
  }

  const conversion = convertCurrency(amount, from, to, currentRates, 'sell');
  
  if (conversion.success) {
    const fmt = (n) => to === 'VND' ? formatNumber(n) : n.toFixed(2);
    convertResult.innerHTML = `
      <div class="convert-output">
        <strong>${formatNumber(amount)} ${from}</strong> = 
        <strong class="highlight">${fmt(conversion.result)} ${to}</strong>
        ${conversion.rate ? `<div class="rate-note">Tỷ giá: 1 ${from === 'VND' ? to : from} = ${formatNumber(conversion.rate)} VND</div>` : ''}
      </div>`;
  } else {
    convertResult.innerHTML = `<div class="error">${conversion.error}</div>`;
  }
});

// ===== MULTI-CLIPBOARD =====
const clipboardTabs = document.querySelectorAll('#clipboard-tab .tab');
const savedTabContent = document.getElementById('saved-tab-content');
const historyTabContent = document.getElementById('history-tab-content');
const savedList = document.getElementById('saved-list');
const historyList = document.getElementById('history-list');
const addSavedBtn = document.getElementById('add-saved');
const clearHistoryBtn = document.getElementById('clear-history');

clipboardTabs.forEach(btn => {
  btn.addEventListener('click', () => {
    clipboardTabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (btn.dataset.tab === 'saved') {
      savedTabContent.classList.add('active');
      historyTabContent.classList.remove('active');
    } else {
      savedTabContent.classList.remove('active');
      historyTabContent.classList.add('active');
    }
  });
});

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
        <button class="clipboard-item-delete" data-index="${index}">Xóa</button>`;
      div.addEventListener('click', (e) => {
        if (!e.target.classList.contains('clipboard-item-delete')) {
          navigator.clipboard.writeText(item.value);
          div.classList.add('copied');
          setTimeout(() => div.classList.remove('copied'), 500);
        }
      });
      savedList.appendChild(div);
    });

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
        div.classList.add('copied');
        setTimeout(() => div.classList.remove('copied'), 500);
      });
      historyList.appendChild(div);
    });
  });
}

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

clearHistoryBtn.addEventListener('click', () => {
  if (confirm('Xóa toàn bộ lịch sử?')) {
    chrome.storage.local.set({ clipboardHistory: [] }, loadHistory);
  }
});

// ===== UTILITY =====
function flashButton(btn, successText, originalText) {
  btn.textContent = successText;
  setTimeout(() => { btn.textContent = originalText; }, 1500);
}

// ===== INITIALIZE =====
loadSavedItems();
loadHistory();
