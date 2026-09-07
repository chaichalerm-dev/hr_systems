# HRFlow

HRFlow คือเว็บจัดการงานบุคคลในที่เดียว ตั้งแต่ข้อมูลพนักงาน ลงเวลาเข้า–ออก ยื่นลา ไปจนถึงเตรียมเงินเดือนและดูสลิป แต่ละคนเห็นเมนูและข้อมูลตามหน้าที่ของตนเอง

HRFlow brings employee records, attendance, leave, and payroll into one website. Each person sees the tools and records their role allows.

โปรเจกต์นี้เป็นเว็บสาธิตและตัวอย่างสำหรับพัฒนาต่อ สูตรเงินเดือน ภาษี และเอกสารภาษียังเป็นตัวอย่าง อ่าน [ข้อจำกัด](#limitations) ก่อนนำไปใช้งานจริง

This is a demo and a starting point for development. Payroll and tax calculations are examples; read the [limitations](#limitations) before adapting them for real use.

## อ่านจากตรงไหนดี · Where to start

- [ระบบทำอะไรได้บ้าง / Features](#features)
- [วิธีใช้งานแต่ละวัน / Everyday use](#everyday-use)
- [สิทธิ์แต่ละบทบาท / Role permissions](#role-permissions)
- [บัญชีทดลอง / Demo credentials](#demo-credentials)
- [เปิดระบบในเครื่อง / Local installation](#local-installation)
- [ตั้งค่าการเชื่อมต่อ / Environment configuration](#environment-configuration)
- [เตรียมฐานข้อมูลและข้อมูลตัวอย่าง / Migration & seed](#migration--seed)
- [ตรวจงานก่อนส่ง / Testing](#testing)
- [โครงสร้างโค้ด / Architecture](#architecture)
- [เครื่องมือที่ใช้ / Tech stack](#tech-stack)
- [โครงสร้างข้อมูล / Database design](#database-design)
- [เพิ่มและแก้ภาษา / Thai and English](#internationalisation)
- [นำเว็บขึ้น Vercel / Deployment](#deployment-vercel)
- [ข้อจำกัด / Limitations](#limitations)
- [สิ่งที่ยังไม่ได้ทำ / Future improvements](#future-improvements)

<a id="features"></a>
## ระบบทำอะไรได้บ้าง · Features

| งาน / Task | ใช้ทำอะไร / What you can do |
|---|---|
| พนักงาน / Employees | ค้นหา ดูประวัติ เพิ่ม แก้ไข และเปลี่ยนสถานะพนักงาน / Find people, view profiles, and manage employee details. |
| ลงเวลา / Attendance | ลงเวลาเข้า–ออก ดูประวัติตนเอง และดูการมาทำงานของทีมตามสิทธิ์ / Check in and out, view your history, and review team attendance where permitted. |
| การลา / Leave | ยื่นคำขอ ดูวันลาคงเหลือ และติดตามการอนุมัติ / Request leave, check balances, and follow approval decisions. |
| เงินเดือน / Payroll | คำนวณเงินเดือน เพิ่มรายการรับ–หัก ตรวจสอบ อนุมัติ และบันทึกว่าจ่ายแล้ว / Calculate pay, add adjustments, review, approve, and record payment. |
| เอกสาร / Documents | ดูสลิปและสรุปภาษีรายปี แล้วพิมพ์หรือบันทึก PDF ผ่านเบราว์เซอร์ / View payslips and annual tax summaries, then print or save them as PDF. |
| ภาพรวม / Dashboard | ดูตัวเลขของบริษัท ทีม หรือตนเอง และเปิดงานที่ใช้บ่อยจากทางลัด / See relevant totals and open everyday tasks from shortcuts. |
| รายงาน / Reports | ดาวน์โหลดข้อมูลพนักงาน ลงเวลา การลา และเงินเดือนเป็น CSV / Download employee, attendance, leave, and payroll data as CSV. |
| บันทึกการใช้งาน / Audit log | ดูว่าใครทำรายการสำคัญเมื่อไร และกดดูรายละเอียด / See who made important changes and when. |
| ตั้งค่า / Settings | ผู้ดูแลแก้กฎลงเวลาและค่าคำนวณเงินเดือนได้จากหน้าเว็บ / Admins can change attendance and payroll settings on the website. |

ใช้ **ค้นหาเมนู** เพื่อเปิดหน้าที่ต้องการ ฟอร์มพนักงานแบ่งเป็นหมวดพร้อมทางลัด ตารางเลื่อนด้านข้างได้บนมือถือ และปุ่มบันทึกฟอร์มอยู่ในตำแหน่งที่เข้าถึงง่าย

Use **Find a page** to jump to a task. Employee forms have section links and a save bar that stays within reach. Wide tables scroll inside their cards on mobile.

เปลี่ยนภาษาไทย–อังกฤษและธีมสว่าง–มืดได้จากแถบบน ระบบจำภาษา ธีม และการย่อเมนูไว้ให้ ส่วนชื่อคน แผนก และข้อความที่ผู้ใช้กรอกจะแสดงตามข้อมูลที่บันทึก

The top bar changes language and theme. The app remembers those choices and the sidebar size. Names, departments, and user-entered text keep their stored wording.

<a id="everyday-use"></a>
## วิธีใช้งานแต่ละวัน · Everyday use

1. **หน้าแรก:** เลือกงานจากทางลัด หรือใช้ค้นหาเมนู / **Dashboard:** choose a shortcut or find a page.
2. **ลงเวลา:** กดเข้างานเมื่อเริ่ม และออกงานเมื่อเสร็จ หัวหน้าสลับไปแท็บทีมได้ / **Attendance:** check in at the start and out when done. Managers can switch to the team tab.
3. **ขอลา:** กดคำขอใหม่ เลือกประเภทและวันที่ ระบุเหตุผล แล้วติดตามสถานะ / **Leave:** create a request, choose its type and dates, add a reason, and follow its status.
4. **ตรวจคำขอลา:** เปิดแท็บรออนุมัติ กดดูรายละเอียด แล้วอนุมัติหรือปฏิเสธ / **Review leave:** open the approval tab, view a request, and approve or reject it.
5. **ทำเงินเดือน:** ฝ่ายบุคคลสร้างรอบ ตรวจยอดและรายการปรับ อนุมัติ แล้วบันทึกการจ่าย / **Payroll:** HR generates a run, checks amounts and adjustments, approves it, and records payment.
6. **ดูเอกสาร:** เปิดสลิปที่ออกแล้วเพื่อดูหรือพิมพ์ ฝ่ายบุคคลดาวน์โหลดรายงานจากหน้ารายงาน / **Documents:** view issued payslips; HR downloads reports from the reports page.

การกด “จ่ายแล้ว” บันทึกสถานะและออกสลิปในระบบ เว็บไม่ได้โอนเงินเข้าธนาคารให้เอง

Marking a run as paid records its status and issues payslips. It does not transfer money to a bank account.

<a id="role-permissions"></a>
## สิทธิ์แต่ละบทบาท · Role permissions

Admin คือผู้ดูแลระบบ, HR คือฝ่ายบุคคล, Manager คือหัวหน้าทีม และ Employee คือพนักงาน

Admin manages the system, HR manages people and payroll, Manager looks after a team, and Employee uses personal services.

| งาน / Task | Admin | HR | Manager | Employee |
|---|:---:|:---:|:---:|:---:|
| เพิ่มและแก้พนักงาน / Manage employees | ✓ | ✓ | — | — |
| ดูประวัติตนเอง / Own profile | ✓ | ✓ | ✓ | ✓ |
| ดูข้อมูลพนักงาน / Employee records | ทั้งหมด / All | ทั้งหมด / All | ลูกทีมโดยตรง / Direct reports | ตนเอง / Self |
| ลงเวลาและยื่นลา / Check in and request leave | ✓ | ✓ | ✓ | ✓ |
| ดูการลงเวลาทีม / Team attendance | ✓ | ✓ | ลูกทีมโดยตรง / Direct reports | — |
| อนุมัติลาขั้นหัวหน้า / Manager approval | ✓ | — | ลูกทีมโดยตรง / Direct reports | — |
| อนุมัติลาขั้นฝ่ายบุคคล / HR approval | ✓ | ✓ | — | — |
| จัดการเงินเดือน / Manage payroll | ✓ | ✓ | — | — |
| ดูสลิปตนเอง / Own payslips | ✓ | ✓ | ✓* | ✓ |
| ดูเงินเดือนคนอื่น / Others' payroll | ✓ | ✓ | — | — |
| รายงานและบันทึกการใช้งาน / Reports and audit log | ✓ | ✓ | — | — |
| ตั้งค่าบริษัท / Company settings | ✓ | — | — | — |

งานส่วนตัวต้องมีข้อมูลพนักงานผูกกับบัญชีด้วย *หัวหน้ามีสิทธิ์ดูสลิปตนเอง แต่แถบข้างยังไม่มีเมนูนี้สำหรับ Manager; เปิด `/payslips` ได้โดยตรง

Personal tasks require a linked employee profile. *Managers may view their own payslips, but their sidebar currently has no payslip entry; they can open `/payslips` directly.

ระบบตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์ด้วย หัวหน้าจึงไม่ได้สิทธิ์ดูเงินเดือนลูกทีมเพียงเพราะดูประวัติลูกทีมได้ ดูกฎใน [`src/server/authorization`](src/server/authorization)

The server also checks access. Permission to view a team member's profile does not grant access to their salary. See the authorization folder above.

<a id="demo-credentials"></a>
## บัญชีทดลอง · Demo credentials

หลังเติมข้อมูลตัวอย่าง ใช้บัญชีเหล่านี้ได้ หรือกดการ์ดบัญชีบนหน้าล็อกอินเพื่อกรอกให้อัตโนมัติ

After seeding the demo database, use these accounts or click a demo card on the login page to fill in the form.

| บทบาท / Role | อีเมล / Email | รหัสผ่านเริ่มต้น / Default password |
|---|---|---|
| ผู้ดูแล / Admin | `admin@hrflow.demo` | `Admin@12345` |
| ฝ่ายบุคคล / HR | `hr@hrflow.demo` | `Hr@12345` |
| หัวหน้า / Manager | `manager@hrflow.demo` | `Manager@12345` |
| พนักงาน / Employee | `employee@hrflow.demo` | `Employee@12345` |

Seed มี 26 บัญชีใน 4 แผนก: ผู้ดูแล 1 คน ฝ่ายบุคคล 2 คน หัวหน้า 3 คน และพนักงาน 20 คน บทบาทเดียวกันใช้รหัสผ่านตั้งต้นเดียวกัน หากเปลี่ยน `DEMO_*_PASSWORD` ให้ปรับการ์ดล็อกอินและ [`e2e/helpers.ts`](e2e/helpers.ts) ให้ตรงกันด้วย

The seed has 26 accounts in four departments: 1 Admin, 2 HR, 3 Managers, and 20 Employees. Each role shares a default password. If you change `DEMO_*_PASSWORD`, update the login cards and test credentials too.

<a id="local-installation"></a>
## เปิดระบบในเครื่อง · Local installation

เตรียม Node.js 20.9 ขึ้นไป, npm และ PostgreSQL ที่เชื่อมต่อได้ หาก PowerShell เรียก `npm` ไม่ได้ ให้ใช้ `npm.cmd`

You need Node.js 20.9 or later, npm, and a reachable PostgreSQL database. On PowerShell, use `npm.cmd` if running `npm` is blocked.

1. คัดลอกไฟล์ตัวอย่างเป็น `.env` แล้วกรอกค่าตาม [ตารางตั้งค่า](#environment-configuration) / Copy the template to `.env` and fill in your settings.

   ```powershell
   Copy-Item .env.example .env
   ```

   บน macOS/Linux ใช้ `cp .env.example .env` / On macOS or Linux, use `cp .env.example .env`.

2. ติดตั้งเวอร์ชันที่โปรเจกต์บันทึกไว้ / Install the versions recorded in the lockfile.

   ```bash
   npm ci
   ```

3. เตรียมตารางและเติมข้อมูลลงฐานข้อมูลทดลอง / Create tables and populate your demo database.

   ```bash
   npm run db:migrate:deploy
   npm run db:seed
   ```

4. เปิดเว็บที่พอร์ต 4200 ให้ตรงกับ `.env.example` และค่าทดสอบเริ่มต้น / Start on port 4200 to match the example environment and tests.

   ```bash
   npm run dev -- --port 4200
   ```

5. เปิด [http://localhost:4200](http://localhost:4200) แล้วเข้าสู่ระบบ / Open the address and sign in.

หากมี Docker ใช้คำสั่งนี้สร้าง PostgreSQL ในเครื่องได้ รหัสผ่านนี้ใช้สำหรับฐานข้อมูลทดลอง / If Docker is available, create a local PostgreSQL database with this demo password.

```bash
docker run -d --name hrflow_postgres -e POSTGRES_USER=hrflow -e POSTGRES_PASSWORD=hrflow_dev_password -e POSTGRES_DB=hrflow -p 5432:5432 postgres:17-alpine
```

ตั้ง `DATABASE_URL="postgresql://hrflow:hrflow_dev_password@localhost:5432/hrflow"` สำหรับฐานข้อมูล Docker ด้านบน / Use that connection string for the Docker database above.

<a id="environment-configuration"></a>
## ตั้งค่าการเชื่อมต่อ · Environment configuration

`.env` เก็บค่าของเครื่องคุณ ส่วน [`.env.example`](.env.example) เป็นแบบกรอกที่ไม่มีข้อมูลเชื่อมต่อจริง / `.env` holds your local settings; `.env.example` contains placeholders.

| ตัวแปร / Variable | ใส่อะไร / What to enter |
|---|---|
| `DATABASE_URL` | ที่อยู่ PostgreSQL พร้อมชื่อผู้ใช้และรหัสผ่าน / Your PostgreSQL connection string. |
| `AUTH_SECRET` | ค่าสุ่มสำหรับปกป้องเซสชันล็อกอิน / A random secret that protects login sessions. |
| `NEXTAUTH_URL` | URL ที่เปิดเว็บ รวมพอร์ต เช่น `http://localhost:4200` / The app address, including its port. |
| `DEMO_*_PASSWORD` | รหัสผ่านที่ seed ใช้กับบัญชีแต่ละบทบาท / Passwords assigned to demo roles by the seed. |

สร้าง `AUTH_SECRET` ด้วยคำสั่งนี้ แล้วนำผลลัพธ์ไปใส่ใน `.env` / Generate a secret and copy the result into `.env`.

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

หากเปลี่ยนพอร์ต ให้แก้ `NEXTAUTH_URL` และคำสั่งเปิดเซิร์ฟเวอร์ให้ตรงกัน Playwright ใช้ 4200 หรือค่าจาก `PLAYWRIGHT_PORT`; มันไม่ได้อ่านพอร์ตจาก `NEXTAUTH_URL` อัตโนมัติ

When changing ports, update the server command and `NEXTAUTH_URL`. Playwright uses 4200 unless `PLAYWRIGHT_PORT` is set; it does not read the port from `NEXTAUTH_URL` automatically.

<a id="migration--seed"></a>
## เตรียมฐานข้อมูลและข้อมูลตัวอย่าง · Migration & seed

**Migration** คือชุดคำสั่งเปลี่ยนตารางที่เก็บประวัติไว้ ส่วน **seed** คือสคริปต์เติมข้อมูลสำหรับทดลอง / A migration records database structure changes. The seed fills the database with demo data.

| คำสั่ง / Command | ใช้เมื่อไร / When to use it |
|---|---|
| `npm run db:migrate:deploy` | ใช้ migration ที่มีอยู่ / Apply existing migrations. |
| `npm run db:migrate` | สร้าง migration หลังนักพัฒนาแก้ schema / Create a migration after changing the development schema. |
| `npm run db:seed` | เติมข้อมูลตัวอย่าง / Populate a demo database. |
| `npm run db:studio` | เปิดหน้าดูและแก้ข้อมูลของ Prisma / Browse and edit data with Prisma Studio. |
| `npm run db:push` | ทดลองเปลี่ยนตารางโดยไม่สร้าง migration / Prototype schema changes without a migration. |
| `npm run db:generate` | สร้าง Prisma Client ให้ตรงกับ schema / Regenerate Prisma Client. |

Seed เติมพนักงาน ประวัติลงเวลาประมาณ 30 วัน คำขอลา วันลาคงเหลือ และเงินเดือน 2 รอบ การรันซ้ำอาจเพิ่มรายการหรือปรับข้อมูลเดิม จึงควรใช้ฐานข้อมูลทดลองแยกไว้

The seed adds employees, roughly 30 days of attendance, leave requests and balances, and two payroll runs. Running it again can add records or update existing data, so use a separate demo database.

<a id="testing"></a>
## ตรวจงานก่อนส่ง · Testing

| คำสั่ง / Command | ตรวจอะไร / What it checks |
|---|---|
| `npm run lint` | ข้อผิดพลาดและรูปแบบโค้ดด้วย ESLint / Code issues caught by ESLint. |
| `npm run typecheck` | ชนิดข้อมูล TypeScript / TypeScript types. |
| `npm test` | สูตรเงินเดือน กฎลงเวลา วันลา และสิทธิ์ / Payroll, attendance, leave-day calculations, and permissions. |
| `npm run build` | สร้างเว็บสำหรับรันจริง โดยสร้าง Prisma Client ก่อน / Build the app after generating Prisma Client. |
| `npm run test:e2e` | ลองใช้งานผ่านเบราว์เซอร์ / Test the app through a browser. |

ก่อนทดสอบเบราว์เซอร์ครั้งแรก รัน `npx playwright install chromium` และเตรียมฐานข้อมูลตัวอย่าง Playwright จะเปิดเซิร์ฟเวอร์เอง หรือใช้เซิร์ฟเวอร์เดิมในเครื่องที่พอร์ตตรงกัน

Before the first browser test, install Chromium and prepare a seeded database. Playwright starts a server or reuses one on the configured port during local testing.

`auth.spec.ts` ตรวจล็อกอินและหน้าที่ต้องมีสิทธิ์ ส่วน `workspace.spec.ts` ตรวจค้นหาเมนู ตัวกรอง แท็บ คีย์บอร์ด ภาษาไทยบนมือถือ และโหมดมืด ชุดทดสอบการลาและเงินเดือนจะสร้างหรือแก้ข้อมูลในฐานข้อมูลที่ตั้งค่าไว้

Auth tests check sign-in and protected pages. Workspace tests check navigation, filters, tabs, keyboard use, Thai mobile layouts, and dark mode. Leave and payroll tests create or change records in the configured database.

หาก Windows build แจ้ง `EPERM` ตอนเปลี่ยนชื่อ `query_engine-windows.dll.node` ให้หยุด dev server ของโปรเจกต์แล้วลองใหม่ เพราะ Prisma ที่กำลังรันอาจล็อกไฟล์อยู่

If a Windows build reports `EPERM` while renaming the Prisma engine file, stop this project's dev server and try again. A running Prisma process may be holding it open.

<a id="architecture"></a>
## โครงสร้างโค้ด · Architecture

ระบบอยู่ในแอปเดียว แต่แยกโฟลเดอร์ตามงาน หน้าเว็บแสดงผล ส่วนการตรวจสิทธิ์และคำนวณอยู่แยกต่างหาก / This is one app with folders for each area of work. Screens, access checks, and calculations are kept in separate places.

| ที่อยู่ / Location | หน้าที่ / Responsibility |
|---|---|
| [`src/app`](src/app) | หน้าเว็บ โครงหน้า และ API / Pages, layouts, and API endpoints. |
| [`src/components/ui`](src/components/ui) | ปุ่ม ช่องกรอก ตาราง และส่วนพื้นฐาน / Basic interface controls. |
| [`src/components/layout`](src/components/layout) | เมนูข้าง แถบบน และค้นหาเมนู / Sidebar, top bar, and page search. |
| [`src/components/shared`](src/components/shared) | ส่วนที่หลายหน้าใช้ร่วมกัน / Parts shared by several pages. |
| [`src/features`](src/features) | `queries.ts` อ่านข้อมูล, `actions.ts` รับคำสั่งบันทึก, `components` แสดงผล / Feature code for reading data, handling changes, and displaying screens. |
| [`src/server/auth`](src/server/auth) | ล็อกอินและเซสชัน / Sign-in and session data. |
| [`src/server/authorization`](src/server/authorization) | ตรวจว่าใครเข้าถึงหรือแก้อะไรได้ / Access checks. |
| [`src/server/services`](src/server/services) | คำนวณและจัดการงานที่เกี่ยวข้องหลายตาราง / Calculations and operations involving several records. |
| [`src/validations`](src/validations) | ตรวจข้อมูลฟอร์ม / Form validation. |
| [`src/i18n`](src/i18n) | คำแปลและการเลือกภาษา / Translations and language selection. |
| [`prisma`](prisma) | โครงสร้างฐานข้อมูล ประวัติเปลี่ยนตาราง และข้อมูลตัวอย่าง / Schema, migrations, and seed data. |
| [`e2e`](e2e) | ทดสอบผ่านเบราว์เซอร์ / Browser tests. |

```mermaid
flowchart LR
  Screen["หน้าเว็บ / Screen"] --> Request["อ่านหรือบันทึก / Read or save"]
  Request --> Access["ตรวจสิทธิ์ / Check access"]
  Access --> Work["ตรวจข้อมูลและคำนวณ / Validate and calculate"]
  Work --> DB[("ฐานข้อมูล / PostgreSQL")]
  DB --> Screen
```

```mermaid
flowchart LR
  Request["พนักงานยื่นลา / Submit leave"] --> Manager["หัวหน้าตรวจ / Manager review"]
  Manager -->|"อนุมัติ / Approve"| HR["ฝ่ายบุคคลตรวจ / HR review"]
  HR -->|"อนุมัติ / Approve"| Balance["ปรับวันลาคงเหลือ / Update balance"]
  Manager -->|"ปฏิเสธ / Reject"| Rejected["คำขอไม่ผ่าน / Rejected"]
  HR -->|"ปฏิเสธ / Reject"| Rejected
```

พนักงานยกเลิกคำขอได้ขณะรอหัวหน้าหรือฝ่ายบุคคลอนุมัติ / Employees can cancel requests while waiting for manager or HR approval.

<a id="tech-stack"></a>
## เครื่องมือที่ใช้ · Tech stack

| เครื่องมือ / Tool | ใช้ทำอะไร / Purpose |
|---|---|
| Next.js, React, TypeScript | สร้างหน้าเว็บและโค้ดที่ตรวจชนิดข้อมูลได้ / Pages and type-checked application code. |
| Tailwind CSS, shadcn/ui, Base UI | จัดหน้าตาและพฤติกรรมของหน้าจอ / Interface styling and controls. |
| Prisma, PostgreSQL | อ่าน บันทึก และจัดโครงสร้างข้อมูล / Data storage and queries. |
| Auth.js | จัดการล็อกอินและเซสชัน / Sign-in and sessions. |
| Zod, React Hook Form | ตรวจและจัดการข้อมูลฟอร์ม / Form values and validation. |
| TanStack Table, Recharts, date-fns | ตาราง กราฟ และวันที่ / Tables, charts, and dates. |
| Vitest, Playwright | ตรวจตรรกะและลองใช้งานผ่านเบราว์เซอร์ / Logic and browser tests. |

ดูเวอร์ชันที่ใช้ใน [`package.json`](package.json) และ `package-lock.json` / The package files record the versions used by this project.

<a id="database-design"></a>
## โครงสร้างข้อมูล · Database design

[`prisma/schema.prisma`](prisma/schema.prisma) มี 15 โมเดล แต่ละโมเดลอธิบายข้อมูลหนึ่งประเภท / The schema has 15 models, each describing one kind of record.

| กลุ่ม / Group | โมเดล / Models |
|---|---|
| บัญชีและองค์กร / People and organisation | `User`, `Employee`, `Department`, `Position` |
| ลงเวลา / Attendance | `Attendance` |
| การลา / Leave | `LeaveType`, `LeaveBalance`, `LeaveRequest`, `LeaveApproval` |
| เงินเดือน / Payroll | `PayrollRun`, `PayrollItem`, `PayrollAdjustment`, `Payslip` |
| ดูแลระบบ / Administration | `AuditLog`, `CompanySetting` |

พนักงานเชื่อมกับหัวหน้าผ่าน `managerId` และอาจมีบัญชี `User` สำหรับล็อกอิน วันลาคงเหลือแยกตามคน ประเภทลา และปี `PayrollItem` เก็บยอดคำนวณ ส่วน `PayrollAdjustment` เก็บรายการรับ–หักที่เพิ่มเอง

Employees link to their manager through `managerId` and may have a login account. Leave balances are separate by employee, leave type, and year. Payroll items store calculated totals; adjustments record manual additions and deductions.

ช่องเงินในฐานข้อมูลใช้ `Decimal` เพื่อเก็บทศนิยม ส่วน `AuditLog.metadata` ใช้ JSON เพื่อเก็บรายละเอียดของการเปลี่ยนแปลง / Money fields use `Decimal`; audit metadata uses JSON for action details.

<a id="internationalisation"></a>
## เพิ่มและแก้ภาษา · Thai and English

ข้อความอังกฤษอยู่ใน [`en.ts`](src/i18n/dictionaries/en.ts) และไทยอยู่ใน [`th.ts`](src/i18n/dictionaries/th.ts) ทั้งคู่ต้องมีชื่อข้อความหรือ **key** ตรงกัน TypeScript ช่วยตรวจคำแปลที่ตกหล่น

The English and Thai dictionaries use matching **keys**, the names used to look up each message. TypeScript checks that the Thai dictionary matches the English structure.

ฝั่งเซิร์ฟเวอร์ใช้ `getDictionary()` ส่วนหน้าจอที่โต้ตอบกับผู้ใช้ใช้ `useTranslations()` คุกกี้ `hrflow_locale` จำภาษาที่เลือก ค่าเริ่มต้นคืออังกฤษ รหัสข้อผิดพลาดจาก action แปลงเป็นข้อความตามภาษาที่เลือกได้ เช่น [`format-error.ts`](src/features/leave/format-error.ts)

Server code uses `getDictionary()` and interactive components use `useTranslations()`. The language cookie defaults to English. Actions can return error codes that the screen turns into translated messages.

เพิ่มภาษาใหม่โดยแก้ [`config.ts`](src/i18n/config.ts) สร้างไฟล์คำแปล ลงทะเบียนใน [`server.ts`](src/i18n/server.ts) และปรับ [`language-switcher.tsx`](src/components/layout/language-switcher.tsx) ซึ่งตอนนี้สลับได้สองภาษา

To add a language, update the locale configuration, create and register its dictionary, and update the language switcher, which currently assumes two languages.

<a id="deployment-vercel"></a>
## นำเว็บขึ้น Vercel · Deployment

1. เตรียม PostgreSQL ที่เว็บปลายทางเข้าถึงได้ / Prepare a database reachable from the hosted app.
2. นำ repository เข้าโปรเจกต์ Vercel / Import the repository into Vercel.
3. ตั้ง `DATABASE_URL`, `AUTH_SECRET` และ `NEXTAUTH_URL` ให้ตรงกับปลายทาง / Set the database, session secret, and hosted app URL.
4. ใช้คำสั่ง build `npm run build` / Use `npm run build` as the build command.
5. รัน `npm run db:migrate:deploy` กับฐานข้อมูลปลายทางก่อนใช้งานและเมื่อมี migration ใหม่ / Apply migrations before use and after schema changes.
6. หากเป็นเว็บทดลองที่ต้องการข้อมูลตัวอย่าง ให้รัน seed กับฐานข้อมูลทดลองนั้น / Seed the database only when it is intended for a demo.

<a id="limitations"></a>
## ข้อจำกัดที่ควรรู้ · Limitations

- **เงินเดือนและภาษี:** เป็นสูตรตัวอย่าง รวมถึงภาษีอัตราคงที่และเพดานประกันสังคมตัวอย่าง เอกสารภาษียังใช้ยื่นจริงไม่ได้ / **Payroll and tax:** calculations are simplified examples; the tax summary is not a certified filing document.
- **วันหยุด:** การนับวันลาตัดเฉพาะเสาร์–อาทิตย์ ยังไม่มีปฏิทินวันหยุดบริษัท / **Holidays:** leave counting excludes weekends; company holidays are not implemented.
- **พิกัด:** บันทึกเมื่อเบราว์เซอร์อนุญาต ยังไม่มีระบบตรวจการปลอมพิกัด / **Location:** coordinates depend on permission; spoofing detection is not implemented.
- **PDF:** บันทึกผ่านเมนูพิมพ์ของเบราว์เซอร์ / **PDF:** documents are saved through the browser print dialog.
- **รายงาน:** ส่งออก CSV ที่เปิดใน Excel ได้ ยังไม่ได้สร้าง `.xlsx` / **Reports:** exports are CSV, not native Excel workbooks.
- **ภาษาในข้อมูล:** ชื่อแผนก ประเภทลา และข้อความที่บันทึกไม่ได้แปลอัตโนมัติ / **Stored text:** department names, leave types, and user-entered text are not automatically translated.

<a id="future-improvements"></a>
## สิ่งที่ยังไม่ได้ทำ · Future improvements

รายการนี้เป็นแนวทางต่อยอด ยังไม่ใช่ความสามารถที่มีอยู่ / These are possible next steps, not completed features.

- ปฏิทินวันหยุดบริษัท / Company holiday calendar.
- สูตรเงินเดือนและภาษีที่ผ่านการตรวจสำหรับใช้งานจริง / Verified payroll and tax calculations.
- สร้าง PDF จากเซิร์ฟเวอร์ / Server-generated PDFs.
- นำเข้าพนักงานหลายคนพร้อมกัน / Bulk employee import.
- อีเมลแจ้งผลการลาและการออกสลิป / Email notifications for leave decisions and payslips.
