<template>
  <div class="flex flex-column justify-content-center align-items-center pt-4 pb-5 px-3"
       :style="state === 'PLAYING' && currentQuestion?.theme ? `background: url(${currentQuestion.theme}) center/cover fixed; min-height: 100vh; width: 100vw; position: absolute; top: 0; left: 0;` : 'min-height: 100vh; width: 100vw; position: absolute; top: 0; left: 0;'">
    
    <div class="w-full glass-card shadow-6 p-4 md:p-5 flex flex-column gap-4 text-center z-1"
      style="max-width: 900px;">

      <!-- STATE: SETUP -->
      <div v-if="state === 'SETUP'" class="flex flex-column align-items-center w-full">
        <h1 class="text-4xl mb-4">Escolha o Agrupador para Hospedar</h1>
        <div v-if="quizzes.length === 0" class="text-xl text-500 mb-5">Você não possui agrupadores.</div>
        <div class="w-full flex flex-column gap-3 mb-5">
          <Select v-model="selectedQuizId" :options="quizzes" optionLabel="title" optionValue="id"
            placeholder="Selecione um Agrupador (Opcional)" class="w-full" style="max-width: 400px; margin: 0 auto;" />
        </div>
        <Button label="Criar Sala" size="large" @click="createRoom" class="w-full"
          style="max-width: 300px; border-radius: 1rem;" />
      </div>

      <!-- STATE: LOBBY -->
      <div v-if="state === 'LOBBY'" class="flex flex-column align-items-center w-full">
        <h1 class="text-3xl m-0 text-center">Join with PIN:</h1>
        <h1 class="text-primary m-0 mb-4 text-center" style="font-size: 3.5rem; letter-spacing: 5px;">{{ pin }}</h1>

        <div class="mb-5">
          <Button label="Iniciar Jogo" size="large" @click="startGame" :disabled="players.length === 0" class="w-full"
            style="max-width: 300px; border-radius: 1rem;" />
        </div>

        <div class="flex flex-wrap gap-3 justify-content-center">
          <div v-for="p in players" :key="p.id"
            class="p-3 w-10rem text-center surface-100 shadow-2 flex flex-column align-items-center justify-content-center"
            style="border-radius: 1rem;">
            <div class="relative flex justify-content-center align-items-center mb-2 text-5xl">
              <span>{{ p.animal }}</span>
            </div>
            <strong class="text-lg text-overflow-ellipsis overflow-hidden white-space-nowrap w-full">{{ p.name }}</strong>
          </div>
        </div>
      </div>

      <!-- STATE: PLAYING -->
      <div v-if="state === 'PLAYING'">
        <div class="text-500 mb-3 font-bold text-xl">Pergunta {{ currentQuestionIndex + 1 }} de {{ totalQuestions }}
        </div>
        
        <!-- Media (Cover Image/Gif) -->
        <div v-if="currentQuestion?.mediaUrl" class="w-full flex justify-content-center mb-4">
          <img :src="currentQuestion.mediaUrl" alt="Media da Pergunta" class="border-round shadow-4" style="max-height: 250px; max-width: 100%; object-fit: contain;" />
        </div>

        <h1 class="text-4xl mb-5">{{ currentQuestion.text }}</h1>

        <div v-if="currentQuestion.type === 'MULTIPLE_CHOICE'" class="grid gap-2 max-w-full m-0">
          <div v-for="(opt, idx) in currentQuestion.options" :key="idx"
            :class="['col-12 md:col-6 lg:col-4 flex align-items-center justify-content-center shadow-2 p-3 font-bold', getOptionColorClass(idx)]"
            style="min-height: 80px; font-size: 1.5rem; border-radius: 1rem; word-break: break-word;">
            {{ opt }}
          </div>
        </div>

        <div v-else-if="currentQuestion.type === 'TRUE_FALSE'" class="grid gap-2 max-w-full m-0">
          <div
            class="col-12 md:col-6 bg-primary flex align-items-center justify-content-center shadow-2 text-white font-bold p-3"
            style="min-height: 80px; font-size: 2rem; border-radius: 1rem;">
            Verdadeiro
          </div>
          <div
            class="col-12 md:col-6 bg-red-500 flex align-items-center justify-content-center shadow-2 text-white font-bold p-3"
            style="min-height: 80px; font-size: 2rem; border-radius: 1rem;">
            Falso
          </div>
        </div>

        <div v-else-if="currentQuestion.type === 'SHORT_ANSWER'" class="flex justify-content-center">
          <div class="surface-100 border-round p-5 shadow-2 text-2xl max-w-full">
            Os jogadores devem digitar a resposta correta.
          </div>
        </div>

        <div class="mt-5 text-4xl text-orange-500 font-bold">
          Time left: {{ timeLeft }}s
        </div>
      </div>

      <!-- STATE: LEADERBOARD -->
      <div v-if="state === 'LEADERBOARD'" class="flex flex-column align-items-center w-full">
        <h1 class="text-4xl mb-4">Classificação (Ranking)</h1>

        <div class="w-full flex flex-column gap-2 max-w-max mb-5">
          <div v-for="(p, index) in leaderboard" :key="index"
            class="surface-100 p-3 shadow-1 flex align-items-center justify-content-between"
            style="border-radius: 1rem; min-width: 280px;">
            <div class="flex align-items-center gap-3">
              <span class="font-bold text-xl text-500">#{{ index + 1 }}</span>
              <div class="relative flex justify-content-center align-items-center text-2xl" style="width: 2rem;">
                <span>{{ p.animal }}</span>
              </div>
              <span class="text-xl font-bold">{{ p.name }}</span>
            </div>
            <span class="text-xl text-green-500 font-bold ml-4">{{ p.score }} pts</span>
          </div>
        </div>

        <Button :label="isLastQuestion ? 'Finalizar Jogo e Ver Pódio' : 'Próxima Pergunta'" size="large"
          @click="nextQuestion" class="w-full" style="max-width: 300px; border-radius: 1rem;" />
      </div>
      <!-- STATE: GAME_OVER -->
      <div v-if="state === 'GAME_OVER'" class="flex flex-column align-items-center w-full">
        <i class="pi pi-trophy text-yellow-500 mb-4" style="font-size: 5rem;"></i>
        <h1 class="text-5xl mb-5 mt-0 text-center">Fim de Jogo! Resultados Finais</h1>

        <div class="flex justify-content-center align-items-end gap-3 mb-5" style="height: 250px;">
          <!-- 2nd Place -->
          <div v-if="leaderboard[1]" class="flex flex-column align-items-center w-10rem animate-fade-in"
            style="animation-delay: 0.5s;">
            <div class="relative flex justify-content-center align-items-center mb-1 text-5xl">
              <span>{{ leaderboard[1].animal }}</span>
            </div>
            <span
              class="font-bold text-xl text-overflow-ellipsis overflow-hidden white-space-nowrap w-full text-center">{{
                leaderboard[1].name }}</span>
            <div
              class="bg-blue-300 w-full flex flex-column align-items-center justify-content-center text-white font-bold text-3xl shadow-2 border-round-top"
              style="height: 120px;">
              2º
              <span class="text-sm mt-1">{{ leaderboard[1].score }} pts</span>
            </div>
          </div>

          <!-- 1st Place -->
          <div v-if="leaderboard[0]" class="flex flex-column align-items-center w-12rem animate-fade-in"
            style="animation-delay: 1s;">
            <i class="pi pi-crown text-yellow-500 text-4xl mb-1"></i>
            <div class="relative flex justify-content-center align-items-center mb-1 text-6xl">
              <span>{{ leaderboard[0].animal }}</span>
            </div>
            <span
              class="font-bold text-2xl text-overflow-ellipsis overflow-hidden white-space-nowrap w-full text-center">{{
                leaderboard[0].name }}</span>
            <div
              class="bg-yellow-400 w-full flex flex-column align-items-center justify-content-center text-white font-bold text-4xl shadow-4 border-round-top"
              style="height: 180px;">
              1º
              <span class="text-lg mt-1">{{ leaderboard[0].score }} pts</span>
            </div>
          </div>

          <!-- 3rd Place -->
          <div v-if="leaderboard[2]" class="flex flex-column align-items-center w-10rem animate-fade-in"
            style="animation-delay: 0s;">
            <div class="relative flex justify-content-center align-items-center mb-1 text-5xl">
              <span>{{ leaderboard[2].animal }}</span>
            </div>
            <span
              class="font-bold text-xl text-overflow-ellipsis overflow-hidden white-space-nowrap w-full text-center">{{
                leaderboard[2].name }}</span>
            <div
              class="bg-orange-400 w-full flex flex-column align-items-center justify-content-center text-white font-bold text-3xl shadow-2 border-round-top"
              style="height: 90px;">
              3º
              <span class="text-sm mt-1">{{ leaderboard[2].score }} pts</span>
            </div>
          </div>
        </div>

        <div class="w-full flex flex-column gap-2 max-w-max mb-5">
          <div v-for="(p, index) in leaderboard" :key="index"
            class="surface-100 p-3 shadow-1 flex align-items-center justify-content-between"
            style="border-radius: 1rem; min-width: 280px;">
            <div class="flex align-items-center gap-3">
              <span class="font-bold text-xl text-500">#{{ index + 1 }}</span>
              <div class="relative flex justify-content-center align-items-center text-2xl" style="width: 2rem;">
                <span>{{ getAnimalEmoji(p.animal) }}</span>
                <span class="absolute" style="top: -5px; transform: scale(0.8);">{{ getHatEmoji(p.hat) }}</span>
                <span class="absolute" style="top: 10px; transform: scale(0.8);">{{ getGlassesEmoji(p.glasses) }}</span>
              </div>
              <span class="text-xl font-bold">{{ p.name }}</span>
            </div>
            <span class="text-xl text-green-500 font-bold ml-4">{{ p.score }} pts</span>
          </div>
        </div>

        <Button label="Voltar para a Home" size="large" @click="$router.push('/')" class="w-full"
          style="max-width: 300px; border-radius: 1rem;" />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { socket } from '../socket';
import axios from 'axios';

import Card from 'primevue/card';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';

const router = useRouter();
const toast = useToast();
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';
const state = ref('SETUP'); // SETUP, LOBBY, PLAYING, LEADERBOARD, GAME_OVER
const pin = ref('------');
const players = ref([]);
const currentQuestion = ref(null);
const leaderboard = ref([]);
const timeLeft = ref(0);
const quizzes = ref([]);
const selectedQuizId = ref(null);
const adminToken = ref('');
const currentQuestionIndex = ref(0);
const totalQuestions = ref(0);
let timer = null;

const currentAudio = ref(null);

const stopAudio = () => {
  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value.currentTime = 0;
    currentAudio.value = null;
  }
};

const playAudio = (url) => {
  stopAudio();
  if (url) {
    const audio = new Audio(url);
    audio.loop = true;
    audio.play().catch(e => console.error("Audio play blocked", e));
    currentAudio.value = audio;
  }
};

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === totalQuestions.value - 1;
});



const getOptionColorClass = (idx) => {
  const classes = [
    'bg-red-500 text-white',
    'bg-blue-500 text-white',
    'bg-yellow-500 text-900',
    'bg-green-500 text-white',
    'bg-purple-500 text-white',
    'bg-gray-500 text-white'
  ];
  return classes[idx % classes.length];
};

const startGame = () => {
  socket.emit('start_game', pin.value);
};

const nextQuestion = () => {
  socket.emit('next_question', pin.value);
};

const fetchQuizzes = async () => {
  try {
    const res = await axios.get(`${API_URL}/quizzes`, {
      headers: { Authorization: `Bearer ${adminToken.value}` }
    });
    quizzes.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

const createRoom = () => {
  socket.connect();
  socket.emit('host_game', { token: adminToken.value, quizId: selectedQuizId.value });
};

onMounted(() => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Você deve logar primeiro para hospedar o jogo.', life: 3000 });
    router.push('/admin');
    return;
  }
  adminToken.value = token;

  fetchQuizzes();

  socket.on('error', (msg) => {
    toast.add({ severity: 'error', summary: 'Erro', detail: msg, life: 3000 });
    router.push('/admin');
  });

  socket.on('room_created', (newPin) => {
    state.value = 'LOBBY';
    pin.value = newPin;
  });

  socket.on('player_joined', (player) => {
    players.value.push(player);
  });

  socket.on('player_left', (id) => {
    players.value = players.value.filter(p => p.id !== id);
  });

  socket.on('new_question', (q) => {
    state.value = 'PLAYING';
    currentQuestion.value = q;
    timeLeft.value = q.timeLimit;
    currentQuestionIndex.value = q.currentQuestionIndex;
    totalQuestions.value = q.totalQuestions;

    playAudio(q.audioUrl);

    clearInterval(timer);
    timer = setInterval(() => {
      if (timeLeft.value > 0) timeLeft.value--;
      else clearInterval(timer);
    }, 1000);
  });

  socket.on('show_leaderboard', (board) => {
    state.value = 'LEADERBOARD';
    leaderboard.value = board;
    clearInterval(timer);
    stopAudio();
  });

  socket.on('game_over', (board) => {
    state.value = 'GAME_OVER';
    leaderboard.value = board;
    stopAudio();
  });
});

onUnmounted(() => {
  socket.disconnect();
  clearInterval(timer);
  stopAudio();
});
</script>
