import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create report types
  const reportTypes = [
    {
      name: 'Tình trạng đường',
      description: 'Báo cáo về tình trạng đường xá, cầu cống',
      icon: 'bi-cone-striped'
    },
    {
      name: 'Vi phạm giao thông',
      description: 'Báo cáo về các hành vi vi phạm luật giao thông',
      icon: 'bi-car-front'
    },
    {
      name: 'Điểm nguy hiểm',
      description: 'Báo cáo về các điểm nguy hiểm, dễ xảy ra tai nạn',
      icon: 'bi-exclamation-triangle'
    }
  ]

  for (const type of reportTypes) {
    await prisma.reportType.upsert({
      where: { name: type.name },
      update: type,
      create: type
    })
  }

  // Update user role to ADMIN
  await prisma.user.update({
    where: { email: 'qtran1277@gmail.com' },
    data: { role: 'ADMIN' }
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 