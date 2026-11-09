export interface DriveBackupResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
  error?: string;
}

export const backupToGoogleDrive = async (
  accessToken: string,
  backupPayload: {
    clinicName: string;
    exportDate: string;
    patients: any[];
    visits: any[];
    transactions: any[];
    appointments: any[];
  }
): Promise<DriveBackupResult> => {
  try {
    const fileName = `ClinicCare_Lao_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      description: 'ClinicCare Lao Patient & Financial Records Backup',
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(backupPayload, null, 2) +
      closeDelimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: body,
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'ບໍ່ສາມາດອັບໂຫຼດຂໍ້ມູນສຳຮອງຂຶ້ນ Google Drive ໄດ້');
    }

    const data = await response.json();
    return {
      success: true,
      fileId: data.id,
      fileName: data.name,
      webViewLink: data.webViewLink,
    };
  } catch (error: any) {
    console.error('Drive backup error:', error);
    return {
      success: false,
      error: error.message || 'ເກີດຂໍ້ຜິດພາດໃນການສຳຮອງຂໍ້ມູນຂຶ້ນ Google Drive',
    };
  }
};
