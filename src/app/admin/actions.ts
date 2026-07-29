"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);

  const startOfLast7Days = new Date(startOfDay);
  startOfLast7Days.setDate(startOfLast7Days.getDate() - 6);

  const todayPayments = await prisma.paymentCollection.findMany({
    where: {
      status: "PAID",
      paymentDate: { gte: startOfDay },
    },
  });

  const { totalRevenue, cashRevenue, qrRevenue } = todayPayments.reduce(
    (acc, curr) => {
      acc.totalRevenue += curr.totalAmount;
      if (curr.paymentMethod === "CASH") acc.cashRevenue += curr.totalAmount;
      if (curr.paymentMethod === "QR") acc.qrRevenue += curr.totalAmount;
      return acc;
    },
    { totalRevenue: 0, cashRevenue: 0, qrRevenue: 0 }
  );

  const allStalls = await prisma.stall.findMany({
    include: {
      contracts: {
        where: { status: "ACTIVE" },
        include: { vendor: true },
      },
      paymentCollections: {
        where: { status: "PAID", paymentDate: { gte: startOfMonth } },
      },
      attendanceLogs: {
        where: { date: { gte: startOfDay } },
      },
    },
  });

  let overdueCount = 0;
  let presentCount = 0;
  let activeStallsCount = 0;

  allStalls.forEach((stall) => {
    const activeContracts = stall.contracts;
    const hasActiveContract = activeContracts.length > 0;
    
    if (hasActiveContract) {
      activeStallsCount++;
      
      const isCasual = activeContracts.some(c => c.vendor.vendorType === "CASUAL");
      const isFixed = activeContracts.some(c => c.vendor.vendorType === "FIXED");
      
      const hasPaidDaily = stall.paymentCollections.some(p => new Date(p.paymentDate) >= startOfDay);
      const hasPaidMonthly = stall.paymentCollections.some(p => new Date(p.paymentDate) >= startOfMonth);

      if (isCasual && !hasPaidDaily) {
        overdueCount++;
      } else if (isFixed && !hasPaidMonthly) {
        overdueCount++;
      }

      if (stall.attendanceLogs.some((log) => log.isPresent)) {
        presentCount++;
      }
    }
  });

  const occupancyRate = activeStallsCount > 0 ? Math.round((presentCount / activeStallsCount) * 100) : 0;

  const recentAttendance = await prisma.attendanceLog.groupBy({
    by: ['date'],
    where: {
      date: { gte: startOfLast7Days },
      isPresent: true
    },
    _count: {
      stallId: true
    },
    orderBy: {
      date: 'asc'
    }
  });

  const recentRevenue = await prisma.paymentCollection.groupBy({
    by: ['paymentDate'],
    where: {
      status: "PAID",
      paymentDate: { gte: startOfLast7Days }
    },
    _sum: {
      totalAmount: true
    },
    orderBy: {
      paymentDate: 'asc'
    }
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
