<template>
  <div class="p-4 md:p-8 max-w-5xl mx-auto pb-32">
    <div class="flex items-center justify-between mb-8 border-b-4 border-black pb-4 dark:border-[#222]">
      <div class="flex items-center gap-4">
        <button
          v-if="route.path === '/settings'"
          type="button"
          @click="router.back()"
          class="bg-black text-white dark:bg-white dark:text-black font-black w-10 h-10 border-4 border-black hover:-translate-y-1 hover:-translate-x-1 transition-all flex items-center justify-center dark:text-gray-100 dark:border-[#222]"
          title="Go back"
        >
          <i class="pi pi-arrow-left"></i>
        </button>
        <h1 class="text-4xl font-black uppercase tracking-tight">System Settings</h1>
      </div>
      <button
        type="button"
        @click="loadConfig"
        :disabled="isLoading || isSaving"
        class="bg-white text-black font-black text-sm uppercase py-2 px-4 border-4 border-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:-translate-y-1 hover:-translate-x-1 transition-all active:translate-y-0 active:translate-x-0 disabled:opacity-50 flex items-center gap-2 dark:bg-white dark:text-black dark:border-[#222]" 
        title="Reload from disk"
      >
        <i class="pi pi-refresh" :class="{ 'pi-spin': isLoading }"></i> Reload
      </button>
    </div>
    
    <div v-if="isLoading" class="flex justify-center p-12">
      <i class="pi pi-spin pi-spinner text-6xl text-neo-blue"></i>
    </div>
    
    <form v-else @submit.prevent="handleSaveConfig" class="space-y-8">
      
      <!-- Core Settings Card -->
      <div class="bg-white border-4 border-black p-6 relative dark:bg-[#0a0a0a] dark:border-[#222]">
        <div class="absolute -top-4 -right-4 bg-neo-purple text-black dark:bg-white dark:text-black font-black px-4 py-1 border-4 border-black transform rotate-3 dark:border-[#222]">
          CORE
        </div>
        <h2 class="font-black uppercase text-xl mb-6 flex items-center gap-2">
          <i class="pi pi-server"></i> System Connection
        </h2>
        
        <div class="grid grid-cols-1 gap-6">
          <div>
            <label class="block font-bold uppercase text-sm mb-2 dark:text-gray-300">Adminer Port</label>
            <input
              type="number"
              v-model="config.adminerPort"
              class="w-full border-4 border-black p-3 font-mono focus:outline-none transition-colors dark:border-[#333] dark:bg-[#0d0d0d] dark:text-gray-100"
              placeholder="8002"
              required
            />
            <p class="text-xs text-gray-500 font-mono mt-1 dark:text-gray-400">Port for the bundled PHP Adminer server.</p>
          </div>
        </div>
      </div>

      <!-- AI Providers Card -->
      <div class="bg-white border-4 border-black p-6 relative dark:bg-[#0a0a0a] dark:border-[#222]">
        <div class="absolute -top-4 -right-4 bg-neo-blue text-black dark:bg-white dark:text-black font-black px-4 py-1 border-4 border-black transform -rotate-2 dark:border-[#222]">
          AI PROVIDERS
        </div>
        
        <div class="flex justify-between items-end mb-6 border-b-2 border-dashed border-gray-300 pb-4 dark:border-[#333]">
          <h2 class="font-black uppercase text-xl flex items-center gap-2">
            <i class="pi pi-microchip-ai"></i> AI Providers
          </h2>
        </div>

        <div v-if="providerList.length === 0" class="text-center p-8 bg-gray-50 border-4 border-black border-dashed dark:bg-[#111] dark:border-[#222]">
          <p class="font-mono text-gray-500 font-bold mb-2 dark:text-gray-400">No AI Providers configured.</p>
        </div>

        <div class="space-y-6">
          <div v-for="(provider, index) in providerList" :key="index" class="p-5 border-4 border-black bg-gray-50 relative group dark:border-[#222] dark:bg-[#111]">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold uppercase text-xs mb-1 dark:text-gray-300">Provider ID (Name)</label>
                <input
                  type="text"
                  v-model="provider.name"
                  class="w-full border-4 border-black p-2 font-mono text-sm focus:outline-none transition-colors dark:border-[#333] bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-[#222] dark:text-gray-400 font-bold"
                  placeholder="e.g. 9router"
                  readonly
                  required
                />
              </div>
              <div>
                <label class="block font-bold uppercase text-xs mb-1 dark:text-gray-300">API Key</label>
                <input
                  type="password"
                  v-model="provider.key"
                  class="w-full border-4 border-black p-2 font-mono text-sm focus:outline-none transition-colors dark:border-[#333] dark:bg-[#0d0d0d] dark:text-gray-100"
                  placeholder="sk-..."
                />
              </div>
              <div class="md:col-span-2">
                <label class="block font-bold uppercase text-xs mb-1 dark:text-gray-300">Base URL</label>
                <input
                  type="url"
                  v-model="provider.url"
                  class="w-full border-4 border-black p-2 font-mono text-sm focus:outline-none transition-colors dark:border-[#333] dark:bg-[#0d0d0d] dark:text-gray-100"
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block font-bold uppercase text-xs mb-1 dark:text-gray-300">Supported Models</label>
                <input
                  type="text"
                  v-model="provider.models"
                  class="w-full border-4 border-black p-2 font-mono text-sm focus:outline-none transition-colors dark:border-[#333] dark:bg-[#0d0d0d] dark:text-gray-100"
                  placeholder="gpt-4, gpt-3.5-turbo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="flex sticky bottom-8 mt-8">
        <button
          type="submit"
          :disabled="isSaving"
          class="w-full bg-black text-white dark:bg-white dark:text-black font-black text-xl uppercase py-4 border-4 border-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 dark:border-[#222]"
        >
          <i class="pi" :class="isSaving ? 'pi-spin pi-spinner' : 'pi-save'"></i> 
          {{ isSaving ? 'Saving Configuration...' : 'Save Configuration' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from '@/composables/useToast';
import { useRouter, useRoute } from 'vue-router';

const toast = useToast();
const router = useRouter();
const route = useRoute();

const isLoading = ref(true);
const isSaving = ref(false);

const config = ref({
  adminerPort: 8002,
  ai_default: ''
});

const providerList = ref([]);

const loadConfig = async () => {
  isLoading.value = true;
  try {
    if (window.electronAPI && window.electronAPI.getConfig) {
      const data = await window.electronAPI.getConfig();
      if (data) {
        config.value = {
          adminerPort: data.adminerPort || 8002,
          ai_default: data.ai_default || ''
        };

        // Parse providers into array format for the UI
        const providers = data.providers || {};
        providerList.value = Object.keys(providers).map(name => {
          const p = providers[name];
          return {
            name: name,
            key: p.key || '',
            url: p.url || '',
            models: Array.isArray(p.models) ? p.models.join(', ') : ''
          };
        });
        
        // Enforce exactly 1 provider
        if (providerList.value.length === 0) {
          providerList.value.push({ name: config.value.ai_default || '9router', key: '', url: '', models: '' });
        } else if (providerList.value.length > 1) {
          providerList.value = [providerList.value[0]];
        }
      }
    } else {
      toast.error('Electron API not available');
    }
  } catch (e) {
    toast.error('Failed to load config.json');
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const handleSaveConfig = async () => {
  isSaving.value = true;
  
  try {
    // Reconstruct the providers object from the array
    const providersObj = {};
    providerList.value.forEach(p => {
      if (p.name && p.name.trim() !== '') {
        providersObj[p.name.trim()] = {
          key: p.key,
          url: p.url,
          models: p.models.split(',').map(m => m.trim()).filter(m => m.length > 0)
        };
      }
    });

    if (providerList.value.length > 0 && providerList.value[0].name) {
      config.value.ai_default = providerList.value[0].name.trim();
    }

    if (window.electronAPI && window.electronAPI.saveConfig) {
      const newConfig = {
        adminerPort: Number(config.value.adminerPort),
        ai_default: config.value.ai_default,
        providers: providersObj
      };
      
      const success = await window.electronAPI.saveConfig(newConfig);
      if (success) {
        toast.success('Configuration saved successfully!');
      } else {
        toast.error('Failed to save config.json');
      }
    } else {
      toast.error('Electron API not available');
    }
  } catch (e) {
    toast.error('An error occurred while saving');
    console.error(e);
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  loadConfig();
});
</script>
