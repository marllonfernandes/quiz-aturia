<template>
  <div class="flex flex-column align-items-center pt-5 px-3">
    <!-- <div class="w-full mb-3 px-3" style="max-width: 30rem;">
      <Button icon="pi pi-home" label="Voltar para Home" class="p-button-text" @click="$router.push('/')"
        v-if="state === 'LOBBY'" />
    </div> -->
    <div class="w-full max-w-30rem p-4 glass-card text-center">

      <!-- STATE: JOIN/LOBBY -->
      <div v-if="state === 'LOBBY'" class="w-full surface-card shadow-6 p-4 flex flex-column gap-4"
        style="border-radius: 1.5rem;">
        <h2 class="m-0 text-center text-3xl">Customize seu Avatar</h2>

        <InputText v-model="playerName" placeholder="Apelido" class="w-full text-center text-2xl font-bold p-3"
          style="border-radius: 1rem;" />

        <!-- Avatar Preview and Selection -->
        <div class="flex flex-column align-items-center relative gap-2 mb-3">
          <label class="block text-500 text-sm font-bold uppercase text-center">Escolha seu Avatar</label>
          <div class="relative flex justify-content-center align-items-center cursor-pointer" @click="showPicker = !showPicker">
            <div class="surface-100 border-circle flex align-items-center justify-content-center hover:surface-200 transition-colors" style="width: 130px; height: 130px; box-shadow: inset 0 0 10px rgba(0,0,0,0.1);">
               <span style="font-size: 5rem;">{{ animal }}</span>
            </div>
            <div class="absolute bottom-0 right-0 bg-primary border-circle flex align-items-center justify-content-center shadow-2" style="width: 40px; height: 40px; transform: translate(10%, 10%);">
               <i class="pi pi-pencil text-white text-xl"></i>
            </div>
          </div>
          
          <div v-show="showPicker" class="absolute z-5 shadow-6" style="top: 100%; margin-top: 1rem; border-radius: 1rem; overflow: hidden;">
            <emoji-picker @emoji-click="onEmojiSelect" class="light"></emoji-picker>
          </div>
        </div>

        <Button label="Entrar no Jogo" size="large" @click="joinRoom" :disabled="!playerName"
          class="w-full font-bold p-3 text-xl shadow-2" style="border-radius: 1rem;" />
      </div>

      <!-- STATE: WAITING -->
      <div v-if="state === 'WAITING'"
        class="w-full surface-card shadow-6 p-5 text-center flex flex-column align-items-center gap-4"
        style="border-radius: 1.5rem;">
        <i class="pi pi-check-circle text-green-500" style="font-size: 5rem;"></i>
        <h2 class="m-0 text-4xl">Você entrou!</h2>
        <p class="text-500 text-xl m-0">Aguardando o host iniciar a partida...</p>
      </div>

      <!-- STATE: PLAYING -->
      <div v-if="state === 'PLAYING'" class="w-full surface-card shadow-6 p-4 text-center flex flex-column gap-4"
        style="border-radius: 1.5rem;">
        <div class="text-500 font-bold text-lg">Pergunta {{ currentQuestionIndex + 1 }} de {{ totalQuestions }}</div>
        <h2 class="m-0 text-3xl">Selecione a resposta!</h2>

        <div v-if="!hasAnswered" class="flex flex-column gap-3">

          <!-- MULTIPLE CHOICE -->
          <div v-if="questionType === 'MULTIPLE_CHOICE'" class="grid gap-3 m-0">
            <div v-for="(opt, idx) in options" :key="idx" class="col-12 md:col-6 p-0">
              <Button @click="submitAnswer(idx)" :label="opt" :severity="getOptionSeverity(idx)"
                class="w-full h-8rem text-3xl font-bold shadow-2" style="border-radius: 1rem;" />
            </div>
          </div>

          <!-- TRUE FALSE -->
          <div v-if="questionType === 'TRUE_FALSE'" class="flex flex-column gap-3">
            <Button @click="submitAnswer(0)" label="Verdadeiro" class="w-full h-8rem text-4xl font-bold shadow-2"
              style="border-radius: 1rem;" />
            <Button @click="submitAnswer(1)" label="Falso" severity="danger"
              class="w-full h-8rem text-4xl font-bold shadow-2" style="border-radius: 1rem;" />
          </div>

          <!-- SHORT ANSWER -->
          <div v-if="questionType === 'SHORT_ANSWER'" class="flex flex-column gap-4 py-3">
            <InputText v-model="shortAnswerInput" placeholder="Digite aqui..."
              class="w-full text-center text-3xl p-4 font-bold" style="border-radius: 1rem;" />
            <Button @click="submitAnswer(shortAnswerInput)" label="Enviar Resposta"
              class="w-full p-4 text-2xl font-bold shadow-2" style="border-radius: 1rem;"
              :disabled="!shortAnswerInput" />
          </div>

        </div>

        <div v-else class="py-6 flex flex-column align-items-center gap-4">
          <i class="pi pi-spin pi-spinner text-primary" style="font-size: 5rem;"></i>
          <h2 class="m-0 text-3xl">Resposta enviada!</h2>
          <p class="text-500 text-xl m-0">Aguardando os outros jogadores...</p>
        </div>
      </div>

      <!-- STATE: LEADERBOARD -->
      <div v-if="state === 'LEADERBOARD'"
        class="w-full surface-card shadow-6 p-5 text-center flex flex-column align-items-center gap-4"
        style="border-radius: 1.5rem;">
        <i class="pi pi-trophy text-yellow-500" style="font-size: 5rem;"></i>
        <h2 class="m-0 text-4xl">Ranking Parcial</h2>
        <p class="text-500 text-xl m-0">Olhe para a tela principal para ver os resultados!</p>
      </div>

      <!-- STATE: GAME_OVER -->
      <div v-if="state === 'GAME_OVER'"
        class="w-full surface-card shadow-6 p-4 text-center flex flex-column align-items-center gap-4"
        style="border-radius: 1.5rem;">
        <h1 class="text-4xl m-0 text-center">Fim de Jogo!</h1>

        <div class="flex justify-content-center align-items-end gap-3 my-4" style="height: 180px;">
          <!-- 2nd Place -->
          <div v-if="leaderboard[1]" class="flex flex-column align-items-center w-6rem">
            <div class="relative flex justify-content-center align-items-center mb-1 text-4xl">
              <span>{{ leaderboard[1].animal }}</span>
            </div>
            <span
              class="font-bold text-sm text-overflow-ellipsis overflow-hidden white-space-nowrap w-full text-center">{{
                leaderboard[1].name }}</span>
            <div
              class="bg-blue-300 w-full flex align-items-center justify-content-center text-white font-bold text-xl shadow-2"
              style="height: 80px; border-top-left-radius: 1rem; border-top-right-radius: 1rem;">2º</div>
            <span class="font-bold mt-2 text-sm">{{ leaderboard[1].score }} pts</span>
          </div>

          <!-- 1st Place -->
          <div v-if="leaderboard[0]" class="flex flex-column align-items-center w-8rem">
            <i class="pi pi-crown text-yellow-500 text-3xl mb-1"></i>
            <div class="relative flex justify-content-center align-items-center mb-1 text-5xl">
              <span>{{ leaderboard[0].animal }}</span>
            </div>
            <span
              class="font-bold text-lg text-overflow-ellipsis overflow-hidden white-space-nowrap w-full text-center">{{
                leaderboard[0].name }}</span>
            <div
              class="bg-yellow-400 w-full flex align-items-center justify-content-center text-white font-bold text-2xl shadow-4"
              style="height: 120px; border-top-left-radius: 1rem; border-top-right-radius: 1rem;">1º</div>
            <span class="font-bold mt-2 text-md">{{ leaderboard[0].score }} pts</span>
          </div>

          <!-- 3rd Place -->
          <div v-if="leaderboard[2]" class="flex flex-column align-items-center w-6rem">
            <div class="relative flex justify-content-center align-items-center mb-1 text-4xl">
              <span>{{ leaderboard[2].animal }}</span>
            </div>
            <span
              class="font-bold text-sm text-overflow-ellipsis overflow-hidden white-space-nowrap w-full text-center">{{
                leaderboard[2].name }}</span>
            <div
              class="bg-orange-400 w-full flex align-items-center justify-content-center text-white font-bold text-xl shadow-2"
              style="height: 60px; border-top-left-radius: 1rem; border-top-right-radius: 1rem;">3º</div>
            <span class="font-bold mt-2 text-sm">{{ leaderboard[2].score }} pts</span>
          </div>
        </div>

        <Button label="Sair" size="large" @click="$router.push('/')" class="w-full font-bold p-3 text-xl shadow-2"
          style="border-radius: 1rem;" />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { socket } from '../socket';

import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const pin = route.params.pin;

const state = ref('LOBBY'); // LOBBY, WAITING, PLAYING, LEADERBOARD
const playerName = ref('');
const animal = ref('🐶');
const showPicker = ref(false);

import 'emoji-picker-element';

const onEmojiSelect = (e) => {
  animal.value = e.detail.unicode;
  showPicker.value = false;
};



const questionType = ref('MULTIPLE_CHOICE');
const options = ref([]);
const shortAnswerInput = ref('');
const hasAnswered = ref(false);
const leaderboard = ref([]);
const currentQuestionIndex = ref(0);
const totalQuestions = ref(0);

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
    audio.play().catch(e => console.error("Audio play blocked:", e));
    currentAudio.value = audio;
  }
};



const getOptionSeverity = (idx) => {
  const severities = ['danger', 'info', 'warning', 'success', 'help', 'secondary'];
  return severities[idx % severities.length];
};

const joinRoom = () => {
  socket.connect();
  socket.emit('join_game', { pin, name: playerName.value, animal: animal.value, hat: 'none', glasses: 'none' });
};

const submitAnswer = (answerValue) => {
  socket.emit('submit_answer', { pin, answer: answerValue });
  hasAnswered.value = true;
};

onMounted(() => {
  socket.on('join_success', () => {
    state.value = 'WAITING';
  });

  socket.on('join_error', (err) => {
    toast.add({ severity: 'error', summary: 'Erro', detail: err, life: 3000 });
    setTimeout(() => router.push('/'), 1500); // go back to home if pin is wrong
  });

  socket.on('new_question_player', (data) => {
    state.value = 'PLAYING';
    questionType.value = data.type || 'MULTIPLE_CHOICE';
    options.value = data.options || [];
    currentQuestionIndex.value = data.currentQuestionIndex || 0;
    totalQuestions.value = data.totalQuestions || 0;
    shortAnswerInput.value = ''; // Reset short answer input
    hasAnswered.value = false;
    
    playAudio(data.audioUrl);
  });

  socket.on('show_leaderboard', () => {
    state.value = 'LEADERBOARD';
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
  stopAudio();
});
</script>
