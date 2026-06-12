// Date Utilities for Accounting
// - Số ngày giữa 2 ngày
// - Số ngày làm việc (loại bỏ T7, CN)
// - Quý/năm tài chính
// - Hạn nộp thuế

const VN_HOLIDAYS_2026 = [
  // Tết dương lịch
  '2026-01-01',
  // Tết âm lịch (xấp xỉ - cần update theo năm)
  '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20',
  // Giỗ Tổ Hùng Vương (10/3 âm)
  '2026-04-26',
  // 30/4
  '2026-04-30',
  // 1/5
  '2026-05-01',
  // Quốc khánh 2/9
  '2026-09-02', '2026-09-03'
];

/**
 * Parse date string (DD/MM/YYYY hoặc YYYY-MM-DD)
 */
function parseDate(str) {
  str = str.trim();
  // DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
  }
  // YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
    return new Date(str);
  }
  return null;
}

/**
 * Format date as DD/MM/YYYY
 */
function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

function toISODate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Tính số ngày giữa 2 ngày (calendar days)
 */
function daysBetween(date1, date2) {
  const ms = Math.abs(date2 - date1);
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Tính số ngày làm việc (Mon-Fri, loại holiday)
 */
function workingDaysBetween(date1, date2, excludeHolidays = true) {
  const start = new Date(Math.min(date1, date2));
  const end = new Date(Math.max(date1, date2));
  
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const day = current.getDay();
    const isWeekend = (day === 0 || day === 6);
    const isHoliday = excludeHolidays && VN_HOLIDAYS_2026.includes(toISODate(current));
    
    if (!isWeekend && !isHoliday) count++;
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Lấy quý của tháng
 */
function getQuarter(date) {
  const month = date.getMonth() + 1;
  return Math.ceil(month / 3);
}

/**
 * Hạn nộp tờ khai thuế GTGT
 * - Hàng tháng: ngày 20 của tháng sau
 * - Hàng quý: ngày cuối tháng đầu của quý sau
 */
function vatDeclarationDeadline(period, type = 'monthly') {
  const date = parseDate(period) || new Date();
  
  if (type === 'monthly') {
    // Tháng kế tiếp ngày 20
    const next = new Date(date.getFullYear(), date.getMonth() + 1, 20);
    return next;
  } else {
    // Quý kế tiếp ngày cuối tháng đầu (30/4, 31/7, 31/10, 31/1)
    const quarter = getQuarter(date);
    const nextQuarterMonth = quarter * 3; // 3, 6, 9, 12 -> tháng cuối quý
    const next = new Date(date.getFullYear(), nextQuarterMonth, 0); // ngày 30/31 tháng cuối quý
    return next;
  }
}

/**
 * Hạn nộp BCTC năm
 * - Doanh nghiệp: ngày 30/3 năm sau
 */
function annualReportDeadline(year) {
  return new Date(year + 1, 2, 30); // 30/3 năm sau
}

/**
 * Cộng/trừ ngày làm việc
 */
function addWorkingDays(date, days) {
  const result = new Date(date);
  let added = 0;
  const direction = days >= 0 ? 1 : -1;
  const target = Math.abs(days);
  
  while (added < target) {
    result.setDate(result.getDate() + direction);
    const day = result.getDay();
    if (day !== 0 && day !== 6 && !VN_HOLIDAYS_2026.includes(toISODate(result))) {
      added++;
    }
  }
  
  return result;
}

/**
 * Format date diff for display
 */
function formatDateDiff(date1, date2) {
  const totalDays = daysBetween(date1, date2);
  const workDays = workingDaysBetween(date1, date2);
  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;
  
  return {
    totalDays,
    workDays,
    weeks,
    remainingDays,
    months: Math.round(totalDays / 30),
    years: Math.round(totalDays / 365 * 10) / 10
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseDate,
    formatDate,
    daysBetween,
    workingDaysBetween,
    getQuarter,
    vatDeclarationDeadline,
    annualReportDeadline,
    addWorkingDays,
    formatDateDiff,
    VN_HOLIDAYS_2026
  };
}
