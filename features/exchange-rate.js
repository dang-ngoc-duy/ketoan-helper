// Exchange Rate Service (Tỷ giá ngoại tệ)
// API: Vietcombank XML (free, no auth required)

const VIETCOMBANK_XML_URL = 'https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx?b=10';

const BANK_NAMES = {
  vcb: 'Vietcombank'
};

// Common currency codes
const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'SGD', 'THB', 'CNY', 'KRW', 'HKD'];

/**
 * Parse Vietcombank XML to JSON
 */
function parseVietcombankXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  const rates = [];
  const exrateNodes = xmlDoc.getElementsByTagName('Exrate');
  
  for (let i = 0; i < exrateNodes.length; i++) {
    const node = exrateNodes[i];
    const currencyCode = node.getAttribute('CurrencyCode');
    const currencyName = node.getAttribute('CurrencyName');
    const buy = parseFloat(node.getAttribute('Buy')) || 0;
    const transfer = parseFloat(node.getAttribute('Transfer')) || 0;
    const sell = parseFloat(node.getAttribute('Sell')) || 0;
    
    if (currencyCode && (buy > 0 || transfer > 0 || sell > 0)) {
      rates.push({
        currency: currencyCode,
        currencyName: currencyName || currencyCode,
        buyCash: buy,
        buyTransfer: transfer,
        sell: sell
      });
    }
  }
  
  return rates;
}

/**
 * Fetch exchange rates from Vietcombank
 */
async function fetchExchangeRates(bank = 'vcb') {
  try {
    const response = await fetch(VIETCOMBANK_XML_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    const rates = parseVietcombankXML(xmlText);
    
    if (rates.length === 0) {
      return { success: false, error: 'Không có dữ liệu tỷ giá' };
    }

    return {
      success: true,
      bank: BANK_NAMES.vcb,
      bankCode: 'vcb',
      updatedAt: new Date().toLocaleString('vi-VN'),
      rates
    };
  } catch (error) {
    return { success: false, error: 'Lỗi kết nối: ' + error.message };
  }
}

/**
 * Convert currency
 * @param {number} amount - Số tiền
 * @param {string} fromCurrency - Đơn vị tiền gốc (VND hoặc ngoại tệ)
 * @param {string} toCurrency - Đơn vị tiền đích
 * @param {object} rates - Exchange rates
 * @param {string} rateType - 'buy_cash', 'buy_transfer', or 'sell'
 */
function convertCurrency(amount, fromCurrency, toCurrency, rates, rateType = 'sell') {
  if (fromCurrency === toCurrency) {
    return { success: true, result: amount };
  }

  const fromUpper = fromCurrency.toUpperCase();
  const toUpper = toCurrency.toUpperCase();

  // VND to foreign
  if (fromUpper === 'VND') {
    const rate = rates.find(r => r.currency === toUpper);
    if (!rate) return { success: false, error: `Không tìm thấy tỷ giá ${toUpper}` };
    
    const rateValue = rateType === 'buy_cash' ? rate.buyCash 
                    : rateType === 'buy_transfer' ? rate.buyTransfer 
                    : rate.sell;
    
    if (rateValue === 0) return { success: false, error: `Tỷ giá ${toUpper} không khả dụng` };
    
    return {
      success: true,
      result: amount / rateValue,
      rate: rateValue,
      rateType
    };
  }

  // Foreign to VND
  if (toUpper === 'VND') {
    const rate = rates.find(r => r.currency === fromUpper);
    if (!rate) return { success: false, error: `Không tìm thấy tỷ giá ${fromUpper}` };
    
    const rateValue = rateType === 'buy_cash' ? rate.buyCash 
                    : rateType === 'buy_transfer' ? rate.buyTransfer 
                    : rate.sell;
    
    if (rateValue === 0) return { success: false, error: `Tỷ giá ${fromUpper} không khả dụng` };
    
    return {
      success: true,
      result: amount * rateValue,
      rate: rateValue,
      rateType
    };
  }

  // Foreign to foreign (via VND)
  const fromRate = rates.find(r => r.currency === fromUpper);
  const toRate = rates.find(r => r.currency === toUpper);
  
  if (!fromRate) return { success: false, error: `Không tìm thấy tỷ giá ${fromUpper}` };
  if (!toRate) return { success: false, error: `Không tìm thấy tỷ giá ${toUpper}` };

  if (fromRate.sell === 0 || toRate.sell === 0) {
    return { success: false, error: 'Tỷ giá không khả dụng' };
  }

  const vndAmount = amount * fromRate.sell;
  const result = vndAmount / toRate.sell;

  return {
    success: true,
    result,
    fromRate: fromRate.sell,
    toRate: toRate.sell
  };
}

/**
 * Format exchange rates for display
 */
function formatExchangeRates(data, filter = COMMON_CURRENCIES) {
  const fmt = (num) => num ? num.toLocaleString('vi-VN') : '-';
  
  const filteredRates = filter 
    ? data.rates.filter(r => filter.includes(r.currency))
    : data.rates;

  let html = `
<div class="exchange-rates">
  <div class="rates-header">
    <span class="bank-name">${data.bank}</span>
    <span class="updated-at">Cập nhật: ${data.updatedAt}</span>
  </div>
  <table class="rates-table">
    <thead>
      <tr>
        <th>Tiền tệ</th>
        <th>Mua TM</th>
        <th>Mua CK</th>
        <th>Bán</th>
      </tr>
    </thead>
    <tbody>`;

  filteredRates.forEach(rate => {
    html += `
      <tr>
        <td><strong>${rate.currency}</strong></td>
        <td>${fmt(rate.buyCash)}</td>
        <td>${fmt(rate.buyTransfer)}</td>
        <td>${fmt(rate.sell)}</td>
      </tr>`;
  });

  html += `
    </tbody>
  </table>
</div>`;

  return html;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BANK_NAMES,
    COMMON_CURRENCIES,
    fetchExchangeRates,
    convertCurrency,
    formatExchangeRates
  };
}
