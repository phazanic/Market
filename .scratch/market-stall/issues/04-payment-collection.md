# 04 — Field Collector: Payment Collection & Cash Recording

**What to build:** A form (accessed via the floor map) to input utility costs (water, electricity, garbage) which calculates the total amount due based on the stall's rate, and allows saving a 'Cash' payment collection record.

**Blocked by:** 03 — Field Collector: Interactive Market Floor Map

**Status:** ready-for-agent

- [ ] Field collector can tap a button on the stall details drawer to "Collect Payment".
- [ ] A form appears allowing input of water, electricity, and garbage fees.
- [ ] The system automatically calculates the Total Amount (Stall Fee + Utility Fees).
- [ ] User can select "Cash" as payment method and confirm.
- [ ] A new `PaymentCollection` record is saved to the database.
- [ ] The stall's color on the map updates to Green (Paid).
