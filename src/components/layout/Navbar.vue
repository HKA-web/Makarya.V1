<template>
 <header class="border-b-4 border-black bg-neo-purple text-black py-4 px-6 flex items-center justify-between sticky top-0 z-40 dark:border-[#222] dark:bg-[#0a0a0a] dark:text-gray-100">
 <div class="flex items-center gap-3">
 <button @click="$emit('toggle-sidebar')" class="mr-2 text-2xl hover:scale-110 transition-transform">
   <i class="pi pi-bars"></i>
 </button>
 <div class="flex items-center gap-3 cursor-pointer" @click="$router.push('/')">
 <img src="/icon.png" alt="Makarya Logo" class="w-10 h-10 object-contain border-2 border-black dark:border-[#222]" />
 <h1 class="text-2xl font-black uppercase tracking-tighter">Makarya</h1>
 </div>
 </div>
 
 <div class="flex items-center gap-4">
 <button @click="toggleTheme" class="bg-black text-white dark:bg-white dark:text-black border-4 border-black font-bold px-4 py-2 hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white hover:-translate-y-1 hover:-translate-x-1 transition-all flex items-center gap-2 dark:border-[#222]">
 <i class="pi" :class="isDark ? 'pi-sun' : 'pi-moon'"></i>
 <span class="hidden sm:inline">{{ isDark ? 'Light' : 'Dark' }} Mode</span>
 </button>
 </div>
 </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
defineEmits(['toggle-sidebar'])
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }
})
</script>
