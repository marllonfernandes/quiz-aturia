<template>
  <div class="flex flex-column gap-4 w-full h-full pb-6 pt-3" style="background-color: #f9f9f9; padding-inline: 1rem;">
    
    <!-- Streak Section (Mock) -->
    <div class="flex align-items-center justify-content-between p-3 bg-white border-round-xl border-1 border-gray-200 shadow-1">
      <div class="flex flex-column align-items-center">
        <i class="pi pi-bolt text-400 text-3xl mb-1"></i>
        <span class="text-xs text-500 font-bold text-center" style="max-width: 60px; line-height: 1;">Sem sequência</span>
      </div>
      <div class="flex flex-1 justify-content-around ml-4">
        <span class="font-bold text-gray-800">D</span>
        <span class="font-bold text-gray-800">S</span>
        <span class="font-bold text-gray-400 border-bottom-2 border-gray-400 pb-1">T</span>
        <span class="font-bold text-gray-400">Q</span>
        <span class="font-bold text-gray-400">Q</span>
        <span class="font-bold text-gray-400">S</span>
        <span class="font-bold text-gray-400">S</span>
      </div>
    </div>

    <!-- Ativos -->
    <div class="flex flex-column gap-2 mt-2">
      <div class="flex justify-content-between align-items-center px-1">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-history text-xl"></i>
          <span class="font-bold text-xl text-gray-800">Ativos</span>
        </div>
        <span class="text-gray-600 font-medium">Ver todos</span>
      </div>
      <div class="bg-white p-5 border-round-xl flex flex-column align-items-center justify-content-center text-center mt-2 border-dashed border-2 border-gray-200">
        <div class="text-6xl mb-3">💡</div>
        <span class="text-gray-500 font-medium text-lg">Os jogos em andamento aparecerão aqui</span>
      </div>
    </div>

    <!-- Meus quiz -->
    <div class="flex flex-column gap-2 mt-4">
      <div class="flex justify-content-between align-items-center px-1">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-user text-xl"></i>
          <span class="font-bold text-xl text-gray-800">Meus Quiz</span>
        </div>
        <span class="text-gray-600 font-medium">Ver todos</span>
      </div>
      <div class="bg-white p-5 border-round-xl flex flex-column align-items-center justify-content-center text-center mt-2 border-dashed border-2 border-gray-200">
        <div class="text-6xl mb-3">🎨</div>
        <Button label="Criar Quiz" class="font-bold px-4 py-2 text-gray-800 bg-white border-1 border-gray-300 shadow-1" style="border-radius: 8px;" @click="$router.push('/admin')" />
      </div>
    </div>

    <!-- Banner -->
    <div class="mt-4 border-round-xl overflow-hidden relative shadow-2" style="background: linear-gradient(135deg, #190a61, #281299); padding: 2rem 1rem; color: white;">
      <div class="flex flex-column align-items-center text-center relative z-1">
        <h2 class="m-0 text-2xl font-bold mb-2">GameAturiá! <br/><span class="text-yellow-400">MATH GAMES</span></h2>
        <Button label="Jogar agora" class="bg-white text-gray-900 font-bold px-4 py-2 mt-3 border-none" style="border-radius: 8px;" @click="$router.push('/join')" />
      </div>
      <div class="absolute" style="top: 10px; left: 10px; font-size: 3rem; opacity: 0.8;">🚀</div>
      <div class="absolute" style="bottom: 10px; right: 10px; font-size: 4rem; opacity: 0.8;">👾</div>
    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();
</script>
