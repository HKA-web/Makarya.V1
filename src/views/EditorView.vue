<template>
 <div
 class="h-full w-full bg-[#f4f4f0] dark:bg-[#050505] flex flex-col overflow-hidden text-black font-sans selection:bg-[#4ade80] relative dark:text-gray-100">

 <!-- Initial State: Open Project -->
 <div v-if="!isProjectOpen"
 class="bg-[#facc15] dark:bg-[#050505] flex-1 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
 <div class="absolute -right-10 -top-10 w-64 h-64 bg-[#f472b6] dark:bg-[#111] rounded-full border-4 border-black z-0 opacity-50 dark:border-[#222]">
 </div>

 <h3 class="text-4xl font-black uppercase mb-4 relative z-10 bg-white px-4 py-2 border-4 border-black dark:bg-[#0a0a0a] dark:border-[#222]">
 Open Your Project
 </h3>

 <div class="relative z-10 flex flex-col md:flex-row gap-6">
 <button @click="$router.push('/dashboard')"
 class="bg-white text-black border-4 border-black font-black text-xl px-8 py-4 uppercase hover:-translate-y-2 hover: transition-all flex items-center gap-3 dark:bg-[#0a0a0a] dark:text-gray-100 dark:border-[#222]">
 <i class="pi pi-arrow-left"></i> Dashboard
 </button>
 <button @click="openProject"
 class="bg-[#3b82f6] dark:bg-[#111] text-white border-4 border-black font-black text-xl px-8 py-4 uppercase hover:-translate-y-2 hover: transition-all flex items-center gap-3 dark:border-[#222]">
 <i class="pi pi-folder"></i> Open Project
 </button>
 </div>
 </div>

 <!-- Workspace State -->
 <div v-else class="flex-1 flex flex-col min-h-0 bg-[#f4f4f0] dark:bg-[#050505]">

 <!-- Feature Tabs -->
 <div class="flex flex-row px-3 pt-3 gap-4 shrink-0 bg-[#f4f4f0] dark:bg-[#050505]">
 <button @click="activeMainTab = 'editor'"
 class="border-4 border-black px-6 py-2 font-black text-sm uppercase flex items-center justify-between min-w-[200px] transition-transform hover:-translate-y-1 dark:border-[#222]"
 :class="activeMainTab === 'editor' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] dark:text-gray-100'"> 
 <span><i class="pi pi-code mr-2"></i> EDITOR</span>
 </button>
 <button @click="activeMainTab = 'database'"
 class="border-4 border-black px-6 py-2 font-black text-sm uppercase flex items-center justify-between min-w-[200px] transition-transform hover:-translate-y-1 dark:border-[#222]"
 :class="activeMainTab === 'database' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] dark:text-gray-100'"> 
 <span><i class="pi pi-database mr-2"></i> DATABASE</span>
 </button>
 <button @click="activeMainTab = 'tester'"
 class="border-4 border-black px-6 py-2 font-black text-sm uppercase flex items-center justify-between min-w-[200px] transition-transform hover:-translate-y-1 dark:border-[#222]"
 :class="activeMainTab === 'tester' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] dark:text-gray-100'"> 
 <span><i class="pi pi-send mr-2"></i> API TESTER</span>
 </button>
 </div>

 <!-- Editor Content -->
 <div v-show="activeMainTab === 'editor'" class="flex-1 flex flex-row min-h-0 p-3 gap-3">

 <!-- Activity Bar -->
 <div class="w-16 bg-white border-4 border-black flex flex-col items-center py-4 shrink-0 justify-between z-10 dark:bg-[#0a0a0a] dark:border-[#222]">
 <div class="flex flex-col gap-4 w-full px-2">
 <button @click="activeSidebar = activeSidebar === 'explorer' ? 'none' : 'explorer'"
 class="w-full aspect-square flex items-center justify-center border-4 border-black hover:-translate-y-1 hover: transition-all dark:border-[#222]"
 :class="activeSidebar === 'explorer' ? 'bg-black text-white dark:bg-white dark:text-black -translate-y-1' : 'bg-white text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] dark:text-gray-100'">
 <i class="pi pi-copy text-xl"></i>
 </button>
 <button @click="activeSidebar = activeSidebar === 'search' ? 'none' : 'search'"
 class="w-full aspect-square flex items-center justify-center border-4 border-black hover:-translate-y-1 hover: transition-all dark:border-[#222]"
 :class="activeSidebar === 'search' ? 'bg-black text-white dark:bg-white dark:text-black -translate-y-1' : 'bg-white text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] dark:text-gray-100'">
 <i class="pi pi-search text-xl"></i>
 </button>
 <button @click="runAgent('chat')"
 class="w-full aspect-square flex items-center justify-center border-4 border-black hover:-translate-y-1 hover: transition-all dark:border-[#222]"
 :class="isChatSidebarVisible ? 'bg-black text-white dark:bg-white dark:text-black -translate-y-1' : 'bg-white text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] dark:text-gray-100'" 
 title="Chat Agent">
 <i class="pi pi-comments text-xl"></i>
 </button>
 <button v-for="plugin in dynamicActivityBarPlugins" :key="plugin.id"
 @click="handlePluginButtonClick(plugin)"
 class="w-full aspect-square flex items-center justify-center border-4 border-black hover:-translate-y-1 hover: transition-all dark:border-[#222]"
 :class="isPluginActive(plugin) ? 'bg-black text-white dark:bg-white dark:text-black -translate-y-1' : 'bg-white text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] dark:text-gray-100'" 
 :title="plugin.title">
 <i :class="['pi', plugin.icon, 'text-xl']"></i>
 </button>
 <button @click="activeSidebar = activeSidebar === 'plugins' ? 'none' : 'plugins'"
 class="w-full aspect-square flex items-center justify-center border-4 border-black hover:-translate-y-1 hover: transition-all dark:border-[#222]"
 :class="activeSidebar === 'plugins' ? 'bg-black text-white dark:bg-white dark:text-black -translate-y-1' : 'bg-white text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] dark:text-gray-100'" 
 title="Plugins">
 <i class="pi pi-th-large text-xl"></i>
 </button>
 </div>
 <div class="flex flex-col gap-4 w-full px-2">
 <button @click="runUserTerminal"
 class="border-4 border-black w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] hover:-translate-y-1 hover: transition-all dark:border-[#222]" 
 title="Open Terminal">
 <i class="pi pi-desktop text-lg"></i>
 </button>
 <button @click="closeProject"
 class="w-full aspect-square flex items-center justify-center bg-white text-black border-4 border-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:-translate-y-1 hover: transition-all dark:bg-[#0a0a0a] dark:text-gray-100 dark:border-[#222]" 
 title="Close Project">
 <i class="pi pi-power-off text-xl"></i>
 </button>
 </div>
 </div>

 <!-- Configurable Sidebar Panel -->
 <div v-show="activeSidebar !== 'none'"
 class="h-full flex flex-col border-4 border-black bg-white shrink-0 overflow-hidden z-10 relative dark:border-[#222] dark:bg-[#0a0a0a]"
 :class="isResizingSidebar ? '' : 'transition-all'"
 :style="{ width: activeSidebar !== 'none' ? sidebarWidth + 'px' : '0px' }">

 <!-- Sidebar Resizer (Inside Sidebar) -->
 <div
 class="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] transition-colors z-50 flex items-center justify-center group" 
 @mousedown.prevent="startResizeSidebar">
 </div>

 <!-- Explorer -->
 <div v-show="activeSidebar === 'explorer'" class="flex-1 flex flex-col min-h-0">
 <div
 class="p-3 border-b-4 border-black bg-[#4ade80] dark:bg-[#111] font-black uppercase tracking-widest flex items-center justify-between text-black shrink-0 dark:border-[#222] dark:text-gray-100">
 <span class="flex items-center gap-2">
 Explorer
 <i @click="collapseAll" class="pi pi-minus-circle cursor-pointer hover:scale-125 transition-transform"
 title="Collapse All"></i>
 <i @click="locateActiveFile" class="pi pi-bullseye cursor-pointer hover:scale-125 transition-transform"
 title="Locate Active File"></i>
 </span>
 <i @click="activeSidebar = 'none'"
 class="pi pi-times cursor-pointer hover:scale-125 transition-transform border-2 border-transparent hover:border-black rounded-full p-1"></i>
 </div>
 <div id="explorer-container" class="flex-1 overflow-y-auto custom-scrollbar bg-[#f4f4f0] dark:bg-[#050505] flex flex-col py-2"
 @contextmenu.prevent.self="openContextMenu($event, null)">
 <div v-for="node in visibleFiles" :key="node.path" :id="'node-' + node.path.replace(/[^a-zA-Z0-9]/g, '-')"
 @click="node.isHiddenIndicator ? null : (node.isDir ? toggleFolder(node.path) : openFile(node.path))"
 @contextmenu.prevent="node.isHiddenIndicator ? null : openContextMenu($event, node)"
 class="group cursor-pointer font-mono text-xs transition-all flex items-center gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] text-black dark:text-gray-100" 
 :class="[!node.isDir && selectedFile === node.path.replace(/\\\\/g, '/') ? 'bg-[#3b82f6] dark:bg-[#111] text-white' : '', node.isDir ? 'py-1.5 font-black' : 'py-1 font-bold']"
 :style="{ paddingLeft: `${node.depth * 16 + 12}px`, paddingRight: '12px' }" :title="node.path">

 <!-- Folder Icon -->
 <i v-if="node.isDir" class="pi text-sm shrink-0 transition-transform"
 :class="expandedFolders.has(node.path) ? 'pi-folder-open text-inherit' : 'pi-folder text-inherit opacity-70 group-hover:opacity-100'"></i>

 <!-- File Icon -->
 <i v-else
 :class="getFileIcon(node.name).icon + ' text-sm shrink-0 ' + (selectedFile === node.path.replace(/\\\\/g, '/') ? 'text-white' : getFileIcon(node.name).color)"></i>

 <span class="truncate flex-1">{{ node.name }}</span>

 <div v-if="!node.isDir && !node.isHiddenIndicator"
 class="hidden group-hover:flex items-center gap-2 shrink-0">
 <i class="pi pi-pencil hover:scale-125 transition-transform bg-white text-black p-0.5 rounded border border-black dark:bg-[#0a0a0a] dark:text-gray-100 dark:border-[#222]"
 @click.stop="renameFile(node.fileRef)" title="Rename File"></i>
 <i class="pi pi-folder-open hover:scale-125 transition-transform bg-white text-black p-0.5 rounded border border-black dark:bg-[#0a0a0a] dark:text-gray-100 dark:border-[#222]"
 @click.stop="revealInExplorer(node.fileRef)" title="Reveal in Explorer"></i>
 </div>
 </div>
 </div>
 </div>

 <!-- Search -->
 <div v-show="activeSidebar === 'search'" class="flex-1 flex flex-col min-h-0">
 <div
 class="p-3 border-b-4 border-black bg-[#f472b6] dark:bg-[#111] text-black font-black uppercase tracking-widest flex items-center justify-between dark:border-[#222] dark:text-gray-100">
 <span>Search</span>
 <i @click="activeSidebar = 'none'"
 class="pi pi-times cursor-pointer hover:scale-125 transition-transform border-2 border-transparent hover:border-black rounded-full p-1"></i>
 </div>
 <div class="p-3 bg-white border-b-4 border-black dark:bg-[#0a0a0a] dark:border-[#222]">
 <input ref="searchInputRef" v-model="searchQuery" type="text"
 class="w-full bg-white border-4 border-black px-2 py-2 text-black font-bold focus:outline-none focus: focus:-translate-y-1 transition-all dark:bg-[#0a0a0a] dark:border-[#222] dark:text-gray-100"
 placeholder="Search in files..." />
 </div>
 <div class="flex-1 overflow-y-auto custom-scrollbar p-2 bg-[#f4f4f0] dark:bg-[#050505]">
 <div v-if="isSearching"
 class="text-center font-black text-black mt-8 text-sm bg-[#4ade80] border-4 border-black p-4 mx-2 flex items-center justify-center gap-2 dark:text-gray-100 dark:border-[#222]">
 <i class="pi pi-spin pi-spinner"></i> SEARCHING...
 </div>
 <template v-else>
 <div v-for="result in searchResults" :key="result.path" class="mb-4 border-4 border-black bg-white dark:border-[#222] dark:bg-[#0a0a0a]">
 <div
 class="font-black text-black mb-0 flex items-center gap-2 text-xs bg-[#facc15] dark:bg-[#222] py-2 px-2 border-b-4 border-black dark:text-gray-100 dark:border-[#222]">
 <i class="pi pi-file shrink-0"></i> <span class="truncate" :title="result.path">{{ result.path
 }}</span>
 <span class="ml-auto bg-neo-pink text-black dark:bg-white dark:text-black px-2 py-1 font-bold">{{ result.matches.length }}</span>
 </div>
 <div class="flex flex-col bg-white dark:bg-[#0a0a0a]">
 <div v-for="match in result.matches" :key="match.line"
 class="px-2 py-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] cursor-pointer text-xs flex gap-2 transition-colors border-b-2 border-gray-200 last:border-b-0 dark:border-[#222]" 
 @click="openFileFromSearch(result.path, match.line)" :title="match.preview">
 <span class="font-bold shrink-0 w-6 text-right text-gray-500 dark:text-gray-400">{{ match.line }}</span>
 <span class="truncate font-mono">{{ match.preview }}</span>
 </div>
 </div>
 </div>
 <div v-if="searchQuery && searchResults.length === 0"
 class="text-center font-black text-black mt-8 text-sm bg-[#facc15] border-4 border-black p-4 mx-2 dark:text-gray-100 dark:border-[#222]">
 NO RESULTS FOUND
 </div>
 </template>
 </div>
 </div>

 <!-- Dynamic Plugins Sidebar Content -->
 <div v-for="plugin in dynamicActivityBarPlugins.filter(p => p.target === 'left')" :key="plugin.id"
 v-show="activeSidebar === plugin.id" class="flex-1 flex flex-col min-h-0 bg-[#f4f4f0] dark:bg-[#050505]">
 <div
 class="p-3 border-b-4 border-black bg-[#3b82f6] dark:bg-[#111] text-white font-black uppercase tracking-widest flex items-center justify-between dark:border-[#222]">
 <span class="flex items-center gap-2">
 {{ plugin.title }}
 </span>
 <i @click="activeSidebar = 'none'"
 class="pi pi-times cursor-pointer hover:scale-125 transition-transform border-2 border-transparent hover:border-black rounded-full p-1 bg-white text-black dark:bg-[#0a0a0a] dark:text-gray-100"></i>
 </div>
 <div class="flex-1 min-h-0 bg-white dark:bg-[#0a0a0a]">
 <iframe :src="`file:///C:/Users/MSI/.makarya/plugins/${plugin.pluginId}/${plugin.entryPoint}`"
 class="w-full h-full border-none"></iframe>
 </div>
 </div>

 <!-- Plugins Dummy -->
 <div v-show="activeSidebar === 'plugins'" class="flex-1 flex flex-col min-h-0 bg-[#f4f4f0] dark:bg-[#050505]">
 <div
 class="p-3 border-b-4 border-black bg-[#10b981] dark:bg-[#111] text-black font-black uppercase tracking-widest flex items-center justify-between dark:border-[#222] dark:text-gray-100">
 <span class="flex items-center gap-2">
 Plugins
 <i @click="fetchMarketplace(true)"
 class="pi pi-sync cursor-pointer hover:scale-125 transition-transform" title="Refresh"></i>
 </span>
 <i @click="activeSidebar = 'none'"
 class="pi pi-times cursor-pointer hover:scale-125 transition-transform border-2 border-transparent hover:border-black rounded-full p-1"></i>
 </div>

 <div class="p-3 bg-white border-b-4 border-black relative dark:bg-[#0a0a0a] dark:border-[#222]">
 <input type="text" v-model="pluginSearchQuery"
 class="w-full bg-white border-4 border-black pl-2 pr-8 py-2 text-black font-bold focus:outline-none transition-all dark:bg-[#0a0a0a] dark:border-[#222] dark:text-gray-100"
 placeholder="Search Plugins in Marketplace" />
 <i
 class="pi pi-filter absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform text-black text-lg dark:text-gray-100"></i>
 </div>

 <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col">

 <!-- Installed Accordion -->
 <div class="border-b-4 border-black bg-white dark:border-[#222] dark:bg-[#0a0a0a]">
 <div
 class="p-2 bg-gray-100 flex items-center justify-between cursor-pointer hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-black uppercase border-b-4 border-black transition-colors group dark:bg-[#111] dark:border-[#222]" 
 @click="isInstalledPluginOpen = !isInstalledPluginOpen">
 <span class="flex items-center gap-2">
 <i class="pi transition-transform"
 :class="isInstalledPluginOpen ? 'pi-chevron-down' : 'pi-chevron-right'"></i>
 Installed
 </span>
 <span
 class="bg-neo-yellow text-black dark:bg-white dark:text-black px-2 py-0.5 text-xs rounded-full border-2 border-black group-hover: transition-shadow dark:border-[#222]">{{
 installedList.length }}</span>
 </div>
 <div v-show="isInstalledPluginOpen" class="flex flex-col bg-white dark:bg-[#0a0a0a]">
 <div v-if="installedList.length === 0" class="p-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400">
 No plugins installed.
 </div>
 <!-- Dynamic Installed Items -->
 <div v-for="plugin in installedList" :key="plugin.id"
 class="p-3 border-b-2 border-gray-200 flex gap-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] cursor-pointer group relative overflow-hidden dark:border-[#222]"> 
 <div class="flex flex-col flex-1 min-w-0">
 <div class="font-black text-sm flex items-center justify-between">{{ plugin.name }} <i
 class="pi pi-cog hidden group-hover:block cursor-pointer hover:scale-125 transition-transform"
 @click.stop="uninstallPlugin(plugin.id)" title="Uninstall"></i>
 </div>
 <div class="text-xs text-gray-600 truncate mt-0.5 dark:text-gray-400">{{ plugin.description }}</div>
 <div class="text-[10px] text-gray-500 font-bold mt-1.5 flex justify-between items-center dark:text-gray-400">
 {{ plugin.author }}</div>
 </div>
 </div>
 </div>
 </div>

 <!-- Recommended Accordion -->
 <div class="border-b-4 border-black bg-white dark:border-[#222] dark:bg-[#0a0a0a]">
 <div
 class="p-2 bg-[#3b82f6] dark:bg-[#111] text-white flex items-center justify-between cursor-pointer font-black uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] border-b-4 border-black transition-colors group dark:border-[#222]" 
 @click="isRecommendedPluginOpen = !isRecommendedPluginOpen">
 <span class="flex items-center gap-2">
 <i class="pi transition-transform"
 :class="isRecommendedPluginOpen ? 'pi-chevron-down' : 'pi-chevron-right'"></i>
 Recommended
 </span>
 <span
 class="bg-white text-black px-2 py-0.5 text-xs rounded-full border-2 border-black group-hover: transition-shadow dark:bg-[#0a0a0a] dark:text-gray-100 dark:border-[#222]">{{
 recommendedList.length }}</span>
 </div>
 <div v-show="isRecommendedPluginOpen" class="flex flex-col bg-white dark:bg-[#0a0a0a]">
 <div v-if="recommendedList.length === 0" class="p-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400">
 No recommendations found.
 </div>
 <!-- Dynamic Recommended Items -->
 <div v-for="plugin in recommendedList" :key="plugin.id"
 class="p-3 border-b-2 border-gray-200 flex gap-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] cursor-pointer group relative overflow-hidden dark:border-[#222]"> 
 <div v-if="plugin.isRecommendedBadge"
 class="absolute -left-2 -top-2 bg-[#3b82f6] dark:bg-[#111] text-white text-[10px] font-black px-4 py-1 -rotate-45 border border-black z-10 dark:border-[#222]">
 <i class="pi pi-star-fill text-[8px]"></i>
 </div>
 <div class="flex flex-col flex-1 min-w-0">
 <div class="font-black text-sm flex items-center justify-between">{{ plugin.name }} <span
 class="text-[10px] text-gray-500 flex items-center gap-1 group-hover:hidden dark:text-gray-400"><i
 class="pi pi-cloud-download"></i> {{ plugin.downloads }} <i
 class="pi pi-star-fill text-yellow-500"></i>
 {{ plugin.rating }}</span></div>
 <div class="text-xs text-gray-600 truncate mt-0.5 dark:text-gray-400">{{ plugin.description }}</div>
 <div class="text-[10px] text-gray-500 font-bold mt-1.5 flex justify-between items-center dark:text-gray-400">
 {{ plugin.author }}
 <button v-if="isInstalling === plugin.id"
 class="bg-gray-400 text-white px-3 py-1 border-2 border-black font-black uppercase cursor-not-allowed dark:border-[#222]">
 <i class="pi pi-spin pi-spinner mr-1"></i>
 </button>
 <button v-else @click.stop="installPlugin(plugin)"
 class="bg-[#3b82f6] dark:bg-[#111] text-white px-3 py-1 border-2 border-black hover:-translate-y-0.5 hover: transition-all font-black uppercase dark:border-[#222]">Install</button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <!-- Main Editor & Preview Area -->
 <div class="flex-1 flex flex-col min-w-0 z-10 h-full border-4 border-black bg-white dark:border-[#222] dark:bg-[#0a0a0a]">
 <!-- Toolbar -->
 <div
 class="flex justify-between items-center border-b-4 border-black bg-[#facc15] dark:bg-[#111] px-4 py-2 shrink-0 min-h-[3.5rem] dark:border-[#222]">
 <div
 class="font-black uppercase tracking-widest text-lg flex flex-wrap items-center gap-2 text-black flex-1 min-w-0 pr-4 dark:text-gray-100">
 <i class="pi pi-box shrink-0"></i> <span>{{ projectName }}</span>
 <span v-if="selectedFile"
 class="bg-white text-black dark:bg-[#222] dark:text-gray-100 px-2 py-1 text-xs border-2 border-black hidden sm:inline-block break-all dark:border-[#222]">{{
 selectedFile }}</span>
 <span v-if="unsavedChanges[selectedFile]"
 class="bg-red-500 w-3 h-3 rounded-full border-2 border-black shrink-0 dark:border-[#222]" title="Unsaved changes"></span>
 </div>
 <div class="flex items-center gap-3 shrink-0">
 <button v-if="Object.keys(unsavedChanges).length > 0 && !isSyncing"
 class="text-xs font-black bg-black text-white dark:bg-white dark:text-black border-4 border-black px-3 py-1 hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white hover:-translate-y-1 transition-all flex items-center gap-2 uppercase dark:border-[#222]"
 @click="saveToDisk" title="Save All">
 <i class="pi pi-save"></i> Save (Ctrl+S)
 </button>
 <span v-if="isSyncing"
 class="text-xs font-black bg-[#4ade80] text-black border-4 border-black px-3 py-1 flex items-center gap-2 uppercase dark:text-gray-100 dark:border-[#222]">
 <i class="pi pi-spin pi-spinner"></i> Saving...
 </span>
 <button
 class="text-xs font-black bg-black text-white dark:bg-white dark:text-black border-4 border-black px-3 py-1 hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white hover:-translate-y-1 transition-all flex items-center gap-2 uppercase dark:border-[#222]"
 @click="isLivePreviewVisible = !isLivePreviewVisible"
 :title="isLivePreviewVisible ? 'Hide Preview' : 'Show Preview'">
 <i :class="isLivePreviewVisible ? 'pi pi-eye-slash' : 'pi-eye'"></i> {{ isLivePreviewVisible ? 'Hide Preview' : 'Show Preview' }}
 </button>
 </div>
 </div>

 <!-- Editor & Preview Split -->
 <div class="flex-1 flex flex-row min-h-0 bg-white relative dark:bg-[#0a0a0a]" ref="editorSplitRef">
 <div v-if="renderError"
 class="absolute inset-0 bg-red-500 text-white p-6 border-b-4 border-black overflow-auto z-50 font-mono text-sm whitespace-pre-wrap dark:border-[#222]">
 <h2
 class="text-2xl font-black mb-4 uppercase underline border-4 border-white inline-block px-4 py-2 bg-neo-blue text-black dark:bg-white dark:text-black">
 Rendering Error</h2>
 <div class="bg-white text-black p-4 border-4 border-black font-bold dark:bg-[#0a0a0a] dark:text-gray-100 dark:border-[#222]">{{ renderError }}</div>
 <button @click="renderError = ''"
 class="mt-4 bg-black text-white dark:bg-white dark:text-black px-4 py-2 border-4 border-white font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] hover:border-black transition-colors">DISMISS</button> 
 </div>

 <!-- Monaco Editor Container with Tabs -->
 <div class="h-full min-w-0 flex flex-col relative bg-[#f4f4f0] dark:bg-[#050505]"
 :style="{ width: isLivePreviewVisible ? editorWidthPercent + '%' : '100%' }">

 <!-- TAB BAR -->
 <div v-if="openTabs.length > 0"
 class="flex flex-row overflow-x-auto custom-scrollbar bg-white shrink-0 border-b-4 border-black min-h-[44px] dark:bg-[#0a0a0a] dark:border-[#222]">
 <div v-for="tab in openTabs" :key="tab" @click="openFile(tab)"
 @contextmenu.prevent="openTabContextMenu($event, tab)"
 class="flex items-center gap-2 px-3 py-2 border-r-4 border-black cursor-pointer select-none min-w-[120px] max-w-[200px] group transition-all dark:border-[#222]"
 :class="selectedFile === tab ? 'bg-[#3b82f6] dark:bg-[#111] text-white font-black' : 'bg-[#f4f4f0] dark:bg-[#050505] text-gray-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] font-bold dark:text-gray-300'" 
 :title="tab">
 <i class="pi text-sm shrink-0" :class="[ selectedFile === tab ? 'text-white' : 'text-gray-500 group-hover:text-black', tab.startsWith('plugin:') ? getPluginIcon(tab.replace('plugin:', '')) : getFileIcon(tab.split('/').pop() || '').icon ]"></i>
 <span class="truncate text-xs">{{ tab.startsWith('plugin:') ? getPluginTitle(tab.replace('plugin:',
 '')) :
 tab.split('/').pop() }}</span>
 <span v-if="!tab.startsWith('plugin:') && unsavedChanges[tab]"
 class="bg-red-500 w-2 h-2 rounded-full border border-black shrink-0 ml-1 dark:border-[#222]"
 title="Unsaved changes"></span>
 <span @click.stop="closeTab(tab, $event)"
 class="ml-auto w-5 h-5 flex items-center justify-center rounded-full transition-colors opacity-50 group-hover:opacity-100 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] text-gray-500 cursor-pointer"
 :class="selectedFile === tab ? 'text-white opacity-100' : ''">
 <i class="pi pi-times text-[10px]"></i>
 </span>
 </div>
 </div>

 <!-- The Monaco Editor OR Diff Editor -->
 <div v-show="isDiffMode && currentDiffFile" class="flex-1 min-h-0 bg-[#1e1e1e] relative flex flex-col">
 <div class="py-3 bg-white border-b-4 border-black shrink-0 flex items-center justify-between px-4 dark:bg-[#0a0a0a] dark:border-[#222]">
 <div class="font-mono text-sm font-black flex flex-col gap-3 text-black dark:text-gray-100">
 <div class="flex items-center gap-2 mt-1">
 <span class="bg-[#ef4444] text-white px-2 py-1 border-2 border-black dark:border-[#222]">REVIEWING</span>
 <span class="bg-white px-2 py-1 border-2 border-black dark:bg-[#0a0a0a] dark:border-[#222]">{{
 currentDiffFile
 }}</span>
 </div>

 <div class="flex items-center hover:-translate-y-1 transition-all self-start mb-1">
 <button @click="rejectChange"
 class="bg-white text-black text-sm font-black px-4 py-1.5 border-4 border-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-2 dark:bg-[#0a0a0a] dark:text-gray-100 dark:border-[#222]"> 
 <i class="pi pi-times"></i> REJECT
 </button>
 <button @click="approveChange"
 class="bg-white text-black text-sm font-black px-4 py-1.5 border-y-4 border-r-4 border-l-0 border-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-2 dark:bg-[#0a0a0a] dark:text-gray-100 dark:border-[#222]"> 
 <i class="pi pi-check"></i> APPROVE
 </button>
 </div>
 </div>

 <div class="flex items-center gap-4">
 <div class="w-1 h-12 bg-black mx-1 hidden sm:block"></div>
 <button @click="exitDiffMode"
 class="bg-gray-100 text-black text-sm font-black w-10 h-10 flex items-center justify-center border-4 border-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:-translate-y-1 transition-all dark:bg-[#111] dark:text-gray-100 dark:border-[#222]" 
 title="Close Diff">
 <i class="pi pi-times"></i>
 </button>
 </div>
 </div>
 <div class="flex-1 min-h-0 relative">
 <vue-monaco-diff-editor :original="pendingApprovals[currentDiffFile]?.original || ''"
 :modified="pendingApprovals[currentDiffFile]?.modified || ''" theme="vs-dark"
 :language="monacoLanguage" :options="{
 fontSize: 14,
 fontFamily: 'JetBrains Mono, monospace',
 minimap: { enabled: false },
 wordWrap: 'off',
 automaticLayout: true,
 readOnly: true
 }" />
 </div>
 </div>
 <div v-show="!isDiffMode && selectedFile && !selectedFile.startsWith('plugin:')"
 class="flex-1 min-h-0 bg-[#1e1e1e] relative">
 <vue-monaco-editor v-model:value="activeCode" :path="selectedFile" theme="vs-dark"
 :language="monacoLanguage" :options="{
 fontSize: 14,
 fontFamily: 'JetBrains Mono, monospace',
 minimap: { enabled: false },
 wordWrap: 'on',
 automaticLayout: true,
 padding: { top: 16 }
 }" @change="handleEditorChange" @mount="handleEditorMount" />
 </div>
 <div v-show="!isDiffMode && selectedFile && selectedFile.startsWith('plugin:')"
 class="flex-1 min-h-0 bg-white relative dark:bg-[#0a0a0a]">
 <iframe :src="getPluginUrl(selectedFile)" class="w-full h-full border-none"
 :class="{ 'pointer-events-none': isResizingSidebar || isResizingEditor || isResizingRightSidebar || isResizingTerminal }"></iframe>
 </div>

 <!-- Empty State (No Tabs Open) -->
 <div v-show="!selectedFile"
 class="flex-1 bg-[#f4f4f0] dark:bg-[#050505] flex flex-col items-center justify-center font-black text-2xl text-black uppercase relative overflow-hidden dark:text-gray-100">
 <div class="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-4 pointer-events-none">
 <i v-for="i in 50" :key="i" class="pi pi-code text-4xl"></i>
 </div>
 <div class="bg-white border-4 border-black p-8 z-10 text-center flex flex-col items-center dark:bg-[#0a0a0a] dark:border-[#222]">
 <i class="pi pi-file-edit text-6xl mb-6 text-[#3b82f6] drop-"></i>
 <span class="bg-black text-white dark:bg-white dark:text-black px-4 py-2 border-4 border-black dark:border-[#222]">SELECT A FILE TO EDIT</span>
 </div>
 </div>
 </div>

 <!-- Editor/Preview Resizer -->
 <div v-show="isLivePreviewVisible"
 class="w-2 h-full absolute cursor-col-resize hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] transition-colors z-20 flex items-center justify-center group" 
 :style="{ left: `calc(${editorWidthPercent}% - 4px)` }" @mousedown.prevent="startResizeEditor">
 <div class="w-1 h-12 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
 </div>

 <!-- Local Preview Iframe -->
 <div v-show="isLivePreviewVisible" class="h-full bg-white flex flex-col border-l-4 border-black min-w-0 dark:bg-[#0a0a0a] dark:border-[#222]"
 :style="{ width: (100 - editorWidthPercent) + '%' }">
 <div
 class="bg-[#3b82f6] dark:bg-[#111] text-white px-3 py-2 text-sm border-b-4 border-black flex justify-between items-center font-black uppercase shrink-0 h-12 dark:border-[#222]">
 <div class="flex bg-gray-100 border-2 border-black shrink-0 dark:bg-[#111] dark:border-[#222]">
 <button @click="previewDevice = 'desktop'"
 :class="['px-3 py-1.5 flex items-center justify-center transition-colors', previewDevice === 'desktop' ? 'bg-[#facc15] text-black' : 'text-gray-400 hover:text-black']"
 title="Desktop">
 <i class="pi pi-desktop text-lg"></i>
 </button>
 <button @click="previewDevice = 'tablet'"
 :class="['px-3 py-1.5 flex items-center justify-center border-l-2 border-r-2 border-black transition-colors', previewDevice === 'tablet' ? 'bg-[#facc15] text-black' : 'text-gray-400 hover:text-black dark:border-[#222]']"
 title="Tablet">
 <i class="pi pi-tablet text-lg"></i>
 </button>
 <button @click="previewDevice = 'mobile'"
 :class="['px-3 py-1.5 flex items-center justify-center transition-colors', previewDevice === 'mobile' ? 'bg-[#facc15] text-black' : 'text-gray-400 hover:text-black']"
 title="Mobile">
 <i class="pi pi-mobile text-lg"></i>
 </button>
 </div>
 <div class="flex items-center gap-2 shrink-0">
 <button @click="goBack"
 class="bg-black text-white dark:bg-white dark:text-black border-4 border-black w-8 h-8 flex items-center justify-center hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white hover:-translate-y-0.5 transition-transform cursor-pointer dark:border-[#222]" 
 title="Back">
 <i class="pi pi-angle-left font-bold"></i>
 </button>
 <button @click="goForward"
 class="bg-black text-white dark:bg-white dark:text-black border-4 border-black w-8 h-8 flex items-center justify-center hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white hover:-translate-y-0.5 transition-transform cursor-pointer dark:border-[#222]" 
 title="Forward">
 <i class="pi pi-angle-right font-bold"></i>
 </button>
 <form @submit.prevent="refreshIframe" class="flex items-center ml-1">
 <input type="text" v-model="previewUrlInput"
 class="bg-white text-black border-4 border-black px-2 py-1 w-64 focus:outline-none focus: font-mono text-xs transition-all font-bold dark:bg-[#0a0a0a] dark:text-gray-100 dark:border-[#222]" />
 </form>
 <button @click="isAutoReloadEnabled = !isAutoReloadEnabled"
 class="bg-white border-4 border-black px-2 h-9 flex items-center justify-center hover:-translate-y-0.5 transition-all cursor-pointer font-black text-[10px] uppercase gap-1 dark:bg-[#0a0a0a] dark:border-[#222]"
 :class="isAutoReloadEnabled ? 'text-black bg-[#facc15]' : 'text-gray-400 opacity-50'"
 title="Auto Reload on Save">
 <i class="pi pi-bolt" :class="isAutoReloadEnabled ? 'text-black' : ''"></i>
 </button>
 <button @click="refreshIframe"
 class="bg-black text-white dark:bg-white dark:text-black border-4 border-black w-9 h-9 flex items-center justify-center hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white hover:-translate-y-0.5 transition-all cursor-pointer dark:border-[#222]" 
 title="Refresh">
 <i class="pi pi-refresh font-bold"></i>
 </button>
 <button @click="openDevTools"
 class="bg-black text-white dark:bg-white dark:text-black border-4 border-black w-9 h-9 flex items-center justify-center hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white hover:-translate-y-0.5 transition-all cursor-pointer dark:border-[#222]" 
 title="Inspect Element">
 <i class="pi pi-cog font-bold"></i>
 </button>
 </div>
 </div>
 <div class="h-1 w-full bg-transparent relative overflow-hidden">
 <div v-if="isPreviewLoading"
 class="h-full bg-[#db2777] absolute animate-[loading_1.5s_infinite_ease-in-out]">
 </div>
 </div>
 <div class="flex-1 overflow-hidden bg-[#f4f4f0] dark:bg-[#050505] w-full h-full flex justify-center relative"
 :class="previewDevice !== 'desktop' ? 'p-4' : ''">
 <div :class="[ 'h-full bg-white dark:bg-[#0a0a0a] transition-all duration-300 flex flex-col', previewDevice === 'desktop' ? 'w-full border-none' : 'border-4 border-black overflow-hidden', previewDevice === 'tablet' ? 'w-[768px]' : previewDevice === 'mobile' ? 'w-[375px]' : '', 'dark:bg-[#0a0a0a] dark:border-[#222]' ]">
 <webview ref="previewIframe" :src="previewUrl" class="w-full h-full border-none bg-white flex-1 dark:bg-[#0a0a0a]"
 @did-navigate="handleNavigate" @did-navigate-in-page="handleNavigate"
 @did-start-loading="handleStartLoading" @did-stop-loading="handleStopLoading"></webview>
 </div>
 </div>
 </div>
 </div>

 <!-- User Terminal Bottom Panel -->
 <div v-show="isUserTerminalVisible"
 class="border-t-4 border-black bg-black flex flex-col shrink-0 relative z-20 dark:border-[#222]"
 :style="{ height: terminalHeight + 'px', transition: isResizingTerminal ? 'none' : 'height 0.3s' }">

 <!-- Terminal Resizer -->
 <div
 class="h-2 w-full cursor-row-resize hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] absolute top-[-6px] left-0 z-30 transition-colors flex items-center justify-center group" 
 @mousedown.prevent="startResizeTerminal">
 <div class="h-1 w-12 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity dark:bg-[#0a0a0a]"></div>
 </div>
 <div
 class="flex justify-between items-center border-b-4 border-black px-4 py-2 text-xs font-black text-black uppercase tracking-widest bg-[#3b82f6] dark:bg-[#111] text-white dark:border-[#222] dark:text-gray-100">
 <div class="flex items-center gap-4">
 <span class="flex items-center gap-2"><i class="pi pi-desktop"></i> Terminal</span>
 <div class="flex gap-2">
 <button @click="createNewUserTerminal"
 class="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 border-2 border-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white hover:-translate-y-0.5 transition-all dark:border-[#222]"><i 
 class="pi pi-plus"></i></button>
 </div>
 </div>
 <i @click="isUserTerminalVisible = false"
 class="pi pi-times cursor-pointer hover:scale-125 transition-transform border-2 border-transparent hover:border-black rounded-full p-1 bg-white text-black dark:bg-[#0a0a0a] dark:text-gray-100"></i>
 </div>
 <div class="flex-1 flex bg-black overflow-hidden">
 <!-- Terminal Tabs Sidebar -->
 <div
 class="w-48 bg-[#f4f4f0] dark:bg-[#050505] border-r-4 border-black flex flex-col p-2 gap-2 overflow-y-auto custom-scrollbar dark:border-[#222]">
  <div v-for="t in userTerminals" :key="t.id" @click="switchUserTerminal(t.id)"
   class="px-2 py-1 flex items-center justify-between border-4 border-black font-mono text-xs font-bold cursor-pointer hover:-translate-y-0.5 transition-all dark:border-[#222]"
   :class="activeUserTerminalId === t.id ? 'bg-[#3b82f6] dark:bg-[#111] text-white' : 'bg-white dark:bg-[#0a0a0a] text-black dark:text-gray-100'">
   <span class="truncate"><i class="pi pi-desktop text-[10px] mr-1"></i>{{ t.name }}</span>
   <i @click.stop="killUserTerminal(t.id)"
   class="pi pi-times rounded-full p-1 text-[10px] transition-colors hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black" 
   :class="activeUserTerminalId === t.id ? 'text-white opacity-70 hover:opacity-100' : 'text-gray-500 opacity-70 hover:opacity-100'"></i>
   </div>
 </div>
 <!-- Terminal Rendering Area -->
 <div class="flex-1 relative p-2">
 <div v-if="userTerminals.length === 0"
 class="flex items-center justify-center h-full text-white font-mono text-sm opacity-50">
 No active terminals. Click + to create one.
 </div>
 <div v-for="t in userTerminals" :key="t.id" v-show="activeUserTerminalId === t.id"
 :ref="el => setTerminalRef(el, t.id)" class="absolute inset-2"></div>
 </div>
 </div>
 </div>
 </div>

 <!-- Chat Agent Right Sidebar -->
 <div v-show="isChatSidebarVisible"
 class="h-full bg-black border-4 border-black flex flex-col shrink-0 relative z-20 dark:border-[#222]"
 :class="isResizingRightSidebar ? '' : 'transition-all'" :style="{ width: rightSidebarWidth + 'px' }">

 <!-- Right Sidebar Resizer -->
 <div class="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] transition-colors z-50" 
 @mousedown.prevent="startResizeRightSidebar">
 </div>

  <!-- Header: Chat Agent -->
  <div class="flex justify-between items-center border-b-4 border-black px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors bg-[#3b82f6] dark:bg-[#111] text-white dark:border-[#222] shrink-0">
    <div class="flex items-center gap-2">
      <i class="pi pi-comments text-sm"></i>
      <span>Chat Agent</span>
    </div>
    <i @click="isChatSidebarVisible = false"
      class="pi pi-times cursor-pointer hover:scale-125 transition-transform border-2 border-transparent hover:border-white rounded-full p-1 text-white"></i>
  </div>

  <!-- Native Toolbar: Dropdown Agent + Browse + Paste -->
  <div class="px-3 py-2 bg-[#0d0d0d] border-b border-[#1e1e2e] flex items-center gap-2 shrink-0 text-xs text-white">
    <!-- Agent Selector -->
    <div class="flex items-center gap-1.5 bg-[#111827] border border-[#374151] rounded-md px-2 py-1">
      <i class="pi pi-bolt text-[#4ade80] text-xs"></i>
      <select v-model="chatSelectedAgent" @change="onChatAgentChange"
        class="bg-transparent text-white font-bold text-xs border-none outline-none cursor-pointer uppercase">
        <option value="opencode" class="bg-[#111827] text-white">opencode</option>
        <option value="claude" class="bg-[#111827] text-white">claude</option>
      </select>
    </div>

    <div class="w-px h-4 bg-[#1e1e2e]"></div>

    <!-- Browse File Button -->
    <button @click="handleChatBrowseImage"
      class="flex items-center gap-1 px-2.5 py-1 bg-[#1a0a2e] border border-[#4c1d95] hover:bg-[#2d1054] text-[#c4b5fd] rounded-md font-semibold text-xs transition-colors cursor-pointer">
      <i class="pi pi-image text-xs"></i> Browse
    </button>

    <!-- Paste Clipboard Button -->
    <button @click="handleChatPasteImage"
      class="flex items-center gap-1 px-2.5 py-1 bg-[#0a1628] border border-[#1e3a5f] hover:bg-[#0f2040] text-[#93c5fd] rounded-md font-semibold text-xs transition-colors cursor-pointer">
      <i class="pi pi-paperclip text-xs"></i> Paste
    </button>

    <!-- Image Badge -->
    <div v-if="chatUploadedImage" class="flex items-center gap-1.5 px-2 py-1 bg-[#0f172a] border border-[#1e40af] rounded-md text-xs font-mono text-[#93c5fd] max-w-[160px] truncate">
      <span class="truncate">{{ chatUploadedFileName }}</span>
      <i @click="clearChatImage" class="pi pi-times cursor-pointer hover:text-red-400 text-xs"></i>
    </div>
  </div>

  <!-- Native Terminal Container -->
  <div class="flex-1 relative bg-black overflow-hidden p-1" ref="chatAgentTermEl"></div>
 </div>

 <!-- Plugin Right Sidebar -->
 <div v-show="isPluginRightSidebarVisible"
 class="h-full bg-white border-4 border-black flex flex-col shrink-0 relative z-20 dark:bg-[#0a0a0a] dark:border-[#222]"
 :class="isResizingRightSidebar ? '' : 'transition-all'" :style="{ width: rightSidebarWidth + 'px' }">

 <!-- Right Sidebar Resizer -->
 <div class="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] transition-colors z-50" 
 @mousedown.prevent="startResizeRightSidebar">
 </div>
 <div
 class="flex justify-between items-center border-b-4 border-black px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors bg-[#3b82f6] dark:bg-[#111] text-white dark:border-[#222]">
 <div class="flex items-center gap-2">
 <span><i :class="['pi', getPluginIcon(activeRightPluginId)]"></i> {{ getPluginTitle(activeRightPluginId)
 }}</span>
 </div>
 <i @click="isPluginRightSidebarVisible = false"
 class="pi pi-times cursor-pointer hover:scale-125 transition-transform border-2 border-transparent hover:border-white rounded-full p-1 text-white"></i>
 </div>
 <div class="flex-1 relative bg-white dark:bg-[#0a0a0a]">
 <iframe :src="getPluginUrl(activeRightPluginId)" class="w-full h-full border-none"
 :class="{ 'pointer-events-none': isResizingSidebar || isResizingEditor || isResizingRightSidebar || isResizingTerminal }"></iframe>
 </div>
 </div>

 </div> <!-- End Editor Content -->

 <!-- Database Content -->
 <div v-show="activeMainTab === 'database'" class="flex-1 flex flex-col min-h-0 bg-white relative dark:bg-[#0a0a0a]">
 <DatabaseView />
 </div>

 <!-- API Tester Content -->
 <div v-show="activeMainTab === 'tester'" class="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0a0a0a]">
 <TesterView />
 </div>

 <!-- Ctrl+Tab Modal -->
 <div v-if="isCtrlTabModalVisible"
 class="fixed inset-0 z-[100] flex justify-center items-center pointer-events-none">
 <div class="absolute inset-0 pointer-events-auto" style="background-color: rgba(0,0,0,0.5)"></div>
 <div
 class="w-[600px] bg-white border-4 border-black p-4 pointer-events-auto flex flex-col max-h-[60vh] relative z-10 dark:bg-[#0a0a0a] dark:border-[#222]">
 <h3
 class="font-black text-xl uppercase tracking-widest text-black border-b-4 border-black pb-2 mb-4 bg-[#facc15] px-2 py-1 flex items-center gap-2 dark:text-gray-100 dark:border-[#222]">
 <i class="pi pi-file"></i> Open Editors
 </h3>
 <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 bg-[#f4f4f0] dark:bg-[#050505] border-4 border-black dark:border-[#222]">
 <div v-for="(tab, index) in mruTabs" :key="tab"
 class="px-4 py-3 font-mono text-sm cursor-pointer flex items-center justify-between border-2 border-transparent transition-colors"
 :class="index === ctrlTabSelectedIndex ? 'bg-[#3b82f6] dark:bg-[#111] text-white border-black font-black' : 'text-black dark:text-gray-100 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] font-bold dark:border-[#222]'" 
 @click="ctrlTabSelectedIndex = index; isCtrlTabModalVisible = false; openFile(tab)">
 <div class="flex items-center gap-3 truncate">
 <i class="pi pi-file text-lg"></i>
 <span class="truncate">{{ tab.split('/').pop() }}</span>
 <span class="text-[10px] opacity-70 truncate"
 :class="index === ctrlTabSelectedIndex ? 'text-white' : 'text-gray-500'">{{ tab }}</span>
 </div>
 </div>
 <div v-if="mruTabs.length === 0" class="p-4 text-center text-black font-black font-mono text-sm uppercase dark:text-gray-100">
 No open editors
 </div>
 </div>
 </div>
 </div>

 <!-- Quick Open Modal -->
 <div v-if="isQuickOpenVisible" class="fixed inset-0 z-50 flex justify-center pt-24 pointer-events-none">
 <div class="absolute inset-0 pointer-events-auto" style="background-color: rgba(0,0,0,0.5)"
 @mousedown="isQuickOpenVisible = false"></div>
 <div
 class="w-[600px] bg-[#facc15] border-4 border-black p-2 pointer-events-auto flex flex-col max-h-[60vh] relative z-10 h-fit dark:border-[#222]">
 <input ref="quickOpenInputRef" v-model="quickOpenQuery" @keydown="handleQuickOpenKeydown"
 class="w-full bg-white text-black p-4 font-mono font-black text-sm outline-none border-4 border-black focus:-translate-y-1 focus: transition-all placeholder:text-gray-400 dark:bg-[#0a0a0a] dark:text-gray-100 dark:border-[#222]"
 placeholder="Search files by name..." />

 <div ref="quickOpenListRef"
 class="flex-1 overflow-y-auto mt-4 custom-scrollbar bg-white border-4 border-black dark:bg-[#0a0a0a] dark:border-[#222]">
 <div v-for="(file, index) in quickOpenResults" :key="file.path"
 @click="openFile(file.relativePath || file.path); isQuickOpenVisible = false"
 @mouseenter="quickOpenSelectedIndex = index"
 class="px-4 py-3 font-mono text-xs cursor-pointer flex items-center justify-between border-b-2 border-black last:border-b-0 dark:border-[#222]"
 :class="index === quickOpenSelectedIndex ? 'bg-[#3b82f6] dark:bg-[#111] text-white' : 'text-black dark:text-gray-100 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a]'"> 
 <div class="flex items-center gap-3 truncate">
 <i class="pi pi-file text-lg"></i>
 <span class="font-black">{{ file.name }}</span>
 <span class="text-[10px] opacity-70 truncate"
 :class="index === quickOpenSelectedIndex ? 'text-white' : 'text-gray-500'">{{ file.relativePath ||
 file.path }}</span>
 </div>
 </div>
 <div v-if="quickOpenResults.length === 0"
 class="p-4 text-center text-black font-black font-mono text-sm uppercase dark:text-gray-100">
 No results found
 </div>
 </div>
 </div>
 </div>

 <!-- Rename Modal -->
 <div v-if="isRenameModalVisible" class="fixed inset-0 z-50 flex justify-center items-center pointer-events-none">
 <div class="absolute inset-0 pointer-events-auto" style="background-color: rgba(0,0,0,0.5)"
 @mousedown="isRenameModalVisible = false"></div>
 <div
 class="w-[400px] bg-[#f472b6] dark:bg-[#050505] border-4 border-black p-5 pointer-events-auto flex flex-col relative z-10 h-fit dark:border-[#222]">
 <h3 class="font-black text-black uppercase mb-4 text-xl flex items-center gap-2 dark:text-gray-100"><i class="pi pi-pencil"></i>
 Rename File</h3>
 <input ref="renameInputRef" v-model="newFileName" @keydown.enter="submitRename"
 @keydown.esc="isRenameModalVisible = false"
 class="w-full bg-white text-black p-3 font-mono font-bold text-sm outline-none border-4 border-black focus:-translate-y-1 focus: transition-all dark:bg-[#0a0a0a] dark:text-gray-100 dark:border-[#222]"
 placeholder="Enter new name..." />
 <div class="flex justify-end gap-3 mt-5">
 <button @click="isRenameModalVisible = false"
 class="px-5 py-2 bg-white border-4 border-black text-black font-black uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors dark:bg-[#0a0a0a] dark:border-[#222] dark:text-gray-100">Cancel</button> 
 <button @click="submitRename"
 class="px-5 py-2 bg-[#facc15] border-4 border-black text-black font-black uppercase hover:-translate-y-1 hover: transition-all dark:bg-[#111] dark:border-[#222] dark:text-gray-100">Rename</button>
 </div>
 </div>
 </div>

 <!-- New File Modal -->
 <div v-if="isNewFileModalVisible" class="fixed inset-0 z-50 flex justify-center items-center pointer-events-none">
 <div class="absolute inset-0 pointer-events-auto" style="background-color: rgba(0,0,0,0.5)"
 @mousedown="isNewFileModalVisible = false"></div>
 <div
 class="w-[400px] bg-[#4ade80] dark:bg-[#050505] border-4 border-black p-5 pointer-events-auto flex flex-col relative z-10 h-fit dark:border-[#222]">
 <h3 class="font-black text-xl uppercase tracking-widest text-black border-b-4 border-black pb-2 mb-4 dark:text-gray-100 dark:border-[#222]">
 New File</h3>
 <input ref="newFileInputRef" v-model="newFileFolderInput" @keydown.enter="submitNewFile"
 @keydown.esc="isNewFileModalVisible = false"
 class="border-4 border-black p-3 font-mono text-sm outline-none focus:-translate-y-1 focus: bg-white transition-all w-full dark:border-[#222] dark:bg-[#0a0a0a]"
 placeholder="filename.txt" />
 <div class="flex gap-3 justify-end mt-5">
 <button @click="isNewFileModalVisible = false"
 class="px-5 py-2 bg-white border-4 border-black text-black font-black uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors dark:bg-[#0a0a0a] dark:border-[#222] dark:text-gray-100">Cancel</button> 
 <button @click="submitNewFile"
 class="px-5 py-2 bg-[#facc15] border-4 border-black text-black font-black uppercase hover:-translate-y-1 hover: transition-all dark:bg-[#111] dark:border-[#222] dark:text-gray-100">Create</button>
 </div>
 </div>
 </div>

 <!-- New Folder Modal -->
 <div v-if="isNewFolderModalVisible"
 class="fixed inset-0 z-50 flex justify-center items-center pointer-events-none">
 <div class="absolute inset-0 pointer-events-auto" style="background-color: rgba(0,0,0,0.5)"
 @mousedown="isNewFolderModalVisible = false"></div>
 <div
 class="w-[400px] bg-[#facc15] dark:bg-[#050505] border-4 border-black p-5 pointer-events-auto flex flex-col relative z-10 h-fit dark:border-[#222]">
 <h3 class="font-black text-xl uppercase tracking-widest text-black border-b-4 border-black pb-2 mb-4 dark:text-gray-100 dark:border-[#222]">
 New Folder</h3>
 <input ref="newFileInputRef" v-model="newFileFolderInput" @keydown.enter="submitNewFolder"
 @keydown.esc="isNewFolderModalVisible = false"
 class="border-4 border-black p-3 font-mono text-sm outline-none focus:-translate-y-1 focus: bg-white transition-all w-full dark:border-[#222] dark:bg-[#0a0a0a]"
 placeholder="folder_name" />
 <div class="flex gap-3 justify-end mt-5">
 <button @click="isNewFolderModalVisible = false"
 class="px-5 py-2 bg-white border-4 border-black text-black font-black uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors dark:bg-[#0a0a0a] dark:border-[#222] dark:text-gray-100">Cancel</button> 
 <button @click="submitNewFolder"
 class="px-5 py-2 bg-[#4ade80] border-4 border-black text-black font-black uppercase hover:-translate-y-1 hover: transition-all dark:bg-[#111] dark:border-[#222] dark:text-gray-100">Create</button>
 </div>
 </div>
 </div>

 <!-- Delete Confirmation Modal -->
 <div v-if="isDeleteModalVisible" class="fixed inset-0 z-50 flex justify-center items-center pointer-events-none">
 <div class="absolute inset-0 pointer-events-auto" style="background-color: rgba(0,0,0,0.5)"
 @mousedown="isDeleteModalVisible = false"></div>
 <div
 class="w-[400px] bg-[#ef4444] dark:bg-[#050505] border-4 border-black p-5 pointer-events-auto flex flex-col relative z-10 h-fit text-white dark:border-[#222]">
 <h3 class="font-black text-xl uppercase tracking-widest border-b-4 border-black pb-2 mb-4 dark:border-[#222]">
 Confirm Delete</h3>
 <p class="font-bold mb-2">Are you sure you want to delete <span
 class="bg-neo-pink text-black dark:bg-white dark:text-black px-2 py-0.5 rounded">{{
 contextMenuNode?.name || 'this item' }}</span>?</p>
 <p class="text-sm font-mono mb-4">This action cannot be undone.</p>
 <div class="flex gap-3 justify-end mt-2">
 <button @click="isDeleteModalVisible = false"
 class="px-5 py-2 bg-white border-4 border-black text-black font-black uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors dark:bg-[#0a0a0a] dark:border-[#222] dark:text-gray-100">Cancel</button> 
 <button @click="submitDelete"
 class="px-5 py-2 bg-black border-4 border-black text-white font-black uppercase hover:-translate-y-1 hover: transition-all dark:border-[#222]">Delete</button>
 </div>
 </div>
 </div>

 <!-- Context Menu -->
 <div v-if="isContextMenuVisible"
 class="fixed z-[100] bg-white border-2 border-black flex flex-col min-w-[160px] font-bold text-xs overflow-hidden dark:bg-[#0a0a0a] dark:border-[#222]"
 :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }" @click.stop>
 <button @click="openNewFileModal"
 class="px-3 py-2 text-left hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] border-b-2 border-black transition-colors flex items-center gap-2 dark:border-[#222]"> 
 <i class="pi pi-file"></i> New File
 </button>
 <button @click="openNewFolderModal"
 class="px-3 py-2 text-left hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] border-b-2 border-black transition-colors flex items-center gap-2 dark:border-[#222]"> 
 <i class="pi pi-folder"></i> New Folder
 </button>
 <template v-if="contextMenuNode">
 <button @click="renameFile(contextMenuNode.fileRef)"
 class="px-3 py-2 text-left hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] border-b-2 border-black transition-colors flex items-center gap-2 dark:border-[#222]"> 
 <i class="pi pi-pencil"></i> Rename
 </button>
 <button @click="revealInExplorer(contextMenuNode.fileRef)"
 class="px-3 py-2 text-left hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] border-b-2 border-black transition-colors flex items-center gap-2 dark:border-[#222]"> 
 <i class="pi pi-external-link"></i> Reveal in Explorer
 </button>
 <button @click="openDeleteModal"
 class="px-3 py-2 text-left bg-gray-100 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-2 text-red-500 dark:bg-[#111]"> 
 <i class="pi pi-trash"></i> Delete
 </button>
 </template>
 </div>

 <!-- Tab Context Menu -->
 <div v-if="isTabContextMenuVisible"
 class="fixed z-[100] bg-white border-2 border-black flex flex-col min-w-[160px] font-bold text-xs overflow-hidden dark:bg-[#0a0a0a] dark:border-[#222]"
 :style="{ top: tabContextMenuY + 'px', left: tabContextMenuX + 'px' }" @click.stop>
 <button @click="closeOtherTabs"
 class="px-3 py-2 text-left hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:bg-[#0a0a0a] border-b-2 border-black transition-colors flex items-center gap-2 dark:border-[#222]"> 
 <i class="pi pi-times-circle"></i> Close Others
 </button>
 </div>

 </div>
 </div>

 <!-- Global Drag Overlay to prevent iframe mouse event swallowing -->
 <div v-if="isResizingSidebar || isResizingEditor || isResizingTerminal" class="fixed inset-0 z-[9999]"
 :style="{ cursor: isResizingTerminal ? 'row-resize' : 'col-resize' }">
 </div>

 <!-- Background Plugins Container (Invisible) -->
 <div class="hidden">
 <iframe v-for="plugin in backgroundPlugins" :key="plugin.id" :src="getPluginUrl(plugin.id)"
 class="w-0 h-0 border-none pointer-events-none"></iframe>
 </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, nextTick, onMounted, onUnmounted, onActivated, computed, onErrorCaptured, watch, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { VueMonacoEditor, VueMonacoDiffEditor } from '@guolao/vue-monaco-editor'
import { marked } from 'marked'
import { directGenerateStream } from '@/services/aiGateway'
const TesterView = defineAsyncComponent(() => import('./TesterView.vue'))
const DatabaseView = defineAsyncComponent(() => import('./DatabaseView.vue'))

// Terminal dependencies for Opencode
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import 'xterm/css/xterm.css'

declare global {
 interface Window {
 electronAPI?: any
 }
}

// --- State ---
const route = useRoute()
const activeMainTab = ref('editor')

// --- Layout Resizing State ---
const sidebarWidth = ref(256)
const isResizingSidebar = ref(false)

const rightSidebarWidth = ref(480)
const isResizingRightSidebar = ref(false)

const editorWidthPercent = ref(50)
const isResizingEditor = ref(false)
const editorSplitRef = shallowRef<HTMLElement | null>(null)
const isLivePreviewVisible = ref(false)

const terminalHeight = ref(256)
const isResizingTerminal = ref(false)

const handleMouseMove = (e: MouseEvent) => {
 if (isResizingSidebar.value) {
 let newWidth = e.clientX - 64 - 12
 if (newWidth < 150) newWidth = 150
 if (newWidth > 600) newWidth = 600
 sidebarWidth.value = newWidth
 } else if (isResizingEditor.value && editorSplitRef.value) {
 const rect = editorSplitRef.value.getBoundingClientRect()
 let newPercent = ((e.clientX - rect.left) / rect.width) * 100
 if (newPercent < 10) newPercent = 10
 if (newPercent > 90) newPercent = 90
 editorWidthPercent.value = newPercent
 } else if (isResizingTerminal.value) {
 let newHeight = window.innerHeight - e.clientY
 if (newHeight < 100) newHeight = 100
 if (newHeight > window.innerHeight - 200) newHeight = window.innerHeight - 200
 terminalHeight.value = newHeight
 } else if (isResizingRightSidebar.value) {
 let newWidth = window.innerWidth - e.clientX
 if (newWidth < 300) newWidth = 300
 if (newWidth > 800) newWidth = 800
 rightSidebarWidth.value = newWidth
 }
}

const handleMouseUp = () => {
 if (isResizingSidebar.value || isResizingEditor.value || isResizingTerminal.value || isResizingRightSidebar.value) {
 isResizingSidebar.value = false
 isResizingEditor.value = false
 isResizingTerminal.value = false
 isResizingRightSidebar.value = false
 document.body.style.cursor = 'default'
 }
}

const startResizeSidebar = () => {
 isResizingSidebar.value = true
 document.body.style.cursor = 'col-resize'
}

const startResizeEditor = () => {
 isResizingEditor.value = true
 document.body.style.cursor = 'col-resize'
}

const startResizeRightSidebar = () => {
 isResizingRightSidebar.value = true
 document.body.style.cursor = 'col-resize'
}

const startResizeTerminal = () => {
 isResizingTerminal.value = true
 document.body.style.cursor = 'row-resize'
}

onMounted(() => {
 window.addEventListener('mousemove', handleMouseMove)
 window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
 window.removeEventListener('mousemove', handleMouseMove)
 window.removeEventListener('mouseup', handleMouseUp)
})

const isProjectOpen = ref(false)
const projectPath = ref('')
const projectName = ref('')
const allFiles = shallowRef<any[]>([])
const filesContent = shallowRef<Record<string, string>>({})
const unsavedChanges = shallowRef<Record<string, string>>({})
const selectedFile = ref('')
const activeCode = ref('')
const openTabs = ref<string[]>([])
const mruTabs = ref<string[]>([])

const isSyncing = ref(false)
const renderError = ref('')
const previewIframe = shallowRef<HTMLIFrameElement | null>(null)
const previewUrlInput = ref('http://localhost:5173')
const previewUrl = ref('http://localhost:5173')
const isPreviewLoading = ref(false)
const isAutoReloadEnabled = ref(false)

const previewDevice = ref('desktop')

// Search & Sidebar State
const activeSidebar = ref('explorer')
const searchQuery = ref('')
const searchInputRef = shallowRef<HTMLInputElement | null>(null)

// Plugin State & Logic
const isInstalledPluginOpen = ref(true)
const isRecommendedPluginOpen = ref(true)
const isInstalling = ref<string | null>(null)
const installedPluginsRegistry = ref<Record<string, any>>({})

const availablePlugins = ref<any[]>([])
const isFetchingMarketplace = ref(false)
const pluginSearchQuery = ref('')

const fetchMarketplace = async (force = false) => {
 if (isFetchingMarketplace.value || (!force && availablePlugins.value.length > 0)) return
 isFetchingMarketplace.value = true
 if (force) availablePlugins.value = [] // clear existing when forcing reload
 try {
 if (window.electronAPI && projectPath.value) {
 console.log('[DEBUG] Calling plugin:getMarketplace with projectPath:', projectPath.value)
 const localCheck = await window.electronAPI.invoke('plugin:getMarketplace', projectPath.value)
 console.log('[DEBUG] localCheck result:', localCheck)
 if (localCheck && localCheck.mode === 'local') {
 console.log('[DEBUG] Using local plugins:', localCheck.plugins)
 availablePlugins.value = localCheck.plugins
 isFetchingMarketplace.value = false
 return
 }
 } else {
 console.log('[DEBUG] Cannot call plugin:getMarketplace. electronAPI:', !!window.electronAPI, 'projectPath:', projectPath.value)
 }

 const res = await fetch('https://api.github.com/repos/HKA-web/Makarya.Plugins/contents/')
 if (res.ok) {
 const contents = await res.json()
 const plugins = []
 for (const item of contents) {
 if (item.type === 'dir' && !item.name.startsWith('.')) {
 try {
 const pkgRes = await fetch(`https://raw.githubusercontent.com/HKA-web/Makarya.Plugins/main/${encodeURIComponent(item.name)}/package.json`)
 if (pkgRes.ok) {
 const pkg = await pkgRes.json()
 plugins.push({
 id: pkg.id || item.name,
 name: pkg.name || item.name,
 description: pkg.description || 'No description',
 author: pkg.author || 'Unknown',
 downloads: pkg.downloads || '0',
 rating: pkg.rating || 0,
 icon: pkg.icon || 'pi-box',
 iconBg: pkg.iconBg || 'bg-gray-500',
 iconColor: pkg.iconColor || 'text-white',
 contributes: pkg.contributes || {},
 repository: `https://github.com/HKA-web/Makarya.Plugins.git`,
 folder: item.name
 })
 }
 } catch (e) { }
 }
 }
 availablePlugins.value = plugins
 } else {
 const errorText = await res.text()
 console.error('Marketplace API error:', res.status, errorText)
 alert(`Gagal mengambil ekstensi dari GitHub (Error ${res.status}). Jika ini Error 403, berarti kamu terkena Limit API GitHub. Silakan tunggu beberapa saat atau gunakan VPN.`)
 }
 } catch (e) {
 console.error('Marketplace fetch error:', e)
 }
 isFetchingMarketplace.value = false
}

const installedList = computed(() => {
 const list = Object.values(installedPluginsRegistry.value || {})
 if (!pluginSearchQuery.value) return list
 const q = pluginSearchQuery.value.toLowerCase()
 return list.filter(plugin => (plugin.name || '').toLowerCase().includes(q) || (plugin.description || '').toLowerCase().includes(q))
})

const recommendedList = computed(() => {
 const list = availablePlugins.value.filter(plugin => !installedPluginsRegistry.value[plugin.id])
 if (!pluginSearchQuery.value) return list
 const q = pluginSearchQuery.value.toLowerCase()
 return list.filter(plugin => plugin.name.toLowerCase().includes(q) || plugin.description.toLowerCase().includes(q))
})

const dynamicActivityBarPlugins = computed(() => {
 const result = []
 for (const pluginId in installedPluginsRegistry.value) {
 const plugin = installedPluginsRegistry.value[pluginId]
 if (plugin.enabled && plugin.contributes && plugin.contributes.buttons) {
 for (const item of plugin.contributes.buttons) {
 result.push({
 id: item.id || pluginId,
 title: item.title || plugin.name,
 icon: item.icon || plugin.icon || 'pi-star',
 entryPoint: item.entryPoint,
 target: item.target || 'left',
 pluginId: pluginId
 })
 }
 }
 }
 return result
})

const handlePluginButtonClick = (plugin: any) => {
 if (plugin.target === 'left') {
 activeSidebar.value = activeSidebar.value === plugin.id ? 'none' : plugin.id
 } else if (plugin.target === 'right') {
 isChatSidebarVisible.value = false // hide agent sidebar
 if (isPluginRightSidebarVisible.value && activeRightPluginId.value === plugin.id) {
 isPluginRightSidebarVisible.value = false
 } else {
 isPluginRightSidebarVisible.value = true
 activeRightPluginId.value = plugin.id
 }
 } else if (plugin.target === 'center') {
 openFile('plugin:' + plugin.id)
 }

 ensureGlobalListeners()
}

const isPluginActive = (plugin: any) => {
 if (plugin.target === 'left') return activeSidebar.value === plugin.id
 if (plugin.target === 'right') return isPluginRightSidebarVisible.value && activeRightPluginId.value === plugin.id
 if (plugin.target === 'center') return selectedFile.value === 'plugin:' + plugin.id
 return false
}

const getPluginUrl = (tab: string) => {
  const pluginId = tab.replace('plugin:', '')
  let targetPluginId = pluginId
  let entry = 'index.html'

  const dynBtn = dynamicActivityBarPlugins.value.find(p => p.id === pluginId)
  if (dynBtn) {
    targetPluginId = dynBtn.pluginId
    entry = dynBtn.entryPoint || 'index.html'
  } else {
    const plugin = installedPluginsRegistry.value[pluginId]
    if (plugin) {
      entry = plugin.main || 'index.html'
    }
  }

  return `file:///C:/Users/MSI/.makarya/plugins/${targetPluginId}/${entry}`
}

const backgroundPlugins = computed(() => {
 const result = []
 for (const pluginId in installedPluginsRegistry.value) {
 const plugin = installedPluginsRegistry.value[pluginId]
 if (plugin.enabled) {
 const hasButtons = plugin.contributes && plugin.contributes.buttons && plugin.contributes.buttons.length > 0
 if (!hasButtons) {
 result.push(plugin)
 }
 }
 }
 return result
})

const getPluginIcon = (id: string) => {
 const plugin = dynamicActivityBarPlugins.value.find(p => p.id === id)
 return plugin ? plugin.icon : 'pi-box'
}

const getPluginTitle = (id: string) => {
 const plugin = dynamicActivityBarPlugins.value.find(p => p.id === id)
 return plugin ? plugin.title : id
}

const loadPluginsRegistry = async () => {
 if (window.electronAPI && projectPath.value) {
 installedPluginsRegistry.value = await window.electronAPI.invoke('plugin:getList', projectPath.value)

 if (!window.MakaryaAPI) {
 window.MakaryaAPI = {
 activeEditor: null,
 _editorListeners: [],
 onEditorChange: (callback) => {
 window.MakaryaAPI._editorListeners.push(callback)
 if (window.MakaryaAPI.activeEditor) {
 callback(window.MakaryaAPI.activeEditor)
 }
 },
 editor: {
 registerCompletion: (lang: string, provider: any) => {
 if (window.monaco) {
 return window.monaco.languages.registerCompletionItemProvider(lang, provider)
 } else {
 let interval = setInterval(() => {
 if (window.monaco) {
 clearInterval(interval)
 window.monaco.languages.registerCompletionItemProvider(lang, provider)
 }
 }, 100)
 return { dispose: () => clearInterval(interval) }
 }
 }
 }
 }
 }

 // Execute background logic for plugins that provide an index.js
 for (const pluginId in installedPluginsRegistry.value) {
 const plugin = installedPluginsRegistry.value[pluginId]
 if (plugin.enabled && !(window as any)[`_plugin_${pluginId}`]) {
 try {
 const code = await window.electronAPI.invoke('plugin:readCode', projectPath.value, pluginId)
 if (code) {
 const transformedCode = code.replace(/export\s+function\s+(\w+)/g, 'exports.$1 = function')
 const fn = new Function('api', `
 const module = { exports: {} };
 const exports = module.exports;
 ${transformedCode}
 return module.exports;
 `)
 const pluginModule = fn(window.MakaryaAPI)
 if (pluginModule.activate) pluginModule.activate(window.MakaryaAPI)
 ; (window as any)[`_plugin_${pluginId}`] = pluginModule
 }
 } catch (e) {
 console.error(`Failed to load plugin code for ${pluginId}`, e)
 }
 }
 }
 }
}

const installPlugin = async (plugin: any) => {
 if (!window.electronAPI || !projectPath.value) return
 isInstalling.value = plugin.id
 try {
 const plainPlugin = JSON.parse(JSON.stringify(plugin))
 const success = await window.electronAPI.invoke('plugin:install', projectPath.value, plugin.id, plainPlugin)
 if (success) {
 await loadPluginsRegistry()
 alert('Plugin successfully installed. The application will now restart to apply changes.')
 window.location.reload()
 }
 } catch (e: any) {
 console.error('Failed to install plugin:', e)
 alert('Failed to install plugin. See console for details: ' + e.message)
 }
 isInstalling.value = null
}

const uninstallPlugin = async (id: string) => {
 if (!window.electronAPI || !projectPath.value) return
 try {
 const success = await window.electronAPI.invoke('plugin:uninstall', projectPath.value, id)
 if (success) {
 await loadPluginsRegistry()
 alert('Plugin successfully uninstalled. The application will now restart to apply changes.')
 window.location.reload()
 }
 } catch (e) {
 console.error('Failed to uninstall plugin:', e)
 }
}

watch(activeSidebar, (val) => {
 if (val === 'plugins') {
 fetchMarketplace()
 loadPluginsRegistry()
 }
})

watch(projectPath, () => {
 if (projectPath.value) {
 loadPluginsRegistry()
 }
 if (activeSidebar.value === 'plugins') {
 fetchMarketplace(true)
 }
})

// Quick Open State
const isQuickOpenVisible = ref(false)
const quickOpenQuery = ref('')
const quickOpenSelectedIndex = ref(0)
const quickOpenInputRef = shallowRef<HTMLInputElement | null>(null)
const quickOpenListRef = shallowRef<HTMLElement | null>(null)

// Rename Modal State
const isRenameModalVisible = ref(false)
const renameFileTarget = ref<any>(null)
const newFileName = ref('')
const renameInputRef = shallowRef<HTMLInputElement | null>(null)

// Context Menu & File Ops State
const isContextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuNode = ref<any>(null)

const isNewFileModalVisible = ref(false)
const isNewFolderModalVisible = ref(false)
const isDeleteModalVisible = ref(false)
const newFileFolderInput = ref('')
const newFileInputRef = shallowRef<HTMLInputElement | null>(null)

// Tab Context Menu State
const isTabContextMenuVisible = ref(false)
const tabContextMenuX = ref(0)
const tabContextMenuY = ref(0)
const tabContextMenuTarget = ref('')

const openTabContextMenu = (event: MouseEvent, tab: string) => {
 isTabContextMenuVisible.value = true
 tabContextMenuX.value = event.clientX
 tabContextMenuY.value = event.clientY
 tabContextMenuTarget.value = tab
}

const closeTabContextMenu = () => {
 isTabContextMenuVisible.value = false
}

const closeOtherTabs = () => {
 isTabContextMenuVisible.value = false
 if (tabContextMenuTarget.value) {
 const target = tabContextMenuTarget.value
 openTabs.value = [target]

 // Filter editorViewStates to only keep the target
 const newStates: Record<string, any> = {}
 if (editorViewStates.value[target]) {
 newStates[target] = editorViewStates.value[target]
 }
 editorViewStates.value = newStates

 if (selectedFile.value !== target) {
 openFile(target)
 }
 }
}

const quickOpenResults = ref<any[]>([])

let quickOpenTimeout: any = null
watch(quickOpenQuery, (newQuery) => {
 quickOpenSelectedIndex.value = 0
 if (quickOpenTimeout) clearTimeout(quickOpenTimeout)
 quickOpenTimeout = setTimeout(async () => {
 if (window.electronAPI && window.electronAPI.searchFileNames) {
 quickOpenResults.value = await window.electronAPI.searchFileNames(newQuery)
 }
 }, 100)
})

const quickOpenScrollToSelection = () => {
 nextTick(() => {
 if (!quickOpenListRef.value) return
 const selectedEl = quickOpenListRef.value.children[quickOpenSelectedIndex.value] as HTMLElement
 if (selectedEl) {
 selectedEl.scrollIntoView({ block: 'nearest' })
 }
 })
}

const handleQuickOpenKeydown = (e: KeyboardEvent) => {
 if (e.key === 'ArrowDown') {
 e.preventDefault()
 if (quickOpenSelectedIndex.value < quickOpenResults.value.length - 1) {
 quickOpenSelectedIndex.value++
 quickOpenScrollToSelection()
 }
 } else if (e.key === 'ArrowUp') {
 e.preventDefault()
 if (quickOpenSelectedIndex.value > 0) {
 quickOpenSelectedIndex.value--
 quickOpenScrollToSelection()
 }
 } else if (e.key === 'Enter') {
 e.preventDefault()
 const selected = quickOpenResults.value[quickOpenSelectedIndex.value]
 if (selected) {
 openFile(selected.relativePath || selected.path)
 isQuickOpenVisible.value = false
 }
 } else if (e.key === 'Escape') {
 e.preventDefault()
 isQuickOpenVisible.value = false
 }
}

// Monaco Editor Language mapping
const monacoLanguage = computed(() => {
 const file = isDiffMode.value && currentDiffFile.value ? currentDiffFile.value : selectedFile.value
 if (!file) return 'javascript'
 const plugin = file.split('.').pop()?.toLowerCase()
 const map: Record<string, string> = {
 'js': 'javascript',
 'ts': 'typescript',
 'vue': 'html', // fallback for vue files
 'html': 'html',
 'css': 'css',
 'json': 'json',
 'md': 'markdown',
 'php': 'php',
 'sql': 'sql',
 'py': 'python',
 'java': 'java',
 'c': 'c',
 'cpp': 'cpp',
 'cs': 'csharp',
 'go': 'go',
 'rs': 'rust',
 'rb': 'ruby',
 'sh': 'shell',
 'bash': 'shell',
 'yaml': 'yaml',
 'yml': 'yaml',
 'xml': 'xml',
 'ini': 'ini'
 }
 return map[plugin || ''] || 'javascript'
})

// Tree View Logic for Explorer
const fileTree = ref<any[]>([])

const toggleFolder = async (path: string) => {
 const newSet = new Set(expandedFolders.value)
 if (newSet.has(path)) {
 newSet.delete(path)
 expandedFolders.value = newSet
 } else {
 // Lazy load the folder if not loaded
 const findAndLoadNode = async (nodes: any[]) => {
 for (const node of nodes) {
 if (node.path === path) {
 if (!node.loaded && window.electronAPI) {
 const allChildren = await window.electronAPI.readDirectory(node.fileRef.path)

 let displayChildren = allChildren;
 let hiddenCount = 0;
 if (allChildren.length > 200) {
 hiddenCount = allChildren.length - 200;
 displayChildren = allChildren.slice(0, 200);
 }

 node.children = displayChildren.map((f: any) => ({
 name: f.name,
 isDir: f.isDirectory,
 path: f.path.substring(projectPath.value.length + 1).replace(/\\/g, '/'),
 fileRef: {
 name: f.name,
 path: f.path,
 relativePath: f.path.substring(projectPath.value.length + 1).replace(/\\/g, '/')
 },
 children: [],
 depth: node.depth + 1,
 loaded: false
 }))

 if (hiddenCount > 0) {
 node.children.push({
 name: `+ ${hiddenCount} more files (hidden)`,
 isDir: false,
 path: node.path + '/_hidden_',
 fileRef: { path: '', relativePath: '' },
 children: [],
 depth: node.depth + 1,
 loaded: true,
 isHiddenIndicator: true
 })
 }
 node.loaded = true
 }
 return true
 }
 if (node.isDir && node.loaded) {
 if (await findAndLoadNode(node.children)) return true
 }
 }
 return false
 }

 await findAndLoadNode(fileTree.value)
 newSet.add(path)
 expandedFolders.value = newSet
 }
}

const expandedFolders = ref<Set<string>>(new Set())

const collapseAll = () => {
 expandedFolders.value = new Set()
}

const locateActiveFile = async () => {
 if (!selectedFile.value) return;

 const parts = selectedFile.value.split('/');
 parts.pop(); // remove file name

 let currentPath = '';
 let changed = false;

 for (const part of parts) {
 currentPath = currentPath ? `${currentPath}/${part}` : part;
 if (!expandedFolders.value.has(currentPath)) {
 expandedFolders.value.add(currentPath);
 changed = true;
 }
 }

 if (changed) {
 await refreshExplorer();
 }

 nextTick(() => {
 const el = document.getElementById(`node-${selectedFile.value.replace(/[^a-zA-Z0-9]/g, '-')}`);
 if (el) {
 el.scrollIntoView({ behavior: 'smooth', block: 'center' });
 // Add a brief highlight effect
 const originalBg = el.style.backgroundColor;
 el.style.backgroundColor = '#facc15';
 setTimeout(() => {
 el.style.backgroundColor = originalBg;
 }, 1000);
 }
 });
}

const visibleFiles = computed(() => {
 const result: any[] = []
 const traverse = (nodes: any[]) => {
 for (const node of nodes) {
 result.push(node)
 if (node.isDir && expandedFolders.value.has(node.path)) {
 traverse(node.children)
 }
 }
 }
 traverse(fileTree.value)
 return result
})

const searchResults = ref<any[]>([])
const isSearching = ref(false)
let searchTimeout: any = null
let currentSearchId = 0

watch(searchQuery, (newQuery) => {
 if (searchTimeout) clearTimeout(searchTimeout)
 if (!newQuery || newQuery.trim().length < 2) {
 searchResults.value = []
 isSearching.value = false
 return
 }

 isSearching.value = true
 searchTimeout = setTimeout(async () => {
 const searchId = ++currentSearchId
 if (window.electronAPI && window.electronAPI.searchFiles) {
 const results = await window.electronAPI.searchFiles(projectPath.value, newQuery)
 if (searchId !== currentSearchId) return // Prevent race conditions

 const mergedResults = [...results]
 for (const [path, content] of Object.entries(unsavedChanges.value)) {
 if (typeof content !== 'string') continue
 const lines = content.split('\n')
 const matches: any[] = []
 lines.forEach((line, index) => {
 if (line.toLowerCase().includes(newQuery.toLowerCase())) {
 matches.push({ line: index + 1, preview: line.trim() })
 }
 })
 if (matches.length > 0) {
 const existingIdx = mergedResults.findIndex(r => r.path === path)
 if (existingIdx > -1) {
 mergedResults[existingIdx].matches = matches
 } else {
 mergedResults.push({ path, matches })
 }
 } else {
 const existingIdx = mergedResults.findIndex(r => r.path === path)
 if (existingIdx > -1) {
 mergedResults.splice(existingIdx, 1)
 }
 }
 }
 searchResults.value = mergedResults
 isSearching.value = false
 }
 }, 300)
})

const monacoEditorRef = shallowRef<any>(null)
const editorViewStates = shallowRef<Record<string, any>>({})

const openFileFromSearch = async (path: string, line?: number) => {
 await openFile(path)
 if (line) {
 nextTick(() => {
 if (monacoEditorRef.value) {
 monacoEditorRef.value.revealLineInCenter(line)
 monacoEditorRef.value.setPosition({ lineNumber: line, column: 1 })
 monacoEditorRef.value.focus()
 }
 })
 }
}

const openFile = async (relativePath: string) => {
 let path = relativePath.replace(/\\/g, '/')

 // In case Quick Open passes an absolute path, convert it to relative
 if (projectPath.value && path.toLowerCase().startsWith(projectPath.value.toLowerCase().replace(/\\/g, '/'))) {
 path = path.substring(projectPath.value.length + 1)
 }

 // Save current view state before switching
 if (selectedFile.value && selectedFile.value !== path && monacoEditorRef.value) {
 editorViewStates.value[selectedFile.value] = monacoEditorRef.value.saveViewState()
 }

 if (!openTabs.value.includes(path)) {
 openTabs.value.push(path)
 }

 // Update MRU tracking
 const mruIdx = mruTabs.value.indexOf(path)
 if (mruIdx > -1) {
 mruTabs.value.splice(mruIdx, 1)
 }
 mruTabs.value.unshift(path)

 selectedFile.value = path

 if (filesContent.value[path] === undefined) {
 if (window.electronAPI && projectPath.value) {
 const absolutePath = `${projectPath.value}/${path}`
 const content = await window.electronAPI.readFile(absolutePath)
 filesContent.value = {
 ...filesContent.value,
 [path]: content || ''
 }
 }
 }

 activeCode.value = unsavedChanges.value[path] !== undefined ? unsavedChanges.value[path] : filesContent.value[path] || ''

 if (pendingApprovals.value[path]) {
 openDiff(path)
 } else {
 exitDiffMode()
 }

 // Restore view state for the new file
 nextTick(() => {
 if (editorViewStates.value[path] && monacoEditorRef.value) {
 monacoEditorRef.value.restoreViewState(editorViewStates.value[path])
 }
 })
}

const closeTab = (path: string, event?: Event) => {
 if (event) event.stopPropagation()

 const index = openTabs.value.indexOf(path)
 if (index > -1) {
 openTabs.value.splice(index, 1)
 delete editorViewStates.value[path]
 }

 const mruIdx = mruTabs.value.indexOf(path)
 if (mruIdx > -1) {
 mruTabs.value.splice(mruIdx, 1)
 }

 if (selectedFile.value === path) {
 if (mruTabs.value.length > 0) {
 openFile(mruTabs.value[0])
 } else {
 selectedFile.value = ''
 activeCode.value = ''
 }
 }
}

// --- Pending Approvals State ---
const pendingApprovals = ref<Record<string, { original: string, modified: string }>>({})
const isDiffMode = ref(false)
const currentDiffFile = ref('')

const openDiff = (path: string) => {
 isDiffMode.value = true
 currentDiffFile.value = path
}

const exitDiffMode = () => {
 isDiffMode.value = false
 currentDiffFile.value = ''
}

const approveChange = () => {
 const path = currentDiffFile.value
 const change = pendingApprovals.value[path]
 if (!change) return

 // Set in memory to modified, it's already on disk
 filesContent.value[path] = change.modified
 unsavedChanges.value[path] = change.modified

 if (selectedFile.value === path) {
 if (monacoEditorRef.value) {
 const model = monacoEditorRef.value.getModel()
 if (model) {
 // PUSH EDIT OPERATION preserves the Undo stack!
 model.pushEditOperations(
 [],
 [{
 range: model.getFullModelRange(),
 text: change.modified
 }],
 () => null
 )
 } else {
 activeCode.value = change.modified
 }
 } else {
 activeCode.value = change.modified
 }
 }

 const newApprovals = { ...pendingApprovals.value }
 delete newApprovals[path]
 pendingApprovals.value = newApprovals

 exitDiffMode()
}

const rejectChange = async () => {
 const path = currentDiffFile.value
 const change = pendingApprovals.value[path]
 if (!change || !window.electronAPI) return

 // Revert on disk
 const separator = projectPath.value.includes('\\') ? '\\' : '/'
 const absolutePath = projectPath.value + (projectPath.value.endsWith(separator) ? '' : separator) + path.replace(/\//g, separator)

 try {
 await window.electronAPI.writeFile(absolutePath, change.original)
 } catch (err) {
 console.error("Failed to reject change:", err)
 }

 const newApprovals = { ...pendingApprovals.value }
 delete newApprovals[path]
 pendingApprovals.value = newApprovals

 exitDiffMode()
}

const broadcastToPlugins = (event: string, payload: any) => {
 const iframes = document.querySelectorAll('iframe');
 iframes.forEach(iframe => {
 if (iframe.contentWindow) {
 iframe.contentWindow.postMessage({ source: 'makarya-ide', event, payload }, '*');
 }
 });
}

const handleEditorChange = (value: string) => {
 if (selectedFile.value) {
 unsavedChanges.value = {
 ...unsavedChanges.value,
 [selectedFile.value]: value
 }
 broadcastToPlugins('editor.onChange', { code: value, path: selectedFile.value })
 }
}

const handleEditorMount = (editor: any, monaco: any) => {
 monacoEditorRef.value = editor
 window.monaco = monaco

 if (window.MakaryaAPI) {
 window.MakaryaAPI.activeEditor = editor
 if (window.MakaryaAPI._editorListeners) {
 window.MakaryaAPI._editorListeners.forEach((cb: any) => cb(editor))
 }
 } else {
 window.MakaryaAPI = { activeEditor: editor, _editorListeners: [], editor: {} }
 }

 editor.onDidChangeModel(() => console.log('[DEBUG] onDidChangeModel fired!'))

 editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL, function () {
 const selection = editor.getSelection();

 let targetTerminalId = 'term-opencode-plugin';

 // Jika panel Claude sedang aktif, arahkan ke terminal Claude
 if (isPluginRightSidebarVisible.value && activeRightPluginId.value === 'btn_claude') {
 targetTerminalId = 'term-claude-plugin';
 } else if (isPluginRightSidebarVisible.value && activeRightPluginId.value === 'btn_opencode') {
 targetTerminalId = 'term-opencode-plugin';
 }

 if (!selection.isEmpty()) {
 const model = editor.getModel();
 const selectedText = model.getValueInRange(selection);
 const startLine = selection.startLineNumber;
 const endLine = selection.endLineNumber;

 const fileContext = selectedFile.value ? `Reference: ${projectPath.value}/${selectedFile.value} (Baris ${startLine}-${endLine})\n` : '';
 const payload = `${fileContext}\`\`\`\n${selectedText}\n\`\`\`\n`;

 // Gunakan Bracketed Paste escape sequence agar terminal tidak auto-submit
 const formattedText = `\x1b[200~${payload}\x1b[201~`;

 setTimeout(() => {
 if (window.electronAPI && window.electronAPI.sendTerminalKeystroke) {
 window.electronAPI.sendTerminalKeystroke(targetTerminalId, formattedText);
 }
 }, 300);
 }
 });
}

const refreshIframe = () => {
 let finalUrl = previewUrlInput.value
 if (!finalUrl.startsWith('http')) {
 finalUrl = 'http://' + finalUrl
 previewUrlInput.value = finalUrl
 }

 if (previewIframe.value) {
 if (previewUrl.value === finalUrl) {
 previewIframe.value.reload()
 } else {
 previewUrl.value = finalUrl
 }
 }
}

const openDevTools = () => {
 if (previewIframe.value) {
 (previewIframe.value as any).openDevTools()
 }
}

const goBack = () => {
 if (previewIframe.value && previewIframe.value.canGoBack()) {
 previewIframe.value.goBack()
 }
}

const goForward = () => {
 if (previewIframe.value && previewIframe.value.canGoForward()) {
 previewIframe.value.goForward()
 }
}

const handleNavigate = (e: any) => {
 if (e.url) {
 previewUrlInput.value = e.url
 // Do not sync previewUrl.value to avoid double load loop
 }
}

const handleStartLoading = () => {
 isPreviewLoading.value = true
}

const handleStopLoading = () => {
 isPreviewLoading.value = false
}

onErrorCaptured((err, instance, info) => {
 renderError.value = `${err.message}\n\nInfo: ${info}\n\nStack: ${err.stack}`
 return false // stop propagation
})

// --- Native Chat Agent Terminal State ---
const isChatSidebarVisible = ref(false)
const chatSelectedAgent = ref('opencode')
const chatAgentTermEl = ref<HTMLElement | null>(null)
let chatAgentXterm: Terminal | null = null
let chatAgentFitAddon: FitAddon | null = null



const chatUploadedImagePath = ref<string | null>(null)
const chatUploadedFileName = ref<string>('')
const chatUploadedImage = ref(false)

const CHAT_TERM_ID = 'term-chat-agent'

const initChatAgentTerminal = () => {
  if (!chatAgentTermEl.value) return

  if (!chatAgentXterm) {
    chatAgentXterm = new Terminal({
      theme: { background: '#000000', foreground: '#d8b4fe', cursor: '#d8b4fe' },
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      fontSize: 13,
      cursorBlink: true
    })
    chatAgentFitAddon = new FitAddon()
    chatAgentXterm.loadAddon(chatAgentFitAddon)
    chatAgentXterm.open(chatAgentTermEl.value)

    ensureGlobalListeners()

const getRelativeImagePath = (fullPath: string) => {
  if (!fullPath) return ''
  const normFull = fullPath.replace(/\\/g, '/')
  const normProj = projectPath.value ? projectPath.value.replace(/\\/g, '/') : ''

  if (normProj && normFull.toLowerCase().startsWith(normProj.toLowerCase())) {
    let rel = normFull.substring(normProj.length)
    if (rel.startsWith('/')) rel = rel.substring(1)
    return rel
  }
  return normFull
}

    chatAgentXterm.onData((data: string) => {
      if ((data === '\r' || data === '\n') && chatUploadedImagePath.value) {
        const relPath = getRelativeImagePath(chatUploadedImagePath.value)
        const inject = ` @${relPath} `
        if (window.electronAPI) {
          window.electronAPI.sendTerminalKeystroke(CHAT_TERM_ID, inject)
          setTimeout(() => {
            window.electronAPI.sendTerminalKeystroke(CHAT_TERM_ID, '\r')
            clearChatImage()
          }, 50)
        }
        return
      }
      if (window.electronAPI) {
        window.electronAPI.sendTerminalKeystroke(CHAT_TERM_ID, data)
      }
    })

    const chatResizeObserver = new ResizeObserver(() => {
      if (isChatSidebarVisible.value && chatAgentFitAddon && chatAgentXterm) {
        try {
          chatAgentFitAddon.fit()
          if (window.electronAPI) {
            window.electronAPI.resizeTerminal(CHAT_TERM_ID, chatAgentXterm.cols, chatAgentXterm.rows)
          }
        } catch (e) {}
      }
    })
    chatResizeObserver.observe(chatAgentTermEl.value)

    setTimeout(() => {
      if (chatAgentFitAddon) try { chatAgentFitAddon.fit() } catch(e){}
      const cols = (chatAgentXterm && chatAgentXterm.cols > 10) ? chatAgentXterm.cols : 80
      const rows = (chatAgentXterm && chatAgentXterm.rows > 5) ? chatAgentXterm.rows : 24

      if (window.electronAPI) {
        window.electronAPI.connectTerminal(CHAT_TERM_ID, projectPath.value, cols, rows)
        setTimeout(() => {
          window.electronAPI.sendTerminalKeystroke(CHAT_TERM_ID, `${chatSelectedAgent.value}\r`)
        }, 500)
      }
    }, 100)
  }
}

watch(isChatSidebarVisible, (visible) => {
  if (visible) {
    nextTick(() => {
      initChatAgentTerminal()
      if (chatAgentFitAddon) {
        setTimeout(() => {
          try { chatAgentFitAddon!.fit() } catch(e){}
          if (chatAgentXterm && window.electronAPI) {
            window.electronAPI.resizeTerminal(CHAT_TERM_ID, chatAgentXterm.cols, chatAgentXterm.rows)
          }
          if (chatAgentXterm) chatAgentXterm.focus()
        }, 200)
      }
    })
  }
})

onMounted(async () => {
  if (window.electronAPI && window.electronAPI.getConfig) {
    if (window.electronAPI.getAiPort) {
      aiServerPort.value = await window.electronAPI.getAiPort()
    }
    const config = await window.electronAPI.getConfig()
    if (config) {
      if (config.providers) {
        const providers = Object.keys(config.providers)
        if (providers.length > 0) {
          agentProviders.value = providers

          providers.forEach(p => {
            if (config.providers[p].models && Array.isArray(config.providers[p].models)) {
              chatModels.value[p] = config.providers[p].models
            } else {
              chatModels.value[p] = [config.providers[p].model || 'default']
            }
          })
        }
      }
    }
  }
})

const onChatAgentChange = () => {
  if (!window.electronAPI) return

  if (chatAgentFitAddon) try { chatAgentFitAddon.fit() } catch(e){}
  if (chatAgentXterm) {
    chatAgentXterm.reset()
    chatAgentXterm.write(`\r\n\x1b[32m[Switching agent to ${chatSelectedAgent.value}...]\x1b[0m\r\n\r\n`)
  }

  window.electronAPI.killTerminal(CHAT_TERM_ID)

  setTimeout(() => {
    if (chatAgentFitAddon) try { chatAgentFitAddon.fit() } catch(e){}
    if (chatAgentXterm) chatAgentXterm.reset()

    const cols = (chatAgentXterm && chatAgentXterm.cols > 10) ? chatAgentXterm.cols : 80
    const rows = (chatAgentXterm && chatAgentXterm.rows > 5) ? chatAgentXterm.rows : 24

    window.electronAPI.connectTerminal(CHAT_TERM_ID, projectPath.value, cols, rows)
    window.electronAPI.resizeTerminal(CHAT_TERM_ID, cols, rows)

    setTimeout(() => {
      window.electronAPI.sendTerminalKeystroke(CHAT_TERM_ID, `${chatSelectedAgent.value}\r`)
    }, 800)
  }, 400)
}



const getImageUploadDir = async () => {
  let baseDir = projectPath.value
  if (!baseDir) {
    baseDir = 'D:\\Project\\Php\\Backend.Erp'
  }
  const separator = baseDir.includes('\\') ? '\\' : '/'
  const targetDir = `${baseDir}${separator}.makarya${separator}images`
  if (window.electronAPI && window.electronAPI.createDirectory) {
    await window.electronAPI.createDirectory(targetDir)
  }
  return targetDir
}

const handleChatBrowseImage = async () => {
  if (!window.electronAPI) return
  const srcPath = await window.electronAPI.openImageFile()
  if (srcPath) {
    const fileName = srcPath.split(/[\\/]/).pop() || 'image.png'
    const targetDir = await getImageUploadDir()
    const separator = targetDir.includes('\\') ? '\\' : '/'
    const destPath = `${targetDir}${separator}${fileName}`
    const ok = await window.electronAPI.copyFile(srcPath, destPath)
    if (ok) {
      chatUploadedImagePath.value = destPath
      chatUploadedFileName.value = fileName
      chatUploadedImage.value = true
    }
  }
}

const handleChatPasteImage = async () => {
  if (!window.electronAPI) return
  const imgData = await window.electronAPI.readClipboardImage()
  if (!imgData) {
    alert('Tidak ada gambar di clipboard.\nCoba screenshot dulu (Win+Shift+S atau PrintScreen), lalu klik Paste.')
    return
  }
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 15)
  const fileName = `clipboard_${ts}.${imgData.ext || 'png'}`
  const targetDir = await getImageUploadDir()
  const separator = targetDir.includes('\\') ? '\\' : '/'
  const destPath = `${targetDir}${separator}${fileName}`
  const ok = await window.electronAPI.writeFileBase64(destPath, imgData.base64)
  if (ok) {
    chatUploadedImagePath.value = destPath
    chatUploadedFileName.value = fileName
    chatUploadedImage.value = true
  }
}

const clearChatImage = () => {
  chatUploadedImagePath.value = null
  chatUploadedFileName.value = ''
  chatUploadedImage.value = false
}

// --- New Chat Sessions State ---
const chatSessions = ref([{
   id: Date.now(),
   name: 'Sesi 1',
   chatHistory: []
}])
const activeSessionId = ref(chatSessions.value[0].id)
const isAddingSession = ref(false)
const newSessionName = ref('')
const editingSessionId = ref(null)

const activeSession = computed(() => chatSessions.value.find(s => s.id === activeSessionId.value))
const newSessionInputRef = ref(null)

const startAddSession = async () => {
   isAddingSession.value = true
   newSessionName.value = ''
   await nextTick()
   if (newSessionInputRef.value) {
       newSessionInputRef.value.focus()
   }
}

const confirmAddSession = () => {
   if (!newSessionName.value.trim()) {
      isAddingSession.value = false
      return
   }
   const newId = Date.now()
   chatSessions.value.push({
      id: newId,
      name: newSessionName.value.trim(),
      chatHistory: []
   })
   activeSessionId.value = newId
   isAddingSession.value = false
}

const cancelAddSession = () => {
   isAddingSession.value = false
}

const deleteSession = (id: number) => {
   if (chatSessions.value.length === 1) return
   chatSessions.value = chatSessions.value.filter(p => p.id !== id)
   if (activeSessionId.value === id) {
      activeSessionId.value = chatSessions.value[0].id
   }
}

const renderMarkdown = (text: string) => {
   if (!text) return ''
   return marked(text)
}

const isChatLoading = ref(false)
const chatInput = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const currentAbortController = ref<AbortController | null>(null)
const isCtrlTabModalVisible = ref(false)
const ctrlTabSelectedIndex = ref(0)

const scrollToBottom = () => {
   nextTick(() => {
      if (chatContainer.value) {
         chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
   })
}

const stopAI = () => {
   if (currentAbortController.value) {
      currentAbortController.value.abort()
   }
}

const submitCustomChat = async () => {
   if (!chatInput.value.trim() || isChatLoading.value || !activeSession.value) return
   
   let userMsg = chatInput.value.trim()
   chatInput.value = ''

   if (activeMainTab.value === 'editor' && mruTabs.value.length > 0) {
      const activeFile = mruTabs.value[0]
      const content = filesContent.value[activeFile]
      if (content) {
         userMsg += `\n\n[CONTEXT: The user is currently viewing the file: ${activeFile}]\n\`\`\`\n${content.substring(0, 3000)}\n\`\`\``
      }
   }

   activeSession.value.chatHistory.push({ role: 'user', content: userMsg })
   isChatLoading.value = true

   const agentMsgIndex = activeSession.value.chatHistory.length
   activeSession.value.chatHistory.push({ role: 'assistant', content: '' })

   scrollToBottom()

   try {
      const systemPrompt = `You are Makarya AI, an elite coding assistant integrated inside the IDE.`
      currentAbortController.value = new AbortController()
      
      await new Promise((resolve, reject) => {
         directGenerateStream(
            systemPrompt,
            activeSession.value.chatHistory,
            (chunk: string) => {
               activeSession.value.chatHistory[agentMsgIndex].content += chunk
               scrollToBottom()
            },
            () => resolve(true),
            (err: Error) => reject(err),
            currentAbortController.value.signal,
            projectPath.value
         )
      })

   } catch (err: any) {
      if (err.name === 'AbortError') {
         activeSession.value.chatHistory[agentMsgIndex].content += "\n\n**[Dihentikan oleh pengguna]**"
      } else {
         activeSession.value.chatHistory[agentMsgIndex].content = `Gagal terhubung ke AI. Error: ${err.message}`
      }
   } finally {
      isChatLoading.value = false
      currentAbortController.value = null
   }
}

const resetChat = () => {
   if (activeSession.value) {
       activeSession.value.chatHistory = []
   }
}



watch(chatSelectedAgent, (newAgent) => {
 if (newAgent && chatModels.value[newAgent]) {
 chatSelectedModel.value = chatModels.value[newAgent][0]
 }
})

const isPluginRightSidebarVisible = ref(false)
const activeRightPluginId = ref('')
// Terminal plugin states handled internally by their respective iframe plugins



// --- User Terminal State ---
const isUserTerminalVisible = ref(false)
const userTerminals = ref<any[]>([])
const activeUserTerminalId = ref<string | null>(null)
const terminalRefs = new Map<string, HTMLElement>()

const setTerminalRef = (el: any, id: string) => {
 if (el) terminalRefs.set(id, el)
 else terminalRefs.delete(id)
}

// --- Icons & Styling Helpers ---
const getFileIcon = (filename: string) => {
 const plugin = filename.split('.').pop()?.toLowerCase() || ''
 switch (plugin) {
 case 'vue': return { icon: 'pi pi-box', color: 'text-[#4ade80]' } // Green
 case 'js':
 case 'mjs':
 case 'cjs': return { icon: 'pi pi-code', color: 'text-[#facc15]' } // Yellow
 case 'ts': return { icon: 'pi pi-code', color: 'text-[#3b82f6]' } // Blue
 case 'css':
 case 'scss': return { icon: 'pi pi-palette', color: 'text-[#3b82f6]' } // Blue
 case 'html': return { icon: 'pi pi-globe', color: 'text-[#f97316]' } // Orange
 case 'json': return { icon: 'pi pi-cog', color: 'text-gray-500' } // Gray
 case 'md': return { icon: 'pi pi-book', color: 'text-gray-800' } // Dark
 case 'png':
 case 'jpg':
 case 'jpeg':
 case 'svg': return { icon: 'pi pi-image', color: 'text-[#f472b6]' } // Pink
 default: return { icon: 'pi pi-file', color: 'text-gray-400' }
 }
}

const getGroupStyle = (groupName: string) => {
 switch (groupName) {
 case 'Vue Components': return 'bg-[#4ade80] text-black border-4 border-black'
 case 'Scripts': return 'bg-[#facc15] text-black border-4 border-black'
 case 'Styles': return 'bg-[#3b82f6] dark:bg-[#111] text-white border-4 border-black'
 case 'JSON Configuration': return 'bg-gray-300 text-black border-4 border-black'
 case 'HTML Templates': return 'bg-[#f97316] text-white border-4 border-black'
 case 'Assets': return 'bg-[#f472b6] text-white border-4 border-black'
 case 'Markdown': return 'bg-neo-yellow text-black dark:bg-white dark:text-black border-4 border-black'
 default: return 'bg-white dark:bg-[#0a0a0a] text-black border-4 border-black'
 }
}

// --- File System Logic ---
const openProject = async () => {
 try {
 if (window.electronAPI) {
 const lastPath = localStorage.getItem('lastProjectPath') || undefined;
 const result = await window.electronAPI.openDirectory(lastPath)

 if (result) {
 localStorage.setItem('lastProjectPath', result.path);
 projectPath.value = result.path
 projectName.value = result.name

 // Load only root folder instantly
 const allRootFiles = await window.electronAPI.readDirectory(result.path)

 let displayRootFiles = allRootFiles;
 let hiddenRootCount = 0;
 if (allRootFiles.length > 200) {
 hiddenRootCount = allRootFiles.length - 200;
 displayRootFiles = allRootFiles.slice(0, 200);
 }

 const mapRoot = displayRootFiles.map((f: any) => ({
 name: f.name,
 isDir: f.isDirectory,
 path: f.path.substring(result.path.length + 1).replace(/\\/g, '/'),
 fileRef: {
 name: f.name,
 path: f.path,
 relativePath: f.path.substring(result.path.length + 1).replace(/\\/g, '/')
 },
 children: [],
 depth: 0,
 loaded: false
 }))

 if (hiddenRootCount > 0) {
 mapRoot.push({
 name: `+ ${hiddenRootCount} more files (hidden)`,
 isDir: false,
 path: result.path + '/_hidden_',
 fileRef: { path: '', relativePath: '' },
 children: [],
 depth: 0,
 loaded: true,
 isHiddenIndicator: true
 })
 }

 fileTree.value = mapRoot

 filesContent.value = {}
 isProjectOpen.value = true

 // Load the rest of the files in the background for Search & Quick Open without blocking UI
 setTimeout(async () => {
 // Now only returns top 100 items for initial quick open cache
 const initialQuickOpen = await window.electronAPI.getAllFiles(result.path)
 quickOpenResults.value = initialQuickOpen
 }, 100)
 }
 }
 } catch (err: any) {
 window.alert("Gagal membuka project:" + err.message);
 console.error("Open Project Error:", err);
 }
}

const revealInExplorer = (file: any) => {
 if (window.electronAPI && window.electronAPI.revealInExplorer) {
 const separator = projectPath.value.includes('\\') ? '\\' : '/'
 const absolutePath = projectPath.value + (projectPath.value.endsWith(separator) ? '' : separator) + file.relativePath.replace(/\//g, separator)
 window.electronAPI.revealInExplorer(absolutePath)
 }
}

const renameFile = (file: any) => {
 renameFileTarget.value = file
 newFileName.value = file.name
 isRenameModalVisible.value = true
 nextTick(() => {
 if (renameInputRef.value) {
 renameInputRef.value.focus()
 const lastDotIdx = file.name.lastIndexOf('.')
 if (lastDotIdx > 0) {
 renameInputRef.value.setSelectionRange(0, lastDotIdx)
 } else {
 renameInputRef.value.select()
 }
 }
 })
}

const openContextMenu = (event: MouseEvent, node: any) => {
 isContextMenuVisible.value = true
 contextMenuX.value = event.clientX
 contextMenuY.value = event.clientY
 contextMenuNode.value = node
}

const closeContextMenu = () => {
 isContextMenuVisible.value = false
}

onMounted(() => {
 document.addEventListener('click', closeContextMenu)
 document.addEventListener('click', closeTabContextMenu)
})
onUnmounted(() => {
 document.removeEventListener('click', closeContextMenu)
 document.removeEventListener('click', closeTabContextMenu)
})

const getContextMenuPath = () => {
 if (contextMenuNode.value) {
 if (contextMenuNode.value.isDir) {
 return contextMenuNode.value.fileRef.relativePath
 } else {
 const parts = contextMenuNode.value.fileRef.relativePath.split(/[/\\]/)
 parts.pop()
 return parts.join('/')
 }
 }
 return ''
}

const getAbsolutePath = (relativePath: string) => {
 const separator = projectPath.value.includes('\\') ? '\\' : '/'
 return projectPath.value + (projectPath.value.endsWith(separator) ? '' : separator) + relativePath.replace(/\//g, separator)
}

const openNewFileModal = () => {
 closeContextMenu()
 newFileFolderInput.value = ''
 isNewFileModalVisible.value = true
 nextTick(() => {
 if (newFileInputRef.value) newFileInputRef.value.focus()
 })
}

const openNewFolderModal = () => {
 closeContextMenu()
 newFileFolderInput.value = ''
 isNewFolderModalVisible.value = true
 nextTick(() => {
 if (newFileInputRef.value) newFileInputRef.value.focus()
 })
}

const openDeleteModal = () => {
 closeContextMenu()
 isDeleteModalVisible.value = true
}

const refreshExplorer = async () => {
 if (!projectPath.value || !window.electronAPI) return;

 const fetchDir = async (dirPath: string, depth: number) => {
 const children = await window.electronAPI.readDirectory(dirPath);
 let displayChildren = children;
 if (children.length > 200) {
 displayChildren = children.slice(0, 200);
 }

 const nodes = [];
 for (const f of displayChildren) {
 const relPath = f.path.substring(projectPath.value.length + 1).replace(/\\/g, '/');
 const isExpanded = expandedFolders.value.has(relPath);

 const node: any = {
 name: f.name,
 isDir: f.isDirectory,
 path: relPath,
 fileRef: {
 name: f.name,
 path: f.path,
 relativePath: relPath
 },
 children: [],
 depth: depth,
 loaded: isExpanded
 };

 if (f.isDirectory && isExpanded) {
 node.children = await fetchDir(f.path, depth + 1);
 }

 nodes.push(node);
 }

 if (children.length > 200) {
 nodes.push({
 name: `+ ${children.length - 200} hidden items...`,
 isDir: false,
 path: dirPath + '/_hidden_indicator',
 fileRef: null,
 children: [],
 depth: depth,
 loaded: false,
 isHiddenIndicator: true
 });
 }
 return nodes;
 };

 fileTree.value = await fetchDir(projectPath.value, 0);

 const allFilesResult = await window.electronAPI.getAllFiles(projectPath.value)
 allFiles.value = allFilesResult.sort((a: any, b: any) => a.relativePath.localeCompare(b.relativePath))
}

const submitNewFile = async () => {
 if (!newFileFolderInput.value.trim()) return
 const parentPath = getContextMenuPath()
 const relativePath = parentPath ? `${parentPath}/${newFileFolderInput.value.trim()}` : newFileFolderInput.value.trim()
 const absolutePath = getAbsolutePath(relativePath)

 if (window.electronAPI && window.electronAPI.createFile) {
 const success = await window.electronAPI.createFile(absolutePath)
 if (success) {
 isNewFileModalVisible.value = false

 const parentParts = relativePath.split('/')
 parentParts.pop()
 let currentPath = ''
 for (const part of parentParts) {
 currentPath = currentPath ? `${currentPath}/${part}` : part
 const absPath = getAbsolutePath(currentPath)
 if (!expandedFolders.value.has(absPath)) {
 expandedFolders.value.add(absPath)
 }
 }

 await refreshExplorer()
 openFile(absolutePath)
 }
 }
}

const submitNewFolder = async () => {
 if (!newFileFolderInput.value.trim()) return
 const parentPath = getContextMenuPath()
 const relativePath = parentPath ? `${parentPath}/${newFileFolderInput.value.trim()}` : newFileFolderInput.value.trim()
 const absolutePath = getAbsolutePath(relativePath)

 if (window.electronAPI && window.electronAPI.createDirectory) {
 const success = await window.electronAPI.createDirectory(absolutePath)
 if (success) {
 isNewFolderModalVisible.value = false

 const parts = relativePath.split('/')
 let currentPath = ''
 for (const part of parts) {
 currentPath = currentPath ? `${currentPath}/${part}` : part
 const absPath = getAbsolutePath(currentPath)
 if (!expandedFolders.value.has(absPath)) {
 expandedFolders.value.add(absPath)
 }
 }

 await refreshExplorer()
 }
 }
}

const submitDelete = async () => {
 if (!contextMenuNode.value) return
 const absolutePath = contextMenuNode.value.fileRef.path
 const relativePath = contextMenuNode.value.fileRef.relativePath.replace(/\\/g, '/')

 if (window.electronAPI && window.electronAPI.deleteItem) {
 const success = await window.electronAPI.deleteItem(absolutePath)
 if (success) {
 isDeleteModalVisible.value = false
 if (contextMenuNode.value.isDir) {
 openTabs.value = openTabs.value.filter(tab => !tab.startsWith(relativePath + '/'))
 if (selectedFile.value && selectedFile.value.startsWith(relativePath + '/')) {
 selectedFile.value = openTabs.value[0] || null
 }
 } else {
 closeTab(relativePath)
 }
 await refreshExplorer()
 }
 }
}

const submitRename = async () => {
 const file = renameFileTarget.value
 const newName = newFileName.value

 if (!file || !newName || newName === file.name) {
 isRenameModalVisible.value = false
 return
 }

 isRenameModalVisible.value = false

 const separator = projectPath.value.includes('\\') ? '\\' : '/'
 const oldRelativePathStr = file.relativePath.replace(/\\/g, '/')
 const oldAbsolutePath = projectPath.value + (projectPath.value.endsWith(separator) ? '' : separator) + file.relativePath.replace(/\//g, separator)

 let newRelativePathArr = file.relativePath.split('/')
 if (file.relativePath.includes('\\')) {
 newRelativePathArr = file.relativePath.split('\\')
 }
 newRelativePathArr.pop()
 newRelativePathArr.push(newName)

 const newRelativePath = newRelativePathArr.join(separator)
 const newAbsolutePath = projectPath.value + (projectPath.value.endsWith(separator) ? '' : separator) + newRelativePath

 if (window.electronAPI && window.electronAPI.renameFile) {
 const success = await window.electronAPI.renameFile(oldAbsolutePath, newAbsolutePath)
 if (success) {
 const newRelativePathStr = newRelativePath.replace(/\\/g, '/')

 const oldTabIdx = openTabs.value.findIndex(t => t === oldRelativePathStr)
 if (oldTabIdx > -1) openTabs.value[oldTabIdx] = newRelativePathStr

 if (selectedFile.value === oldRelativePathStr) selectedFile.value = newRelativePathStr

 if (filesContent.value[oldRelativePathStr] !== undefined) {
 const updatedFiles = { ...filesContent.value }
 updatedFiles[newRelativePathStr] = updatedFiles[oldRelativePathStr]
 delete updatedFiles[oldRelativePathStr]
 filesContent.value = updatedFiles
 }

 if (unsavedChanges.value[oldRelativePathStr] !== undefined) {
 const updatedUnsaved = { ...unsavedChanges.value }
 updatedUnsaved[newRelativePathStr] = updatedUnsaved[oldRelativePathStr]
 delete updatedUnsaved[oldRelativePathStr]
 unsavedChanges.value = updatedUnsaved
 }

 // Refresh file list
 await refreshExplorer()
 } else {
 alert('Failed to rename file.')
 }
 }
}

const closeProject = () => {
 isProjectOpen.value = false
 projectPath.value = ''
 projectName.value = ''
 filesContent.value = {}
 unsavedChanges.value = {}
 selectedFile.value = ''
 activeCode.value = ''
 openTabs.value = []
 if (window.electronAPI) {
 userTerminals.value.forEach((t: any) => {
 if (window.electronAPI) window.electronAPI.killTerminal(t.id)
 })
 }

 userTerminals.value.forEach((t: any) => {
 if (t.xterm) t.xterm.dispose()
 if (t.resizeObserver) t.resizeObserver.disconnect()
 })
 userTerminals.value = []
 activeUserTerminalId.value = null
 isChatSidebarVisible.value = false
 isUserTerminalVisible.value = false
}

const saveToDisk = async () => {
 if (!projectPath.value || !window.electronAPI) return

 const paths = Object.keys(unsavedChanges.value)
 if (paths.length === 0) return

 isSyncing.value = true
 try {
 const updatedFiles = { ...filesContent.value }

 for (const path of paths) {
 const code = unsavedChanges.value[path]
 const relativePath = path
 const separator = projectPath.value.includes('\\') ? '\\' : '/'
 const normalizedRelativePath = relativePath.replace(/\//g, separator)
 const absolutePath = projectPath.value + (projectPath.value.endsWith(separator) ? '' : separator) + normalizedRelativePath

 await window.electronAPI.writeFile(absolutePath, code)

 // Beri tahu semua plugin bahwa file ini baru saja di-save
 broadcastToPlugins('editor.onSave', { code: code, path: absolutePath })

 // Update the saved content to the main filesContent state
 updatedFiles[path] = code
 }

 filesContent.value = updatedFiles
 unsavedChanges.value = {} // Reset dirty tracking

 if (isAutoReloadEnabled.value) {
 refreshIframe()
 }
 } catch (err) {
 console.error('Error saving files to disk:', err)
 } finally {
 isSyncing.value = false
 }
}

const handleGlobalKeyUp = (e: KeyboardEvent) => {
 if (e.key === 'Control' && isCtrlTabModalVisible.value) {
 isCtrlTabModalVisible.value = false
 if (mruTabs.value.length > 0 && mruTabs.value[ctrlTabSelectedIndex.value]) {
 openFile(mruTabs.value[ctrlTabSelectedIndex.value])
 }
 }
}

const handleGlobalKeyDown = (e: KeyboardEvent) => {
 if (e.ctrlKey && e.key === 'Tab') {
 e.preventDefault()
 if (activeMainTab.value === 'editor' && mruTabs.value.length > 0) {
 if (!isCtrlTabModalVisible.value) {
 isCtrlTabModalVisible.value = true
 ctrlTabSelectedIndex.value = mruTabs.value.length > 1 ? 1 : 0
 } else {
 if (e.shiftKey) {
 ctrlTabSelectedIndex.value = (ctrlTabSelectedIndex.value - 1 + mruTabs.value.length) % mruTabs.value.length
 } else {
 ctrlTabSelectedIndex.value = (ctrlTabSelectedIndex.value + 1) % mruTabs.value.length
 }
 }
 } else {
 // Ctrl + Shift + Tab fallback for switching main feature tabs
 const tabs = ['editor', 'database', 'tester']
 activeMainTab.value = tabs[(tabs.indexOf(activeMainTab.value) + 1) % tabs.length]
 }
 return
 }

 if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
 e.preventDefault()
 saveToDisk()
 } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'e') {
 e.preventDefault()
 isQuickOpenVisible.value = !isQuickOpenVisible.value
 if (isQuickOpenVisible.value) {
 quickOpenQuery.value = ''
 quickOpenSelectedIndex.value = 0
 nextTick(() => {
 if (quickOpenInputRef.value) quickOpenInputRef.value.focus()
 })
 }
 } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'b') {
 e.preventDefault()
 activeSidebar.value = activeSidebar.value === 'explorer' ? 'none' : 'explorer'
 } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
 e.preventDefault()
 activeSidebar.value = activeSidebar.value === 'search' ? 'none' : 'search'
 if (activeSidebar.value === 'search') {
 nextTick(() => {
 if (searchInputRef.value) searchInputRef.value.focus()
 })
 }
 } else if (e.key === 'Escape' && isQuickOpenVisible.value) {
 e.preventDefault()
 isQuickOpenVisible.value = false
 }
}

// --- SDK Communication (Plugin to IDE) ---
const handlePluginRequest = async (data: any, sourceWindow: any) => {
 const { id, action, payload } = data;
 let result = null;
 let error = null;

 try {
 switch (action) {
 case 'editor.getCode':
 result = activeCode.value;
 break;
 case 'editor.getFilePath':
 result = selectedFile.value;
 break;
 case 'editor.replaceCode':
 if (monacoEditorRef.value) {
 const model = monacoEditorRef.value.getModel();
 if (model) {
 const fullRange = model.getFullModelRange();
 // Gunakan pushEditOperations agar riwayat Undo/Redo (Ctrl+Z) tetap tersimpan!
 monacoEditorRef.value.pushEditOperations(
 [],
 [{ range: fullRange, text: payload.text }],
 () => null
 );
 result = true;
 } else {
 error = 'Model not found';
 }
 } else {
 error = 'Monaco editor not ready';
 }
 break;
 case 'editor.insertCode':
 if (monacoEditorRef.value) {
 const position = monacoEditorRef.value.getPosition();
 if (position) {
 monacoEditorRef.value.executeEdits(undefined, [{
 range: new window.monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
 text: payload.text,
 forceMoveMarkers: true
 }]);
 result = true;
 } else {
 error = 'Could not get cursor position';
 }
 } else {
 error = 'Monaco editor not ready';
 }
 break;
 case 'app.notify':
 alert(`[Plugin Notification]\n${payload.message}`);
 result = true;
 break;
 case 'fs.uploadImageFile':
 if (window.electronAPI) {
 // Open native file picker
 const srcPath = await window.electronAPI.openImageFile();
 if (srcPath) {
 const fileName = srcPath.split(/[\\/]/).pop();
 const targetDir = await getImageUploadDir();
 const separator = targetDir.includes('\\') ? '\\' : '/';
 const destPath = `${targetDir}${separator}${fileName}`;
 const ok = await window.electronAPI.copyFile(srcPath, destPath);
 if (ok) {
 result = { srcPath, destPath, fileName };
 } else {
 error = 'Gagal menyalin file gambar';
 }
 } else {
 result = null; // User cancelled
 }
 } else {
 error = 'File System API not available';
 }
 break;
 case 'fs.saveImageBase64':
 if (window.electronAPI) {
 const { base64, fileName } = payload;
 const targetDir = await getImageUploadDir();
 const separator = targetDir.includes('\\') ? '\\' : '/';
 const destPath = `${targetDir}${separator}${fileName}`;
 const ok = await window.electronAPI.writeFileBase64(destPath, base64);
 if (ok) {
 result = { destPath, fileName };
 } else {
 error = 'Gagal menyimpan gambar dari clipboard';
 }
 } else {
 error = 'File System API not available';
 }
 break;
 case 'clipboard.readImage':
 if (window.electronAPI) {
 const imgData = await window.electronAPI.readClipboardImage();
 if (!imgData) {
 result = null;
 } else {
 const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 15);
 const fileName = `clipboard_${ts}.${imgData.ext || 'png'}`;
 const targetDir = await getImageUploadDir();
 const separator = targetDir.includes('\\') ? '\\' : '/';
 const destPath = `${targetDir}${separator}${fileName}`;
 const ok = await window.electronAPI.writeFileBase64(destPath, imgData.base64);
 if (ok) {
 result = { destPath, fileName, base64: imgData.base64 };
 } else {
 error = 'Gagal menyimpan gambar dari clipboard';
 }
 }
 } else {
 error = 'File System API not available';
 }
 break;
 case 'project.getPath':
 result = projectPath.value;
 break;
 case 'fs.readDirectory':
 if (window.electronAPI) {
 result = await window.electronAPI.readDirectory(payload.dirPath);
 } else {
 error = 'File System API not available';
 }
 break;
 case 'fs.readFile':
 if (window.electronAPI) {
 result = await window.electronAPI.readFile(payload.filePath);
 } else {
 error = 'File System API not available';
 }
 break;
 case 'git.run':
 if (window.electronAPI) {
 result = await window.electronAPI.gitRun(payload.cwd, payload.args);
 } else {
 error = 'Git API not available';
 }
 break;
 case 'terminal.connect':
 ensureGlobalListeners()
 if (window.electronAPI) {
 window.electronAPI.connectTerminal(payload.terminalId, projectPath.value, payload.cols, payload.rows);
 result = true;
 } else {
 error = 'Terminal API not available';
 }
 break;
 case 'terminal.keystroke':
 if (window.electronAPI && window.electronAPI.sendTerminalKeystroke) {
 window.electronAPI.sendTerminalKeystroke(payload.terminalId, payload.data);
 result = true;
 } else {
 error = 'Terminal API not available';
 }
 break;
 case 'terminal.resize':
 if (window.electronAPI) {
 window.electronAPI.resizeTerminal(payload.terminalId, payload.cols, payload.rows);
 result = true;
 } else {
 error = 'Terminal API not available';
 }
 break;
 case 'terminal.kill':
 if (window.electronAPI) {
 window.electronAPI.killTerminal(payload.terminalId);
 result = true;
 } else {
 error = 'Terminal API not available';
 }
 break;
 default:
 error = `Unknown action: ${action}`;
 }
 } catch (err: any) {
 error = err.message || 'Unknown error occurred';
 }

 // Send response back
 sourceWindow.postMessage({ source: 'makarya-ide', id, result, error }, '*');
}

const handleWindowMessage = (event: MessageEvent) => {
 const data = event.data
 if (data && data.source === 'makarya-plugin') {
 handlePluginRequest(data, event.source)
 }
}

onMounted(() => {
 ensureGlobalListeners()
 window.addEventListener('message', handleWindowMessage)

 window.addEventListener('keydown', handleGlobalKeyDown)
 window.addEventListener('keyup', handleGlobalKeyUp)

 if (window.electronAPI && window.electronAPI.onExternalFileChange) {
 window.electronAPI.onExternalFileChange((data: any) => {
 let relativePath = data.path
 const projPathNorm = projectPath.value.replace(/\\/g, '/')

 if (relativePath.startsWith(projPathNorm)) {
 relativePath = relativePath.substring(projPathNorm.length)
 if (relativePath.startsWith('/')) {
 relativePath = relativePath.substring(1)
 }
 }

 if (filesContent.value[relativePath] !== undefined) {
 if (data.content !== data.oldContent) {
 pendingApprovals.value = {
 ...pendingApprovals.value,
 [relativePath]: {
 original: data.oldContent || filesContent.value[relativePath],
 modified: data.content
 }
 }
 openFile(relativePath)
 }
 }
 })
 }
})

// --- User Terminal Logic ---

const ensureGlobalListeners = (() => {
 let listenersAttached = false
 return () => {
 if (listenersAttached || !window.electronAPI) return

 window.electronAPI.onTerminalData((id: string, data: string) => {
 if (id === CHAT_TERM_ID && chatAgentXterm) {
 chatAgentXterm.write(data)
 }

 // Broadcast to plugin iframes
 const iframes = document.querySelectorAll('iframe');
 iframes.forEach(iframe => {
 if (iframe.contentWindow) {
 iframe.contentWindow.postMessage({
 source: 'makarya-ide',
 action: 'terminal.data',
 terminalId: id,
 data: data
 }, '*');
 }
 });

 const t = userTerminals.value.find(t => t.id === id)
 if (t && t.xterm) t.xterm.write(data)
 })

 window.electronAPI.onTerminalExit((id: string, code: number) => {
 if (id === CHAT_TERM_ID && chatAgentXterm) {
 chatAgentXterm.write(`\r\n\x1b[90m[process exited with code ${code}]\x1b[0m\r\n`)
 }

 // Broadcast to plugin iframes
 const iframes = document.querySelectorAll('iframe');
 iframes.forEach(iframe => {
 if (iframe.contentWindow) {
 iframe.contentWindow.postMessage({
 source: 'makarya-ide',
 action: 'terminal.exit',
 terminalId: id,
 code: code
 }, '*');
 }
 });

 const t = userTerminals.value.find(t => t.id === id)
 if (t && t.xterm) t.xterm.write(`\r\n\x1b[90m[process exited with code ${code}]\x1b[0m\r\n`)
 })

 listenersAttached = true
 }
})()

const switchUserTerminal = (id: string) => {
 activeUserTerminalId.value = id
 nextTick(() => {
 const activeTerm = userTerminals.value.find(t => t.id === activeUserTerminalId.value)
 if (activeTerm) {
 if (activeTerm.fitAddon) {
 activeTerm.fitAddon.fit()
 if (window.electronAPI) {
 window.electronAPI.resizeTerminal(activeTerm.id, activeTerm.xterm!.cols, activeTerm.xterm!.rows)
 }
 }
 if (activeTerm.xterm) activeTerm.xterm.focus()
 }
 })
}

const createNewUserTerminal = () => {
 const id = `term-${Date.now()}`
 const termObj = {
 id,
 name: `Terminal ${userTerminals.value.length + 1}`,
 xterm: null as Terminal | null,
 fitAddon: null as FitAddon | null,
 resizeObserver: null as ResizeObserver | null
 }

 userTerminals.value.push(termObj)
 activeUserTerminalId.value = id
 ensureGlobalListeners()

 nextTick(() => {
 const el = terminalRefs.get(id)
 if (!el) return

 const xterm = new Terminal({
 theme: { background: '#000000', foreground: '#ffffff', cursor: '#ffffff' },
 fontFamily:"'JetBrains Mono', 'Courier New', monospace",
 fontSize: 13,
 cursorBlink: true
 })

 const fitAddon = new FitAddon()
 xterm.loadAddon(fitAddon)
 xterm.open(el)

 termObj.xterm = xterm
 termObj.fitAddon = fitAddon

 nextTick(() => {
 fitAddon.fit()
 if (window.electronAPI) {
 window.electronAPI.connectTerminal(id, projectPath.value)
 window.electronAPI.resizeTerminal(id, xterm.cols, xterm.rows)
 }
 })

 xterm.onData(data => {
 if (window.electronAPI && window.electronAPI.sendTerminalKeystroke) {
 window.electronAPI.sendTerminalKeystroke(id, data)
 }
 })

 termObj.resizeObserver = new ResizeObserver(() => {
 if (isUserTerminalVisible.value && activeUserTerminalId.value === id) {
 fitAddon.fit()
 if (window.electronAPI) {
 window.electronAPI.resizeTerminal(id, xterm.cols, xterm.rows)
 }
 }
 })
 termObj.resizeObserver.observe(el)

 setTimeout(() => {
 xterm.focus()
 }, 500)
 })
}

const killUserTerminal = (id: string) => {
 if (window.electronAPI) {
 window.electronAPI.killTerminal(id)
 }
 const idx = userTerminals.value.findIndex(t => t.id === id)
 if (idx > -1) {
 const t = userTerminals.value[idx]
 if (t.resizeObserver) t.resizeObserver.disconnect()
 if (t.xterm) t.xterm.dispose()
 userTerminals.value.splice(idx, 1)

 if (activeUserTerminalId.value === id) {
 if (userTerminals.value.length > 0) {
 switchUserTerminal(userTerminals.value[Math.max(0, idx - 1)].id)
 } else {
 activeUserTerminalId.value = null
 }
 }
 }
}

const runUserTerminal = () => {
 if (isUserTerminalVisible.value) {
 isUserTerminalVisible.value = false
 return
 }

 isUserTerminalVisible.value = true

 if (userTerminals.value.length === 0) {
 createNewUserTerminal()
 } else {
 nextTick(() => {
 const activeTerm = userTerminals.value.find(t => t.id === activeUserTerminalId.value)
 if (activeTerm) {
 if (activeTerm.fitAddon) activeTerm.fitAddon.fit()
 if (activeTerm.xterm) activeTerm.xterm.focus()
 }
 })
 }
}

// --- Chat Agent Logic ---
const runAgent = (agentName: 'chat') => {
 if (isChatSidebarVisible.value) {
 isChatSidebarVisible.value = false
 return
 }

 isChatSidebarVisible.value = true
 isPluginRightSidebarVisible.value = false // hide plugin sidebar
}

onUnmounted(() => {
 window.removeEventListener('keydown', handleGlobalKeyDown)
 window.removeEventListener('keyup', handleGlobalKeyUp)
 window.removeEventListener('message', handleWindowMessage)
 if (window.electronAPI) {
 userTerminals.value.forEach((t: any) => {
 if (window.electronAPI) window.electronAPI.killTerminal(t.id)
 })
 }
})
</script>

<style>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
 width: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
 background: white;
 border-left: 2px solid black;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
 background: black;
 border-left: 2px solid black;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
 background: #3b82f6;
}
</style>
