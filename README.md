# Punnasin Namwat Portfolio

เว็บแสดงผลงานหน้าเดียว ใช้หน้าตาเดียวกับร้าน SoulX Hub แยกเป็นโปรเจกต์ของตัวเอง ไม่มีฐานข้อมูล ล็อกอิน หรือการชำระเงิน

## แก้เนื้อหา

แก้ที่ `src/content.ts` ไฟล์เดียว: ชื่อ คำแนะนำตัว ผลงาน ทักษะ และช่องทางติดต่อ
รูปผลงานวางใน `public/works/` แล้วใส่ `image: "/works/ชื่อไฟล์.jpg"`

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

เว็บจริงอยู่ที่ https://punnasilarty-cyber.github.io/portfolio/ (สาขา `gh-pages`) อัปเดตด้วย PowerShell:

```powershell
$env:NEXT_PUBLIC_BASE_PATH='/portfolio'; npm run build; Remove-Item Env:NEXT_PUBLIC_BASE_PATH
New-Item out/.nojekyll -ItemType File
git -C out init -b gh-pages
git -C out add -A
git -C out -c user.name=punnasilarty-cyber -c user.email=356074325+punnasilarty-cyber@users.noreply.github.com commit -m deploy
git -C out push -f https://github.com/punnasilarty-cyber/portfolio.git gh-pages
```

ฟอนต์ LINE Seed Sans TH: ดู `src/app/fonts/OFL-NOTICE.txt`
