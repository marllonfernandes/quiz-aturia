const jwt = require('jsonwebtoken');
const prisma = require('./prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("Nenhum usuário cadastrado. Faça login na web pelo menos uma vez para criar a conta.");
    process.exit(1);
  }

  // Gera um token válido por 1 ano (365 dias)
  const token = jwt.sign(
    { id: user.id, email: user.email, role: 'user' },
    JWT_SECRET,
    { expiresIn: '365d' }
  );

  console.log("\n==================================================");
  console.log(`Token gerado para o usuário: ${user.name} (${user.email})`);
  console.log("Este token é válido por 365 dias.");
  console.log("==================================================");
  console.log(token);
  console.log("==================================================\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
