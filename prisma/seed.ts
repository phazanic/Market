import { PrismaClient } from '../src/generated/prisma/client'

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // 1. Create Zones
  const foodZone = await prisma.zone.create({
    data: { name: 'Food Zone', description: 'Fresh food and ingredients' }
  })
  const fashionZone = await prisma.zone.create({
    data: { name: 'Fashion Zone', description: 'Clothes and accessories' }
  })

  // 2. Create Vendors
  const vendor1 = await prisma.vendor.create({
    data: { name: 'Somsri', phone: '0812345678', vendorType: 'FIXED' }
  })
  const vendor2 = await prisma.vendor.create({
    data: { name: 'Mana', phone: '0898765432', vendorType: 'FIXED' }
  })
  const vendor3 = await prisma.vendor.create({
    data: { name: 'Piti', phone: '0855555555', vendorType: 'CASUAL' }
  })

  // 3. Create Stalls
  const stall1 = await prisma.stall.create({
    data: { stallNumber: 'F01', zoneId: foodZone.id, dailyRate: 100, monthlyRate: 3000, status: 'OCCUPIED' }
  })
  const stall2 = await prisma.stall.create({
    data: { stallNumber: 'F02', zoneId: foodZone.id, dailyRate: 100, monthlyRate: 3000, status: 'OCCUPIED' }
  })
  const stall3 = await prisma.stall.create({
    data: { stallNumber: 'F03', zoneId: foodZone.id, dailyRate: 100, monthlyRate: 3000, status: 'AVAILABLE' }
  })
  const stall4 = await prisma.stall.create({
    data: { stallNumber: 'C01', zoneId: fashionZone.id, dailyRate: 150, monthlyRate: 4000, status: 'OCCUPIED' }
  })
  const stall5 = await prisma.stall.create({
    data: { stallNumber: 'C02', zoneId: fashionZone.id, dailyRate: 150, monthlyRate: 4000, status: 'AVAILABLE' }
  })

  // 4. Create Contracts for FIXED vendors
  await prisma.contract.create({
    data: { vendorId: vendor1.id, stallId: stall1.id, startDate: new Date('2024-01-01'), status: 'ACTIVE' }
  })
  await prisma.contract.create({
    data: { vendorId: vendor2.id, stallId: stall4.id, startDate: new Date('2024-01-01'), status: 'ACTIVE' }
  })

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
