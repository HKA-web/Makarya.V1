<template>
 <div class="flex flex-col h-full w-full overflow-hidden">
 <!-- Navbar is outside the scrolling area -->
 <Navbar class="shrink-0" @toggle-sidebar="isSidebarVisible = !isSidebarVisible" />

 <div class="flex flex-1 w-full min-h-0 overflow-hidden">
 <Sidebar v-show="isSidebarVisible" />

 <div class="flex-1 flex flex-col min-w-0 bg-neo-bg dark:bg-[#050505]">
 <!-- Tabs Bar -->
 <div v-if="tabStore.tabs.length > 0" class="flex bg-white border-b-4 border-black overflow-x-auto custom-scrollbar shrink-0 dark:bg-[#0a0a0a] dark:border-[#222]">
 <div v-for="tab in tabStore.tabs" :key="tab.path"
 @click="router.push(tab.path)"
 class="flex items-center gap-2 px-4 py-2 border-r-4 border-black cursor-pointer font-bold font-mono text-sm transition-all group dark:border-[#222]"
 :class="route.path === tab.path ? 'bg-black text-white dark:bg-white dark:text-black translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black ] dark:bg-[#111] dark:text-gray-100'"> 
 <i :class="tab.icon"></i>
 <span class="whitespace-nowrap">{{ tab.title }}</span>
 <i @click.stop="closeTab(tab.path)" class="pi pi-times ml-3 opacity-50 hover:opacity-100 hover:text-red-500 hover:scale-125 transition-all text-xs"></i>
 </div>
 </div>

 <main class="flex-1 overflow-y-auto relative">
 <router-view v-slot="{ Component }">
 <keep-alive :include="cachedViews">
 <component :is="Component" />
 </keep-alive>
 </router-view>
 </main>
 </div>
 </div>
 
 <ApiModal 
 :isVisible="store.isDialogVisible"
 :selectedApi="store.selectedApi"
 @close="store.closeApiDetails"
 @testApi="testFromModal"
 />
 </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApiStore } from '@/stores/apiStore';
import { useTabStore } from '@/stores/tabStore';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import ApiModal from '@/components/api/ApiModal.vue';

const router = useRouter();
const route = useRoute();
const store = useApiStore();
const tabStore = useTabStore();
const isSidebarVisible = ref(true);

onMounted(() => {
 store.fetchApis();
 if (route.meta && route.meta.title) {
 tabStore.addTab(route);
 }
});

watch(route, (newRoute) => {
 if (newRoute.meta && newRoute.meta.title) {
 tabStore.addTab(newRoute);
 }
});

const cachedViews = computed(() => {
 return tabStore.tabs.map(t => t.componentName).filter(Boolean);
});

const closeTab = (path) => {
 tabStore.removeTab(path);
 
 if (route.path === path) {
 if (tabStore.tabs.length > 0) {
 router.push(tabStore.tabs[tabStore.tabs.length - 1].path);
 } else {
 router.push('/');
 }
 }
};

const testFromModal = (api) => {
 store.initialTestUrl = `https://api.${api.provider.toLowerCase()}.com/v1/ping`;
 store.closeApiDetails();
 router.push('/tester');
};
</script>
