<template>
  <div class="flex justify-content-center align-items-center min-h-screen p-3">
    <div class="w-full shadow-6 surface-card p-5 flex flex-column gap-4" style="max-width: 400px; border-radius: 1.5rem;">
      <h1 class="text-center m-0 pb-2" style="font-size: 2.8rem; background: linear-gradient(to right, #fff, #ec4899); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;">GameAturiá</h1>
      
      <div class="flex flex-column gap-2">
        <label for="pinInput" class="text-500 font-bold uppercase text-sm text-center">Código da Sala</label>
        <InputText id="pinInput" v-model="pin" placeholder="000000" class="text-center text-4xl font-bold p-3" style="letter-spacing: 6px; border-radius: 1rem;" maxlength="6" inputmode="numeric" />
      </div>
      
      <Button label="Entrar no Jogo" size="large" @click="joinGame" class="w-full font-bold p-3 text-xl shadow-2" style="border-radius: 1rem;" />
      
      <div class="border-top-1 surface-border my-2"></div>

      <div class="flex flex-column gap-3">
        <Button label="Apresentar Jogo" icon="pi pi-desktop" outlined severity="info" class="w-full p-3 font-bold" style="border-radius: 1rem;" @click="$router.push('/host')" />
        <Button label="Painel de Perguntas" icon="pi pi-cog" outlined severity="secondary" class="w-full p-3 font-bold" style="border-radius: 1rem;" @click="$router.push('/admin')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
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
