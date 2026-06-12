// Personal Income Tax Calculator (Thuế TNCN)
// Based on 2026 regulations

const TAX_BRACKETS_2026 = [
  { limit: 5000000, rate: 0.05 },      // Đến 5 triệu: 5%
  { limit: 10000000, rate: 0.10 },     // Trên 5tr đến 10tr: 10%
  { limit: 18000000, rate: 0.15 },     // Trên 10tr đến 18tr: 15%
  { limit: 32000000, rate: 0.20 },     // Trên 18tr đến 32tr: 20%
  { limit: 52000000, rate: 0.25 },     // Trên 32tr đến 52tr: 25%
  { limit: 80000000, rate: 0.30 },     // Trên 52tr đến 80tr: 30%
  { limit: Infinity, rate: 0.35 }      // Trên 80tr: 35%
];

const DEDUCTION_SELF_2026 = 15500000;        // 15.5 triệu/tháng
const DEDUCTION_DEPENDENT_2026 = 6200000;    // 6.2 triệu/người/tháng

/**
 * Calculate personal income tax
 * @param {number} grossSalary - Lương gross (VNĐ)
 * @param {number} dependents - Số người phụ thuộc
 * @param {number} insurance - Bảo hiểm (VNĐ) - nếu 0 thì tự tính 10.5%
 * @param {number} otherDeductions - Các khoản giảm trừ khác (VNĐ)
 */
function calculatePersonalIncomeTax(grossSalary, dependents = 0, insurance = 0, otherDeductions = 0) {
  // Tính bảo hiểm nếu chưa có
  if (insurance === 0) {
    insurance = grossSalary * 0.105; // 10.5% (BHXH 8% + BHYT 1.5% + BHTN 1%)
  }

  // Thu nhập trước thuế
  const incomeBeforeTax = grossSalary - insurance;

  // Tổng giảm trừ
  const selfDeduction = DEDUCTION_SELF_2026;
  const dependentDeduction = dependents * DEDUCTION_DEPENDENT_2026;
  const totalDeduction = selfDeduction + dependentDeduction + otherDeductions;

  // Thu nhập chịu thuế
  const taxableIncome = Math.max(0, incomeBeforeTax - totalDeduction);

  // Tính thuế lũy tiến
  let tax = 0;
  let remainingIncome = taxableIncome;
  let previousLimit = 0;
  const breakdown = [];

  for (const bracket of TAX_BRACKETS_2026) {
    if (remainingIncome <= 0) break;

    const bracketBase = previousLimit;
    const bracketLimit = bracket.limit;
    const bracketRange = bracketLimit - bracketBase;
    const taxableInBracket = Math.min(remainingIncome, bracketRange);
    const taxInBracket = taxableInBracket * bracket.rate;

    if (taxableInBracket > 0) {
      breakdown.push({
        from: bracketBase,
        to: bracketLimit === Infinity ? 'trở lên' : bracketLimit,
        amount: taxableInBracket,
        rate: bracket.rate * 100,
        tax: taxInBracket
      });
      tax += taxInBracket;
    }

    remainingIncome -= taxableInBracket;
    previousLimit = bracketLimit;
  }

  // Thu nhập net
  const netIncome = grossSalary - insurance - tax;

  return {
    grossSalary,
    insurance,
    incomeBeforeTax,
    deductions: {
      self: selfDeduction,
      dependents: dependentDeduction,
      other: otherDeductions,
      total: totalDeduction
    },
    taxableIncome,
    tax,
    netIncome,
    breakdown
  };
}

/**
 * Format tax calculation result for display
 */
function formatTaxResult(result) {
  const fmt = (num) => Math.round(num).toLocaleString('vi-VN');
  
  let html = `
<div class="tax-result">
  <div class="result-section">
    <h4>Thu nhập</h4>
    <div class="result-row">
      <span>Lương gross:</span>
      <strong>${fmt(result.grossSalary)} đ</strong>
    </div>
    <div class="result-row">
      <span>Bảo hiểm (10.5%):</span>
      <strong>-${fmt(result.insurance)} đ</strong>
    </div>
    <div class="result-row">
      <span>Thu nhập trước thuế:</span>
      <strong>${fmt(result.incomeBeforeTax)} đ</strong>
    </div>
  </div>

  <div class="result-section">
    <h4>Giảm trừ</h4>
    <div class="result-row">
      <span>Bản thân:</span>
      <strong>-${fmt(result.deductions.self)} đ</strong>
    </div>
    <div class="result-row">
      <span>Người phụ thuộc:</span>
      <strong>-${fmt(result.deductions.dependents)} đ</strong>
    </div>
    ${result.deductions.other > 0 ? `<div class="result-row"><span>Khác:</span><strong>-${fmt(result.deductions.other)} đ</strong></div>` : ''}
    <div class="result-row total">
      <span>Tổng giảm trừ:</span>
      <strong>-${fmt(result.deductions.total)} đ</strong>
    </div>
  </div>

  <div class="result-section">
    <h4>Thuế TNCN</h4>
    <div class="result-row">
      <span>Thu nhập chịu thuế:</span>
      <strong>${fmt(result.taxableIncome)} đ</strong>
    </div>`;

  // Breakdown by tax brackets
  if (result.breakdown.length > 0) {
    html += '<div class="tax-breakdown">';
    result.breakdown.forEach((bracket, idx) => {
      const toStr = bracket.to === 'trở lên' ? 'trở lên' : fmt(bracket.to);
      html += `
      <div class="bracket-row">
        <span>${fmt(bracket.from)} - ${toStr} (${bracket.rate}%):</span>
        <strong>${fmt(bracket.tax)} đ</strong>
      </div>`;
    });
    html += '</div>';
  }

  html += `
    <div class="result-row highlight">
      <span>Thuế phải nộp:</span>
      <strong class="tax-amount">-${fmt(result.tax)} đ</strong>
    </div>
  </div>

  <div class="result-section final">
    <div class="result-row net-income">
      <span>Thu nhập NET:</span>
      <strong class="net-amount">${fmt(result.netIncome)} đ</strong>
    </div>
  </div>
</div>
  `.trim();

  return html;
}

/**
 * Format tax result for clipboard
 */
function formatTaxResultForClipboard(result) {
  const fmt = (num) => Math.round(num).toLocaleString('vi-VN');
  
  let text = `TÍNH THUẾ TNCN\n`;
  text += `================\n`;
  text += `Lương gross: ${fmt(result.grossSalary)} đ\n`;
  text += `Bảo hiểm: -${fmt(result.insurance)} đ\n`;
  text += `Thu nhập trước thuế: ${fmt(result.incomeBeforeTax)} đ\n\n`;
  
  text += `GIẢM TRỪ\n`;
  text += `Bản thân: -${fmt(result.deductions.self)} đ\n`;
  text += `Người phụ thuộc: -${fmt(result.deductions.dependents)} đ\n`;
  if (result.deductions.other > 0) {
    text += `Khác: -${fmt(result.deductions.other)} đ\n`;
  }
  text += `Tổng giảm trừ: -${fmt(result.deductions.total)} đ\n\n`;
  
  text += `THUẾ TNCN\n`;
  text += `Thu nhập chịu thuế: ${fmt(result.taxableIncome)} đ\n`;
  text += `Thuế phải nộp: -${fmt(result.tax)} đ\n\n`;
  
  text += `THU NHẬP NET: ${fmt(result.netIncome)} đ`;
  
  return text;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TAX_BRACKETS_2026,
    DEDUCTION_SELF_2026,
    DEDUCTION_DEPENDENT_2026,
    calculatePersonalIncomeTax,
    formatTaxResult,
    formatTaxResultForClipboard
  };
}
