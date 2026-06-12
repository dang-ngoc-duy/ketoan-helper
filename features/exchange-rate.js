// Exchange Rate Service (Tỷ giá ngoại tệ)
// API: VNAppMob (free, no auth required)

const EXCHANGE_RATE_APIS = {
  vcb: 'https://api.vnappmob.com/api/v2/exchange_rate/vcb',
  bidv: 'https://api.vnappmob.com/api/v2/exchange_rate/bid',
  vietinbank: 'https://api.vnappmob.com/api/v2/exchange_rate/ctg',
  techcombank: 'https://api.vnappmob.com/api/v2/exchange_rate/tcb',
  sbv: 'https://api.vnappmob.com/api/v2/exchange_rate/sbv' // Ngân hàng Nhà nước
};

const BANK_NAMES = {
  vcb: 'Vietcombank',
  bidv: 'BIDV',
  vietinbank: 'Vietinbank',
  techcombank: 'Techcombank',
  sbv: 'Ngân hàng Nhà nước'
};

// Common currency codes
const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'SGD', 'THB', 'CNY', 'KRW', 'HKD'];

/**
 * Fetch exchange rates from bank
 * @param {string} bank - Bank code (vcb, bidv, vietinbank, techcombank, sbv)
 */
async function fetchExchangeRates(bank = 'vcb') {
  const apiUrl = EXCHANGE_RATE_APIS[bank];
  if (!apiUrl) {
    return { success: false, error: 'Bank không hợp lệ' };
  }

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && Array.isArray(data.results)) {
      const rates = data.results.map(item => ({
        currency: item.currency_code,
        currencyName: item.currency_name,
        buyCash: parseFloat(item.buy_cash) || 0,
        buyTransfer: parseFloat(item.buy_transfer) || 0,
        sell: parseFloat(item.sell) || 0
      })).filter(r => r.buyCash > 0 || r.buyTransfer > 0 || r.sell > 0);

      return {
        success: true,
        bank: BANK_NAMES[bank],
        bankCode: bank,
        updatedAt: new Date().toLocaleString('vi-VN'),
        rates
      };
    }

    return { success: false, error: 'Dữ liệu không hợp lệ' };
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
    EXCHANGE_RATE_APIS,
    BANK_NAMES,
    COMMON_CURRENCIES,
    fetchExchangeRates,
    convertCurrency,
    formatExchangeRates
  };
}
