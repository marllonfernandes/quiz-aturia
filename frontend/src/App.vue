<template>
  <Toast />
  <div class="app">
    <header class="app-header">
      <!-- Profile Icon -->
      <button v-if="!currentUser" class="app-header-btn" style="background-color: #6c757d; color: white; border-radius: 50%; width: 40px; height: 40px; padding: 0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
          <rect width="256" height="256" fill="none"></rect>
          <circle cx="128" cy="96" r="64" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="16"></circle>
          <path d="M31,216a112,112,0,0,1,194,0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path>
        </svg>
      </button>
      <img v-else :src="currentUser.avatar" :alt="currentUser.name" style="border-radius: 50%; width: 40px; height: 40px; border: 1px solid #e0e0e0; object-fit: cover; cursor: pointer;" @click="$router.push('/admin')" />
      
      <!-- Logo -->
      <div class="font-bold text-2xl" style="color: #46178f; font-family: 'Lexend', sans-serif;">
        GameAturiá<span style="color: #00d2d3;">!</span> <span style="font-size: 0.8rem; background-color: #46178f; color: white; padding: 2px 4px; border-radius: 4px;">GO</span>
      </div>

      <!-- Upgrade / Action Button -->
      <!-- <button class="text-white font-bold px-3 py-2 border-round" style="background-color: #008080; border: none; font-size: 0.875rem;">
        Fazer upgrade
      </button> -->
    </header>

    <main class="app-body">
      <router-view />
    </main>

    <footer class="app-footer" v-show="$route.name !== 'hostLobby' && $route.name !== 'playerLobby'">
      <nav class="menu-bar">
        <!-- Início -->
        <router-link to="/" class="menu-bar-item" active-class="menu-bar-item--active">
          <svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="currentColor" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="none"></rect>
            <path d="M213.3815,109.61945,133.376,36.88436a8,8,0,0,0-10.76339.00036l-79.9945,72.73477A8,8,0,0,0,40,115.53855V208a8,8,0,0,0,8,8H208a8,8,0,0,0,8-8V115.53887A8,8,0,0,0,213.3815,109.61945Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path>
          </svg>
          <span class="menu-bar-item-text">Início</span>
        </router-link>

        <!-- Descobrir (Mapping to Host for agora) -->
        <router-link to="/host" class="menu-bar-item" active-class="menu-bar-item--active">
          <svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="currentColor" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="none"></rect>
            <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></circle>
            <polygon points="160 96 144 144 96 160 112 112 160 96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polygon>
          </svg>
          <span class="menu-bar-item-text">Descobrir</span>
        </router-link>

        <!-- Entrar (Botão central colorido) -->
        <router-link to="/join" class="menu-bar-item" style="text-decoration: none;">
          <div style="background: linear-gradient(135deg, #46178f, #00d2d3); color: white; display: flex; align-items: center; justify-content: center; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); width: 48px; height: 48px; margin-top: -8px;">
            <i class="pi pi-rocket" style="font-size: 1.5rem;"></i>
          </div>
          <span class="menu-bar-item-text font-bold" style="color: #333; margin-top: 4px;">Entrar</span>
        </router-link>

        <!-- Criar (Mapping to Admin) -->
        <router-link to="/admin" class="menu-bar-item" active-class="menu-bar-item--active">
          <svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="currentColor" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="none"></rect>
            <rect x="40" y="40" width="176" height="176" rx="8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></rect>
            <line x1="128" y1="88" x2="128" y2="168" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line>
            <line x1="88" y1="128" x2="168" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line>
          </svg>
          <span class="menu-bar-item-text">Criar</span>
        </router-link>

        <!-- Biblioteca -->
        <div class="menu-bar-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="currentColor" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="none"></rect>
            <rect x="32" y="48" width="192" height="160" rx="8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></rect>
            <line x1="32" y1="96" x2="224" y2="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line>
            <line x1="88" y1="96" x2="88" y2="208" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line>
          </svg>
          <span class="menu-bar-item-text">Biblioteca</span>
        </div>
      </nav>
    </footer>
  </div>
</template>

<script setup>
import Toast from 'primevue/toast';
import { onMounted } from 'vue';
import { loadUser, currentUser } from './auth';

onMounted(() => {
  loadUser();
});
</script>

<style>
/* Reset App ID which is set to max width 1126 in style.css */
#app {
  width: 100%;
  max-width: unset;
  border-inline: none;
  min-height: unset;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.app-body {
  overflow-y: auto;
  flex: 1;
  padding-bottom: 90px; /* space for footer */
}
</style>
