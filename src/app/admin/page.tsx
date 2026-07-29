import { prisma } from "@/lib/prisma";
import { DollarSign, Percent, Store, TrendingUp, QrCode, Banknote } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayPayments = await prisma.paymentCollection.findMany({
    where: {
      status: "PAID",
      paymentDate: {
        gte: startOfDay,
      },
    },
  });

  const totalRevenue = todayPayments.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const cashRevenue = todayPayments
    .filter((p) => p.paymentMethod === "CASH")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);
  const qrRevenue = todayPayments
    .filter((p) => p.paymentMethod === "QR")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const allStalls = await prisma.stall.findMany({
    include: {
      contracts: {
        where: {
          status: "ACTIVE",
        },
      },
      paymentCollections: {
        where: {
          status: "PAID",
          paymentDate: {
            gte: startOfDay,
          },
        },
      },
      attendanceLogs: {
        where: {
          date: {
            gte: startOfDay,
          },
        },
      },
    },
  });

  let overdueCount = 0;
  let presentCount = 0;
  const totalStalls = allStalls.length;

  allStalls.forEach((stall) => {
    const hasActiveContract = stall.contracts.length > 0;
    const hasPaidToday = stall.paymentCollections.length > 0;
    const isPresentToday = stall.attendanceLogs.some((log) => log.isPresent);

    if (hasActiveContract && !hasPaidToday) {
      overdueCount++;
    }

    if (isPresentToday) {
      presentCount++;
    }
  });

  const occupancyRate = totalStalls > 0 ? Math.round((presentCount / totalStalls) * 100) : 0;

  return (
    <div className="space-y-6">
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
              {presentCount} of {totalStalls} stalls present today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
