<template>
 <div class="absolute inset-0 flex flex-col bg-neo-bg dark:bg-[#050505]">
 <!-- Header -->
 <div
 class="p-4 md:p-6 border-b-4 border-black bg-white flex flex-col md:flex-row md:justify-between md:items-center gap-4 shrink-0 z-10 relative dark:border-[#222] dark:bg-[#0a0a0a]">
 <div class="flex items-center gap-4">
 <div class="bg-black text-neo-yellow p-3 border-4 border-black dark:border-[#222]">
 <i class="pi pi-database text-3xl"></i>
 </div>
 <div>
 <h2 class="text-2xl md:text-3xl font-black uppercase">Database Management</h2>
 <p class="font-mono font-bold text-gray-600 flex items-center gap-2 dark:text-gray-400">
 Powered by: <span
 class="bg-neo-green text-black dark:bg-white dark:text-black px-2 py-0.5 border-2 border-black text-xs uppercase dark:border-[#222]">Adminer</span>
 </p>
 </div>
 </div>
 </div>

 <!-- Main Workspace (Adminer Webview) -->
 <div class="flex-1 flex flex-col overflow-hidden bg-gray-100 relative dark:bg-[#111]">
 <div class="absolute inset-0 flex items-center justify-center font-mono font-bold text-gray-400">
 Loading Adminer...
 </div>
 <webview ref="adminerWebview" :src="adminerUrl" class="w-full h-full border-none relative z-10 bg-white dark:bg-[#0a0a0a]"
 allowpopups></webview>
 </div>
 </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSettings } from '@/composables/useSettings';

const { adminerUrl } = useSettings();
const adminerWebview = ref(null);

onMounted(() => {
 if (adminerWebview.value) {
 adminerWebview.value.addEventListener('dom-ready', () => {
 adminerWebview.value.executeJavaScript(`
 if (!window.__adminerLoaderInjected) {
 window.__adminerLoaderInjected = true;
 
 const loader = document.createElement('div');
 loader.id = 'adminer-full-loader';
 loader.style.position = 'fixed';
 loader.style.top = '0';
 loader.style.left = '0';
 loader.style.width = '100vw';
 loader.style.height = '100vh';
 loader.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
 loader.style.zIndex = '999999';
 loader.style.display = 'none';
 loader.style.alignItems = 'center';
 loader.style.justifyContent = 'center';
 loader.style.color = '#fff';
 loader.style.fontFamily = 'monospace';
 loader.style.fontSize = '24px';
 loader.style.fontWeight = 'bold';
 loader.style.backdropFilter = 'blur(2px)';
 loader.innerHTML = '<div style="background: black; padding: 20px 40px; border: 4px solid #fff; box-shadow: 8px 8px 0 0 #000; display: flex; align-items: center; gap: 15px;"><span style="display:inline-block; animation: spin 1s linear infinite;">⚙️</span> PROCESSING...</div>';
 
 const style = document.createElement('style');
 style.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } }';
 document.head.appendChild(style);
 document.body.appendChild(loader);

 // Show loader on form submit
 document.addEventListener('submit', function() {
 document.getElementById('adminer-full-loader').style.display = 'flex';
 });
 
 // Show loader on Ctrl+Enter/Cmd+Enter or Ctrl+S/Cmd+S (Adminer shortcuts)
 document.addEventListener('keydown', function(e) {
 if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.key.toLowerCase() === 's')) {
 document.getElementById('adminer-full-loader').style.display = 'flex';
 }
 });
 
 // Show loader on link click (if it's not a hash/anchor link)
 document.addEventListener('click', function(e) {
 let target = e.target;
 while (target && target.tagName !== 'A') {
 target = target.parentNode;
 }
 if (target && target.tagName === 'A' && target.href && !target.href.includes('#') && target.target !== '_blank' && !target.hasAttribute('download')) {
 document.getElementById('adminer-full-loader').style.display = 'flex';
 }
 });
 }
 `);
 });
 }
});
</script>
