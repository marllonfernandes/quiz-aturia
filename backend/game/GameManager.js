const prisma = require('../prismaClient');

class GameManager {
  constructor(io) {
    this.io = io;
    // Store active rooms: { pin: { hostId, players: [], currentQuestion: null, state: 'LOBBY', questions: [] } }
    this.rooms = {};
    // Map socket id to room pin
    this.playerRooms = {};
  }

  handleConnection(socket) {
    socket.on('host_game', async ({ token, quizId } = {}) => {
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      
      try {
        let userId = null;
        let whereClause = {};

        if (token) {
          const jwt = require('jsonwebtoken');
          const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.id;
            whereClause = decoded.role === 'admin' ? {} : { userId };
            if (quizId) {
              whereClause.quizId = parseInt(quizId);
            }
          } catch(e) {
            console.error('Invalid token on host_game');
            // If they pass an invalid token, maybe fallback to no questions or reject.
            return socket.emit('error', 'Invalid token. Please log in.');
          }
        } else {
          return socket.emit('error', 'Authentication required to host a game.');
        }

        const questions = await prisma.question.findMany({ where: whereClause, orderBy: { createdAt: 'asc' } });
        
        if (!questions || questions.length === 0) {
          return socket.emit('error', 'Este quiz não possui nenhuma pergunta. Adicione perguntas antes de iniciar a sala.');
        }

        this.rooms[pin] = {
          hostId: socket.id,
          players: [],
          state: 'LOBBY',
          questions: questions,
          currentQuestionIndex: -1,
          answersCount: 0,
          questionStartTime: null
        };
        socket.join(pin);
        socket.emit('room_created', pin);
      } catch(e) {
        socket.emit('error', 'Failed to load questions from database');
      }
    });

    socket.on('join_game', ({ pin, name, animal, hat, glasses }) => {
      const room = this.rooms[pin];
      if (room && room.state === 'LOBBY') {
        const isDuplicateName = room.players.some(p => p.name.toLowerCase() === name.toLowerCase());
        if (isDuplicateName) {
          return socket.emit('join_error', 'Este nome de usuário já está em uso.');
        }

        const player = {
          id: socket.id,
          name,
          animal: animal || 'dog',
          hat: hat || 'none',
          glasses: glasses || 'none',
          score: 0,
          answeredCurrent: false
        };
        room.players.push(player);
        this.playerRooms[socket.id] = pin;
        socket.join(pin);
        
        // Notify host
        this.io.to(room.hostId).emit('player_joined', player);
        socket.emit('join_success', { pin, name });
      } else {
        socket.emit('join_error', 'Room not found or game already started');
      }
    });

    socket.on('start_game', (pin) => {
      const room = this.rooms[pin];
      if (room && room.hostId === socket.id) {
        room.state = 'PLAYING';
        this.nextQuestion(pin);
      }
    });

    socket.on('submit_answer', ({ pin, answer }) => {
      const room = this.rooms[pin];
      if (!room || room.state !== 'PLAYING') return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.answeredCurrent) return;

      player.answeredCurrent = true;
      room.answersCount++;

      const question = room.questions[room.currentQuestionIndex];
      let correctAnswers = [];
      try {
        correctAnswers = JSON.parse(question.correctAnswer);
      } catch(e) { correctAnswers = [question.correctAnswer]; }

      let isCorrect = false;
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        isCorrect = correctAnswers.includes(parseInt(answer));
      } else if (question.type === 'SHORT_ANSWER') {
        const textAnswer = (answer || '').toString().toLowerCase().trim();
        isCorrect = correctAnswers.some(ans => ans.toString().toLowerCase().trim() === textAnswer);
      }

      if (isCorrect) {
        const timeElapsed = (Date.now() - room.questionStartTime) / 1000;
        const timeLimit = question.timeLimit || 20;
        const maxPoints = question.points || 1000;
        const minPoints = Math.round(maxPoints * 0.5); // Minimum 50% points for correct answer
        
        let earnedPoints = maxPoints;
        if (timeElapsed > 1) {
          // Linear decay from maxPoints to minPoints
          const timeRatio = Math.min(1, Math.max(0, (timeLimit - timeElapsed) / timeLimit));
          earnedPoints = Math.round(minPoints + (maxPoints - minPoints) * timeRatio);
        }
        
        player.score += earnedPoints;
      }

      // If everyone answered, show results
      if (room.answersCount >= room.players.length) {
        this.showLeaderboard(pin);
      }
    });

    socket.on('next_question', (pin) => {
      const room = this.rooms[pin];
      if (room && room.hostId === socket.id) {
        this.nextQuestion(pin);
      }
    });
  }

  nextQuestion(pin) {
    const room = this.rooms[pin];
    room.currentQuestionIndex++;
    room.answersCount = 0;
    
    // Reset player answer status
    room.players.forEach(p => p.answeredCurrent = false);

    if (room.currentQuestionIndex < room.questions.length) {
      room.state = 'PLAYING';
      const question = room.questions[room.currentQuestionIndex];
      const clientQuestion = {
        id: question.id,
        text: question.text,
        type: question.type,
        options: JSON.parse(question.options),
        timeLimit: question.timeLimit,
        audioUrl: question.audioUrl,
        theme: question.theme,
        mediaUrl: question.mediaUrl,
        currentQuestionIndex: room.currentQuestionIndex,
        totalQuestions: room.questions.length
      };
      // Send full question to host
      this.io.to(room.hostId).emit('new_question', clientQuestion);
      // Send limited info to players
      this.io.to(pin).except(room.hostId).emit('new_question_player', {
        type: question.type,
        options: clientQuestion.options,
        audioUrl: question.audioUrl,
        theme: question.theme,
        currentQuestionIndex: room.currentQuestionIndex,
        totalQuestions: room.questions.length
      });

      room.questionStartTime = Date.now();
      const expectedIndex = room.currentQuestionIndex;

      // Simple timer logic
      setTimeout(() => {
        if (this.rooms[pin] && this.rooms[pin].currentQuestionIndex === expectedIndex && this.rooms[pin].state === 'PLAYING') {
          this.showLeaderboard(pin);
        }
      }, question.timeLimit * 1000);

    } else {
      room.state = 'FINISHED';
      // Sort players by score
      const leaderboard = [...room.players].sort((a, b) => b.score - a.score);
      this.io.to(pin).emit('game_over', leaderboard);
    }
  }

  showLeaderboard(pin) {
    const room = this.rooms[pin];
    if(room) {
      room.state = 'LEADERBOARD';
      const leaderboard = [...room.players].sort((a, b) => b.score - a.score);
      this.io.to(pin).emit('show_leaderboard', leaderboard);
    }
  }

  handleDisconnect(socket) {
    const pin = this.playerRooms[socket.id];
    if (pin && this.rooms[pin]) {
      const room = this.rooms[pin];
      room.players = room.players.filter(p => p.id !== socket.id);
      this.io.to(room.hostId).emit('player_left', socket.id);
      delete this.playerRooms[socket.id];
    }
  }
}

module.exports = GameManager;
