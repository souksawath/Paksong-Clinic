/**
 * ClinicCare Lao - Google Apps Script Backend (Code.gs)
 * 
 * ວິທີນຳໃຊ້:
 * 1. ສ້າງ Google Sheet ໃໝ່
 * 2. ໄປທີ່ Extensions (ສ່ວນຂະຫຍາຍ) -> Apps Script
 * 3. Copy ໂຄ້ດນີ້ໄປວາງໃສ່ Code.gs
 * 4. ກົດ Deploy -> New deployment -> ເລືອກ Web App
 * 5. Execute as: "Me" | Who has access: "Anyone"
 */

// 1. ຟັງຊັນສະແດງຜົນໜ້າເວັບ (ຖ້າຕ້ອງການໂຮສທ໌ Web App ໃນ Apps Script ໂດຍກົງ)
function doGet(e) {
  var action = e.parameter.action;

  // ຖ້າຮຽກຂໍຂໍ້ມູນ JSON
  if (action === 'getPatients') {
    return ContentService.createTextOutput(JSON.stringify(getPatientsData()))
      .setMimeType(ContentService.MimeType.JSON);
  } else if (action === 'getTransactions') {
    return ContentService.createTextOutput(JSON.stringify(getTransactionsData()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ຖ້າຕ້ອງການໂຫຼດໜ້າ UI HTML
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('ClinicCare Lao - ລະບົບຄຸ້ມຄອງຄລີນິກ')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// 2. ຟັງຊັນຮັບຂໍ້ມູນຈາກແອັບມາບັນທຶກລົງ Google Sheets
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.type === 'patient') {
      // ບັນທຶກຄົນເຈັບ
      var sheet = ss.getSheetByName('ຄົນເຈັບ') || ss.insertSheet('ຄົນເຈັບ');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          'ລະຫັດ HN', 'ຊື່', 'ນາມສະກຸນ', 'ເພດ', 'ວັນເດືອນປີເກີດ', 
          'ອາຍຸ', 'ເບີໂທ', 'ບ້ານເກີດ', 'ບ້ານປັດຈຸບັນ', 'ໝວດເລືອດ', 
          'ແພ້ຢາ', 'ອາການ', 'ວັນທີບັນທຶກ'
        ]);
      }
      var p = data.patient;
      sheet.appendRow([
        p.hn, p.firstName, p.lastName, p.gender, p.birthDate,
        p.age, p.phone, 
        p.hometown ? (p.hometown.village + ', ' + p.hometown.district + ', ' + p.hometown.province) : '',
        p.currentAddress ? (p.currentAddress.village + ', ' + p.currentAddress.district + ', ' + p.currentAddress.province) : '',
        p.bloodGroup, p.drugAllergies, p.initialSymptoms, new Date()
      ]);

      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'ບັນທຶກຄົນເຈັບສຳເລັດ' }))
        .setMimeType(ContentService.MimeType.JSON);

    } else if (data.type === 'transaction') {
      // ບັນທຶກລາຍຮັບ-ລາຍຈ່າຍ
      var sheet = ss.getSheetByName('ລາຍຮັບ-ລາຍຈ່າຍ') || ss.insertSheet('ລາຍຮັບ-ລາຍຈ່າຍ');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          'ວັນທີ', 'ເວລາ', 'ປະເພດ', 'ໝວດໝູ່', 'ຫົວຂໍ້', 
          'ຈຳນວນເງິນ (ກີບ)', 'ວິທີຊຳລະ', 'ຄົນເຈັບ', 'ເລກໃບບິນ', 'ໝາຍເຫດ'
        ]);
      }
      var t = data.transaction;
      sheet.appendRow([
        t.date, t.time, t.type === 'income' ? 'ລາຍຮັບ' : 'ລາຍຈ່າຍ',
        t.categoryLabel, t.title, t.amount, t.paymentMethodLabel,
        t.patientName || '-', t.receiptNumber || '-', t.notes || ''
      ]);

      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'ບັນທຶກບັນຊີສຳເລັດ' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ດຶງຂໍ້ມູນຄົນເຈັບ
function getPatientsData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('ຄົນເຈັບ');
  if (!sheet || sheet.getLastRow() <= 1) return [];
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var list = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    list.push({
      hn: row[0],
      name: row[1] + ' ' + row[2],
      gender: row[3],
      phone: row[6],
      symptoms: row[11]
    });
  }
  return list;
}

// ດຶງຂໍ້ມູນບັນຊີ
function getTransactionsData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('ລາຍຮັບ-ລາຍຈ່າຍ');
  if (!sheet || sheet.getLastRow() <= 1) return [];
  var values = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    list.push({
      date: row[0],
      type: row[2],
      title: row[4],
      amount: row[5],
      method: row[6]
    });
  }
  return list;
}
