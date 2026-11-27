# Punnasin Namwat Portfolio

เว็บแสดงผลงานหน้าเดียว ใช้หน้าตาเดียวกับร้าน SoulX Hub แยกเป็นโปรเจกต์ของตัวเอง ไม่มีฐานข้อมูลหรือการชำระเงิน เพิ่มและแก้ผลงานได้จากหน้าเว็บ

## แก้เนื้อหา

ชื่อ คำแนะนำตัว ทักษะ และช่องทางติดต่อแก้ที่ `src/content.ts` ส่วนผลงานแก้จากหน้าเว็บ (ดูด้านล่าง)

## รันในเครื่อง

```powershell
npm install
npm run dev
```

เปิด http://localhost:3000

## เอาขึ้นเว็บ

```powershell
npm run build
```

ได้ไฟล์เว็บในโฟลเดอร์ `out/` อัปขึ้นบริการโฮสต์ไฟล์ได้เลย

เว็บจริงอยู่ที่ https://punnasilarty-cyber.github.io/portfolio/ (สาขา `gh-pages`) อัปเดตโค้ดด้วย:

```powershell
npm run deploy
```

## เพิ่มผลงานจากหน้าเว็บ

เปิดเว็บ กด "แก้ไขผลงาน" ใต้รายการผลงาน แล้วใส่รหัสผ่าน ใช้ได้ทุกเครื่อง

ตั้งรหัสครั้งแรก (หรือกด "ตั้งรหัสใหม่"): วาง GitHub token แล้วตั้งรหัสยาว 16 ตัวขึ้นไป เช่น คำสุ่ม 4–5 คำ
token ที่เข้ารหัสแล้วถูกเก็บเป็น `vault.txt` ในสาขา `gh-pages` ซึ่งเป็นสาธารณะ ใครก็ดาวน์โหลดไปเดารหัสได้
จึงห้ามใช้รหัสที่เดาง่าย สร้าง token จาก
https://github.com/settings/personal-access-tokens/new โดยตั้งค่า:

- Repository access: Only select repositories → `portfolio`
- Permissions: Contents → Read and write

อย่าให้ใครเห็น token นี้ ถ้า token หรือรหัสหลุด ให้ลบ token ทิ้งในหน้าเดียวกัน สร้างใหม่ แล้วตั้งรหัสใหม่
การเปลี่ยนรหัสอย่างเดียวไม่พอ เพราะ `vault.txt` เก่ายังอยู่ในประวัติของ repo

ผลงานที่บันทึกจะอยู่ใน `works.json` และโฟลเดอร์ `works/` ของสาขา `gh-pages` ซึ่งแทนที่รายการใน `src/content.ts`
รูปที่เคยอัปแล้วยังค้างในประวัติของ repo แม้ลบไปแล้ว

ฟอนต์ LINE Seed Sans TH: ดู `src/app/fonts/OFL-NOTICE.txt`
