<template>
 <div class="p-6 lg:p-10">
 <div class="mb-10 text-center">
 <h2 class="text-4xl md:text-5xl font-black uppercase mb-4 inline-block bg-neo-green dark:bg-white dark:text-black px-4 py-2 border-4 border-black transform -rotate-2 dark:border-[#222]">Dev Community</h2>
 <p class="font-mono font-bold mt-4 text-xl">Join 10,000+ developers sharing.</p>
 </div>

 <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <!-- Disucssion List -->
 <div class="lg:col-span-2 flex flex-col gap-6">
 <div v-for="i in 4" :key="i" class="bg-white border-4 border-black p-5 flex gap-4 dark:bg-[#0a0a0a] dark:border-[#222]">
 <div class="w-12 h-12 bg-neo-purple text-black dark:bg-white dark:text-black border-2 border-black rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xl dark:border-[#222]">U{{i}}</div>
 <div>
 <div class="flex gap-2 items-center mb-1">
 <span class="font-bold bg-neo-green text-black dark:bg-white dark:text-black px-2 py-0.5 text-xs">@dev_master</span>
 <span class="font-mono text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
 </div>
 <h4 class="font-black text-xl uppercase mb-2">How to handle Stripe webhooks safely?</h4>
 <p class="font-mono text-sm mb-4">I've been trying to implement Stripe webhooks but I'm getting signature verification errors in production...</p>
 <div class="flex gap-4">
 <button class="font-bold font-mono text-sm hover:text-neo-pink"><i class="pi pi-comment"></i> 12 Replies</button>
 <button class="font-bold font-mono text-sm hover:text-neo-green"><i class="pi pi-thumbs-up"></i> 45 Likes</button>
 </div>
 </div>
 </div>
 </div>

 <!-- Sidebar Community -->
 <div class="flex flex-col gap-6">
 <div class="bg-neo-blue text-black dark:bg-white dark:text-black border-4 border-black p-5 dark:border-[#222]">
 <h3 class="font-black text-2xl uppercase mb-4 border-b-4 border-black pb-2 dark:border-[#222]">Top Discussion</h3>
 <ul class="flex flex-col gap-3 font-mono font-bold">
 <li class="flex items-center justify-between"><span>1. @sarah_codes</span> <span class="bg-white border-2 border-black px-2 dark:bg-[#0a0a0a] dark:border-[#222]">1,240 user</span></li>
 <li class="flex items-center justify-between"><span>2. @api_ninja</span> <span class="bg-white border-2 border-black px-2 dark:bg-[#0a0a0a] dark:border-[#222]">980 user</span></li>
 <li class="flex items-center justify-between"><span>3. @johndoe</span> <span class="bg-white border-2 border-black px-2 dark:bg-[#0a0a0a] dark:border-[#222]">845 user</span></li>
 </ul>
 </div>
 <button class="w-full bg-black text-white dark:bg-white dark:text-black border-4 border-black font-black text-xl py-4 uppercase hover:-translate-y-1 hover: transition-all dark:border-[#222]">
 New Discussion
 </button>
 </div>
 </div>
 </div>
</template>

<script setup>
</script>
