# PRD: Market Stall Rental & Attendance Management System

## Problem Statement

เจ้าของตลาดและผู้จัดการตลาดประสบปัญหาความล่าช้า ขาดความแม่นยำ และขาดความเรียลไทม์ในการบริหารจัดการแผงค้าและจัดเก็บค่าเช่า เนื่องจากกระบวนการเดิมพึ่งพาการจดบันทึกบนกระดาษขณะเดินตรวจตลาด ทำให้เกิดปัญหาตามมาดังนี้:
1. ไม่สามารถตรวจสอบสถานะการชำระเงินของแต่ละแผงได้ทันที (จ่ายแล้ว / ค้างชำระ / แผงว่าง)
2. การคำนวณค่าเช่ารวมกับค่าใช้จ่ายผันแปร (ค่าน้ำ, ค่าไฟ, ค่าขยะ) ใช้เวลามากและเสี่ยงต่อการผิดพลาด
3. ขาดระบบบันทึกสถิติการเข้าขายของพ่อค้าแม่ค้า (แผงประจำ/แผงจร) เพื่อนำมาประเมินอัตราการใช้พื้นที่ (Occupancy Rate)
4. การรับเงินสดหรือการสแกนโอนเงินยังขาดระบบออกใบเสร็จรับเงินดิจิทัลหน้างานทันที
5. การสลับหน้าจอหรืออุปกรณ์ระหว่างการเดินตรวจตลาด (ดูแผนผัง) กับการดูภาพรวมสถิติ (Dashboard) มีความยุ่งยาก เนื่องจากผู้ใช้งานหลักมีเพียงคนเดียวที่ทำหน้าที่ทั้งเดินตรวจและบริหารจัดการ

## Solution

ระบบเว็บแอปพลิเคชันรูปแบบ Mobile-First Progressive Web App (PWA) พัฒนาด้วย Next.js, Tailwind CSS และ PostgreSQL (Prisma ORM) สำหรับใช้งานบนสมาร์ทโฟนของผู้จัดการตลาด (ใช้งานคนเดียวครบทุกฟังก์ชัน) โดยมีคุณสมบัติหลักคือ:
- **Unified Mobile Interface**: รวมหน้าจอแผนผังและหน้าจอ Dashboard เข้าด้วยกันผ่านแถบนำทางด้านล่าง (Bottom Navigation) ทำให้สลับการทำงานระหว่างเดินตลาดและดูสถิติได้อย่างลื่นไหลบนหน้าจอมือถือ
- **Interactive Floor Map**: ผังแผงตลาดจำลองแยกตามโซน แสดงสถานะสีชัดเจน (เขียว = จ่ายแล้ว, แดง = ค้างชำระ, เทา = แผงว่าง)
- **Mobile Payment & Receipt**: บันทึกการเก็บค่าเช่า + ค่าน้ำ/ไฟ/ขยะ คำนวณยอดรวมอัตโนมัติ รองรับทั้งเงินสด และการสร้าง PromptPay QR Code เพื่อให้ผู้เช่าสแกนจ่าย พร้อมออกใบเสร็จดิจิทัลส่งเข้า LINE ได้ทันที
- **Attendance Tracking**: ระบบเช็คชื่อเข้าขายประจำวันเพื่อเก็บสถิติการเปิดแผงค้า
- **Real-time Mobile Dashboard**: แดชบอร์ดสำหรับดูผ่านมือถือ สรุปรายได้ประจำวัน รายงานแผงค้างชำระ และสถิติการเข้าขาย

---

## User Stories

1. As a market manager, I want to view an interactive visual map of all market stalls on my mobile screen, so that I can immediately identify which stalls are paid, overdue, or vacant.
2. As a market manager, I want to filter the market map by zone (e.g., Fresh Food, Fashion, Street Food), so that I can navigate and collect rent efficiently section by section.
3. As a market manager, I want to tap on a stall icon on the map to see its details and current tenant information, so that I can confirm tenant identity before recording payment.
4. As a market manager, I want to enter variable utility costs (water, electricity, garbage fees) along with the stall fee, so that the system automatically calculates the total amount due.
5. As a market manager, I want to select 'Cash' as a payment method and record the collected amount, so that the system logs the transaction for daily reconciliation.
6. As a market manager, I want to generate a PromptPay QR Code with the exact calculated total amount, so that tenants can conveniently pay via mobile banking.
7. As a market manager, I want to view and share a digital receipt after payment confirmation, so that I can send it directly to the tenant via LINE or messaging apps.
8. As a market manager, I want to mark the attendance of each stall (present/absent) during my daily rounds, so that the market maintains an accurate record of daily stall usage.
9. As a market manager, I want to easily switch between the Map view and the Dashboard view using a bottom navigation bar on my mobile phone, so that I can manage operations and review stats on the go without changing devices or remembering URLs.
10. As a market manager, I want to view a real-time revenue dashboard on my phone showing total collected funds split by cash and QR Code, so that I have immediate visibility over daily finances.
11. As a market manager, I want to access a report on overdue accounts and unpaid stalls directly from the mobile app, so that I can follow up on outstanding balances promptly.
12. As a market manager, I want to analyze stall occupancy rates and attendance statistics over time in the mobile dashboard, so that I can evaluate tenant reliability and optimize market floor space.
13. As a market manager, I want to manage stall master data and register tenants (fixed/casual), so that rental terms are standardized across the market.

---

## Implementation Decisions

- **Architecture & Framework**: Single-repo Full-stack Web Application using Next.js (App Router) with Server Actions for direct, typed database operations.
- **UI & Mobile Optimization**: Tailwind CSS with Shadcn/ui component primitives, designed strictly Mobile-First. The layout will transition from a split-role layout to a Unified Bottom Navigation layout (Map / Dashboard / Settings). Dashboard grid will be refactored to a 1-column mobile-friendly stack.
- **Database Schema**: PostgreSQL managed via Prisma ORM with core models:
  - `Zone`: Market section definitions.
  - `Stall`: Stall master record.
  - `Vendor`: Tenant master record.
  - `Contract`: Fixed tenant lease agreements.
  - `PaymentCollection`: Financial logs.
  - `AttendanceLog`: Daily presence records.
- **Interactive Floor Map Component**: Rendered using dynamic CSS Grid / SVG layout responsive to mobile viewports.
- **PromptPay QR Generation**: Client-side / Server-side PromptPay payload generator.

---

## Testing Decisions

- **Testing Seam Strategy**: Test external behavior at the highest seam possible (API / Server Action layer and core UI workflow integration).
- **Core Modules to Test**:
  - Payment calculation logic (Stall Fee + Water + Electricity + Garbage = Total Amount).
  - Stall status transitions upon payment completion.
  - Unified routing and bottom navigation state.
  - Financial summary aggregations on the Dashboard view.
- **Test Characteristics**: Assert against end-to-end data states and API responses rather than internal implementation helper details.

---

## Out of Scope

- Automated bank slip auto-verification via Open Banking API (Phase 1 relies on manual collector confirmation or QR code generation).
- IoT smart utility meter integration (Meter reading is entered manually).
- Multi-market tenant marketplace / Public e-commerce portal.
- Multi-user role authorization (RBAC) since the system is designed for a single owner/manager.

---

## Further Notes

- Progressive Web App (PWA) manifest and service worker configuration will be added to enable 'Add to Home Screen' functionality for a native app-like experience.
