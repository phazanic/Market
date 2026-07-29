# 06 — Field Collector: Daily Attendance Tracking

**What to build:** Ability to mark stall attendance (present/absent) during daily rounds directly from the floor map interface.

**Blocked by:** 03 — Field Collector: Interactive Market Floor Map

**Status:** ready-for-agent

- [ ] In the stall details drawer (from the floor map), add an "Attendance" section.
- [ ] Field collector can toggle "Present" or "Absent" for the current day.
- [ ] Saving creates or updates an `AttendanceLog` record for that stall and date.
- [ ] The floor map shows a small indicator (e.g., a checkmark icon) for stalls that have been marked as Present today.
