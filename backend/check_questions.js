const prisma = require('./prismaClient');

async function main() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: 'asc' }
  });
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    try {
      JSON.parse(q.options);
    } catch (e) {
      console.log(`Error parsing options for question ${i} (ID: ${q.id}): ${q.options}`);
    }
    
    try {
      JSON.parse(q.correctAnswer);
    } catch (e) {
      console.log(`Error parsing correctAnswer for question ${i} (ID: ${q.id}): ${q.correctAnswer}`);
    }
  }
  console.log(`Checked ${questions.length} questions.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
