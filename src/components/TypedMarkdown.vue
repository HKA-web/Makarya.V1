<template>
  <div class="prose prose-sm max-w-none break-words text-sm relative typed-container" ref="container">
    <div v-html="htmlContent"></div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  isComplete: {
    type: Boolean,
    default: true
  }
})

const container = ref(null)

const htmlContent = computed(() => {
  return marked.parse(props.content || '')
})

// Auto-scroll while streaming
watch(() => props.content, async () => {
  if (!props.isComplete && container.value) {
    await nextTick()
    const scrollParent = container.value.closest('.overflow-y-auto')
    if (scrollParent) {
      scrollParent.scrollTop = scrollParent.scrollHeight
    }
  }
})
</script>

<style>
.streaming-cursor {
  display: inline-block;
  animation: blink 1s step-end infinite;
  margin-left: 2px;
  vertical-align: bottom;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
/* Ensure the cursor sits inline with the last paragraph */
.typed-container > div > p:last-child {
  display: inline;
}
</style>
