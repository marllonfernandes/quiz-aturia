const prisma = require('./prismaClient');

const questionsData = [
  // Antigo Testamento
  {
    text: "Quem construiu a arca para salvar os animais do dilúvio?",
    options: ["Moisés", "Noé", "Abraão", "Davi"],
    correctAnswer: ["Noé"]
  },
  {
    text: "Qual é o primeiro livro da Bíblia?",
    options: ["Êxodo", "Salmos", "Mateus", "Gênesis"],
    correctAnswer: ["Gênesis"]
  },
  {
    text: "Quem derrotou o gigante Golias com apenas uma pedra e uma funda?",
    options: ["Sansão", "Saul", "Davi", "Salomão"],
    correctAnswer: ["Davi"]
  },
  {
    text: "Quem foi engolido por um grande peixe após desobedecer a Deus?",
    options: ["Jonas", "Daniel", "Elias", "Noé"],
    correctAnswer: ["Jonas"]
  },
  {
    text: "Qual profeta foi jogado na cova dos leões mas não sofreu nenhum arranhão?",
    options: ["Jeremias", "Daniel", "Isaías", "Ezequiel"],
    correctAnswer: ["Daniel"]
  },
  {
    text: "Quem liderou o povo de Israel na travessia do Mar Vermelho?",
    options: ["Josué", "Moisés", "Arão", "Abraão"],
    correctAnswer: ["Moisés"]
  },
  {
    text: "Quem foi o primeiro homem criado por Deus?",
    options: ["Adão", "Abel", "Sene", "Noé"],
    correctAnswer: ["Adão"]
  },
  {
    text: "Quem foi a primeira mulher criada por Deus?",
    options: ["Sara", "Eva", "Rute", "Maria"],
    correctAnswer: ["Eva"]
  },
  {
    text: "Quem tinha uma túnica muito colorida e foi vendido por seus irmãos?",
    options: ["Benjamin", "José", "Rúben", "Levi"],
    correctAnswer: ["José"]
  },
  {
    text: "Qual homem era conhecido por ser o mais forte da Bíblia devido ao seu cabelo?",
    options: ["Sansão", "Gideão", "Davi", "Saul"],
    correctAnswer: ["Sansão"]
  },
  {
    text: "Quantos dias e noites choveu durante o dilúvio?",
    options: ["7 dias", "12 dias", "40 dias", "100 dias"],
    correctAnswer: ["40 dias"]
  },
  {
    text: "Quem foi a esposa de Adão?",
    options: ["Eva", "Sara", "Rebeca", "Lia"],
    correctAnswer: ["Eva"]
  },
  {
    text: "Qual era o nome do jardim onde Adão e Eva moravam?",
    options: ["Jardim do Éden", "Jardim do Getsêmani", "Jardim das Oliveiras", "Jardim de Jericó"],
    correctAnswer: ["Jardim do Éden"]
  },
  {
    text: "Quem era o irmão de Abel que o invejou?",
    options: ["Caim", "Sete", "Enoque", "Lameque"],
    correctAnswer: ["Caim"]
  },
  {
    text: "Deus entregou os 10 Mandamentos escritos em tábuas de pedra para quem?",
    options: ["Abraão", "Moisés", "Josué", "Elias"],
    correctAnswer: ["Moisés"]
  },
  {
    text: "Qual rei era conhecido por ser extremamente sábio?",
    options: ["Saul", "Davi", "Salomão", "Herodes"],
    correctAnswer: ["Salomão"]
  },
  {
    text: "Quem foi o pai de muitos povos e quase ofereceu seu filho Isaque a Deus?",
    options: ["Abraão", "Jacó", "José", "Ló"],
    correctAnswer: ["Abraão"]
  },
  {
    text: "Quantas pragas Deus enviou sobre o Egito?",
    options: ["3 pragas", "7 pragas", "10 pragas", "12 pragas"],
    correctAnswer: ["10 pragas"]
  },
  {
    text: "Quem foi o sucessor de Moisés que liderou o povo para a Terra Prometida?",
    options: ["Josué", "Calebe", "Gideão", "Arão"],
    correctAnswer: ["Josué"]
  },
  {
    text: "Qual muralha caiu após o povo de Israel marchar ao redor dela por 7 dias?",
    options: ["Muralha da China", "Muralha de Jericó", "Muralha de Babilônia", "Muralha de Nínive"],
    correctAnswer: ["Muralha de Jericó"]
  },
  {
    text: "Quantos filhos Jacó teve (que deram origem às tribos de Israel)?",
    options: ["3", "7", "10", "12"],
    correctAnswer: ["12"]
  },
  {
    text: "Quem foi a mulher que ajudou os espiões em Jericó?",
    options: ["Raabe", "Rute", "Noemi", "Dalila"],
    correctAnswer: ["Raabe"]
  },
  {
    text: "Qual é o livro da Bíblia que contém 150 cânticos e poemas?",
    options: ["Provérbios", "Eclesiastes", "Salmos", "Cantares"],
    correctAnswer: ["Salmos"]
  },
  {
    text: "Quem cortou o cabelo de Sansão para tirar a força dele?",
    options: ["Dalila", "Rute", "Ester", "Jezabel"],
    correctAnswer: ["Dalila"]
  },
  {
    text: "Qual rainha judia salvou o seu povo da destruição na Pérsia?",
    options: ["Ester", "Rute", "Sara", "Maria"],
    correctAnswer: ["Ester"]
  },

  // Novo Testamento
  {
    text: "Onde Jesus nasceu?",
    options: ["Nazaré", "Jerusalém", "Belém", "Roma"],
    correctAnswer: ["Belém"]
  },
  {
    text: "Quem foi a mãe terrena de Jesus?",
    options: ["Maria", "Marta", "Isabel", "Madalena"],
    correctAnswer: ["Maria"]
  },
  {
    text: "Qual era a profissão de José, o pai terreno de Jesus?",
    options: ["Pescador", "Carpinteiro", "Agricultor", "Pastor"],
    correctAnswer: ["Carpinteiro"]
  },
  {
    text: "Quantos discípulos Jesus escolheu para segui-lo mais de perto?",
    options: ["7 discípulos", "10 discípulos", "12 discípulos", "40 discípulos"],
    correctAnswer: ["12 discípulos"]
  },
  {
    text: "Quem batizou Jesus no Rio Jordão?",
    options: ["João Batista", "Pedro", "Tiago", "Paulo"],
    correctAnswer: ["João Batista"]
  },
  {
    text: "Qual milagre Jesus realizou ao alimentar mais de 5000 pessoas?",
    options: ["Transformou água em suco", "Multiplicou pães e peixes", "Fez chover maná", "Criou frutas do nada"],
    correctAnswer: ["Multiplicou pães e peixes"]
  },
  {
    text: "Quem andou sobre as águas em direção a Jesus, mas depois sentiu medo e começou a afundar?",
    options: ["João", "Pedro", "André", "Tomé"],
    correctAnswer: ["Pedro"]
  },
  {
    text: "Jesus ressuscitou depois de quantos dias de sua morte?",
    options: ["1 dia", "3 dias", "7 dias", "40 dias"],
    correctAnswer: ["3 dias"]
  },
  {
    text: "Quem traiu Jesus por 30 moedas de prata?",
    options: ["Pedro", "Judas Iscariotes", "Tomé", "Filipe"],
    correctAnswer: ["Judas Iscariotes"]
  },
  {
    text: "Qual apóstolo era conhecido por duvidar da ressurreição de Jesus até ver as feridas?",
    options: ["Tomé", "Mateus", "Lucas", "Tiago"],
    correctAnswer: ["Tomé"]
  },
  {
    text: "Qual é o último livro do Novo Testamento e de toda a Bíblia?",
    options: ["Gênesis", "Romanos", "Apocalipse", "Hebreus"],
    correctAnswer: ["Apocalipse"]
  },
  {
    text: "Quem era o melhor amigo de Jesus que foi ressuscitado por Ele após 4 dias no túmulo?",
    options: ["Lázaro", "Pedro", "João", "Zaqueu"],
    correctAnswer: ["Lázaro"]
  },
  {
    text: "Jesus nasceu em um lugar muito simples. Onde Ele foi deitado ao nascer?",
    options: ["Em uma cama de ouro", "Em uma manjedoura (cocho de animais)", "Em um berço de madeira", "Em um tapete de lã"],
    correctAnswer: ["Em uma manjedoura (cocho de animais)"]
  },
  {
    text: "Quem era o homem baixinho que subiu em uma árvore para conseguir ver Jesus passar?",
    options: ["Zaqueu", "Nicodemos", "Bartimeu", "Lázaro"],
    correctAnswer: ["Zaqueu"]
  },
  {
    text: "Qual foi o primeiro milagre conhecido de Jesus?",
    options: ["Cura de um cego", "Transformação de água em vinho", "Multiplicação de peixes", "Caminhar sobre as águas"],
    correctAnswer: ["Transformação de água em vinho"]
  },
  {
    text: "Na parábola do Filho Pródigo, o que o pai fez quando o filho voltou para casa?",
    options: ["Ficou bravo", "Fez uma grande festa", "Mandou ele embora", "Deixou ele trabalhando no campo"],
    correctAnswer: ["Fez uma grande festa"]
  },
  {
    text: "Qual era a profissão de Pedro antes de seguir Jesus?",
    options: ["Cobrador de impostos", "Pescador", "Médico", "Soldado"],
    correctAnswer: ["Pescador"]
  },
  {
    text: "Qual era a profissão de Mateus antes de ser discípulo?",
    options: ["Pescador", "Cobrador de impostos", "Carpinteiro", "Tenda de couro"],
    correctAnswer: ["Cobrador de impostos"]
  },
  {
    text: "Quem escreveu muitas cartas no Novo Testamento e antes se chamava Saulo?",
    options: ["Pedro", "João", "Paulo", "Estêvão"],
    correctAnswer: ["Paulo"]
  },
  {
    text: "Qual discípulo era conhecido como o 'discípulo amado'?",
    options: ["João", "Pedro", "André", "Tiago"],
    correctAnswer: ["João"]
  },
  {
    text: "Qual é o menor versículo ou tema principal que Jesus nos ensinou sobre a lei?",
    options: ["Amai-vos uns aos outros", "Não julgueis", "Orai sem cessar", "Buscai primeiro o Reino"],
    correctAnswer: ["Amai-vos uns aos outros"]
  },
  {
    text: "Como Jesus nos ensinou a falar com Deus na oração modelo?",
    options: ["Pai Nosso", "Credo", "Ave Maria", "Salmo 23"],
    correctAnswer: ["Pai Nosso"]
  },
  {
    text: "Quem era a mulher que ficou sentada aos pés de Jesus ouvindo seus ensinamentos, enquanto sua irmã Marta trabalhava?",
    options: ["Maria", "Isabel", "Madalena", "Salomé"],
    correctAnswer: ["Maria"]
  },
  {
    text: "Qual seguidor de Jesus correu na frente no domingo de manhã para ver o túmulo vazio?",
    options: ["João", "Pedro", "Tomé", "Judas"],
    correctAnswer: ["João"]
  },
  {
    text: "No dia de Pentecostes, o que desceu sobre os discípulos reunidos?",
    options: ["Uma nuvem de chuva", "O Espírito Santo (como línguas de fogo)", "Um anjo do céu", "Um vento suave"],
    correctAnswer: ["O Espírito Santo (como línguas de fogo)"]
  }
];

async function main() {
  // Achar o primeiro usuário
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("Nenhum usuário cadastrado no banco. Por favor, faça login no Admin uma vez primeiro!");
    process.exit(1);
  }

  console.log(`Criando quiz para o usuário: ${user.name} (${user.email})`);

  // Criar o agrupador
  const quiz = await prisma.quiz.create({
    data: {
      title: "Histórias da Bíblia (Família & Kids)",
      userId: user.id
    }
  });

  console.log(`Quiz criado com ID: ${quiz.id}`);

  // Criar as perguntas
  for (const q of questionsData) {
    await prisma.question.create({
      data: {
        text: q.text,
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify(q.options),
        correctAnswer: JSON.stringify(q.correctAnswer),
        timeLimit: 20, // tempo acessível para crianças lerem
        points: 1000,
        userId: user.id,
        quizId: quiz.id
      }
    });
  }

  console.log(`Sucesso! 50 perguntas foram associadas ao quiz ID ${quiz.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
