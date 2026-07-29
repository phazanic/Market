# PRD: Market Stall Rental & Attendance Management System

## Problem Statement

เจ้าของและผู้บริหารตลาดประสบปัญหาความล่าช้า ขาดความแม่นยำ และขาดความเรียลไทม์ในการบริหารจัดการแผงค้าและจัดเก็บค่าเช่า เนื่องจากกระบวนการเดิมพึ่งพาการจดบันทึกบนกระดาษโดยเจ้าหน้าที่เดินเก็บเงินหน้างาน ทำให้เกิดปัญหาตามมาดังนี้:
1. ไม่สามารถตรวจสอบสถานะการชำระเงินของแต่ละแผงได้ทันที (จ่ายแล้ว / ค้างชำระ / แผงว่าง)
2. การคำนวณค่าเช่ารวมกับค่าใช้จ่ายผันแปร (ค่าน้ำ, ค่าไฟ, ค่าขยะ) ใช้เวลามากและเสี่ยงต่อการผิดพลาด
3. ขาดระบบบันทึกสถิติการเข้าขายของพ่อค้าแม่ค้า (แผงประจำ/แผงจร) เพื่อนำมาประเมินการต่อสัญญาหรือประเมินอัตราการใช้พื้นที่ (Occupancy Rate)
4. การรับเงินสดหรือการสแกนโอนเงินยังขาดระบบออกใบเสร็จรับเงินดิจิทัลหน้างานทันที

## Solution

ระบบเว็บแอปพลิเคชันรูปแบบ Mobile-First Progressive Web App (PWA) พัฒนาด้วย Next.js, Tailwind CSS และ PostgreSQL (Prisma ORM) สำหรับใช้งานบนสมาร์ทโฟนของเจ้าหน้าที่เดินเก็บเงินและผู้บริหารตลาด โดยมีคุณสมบัติหลักคือ:
- **Interactive Floor Map**: ผังแผงตลาดจำลองแยกตามโซน แสดงสถานะสีชัดเจน (เขียว = จ่ายแล้ว, แดง = ค้างชำระ, เทา = แผงว่าง)
- **Mobile Payment & Receipt**: บันทึกการเก็บค่าเช่า + ค่าน้ำ/ไฟ/ขยะ คำนวณยอดรวมอัตโนมัติ รองรับทั้งเงินสด และการสร้าง PromptPay QR Code เพื่อให้ผู้เช่าสแกนจ่าย พร้อมออกใบเสร็จดิจิทัลส่งเข้า LINE ได้ทันที
- **Attendance Tracking**: ระบบเช็คชื่อเข้าขายประจำวันเพื่อเก็บสถิติการเปิดแผงค้า
- **Real-time Executive Dashboard**: แดชบอร์ดสรุปรายได้ประจำวันและรายงานแผงค้างชำระสำหรับผู้บริหาร

---

## User Stories

1. As a field collector, I want to view an interactive visual map of all market stalls on my mobile screen, so that I can immediately identify which stalls are paid, overdue, or vacant.
2. As a field collector, I want to filter the market map by zone (e.g., Fresh Food, Fashion, Street Food), so that I can navigate and collect rent efficiently section by section.
3. As a field collector, I want to tap on a stall icon on the map to see its details and current tenant information, so that I can confirm tenant identity before recording payment.
4. As a field collector, I want to enter variable utility costs (water, electricity, garbage fees) along with the stall fee, so that the system automatically calculates the total amount due.
5. As a field collector, I want to select 'Cash' as a payment method and record the collected amount, so that the system logs the transaction under my account for daily reconciliation.
6. As a field collector, I want to generate a PromptPay QR Code with the exact calculated total amount, so that tenants can conveniently pay via mobile banking.
7. As a field collector, I want to view and share a digital receipt after payment confirmation, so that I can send it directly to the tenant via LINE or messaging apps.
8. As a field collector, I want to mark the attendance of each stall (present/absent) during my daily rounds, so that the market maintains an accurate record of daily stall usage.
9. As a market administrator, I want to manage stall master data (stall numbers, sizes, zones, daily/monthly rates), so that rental terms are standardized across the market.
10. As a market administrator, I want to register fixed tenants (monthly contracts) and casual tenants (daily renters), so that the system handles both contract-based and pay-per-day arrangements.
11. As a market administrator, I want to view a real-time revenue dashboard showing total collected funds split by cash and QR Code, so that I have immediate visibility over daily finances.
12. As a market administrator, I want to access a report on overdue accounts and unpaid stalls, so that I can follow up on outstanding balances promptly.
13. As a market administrator, I want to analyze stall occupancy rates and attendance statistics over time, so that I can evaluate tenant reliability and optimize market floor space.

---

## Implementation Decisions

- **Architecture & Framework**: Single-repo Full-stack Web Application using Next.js (App Router) with Server Actions for direct, typed database operations.
- **UI & Mobile Optimization**: Tailwind CSS with Shadcn/ui component primitives, designed Mobile-First with touch-friendly elements, slide-over drawers for stall details, and high-contrast status colors.
- **Database Schema**: PostgreSQL managed via Prisma ORM with core models:
  - `Zone`: Market section definitions.
  - `Stall`: Stall master record (number, zone_id, daily_rate, monthly_rate, status).
  - `Vendor`: Tenant master record (name, phone, vendor_type).
  - `Contract`: Fixed tenant lease agreements.
  - `PaymentCollection`: Financial logs (stall_id, vendor_id, stall_fee, water_fee, electric_fee, garbage_fee, total_amount, payment_method, status, collector_id).
  - `AttendanceLog`: Daily presence records (stall_id, date, is_present).
- **Interactive Floor Map Component**: Rendered using dynamic CSS Grid / SVG layout responsive to mobile viewports, mapping stall coordinates to database stall records.
- **PromptPay QR Generation**: Client-side / Server-side PromptPay payload generator formatting standard EMVCo QR code strings for instant banking app scanning.

---

## Testing Decisions

- **Testing Seam Strategy**: Test external behavior at the highest seam possible (API / Server Action layer and core UI workflow integration).
- **Core Modules to Test**:
  - Payment calculation logic (Stall Fee + Water + Electricity + Garbage = Total Amount).
  - Stall status transitions upon payment completion (Unpaid -> Paid).
  - Attendance logging logic and monthly attendance percentage calculations.
  - Financial summary aggregations for the Executive Dashboard.
- **Test Characteristics**: Assert against end-to-end data states and API responses rather than internal implementation helper details.

---

## Out of Scope

- Automated bank slip auto-verification via Open Banking API (Phase 1 relies on manual collector confirmation or QR code generation).
- IoT smart utility meter integration (Meter reading is entered manually by field collectors in Phase 1).
- Multi-market tenant marketplace / Public e-commerce portal.

---

## Further Notes

- Progressive Web App (PWA) manifest and service worker configuration will be added to enable 'Add to Home Screen' functionality for field collector smartphones.
