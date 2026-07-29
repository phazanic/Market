import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const fashionZone = await prisma.zone.findFirst({
    where: { name: 'Fashion Zone' }
  })

  if (!fashionZone) {
    console.log('Fashion Zone not found')
    return
  }

  // Create Stall C03
  const stall3 = await prisma.stall.create({
    data: { 
      stallNumber: 'C03', 
      zoneId: fashionZone.id, 
      dailyRate: 150, 
      monthlyRate: 4000, 
      status: 'OCCUPIED' 
    }
  })

  // Create a new vendor for it
  const vendor = await prisma.vendor.create({
    data: { name: 'Somchai (New)', phone: '0811112222', vendorType: 'CASUAL' }
  })

  // Create active contract
  await prisma.contract.create({
    data: { 
      vendorId: vendor.id, 
      stallId: stall3.id, 
      startDate: new Date(), 
      status: 'ACTIVE' 
    }
  })

  console.log('Successfully created Stall C03 (Unpaid)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
