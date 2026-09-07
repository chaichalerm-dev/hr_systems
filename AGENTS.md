# แนวทางทำงานในโปรเจกต์ · Project working notes

HRFlow เป็นเว็บสาธิตงานบุคคล อ่าน [README.md](README.md) เพื่อเข้าใจวิธีใช้ โครงสร้างโค้ด และข้อจำกัดก่อนแก้ไข

HRFlow is an HR demo. Read [README.md](README.md) for the workflow, code layout, and current limitations.

## เขียนคำอธิบายให้คนอ่านเข้าใจ · Write for people

- เอกสารและคอมเมนต์ใช้ภาษาไทยที่อ่านง่าย พร้อมอังกฤษสั้น ๆ ที่มีความหมายเดียวกัน บอกว่าส่วนนี้ทำอะไรและทำไมต้องมี / Use plain Thai with a short English equivalent. Explain what the code does and why it matters.
- ข้อความหน้าจอแก้ทั้ง `src/i18n/dictionaries/en.ts` และ `th.ts` ให้มีความหมายตรงกันและบอกสิ่งที่ผู้ใช้ทำต่อได้ / Update both UI dictionaries and tell the user what to do next.
- คงชื่อฟังก์ชัน ตัวแปร คำสั่ง และเส้นทางไฟล์ให้ตรงกับโค้ด / Keep identifiers, commands, and file paths accurate.
- แก้คำอธิบายเก่าให้ตรงกับระบบ และบอกว่าสิ่งใดยังเป็นข้อมูลหรือสูตรสาธิต / Correct outdated explanations and identify demo data and formulas.
- อธิบายไฟล์ที่เครื่องมือสร้างไว้ในเอกสารโปรเจกต์ โดยคงไฟล์แพ็กเกจ ไฟล์ build และประวัติ migration ที่ใช้แล้วไว้ / Explain generated files in project documentation; preserve dependency files, build output, and applied migration history.

## ก่อนแก้ Next.js · Before changing Next.js code

Next.js เวอร์ชันนี้อาจต่างจากเวอร์ชันที่คุ้นเคย ให้อ่านหัวข้อที่เกี่ยวข้องใน `node_modules/next/dist/docs/` ก่อนเขียนโค้ด และตรวจคำเตือนเรื่อง API ที่เลิกแนะนำให้ใช้

Read the relevant installed Next.js guide before writing code, and check deprecation notices instead of relying on older conventions.

Next.js สร้างบล็อกด้านล่างให้อัตโนมัติและอาจเขียนกลับเมื่อรัน `next dev` จึงเก็บต้นฉบับไว้ โดยมีคำอธิบายไทยด้านบนกำกับ

Next.js manages the block below and may recreate it during `next dev`. Keep its original text; the Thai explanation above describes the same requirement.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
