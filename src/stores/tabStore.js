import { defineStore } from 'pinia';

export const useTabStore = defineStore('tab', {
  state: () => ({
    tabs: [],
    activeTab: '/'
  }),
  actions: {
    addTab(route) {
      const exists = this.tabs.find(tab => tab.path === route.path);
      if (!exists && route.meta && route.meta.title) {
        this.tabs.push({
          path: route.path,
          name: route.name, 
          componentName: route.meta.componentName,
          title: route.meta.title,
          icon: route.meta.icon || 'pi pi-file'
        });
      }
      this.activeTab = route.path;
    },
    removeTab(path) {
      const index = this.tabs.findIndex(tab => tab.path === path);
      if (index !== -1) {
        this.tabs.splice(index, 1);
      }
    },
    clearTabs() {
      this.tabs = [];
    }
  }
});
