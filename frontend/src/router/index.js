import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlayerLobbyView from '../views/PlayerLobbyView.vue'
import HostLobbyView from '../views/HostLobbyView.vue'
import AdminView from '../views/AdminView.vue'
import JoinView from '../views/JoinView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/player/:pin',
      name: 'playerLobby',
      component: PlayerLobbyView
    },
    {
      path: '/host',
      name: 'hostLobby',
      component: HostLobbyView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    },
    {
      path: '/join',
      name: 'join',
      component: JoinView
    }
  ]
})

export default router
