// Fixed Asset Depreciation Calculator (Khấu hao TSCĐ)
// Based on Thông tư 45/2013/TT-BTC

/**
 * Hệ số điều chỉnh cho phương pháp số dư giảm dần
 */
function getAccelerationCoefficient(usefulLife) {
  if (usefulLife <= 4) return 1.5;
  if (usefulLife <= 6) return 2.0;
  return 2.5;
}

/**
 * Phương pháp khấu hao đường thẳng (Straight-line)
 * @param {number} originalCost - Nguyên giá TSCĐ
 * @param {number} usefulLife - Thời gian sử dụng (năm)
 * @param {number} residualValue - Giá trị thu hồi ước tính (default 0)
 */
function straightLineDepreciation(originalCost, usefulLife, residualValue = 0) {
  const depreciableAmount = originalCost - residualValue;
  const annualDepreciation = depreciableAmount / usefulLife;
  const monthlyDepreciation = annualDepreciation / 12;
  const depreciationRate = (1 / usefulLife) * 100;

  const schedule = [];
  let bookValue = originalCost;

  for (let year = 1; year <= usefulLife; year++) {
    const depreciation = year === usefulLife 
      ? bookValue - residualValue  // Năm cuối lấy hết
      : annualDepreciation;
    bookValue -= depreciation;
    
    schedule.push({
      year,
      beginningValue: bookValue + depreciation,
      depreciation: Math.round(depreciation),
      endingValue: Math.max(residualValue, Math.round(bookValue))
    });
  }

  return {
    method: 'straight-line',
    methodName: 'Đường thẳng',
    originalCost,
    residualValue,
    usefulLife,
    depreciationRate: depreciationRate.toFixed(2),
    annualDepreciation: Math.round(annualDepreciation),
    monthlyDepreciation: Math.round(monthlyDepreciation),
    schedule
  };
}

/**
 * Phương pháp số dư giảm dần có điều chỉnh (Declining Balance)
 * @param {number} originalCost - Nguyên giá TSCĐ
 * @param {number} usefulLife - Thời gian sử dụng (năm)
 */
function decliningBalanceDepreciation(originalCost, usefulLife) {
  const baseRate = (1 / usefulLife) * 100;
  const coefficient = getAccelerationCoefficient(usefulLife);
  const acceleratedRate = baseRate * coefficient;

  const schedule = [];
  let bookValue = originalCost;
  let switchedToStraightLine = false;
  let straightLineAmount = 0;

  for (let year = 1; year <= usefulLife; year++) {
    const remainingYears = usefulLife - year + 1;
    straightLineAmount = bookValue / remainingYears;
    
    let depreciation;
    
    if (switchedToStraightLine) {
      depreciation = straightLineAmount;
    } else {
      const decliningDepreciation = bookValue * (acceleratedRate / 100);
      
      // Chuyển sang đường thẳng khi khấu hao giảm dần <= đường thẳng
      if (decliningDepreciation <= straightLineAmount) {
        switchedToStraightLine = true;
        depreciation = straightLineAmount;
      } else {
        depreciation = decliningDepreciation;
      }
    }

    const beginningValue = bookValue;
    bookValue -= depreciation;
    
    schedule.push({
      year,
      beginningValue: Math.round(beginningValue),
      depreciation: Math.round(depreciation),
      endingValue: Math.max(0, Math.round(bookValue)),
      method: switchedToStraightLine ? 'Đường thẳng' : 'Số dư giảm dần'
    });
  }

  return {
    method: 'declining-balance',
    methodName: 'Số dư giảm dần có điều chỉnh',
    originalCost,
    usefulLife,
    baseRate: baseRate.toFixed(2),
    coefficient,
    acceleratedRate: acceleratedRate.toFixed(2),
    schedule
  };
}

/**
 * Phương pháp theo số lượng sản phẩm (Units of Production)
 * @param {number} originalCost - Nguyên giá TSCĐ
 * @param {number} totalUnits - Tổng sản lượng dự kiến
 * @param {number} unitsProduced - Sản lượng kỳ này
 * @param {number} residualValue - Giá trị thu hồi
 */
function unitsOfProductionDepreciation(originalCost, totalUnits, unitsProduced, residualValue = 0) {
  const depreciableAmount = originalCost - residualValue;
  const depreciationPerUnit = depreciableAmount / totalUnits;
  const periodDepreciation = depreciationPerUnit * unitsProduced;

  return {
    method: 'units-of-production',
    methodName: 'Theo sản lượng',
    originalCost,
    residualValue,
    totalUnits,
    unitsProduced,
    depreciationPerUnit: Math.round(depreciationPerUnit),
    periodDepreciation: Math.round(periodDepreciation)
  };
}

/**
 * Format depreciation result for display
 */
function formatDepreciationResult(result) {
  const fmt = (num) => Math.round(num).toLocaleString('vi-VN');
  
  let html = `
<div class="depreciation-result">
  <div class="result-header">
    <h4>Phương pháp: ${result.methodName}</h4>
  </div>
  <div class="result-summary">
    <div class="summary-row"><span>Nguyên giá:</span> <strong>${fmt(result.originalCost)} đ</strong></div>
    <div class="summary-row"><span>Thời gian sử dụng:</span> <strong>${result.usefulLife} năm</strong></div>
    <div class="summary-row"><span>Tỷ lệ khấu hao:</span> <strong>${result.depreciationRate || result.acceleratedRate}%</strong></div>
  `;
  
  if (result.method === 'straight-line') {
    html += `
    <div class="summary-row"><span>Khấu hao năm:</span> <strong>${fmt(result.annualDepreciation)} đ</strong></div>
    <div class="summary-row"><span>Khấu hao tháng:</span> <strong>${fmt(result.monthlyDepreciation)} đ</strong></div>
    `;
  }
  
  if (result.coefficient) {
    html += `<div class="summary-row"><span>Hệ số điều chỉnh:</span> <strong>${result.coefficient}</strong></div>`;
  }
  
  html += `</div>`;

  // Schedule table
  if (result.schedule && result.schedule.length > 0) {
    html += `
  <div class="schedule-table">
    <table>
      <thead>
        <tr>
          <th>Năm</th>
          <th>Giá trị đầu kỳ</th>
          <th>Khấu hao</th>
          <th>Giá trị cuối kỳ</th>
          ${result.method === 'declining-balance' ? '<th>PP áp dụng</th>' : ''}
        </tr>
      </thead>
      <tbody>`;
    
    result.schedule.forEach(row => {
      html += `
        <tr>
          <td>${row.year}</td>
          <td>${fmt(row.beginningValue)}</td>
          <td>${fmt(row.depreciation)}</td>
          <td>${fmt(row.endingValue)}</td>
          ${result.method === 'declining-balance' ? `<td>${row.method}</td>` : ''}
        </tr>`;
    });
    
    html += `
      </tbody>
    </table>
  </div>`;
  }

  html += `</div>`;
  return html;
}

/**
 * Format depreciation for clipboard
 */
function formatDepreciationForClipboard(result) {
  const fmt = (num) => Math.round(num).toLocaleString('vi-VN');
  
  let text = `BẢNG TÍNH KHẤU HAO TSCĐ\n`;
  text += `========================\n`;
  text += `Phương pháp: ${result.methodName}\n`;
  text += `Nguyên giá: ${fmt(result.originalCost)} đ\n`;
  text += `Thời gian sử dụng: ${result.usefulLife} năm\n`;
  text += `Tỷ lệ khấu hao: ${result.depreciationRate || result.acceleratedRate}%\n\n`;
  
  if (result.method === 'straight-line') {
    text += `Khấu hao năm: ${fmt(result.annualDepreciation)} đ\n`;
    text += `Khấu hao tháng: ${fmt(result.monthlyDepreciation)} đ\n\n`;
  }

  if (result.schedule) {
    text += `BẢNG KHẤU HAO\n`;
    text += `Năm | Đầu kỳ | Khấu hao | Cuối kỳ\n`;
    result.schedule.forEach(row => {
      text += `${row.year} | ${fmt(row.beginningValue)} | ${fmt(row.depreciation)} | ${fmt(row.endingValue)}\n`;
    });
  }

  return text;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    straightLineDepreciation,
    decliningBalanceDepreciation,
    unitsOfProductionDepreciation,
    formatDepreciationResult,
    formatDepreciationForClipboard
  };
}
