# Punnasin Namwat Portfolio

เว็บแสดงผลงานหน้าเดียว ใช้หน้าตาเดียวกับร้าน SoulX Hub แยกเป็นโปรเจกต์ของตัวเอง ไม่มีฐานข้อมูลหรือการชำระเงิน มีหน้าแก้ผลงานที่ /admin

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

เปิด https://punnasilarty-cyber.github.io/portfolio/admin แล้วใส่รหัส ซึ่งคือ GitHub token ที่สร้างจาก
https://github.com/settings/personal-access-tokens/new โดยตั้งค่า:

- Repository access: Only select repositories → `portfolio`
- Permissions: Contents → Read and write

อย่าให้ใครเห็นรหัสนี้ ถ้าหลุดให้ลบ token ทิ้งในหน้าเดียวกันแล้วสร้างใหม่

ผลงานที่บันทึกจะอยู่ใน `works.json` และโฟลเดอร์ `works/` ของสาขา `gh-pages` ซึ่งแทนที่รายการใน `src/content.ts`
รูปที่เคยอัปแล้วยังค้างในประวัติของ repo แม้ลบไปแล้ว

ฟอนต์ LINE Seed Sans TH: ดู `src/app/fonts/OFL-NOTICE.txt`
