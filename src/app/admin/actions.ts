"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);

  const startOfLast7Days = new Date(startOfDay);
  startOfLast7Days.setDate(startOfLast7Days.getDate() - 6);

  // Revenue aggregations
  const revenueAggregate = await prisma.paymentCollection.aggregate({
    where: { status: "PAID", paymentDate: { gte: startOfDay } },
    _sum: { totalAmount: true }
  });
  const totalRevenue = revenueAggregate._sum.totalAmount || 0;

  const revenueByMethod = await prisma.paymentCollection.groupBy({
    by: ['paymentMethod'],
    where: { status: "PAID", paymentDate: { gte: startOfDay } },
    _sum: { totalAmount: true }
  });
  const cashRevenue = revenueByMethod.find(r => r.paymentMethod === 'CASH')?._sum.totalAmount || 0;
  const qrRevenue = revenueByMethod.find(r => r.paymentMethod === 'QR')?._sum.totalAmount || 0;

  // Stalls stats
  const activeStallsCount = await prisma.stall.count({
    where: { contracts: { some: { status: "ACTIVE" } } }
  });

  const presentCount = await prisma.attendanceLog.count({
    where: { date: { gte: startOfDay }, isPresent: true }
  });

  // Calculate overdue by fetching minimal needed data
  const activeStalls = await prisma.stall.findMany({
    where: { contracts: { some: { status: "ACTIVE" } } },
    select: {
      id: true,
      contracts: {
        where: { status: "ACTIVE" },
        select: { vendor: { select: { vendorType: true } } },
      },
      paymentCollections: {
        where: { status: "PAID", paymentDate: { gte: startOfMonth } },
        select: { paymentDate: true },
      },
    },
  });

  let overdueCount = 0;
  activeStalls.forEach((stall) => {
    const isCasual = stall.contracts.some(c => c.vendor.vendorType === "CASUAL");
    const isFixed = stall.contracts.some(c => c.vendor.vendorType === "FIXED");
    
    const hasPaidDaily = stall.paymentCollections.some(p => new Date(p.paymentDate) >= startOfDay);
    const hasPaidMonthly = stall.paymentCollections.some(p => new Date(p.paymentDate) >= startOfMonth);

    if (isCasual && !hasPaidDaily) {
      overdueCount++;
    } else if (isFixed && !hasPaidMonthly) {
      overdueCount++;
    }
  });

  const occupancyRate = activeStallsCount > 0 ? Math.round((presentCount / activeStallsCount) * 100) : 0;

  // Historical stats
  const recentAttendance = await prisma.attendanceLog.groupBy({
    by: ['date'],
    where: {
      date: { gte: startOfLast7Days },
      isPresent: true
    },
    _count: { stallId: true },
    orderBy: { date: 'asc' }
  });

  const recentRevenue = await prisma.paymentCollection.groupBy({
    by: ['paymentDate'],
    where: {
      status: "PAID",
      paymentDate: { gte: startOfLast7Days }
    },
    _sum: { totalAmount: true },
    orderBy: { paymentDate: 'asc' }
  });

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfLast7Days);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const historicalStats = days.map(dayStr => {
    const attendanceStat = recentAttendance.find(a => a.date.toISOString().startsWith(dayStr));
    const revenueStat = recentRevenue.find(r => r.paymentDate.toISOString().startsWith(dayStr));
    return {
      date: dayStr,
      attendance: attendanceStat?._count.stallId || 0,
      revenue: revenueStat?._sum.totalAmount || 0,
    };
  }).reverse();

  return {
    totalRevenue,
    cashRevenue,
    qrRevenue,
    overdueCount,
    occupancyRate,
    presentCount,
    activeStallsCount,
    historicalStats
  };
}
