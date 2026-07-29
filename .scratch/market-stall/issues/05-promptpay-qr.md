# 05 — Field Collector: PromptPay QR Code Generation & Digital Receipt

**What to build:** Adds a "Pay via QR" option to generate a PromptPay QR code for the calculated total, and displays a digital receipt after payment confirmation that can be shared via LINE.

**Blocked by:** 04 — Field Collector: Payment Collection & Cash Recording

**Status:** ready-for-agent

- [ ] In the payment form, add a "Generate QR Code" button alongside "Cash".
- [ ] Upon clicking, the system generates a standard PromptPay QR code payload (EMVCo) using the market's registered PromptPay ID and the calculated Total Amount.
- [ ] A QR code image/canvas is displayed to the user for scanning.
- [ ] After confirming QR payment, a Digital Receipt view is shown.
- [ ] The Digital Receipt includes a "Share" or "Save Image" button to easily send to LINE.
