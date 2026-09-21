<template>
 <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
 <TransitionGroup 
 enter-active-class="transition-all duration-300 ease-out"
 enter-from-class="opacity-0 translate-x-full"
 enter-to-class="opacity-100 translate-x-0"
 leave-active-class="transition-all duration-200 ease-in absolute"
 leave-from-class="opacity-100 translate-x-full"
 leave-to-class="opacity-0 translate-x-full"
 move-class="transition-transform duration-300"
 >
 <div 
 v-for="toast in toasts" 
 :key="toast.id"
 class="border-4 border-black p-4 min-w-[300px] max-w-sm flex items-start justify-between pointer-events-auto dark:border-[#222]"
 :class="getBgColor(toast.type)"
 >
 <div class="flex items-start gap-3">
 <div class="mt-0.5">
 <i :class="getIcon(toast.type)" class="text-xl"></i>
 </div>
 <div>
 <h4 class="font-black uppercase text-sm mb-1">{{ toast.title }}</h4>
 <p class="font-mono text-sm font-bold">{{ toast.message }}</p>
 </div>
 </div>
 <button @click="removeToast(toast.id)" class="ml-4 hover:scale-110 transition-transform">
 <i class="pi pi-times font-black text-xl"></i>
 </button>
 </div>
 </TransitionGroup>
 </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const getIcon = (type) => {
 switch (type) {
 case 'success': return 'pi pi-check-circle'
 case 'error': return 'pi pi-exclamation-triangle'
 case 'warning': return 'pi pi-exclamation-circle'
 default: return 'pi pi-info-circle'
 }
}

const getBgColor = (type) => {
 switch (type) {
 case 'success': return 'bg-neo-green text-black dark:bg-white dark:text-black'
 case 'error': return 'bg-neo-pink text-white dark:bg-white dark:text-black'
 case 'warning': return 'bg-neo-yellow text-black dark:bg-white dark:text-black'
 default: return 'bg-neo-blue text-white dark:bg-white dark:text-black'
 }
}
</script>
