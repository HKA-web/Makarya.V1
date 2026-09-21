<template>
 <aside class="w-72 border-r-4 border-black bg-neo-bg flex flex-col hidden md:flex shrink-0 dark:border-[#222] dark:bg-[#050505]">
 
 <!-- Main Navigation -->
 <div class="p-6 border-b-4 border-black flex flex-col gap-3 bg-white dark:border-[#222] dark:bg-[#0a0a0a]">
 <h3 class="font-mono font-bold text-sm mb-2 border-b-4 border-black pb-1 text-gray-500 uppercase dark:border-[#222] dark:text-gray-400">Navigation</h3>
 


 <router-link to="/dashboard" custom v-slot="{ navigate, isActive }">
 <button @click="navigate" 
 class="border-4 border-black font-bold px-4 py-3 text-left transition-all flex items-center gap-3 dark:border-[#222]"
 :class="isActive ? 'bg-black text-white dark:bg-white dark:text-black translate-x-[-2px] translate-y-[-2px]' : 'bg-white dark:bg-[#111] dark:text-gray-100 hover:-translate-y-1 hover:-translate-x-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'"> 
 <i class="pi pi-table text-xl"></i> Dashboard
 </button>
 </router-link>
 
 <router-link to="/database" custom v-slot="{ navigate, isActive }">
 <button @click="navigate" 
 class="border-4 border-black font-bold px-4 py-3 text-left transition-all flex items-center gap-3 dark:border-[#222]"
 :class="isActive ? 'bg-black text-white dark:bg-white dark:text-black translate-x-[-2px] translate-y-[-2px]' : 'bg-white dark:bg-[#111] dark:text-gray-100 hover:-translate-y-1 hover:-translate-x-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'"> 
 <i class="pi pi-database text-xl"></i> Database
 </button>
 </router-link>

 <router-link to="/tester" custom v-slot="{ navigate, isActive }">
 <button @click="navigate" 
 class="border-4 border-black font-bold px-4 py-3 text-left transition-all flex items-center gap-3 dark:border-[#222]"
 :class="isActive ? 'bg-black text-white dark:bg-white dark:text-black translate-x-[-2px] translate-y-[-2px]' : 'bg-white dark:bg-[#111] dark:text-gray-100 hover:-translate-y-1 hover:-translate-x-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'"> 
 <i class="pi pi-bolt text-xl"></i> API Tester
 </button>
 </router-link>

 <router-link to="/builder" custom v-slot="{ navigate, isActive }">
 <button @click="navigate" 
 class="border-4 border-black font-bold px-4 py-3 text-left transition-all flex items-center gap-3 dark:border-[#222]"
 :class="isActive ? 'bg-black text-white dark:bg-white dark:text-black translate-x-[-2px] translate-y-[-2px]' : 'bg-white dark:bg-[#111] dark:text-gray-100 hover:-translate-y-1 hover:-translate-x-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'"> 
 <i class="pi pi-box text-xl"></i> AI Builder
 </button>
 </router-link>

 <router-link to="/community" custom v-slot="{ navigate, isActive }">
 <button @click="navigate" 
 class="border-4 border-black font-bold px-4 py-3 text-left transition-all flex items-center gap-3 dark:border-[#222]"
 :class="isActive ? 'bg-black text-white dark:bg-white dark:text-black translate-x-[-2px] translate-y-[-2px]' : 'bg-white dark:bg-[#111] dark:text-gray-100 hover:-translate-y-1 hover:-translate-x-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'"> 
 <i class="pi pi-users text-xl"></i> Community
 </button>
 </router-link>

 <router-link to="/global-settings" custom v-slot="{ navigate, isActive }">
 <button @click="navigate" 
 class="border-4 border-black font-bold px-4 py-3 text-left transition-all flex items-center gap-3 dark:border-[#222]"
 :class="isActive ? 'bg-black text-white dark:bg-white dark:text-black translate-x-[-2px] translate-y-[-2px]' : 'bg-white dark:bg-[#111] dark:text-gray-100 hover:-translate-y-1 hover:-translate-x-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'"> 
 <i class="pi pi-cog text-xl"></i> Settings
 </button>
 </router-link>
 </div>

 </aside>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useApiStore } from '@/stores/apiStore';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const store = useApiStore();
const authStore = useAuthStore();
</script>
