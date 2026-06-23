# GameAturiá 🦁🎮

Um jogo online multiplayer de perguntas e respostas, desenvolvido com Node.js, Vue 3, Socket.IO e Supabase.

## 🚀 Como iniciar o projeto pela primeira vez

Para rodar este projeto na sua máquina, siga o passo a passo abaixo:

### 1. Configurar o Banco de Dados
Este projeto usa o **Supabase** (PostgreSQL) e o **Prisma ORM**.

> [!WARNING]
> **Atenção:** Nunca envie o arquivo `.env` ou credenciais reais para o repositório git. O arquivo `.env` já está configurado no `.gitignore` para sua segurança.

1. Na pasta `backend`, crie ou edite o arquivo `.env` com a sua string de conexão:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```
2. Substitua `[YOUR-PASSWORD]` pela senha real do banco de dados do Supabase e `[YOUR-PROJECT-REF]` pelo ID do seu projeto.

### 2. Sincronizar o Banco de Dados
Ainda na pasta `backend`, execute o comando abaixo para criar a tabela de "Perguntas" (Questions) no seu banco de dados do Supabase:
```bash
npx prisma db push
```

### 3. Iniciar o Jogo
O jogo está configurado com um **Makefile** na raiz do projeto para facilitar tudo.

Na raiz do repositório (pasta `game`), simplesmente execute:
```bash
make install
make build
make start
```
*Dica: Se quiser iniciar em modo de desenvolvimento (reiniciando a cada alteração no backend), use `npm run dev`.*

---

## 🕹️ Como Jogar

Com o servidor rodando, abra o seu navegador nas seguintes rotas:

### 1. Painel de Administração (Cadastro de Perguntas)
- **Acesse**: `http://localhost:3000/admin` ou `http://<SEU-IP-LOCAL>:3000/admin`
- **Autenticação**: O login é feito via Google Auth.
- **Agrupadores (Quizzes)**: Crie pastas/agrupadores para as suas perguntas (ex: "História", "Filmes").
- Cadastre as perguntas diretamente dentro do seu agrupador. Defina o tipo de pergunta, opções, reposta correta e um tempo limite customizado.

### 2. Tela do Host (Quem vai apresentar o jogo)
- **Acesse**: `http://localhost:3000/host` ou `http://<SEU-IP-LOCAL>:3000/host`
- Você selecionará um **Agrupador (Quiz)** para iniciar o jogo.
- Uma sala será criada e um **PIN de 6 dígitos** aparecerá na tela.
- Espere os jogadores entrarem e clique em **Start Game**. No final do jogo, a tela exibirá um **Pódio Interativo** com os vencedores.

### 3. Tela dos Jogadores (Pelo celular)
- **Acesse**: `http://<SEU-IP-LOCAL>:3000/` (exemplo: `http://192.168.15.2:3000`)
- Toda a interface foi pensada de forma responsiva (*Mobile-First*).
- Insira o **PIN** e personalize seu avatar.
- Responda rápido! A **pontuação decai com o tempo**. Quem responder no 1º segundo ganha os pontos máximos, e após isso os pontos vão caindo linearmente.

---

## 📚 Documentação da API (Swagger)

A API backend possui rotas documentadas através do Swagger.
- **Acesse**: `http://localhost:3000/api-docs` (quando estiver rodando o projeto)
- Você pode consultar os endpoints de `Auth`, `Questions` e `Quizzes`.

---

## ☁️ Deploy no Google Cloud Run

Existe um comando pronto no `Makefile` para realizar o deploy direto para o Google Cloud Run GCP.
O deploy vai criar a imagem a partir do código contido na pasta `/backend` (onde o frontend fica embutido na pasta public após um `make build`).

Para fazer o deploy, basta rodar na raiz do projeto:
```bash
make deploy
```
*(Certifique-se de que o gcloud CLI está configurado e que você tem permissão no seu projeto do GCP)*


---

## 🛠️ Tecnologias Utilizadas
- **Backend**: Node.js, Express
- **Tempo Real**: Socket.IO
- **Banco de Dados**: Supabase (PostgreSQL), Prisma ORM
- **Segurança**: JWT (JSON Web Tokens)
- **Frontend**: Vue 3, Vite, PrimeVue (Design Mobile-First moderno)
