import { ref } from 'vue';

export const currentUser = ref(null);

export const loadUser = () => {
  const userStr = localStorage.getItem('admin_user');
  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr);
    } catch (e) {
      currentUser.value = null;
    }
  } else {
    currentUser.value = null;
  }
};

export const setUser = (user) => {
  currentUser.value = user;
  if (user) {
    localStorage.setItem('admin_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('admin_user');
  }
};
