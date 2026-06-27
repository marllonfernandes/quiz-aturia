const prisma = require('./prismaClient');

async function main() {
  const updated = await prisma.question.updateMany({
    where: { type: "multiple-choice" },
    data: { type: "MULTIPLE_CHOICE" }
  });
  console.log(`Updated ${updated.count} questions.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
