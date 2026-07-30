"use client";

import { useState, useEffect } from "react";
import { DollarSign, Percent, Store, TrendingUp, QrCode, Banknote, CalendarDays } from "lucide-react";
import { getDashboardStats } from "./actions";

type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

export function DashboardClient({ initialData }: { initialData: DashboardStats }) {
  const [stats, setStats] = useState<DashboardStats>(initialData);

  useEffect(() => {
    // Poll every 60 seconds silently
    const interval = setInterval(async () => {
      try {
        const newData = await getDashboardStats();
        setStats(newData);
      } catch (error) {
        console.error("Failed to fetch dashboard updates", error);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">แดชบอร์ด</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          ภาพรวมผลประกอบการของตลาดในวันนี้
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">รายได้รวม</h3>
            <DollarSign className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-neutral-900 dark:text-white">
              ฿{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">ยอดเก็บวันนี้</p>
          </div>
        </div>

        {/* Cash vs QR */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">ช่องทางชำระเงิน</h3>
            <TrendingUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <Banknote className="h-4 w-4 text-emerald-500" /> เงินสด
              </div>
              <span className="font-semibold text-neutral-900 dark:text-white">
                ฿{stats.cashRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <QrCode className="h-4 w-4 text-blue-500" /> สแกนจ่าย
              </div>
              <span className="font-semibold text-neutral-900 dark:text-white">
                ฿{stats.qrRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Overdue Stalls */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">ค้างชำระ</h3>
            <Store className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.overdueCount}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">แผงที่ยังไม่จ่ายเงิน</p>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">อัตราการเช่าพื้นที่</h3>
            <Percent className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.occupancyRate}%
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              เข้าใช้งาน {stats.presentCount} จากทั้งหมด {stats.activeStallsCount} แผง
            </p>
          </div>
        </div>
      </div>

      {/* Historical Statistics Over Time */}
      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5" /> ภาพรวมย้อนหลัง 7 วัน
        </h2>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">วันที่</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">จำนวนแผงที่มา</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">รายได้ (฿)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {stats.historicalStats.map((stat) => (
                  <tr key={stat.date} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                      {new Date(stat.date).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
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
