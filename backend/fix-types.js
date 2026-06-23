const prisma = require('./prismaClient');

async function main() {
  console.log("Corrigindo tipos de perguntas no banco de dados...");
  
  // Atualizar multiple-choice para MULTIPLE_CHOICE
  const res1 = await prisma.question.updateMany({
    where: {
      type: {
        in: ["multiple-choice", "multiple_choice"]
      }
    },
    data: {
      type: "MULTIPLE_CHOICE"
    }
  });
  console.log(`Atualizadas ${res1.count} perguntas de escolha múltipla.`);

  // Atualizar true-false para TRUE_FALSE
  const res2 = await prisma.question.updateMany({
    where: {
      type: {
        in: ["true-false", "true_false"]
      }
    },
    data: {
      type: "TRUE_FALSE"
    }
  });
  console.log(`Atualizadas ${res2.count} perguntas de verdadeiro/falso.`);

  // Atualizar short-answer para SHORT_ANSWER
  const res3 = await prisma.question.updateMany({
    where: {
      type: {
        in: ["short-answer", "short_answer"]
      }
    },
    data: {
      type: "SHORT_ANSWER"
    }
  });
  console.log(`Atualizadas ${res3.count} perguntas de resposta curta.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
