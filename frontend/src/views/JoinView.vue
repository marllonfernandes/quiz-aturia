<template>
  <div class="flex flex-column align-items-center justify-content-center h-full px-4 w-full pb-8" style="background-color: #f9f9f9; min-height: 80vh;">
    <div class="w-full max-w-30rem p-5 flex flex-column gap-4 bg-white border-round-xl shadow-2 border-1 border-gray-200">
      <h1 class="text-center m-0 pb-2 text-gray-800" style="font-size: 2rem;">GameAturiá</h1>
      
      <div class="flex flex-column gap-2 mt-3">
        <label for="pinInput" class="text-gray-600 font-bold uppercase text-sm text-center">Código da Sala (PIN)</label>
        <InputText id="pinInput" v-model="pin" placeholder="000000" class="text-center text-4xl font-bold p-3 border-2 border-gray-300" style="letter-spacing: 6px; border-radius: 1rem;" maxlength="6" inputmode="numeric" />
      </div>
      
      <Button label="Entrar" size="large" @click="joinGame" class="w-full font-bold p-3 text-xl border-none mt-3" style="border-radius: 1rem; background-color: #333333; color: white;" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

const pin = ref('');
const router = useRouter();
const toast = useToast();

const joinGame = () => {
  if (pin.value.length === 6) {
    router.push(`/player/${pin.value}`);
  } else {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'O código (PIN) deve ter exatos 6 dígitos.', life: 3000 });
  }
};
</script>
