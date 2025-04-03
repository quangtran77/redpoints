import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Xóa dữ liệu cũ
  await prisma.reportType.deleteMany()

  // Thêm các loại báo cáo mẫu
  const reportTypes = [
    {
      name: 'Tình trạng đường',
      description: 'Báo cáo về các vấn đề liên quan đến tình trạng đường như ổ gà, nứt mặt đường, ngập nước...',
      icon: '🚧'
    },
    {
      name: 'Vi phạm giao thông',
      description: 'Báo cáo các hành vi vi phạm luật giao thông như vượt đèn đỏ, đi ngược chiều, đậu xe sai quy định...',
      icon: '🚫'
    },
    {
      name: 'Điểm đen tai nạn',
      description: 'Báo cáo các vị trí thường xuyên xảy ra tai nạn hoặc có nguy cơ cao gây tai nạn',
      icon: '⚠️'
    },
    {
      name: 'Chốt CSGT',
      description: 'Thông báo về vị trí có chốt kiểm tra của cảnh sát giao thông',
      icon: '👮'
    },
    {
      name: 'Khác',
      description: 'Các vấn đề khác liên quan đến giao thông',
      icon: '📌'
    }
  ]

  for (const type of reportTypes) {
    await prisma.reportType.create({
      data: type
    })
  }

  console.log('Đã thêm dữ liệu mẫu cho các loại báo cáo')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 