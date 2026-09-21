import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') || null);
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'));

  const setAuth = (newToken, newUser) => {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      if (response.data && response.data.access) {
        setAuth(response.data.access, response.data.session);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (user_name, email, password) => {
    try {
      const response = await api.post('/register', { user_name, email, password });
      if (response.data && response.data.access) {
        setAuth(response.data.access, response.data.user);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      let details = '';
      if (error.response?.data?.errors) {
         details = ' ' + Object.values(error.response.data.errors).flat().join(' ');
      }
      return { 
        success: false, 
        message: message + details 
      };
    }
  };

  const logout = async () => {
    try {
      if (token.value) {
        await api.post('/logout');
      }
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.hash = '#/login';
    }
  };

  const isLoggedIn = () => {
    return !!token.value;
  };

  return {
    token,
    user,
    login,
    register,
    logout,
    isLoggedIn
  };
});
