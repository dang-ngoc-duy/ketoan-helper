// MST Lookup & Validator
// API: VietQR.io

const MST_API = 'https://api.vietqr.io/v2/business';

/**
 * Validate MST format
 * - 10 digits for personal tax code
 * - 10 or 13 digits for business tax code
 */
function validateMSTFormat(mst) {
  const cleaned = mst.replace(/[^0-9]/g, '');
  if (cleaned.length === 10 || cleaned.length === 13) {
    return { valid: true, cleaned };
  }
  return { valid: false, error: 'MST phải có 10 hoặc 13 số' };
}

/**
 * Lookup business info by tax code
 */
async function lookupMST(taxCode) {
  const validation = validateMSTFormat(taxCode);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const response = await fetch(`${MST_API}/${validation.cleaned}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Không tìm thấy MST này' };
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code === '00') {
      return {
        success: true,
        data: {
          taxCode: data.data.id,
          name: data.data.name,
          internationalName: data.data.internationalName || '',
          shortName: data.data.shortName || '',
          address: data.data.address || ''
        }
      };
    } else {
      return { success: false, error: data.desc || 'Tra cứu thất bại' };
    }
  } catch (error) {
    return { success: false, error: 'Lỗi kết nối: ' + error.message };
  }
}

/**
 * Format business info for display
 */
function formatBusinessInfo(info) {
  return `
<div class="business-info">
  <div class="info-row">
    <strong>MST:</strong> ${info.taxCode}
  </div>
  <div class="info-row">
    <strong>Tên:</strong> ${info.name}
  </div>
  ${info.shortName ? `<div class="info-row"><strong>Tên ngắn:</strong> ${info.shortName}</div>` : ''}
  ${info.internationalName ? `<div class="info-row"><strong>International:</strong> ${info.internationalName}</div>` : ''}
  <div class="info-row">
    <strong>Địa chỉ:</strong> ${info.address}
  </div>
</div>
  `.trim();
}

/**
 * Copy business info to clipboard
 */
function copyBusinessInfo(info) {
  const text = `MST: ${info.taxCode}\nTên: ${info.name}\nĐịa chỉ: ${info.address}`;
  return text;
}

// Export for use in popup
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateMSTFormat, lookupMST, formatBusinessInfo, copyBusinessInfo };
}
