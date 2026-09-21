<template>
 <div class="font-sans antialiased h-screen flex flex-col selection:bg-neo-blue selection:text-black bg-neo-bg overflow-hidden text-black dark:text-gray-100 dark:bg-[#050505]">
 
 <!-- Custom Draggable Title Bar -->
 <div style="-webkit-app-region: drag;" class="h-[36px] w-full flex items-center justify-between px-4 border-b-2 border-black font-bold text-sm shrink-0 bg-[#F4F4F0] dark:bg-[#050505] z-50 dark:border-[#222]">
 <div class="flex items-center">
 <i class="pi pi-box mr-2"></i> Makarya
 </div>
 
 <!-- Window Controls -->
 <div style="-webkit-app-region: no-drag;" class="flex items-center space-x-1 -mr-2">
 <button @click="minimize" class="w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer text-gray-700 dark:text-gray-300"> 
 <i class="pi pi-minus" style="font-size: 0.7rem;"></i>
 </button>
 <button @click="maximize" class="w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer text-gray-700 dark:text-gray-300"> 
 <i class="pi pi-stop" style="font-size: 0.7rem;"></i>
 </button>
 <button @click="close" class="w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer text-gray-700 dark:text-gray-300"> 
 <i class="pi pi-times" style="font-size: 0.8rem;"></i>
 </button>
 </div>
 </div>

 <!-- Main Content Area -->
 <div class="flex-1 relative overflow-hidden flex flex-col">
 <router-view></router-view>
 </div>
 
 <NeoToast />
 </div>
</template>

<script setup>
import NeoToast from '@/components/ui/NeoToast.vue'

const minimize = () => window.electronAPI?.windowMinimize()
const maximize = () => window.electronAPI?.windowMaximize()
const close = () => window.electronAPI?.windowClose()
</script>
