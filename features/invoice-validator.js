// Invoice Number Validator (Kiểm tra số hóa đơn điện tử)
// Based on Thông tư 78/2021 and Thông tư 32/2025

/**
 * Invoice number patterns:
 * - Format: K[YY][T/N][M/E/G/H/B/L/D/A/C/V][AAAAAAA] (Thông tư 78)
 * - K = Ký hiệu hóa đơn có mã của CQT (C = không mã)
 * - YY = Năm
 * - T = Hóa đơn do doanh nghiệp đặt in, N = tự in
 * - M = GTGT, E = Bán hàng, G = Phiếu xuất kho, etc.
 */

const INVOICE_TYPES = {
  'M': 'Hóa đơn GTGT',
  'E': 'Hóa đơn bán hàng', 
  'G': 'Phiếu xuất kho kiêm vận chuyển nội bộ',
  'H': 'Phiếu xuất kho gửi bán hàng đại lý',
  'B': 'Hóa đơn bán tài sản công',
  'L': 'Hóa đơn bán hàng dự trữ quốc gia',
  'D': 'Chứng từ điện tử dịch vụ hàng không',
  'A': 'Tem, vé, thẻ điện tử',
  'C': 'Các loại chứng từ khác'
};

const INVOICE_ORIGINS = {
  'T': 'Đặt in',
  'N': 'Tự in',
  'D': 'Điện tử'
};

const AUTHORITY_CODES = {
  'K': 'Có mã của CQT',
  'C': 'Không có mã của CQT'
};

/**
 * Parse invoice symbol/number
 * @param {string} invoiceSymbol - Ký hiệu hóa đơn (e.g., 1C24TEE)
 */
function parseInvoiceSymbol(invoiceSymbol) {
  const cleaned = invoiceSymbol.replace(/\s+/g, '').toUpperCase();
  
  // Pattern: [K/C][YY][T/N/D][Type][Serial]
  // Example: 1C24TML, K24TME, C23NMB
  const pattern = /^(\d?)([KC])(\d{2})([TND])([MEGHBLDACV])([A-Z0-9]*)$/;
  const match = cleaned.match(pattern);

  if (!match) {
    // Try simpler pattern without prefix number
    const simplePattern = /^([KC])(\d{2})([TND])([MEGHBLDACV])([A-Z0-9]*)$/;
    const simpleMatch = cleaned.match(simplePattern);
    
    if (!simpleMatch) {
      return { valid: false, error: 'Ký hiệu hóa đơn không hợp lệ' };
    }

    return {
      valid: true,
      prefix: '',
      authorityCode: simpleMatch[1],
      authorityDesc: AUTHORITY_CODES[simpleMatch[1]],
      year: '20' + simpleMatch[2],
      originCode: simpleMatch[3],
      originDesc: INVOICE_ORIGINS[simpleMatch[3]],
      typeCode: simpleMatch[4],
      typeDesc: INVOICE_TYPES[simpleMatch[4]],
      serial: simpleMatch[5],
      formatted: cleaned
    };
  }

  return {
    valid: true,
    prefix: match[1],
    authorityCode: match[2],
    authorityDesc: AUTHORITY_CODES[match[2]],
    year: '20' + match[3],
    originCode: match[4],
    originDesc: INVOICE_ORIGINS[match[4]],
    typeCode: match[5],
    typeDesc: INVOICE_TYPES[match[5]],
    serial: match[6],
    formatted: cleaned
  };
}

/**
 * Validate invoice number (số hóa đơn)
 * - 8 digits for electronic invoices
 */
function validateInvoiceNumber(invoiceNumber) {
  const cleaned = invoiceNumber.replace(/\s+/g, '');
  
  // Must be numeric
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'Số hóa đơn phải là số' };
  }

  // Typically 8 digits
  if (cleaned.length !== 8) {
    return { 
      valid: true, 
      warning: `Số hóa đơn thường có 8 chữ số, nhập ${cleaned.length} số`,
      number: cleaned
    };
  }

  return { valid: true, number: cleaned };
}

/**
 * Format invoice info for display
 */
function formatInvoiceInfo(symbolInfo, numberInfo) {
  if (!symbolInfo.valid) {
    return `<div class="error">${symbolInfo.error}</div>`;
  }

  let html = `
<div class="invoice-info">
  <div class="info-section">
    <h4>Thông tin ký hiệu hóa đơn</h4>
    <div class="info-row"><span>Ký hiệu:</span> <strong>${symbolInfo.formatted}</strong></div>
    <div class="info-row"><span>Mã CQT:</span> <strong>${symbolInfo.authorityDesc}</strong></div>
    <div class="info-row"><span>Năm:</span> <strong>${symbolInfo.year}</strong></div>
    <div class="info-row"><span>Hình thức:</span> <strong>${symbolInfo.originDesc}</strong></div>
    <div class="info-row"><span>Loại hóa đơn:</span> <strong>${symbolInfo.typeDesc}</strong></div>
    ${symbolInfo.serial ? `<div class="info-row"><span>Serial:</span> <strong>${symbolInfo.serial}</strong></div>` : ''}
  </div>`;

  if (numberInfo) {
    html += `
  <div class="info-section">
    <h4>Số hóa đơn</h4>
    <div class="info-row"><span>Số:</span> <strong>${numberInfo.number}</strong></div>
    ${numberInfo.warning ? `<div class="warning">${numberInfo.warning}</div>` : ''}
  </div>`;
  }

  html += `</div>`;
  return html;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    INVOICE_TYPES,
    INVOICE_ORIGINS,
    AUTHORITY_CODES,
    parseInvoiceSymbol,
    validateInvoiceNumber,
    formatInvoiceInfo
  };
}
