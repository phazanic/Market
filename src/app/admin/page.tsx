import { prisma } from "@/lib/prisma";
import { DollarSign, Percent, Store, TrendingUp, QrCode, Banknote, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);

  const startOfLast7Days = new Date(startOfDay);
  startOfLast7Days.setDate(startOfLast7Days.getDate() - 6);

  // 1. Revenue Calculation (Refactored to reduce duplication)
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

  // 2. Overdue & Occupancy Logic (Checking contracts correctly)
  const allStalls = await prisma.stall.findMany({
    include: {
      contracts: {
        where: { status: "ACTIVE" },
        include: { vendor: true },
      },
      paymentCollections: {
        where: { status: "PAID", paymentDate: { gte: startOfMonth } }, // Fetch monthly for Fixed check
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

      // Overdue logic depending on vendor type
      if (isCasual && !hasPaidDaily) {
        overdueCount++;
      } else if (isFixed && !hasPaidMonthly) {
        overdueCount++;
      }

      // Occupancy check
      if (stall.attendanceLogs.some((log) => log.isPresent)) {
        presentCount++;
      }
    }
  });

  const occupancyRate = activeStallsCount > 0 ? Math.round((presentCount / activeStallsCount) * 100) : 0;

  // 3. Historical Data (over time)
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

  // Map to stable dates
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Dashboard</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Overview of today's market performance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Revenue</h3>
            <DollarSign className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-neutral-900 dark:text-white">
              ฿{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Collected today</p>
          </div>
        </div>

        {/* Cash vs QR */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Payment Methods</h3>
            <TrendingUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <Banknote className="h-4 w-4 text-emerald-500" /> Cash
              </div>
              <span className="font-semibold text-neutral-900 dark:text-white">
                ฿{cashRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <QrCode className="h-4 w-4 text-blue-500" /> QR Code
              </div>
              <span className="font-semibold text-neutral-900 dark:text-white">
                ฿{qrRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Overdue Stalls */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Overdue Stalls</h3>
            <Store className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {overdueCount}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Unpaid for current cycle</p>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Occupancy Rate</h3>
            <Percent className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {occupancyRate}%
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {presentCount} of {activeStallsCount} active stalls present
            </p>
          </div>
        </div>
      </div>

      {/* Historical Statistics Over Time */}
      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5" /> 7-Day Overview
        </h2>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Date</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Stalls Present</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Revenue (฿)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {historicalStats.map((stat) => (
                  <tr key={stat.date} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                      {new Date(stat.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-neutral-600 dark:text-neutral-300">
                      {stat.attendance}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {stat.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
