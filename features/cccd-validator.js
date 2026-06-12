// CCCD Validator (Căn cước công dân 12 số)
// Format: TTT-G-YY-NNNNNN
// TTT: Mã tỉnh thành (3 số)
// G: Giới tính + thế kỷ (0-9)
//   - 0,1: Nam/Nữ thế kỷ 20 (1900-1999)
//   - 2,3: Nam/Nữ thế kỷ 21 (2000-2099)
// YY: 2 số cuối năm sinh
// NNNNNN: 6 số ngẫu nhiên

const PROVINCE_CODES = {
  '001': 'Hà Nội', '002': 'Hà Giang', '004': 'Cao Bằng', '006': 'Bắc Kạn', '008': 'Tuyên Quang',
  '010': 'Lào Cai', '011': 'Điện Biên', '012': 'Lai Châu', '014': 'Sơn La', '015': 'Yên Bái',
  '017': 'Hòa Bình', '019': 'Thái Nguyên', '020': 'Lạng Sơn', '022': 'Quảng Ninh', '024': 'Bắc Giang',
  '025': 'Phú Thọ', '026': 'Vĩnh Phúc', '027': 'Bắc Ninh', '030': 'Hải Dương', '031': 'Hải Phòng',
  '033': 'Hưng Yên', '034': 'Thái Bình', '035': 'Hà Nam', '036': 'Nam Định', '037': 'Ninh Bình',
  '038': 'Thanh Hóa', '040': 'Nghệ An', '042': 'Hà Tĩnh', '044': 'Quảng Bình', '045': 'Quảng Trị',
  '046': 'Thừa Thiên Huế', '048': 'Đà Nẵng', '049': 'Quảng Nam', '051': 'Quảng Ngãi', '052': 'Bình Định',
  '054': 'Phú Yên', '056': 'Khánh Hòa', '058': 'Ninh Thuận', '060': 'Bình Thuận', '062': 'Kon Tum',
  '064': 'Gia Lai', '066': 'Đắk Lắk', '067': 'Đắk Nông', '068': 'Lâm Đồng', '070': 'Bình Phước',
  '072': 'Tây Ninh', '074': 'Bình Dương', '075': 'Đồng Nai', '077': 'Bà Rịa - Vũng Tàu', '079': 'TP.HCM',
  '080': 'Long An', '082': 'Tiền Giang', '083': 'Bến Tre', '084': 'Trà Vinh', '086': 'Vĩnh Long',
  '087': 'Đồng Tháp', '089': 'An Giang', '091': 'Kiên Giang', '092': 'Cần Thơ', '093': 'Hậu Giang',
  '094': 'Sóc Trăng', '095': 'Bạc Liêu', '096': 'Cà Mau'
};

// G digit: giới tính + thế kỷ sinh
// Century here means birth year prefix: 19xx, 20xx, 21xx
const GENDER_CENTURY = {
  '0': { gender: 'Nam', centuryPrefix: 19 },
  '1': { gender: 'Nữ', centuryPrefix: 19 },
  '2': { gender: 'Nam', centuryPrefix: 20 },
  '3': { gender: 'Nữ', centuryPrefix: 20 },
  '4': { gender: 'Nam', centuryPrefix: 21 },
  '5': { gender: 'Nữ', centuryPrefix: 21 },
  '6': { gender: 'Nam', centuryPrefix: 22 },
  '7': { gender: 'Nữ', centuryPrefix: 22 },
  '8': { gender: 'Nam', centuryPrefix: 23 },
  '9': { gender: 'Nữ', centuryPrefix: 23 }
};

/**
 * Validate & parse CCCD
 */
function parseCCCD(cccd) {
  const cleaned = cccd.replace(/\s/g, '');
  
  // Phải đúng 12 số
  if (!/^\d{12}$/.test(cleaned)) {
    return { valid: false, error: 'CCCD phải có 12 số' };
  }
  
  const provinceCode = cleaned.substring(0, 3);
  const genderCode = cleaned.substring(3, 4);
  const birthYearShort = cleaned.substring(4, 6);
  const random = cleaned.substring(6);
  
  const province = PROVINCE_CODES[provinceCode];
  if (!province) {
    return { valid: false, error: `Mã tỉnh ${provinceCode} không hợp lệ` };
  }
  
  const genderInfo = GENDER_CENTURY[genderCode];
  if (!genderInfo) {
    return { valid: false, error: 'Mã giới tính/thế kỷ không hợp lệ' };
  }
  
  // centuryPrefix 19 → 1900+YY, 20 → 2000+YY
  const fullBirthYear = genderInfo.centuryPrefix * 100 + parseInt(birthYearShort);
  
  return {
    valid: true,
    cccd: cleaned,
    province: {
      code: provinceCode,
      name: province
    },
    gender: genderInfo.gender,
    centuryPrefix: genderInfo.centuryPrefix,
    birthYear: fullBirthYear,
    random
  };
}

/**
 * Format CCCD info
 */
function formatCCCDInfo(info) {
  if (!info.valid) {
    return `<div class="error">${info.error}</div>`;
  }
  
  return `
<div class="cccd-info">
  <div class="info-row"><strong>CCCD:</strong> ${info.cccd}</div>
  <div class="info-row"><strong>Tỉnh/Thành:</strong> ${info.province.name} (${info.province.code})</div>
  <div class="info-row"><strong>Giới tính:</strong> ${info.gender}</div>
  <div class="info-row"><strong>Năm sinh:</strong> ${info.birthYear}</div>
  <div class="info-row"><strong>Tuổi (2026):</strong> ${2026 - info.birthYear} tuổi</div>
</div>`.trim();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseCCCD, formatCCCDInfo, PROVINCE_CODES };
}
