<template>
  <div class="p-6 lg:p-10 h-full flex flex-col">
    <!-- Header Dashboard -->
    <div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-6 gap-4 dark:border-[#222]">
      <div>
        <h2 class="text-4xl md:text-5xl font-black uppercase mb-2">Dashboard</h2>
        <p class="font-mono font-bold text-gray-600 border-l-4 border-neo-blue pl-4 dark:text-gray-400">Documentation & Start Guide</p>
      </div>
      <button @click="$router.push('/editor')" class="bg-black text-white dark:bg-white dark:text-black border-4 border-black font-black text-xl px-6 py-3 uppercase hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white hover:-translate-y-1 hover:-translate-x-1 transition-all flex items-center gap-2 dark:border-[#222]">
        <i class="pi pi-code"></i> Open Editor
      </button>
    </div>

    <!-- Main Content: Markdown Reader (2 cols) & QR Code (1 col) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 mb-6">
      
      <!-- Markdown Reader (Reads root README.md) -->
      <div class="lg:col-span-2 bg-white border-4 border-black p-6 md:p-8 overflow-y-auto custom-scrollbar dark:bg-[#0a0a0a] dark:border-[#222] text-black dark:text-gray-100">
        <div class="markdown-body" v-html="renderedMarkdown"></div>
      </div>

      <!-- Follow Us -->
      <div class="bg-neo-yellow border-4 border-black p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden dark:border-[#222] dark:bg-[#111] dark:text-gray-100 text-black h-fit self-start">
        <h3 class="font-black text-xl uppercase tracking-tight mb-4 border-b-4 border-black pb-2 w-full z-10 dark:border-[#222]">FOLLOW US</h3>
        <div class="p-4 bg-white border-4 border-black my-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 dark:border-[#222] dark:bg-[#0a0a0a]">
          <img src="/assets/qr.jpg" alt="Follow Us" class="w-48 h-auto max-h-64 object-contain">
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { marked } from 'marked';
import readmeRaw from '../../README.md?raw';

const renderedMarkdown = computed(() => marked(readmeRaw || ''));
</script>

<style>
/* Custom styles for markdown to fit neobrutalism */
.markdown-body {
  font-family: inherit;
  line-height: 1.6;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  font-weight: 900;
  text-transform: uppercase;
  border-bottom: 4px solid black;
  padding-bottom: 0.5rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.dark .markdown-body h1,
.dark .markdown-body h2,
.dark .markdown-body h3 {
  border-bottom-color: #222;
}

.markdown-body h1 {
  font-size: 2rem;
  border-bottom: 6px solid black;
  margin-top: 0;
}

.dark .markdown-body h1 {
  border-bottom-color: #222;
}

.markdown-body h2 {
  font-size: 1.5rem;
}

.markdown-body h3 {
  font-size: 1.25rem;
  border-bottom: 2px solid black;
}

.dark .markdown-body h3 {
  border-bottom-color: #222;
}

.markdown-body p {
  margin-bottom: 1.2rem;
  font-size: 1rem;
}

.markdown-body strong {
  font-weight: 900;
  background-color: #facc15;
  color: black;
  padding: 0 4px;
}

.dark .markdown-body strong {
  background-color: #facc15;
  color: black;
}

.markdown-body code {
  font-family: monospace;
  font-weight: bold;
  background-color: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border: 2px solid black;
  font-size: 0.9em;
}

.dark .markdown-body code {
  background-color: #111;
  border-color: #222;
  color: #e5e7eb;
}

.markdown-body ul {
  list-style-type: square;
  padding-left: 1.5rem;
  margin-bottom: 1.2rem;
  font-size: 1rem;
}

.markdown-body li {
  margin-bottom: 0.4rem;
}
</style>
