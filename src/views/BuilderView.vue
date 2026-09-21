<template>
   <div class="absolute inset-0 flex bg-white overflow-hidden text-black font-sans selection:bg-neo-green">
      <!-- Image Zoom Modal -->
      <div v-if="zoomedImage" @click="zoomedImage = null" class="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 cursor-zoom-out">
         <img :src="zoomedImage" class="max-w-full max-h-full object-contain border-4 border-white bg-white" />
      </div>

      <!-- EXPORT LOADING OVERLAY -->
      <div v-if="isExporting"
         class="absolute inset-0 z-50 bg-[#000000f0] flex flex-col items-center justify-center p-8 text-neo-green font-mono">
         <h2 class="text-4xl font-black uppercase mb-8 animate-pulse text-white"><i class="pi pi-box mr-4"></i>Packaging
            App...</h2>

         <!-- Terminal Output -->
         <div
            class="w-full max-w-4xl bg-[#0b0e11] border-4 border-neo-green h-[500px] overflow-y-auto p-6 text-sm flex flex-col"
            ref="exportLogContainer">
            <div class="mb-4 text-white opacity-50">Initializing AI Conversion Engine...</div>
            <pre class="whitespace-pre-wrap break-words"><code>{{ exportLog }}</code></pre>
            <div class="mt-4 text-white"><span class="animate-pulse">█</span></div>
         </div>
      </div>

      <!-- LEFT PANEL: AI CHAT (35%) -->
      <aside v-show="isChatSidebarVisible"
         class="w-[35%] min-w-[400px] border-r-4 border-black flex flex-col bg-gray-50 h-full shrink-0 relative z-10 dark:border-[#222] dark:bg-[#111]">
         <!-- Pages Tabs -->
         <div class="bg-black flex overflow-x-auto text-xs shrink-0 font-black uppercase text-white p-1 gap-1">
            <div v-for="page in pages" :key="page.id" @click="activePageId = page.id"
               :class="['px-3 py-2 cursor-pointer flex items-center justify-between min-w-[100px] border-2 border-transparent transition-colors', activePageId === page.id ? 'bg-neo-yellow text-black border-white dark:bg-white dark:text-black' : 'bg-gray-800 hover:bg-gray-700 dark:hover:bg-white dark:hover:text-black dark:text-gray-100']">

               <!-- Inline Editor -->
               <div v-if="editingPageId === page.id" class="flex items-center">
                  <input v-model="page.name" @blur="editingPageId = null" @keyup.enter="editingPageId = null"
                     class="bg-white text-black px-1 py-0.5 outline-none w-20 text-xs dark:bg-[#0a0a0a] dark:text-gray-100" v-focus />
               </div>

               <!-- Display -->
               <div v-else @dblclick="editingPageId = page.id" class="flex items-center w-full justify-between"
                  title="Double click to rename">
                  <span><i class="pi pi-file mr-1"></i> {{ page.name }}</span>
                  <button v-if="pages.length > 1" @click.stop="deletePage(page.id)" class="ml-2 hover:text-red-500"><i
                        class="pi pi-times"></i></button>
               </div>
            </div>

            <div v-if="isAddingPage" class="flex items-center bg-neo-green px-2 py-1 dark:bg-[#111] dark:text-gray-100">
               <input ref="newPageInputRef" v-model="newPageName" @keyup.enter="confirmAddPage" @blur="cancelAddPage" placeholder="Nama..."
                  class="text-black dark:text-gray-100 bg-transparent px-1 py-0.5 outline-none w-20 text-xs" />
            </div>
            <button v-else @click="startAddPage"
               class="px-3 py-2 bg-neo-green text-black dark:bg-[#111] dark:text-gray-100 hover:bg-green-400 dark:hover:bg-[#222] border-2 border-transparent flex items-center">
               <i class="pi pi-plus"></i>
            </button>
         </div>

         <!-- Chat History -->
         <div class="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 bg-white dark:bg-[#0a0a0a]" ref="chatContainer">
            <div v-if="chatHistory.length === 0" class="text-center text-gray-400 font-bold text-sm mt-10">
               <i class="pi pi-bolt text-4xl mb-4 block text-gray-300"></i>
               Apa yang ingin Anda bangun hari ini?<br>
               <span class="font-normal text-xs mt-2 block">Misal: "Buatkan halaman login admin dengan tema
                  gelap"</span>
            </div>

            <div v-for="(msg, i) in chatHistory" :key="i"
               :class="['p-3 border-2 border-black max-w-[95%] overflow-x-hidden relative shrink-0', msg.role === 'user' ? 'bg-neo-blue text-white dark:bg-[#111] dark:text-white self-end' : 'bg-gray-100 text-black self-start dark:bg-[#222] dark:border-[#333] dark:text-gray-100']">
               <div class="text-[10px] font-black uppercase mb-2 opacity-70">{{ msg.role === 'user' ? 'You' : 'AI Assistant' }}</div>
               <div v-if="msg.role === 'user'">
                  <div v-if="msg.images && msg.images.length > 0" class="flex flex-wrap gap-2 mb-2">
                     <img v-for="(img, imgIdx) in msg.images" :key="imgIdx" :src="img" @click="zoomedImage = img" class="w-32 h-32 object-cover border-2 border-black dark:border-white cursor-zoom-in hover:opacity-90 transition-opacity" title="Klik untuk memperbesar" />
                  </div>
                  <div class="text-sm prose prose-sm max-w-none break-words dark:prose-invert" v-html="renderMarkdown(msg.content)"></div>
               </div>
               <template v-else>
                  <template v-for="(block, bIdx) in parseMessageContent(msg.content)" :key="bIdx">
                     <!-- Text Block -->
                     <div v-if="block.type === 'text'" class="text-sm prose prose-sm max-w-none break-words"
                        v-html="renderMarkdown(block.content)"></div>

                     <!-- Code Block (Hidden in chat, shown in iframe) -->
                     <div v-else-if="block.type === 'code'"
                        class="my-3 p-3 border-2 border-black bg-neo-blue text-black dark:bg-[#111] dark:text-gray-100 text-xs font-black uppercase flex items-center justify-between dark:border-[#222]">
                        <span><i class="pi pi-code mr-2"></i> Code Generated</span>
                     <button @click="applyCodeToSandbox(block.code)"
                        class="bg-black text-white dark:bg-white dark:text-black px-2 py-1 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                        Preview
                     </button>
                  </div>
                  </template>
               </template>
            </div>

            <div v-if="isSimulatingChat"
               class="p-3 border-2 border-black bg-gray-100 self-start text-sm flex items-center justify-between shrink-0 w-full max-w-[95%]">
               <div class="flex items-center gap-2 font-bold font-mono">
                 <i class="pi pi-spin pi-spinner text-neo-pink"></i> Thinking...
               </div>
               <button @click="stopAI" class="bg-red-500 text-white font-black text-xs px-2.5 py-1 border-2 border-black hover:bg-red-600 transition-colors hover:-translate-y-0.5 cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                 <i class="pi pi-stop font-bold"></i> STOP
               </button>
            </div>
         </div>

          <!-- Chat Input -->
         <div class="p-4 border-t-4 border-black bg-gray-100 shrink-0 dark:bg-[#111] dark:border-[#222]">
            <div v-if="attachedImages.length > 0" class="flex flex-wrap gap-3 mb-2 p-3 bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-[#333]">
               <div v-for="(img, idx) in attachedImages" :key="idx" class="relative group mt-1 mr-1">
                  <img :src="img" @click="zoomedImage = img" class="h-16 w-16 object-cover border-2 border-black dark:border-white cursor-zoom-in hover:opacity-90 transition-opacity" title="Klik untuk memperbesar" />
                  <button @click="removeAttachedImage(idx)" type="button" class="absolute -top-2 -right-2 bg-neo-red text-white w-5 h-5 flex items-center justify-center border-2 border-black font-bold text-xs hover:scale-110 transition-transform z-10" title="Hapus gambar">X</button>
               </div>
            </div>
            <form @submit.prevent="sendMessage" class="flex gap-2">
               <textarea v-model="chatInput" placeholder="Ketik instruksi atau paste gambar (Ctrl+V)..."
                  class="flex-1 border-2 border-black p-2 outline-none focus:bg-neo-yellow focus:bg-opacity-20 text-sm resize-none h-[60px] dark:bg-[#0a0a0a] dark:text-gray-100 dark:border-[#333]"
                  :disabled="isSimulatingChat" @keydown.enter.exact.prevent="sendMessage" @paste="handlePaste"></textarea>
               <button type="submit"
                  class="bg-black text-white px-4 py-2 font-black border-2 border-black hover:-translate-y-1 transition-all h-[60px] dark:bg-white dark:text-black dark:border-white"
                  :disabled="(!chatInput.trim() && attachedImages.length === 0) || isSimulatingChat">
                  <i class="pi pi-send"></i>
               </button>
            </form>
         </div>
      </aside>

      <!-- RIGHT PANEL: LIVE SANDBOX (65%) -->
      <main class="flex-1 flex flex-col h-full bg-gray-200 relative dark:bg-[#050505]">
         <header class="p-2 border-b-4 border-black bg-white flex justify-between items-center shrink-0 z-10 dark:bg-[#111] dark:border-[#222]">
            <div class="flex items-center gap-4 pl-2">
               <button @click="isChatSidebarVisible = !isChatSidebarVisible" title="Toggle AI Builder" class="bg-gray-100 border-2 border-black px-2 py-1 hover:bg-neo-yellow transition-colors dark:bg-[#222] dark:border-[#444] dark:text-white dark:hover:bg-white dark:hover:text-black">
                 <i :class="isChatSidebarVisible ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
               </button>
               <h1 class="text-sm font-black uppercase text-gray-600 dark:text-gray-300"><i class="pi pi-desktop mr-2"></i> Live Preview
               </h1>
            </div>
            <div class="flex gap-2">
               <div class="flex bg-gray-100 border-2 border-black mr-4 dark:bg-[#222] dark:border-[#444]">
                  <button @click="previewSize = 'desktop'"
                     :class="['px-2 py-1', previewSize === 'desktop' ? 'bg-neo-yellow text-black' : 'text-gray-400 hover:text-black dark:text-gray-400 dark:hover:text-white']"
                     title="Desktop"><i class="pi pi-desktop"></i></button>
                  <button @click="previewSize = 'tablet'"
                     :class="['px-2 py-1 border-l-2 border-r-2 border-black dark:border-[#444]', previewSize === 'tablet' ? 'bg-neo-yellow text-black' : 'text-gray-400 hover:text-black dark:text-gray-400 dark:hover:text-white']"
                     title="Tablet"><i class="pi pi-tablet"></i></button>
                  <button @click="previewSize = 'mobile'"
                     :class="['px-2 py-1', previewSize === 'mobile' ? 'bg-neo-yellow text-black' : 'text-gray-400 hover:text-black dark:text-gray-400 dark:hover:text-white']"
                     title="Mobile"><i class="pi pi-mobile"></i></button>
               </div>
               <button @click="exportProjectToZip" :disabled="!generatedCode || isExporting"
                  class="text-xs px-3 py-1 font-black uppercase border-2 border-black bg-neo-green text-black hover:bg-green-400 transition-colors mr-2 disabled:opacity-50 dark:bg-[#111] dark:text-gray-100 dark:border-[#444] dark:hover:bg-white dark:hover:text-black">
                  <i :class="isExporting ? 'pi pi-spin pi-spinner' : 'pi pi-download'" class="mr-1"></i> {{ isExporting
                     ?
                  'Exporting...' : 'Export Project' }}
               </button>
               <div class="flex border-2 border-black mr-2 dark:border-[#222]">
                  <button @click="viewMode = 'preview'" :class="['text-xs px-3 py-1 font-black uppercase border-r-2 border-black dark:border-[#222]', viewMode === 'preview' ? 'bg-neo-yellow text-black' : 'bg-gray-100 hover:bg-gray-200 dark:bg-[#111] dark:text-gray-100 dark:hover:bg-white dark:hover:text-black']"><i class="pi pi-desktop mr-1"></i> Preview</button>
                  <button @click="viewMode = 'compare'" :class="['text-xs px-3 py-1 font-black uppercase', viewMode === 'compare' ? 'bg-neo-yellow text-black' : 'bg-gray-100 hover:bg-gray-200 dark:bg-[#111] dark:text-gray-100 dark:hover:bg-white dark:hover:text-black']"><i class="pi pi-images mr-1"></i> Compare</button>
               </div>
               <button @click="refreshIframe"
                  class="text-xs px-3 py-1 bg-black text-white hover:-translate-y-0.5 transition-transform font-black uppercase">
                  <i class="pi pi-refresh"></i>
               </button>
            </div>
         </header>

         <!-- App Preview -->
         <div v-show="viewMode === 'preview'"
            :class="['flex-1 overflow-hidden relative w-full h-full flex justify-center', previewSize === 'desktop' ? 'p-0' : 'bg-gray-200 p-4 dark:bg-[#050505]']">
            <div :class="[
               'h-full transition-all duration-300 mx-auto overflow-hidden relative',
               previewSize === 'desktop' ? 'w-full border-none' : 'border-4 border-black bg-white dark:bg-[#111]',
               previewSize === 'tablet' ? 'w-[768px] mt-10 max-h-[1024px]' : '',
               previewSize === 'mobile' ? 'w-[375px] max-w-full' : ''
            ]">
               <iframe ref="sandboxIframe" :srcdoc="finalHtml" class="w-full h-full border-none bg-transparent"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals"></iframe>
            </div>

            <div v-if="!generatedCode"
               class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400 z-10">
               <i class="pi pi-code text-6xl mb-4"></i>
               <h2 class="font-black uppercase text-xl">Canvas Kosong</h2>
               <p class="text-sm">Minta AI membuatkan sesuatu lewat chat.</p>
            </div>
         </div>

         <!-- Compare View (Side-by-Side) -->
         <div v-show="viewMode === 'compare'"
            class="flex-1 flex overflow-hidden w-full h-full bg-gray-300 dark:bg-[#000]">
            
            <!-- Panel Kiri: Original -->
            <div class="w-1/2 h-full border-r-4 border-black dark:border-[#222] relative overflow-y-auto bg-white dark:bg-[#0a0a0a]">
               <div class="absolute top-4 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 text-xs font-black uppercase z-10 border-2 border-white pointer-events-none opacity-80">Original Reference</div>
               <img v-if="currentReferenceImage" :src="currentReferenceImage" class="w-full h-auto block" />
               <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-black font-black bg-white">
                  <i class="pi pi-image text-2xl mb-2 block text-center"></i>
                  Belum ada gambar referensi.
               </div>
            </div>

            <!-- Panel Kanan: Generated -->
            <div class="w-1/2 h-full relative overflow-y-auto bg-gray-200 dark:bg-[#050505] flex flex-col items-center">
               <div class="absolute top-4 left-1/2 -translate-x-1/2 bg-neo-green text-black px-3 py-1 text-xs font-black uppercase z-10 border-2 border-black pointer-events-none opacity-80">Generated UI</div>
               
               <div :class="[
                  'h-full transition-all duration-300 shrink-0 w-full',
                  previewSize === 'desktop' ? 'border-none' : 'border-4 border-black bg-white dark:bg-[#111] my-10',
                  previewSize === 'tablet' ? 'max-w-[768px]' : '',
                  previewSize === 'mobile' ? 'max-w-[375px]' : ''
               ]">
                  <iframe :srcdoc="finalHtml" class="w-full h-full border-none bg-transparent"
                     sandbox="allow-scripts allow-same-origin allow-forms allow-modals"></iframe>
               </div>
               <div v-if="!generatedCode" class="absolute inset-0 flex items-center justify-center font-bold text-gray-500 z-0">
                  Canvas Kosong
               </div>
            </div>
         </div>
      </main>
   </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { marked } from 'marked'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import TypedMarkdown from '@/components/TypedMarkdown.vue'
import { useSettings } from '@/composables/useSettings'
import { directGenerateStream } from '@/services/aiGateway'
import antiSlopPrompt from '@/assets/AntiSlopPrompt.md?raw'

const { apiBaseUrl } = useSettings()

// --- State ---
const zoomedImage = ref(null)
const chatInput = ref('')
const attachedImages = ref([])
const isSimulatingChat = ref(false)
const chatContainer = ref(null)
const viewMode = ref('preview') // 'preview' | 'code' | 'compare'
const previewSize = ref('desktop') // 'desktop' | 'tablet' | 'mobile'
const isExporting = ref(false)
const exportLog = ref('')
const exportLogContainer = ref(null)
const currentAbortController = ref(null)
const isChatSidebarVisible = ref(true)

const pages = ref([
   { id: Date.now(), name: 'Home', chatHistory: [], generatedCode: '' }
])
const activePageId = ref(pages.value[0].id)
const activePage = computed(() => pages.value.find(p => p.id === activePageId.value))

const isAddingPage = ref(false)
const newPageName = ref('')
const editingPageId = ref(null)

const chatHistory = computed(() => activePage.value ? activePage.value.chatHistory : [])
const generatedCode = computed({
   get: () => activePage.value ? activePage.value.generatedCode : '',
   set: (val) => {
      if (activePage.value) activePage.value.generatedCode = val
   }
})

const currentReferenceImage = computed(() => {
   if (!activePage.value) return null;
   const history = activePage.value.chatHistory;
   for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      if (msg.role === 'user' && msg.images && msg.images.length > 0) {
         return msg.images[msg.images.length - 1]; // Gambar paste user terakhir
      }
      if (msg.role === 'agent') {
         // Cek jika ada URL Thum.io di output markdown agent
         const match = msg.content.match(/!\[.*?\]\((https:\/\/image\.thum\.io\/[^\)]+)\)/);
         if (match) return match[1];
      }
   }
   return null;
})

const vFocus = {
  mounted: (el) => {
    setTimeout(() => {
      el.focus()
      if (el.select) el.select()
    }, 50)
  }
}

const newPageInputRef = ref(null)

const startAddPage = async () => {
   isAddingPage.value = true
   newPageName.value = ''
   await nextTick()
   if (newPageInputRef.value) {
       newPageInputRef.value.focus()
   }
}

const confirmAddPage = () => {
   if (!newPageName.value.trim()) {
      isAddingPage.value = false
      return
   }

   const newId = Date.now()
   pages.value.push({
      id: newId,
      name: newPageName.value.trim(),
      chatHistory: [],
      generatedCode: ''
   })
   activePageId.value = newId
   isAddingPage.value = false
}

const cancelAddPage = () => {
   isAddingPage.value = false
}

const deletePage = (id) => {
   if (pages.value.length === 1) {
      return // Abaikan jika ini halaman terakhir
   }
   
   pages.value = pages.value.filter(p => p.id !== id)
   if (activePageId.value === id) {
      activePageId.value = pages.value[0].id
   }
}

// The wrapper template that injects Tailwind and Vue into the sandbox
const finalHtml = computed(() => {
   if (!generatedCode.value) return ''

   return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sandbox</title>
      <script src="https://cdn.tailwindcss.com"><\/script>
      <script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet">
      <style>
         body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; transition: background-color 0.3s, color 0.3s; }
         /* Allow Vue to mount here smoothly */
         #app { min-height: 100vh; }
      </style>
      <script>
        tailwind.config = {
          darkMode: 'class',
          theme: { extend: {} }
        }
        
        // Sync dark mode from parent
        const syncDarkMode = () => {
            try {
                if (window.parent && window.parent.document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } catch (e) {}
        };
        
        // Run once on load
        window.addEventListener('DOMContentLoaded', syncDarkMode);
        
        // Setup a mutation observer on the parent to catch toggles
        try {
            if (window.parent) {
                const observer = new MutationObserver(syncDarkMode);
                observer.observe(window.parent.document.documentElement, { attributes: true, attributeFilter: ['class'] });
            }
        } catch (e) {}
      <\/script>
    </head>
    <body class="bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
      ${generatedCode.value}
      
      <!-- Auto mount Vue if the AI provided an app setup script -->
      <script>
        // If AI outputs plain HTML, this does nothing harmful.
        // If AI outputs Vue code, they should write '<div id="app">...</div>' and mount to it.
      <\/script>
    </body>
    </html>
  `
})

// --- Chat Logic ---
const handlePaste = (e) => {
   const items = (e.clipboardData || e.originalEvent.clipboardData).items;
   for (let index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
         const blob = item.getAsFile();
         const reader = new FileReader();
         reader.onload = (event) => {
            attachedImages.value.push(event.target.result);
         };
         reader.readAsDataURL(blob);
      }
   }
};

const removeAttachedImage = (index) => {
   attachedImages.value.splice(index, 1);
};

const sendMessage = async () => {
   if ((!chatInput.value.trim() && attachedImages.value.length === 0) || isSimulatingChat.value || !activePage.value) return
   
   let userMsg = chatInput.value.trim()
   const userImages = [...attachedImages.value]
   
   // Auto-detect URL to generate screenshot
   const urlMatch = userMsg.match(/(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/i);
   if (urlMatch) {
      isSimulatingChat.value = true; // Kunci UI selagi mengambil screenshot
      let targetUrl = urlMatch[0];
      if (!targetUrl.startsWith('http')) {
         targetUrl = 'https://' + targetUrl;
      }
      
      let screenshotUrl = `https://image.thum.io/get/width/1280/crop/800/noanimate/${targetUrl}`;
      try {
         // Gunakan Microlink API dengan parameter fullPage agar mengambil seluruh isi halaman (dari atas ke bawah)
         const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&screenshot=true&meta=false&screenshot.fullPage=true`);
         const data = await res.json();
         if (data.status === 'success' && data.data?.screenshot?.url) {
            screenshotUrl = data.data.screenshot.url;
         }
      } catch (e) {
         console.warn('Microlink failed, falling back to thum.io', e);
      }
      
      userMsg += `\n\n(Catatan Sistem: URL terdeteksi. Saya melampirkan screenshot dari website ${targetUrl}. Tolong buatkan UI persis berdasarkan gambar screenshot yang terlampir ini.)`;
      if (!userImages.includes(screenshotUrl)) {
         userImages.push(screenshotUrl);
      }
      isSimulatingChat.value = false;
   }
   
   chatInput.value = ''
   attachedImages.value = []

   activePage.value.chatHistory.push({ role: 'user', content: userMsg, images: userImages })
   isSimulatingChat.value = true

   const agentMsgIndex = activePage.value.chatHistory.length
   activePage.value.chatHistory.push({ role: 'agent', content: '' })

   scrollToBottom()

   try {
      const systemPrompt = `You are an elite Frontend Web Developer and UI/UX Designer.
If the user asks a general question or just chats, politely DECLINE. Tell them you are exclusively an AI UI Builder. Do NOT generate code unless asked to build or modify a UI.

CRITICAL INSTRUCTION (EXACT REPLICATION):
Jika pengguna melampirkan gambar screenshot website atau UI, Anda WAJIB menirunya 100% SAMA PERSIS seperti yang terlihat di gambar. JANGAN berimprovisasi, JANGAN mengubah tata letak, warna, atau tipografi. Cocokkan desain piksel demi piksel sebaik mungkin.

HOWEVER, when you are actually writing the code to build, create, or modify a UI, you MUST follow these CRITICAL RULES:

1. CODE FORMAT: ALWAYS output your complete UI code inside a single \`\`\`html ... \`\`\` block. Do not split the code into multiple files.
2. FLEXIBLE FRAMEWORK: You are FREE to use any UI framework (Vanilla JS, Vue via CDN, React via CDN/Babel, AlpineJS, etc). Just make sure everything runs natively inside the single HTML file without a build step. Use TailwindCSS via CDN for styling.

---
MANDATORY DESIGN & AESTHETICS RULES (Anti-Slop Guidelines):
${antiSlopPrompt}
---

The final code MUST be beautiful at first glance and immediately executable.`

      currentAbortController.value = new AbortController()
      const signal = currentAbortController.value.signal;
      let fullResponse = ''

      await new Promise((resolve, reject) => {
         let queue = ''
         let isTyping = false
         let streamFinished = false
         let lastRenderTime = 0
         let timerId = null

         const onAbort = () => {
            if (timerId) clearTimeout(timerId)
            isTyping = false
            reject({ name: 'AbortError' })
         }

         signal.addEventListener('abort', onAbort, { once: true })

         const typeQueue = () => {
            if (signal.aborted) {
               onAbort()
               return
            }
            
            if (queue.length > 0) {
               isTyping = true
               
               const currentText = activePage.value.chatHistory[agentMsgIndex].content;
               const tickCount = (currentText.match(/```/g) || []).length;
               const isInCodeBlock = (tickCount % 2) !== 0;

               let chars = '';
               if (isInCodeBlock) {
                  chars = queue; // Skip typing effect for code
               } else {
                  chars = queue.substring(0, 2); // 2 chars per 15ms for text
               }
               
               queue = queue.substring(chars.length)
               
               activePage.value.chatHistory[agentMsgIndex].content += chars
               scrollToBottom()
               
               // Real-time render yang di-throttle agar iframe tidak mati (crash)
               if (isInCodeBlock) {
                  const now = Date.now();
                  if (now - lastRenderTime > 1500) {
                     autoApplyCode(activePage.value.chatHistory[agentMsgIndex].content, false);
                     lastRenderTime = now;
                  }
               }
               
               timerId = setTimeout(typeQueue, isInCodeBlock ? 1 : 15)
            } else {
               isTyping = false
               if (streamFinished) {
                  signal.removeEventListener('abort', onAbort)
                  resolve()
               }
            }
         }

         directGenerateStream(
            systemPrompt,
            activePage.value.chatHistory,
            (chunk) => {
               if (signal.aborted) return;
               fullResponse += chunk
               queue += chunk
               if (!isTyping) typeQueue()
            },
            () => { 
               streamFinished = true
               if (!isTyping) {
                  signal.removeEventListener('abort', onAbort)
                  resolve()
               }
            },
            (err) => { 
               signal.removeEventListener('abort', onAbort)
               reject(err)
            },
            currentAbortController.value.signal
         )
      })

      autoApplyCode(fullResponse)

   } catch (err) {
      if (err.name === 'AbortError') {
         activePage.value.chatHistory[agentMsgIndex].content += "\n\n**[Dihentikan oleh pengguna]**"
      } else {
         activePage.value.chatHistory[agentMsgIndex].content = `Gagal terhubung ke AI. Error: ${err.message}`
      }
   } finally {
      isSimulatingChat.value = false
      currentAbortController.value = null
   }
}

const stopAI = () => {
   if (currentAbortController.value) {
      currentAbortController.value.abort()
   }
   isSimulatingChat.value = false
}

const scrollToBottom = () => {
   nextTick(() => {
      if (chatContainer.value) {
         chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
   })
}

// --- Export Logic ---
const scrollToExportBottom = () => {
   nextTick(() => {
      if (exportLogContainer.value) {
         exportLogContainer.value.scrollTop = exportLogContainer.value.scrollHeight
      }
   })
}

const exportProjectToZip = async () => {
   if (!generatedCode.value) return
   isExporting.value = true
   exportLog.value = 'Initializing Frontend Export Engine...\n'

   try {
      exportLog.value += 'Building Virtual File System...\n'
      
      const files = [
         { path: 'package.json', content: JSON.stringify({ name: "makarya-project", version: "1.0.0", dependencies: { "vue": "^3.3.0" }, devDependencies: { "vite": "^5.0.0", "@vitejs/plugin-vue": "^5.0.0" } }, null, 2) },
         { path: 'index.html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Makarya App</title>\n  <script src="https://cdn.tailwindcss.com"><\\/script>\n</head>\n<body>\n  <div id="app"></div>\n  <script type="module" src="/src/main.js"><\\/script>\n</body>\n</html>' },
         { path: 'vite.config.js', content: 'import { defineConfig } from "vite";\nimport vue from "@vitejs/plugin-vue";\nexport default defineConfig({\n  plugins: [vue()],\n});' },
         { path: 'src/main.js', content: 'import { createApp } from "vue"\nimport App from "./App.vue"\n\ncreateApp(App).mount("#app")' }
      ]

      pages.value.forEach(p => {
         if (p.generatedCode) {
            const safeName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            files.push({
               path: `src/pages/${safeName}.vue`,
               content: `<template>\n${p.generatedCode}\n</template>`
            });
         }
      });
      
      files.push({
         path: 'src/App.vue',
         content: `<template>\n${generatedCode.value}\n</template>`
      });

      exportLog.value += '\nParsing Virtual File System...\n'
      scrollToExportBottom()

      const zip = new JSZip()
      files.forEach(f => {
         exportLog.value += `[ADDED] ${f.path}\n`
         scrollToExportBottom()
         zip.file(f.path, f.content)
      })

      exportLog.value += '\nCompressing package...\n'
      scrollToExportBottom()

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, 'makarya-exported-project.zip')

      exportLog.value += 'DONE! Project exported successfully.\n'
      scrollToExportBottom()

      setTimeout(() => {
         isExporting.value = false
      }, 1500)

   } catch (error) {
      console.error('Export Error:', error)
      exportLog.value += `\n[ERROR] ${error.message}\n`
      alert('Gagal melakukan export project. Coba lagi.')
      isExporting.value = false
   }
}

// --- Markdown & Parser ---
const parseMessageContent = (content) => {
   const blocks = []
   // Regex ini akan menangkap kode meskipun terpotong di akhir tanpa ```
   const regex = /```(?:html|vue|xml)?\s*\n([\s\S]*?)(?:```|$)/gi
   let lastIdx = 0
   let match

   while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIdx) {
         blocks.push({ type: 'text', content: content.substring(lastIdx, match.index) })
      }
      blocks.push({
         type: 'code',
         code: match[1].trim()
      })
      lastIdx = regex.lastIndex
   }
   if (lastIdx < content.length) {
      blocks.push({ type: 'text', content: content.substring(lastIdx) })
   }
   return blocks
}

const renderMarkdown = (text) => {
   return marked.parse(text)
}

// --- Sandbox Controls ---
const applyCodeToSandbox = (code) => {
   generatedCode.value = code
   viewMode.value = 'preview'
}

const autoApplyCode = (fullMessage, switchView = true) => {
   // Find all code blocks and apply the last valid one (even if incomplete)
   const regex = /```(?:html|vue|xml)?\s*\n([\s\S]*?)(?:```|$)/gi
   let match;
   let lastCode = '';
   while ((match = regex.exec(fullMessage)) !== null) {
      if (match[1]) {
         lastCode = match[1].trim();
      }
   }
   if (lastCode) {
      if (switchView) {
         applyCodeToSandbox(lastCode);
      } else {
         generatedCode.value = lastCode;
      }
   }
}

const refreshIframe = () => {
   // Memaksa iframe re-render dengan memanipulasi code sebentar
   const temp = generatedCode.value
   generatedCode.value = ''
   setTimeout(() => { generatedCode.value = temp }, 10)
}
</script>

<style>
/* Base utilities */
.shadow-brutal-sm {
   box-shadow: 4px 4px 0px 0px #000000;
}
</style>
