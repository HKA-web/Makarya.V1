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
      const labelObj = issue.labels[0]
      const label = (typeof labelObj === 'string' ? labelObj : (labelObj?.name || '')).toLowerCase()
      if (['laravel', 'vue', 'mcp', 'database', 'general', 'bug', 'enhancement', 'bugs'].includes(label)) {
        return (label === 'bug' || label === 'enhancement') ? 'bugs' : label
      }
      return label
    }
    const titleLower = (issue.title || '').toLowerCase()
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

  const getLikedMap = () => {
    try {
      return JSON.parse(localStorage.getItem('makarya_liked_issues') || '{}')
    } catch {
      return {}
    }
  }

  const formatIssue = (issue, idx = 0) => {
    const colors = ['bg-neo-green', 'bg-neo-pink', 'bg-neo-blue', 'bg-neo-yellow', 'bg-neo-purple']
    const likedMap = getLikedMap()
    const storedLike = likedMap[issue.id] || (issue.number ? likedMap[`issue_${issue.number}`] : null)
    const isLiked = !!storedLike
    const reactionId = typeof storedLike === 'number' ? storedLike : null

    // Reactions from GitHub (+1 and heart)
    const ghReactions = (issue.reactions?.['+1'] || 0) + (issue.reactions?.heart || 0)
    // If user upvoted locally but it hasn't reflected in ghReactions yet, ensure at least 1
    const totalLikes = isLiked && ghReactions === 0 ? 1 : ghReactions

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
      likes: totalLikes,
      isLiked: isLiked,
      reactionId: reactionId,
      githubUrl: issue.html_url,
      commentsCount: issue.comments || 0,
      replies: []
    }
  }

  const getAuthHeader = () => {
    if (!githubToken.value) return {}
    const t = githubToken.value.trim()
    const val = t.startsWith('Bearer ') || t.startsWith('token ') ? t : `Bearer ${t}`
    return { 'Authorization': val }
  }

  // Fetch live discussions from GitHub API (Handles Public & Private repos)
  const fetchGitHubDiscussions = async () => {
    isLoading.value = true
    error.value = null
    isPrivateRepo.value = false

    try {
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        ...getAuthHeader()
      }

      // Add cache buster and no-store so browser doesn't serve stale 60-second cache
      const cacheBustUrl = `${API_BASE}/issues?state=all&per_page=50&_t=${Date.now()}`
      let response = await fetch(cacheBustUrl, {
        headers,
        cache: 'no-store'
      })

      // If user supplied an invalid/expired token (401), alert and fallback to unauthenticated for public repo
      if (response.status === 401 && githubToken.value) {
        console.warn('GitHub PAT Token invalid or expired (401 Bad credentials). Retrying without token for public repo...')
        error.value = 'GitHub PAT Token tidak valid / expired (401 Bad credentials).'
        response = await fetch(cacheBustUrl, {
          headers: { 'Accept': 'application/vnd.github.v3+json' },
          cache: 'no-store'
        })
      }

      if (response.status === 404 || response.status === 401) {
        isPrivateRepo.value = true
        error.value = 'Private Repository: Token PAT GitHub yang valid dengan scope "repo" diperlukan.'
        throw new Error(error.value)
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const rawItems = await response.json()
      // Filter out pull requests if any (GitHub /issues endpoint returns PRs unless checked)
      const issues = rawItems.filter((i) => !i.pull_request)

      // Convert GitHub issues format to app discussion format
      const formatted = issues.map((issue, idx) => formatIssue(issue, idx))

      discussions.value = formatted
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
    if (!post.number) return post.replies || []

    isSyncing.value = true
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        ...getAuthHeader()
      }

      const cacheBustUrl = `${API_BASE}/issues/${post.number}/comments?_t=${Date.now()}`
      let res = await fetch(cacheBustUrl, {
        headers,
        cache: 'no-store'
      })
      if (res.status === 401 && githubToken.value) {
        res = await fetch(cacheBustUrl, {
          headers: { 'Accept': 'application/vnd.github.v3+json' },
          cache: 'no-store'
        })
      }
      if (res.ok) {
        const comments = await res.json()
        post.replies = comments.map(c => ({
          id: c.id,
          author: c.user?.login || 'anonymous',
          avatarUrl: c.user?.avatar_url,
          createdAt: formatTime(c.created_at),
          content: c.body || ''
        }))
        post.commentsCount = post.replies.length
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
            ...getAuthHeader()
          },
          body: JSON.stringify({
            title: title.trim(),
            body: content.trim(),
            labels: [formattedTag]
          })
        })

        if (response.ok) {
          const newIssue = await response.json()
          const newPost = formatIssue(newIssue, 0)

          // Reset active filter so the new post is not hidden by an active tag or search
          selectedTag.value = 'all'
          searchQuery.value = ''

          // Instantly insert at top of list so it immediately appears in the UI!
          discussions.value = [
            newPost,
            ...discussions.value.filter((p) => p.number !== newIssue.number && p.id !== newIssue.id)
          ]
          localStorage.setItem('makarya_discussions_cache', JSON.stringify(discussions.value))

          // Also trigger background sync with cache-busting after a short delay
          setTimeout(() => {
            fetchGitHubDiscussions()
          }, 1500)

          return { success: true, issue: newIssue, post: newPost, mode: 'github' }
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

    selectedTag.value = 'all'
    searchQuery.value = ''
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
            ...getAuthHeader()
          },
          body: JSON.stringify({ body: content.trim() })
        })

        if (res.ok) {
          const newComment = await res.json()
          const formattedReply = {
            id: newComment.id,
            author: newComment.user?.login || 'you',
            avatarUrl: newComment.user?.avatar_url,
            createdAt: 'Just now',
            content: newComment.body || content.trim()
          }

          post.replies = [...(post.replies || []), formattedReply]
          post.commentsCount = (post.commentsCount || 0) + 1
          localStorage.setItem('makarya_discussions_cache', JSON.stringify(discussions.value))

          setTimeout(() => {
            fetchReplies(post)
          }, 1500)

          return { success: true, mode: 'github', reply: formattedReply }
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
    post.commentsCount = (post.commentsCount || 0) + 1
    localStorage.setItem('makarya_discussions_cache', JSON.stringify(discussions.value))
    return { success: true, reply: newReply, mode: 'local' }
  }

  const toggleLike = async (postId) => {
    const post = discussions.value.find((p) => p.id === postId)
    if (!post) return

    // Optimistic UI toggle
    post.isLiked = !post.isLiked
    post.likes = Math.max(0, post.likes + (post.isLiked ? 1 : -1))

    // Save to localStorage so it stays liked across refresh
    const likedMap = getLikedMap()
    const key = post.number ? `issue_${post.number}` : post.id

    if (post.isLiked) {
      likedMap[key] = post.reactionId || true
      likedMap[post.id] = post.reactionId || true
    } else {
      delete likedMap[key]
      delete likedMap[post.id]
    }
    localStorage.setItem('makarya_liked_issues', JSON.stringify(likedMap))
    localStorage.setItem('makarya_discussions_cache', JSON.stringify(discussions.value))

    // If connected to GitHub with PAT and post is a GitHub issue
    if (githubToken.value && post.number) {
      try {
        if (post.isLiked) {
          // Send +1 reaction to GitHub
          const res = await fetch(`${API_BASE}/issues/${post.number}/reactions`, {
            method: 'POST',
            headers: {
              'Accept': 'application/vnd.github+json',
              'Content-Type': 'application/json',
              ...getAuthHeader()
            },
            body: JSON.stringify({ content: '+1' })
          })

          if (res.ok) {
            const reactionData = await res.json()
            post.reactionId = reactionData.id
            likedMap[key] = reactionData.id
            likedMap[post.id] = reactionData.id
            localStorage.setItem('makarya_liked_issues', JSON.stringify(likedMap))
          }
        } else {
          // Delete reaction on GitHub
          const reactionId = post.reactionId || (typeof likedMap[key] === 'number' ? likedMap[key] : null)
          if (reactionId) {
            await fetch(`${API_BASE}/issues/${post.number}/reactions/${reactionId}`, {
              method: 'DELETE',
              headers: {
                'Accept': 'application/vnd.github+json',
                ...getAuthHeader()
              }
            })
            post.reactionId = null
          }
        }
      } catch (e) {
        console.error('Failed to sync reaction with GitHub:', e)
      }
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
