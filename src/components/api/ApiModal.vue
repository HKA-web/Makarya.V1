<template>
 <Teleport to="body">
 <Transition
 enter-active-class="transition duration-300 ease-out"
 enter-from-class="opacity-0"
 enter-to-class="opacity-100"
 leave-active-class="transition duration-200 ease-in"
 leave-from-class="opacity-100"
 leave-to-class="opacity-0"
 >
 <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/10 backdrop-blur-md">
 <div class="bg-white border-4 border-black w-full max-w-2xl flex flex-col max-h-full overflow-hidden modal-animate-enter dark:bg-[#0a0a0a] dark:border-[#222]">
 
 <!-- Modal Header -->
 <div class="border-b-4 border-black bg-neo-green text-black dark:bg-white dark:text-black p-4 md:p-6 flex justify-between items-start dark:border-[#222]">
 <div class="flex items-center gap-4">
 <div class="w-16 h-16 border-4 border-black bg-white flex items-center justify-center text-3xl dark:border-[#222] dark:bg-[#0a0a0a]" :class="selectedApi?.bgColor">
 {{ selectedApi?.icon }}
 </div>
 <div>
 <h2 class="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">{{ selectedApi?.name }}</h2>
 <div class="flex items-center gap-2 mt-2">
 <span class="font-mono font-bold text-sm bg-neo-green text-black dark:bg-white dark:text-black px-2 py-0.5">{{ selectedApi?.provider }}</span>
 <span class="font-mono font-bold text-sm border-2 border-black px-2 py-0.5 dark:border-[#222]" 
 :class="selectedApi?.pricing === 'Free' ? 'bg-neo-pink text-black dark:bg-white dark:text-black' : (selectedApi?.pricing === 'Freemium' ? 'bg-white' : 'bg-neo-yellow text-black dark:bg-white dark:text-black')">
 {{ selectedApi?.pricing }}
 </span>
 </div>
 </div>
 </div>
 <button @click="$emit('close')" class="text-3xl font-black hover:text-neo-pink hover:scale-110 transition-transform">
 <i class="pi pi-times"></i>
 </button>
 </div>
 
 <!-- Modal Body -->
 <div class="p-6 flex-1 overflow-y-auto bg-gray-50 flex flex-col gap-6 dark:bg-[#111]">
 
 <!-- Description Section -->
 <div>
 <h3 class="font-black uppercase text-lg mb-2">Description</h3>
 <p class="font-mono font-bold text-gray-700 border-l-4 border-black pl-4 dark:text-gray-300 dark:border-[#222]">{{ selectedApi?.description }}</p>
 </div>
 
 <!-- Endpoint URL Section -->
 <div>
 <h3 class="font-black uppercase text-lg mb-2">Endpoint URL</h3>
 <div class="flex">
 <div class="bg-black text-neo-green font-mono p-4 border-4 border-black flex-1 overflow-x-auto whitespace-nowrap text-sm dark:border-[#222]">
 https://api.{{ selectedApi?.provider.toLowerCase() }}.com/v1/
 </div>
 <button class="bg-white border-4 border-l-0 border-black px-4 font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors dark:bg-[#0a0a0a] dark:border-[#222]" title="Copy to clipboard"> 
 <i class="pi pi-copy text-xl"></i>
 </button>
 </div>
 </div>

 <!-- Documentation Tabs -->
 <div>
 <h3 class="font-black uppercase text-lg mb-2">API Documentation</h3>
 
 <!-- Tab Headers -->
 <div class="flex flex-wrap gap-2 mb-4 border-b-4 border-black pb-4 dark:border-[#222]">
 <button v-for="method in ['GET', 'POST', 'PUT', 'DELETE']" :key="method"
 @click="activeMethod = method"
 class="font-black font-mono border-4 border-black px-4 py-2 transition-all hover:-translate-y-0.5 hover:-translate-x-0.5 hover: dark:border-[#222]"
 :class="activeMethod === method ? getMethodColor(method) + ' translate-y-[-2px] translate-x-[-2px]' : 'bg-white text-black'">
 {{ method }}
 </button>
 </div>
 
 <!-- Tab Content -->
 <div class="bg-white border-4 border-black p-4 font-mono text-sm relative dark:bg-[#0a0a0a] dark:border-[#222]">
 <div class="absolute -top-3 -right-3 bg-neo-pink text-black dark:bg-white dark:text-black font-bold px-2 py-1 transform rotate-6 text-xs border-2 border-white">EXAMPLE</div>
 
 <div v-if="activeMethod === 'GET'">
 <p class="font-bold mb-2 uppercase border-b-2 border-black inline-block dark:border-[#222]">Parameters</p>
 <ul class="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
 <li><code>id</code> <span class="text-xs bg-gray-200 px-1 border border-black dark:border-[#222]">optional</span> - The unique identifier</li>
 <li><code>limit</code> <span class="text-xs bg-gray-200 px-1 border border-black dark:border-[#222]">optional</span> - Number of results to return (default: 10)</li>
 </ul>
 <p class="font-bold mb-2 uppercase border-b-2 border-black inline-block dark:border-[#222]">Success Response (200 OK)</p>
 <pre class="bg-gray-100 p-2 border-2 border-black overflow-x-auto text-xs dark:bg-[#111] dark:border-[#222]">
{
"status":"success",
"data": [
 {"id": 1,"name":"Item 1" }
 ]
}</pre>
 </div>
 
 <div v-else-if="activeMethod === 'POST'">
 <p class="font-bold mb-2 uppercase border-b-2 border-black inline-block dark:border-[#222]">Body (JSON)</p>
 <pre class="bg-gray-100 p-2 border-2 border-black overflow-x-auto mb-4 text-xs dark:bg-[#111] dark:border-[#222]">
{
"name":"string (required)",
"value":"number (optional)"
}</pre>
 <p class="font-bold mb-2 uppercase border-b-2 border-black inline-block dark:border-[#222]">Success Response (201 Created)</p>
 <pre class="bg-gray-100 p-2 border-2 border-black overflow-x-auto text-xs dark:bg-[#111] dark:border-[#222]">
{
"status":"success",
"message":"Resource created successfully",
"id": 123
}</pre>
 </div>

 <div v-else-if="activeMethod === 'PUT'">
 <p class="font-bold mb-2 uppercase border-b-2 border-black inline-block dark:border-[#222]">Parameters</p>
 <ul class="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
 <li><code>id</code> <span class="text-xs bg-neo-purple text-black dark:bg-white dark:text-black px-1 border border-black dark:border-[#222]">required</span> - The unique identifier to update</li>
 </ul>
 <p class="font-bold mb-2 uppercase border-b-2 border-black inline-block dark:border-[#222]">Body (JSON)</p>
 <pre class="bg-gray-100 p-2 border-2 border-black overflow-x-auto mb-4 text-xs dark:bg-[#111] dark:border-[#222]">
{
"name":"string (optional)",
"value":"number (optional)"
}</pre>
 <p class="font-bold mb-2 uppercase border-b-2 border-black inline-block dark:border-[#222]">Success Response (200 OK)</p>
 <pre class="bg-gray-100 p-2 border-2 border-black overflow-x-auto text-xs dark:bg-[#111] dark:border-[#222]">
{
"status":"success",
"message":"Resource updated successfully"
}</pre>
 </div>

 <div v-else-if="activeMethod === 'DELETE'">
 <p class="font-bold mb-2 uppercase border-b-2 border-black inline-block dark:border-[#222]">Parameters</p>
 <ul class="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
 <li><code>id</code> <span class="text-xs bg-neo-blue text-black dark:bg-white dark:text-black px-1 border border-black dark:border-[#222]">required</span> - The unique identifier to delete</li>
 </ul>
 <p class="font-bold mb-2 uppercase border-b-2 border-black inline-block dark:border-[#222]">Success Response (200 OK)</p>
 <pre class="bg-gray-100 p-2 border-2 border-black overflow-x-auto text-xs dark:bg-[#111] dark:border-[#222]">
{
"status":"success",
"message":"Resource deleted successfully"
}</pre>
 </div>

 </div>
 </div>
 </div>
 
 <!-- Modal Footer -->
 <div class="border-t-4 border-black p-4 flex justify-end gap-4 bg-white dark:border-[#222] dark:bg-[#0a0a0a]">
 <button @click="$emit('close')" class="border-4 border-black font-black px-6 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors dark:border-[#222]"> 
 CLOSE
 </button>
 <button @click="$emit('testApi', selectedApi)" class="bg-black text-white dark:bg-white dark:text-black border-4 border-black font-black px-6 py-2 hover: hover:-translate-y-1 transition-all dark:border-[#222]">
 TEST API <i class="pi pi-bolt ml-2"></i>
 </button>
 </div>

 </div>
 </div>
 </Transition>
 </Teleport>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
 isVisible: { type: Boolean, required: true },
 selectedApi: { type: Object, default: null }
});
defineEmits(['close', 'testApi']);

const activeMethod = ref('GET');

const getMethodColor = (method) => {
 switch(method) {
 case 'GET': return 'bg-neo-pink text-black dark:bg-white dark:text-black';
 case 'POST': return 'bg-neo-yellow text-black dark:bg-white dark:text-black';
 case 'PUT': return 'bg-neo-purple text-black dark:bg-white dark:text-black';
 case 'DELETE': return 'bg-neo-blue text-black dark:bg-white dark:text-black';
 default: return 'bg-neo-yellow text-black dark:bg-white dark:text-black';
 }
};
</script>

<style scoped>
.modal-animate-enter {
 animation: modalEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalEnter {
 from {
 opacity: 0;
 transform: scale(0.95) translateY(15px);
 }
 to {
 opacity: 1;
 transform: scale(1) translateY(0);
 }
}
</style>
