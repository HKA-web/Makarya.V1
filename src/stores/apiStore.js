import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useApiStore = defineStore('api', () => {
  // State
  const isLoading = ref(true)
  const searchQuery = ref('')
  const activeCategory = ref('all')
  const activePricing = ref('all')
  const isDialogVisible = ref(false)
  const selectedApi = ref(null)
  const initialTestUrl = ref('')
  const apisData = ref([])

  const categories = ref([
    { id: 'all', name: 'All Models & Agents' },
    { id: 'model', name: 'AI Models' },
    { id: 'agent', name: 'AI Agents' }
  ])

  const pricingOptions = ref([
    { id: 'all', name: 'All Pricing' },
    { id: 'Free', name: 'Free Only' },
    { id: 'Freemium', name: 'Freemium' },
    { id: 'Paid', name: 'Paid Only' }
  ])

  // Getters
  const filteredApis = computed(() => {
    let result = apisData.value

    if (activeCategory.value !== 'all') {
      result = result.filter(api => api.category === activeCategory.value)
    }

    if (activePricing.value !== 'all') {
      result = result.filter(api => api.pricing === activePricing.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(api => 
        api.name.toLowerCase().includes(query) || 
        api.description.toLowerCase().includes(query) ||
        api.provider.toLowerCase().includes(query)
      )
    }
    return result
  })

  const activeCategoryName = computed(() => {
    const cat = categories.value.find(c => c.id === activeCategory.value)
    return cat ? cat.name : 'All Models & Agents'
  })

  // Actions
  const fetchApis = () => {
    isLoading.value = true
    setTimeout(() => {
      apisData.value = [
        { id: 1, name: 'GPT-4o', provider: 'OpenAI', category: 'model', pricing: 'Paid', description: 'Model LLM paling canggih dari OpenAI, unggul dalam penalaran kompleks, coding, dan multimodal (teks, gambar, suara).', icon: '🧠', bgColor: 'bg-emerald-200', rating: 4.9 },
        { id: 2, name: 'Claude 3.5 Sonnet', provider: 'Anthropic', category: 'model', pricing: 'Freemium', description: 'Model tercepat dan paling cerdas dari Anthropic. Sangat baik untuk coding dan nuansa bahasa manusia yang alami.', icon: '🤖', bgColor: 'bg-orange-200', rating: 4.9 },
        { id: 3, name: 'Midjourney V6', provider: 'Midjourney', category: 'model', pricing: 'Paid', description: 'AI text-to-image dengan kualitas fotorealistik dan gaya artistik yang luar biasa mengesankan.', icon: '🎨', bgColor: 'bg-indigo-200', rating: 4.8 },
        { id: 4, name: 'AutoGPT', provider: 'Open Source', category: 'agent', pricing: 'Free', description: 'Agent AI otonom eksperimental yang dapat menyelesaikan tugas kompleks secara mandiri menggunakan GPT-4.', icon: '⚙️', bgColor: 'bg-slate-200', rating: 4.5 },
        { id: 5, name: 'Gemini 1.5 Pro', provider: 'Google', category: 'model', pricing: 'Freemium', description: 'Model tangguh dari Google dengan context window hingga 2 juta token, sangat cocok untuk analisis dokumen panjang.', icon: '✨', bgColor: 'bg-blue-200', rating: 4.7 },
        { id: 6, name: 'BabyAGI', provider: 'Open Source', category: 'agent', pricing: 'Free', description: 'Framework agent otonom yang digerakkan oleh task management dan LLM, fokus pada penyelesaian tujuan terstruktur.', icon: '👶', bgColor: 'bg-pink-200', rating: 4.4 },
        { id: 7, name: 'ElevenLabs', provider: 'ElevenLabs', category: 'model', pricing: 'Freemium', description: 'Sintesis suara AI paling realistis dan tool text-to-speech canggih untuk berbagai bahasa.', icon: '🎙️', bgColor: 'bg-yellow-200', rating: 4.8 },
        { id: 8, name: 'Llama 3', provider: 'Meta', category: 'model', pricing: 'Free', description: 'Model open-source State-of-the-Art dari Meta, tersedia dalam berbagai ukuran parameter.', icon: '🦙', bgColor: 'bg-cyan-200', rating: 4.7 },
        { id: 9, name: 'Devin', provider: 'Cognition', category: 'agent', pricing: 'Paid', description: 'Software Engineer AI otonom pertama di dunia, mampu merencanakan, menulis kode, dan men-deploy aplikasi secara end-to-end.', icon: '💻', bgColor: 'bg-red-200', rating: 4.6 },
      ]
      isLoading.value = false
    }, 1000)
  }

  const openApiDetails = (api) => {
    selectedApi.value = api
    isDialogVisible.value = true
  }

  const closeApiDetails = () => {
    isDialogVisible.value = false
  }

  const resetFilters = () => {
    activeCategory.value = 'all'
    activePricing.value = 'all'
    searchQuery.value = ''
  }

  return {
    isLoading,
    searchQuery,
    activeCategory,
    activePricing,
    isDialogVisible,
    selectedApi,
    initialTestUrl,
    apisData,
    categories,
    pricingOptions,
    filteredApis,
    activeCategoryName,
    fetchApis,
    openApiDetails,
    closeApiDetails,
    resetFilters
  }
})
