# ຄູ່ມືການນຳໃຊ້ກັບ Google Apps Script (GAS)

ທ່ານສາມາດນຳໃຊ້ລະບົບນີ້ກັບ Google Apps Script ໄດ້ 2 ຮູບແບບຕາມຄວາມສະດວກ:

---

### ຮູບແບບທີ 1: ໃຊ້ Google Apps Script ເປັນ Backend API (ແນະນຳທີ່ສຸດ ⭐)
- **ວິທີການເຮັດວຽກ**:
  - ແອັບ Frontend ຍັງຄົງ Deploy ຢູ່ **GitHub Pages** (ເຊິ່ງໄວ, ງາມ, ບໍ່ຕິດຂໍ້ຈຳກັດຂອງ iFrame).
  - Google Apps Script ຈະເຮັດໜ້າທີ່ເປັນ API ຮັບຂໍ້ມູນຈາກແອັບ ໄປບັນທຶກລົງ **Google Sheets** ອັດຕະໂນມັດ ໂດຍທີ່ພະນັກງານໃນຄລີນິກບໍ່ຈຳເປັນຕ້ອງກົດ Login Google ທຸກຄົນ.
- **ວິທີຕິດຕັ້ງ**:
  1. ເປີດ Google Sheets ໃໝ່
  2. ກົດ **Extensions (ສ່ວນຂະຫຍາຍ)** -> **Apps Script**
  3. Copy ໂຄ້ດໃນໄຟລ໌ `gas/Code.gs` ໄປວາງ
  4. ກົດ **Deploy** -> **New deployment**
  5. ເລືອກປະເພດ **Web App**:
     - *Execute as*: **Me** (ບັນຊີຂອງທ່ານ)
     - *Who has access*: **Anyone** (ທຸກຄົນທີ່ມີລິ້ງ)
  6. ທ່ານຈະໄດ້ Web App URL (ເຊັ່ນ: `https://script.google.com/macros/s/.../exec`)
  7. ນຳ URL ນັ້ນມາໃຊ້ເຊື່ອມຕໍ່ກັບແອັບໄດ້ເລີຍ!

---

### ຮູບແບບທີ 2: ເອົາໜ້າແອັບທັງໝົດໄປ Run ຢູ່ເທິງ Google Apps Script Web App
- ເນື່ອງຈາກ Google Apps Script ບໍ່ຮອງຮັບການໂຫຼດໄຟລ໌ແຍກແບບ `./assets/index.js` ແລະ `./assets/index.css`.
- ຫາກຕ້ອງການ Run ໃນ Google Apps Script ໂດຍກົງ ຈະຕ້ອງ Bundle ໂຄ້ດໃຫ້ເປັນໄຟລ໌ `index.html` ດຽວ (Single HTML File) ທີ່ຝັງ CSS ແລະ JS ໄວ້ຂ້າງໃນ.
- ຈາກນັ້ນ Copy ໂຄ້ດທັງໝົດໃນ `index.html` ໄປວາງໃສ່ໄຟລ໌ `index.html` ໃນ Google Apps Script Editor ແລ້ວ Deploy ເປັນ Web App.
