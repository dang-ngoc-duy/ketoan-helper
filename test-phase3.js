const sm = require('./features/salary-converter.js');
const dm = require('./features/date-utils.js');
const cm = require('./features/cccd-validator.js');

console.log('=== Salary: Gross 30tr → Net ===');
let r1 = sm.grossToNet(30000000, 1, 0);
console.log('  Gross:', r1.grossSalary.toLocaleString('vi-VN'));
console.log('  BH:', r1.insurance.total.toLocaleString('vi-VN'));
console.log('  Tax:', Math.round(r1.tax).toLocaleString('vi-VN'));
console.log('  Net:', Math.round(r1.netSalary).toLocaleString('vi-VN'));

console.log('\n=== Salary: Net 25tr → Gross ===');
let r2 = sm.netToGross(25000000, 0, 0);
console.log('  Need Gross:', Math.round(r2.grossSalary).toLocaleString('vi-VN'));
console.log('  Verify Net:', Math.round(r2.netSalary).toLocaleString('vi-VN'));

console.log('\n=== Date: Days between 01/01 - 31/12/2026 ===');
let d1 = dm.parseDate('01/01/2026');
let d2 = dm.parseDate('31/12/2026');
console.log('  Total days:', dm.daysBetween(d1, d2));
console.log('  Working days:', dm.workingDaysBetween(d1, d2));

console.log('\n=== CCCD: 079200000123 (TPHCM, Nam, sinh 2000) ===');
console.log(cm.parseCCCD('079200000123'));
