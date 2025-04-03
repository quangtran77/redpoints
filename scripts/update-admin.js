const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateAdminRole() {
  try {
    const user = await prisma.user.update({
      where: { email: 'qtran1277@gmail.com' },
      data: { role: 'ADMIN' }
    })
    console.log('Successfully updated user role to ADMIN:', user)
  } catch (error) {
    console.error('Error updating user role:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminRole() 