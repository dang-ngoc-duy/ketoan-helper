// Net ↔ Gross Salary Converter
// Tính lương Net từ Gross và ngược lại

// Insurance rates (employee contribution)
const INSURANCE_RATES = {
  bhxh: 0.08,   // 8%
  bhyt: 0.015,  // 1.5%
  bhtn: 0.01    // 1%
  // Total: 10.5%
};

const TAX_BRACKETS = [
  { limit: 5000000, rate: 0.05 },
  { limit: 10000000, rate: 0.10 },
  { limit: 18000000, rate: 0.15 },
  { limit: 32000000, rate: 0.20 },
  { limit: 52000000, rate: 0.25 },
  { limit: 80000000, rate: 0.30 },
  { limit: Infinity, rate: 0.35 }
];

const DEDUCTION_SELF = 15500000;
const DEDUCTION_DEPENDENT = 6200000;

// Insurance cap - 20 lần lương cơ sở (2.34tr -> cap 46.8tr)
// Lương cơ sở 2024-2026: 2,340,000
const BASE_SALARY = 2340000;
const BHXH_BHYT_CAP = BASE_SALARY * 20;  // 46.8 triệu
// BHTN cap = 20 lần lương tối thiểu vùng (vùng 1 = 4,960,000) = 99.2 triệu

/**
 * Tính insurance từ lương gross
 */
function calculateInsurance(grossSalary) {
  const bhxhBase = Math.min(grossSalary, BHXH_BHYT_CAP);
  const bhytBase = Math.min(grossSalary, BHXH_BHYT_CAP);
  const bhtnBase = Math.min(grossSalary, BHXH_BHYT_CAP); // Đơn giản hóa, dùng cùng cap
  
  return {
    bhxh: bhxhBase * INSURANCE_RATES.bhxh,
    bhyt: bhytBase * INSURANCE_RATES.bhyt,
    bhtn: bhtnBase * INSURANCE_RATES.bhtn,
    total: bhxhBase * INSURANCE_RATES.bhxh + bhytBase * INSURANCE_RATES.bhyt + bhtnBase * INSURANCE_RATES.bhtn
  };
}

/**
 * Tính thuế TNCN từ thu nhập chịu thuế
 */
function calculateTaxFromTaxable(taxableIncome) {
  if (taxableIncome <= 0) return 0;
  
  let tax = 0;
  let previousLimit = 0;
  let remaining = taxableIncome;
  
  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) break;
    const range = bracket.limit - previousLimit;
    const inBracket = Math.min(remaining, range);
    tax += inBracket * bracket.rate;
    remaining -= inBracket;
    previousLimit = bracket.limit;
  }
  
  return tax;
}

/**
 * Gross → Net
 */
function grossToNet(grossSalary, dependents = 0, otherDeductions = 0) {
  const insurance = calculateInsurance(grossSalary);
  const incomeBeforeTax = grossSalary - insurance.total;
  
  const totalDeduction = DEDUCTION_SELF + dependents * DEDUCTION_DEPENDENT + otherDeductions;
  const taxableIncome = Math.max(0, incomeBeforeTax - totalDeduction);
  const tax = calculateTaxFromTaxable(taxableIncome);
  const netSalary = grossSalary - insurance.total - tax;
  
  return {
    grossSalary,
    insurance,
    incomeBeforeTax,
    totalDeduction,
    taxableIncome,
    tax,
    netSalary
  };
}

/**
 * Net → Gross (binary search vì non-linear)
 */
function netToGross(netSalary, dependents = 0, otherDeductions = 0) {
  let low = netSalary;
  let high = netSalary * 2;
  let mid, calculated;
  
  for (let i = 0; i < 100; i++) {
    mid = (low + high) / 2;
    const result = grossToNet(mid, dependents, otherDeductions);
    calculated = result.netSalary;
    
    if (Math.abs(calculated - netSalary) < 1) break;
    
    if (calculated < netSalary) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return grossToNet(mid, dependents, otherDeductions);
}

/**
 * Format kết quả
 */
function formatSalaryResult(result) {
  const fmt = (n) => Math.round(n).toLocaleString('vi-VN');
  
  return `
<div class="salary-result">
  <div class="result-section">
    <div class="result-row"><span>Lương GROSS:</span> <strong>${fmt(result.grossSalary)} đ</strong></div>
  </div>
  
  <div class="result-section">
    <h4>Bảo hiểm (10.5%)</h4>
    <div class="result-row"><span>BHXH (8%):</span> <strong>-${fmt(result.insurance.bhxh)} đ</strong></div>
    <div class="result-row"><span>BHYT (1.5%):</span> <strong>-${fmt(result.insurance.bhyt)} đ</strong></div>
    <div class="result-row"><span>BHTN (1%):</span> <strong>-${fmt(result.insurance.bhtn)} đ</strong></div>
    <div class="result-row total"><span>Tổng BH:</span> <strong>-${fmt(result.insurance.total)} đ</strong></div>
  </div>
  
  <div class="result-section">
    <h4>Thuế TNCN</h4>
    <div class="result-row"><span>Thu nhập trước thuế:</span> <strong>${fmt(result.incomeBeforeTax)} đ</strong></div>
    <div class="result-row"><span>Tổng giảm trừ:</span> <strong>-${fmt(result.totalDeduction)} đ</strong></div>
    <div class="result-row"><span>Thu nhập chịu thuế:</span> <strong>${fmt(result.taxableIncome)} đ</strong></div>
    <div class="result-row highlight"><span>Thuế phải nộp:</span> <strong>-${fmt(result.tax)} đ</strong></div>
  </div>
  
  <div class="result-section final">
    <div class="result-row net-income">
      <span>Lương NET:</span>
      <strong class="net-amount">${fmt(result.netSalary)} đ</strong>
    </div>
  </div>
</div>`.trim();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    grossToNet,
    netToGross,
    calculateInsurance,
    formatSalaryResult,
    INSURANCE_RATES,
    BASE_SALARY
  };
}
