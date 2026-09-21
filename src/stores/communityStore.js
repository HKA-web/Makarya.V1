import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const GITHUB_REPO_OWNER = 'HKA-web'
const GITHUB_REPO_NAME = 'Makarya.Plugins'
const API_BASE = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`

const FALLBACK_DISCUSSIONS = [
  {
    id: 1,
    number: 1,
    author: 'HKA-web',
    avatarUrl: 'https://github.com/HKA-web.png',
    avatarColor: 'bg-neo-purple',
    title: 'Welcome to Makarya IDE Community Discussions!',
    content: 'Feel free to ask questions, report issues, and discuss features for Makarya Neobrutalist IDE here. Supports both Public & Private GitHub Repositories!',
    tag: 'general',
    createdAt: '2 hours ago',
    likes: 12,
    isLiked: false,
    githubUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
    replies: [
      {
        id: 101,
        author: 'dev_user',
        createdAt: '1 hour ago',
        content: 'Awesome! For private repositories, simply enter your GitHub PAT token with "repo" scope in Settings.'
      }
    ]
  }
]

export const useCommunityStore = defineStore('community', () => {
  const discussions = ref([])
  const isLoading = ref(false)
  const isSyncing = ref(false)
  const isPrivateRepo = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const selectedTag = ref('all')
  const githubToken = ref(localStorage.getItem('makarya_github_token') || '')

  const setGithubToken = (token) => {
    githubToken.value = token.trim()
    if (token.trim()) {
      localStorage.setItem('makarya_github_token', token.trim())
    } else {
      localStorage.removeItem('makarya_github_token')
    }
    // Re-fetch after token update
    fetchGitHubDiscussions()
  }

  // Helper to extract tag from GitHub issue labels or title
  const extractTag = (issue) => {
    if (issue.labels && issue.labels.length > 0) {
      const label = issue.labels[0].name.toLowerCase()
      if (['laravel', 'vue', 'mcp', 'database', 'general', 'bug', 'enhancement'].includes(label)) {
        return label === 'bug' ? 'bugs' : label
      }
    }
    const titleLower = issue.title.toLowerCase()
    if (titleLower.includes('laravel')) return 'laravel'
    if (titleLower.includes('vue')) return 'vue'
    if (titleLower.includes('mcp')) return 'mcp'
    if (titleLower.includes('database') || titleLower.includes('sql')) return 'database'
    return 'general'
  }

  // Format relative timestamp
  const formatTime = (isoString) => {
    if (!isoString) return 'recently'
    const date = new Date(isoString)
    const now = new Date()
    const diffSecs = Math.floor((now - date) / 1000)

    if (diffSecs < 60) return 'Just now'
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} mins ago`
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)} hours ago`
    return `${Math.floor(diffSecs / 86400)} days ago`
  }

  // Fetch live discussions from GitHub API (Handles Public & Private repos)
  const fetchGitHubDiscussions = async () => {
    isLoading.value = true
    error.value = null
    isPrivateRepo.value = false

    try {
      const headers = { 'Accept': 'application/vnd.github.v3+json' }
      if (githubToken.value) {
        headers['Authorization'] = `token ${githubToken.value}`
      }

      const response = await fetch(`${API_BASE}/issues?state=all&per_page=30`, { headers })

      if (response.status === 404 || response.status === 401) {
        // GitHub returns 404 or 401 for Private Repositories when unauthenticated
        isPrivateRepo.value = true
        if (!githubToken.value) {
          error.value = 'Private Repository detected: GitHub Personal Access Token (PAT) required.'
        } else {
          error.value = 'Invalid or expired GitHub Token for this private repository.'
        }
        throw new Error(error.value)
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const issues = await response.json()

      // Convert GitHub issues format to app discussion format
      const formatted = issues.map((issue, idx) => {
        const colors = ['bg-neo-green', 'bg-neo-pink', 'bg-neo-blue', 'bg-neo-yellow', 'bg-neo-purple']
        return {
          id: issue.id,
          number: issue.number,
          author: issue.user?.login || 'anonymous',
          avatarUrl: issue.user?.avatar_url || `https://github.com/${issue.user?.login || 'ghost'}.png`,
          avatarColor: colors[idx % colors.length],
          title: issue.title,
          content: issue.body || 'No description provided.',
          tag: extractTag(issue),
          createdAt: formatTime(issue.created_at),
          likes: (issue.reactions?.['+1'] || 0) + (issue.reactions?.heart || 0) + (issue.comments || 0),
          isLiked: false,
          githubUrl: issue.html_url,
          commentsCount: issue.comments || 0,
          replies: []
        }
      })

      discussions.value = formatted.length > 0 ? formatted : FALLBACK_DISCUSSIONS
      localStorage.setItem('makarya_discussions_cache', JSON.stringify(discussions.value))
    } catch (err) {
      console.warn('Could not fetch live GitHub discussions:', err)
      const cached = localStorage.getItem('makarya_discussions_cache')
      discussions.value = cached ? JSON.parse(cached) : FALLBACK_DISCUSSIONS
    } finally {
      isLoading.value = false
    }
  }

  // Fetch comments for a specific issue
  const fetchReplies = async (post) => {
    if (!post.number) return post.replies

    isSyncing.value = true
    try {
      const headers = { 'Accept': 'application/vnd.github.v3+json' }
      if (githubToken.value) {
        headers['Authorization'] = `token ${githubToken.value}`
      }

      const res = await fetch(`${API_BASE}/issues/${post.number}/comments`, { headers })
      if (res.ok) {
        const comments = await res.json()
        post.replies = comments.map(c => ({
          id: c.id,
          author: c.user?.login || 'anonymous',
          avatarUrl: c.user?.avatar_url,
          createdAt: formatTime(c.created_at),
          content: c.body || ''
        }))
      }
    } catch (err) {
      console.error('Failed to fetch replies from GitHub:', err)
    } finally {
      isSyncing.value = false
    }
    return post.replies
  }

  // Tags list
  const tags = computed(() => ['all', 'laravel', 'vue', 'mcp', 'database', 'general', 'bugs'])

  // Filtered discussions
  const filteredDiscussions = computed(() => {
    return discussions.value.filter((post) => {
      const matchesSearch =
        searchQuery.value.trim() === '' ||
        post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.value.toLowerCase())

      const matchesTag =
        selectedTag.value === 'all' ||
        post.tag.toLowerCase() === selectedTag.value.toLowerCase()

      return matchesSearch && matchesTag
    })
  })

  // Top Discussions ranking
  const topDiscussions = computed(() => {
    return [...discussions.value]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 4)
  })

  // Create new discussion
  const addDiscussion = async ({ title, tag, content, author = 'you' }) => {
    const formattedTag = tag || 'general'

    if (githubToken.value) {
      try {
        const response = await fetch(`${API_BASE}/issues`, {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'Authorization': `token ${githubToken.value}`
          },
          body: JSON.stringify({
            title: title.trim(),
            body: content.trim(),
            labels: [formattedTag]
          })
        })

        if (response.ok) {
          const newIssue = await response.json()
          await fetchGitHubDiscussions()
          return { success: true, issue: newIssue, mode: 'github' }
        }
      } catch (e) {
        console.error('Error creating issue on GitHub:', e)
      }
    }

    const colors = ['bg-neo-green', 'bg-neo-pink', 'bg-neo-blue', 'bg-neo-yellow', 'bg-neo-purple']
    const newPost = {
      id: Date.now(),
      number: null,
      author: author || 'you',
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      title: title.trim(),
      content: content.trim(),
      tag: formattedTag,
      createdAt: 'Just now',
      likes: 0,
      isLiked: false,
      githubUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(content)}`,
      replies: []
    }

    discussions.value.unshift(newPost)
    localStorage.setItem('makarya_discussions_cache', JSON.stringify(discussions.value))
    return { success: true, post: newPost, mode: 'local' }
  }

  // Submit reply comment
  const addReply = async (post, { content, author = 'you' }) => {
    if (!content.trim()) return

    if (githubToken.value && post.number) {
      try {
        const res = await fetch(`${API_BASE}/issues/${post.number}/comments`, {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'Authorization': `token ${githubToken.value}`
          },
          body: JSON.stringify({ body: content.trim() })
        })

        if (res.ok) {
          await fetchReplies(post)
          return { success: true, mode: 'github' }
        }
      } catch (e) {
        console.error('Error posting reply to GitHub:', e)
      }
    }

    const newReply = {
      id: Date.now(),
      author: author || 'you',
      createdAt: 'Just now',
      content: content.trim()
    }
    post.replies.push(newReply)
    localStorage.setItem('makarya_discussions_cache', JSON.stringify(discussions.value))
    return { success: true, reply: newReply, mode: 'local' }
  }

  const toggleLike = (postId) => {
    const post = discussions.value.find((p) => p.id === postId)
    if (post) {
      post.isLiked = !post.isLiked
      post.likes += post.isLiked ? 1 : -1
    }
  }

  // Initial fetch
  fetchGitHubDiscussions()

  return {
    discussions,
    isLoading,
    isSyncing,
    isPrivateRepo,
    error,
    searchQuery,
    selectedTag,
    tags,
    githubToken,
    filteredDiscussions,
    topDiscussions,
    setGithubToken,
    fetchGitHubDiscussions,
    fetchReplies,
    addDiscussion,
    addReply,
    toggleLike,
    repoOwner: GITHUB_REPO_OWNER,
    repoName: GITHUB_REPO_NAME
  }
})
