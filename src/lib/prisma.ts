import { PrismaClient } from '../generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const USE_MOCK_UI = process.env.USE_MOCK_UI === 'true'

let prisma: PrismaClient

if (USE_MOCK_UI) {
  console.log("Mock UI Mode Enabled: Bypassing Prisma Database")
  
  const dummyDate = new Date()
  
  // Create a fake Prisma client that returns mock data
  const mockStalls = [
    { id: "s1", stallNumber: "A-01", zoneId: "z1", dailyRate: 100, monthlyRate: 3000, status: "OCCUPIED", createdAt: dummyDate, updatedAt: dummyDate, contracts: [{ id: "c1", vendor: { name: "ร้านป้าแจ่ม" }, startDate: dummyDate }], paymentCollections: [], attendanceLogs: [] },
    { id: "s2", stallNumber: "A-02", zoneId: "z1", dailyRate: 100, monthlyRate: 3000, status: "AVAILABLE", createdAt: dummyDate, updatedAt: dummyDate, contracts: [], paymentCollections: [], attendanceLogs: [] },
    { id: "s3", stallNumber: "B-01", zoneId: "z2", dailyRate: 150, monthlyRate: 4000, status: "OCCUPIED", createdAt: dummyDate, updatedAt: dummyDate, contracts: [{ id: "c2", vendor: { name: "ร้านลุงหมาย" }, startDate: dummyDate }], paymentCollections: [], attendanceLogs: [] },
  ]
  
  const mockZones = [
    { id: "z1", name: "โซนอาหาร (A)", description: "อาหารคาว", createdAt: dummyDate, updatedAt: dummyDate, stalls: mockStalls.filter(s => s.zoneId === 'z1') },
    { id: "z2", name: "โซนเสื้อผ้า (B)", description: "เสื้อผ้าแฟชั่น", createdAt: dummyDate, updatedAt: dummyDate, stalls: mockStalls.filter(s => s.zoneId === 'z2') }
  ]

  prisma = {
    zone: {
      findMany: async () => mockZones,
    },
    stall: {
      findMany: async () => mockStalls,
    },
    vendor: {
      findMany: async () => [],
    },
    contract: {
      findMany: async () => [],
    },
    paymentCollection: {
      findMany: async () => [],
    },
    attendanceLog: {
      findMany: async () => [],
    },
    $transaction: async (fn: any) => fn(prisma),
    $connect: async () => {},
    $disconnect: async () => {},
  } as unknown as PrismaClient
} else {
  // Standard SQLite initialization
  let adapter: any;
  try {
    adapter = new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? 'file:./dev.db',
    })
  } catch (e) {
    console.error("Failed to initialize SQLite adapter:", e);
  }

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }

  prisma = globalForPrisma.prisma ?? new PrismaClient(adapter ? { adapter } : undefined)

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
}

export { prisma }
