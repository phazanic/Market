import { PrismaClient } from '../generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const USE_MOCK_UI = process.env.USE_MOCK_UI === 'true'

let prisma: PrismaClient

if (USE_MOCK_UI) {
  console.log("Mock UI Mode Enabled: Bypassing Prisma Database")
  
  const dummyDate = new Date()
  
  const mockZones = [
    { id: "z1", name: "โซนอาหาร (A)", description: "อาหารคาว", createdAt: dummyDate, updatedAt: dummyDate, stalls: [] },
    { id: "z2", name: "โซนเสื้อผ้า (B)", description: "เสื้อผ้าแฟชั่น", createdAt: dummyDate, updatedAt: dummyDate, stalls: [] }
  ]

  const dummyVendor1 = { id: "v1", name: "ร้านป้าแจ่ม", phone: "0812345678", vendorType: "FIXED", createdAt: dummyDate, updatedAt: dummyDate }
  const dummyVendor2 = { id: "v2", name: "ร้านลุงหมาย", phone: "0898765432", vendorType: "CASUAL", createdAt: dummyDate, updatedAt: dummyDate }
  const dummyContract1 = { id: "c1", vendorId: "v1", vendor: dummyVendor1, stallId: "s1", startDate: dummyDate, endDate: null, status: "ACTIVE", createdAt: dummyDate, updatedAt: dummyDate }
  const dummyContract2 = { id: "c2", vendorId: "v2", vendor: dummyVendor2, stallId: "s3", startDate: dummyDate, endDate: null, status: "ACTIVE", createdAt: dummyDate, updatedAt: dummyDate }

  const mockStalls = [
    { id: "s1", stallNumber: "A-01", zoneId: "z1", dailyRate: 100, monthlyRate: 3000, status: "OCCUPIED", createdAt: dummyDate, updatedAt: dummyDate, contracts: [dummyContract1], paymentCollections: [], attendanceLogs: [], zone: mockZones[0] },
    { id: "s2", stallNumber: "A-02", zoneId: "z1", dailyRate: 100, monthlyRate: 3000, status: "AVAILABLE", createdAt: dummyDate, updatedAt: dummyDate, contracts: [], paymentCollections: [], attendanceLogs: [], zone: mockZones[0] },
    { id: "s3", stallNumber: "B-01", zoneId: "z2", dailyRate: 150, monthlyRate: 4000, status: "OCCUPIED", createdAt: dummyDate, updatedAt: dummyDate, contracts: [dummyContract2], paymentCollections: [], attendanceLogs: [], zone: mockZones[1] },
  ]
  
  mockZones[0].stalls = mockStalls.filter(s => s.zoneId === 'z1') as any
  mockZones[1].stalls = mockStalls.filter(s => s.zoneId === 'z2') as any

  prisma = {
    zone: {
      findMany: async () => mockZones,
      create: async () => ({}),
      update: async () => ({}),
    },
    stall: {
      findMany: async () => mockStalls,
      create: async () => ({}),
      update: async () => ({}),
    },
    vendor: {
      findMany: async () => [],
      create: async () => ({}),
      update: async () => ({}),
    },
    contract: {
      findMany: async () => [],
      create: async () => ({}),
      update: async () => ({}),
    },
    paymentCollection: {
      findMany: async () => [],
      groupBy: async () => [],
      create: async () => ({}),
      update: async () => ({}),
    },
    attendanceLog: {
      findMany: async () => [],
      groupBy: async () => [],
      create: async () => ({}),
      update: async () => ({}),
      upsert: async () => ({}),
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

  prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter } as any)

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
}

export { prisma }
