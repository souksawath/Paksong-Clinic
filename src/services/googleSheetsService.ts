import { Patient, MedicalVisit, Transaction } from '../types';

export interface SyncResult {
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  patientRowsCount: number;
  transactionRowsCount: number;
  syncedAt: string;
  error?: string;
}

export const createOrUpdateClinicSpreadsheet = async (
  accessToken: string,
  existingSpreadsheetId: string | null,
  patients: Patient[],
  visits: MedicalVisit[],
  transactions: Transaction[]
): Promise<SyncResult> => {
  try {
    let spreadsheetId = existingSpreadsheetId;
    let spreadsheetUrl = '';

    // If no existing spreadsheet, create a new one
    if (!spreadsheetId) {
      const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `ClinicCare Lao - ລະບົບຄຸ້ມຄອງຄລີນິກ (${new Date().toLocaleDateString('lo-LA')})`,
          },
          sheets: [
            {
              properties: {
                title: 'ຄົນເຈັບ ແລະ ການປິ່ນປົວ',
                gridProperties: { rowCount: 1000, columnCount: 16 },
              },
            },
            {
              properties: {
                title: 'ລາຍຮັບ ແລະ ລາຍຈ່າຍ',
                gridProperties: { rowCount: 1000, columnCount: 12 },
              },
            },
          ],
        }),
      });

      if (!createResponse.ok) {
        const err = await createResponse.json();
        throw new Error(err.error?.message || 'ບໍ່ສາມາດສ້າງ Google Sheet ໃໝ່ໄດ້');
      }

      const createdData = await createResponse.json();
      spreadsheetId = createdData.spreadsheetId;
      spreadsheetUrl = createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    } else {
      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    }

    // 1. Prepare Patient & Visit Rows
    const patientHeaders = [
      'ລະຫັດ HN',
      'ຊື່ ແລະ ນາມສະກຸນ',
      'ເພດ',
      'ວັນເດືອນປີເກີດ',
      'ອາຍຸ',
      'ເບີໂທລະສັບ',
      'ບ້ານເກີດ (ບ້ານ/ເມືອງ/ແຂວງ)',
      'ບ້ານຢູ່ປັດຈຸບັນ (ບ້ານ/ເມືອງ/ແຂວງ)',
      'ໝວດເລືອດ',
      'ປະຫວັດແພ້ຢາ / ໂລກປະຈຳຕົວ',
      'ມາປິ່ນປົວໃນອາການ (Chief Complaint)',
      'ການວິນິດໄສລ່າສຸດ',
      'ຄ່າປິ່ນປົວລວມ (ກີບ)',
      'ວັນທີມາປິ່ນປົວ / ບັນທຶກ',
    ];

    const patientRows = patients.map((p) => {
      // find latest visit
      const patientVisits = visits.filter((v) => v.patientId === p.id);
      const latestVisit = patientVisits.length > 0 ? patientVisits[patientVisits.length - 1] : null;

      const hometownStr = `${p.hometown.village || ''}, ${p.hometown.district || ''}, ${p.hometown.province || ''}`.replace(/^, |, $/g, '');
      const currentAddressStr = `${p.currentAddress.village || ''}, ${p.currentAddress.district || ''}, ${p.currentAddress.province || ''}`.replace(/^, |, $/g, '');
      const genderStr = p.gender === 'male' ? 'ຊາຍ' : p.gender === 'female' ? 'ຍິງ' : 'ອື່ນໆ';

      return [
        p.hn,
        `${p.firstName} ${p.lastName}`,
        genderStr,
        p.birthDate,
        p.age.toString(),
        p.phone,
        hometownStr,
        currentAddressStr,
        p.bloodGroup,
        `${p.drugAllergies || 'ບໍ່ມີ'} ${p.underlyingDiseases ? `(${p.underlyingDiseases})` : ''}`,
        latestVisit ? latestVisit.chiefComplaint : p.initialSymptoms,
        latestVisit ? latestVisit.diagnosis : 'ຍັງບໍ່ມີການວິນິດໄສ',
        latestVisit ? latestVisit.costTotal.toString() : '0',
        latestVisit ? latestVisit.visitDate : p.createdAt.split('T')[0],
      ];
    });

    // 2. Prepare Transaction Rows
    const transactionHeaders = [
      'ວັນທີ',
      'ເວລາ',
      'ປະເພດ',
      'ໝວດໝູ່ (Category)',
      'ຫົວຂໍ້ລາຍການ (Title)',
      'ຈຳນວນເງິນ (LAK)',
      'ວິທີຊຳລະ',
      'ຄົນເຈັບທີ່ກ່ຽວຂ້ອງ',
      'ເລກທີໃບບິນ / ເອກະສານອ້າງອີງ',
      'ໝາຍເຫດ',
    ];

    const transactionRows = transactions.map((t) => [
      t.date,
      t.time || '',
      t.type === 'income' ? 'ລາຍຮັບ (Income)' : 'ລາຍຈ່າຍ (Expense)',
      t.categoryLabel,
      t.title,
      t.amount.toString(),
      t.paymentMethodLabel,
      t.patientName || '-',
      t.receiptNumber || '-',
      t.notes || '',
    ]);

    // Send update request to Sheet 1: Patients
    const patientData = [patientHeaders, ...patientRows];
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: patientData,
        }),
      }
    );

    // Send update request to Sheet 2: Transactions
    // Try to update Sheet 2 if exists, or append
    const transactionData = [transactionHeaders, ...transactionRows];
    
    // First, let's check sheet metadata to target the second sheet title
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    
    if (metaRes.ok) {
      const meta = await metaRes.json();
      const sheetTitles: string[] = meta.sheets?.map((s: { properties: { title: string } }) => s.properties.title) || [];
      const secondSheet = sheetTitles.find((title) => title !== sheetTitles[0]) || sheetTitles[1] || sheetTitles[0];
      
      const range = sheetTitles.length > 1 ? `'${secondSheet}'!A1` : `'Sheet1'!A1`;
      
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: transactionData,
          }),
        }
      );
    }

    return {
      success: true,
      spreadsheetId: spreadsheetId || '',
      spreadsheetUrl,
      patientRowsCount: patientRows.length,
      transactionRowsCount: transactionRows.length,
      syncedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error syncing to Google Sheets:', error);
    return {
      success: false,
      spreadsheetId: existingSpreadsheetId || '',
      spreadsheetUrl: existingSpreadsheetId ? `https://docs.google.com/spreadsheets/d/${existingSpreadsheetId}/edit` : '',
      patientRowsCount: 0,
      transactionRowsCount: 0,
      syncedAt: new Date().toISOString(),
      error: error.message || 'ເກີດຂໍ້ຜິດພາດໃນການຊິງຄ໌ Google Sheets',
    };
  }
};
