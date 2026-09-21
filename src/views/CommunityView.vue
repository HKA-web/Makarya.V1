<template>
  <div class="p-4 lg:p-8 max-w-7xl mx-auto font-sans">
    <!-- Top Bar: Live GitHub Repository Sync Badge -->
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111] border-4 border-black dark:border-[#333] p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]">
      <div class="flex items-center gap-2 font-mono text-xs font-bold">
        <span class="inline-block w-3 h-3 rounded-full bg-neo-green animate-pulse"></span>
        <span class="dark:text-white uppercase font-black">GitHub Live Sync:</span>
        <a
          :href="`https://github.com/${communityStore.repoOwner}/${communityStore.repoName}/issues`"
          target="_blank"
          class="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 hover:bg-neo-yellow hover:text-black dark:hover:bg-gray-200 dark:hover:text-black font-black flex items-center gap-1 transition-all"
        >
          <i class="pi pi-github"></i>
          {{ communityStore.repoOwner }}/{{ communityStore.repoName }}
        </a>
      </div>

      <div class="flex items-center gap-2">
        <!-- GitHub Token Settings Button -->
        <button
          @click="router.push('/global-settings')"
          :class="[
            'font-mono font-bold text-xs px-3 py-1 border-2 flex items-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]',
            communityStore.githubToken
              ? 'bg-neo-green text-black font-black border-black dark:bg-[#1a1a1a] dark:text-white dark:border-[#444] dark:hover:bg-white dark:hover:text-black'
              : 'bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-gray-300 border-black dark:border-[#444] hover:bg-neo-yellow hover:text-black dark:hover:bg-white dark:hover:text-black'
          ]"
          title="Configure optional GitHub PAT in Settings"
        >
          <i class="pi pi-key"></i>
          <span>{{ communityStore.githubToken ? 'PAT Active' : 'Set PAT Token' }}</span>
        </button>

        <!-- Refresh Live Discussions -->
        <button
          @click="handleSyncLive"
          :disabled="communityStore.isLoading"
          class="font-mono font-bold text-xs px-3 py-1 bg-neo-blue text-black dark:bg-[#1a1a1a] dark:text-white border-2 border-black dark:border-[#444] hover:bg-neo-pink hover:text-black dark:hover:bg-white dark:hover:text-black flex items-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] disabled:opacity-50"
        >
          <i :class="['pi', 'pi-refresh', communityStore.isLoading ? 'animate-spin' : '']"></i>
          <span>{{ communityStore.isLoading ? 'Syncing...' : 'Sync Live' }}</span>
        </button>
      </div>
    </div>

    <!-- Error / Private Repo Warning Alert Banner -->
    <div
      v-if="communityStore.error || (communityStore.isPrivateRepo && !communityStore.githubToken)"
      class="mb-6 p-4 bg-neo-pink text-black dark:bg-[#1a1a1a] dark:text-white border-4 border-black dark:border-[#444] font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      <div>
        <h4 class="font-black text-sm uppercase flex items-center gap-2">
          <i class="pi pi-exclamation-triangle text-base"></i>
          GitHub Sync: {{ communityStore.repoOwner }}/{{ communityStore.repoName }}
        </h4>
        <p class="text-xs font-bold mt-1 text-black/80 dark:text-gray-300">
          {{ communityStore.error || 'GitHub API requires authentication for private repositories.' }}
        </p>
      </div>
      <button
        @click="router.push('/global-settings')"
        class="bg-black text-white dark:bg-white dark:text-black font-black text-xs px-4 py-2 uppercase border-2 border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-gray-200 transition-all flex-shrink-0 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      >
        Kelola Token PAT
      </button>
    </div>

    <!-- Header Title -->
    <div class="mb-8 text-center">
      <h2 class="text-3xl md:text-5xl font-black uppercase mb-3 inline-block bg-neo-green text-black dark:bg-[#1a1a1a] dark:text-white px-6 py-2 border-4 border-black dark:border-white/40 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transform -rotate-1">
        Dev Discussions & Q&A
      </h2>
      <p class="font-mono font-bold mt-2 text-base md:text-lg text-gray-700 dark:text-gray-300">
        Live community discussions powered by GitHub Issues & Discussions API.
      </p>
    </div>

    <!-- Main Content Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <!-- Left Column: Search, Tag Filters & Discussion List -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- Search & Filter Controls -->
        <div class="bg-white dark:bg-[#111] border-4 border-black dark:border-[#333] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] flex flex-col gap-3">
          <!-- Search Bar -->
          <div class="relative flex items-center">
            <i class="pi pi-search absolute left-3 text-gray-500 text-lg"></i>
            <input
              v-model="communityStore.searchQuery"
              type="text"
              placeholder="Search GitHub discussions, topics, or authors..."
              class="w-full pl-10 pr-4 py-2.5 font-mono font-bold text-sm bg-gray-50 dark:bg-[#1a1a1a] dark:text-white border-2 border-black dark:border-[#444] focus:outline-none focus:bg-white dark:focus:bg-[#222]"
            />
            <button
              v-if="communityStore.searchQuery"
              @click="communityStore.searchQuery = ''"
              class="absolute right-3 font-mono text-xs font-bold text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              CLEAR
            </button>
          </div>

          <!-- Tag Chips Filter -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-mono text-xs font-black uppercase text-gray-500 dark:text-gray-400 mr-1">Tags:</span>
            <button
              v-for="tag in communityStore.tags"
              :key="tag"
              @click="communityStore.selectedTag = tag"
              :class="[
                'px-3 py-1 font-mono text-xs font-black uppercase border-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]',
                communityStore.selectedTag === tag
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-white text-black dark:bg-[#1a1a1a] dark:text-gray-300 border-black dark:border-[#444] hover:bg-neo-yellow hover:text-black dark:hover:bg-white dark:hover:text-black'
              ]"
            >
              #{{ tag }}
            </button>
          </div>
        </div>

        <!-- Loading State Skeleton -->
        <div v-if="communityStore.isLoading && communityStore.discussions.length === 0" class="flex flex-col gap-4">
          <div v-for="i in 3" :key="i" class="bg-white dark:bg-[#111] border-4 border-black p-5 animate-pulse flex gap-4">
            <div class="w-12 h-12 bg-gray-300 dark:bg-[#333] rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-300 dark:bg-[#333] w-1/4"></div>
              <div class="h-6 bg-gray-300 dark:bg-[#333] w-3/4"></div>
              <div class="h-4 bg-gray-200 dark:bg-[#222] w-full"></div>
            </div>
          </div>
        </div>

        <!-- Discussion Posts List -->
        <div v-else-if="communityStore.filteredDiscussions.length > 0" class="flex flex-col gap-4">
          <div
            v-for="post in communityStore.filteredDiscussions"
            :key="post.id"
            class="bg-white dark:bg-[#111] border-4 border-black dark:border-[#333] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] flex flex-col md:flex-row gap-4 transition-all hover:-translate-y-0.5"
          >
            <!-- Author Avatar -->
            <div class="flex-shrink-0">
              <img
                v-if="post.avatarUrl"
                :src="post.avatarUrl"
                :alt="post.author"
                class="w-12 h-12 rounded-full border-2 border-black dark:border-white object-cover shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <div
                v-else
                :class="[
                  'w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center font-black text-lg text-black dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]',
                  post.avatarColor || 'bg-neo-green dark:bg-[#222]'
                ]"
              >
                {{ post.author.substring(0, 2).toUpperCase() }}
              </div>
            </div>

            <!-- Post Details -->
            <div class="flex-1 flex flex-col justify-between">
              <div>
                <!-- Metadata & Tag -->
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <a
                    :href="`https://github.com/${post.author}`"
                    target="_blank"
                    class="font-bold bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-xs font-mono hover:bg-neo-pink dark:hover:bg-gray-200 hover:text-black transition-colors"
                  >
                    @{{ post.author }}
                  </a>
                  <span class="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">
                    {{ post.createdAt }}
                  </span>
                  <span v-if="post.number" class="font-mono text-xs font-black text-gray-400 dark:text-gray-500">
                    #{{ post.number }}
                  </span>
                  <span class="font-mono text-xs font-black uppercase bg-neo-yellow text-black dark:bg-white dark:text-black border border-black dark:border-white px-2 py-0.5 ml-auto">
                    #{{ post.tag }}
                  </span>
                </div>

                <!-- Title -->
                <h3
                  @click="openDetailModal(post)"
                  class="font-black text-xl uppercase mb-2 cursor-pointer text-black dark:text-white hover:text-neo-pink dark:hover:text-gray-300 transition-colors leading-snug"
                >
                  {{ post.title }}
                </h3>

                <!-- Content snippet -->
                <p class="font-mono text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                  {{ post.content }}
                </p>
              </div>

              <!-- Action Bar: Like, Comments & GitHub Link -->
              <div class="flex flex-wrap items-center gap-3 pt-3 border-t-2 border-gray-200 dark:border-[#222]">
                <!-- Like Button -->
                <button
                  @click="communityStore.toggleLike(post.id)"
                  :class="[
                    'font-mono font-bold text-xs px-3 py-1.5 border-2 flex items-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]',
                    post.isLiked
                      ? 'bg-neo-pink text-black border-black dark:bg-white dark:text-black dark:border-white'
                      : 'bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-gray-200 border-black dark:border-[#444] hover:bg-neo-pink hover:text-black dark:hover:bg-white dark:hover:text-black'
                  ]"
                >
                  <i :class="['pi', post.isLiked ? 'pi-heart-fill text-red-600' : 'pi-heart']"></i>
                  <span>{{ post.likes }} Upvotes</span>
                </button>

                <!-- Replies Count Button -->
                <button
                  @click="openDetailModal(post)"
                  class="font-mono font-bold text-xs px-3 py-1.5 bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-gray-200 border-2 border-black dark:border-[#444] hover:bg-neo-blue hover:text-black dark:hover:bg-white dark:hover:text-black flex items-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]"
                >
                  <i class="pi pi-comments"></i>
                  <span>{{ post.commentsCount || post.replies?.length || 0 }} Replies</span>
                </button>

                <!-- View on GitHub External Link -->
                <a
                  v-if="post.githubUrl"
                  :href="post.githubUrl"
                  target="_blank"
                  class="font-mono font-bold text-xs px-3 py-1.5 bg-white dark:bg-[#1a1a1a] text-black dark:text-white border-2 border-black dark:border-[#444] hover:bg-neo-green hover:text-black dark:hover:bg-white dark:hover:text-black flex items-center gap-1.5 transition-all ml-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]"
                >
                  <i class="pi pi-external-link"></i>
                  <span>GitHub ↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Search Result State -->
        <div
          v-else
          class="bg-white dark:bg-[#111] border-4 border-black dark:border-[#333] p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <i class="pi pi-search-minus text-4xl text-gray-400 mb-3"></i>
          <h4 class="font-black text-xl uppercase mb-2">No discussions found</h4>
          <p class="font-mono text-sm text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search terms or selecting a different tag filter.
          </p>
          <button
            @click="openNewPostModal"
            class="bg-neo-green text-black dark:bg-white dark:text-black font-black font-mono text-sm border-2 border-black dark:border-white px-4 py-2 hover:bg-neo-yellow dark:hover:bg-gray-200 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            + ASK A QUESTION
          </button>
        </div>
      </div>

      <!-- Right Column Sidebar: Actions & Top Discussions -->
      <div class="flex flex-col gap-6">
        <!-- New Post CTA Box -->
        <div class="bg-neo-green dark:bg-[#141414] text-black dark:text-white border-4 border-black dark:border-[#333] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]">
          <h3 class="font-black text-xl uppercase mb-2">Ask on GitHub Community</h3>
          <p class="font-mono text-xs font-bold mb-4 text-black/80 dark:text-gray-300">
            Post your question here to publish directly on the <strong>{{ communityStore.repoOwner }}/{{ communityStore.repoName }}</strong> GitHub repository.
          </p>
          <button
            @click="openNewPostModal"
            class="w-full bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white font-black text-base py-3 uppercase hover:bg-neo-pink hover:text-black dark:hover:bg-gray-200 dark:hover:text-black hover:-translate-y-0.5 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <i class="pi pi-plus-circle text-lg"></i>
            <span>New Discussion</span>
          </button>
        </div>

        <!-- Top Discussions Ranking -->
        <div class="bg-white dark:bg-[#111] border-4 border-black dark:border-[#333] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]">
          <h3 class="font-black text-xl uppercase mb-4 border-b-4 border-black dark:border-[#333] pb-2 flex items-center gap-2">
            <i class="pi pi-bolt text-neo-pink dark:text-white"></i>
            Top Discussions
          </h3>
          <ul class="flex flex-col gap-3 font-mono">
            <li
              v-for="(topPost, index) in communityStore.topDiscussions"
              :key="topPost.id"
              @click="openDetailModal(topPost)"
              class="p-2.5 border-2 border-black dark:border-[#333] bg-gray-50 dark:bg-[#1a1a1a] text-black dark:text-gray-200 hover:bg-neo-yellow hover:text-black dark:hover:bg-[#252525] dark:hover:text-white cursor-pointer transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
            >
              <div class="flex items-center justify-between text-xs font-black mb-1">
                <span class="text-gray-500 dark:text-gray-400">#{{ index + 1 }} • @{{ topPost.author }}</span>
                <span class="bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5">
                  {{ topPost.likes }} likes
                </span>
              </div>
              <p class="font-bold text-xs uppercase line-clamp-2 leading-snug">
                {{ topPost.title }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- NEW DISCUSSION MODAL -->
    <div
      v-if="showNewPostModal"
      class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs"
    >
      <div class="bg-white dark:bg-[#111] border-4 border-black dark:border-white/40 w-full max-w-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] text-black dark:text-white">
        <div class="flex justify-between items-center border-b-4 border-black dark:border-[#333] pb-3 mb-4">
          <h3 class="font-black text-2xl uppercase flex items-center gap-2">
            <i class="pi pi-github text-neo-pink dark:text-white"></i>
            Create GitHub Discussion
          </h3>
          <button
            @click="showNewPostModal = false"
            class="font-black text-xl hover:text-red-500 cursor-pointer text-gray-500 hover:text-red-500 dark:text-gray-400"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="submitNewDiscussion" class="flex flex-col gap-4 font-mono">
          <!-- Author Handle -->
          <div>
            <label class="block text-xs font-black uppercase mb-1 text-black dark:text-gray-200">Your GitHub Handle / Name</label>
            <input
              v-model="newPostForm.author"
              type="text"
              placeholder="e.g. your_github_username"
              required
              class="w-full p-2.5 bg-gray-50 dark:bg-[#181818] dark:text-white border-2 border-black dark:border-[#444] text-sm font-bold focus:outline-none focus:bg-white dark:focus:bg-[#202020]"
            />
          </div>

          <!-- Tag / Category -->
          <div>
            <label class="block text-xs font-black uppercase mb-1 text-black dark:text-gray-200">Category Tag</label>
            <select
              v-model="newPostForm.tag"
              class="w-full p-2.5 bg-gray-50 dark:bg-[#181818] dark:text-white border-2 border-black dark:border-[#444] text-sm font-bold focus:outline-none focus:bg-white dark:focus:bg-[#202020] uppercase"
            >
              <option value="laravel">#laravel</option>
              <option value="vue">#vue</option>
              <option value="mcp">#mcp</option>
              <option value="database">#database</option>
              <option value="general">#general</option>
              <option value="bugs">#bugs</option>
            </select>
          </div>

          <!-- Title -->
          <div>
            <label class="block text-xs font-black uppercase mb-1 text-black dark:text-gray-200">Question Title</label>
            <input
              v-model="newPostForm.title"
              type="text"
              placeholder="e.g. How to handle authentication in Vue 3 with Laravel API?"
              required
              class="w-full p-2.5 bg-gray-50 dark:bg-[#181818] dark:text-white border-2 border-black dark:border-[#444] text-sm font-bold focus:outline-none focus:bg-white dark:focus:bg-[#202020]"
            />
          </div>

          <!-- Content -->
          <div>
            <label class="block text-xs font-black uppercase mb-1 text-black dark:text-gray-200">Problem Description / Details</label>
            <textarea
              v-model="newPostForm.content"
              rows="5"
              placeholder="Describe your question or code issue in detail..."
              required
              class="w-full p-2.5 bg-gray-50 dark:bg-[#181818] dark:text-white border-2 border-black dark:border-[#444] text-sm font-bold focus:outline-none focus:bg-white dark:focus:bg-[#202020]"
            ></textarea>
          </div>

          <!-- Info Box regarding PAT vs Browser -->
          <div class="p-3 bg-neo-yellow text-black dark:bg-[#1a1a1a] dark:text-gray-200 border-2 border-black dark:border-[#444] text-xs font-bold">
            <span v-if="communityStore.githubToken">
              ✓ <strong>PAT Token Active</strong>: Discussion will be submitted directly via GitHub REST API.
            </span>
            <span v-else>
              ℹ <strong>Direct Submission</strong>: Clicking submit will create post locally AND open GitHub pre-filled issue form for instant publishing.
            </span>
          </div>

          <!-- Submit Buttons -->
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="showNewPostModal = false"
              class="px-5 py-2.5 border-2 border-black dark:border-[#444] font-black text-sm uppercase bg-gray-200 dark:bg-[#222] dark:text-white hover:bg-gray-300 dark:hover:bg-[#333] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-2.5 border-2 border-black dark:border-white font-black text-sm uppercase bg-neo-green text-black dark:bg-white dark:text-black hover:bg-neo-yellow dark:hover:bg-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] cursor-pointer flex items-center gap-2"
            >
              <i class="pi pi-send"></i>
              <span>Submit Discussion</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DISCUSSION DETAIL & REPLIES MODAL -->
    <div
      v-if="selectedPost"
      class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs"
    >
      <div class="bg-white dark:bg-[#111] border-4 border-black dark:border-white w-full max-w-3xl max-h-[90vh] flex flex-col p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
        <!-- Modal Header -->
        <div class="flex justify-between items-start border-b-4 border-black dark:border-white pb-3 mb-4 flex-shrink-0">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono text-xs font-black bg-neo-yellow text-black dark:bg-white dark:text-black px-2 py-0.5 border border-black dark:border-white">
                #{{ selectedPost.tag }}
              </span>
              <span class="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">
                Posted by @{{ selectedPost.author }} • {{ selectedPost.createdAt }}
              </span>
            </div>
            <h3 class="font-black text-xl md:text-2xl uppercase leading-snug pr-4">
              {{ selectedPost.title }}
            </h3>
          </div>
          <button
            @click="selectedPost = null"
            class="font-black text-2xl hover:text-red-500 flex-shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Scrollable Modal Body -->
        <div class="overflow-y-auto flex-1 pr-2 flex flex-col gap-6 font-mono">
          <!-- Main Post Body -->
          <div class="bg-gray-50 dark:bg-[#1a1a1a] p-4 border-2 border-black dark:border-[#444]">
            <p class="text-sm font-medium whitespace-pre-line leading-relaxed dark:text-gray-200">
              {{ selectedPost.content }}
            </p>

            <div class="mt-4 pt-3 border-t border-gray-300 dark:border-[#333] flex justify-between items-center text-xs">
              <a
                v-if="selectedPost.githubUrl"
                :href="selectedPost.githubUrl"
                target="_blank"
                class="font-black underline text-neo-purple dark:text-white hover:text-neo-pink dark:hover:text-gray-300"
              >
                Open Issue on GitHub ↗
              </a>
              <span class="text-gray-400 font-bold">Issue #{{ selectedPost.number || 'Local' }}</span>
            </div>
          </div>

          <!-- Replies Section -->
          <div>
            <h4 class="font-black text-base uppercase mb-3 flex items-center justify-between border-b-2 border-black dark:border-[#444] pb-1">
              <span class="flex items-center gap-2">
                <span>Replies ({{ selectedPost.replies?.length || 0 }})</span>
                <i v-if="communityStore.isSyncing" class="pi pi-spin pi-spinner text-neo-pink dark:text-white text-sm"></i>
              </span>
              <button
                @click="communityStore.toggleLike(selectedPost.id)"
                class="text-xs font-bold hover:text-neo-pink dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <i :class="['pi', selectedPost.isLiked ? 'pi-heart-fill text-red-500' : 'pi-heart']"></i>
                {{ selectedPost.likes }} Upvotes
              </button>
            </h4>

            <!-- Replies List -->
            <div v-if="selectedPost.replies && selectedPost.replies.length > 0" class="flex flex-col gap-3">
              <div
                v-for="reply in selectedPost.replies"
                :key="reply.id"
                class="bg-white dark:bg-[#222] border-2 border-black dark:border-[#444] p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div class="flex items-center justify-between mb-1.5 text-xs">
                  <span class="font-bold bg-black text-white dark:bg-white dark:text-black px-2 py-0.5">
                    @{{ reply.author }}
                  </span>
                  <span class="text-gray-400 font-mono">{{ reply.createdAt }}</span>
                </div>
                <p class="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                  {{ reply.content }}
                </p>
              </div>
            </div>
            <div v-else-if="!communityStore.isSyncing" class="text-xs text-gray-400 italic py-2">
              No replies yet. Be the first to answer this question!
            </div>
          </div>
        </div>

        <!-- Add Reply Input Box -->
        <div class="pt-4 mt-2 border-t-4 border-black dark:border-white flex-shrink-0 font-mono">
          <form @submit.prevent="submitReply" class="flex gap-2">
            <input
              v-model="replyContent"
              type="text"
              placeholder="Write a reply comment..."
              required
              class="flex-1 p-2.5 bg-gray-50 dark:bg-[#222] dark:text-white border-2 border-black dark:border-[#444] text-xs font-bold focus:outline-none"
            />
            <button
              type="submit"
              class="px-5 py-2.5 bg-neo-green text-black dark:bg-white dark:text-black font-black text-xs uppercase border-2 border-black dark:border-white hover:bg-neo-yellow dark:hover:bg-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] cursor-pointer"
            >
              Reply
            </button>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCommunityStore } from '@/stores/communityStore'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const communityStore = useCommunityStore()
const toast = useToast()

const showNewPostModal = ref(false)
const selectedPost = ref(null)

const newPostForm = ref({
  author: 'dev_user',
  tag: 'laravel',
  title: '',
  content: ''
})

const replyContent = ref('')

const handleSyncLive = async () => {
  await communityStore.fetchGitHubDiscussions()
  if (communityStore.error) {
    toast.warning(communityStore.error, 'GitHub Sync')
  } else {
    toast.success(`Berhasil sinkron ${communityStore.discussions.length} issue dari GitHub!`, 'GitHub Sync')
  }
}

const openNewPostModal = () => {
  newPostForm.value.title = ''
  newPostForm.value.content = ''
  showNewPostModal.value = true
}

const submitNewDiscussion = async () => {
  if (!newPostForm.value.title || !newPostForm.value.content) return

  const result = await communityStore.addDiscussion({
    title: newPostForm.value.title,
    tag: newPostForm.value.tag,
    content: newPostForm.value.content,
    author: newPostForm.value.author || 'you'
  })

  showNewPostModal.value = false

  if (result.mode === 'github') {
    toast.success('Discussion published directly to GitHub!', 'GitHub Sync')
  } else {
    toast.success('Discussion saved locally!', 'Community')
    if (result.post?.githubUrl) {
      window.open(result.post.githubUrl, '_blank')
    }
  }
}

const openDetailModal = async (post) => {
  selectedPost.value = post
  await communityStore.fetchReplies(post)
}

const submitReply = async () => {
  if (!replyContent.value.trim() || !selectedPost.value) return

  const res = await communityStore.addReply(selectedPost.value, {
    content: replyContent.value,
    author: 'you'
  })

  replyContent.value = ''
  if (res?.mode === 'github') {
    toast.success('Comment posted to GitHub!', 'GitHub Sync')
  } else {
    toast.success('Reply submitted locally!', 'Community')
  }
}
</script>
