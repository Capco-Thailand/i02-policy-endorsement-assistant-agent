# BMad workflow starter: คู่มือเริ่มแอปใหม่

รีโปนี้เก็บ **วิธีทำงานเดิม** ตั้งแต่ PRD → ticket/UX handoff → GitHub Issue → implementation plan → `bmad-build` → browser E2E → implementation PR → ปิด Issue หลัง merge ส่วนโค้ดแอปเดิมถูกนำออกแล้ว เอกสารและสคริปต์บางส่วนยังมีค่าเฉพาะโปรเจกต์เดิม จึงต้องตั้งค่าแต่ละขั้นให้ตรงกับแอปใหม่ก่อนใช้งานขั้นนั้น

เอกสารนี้เป็นลำดับงานสำหรับ AI agent ที่รับหน้าที่ตั้งโปรเจกต์ใหม่ อ่าน [AGENTS.md](AGENTS.md) สำหรับกฎที่ใช้ระหว่างทำงาน และ [docs/TICKETING.md](docs/TICKETING.md) สำหรับรายละเอียด ticket/Issue workflow หากผู้ใช้ขอเพียงแค่เริ่มตั้งค่า ให้ทำเฉพาะขั้นตั้งค่าและการตรวจสอบในเอกสารนี้ ยังไม่ต้องสร้าง feature ticket หรือเปิด Issue เอง

## สถานะของ starter ตอนนี้

- `.agents/skills/`, `_bmad/`, `_bmad/custom/`, สคริปต์ ticket ใน `scripts/`, template และเอกสารมาตรฐานยังอยู่
- `package.json` มีเพียงคำสั่ง ticket, `plan:issues` และ `npm test` สำหรับทดสอบสคริปต์ ยังไม่มี source ของแอป, workspace, คำสั่ง `dev`, `build`, `typecheck`, `format:check` หรือ `test:e2e`
- [docs/PRD.md](docs/PRD.md) ยังเป็น PRD ของแอปประกันเดิม ต้องเขียนใหม่จากขอบเขตของแอปใหม่ก่อนนำไปใช้
- `_bmad/config.toml` ยังเก็บชื่อโปรเจกต์เดิมและเป็นไฟล์ที่ installer ดูแล ให้เปลี่ยนคำตอบผ่าน BMad setup; ตรวจ `_bmad/custom/` และ active initiative ด้วย
- `FR` ยังเป็น feature ID prefix ในเอกสาร, skill reference, script, test และ Issue template เปลี่ยนเป็นตัวย่ออื่นได้ แต่ต้องเปลี่ยนทุกจุดที่เกี่ยวข้องพร้อมกัน
- GitHub Actions ใน `.github/workflows/` ถูกปิดด้วย `if: false`; `ticket-check.yml` ยังอ้าง Postgres/pgvector, `apps/api` และคำสั่งตรวจแอปเดิม ห้ามถือว่ามี CI หรือ auto-merge ใช้งานแล้ว
- `docs/backlog/`, `docs/tickets/`, `docs/implementation-plan/` และ `design/` อาจยังไม่มี ให้สร้างเมื่อมีงานจริง

ก่อนใช้ workflow ใน repo ใหม่ ตรวจว่าเครื่องมี Node.js/npm สำหรับสคริปต์, `gh` ที่ล็อกอินกับ **repo ปลายทางที่ถูกต้อง** สำหรับ Issue/PR, `codex` สำหรับ `plan:issues` และ `uv` เมื่อต้องรัน BMad setup ตรวจด้วย `git remote -v`, `gh repo view` และ `npm run` ก่อนใช้คำสั่งที่เปลี่ยน GitHub การทดสอบ browser E2E ต้องมี browser และ test environment ของแอปจริง หากเครื่องมือใดยังไม่มี ให้บันทึกเป็นงานตั้งค่าที่ค้างอยู่แทนการรายงานว่า flow พร้อมแล้ว

## วิธีทำงานของ AI เมื่อได้รับคำสั่งให้เริ่มโปรเจกต์

1. **ตรวจของที่มีอยู่ก่อนถาม**: อ่าน `AGENTS.md`, README นี้, `docs/TICKETING.md`, `package.json`, `_bmad/custom/`, `.agents/skills/bmad/references/do-feature.md` และ `.github/workflows/`; ตรวจ branch, worktree, remote, Issue/PR เดิม และโครงสร้างไฟล์เท่าที่เกี่ยวข้อง อย่าเดาว่าเอกสารเก่าคือ requirement ของแอปใหม่
2. **สรุปสิ่งที่รู้กับสิ่งที่ยังต้องตัดสินใจ**: ใช้คำถามในหัวข้อถัดไป เฉพาะเรื่องที่ยังอนุมานจากผู้ใช้หรือรีโปไม่ได้ ถามเป็นชุดสั้นตามลำดับความจำเป็น พร้อมเสนอค่าเริ่มต้นที่รักษา flow เดิม ผู้ใช้ตอบเฉพาะจุดตัดสินใจ ส่วนการไล่แก้ไฟล์และตรวจความสอดคล้องเป็นงานของ AI
3. **ตั้งค่าจากคำตอบจริง**: แก้เอกสาร, skill override, script, template และแอปให้สอดคล้องกัน ปรับเฉพาะส่วนที่เกี่ยวกับโปรเจกต์ใหม่ เก็บลำดับ ticket/UX PR merge → Issue → implementation PR แบบเดิม เว้นแต่ผู้ใช้สั่งเปลี่ยน
4. **ตรวจทุกจุดก่อนส่งมอบ**: รัน test/check ที่มีจริง ตรวจ path และคำสั่งทุกตัวที่เอกสารกล่าวถึง ตรวจความสอดคล้องของ feature prefix กับ script/test/template ตรวจว่า GitHub workflow ยังปิดอยู่จนกว่าจะทดสอบกับ repo ใหม่แล้ว รายงานสิ่งที่ตั้งเสร็จและสิ่งที่ยังรอคำตอบหรือระบบภายนอก

### คำถามที่ต้องหาคำตอบจากผู้ใช้

ถามเฉพาะเมื่อรีโปหรือคำสั่งก่อนหน้ายังตอบไม่ได้ แบ่งถามตามงานที่กำลังจะทำ หากผู้ใช้ยังไม่เลือก stack ให้เสนอทางเลือกที่เหมาะกับขอบเขตงานพร้อมเหตุผล ไม่ยก stack เดิมเป็นค่าเริ่มต้นโดยอัตโนมัติ

| เรื่อง | ถามอะไร | นำคำตอบไปใช้ที่ไหน |
| --- | --- | --- |
| เป้าหมายและผู้ใช้ | แอปชื่ออะไร แก้ปัญหาอะไร ใครใช้ ฟีเจอร์แรกและสิ่งที่ไม่ทำคืออะไร | PRD, BMad project name, ticket แรก |
| ขอบเขตข้อมูลและความปลอดภัย | รับข้อมูลชนิดใด มีข้อมูลจริงหรือข้อมูลอ่อนไหวไหม ใครเข้าถึง/แก้ไขได้ การกระทำใดต้องมีคนอนุมัติหรือห้าม AI ทำเอง | PRD, tickets, test cases, architecture |
| ผลลัพธ์ที่วัดได้ | จะยอมรับ MVP จากพฤติกรรมหรือค่าชี้วัดใด มีข้อกำหนดด้าน accessibility, performance, audit หรือข้อบังคับเฉพาะไหม | PRD, acceptance criteria, testing standard |
| ระบบและการเชื่อมต่อ | เป็น web/mobile/API/agent แบบใด มีระบบเดิม ฐานข้อมูล provider หรือข้อจำกัด deployment ใดที่ต้องใช้ | ADR, coding/API docs, app structure, CI |
| รูปแบบงาน | ใช้ `FR` ต่อหรือใช้ prefix ใด ชื่อ branch หลักและ naming convention อะไร ใช้ GitHub repo ไหน | script, test, docs, templates, workflows |
| GitHub delivery | ต้องใช้ Issue/PR และ label เดิมไหม ใคร review, required checks อะไร และต้องการ auto-merge/auto-close หรือไม่ | Issue/PR templates, branch rules, Actions |
| UX | มีแบรนด์, design system, ภาษา, อุปกรณ์เป้าหมาย หรือข้อจำกัดการใช้งานอะไร ต้องทำ UI หรือไม่ | design standards, UX handoff, browser checks |
| การรันและทดสอบ | ต้องรองรับ runtime/environment ใด คำสั่งติดตั้ง/รันจริงคืออะไร มี service ภายนอกหรือ test environment ไหน | package scripts, testing standard, CI |

#### คำถามเฉพาะสำหรับมาตรฐานงาน

เริ่มจากอ่านคำตอบที่มีใน PRD, โค้ด, package/config และ ADR ก่อน ถามเฉพาะข้อที่มีผลต่อการเลือกแนวทางหรือพฤติกรรมผลิตภัณฑ์ หากผู้ใช้ไม่ได้กำหนดรายละเอียดเชิงเทคนิค ให้ AI เสนอทางเลือกพร้อมเหตุผล เลือกค่าเริ่มต้นที่เหมาะกับแอป และบันทึกในเอกสารที่เกี่ยวข้อง

| เอกสาร | ต้องรู้หรือถามอะไรเมื่อยังไม่มีคำตอบ | สิ่งที่ AI ตรวจและกำหนดเองได้ |
| --- | --- | --- |
| [CODING_STANDARDS.md](docs/CODING_STANDARDS.md) | มีภาษา/framework, runtime, package manager, โครงสร้าง repo หรือ dependency ที่องค์กรบังคับใช้ไหม? มีข้อจำกัดเรื่อง license, deployment หรือการใช้ AI ในโค้ดไหม? | ตรวจของที่ใช้อยู่ก่อน กำหนด formatter/linter, module boundaries, naming และคำสั่ง `format:check`, `typecheck`, `build` ให้รันได้จริง; บันทึกการตัดสินใจที่เปลี่ยนภายหลังยากใน ADR |
| [API_DEVELOPMENT.md](docs/API_DEVELOPMENT.md) | ต้องมี API หรือไม่ ใครเป็นผู้เรียก? ใช้วิธียืนยันตัวตนและสิทธิ์แบบใด? เก็บข้อมูลที่ไหน เชื่อมระบบใด และ action ใดมีผลจริงหรือทำซ้ำไม่ได้? มี API contract หรือ versioning ที่ต้องเข้ากันได้หรือไม่? | เมื่อมี API ให้กำหนด schema, validation, error shape, logging, migration/test data, idempotency และ environment variables จาก requirement ที่ตกลงแล้ว; บันทึก route และคำสั่งหลัง implement จริง หากไม่มี API ให้ระบุว่าไม่เกี่ยวข้อง |
| [DESIGN_STANDARD.md](docs/DESIGN_STANDARD.md) และ [VISUAL_UX_CONSTRAINTS.md](docs/VISUAL_UX_CONSTRAINTS.md) | มี UI หรือไม่? ผู้ใช้ทำงานหลักบนอุปกรณ์ใด? มี brand assets/design system, ภาษา, accessibility target หรือข้อกำหนดด้านหน้าตาและ interaction ไหม? จะใช้ visual defaults ในไฟล์ปัจจุบันหรือปรับตามแบรนด์ใหม่? | หากมี UI ให้กำหนด page map, loading/empty/error/success states, responsive behavior และ browser-viewable mockups จาก ticket/UX handoff; ตรวจว่าลิงก์และ preview ใช้งานได้ หากไม่มี UI ให้ระบุว่าไม่เกี่ยวข้อง |
| [TESTING_STANDARD.md](docs/TESTING_STANDARD.md) | มี test environment, test data และบริการภายนอกแบบใดที่ใช้ได้? ต้องพิสูจน์เกณฑ์ยอมรับหรือความเสี่ยงใดเป็นพิเศษ? | เลือก unit/integration/API/browser checks ตาม behavior จริง จัด fixture ที่ปลอดภัย และเพิ่มคำสั่งกับรายงานเมื่อมีแอปให้ทดสอบ |

หากยังไม่รู้คำตอบที่มีผลต่อ requirement, data boundary, branch/repo ปลายทาง หรือการเปิด automation ให้บันทึกเป็นคำถามค้างและทำส่วนที่ไม่ขึ้นกับคำตอบต่อไป ไม่สร้าง requirement หรือเชื่อม GitHub โดยเดาเอง ไม่ขอรหัสผ่านหรือ secret ในแชต; ระบุชื่อ secret และที่เก็บที่ต้องตั้งค่าแทน

ค่าเริ่มต้นคือคง GitHub ticket/UX PR → Issue → implementation PR และ `FR` ตามรีโปนี้ หากผู้ใช้ไม่ใช้ GitHub หรืออยากเปลี่ยนลำดับดังกล่าว ต้องออกแบบและตรวจ workflow ใหม่ก่อนใช้ script เดิม

## ปรับรีโปตามลำดับ

### 1. ตั้งค่า BMad และขอบเขตผลิตภัณฑ์

- ใช้ BMad `setup` เมื่อจะเปลี่ยน install answer เช่น `project_name`; `_bmad/config.toml` เป็น installer managed ส่วน team override ที่คงทนอยู่ใน `_bmad/custom/` ตรวจ `_bmad/custom/config.user.toml` ว่า active initiative ยังชี้งานเดิมหรือไม่
- เขียน [docs/PRD.md](docs/PRD.md) ใหม่ด้วยเป้าหมาย, ผู้ใช้, scope, ข้อจำกัดข้ามฟีเจอร์, ข้อมูล/สิทธิ์/การอนุมัติ และเกณฑ์สำเร็จของแอปใหม่ ลบลิงก์ ticket เก่าที่ไม่มีอยู่จริง
- อ่าน `_bmad/custom/bmad-agent-po.toml`, `bmad-ux.toml`, `bmad-build.toml` และ `facilitate-templates/` แล้วปรับข้อความที่ผูกกับผลิตภัณฑ์, path, command หรือ safety rule เดิม โดยรักษาหน้าที่ PO → UX → build ตามเดิม
- ใช้ [docs/ADR.md](docs/ADR.md) เป็นทะเบียนการตัดสินใจ บันทึกเฉพาะ architecture ที่เลือกแล้วใน `docs/adr/` และเชื่อมจาก ticket ที่พึ่งพา อย่านำ stack/เหตุผลจากแอปเก่ามาใช้โดยปริยาย

**เสร็จเมื่อ:** ชื่อโปรเจกต์ถูกต้อง, active initiative ชี้งานใหม่หรือถูกล้าง, PRD ไม่มี requirement ประกันเดิม, override ที่ใช้งานจริงพูดถึงแอปใหม่ และประเด็นที่ยังไม่ตัดสินใจถูกระบุชัด

### 2. ยืนยัน ticket workflow และ feature ID

- อ่าน [docs/TICKETING.md](docs/TICKETING.md) กับ [docs/TICKET_TEMPLATE.md](docs/TICKET_TEMPLATE.md) แล้วกำหนด backlog, ticket, Issue, label, dependency, Definition of Done และ branch ที่ตรงกับ repo ใหม่
- ถ้าใช้ `FR` ต่อ ไม่ต้องเปลี่ยน prefix หากเปลี่ยน ให้ค้น `FR`, `fr-`, `FR-` ทั้งรีโป โดยเฉพาะ `scripts/ticket-workflow.mjs` (`featureId`), `scripts/reset-ticket-workflow.mjs` (ID validation), script tests, `AGENTS.md`, `docs/`, `.github/ISSUE_TEMPLATE/`, `_bmad/custom/` และ `.agents/skills/bmad/references/do-feature.md` รวมถึงชื่อไฟล์/ตัวอย่าง/branch `implement/fr-...` ปรับเป็นชุดเดียวแล้วรัน tests ห้ามเปลี่ยนเฉพาะข้อความในเอกสาร
- ตรวจ GitHub repo, default branch, label, Issue form, PR template และค่าที่ hardcode เช่น `main`, `codex/main-backup`, `test/**`, `LEGACY`, `LAGECY` ก่อนรันคำสั่งที่สร้างหรือแก้ Issue
- สำหรับ ticket ใหม่ ให้สร้าง `docs/backlog/README.md` เพื่อเก็บลำดับงาน; ไฟล์ ticket ใน `docs/backlog/` และ `docs/tickets/` เก็บ requirement ส่วน GitHub Issue เป็นสำเนาที่ sync และตัวติดตามสถานะ

**เสร็จเมื่อ:** ID เดียวกัน resolve ได้จาก ticket → Issue → plan → implementation branch; script/test/template ใช้กติกาเดียวกัน และตรวจ repo ปลายทางแล้ว

### 3. เตรียมแอปและมาตรฐานที่รันได้จริง

- สร้าง source และเลือก workspace/runtime ตามแอปใหม่ ปรับ `package.json`/lockfile ให้ `npm test` ยังทดสอบ ticket scripts ได้ และเพิ่มคำสั่งที่งานใหม่ต้องใช้จริง เช่น `dev`, `typecheck`, `format:check`, `build`, `test:e2e` อย่าเขียนคำสั่งในเอกสารหรือ CI ก่อนมี implementation ให้รันได้
- ปรับ [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md), [docs/TESTING_STANDARD.md](docs/TESTING_STANDARD.md) และ [docs/API_DEVELOPMENT.md](docs/API_DEVELOPMENT.md) ตามภาษา, framework, รูปแบบ API, test layers, data fixtures และคำสั่งจริงของแอปใหม่
- หากมี UI ให้ปรับ [docs/DESIGN_STANDARD.md](docs/DESIGN_STANDARD.md) กับ [docs/VISUAL_UX_CONSTRAINTS.md](docs/VISUAL_UX_CONSTRAINTS.md) ตามแบรนด์และ platform จริง เก็บ handoff แบบ `DESIGN.md`, `EXPERIENCE.md` และ HTML mockups ที่เปิดใน browser ได้เมื่อใช้ flow นี้
- ตรวจ [AGENTS.md](AGENTS.md) และ `.agents/skills/bmad/references/do-feature.md` ให้ path, command, stack และข้อกำหนดเฉพาะแอปตรงกับ implementation โดยคงลำดับส่งงานเดิม

**เสร็จเมื่อ:** ก่อนเปิด implementation PR ผู้พัฒนารันแอปกับ test/check ที่ docs และ ticket อ้างได้จริง และคำสั่ง browser E2E ส่งรายงานตามที่ PR ต้องใช้ การสร้าง ticket/UX handoff แรกทำได้ก่อนมีโค้ดแอป; งาน scaffold แอปอาจเป็นส่วนหนึ่งของ implementation แรก

### 4. ตั้ง GitHub automation เมื่อ checks พร้อม

- ตรวจ `.github/workflows/ticket-check.yml`, `ticket-issue-sync.yml`, `ticket-requirement-automerge.yml`, `ticket-drift.yml` รวมถึง `.github/ISSUE_TEMPLATE/` และ `.github/pull_request_template.md`
- เปลี่ยน service, env, migration, workspace, app test, browser E2E, artifact path, branch filter, permissions, label และ GitHub token ตาม repo ใหม่ โดยเฉพาะ Postgres/pgvector และ `apps/api` ที่ยังค้างใน `ticket-check.yml`
- รัน script tests และ app checks ในเครื่องก่อน จากนั้นเปิด `ticket-check.yml` แบบควบคุมใน branch/repo ทดสอบ แล้วตรวจผลบน PR จริง จึงกำหนด required checks และ branch protection ทดสอบ Issue sync กับ ticket/Issue ทดสอบก่อนเปิดใช้งานทั่วไป เปิด auto-merge/auto-close หลังยืนยันพฤติกรรมและความต้องการของผู้ใช้ แล้วแก้เอกสารที่กล่าวถึงสถานะ automation

**เสร็จเมื่อ:** required checks ผ่านใน PR จริง, ticket/Issue reciprocal link ถูกต้อง, สถานะ merge และ Issue ตรงกับที่กำหนด และไม่มี job ที่อ้าง service หรือ command ของแอปเก่า

## Flow การส่ง feature หลังตั้งค่าพร้อม

1. ให้ `bmad-agent-po` เขียน backlog/ticket จาก PRD โดยใช้ [docs/TICKET_TEMPLATE.md](docs/TICKET_TEMPLATE.md) และระบุ acceptance criteria, dependency, data/authorization boundary
2. ถ้าเป็น UI ให้ `bmad-ux` ทำ `DESIGN.md`, `EXPERIENCE.md` และ mockups ที่ browser เปิดได้ แล้วลิงก์จาก ticket
3. เปิด **ticket/UX PR หนึ่งรายการ** พร้อม `Issue: Pending`; merge ก่อนสร้าง Issue หาก Issue automation ยังปิด ให้ใช้ `npm run ticket:create -- docs/tickets/<file>.md` เพื่อสร้างหรือ reuse Issue คำสั่งนี้เขียนเลข Issue ลง local ticket แต่ไม่ commit/push ให้เอง จึงต้องนำการแก้ลิงก์กลับขึ้น default branch ตาม branch rules หากเปิด automation แล้ว ให้รอ workflow สร้าง Issue และอัปเดต ticket (หรือ merge link PR ที่ workflow เปิดเมื่อแก้ default branch ตรง ๆ ไม่ได้) ตรวจ reciprocal link ก่อนเริ่ม implementation
4. ก่อนลงมือเขียนโค้ด ใช้ `npm run ticket:preflight -- docs/tickets/<file>.md`; อ่าน ticket, Issue, UX/ADR ที่ลิงก์ไว้ เตรียม plan ด้วย `npm run plan:issues -- <issue-number>` หรือ plan template แล้วให้ `bmad-build` ทำงานตาม plan
5. รัน checks และ browser E2E, บันทึก acceptance criteria ที่ตรวจแล้วกับที่ยังไม่ครอบคลุม เปิด **implementation PR หนึ่งรายการ** พร้อม Issue จริง ตรวจ merge/check/Issue state ก่อนรายงานว่าเสร็จ หาก automation ยังปิด ให้จัดการการ sync และสถานะ Issue ตาม [docs/TICKETING.md](docs/TICKETING.md)

`bmad do fr-<number>` เป็นคำสั่งภาษาธรรมชาติของ skill ไม่ใช่ shell command และจะใช้ได้เมื่อ ticket กับ Issue พร้อมแล้ว หากเปลี่ยน prefix ต้องปรับ skill reference ด้วย สำหรับ ticket ที่มี active Issue อยู่แล้ว ให้แก้ local ticket ก่อน แล้วใช้ `npm run ticket:sync -- docs/tickets/<file>.md` เพื่อ refresh Issue เดิม

## ตรวจความพร้อมตามจุดส่งงาน

**ก่อน ticket/UX PR แรก**

- [ ] PRD, project name, ขอบเขตข้อมูลและผู้อนุมัติเป็นของแอปใหม่; active initiative ชี้งานใหม่หรือถูกล้าง
- [ ] prefix, ticket path, Issue label, branch, GitHub repo และ skill override สอดคล้องกัน
- [ ] ticket scripts รันได้ และ `npm test` ผ่าน

**ก่อน implementation PR แรก**

- [ ] ลิงก์ ticket/Issue อยู่บน default branch และ `ticket:preflight` ผ่าน
- [ ] app scripts และ docs อ้างคำสั่งที่มีและรันผ่านจริง
- [ ] UI handoff และ browser E2E มีวิธีดู/รัน/รายงานจริง หากโปรเจกต์มี UI

**ก่อนเปิด automation**

- [ ] GitHub Actions ผ่านการทดสอบใน repo ใหม่; auto-merge/auto-close เปิดเฉพาะตามข้อตกลง
- [ ] required checks ใช้ชื่อ job ที่รันจริงและผ่านใน PR
- [ ] ตัวอย่างและลิงก์ของโปรเจกต์เดิมที่หลงเหลือถูกแทนที่หรือระบุว่าเป็นเพียงตัวอย่าง
