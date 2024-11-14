const XLSX = require('xlsx');

module.exports = function (file, range, header) {
    const workbook = XLSX.readFile(file);
    const sheet_name_list = workbook.SheetNames;
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { raw: true, defval: null, range: range, header: header });
}

if (require.main == module) {
    console.log(module.exports(process.argv[2], parseInt(process.argv[3] || '0')));
}