<template>
 <div class="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
 <div class="w-full max-w-md bg-white border-4 border-black p-8 relative mt-10 mb-10 dark:bg-[#0a0a0a] dark:border-[#222]">
 <!-- Back Button -->
 <button @click="router.back()" class="absolute -top-4 -left-4 bg-black text-white dark:bg-white dark:text-black w-12 h-12 border-4 border-black flex items-center justify-center font-black text-xl hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0 active:translate-x-0 active:shadow-none z-10 dark:border-[#222]" title="Go back"> 
 <i class="pi pi-arrow-left"></i>
 </button>

 <!-- Settings Button -->
 <router-link to="/settings" class="absolute -top-4 -right-4 bg-neo-pink text-black dark:bg-white dark:text-black w-12 h-12 border-4 border-black flex items-center justify-center font-black text-xl hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0 active:translate-x-0 active:shadow-none z-10 dark:border-[#222]" title="Settings"> 
 <i class="pi pi-cog"></i>
 </router-link>

 <!-- Decorative Element -->
 <h1 class="text-4xl font-black uppercase mb-2 mt-2">Sign Up</h1>
 <p class="font-mono text-gray-700 font-bold mb-8 dark:text-gray-300">Create your ApiHub account.</p>

 <form @submit.prevent="handleSignup" class="space-y-5">
 <div>
 <label class="block font-black uppercase mb-2">Full Name</label>
 <input 
 type="text" 
 v-model="name"
 class="w-full border-4 border-black p-3 font-mono focus:outline-none  transition-colors dark:border-[#222]"
 placeholder="John Doe"
 required
 />
 </div>

 <div>
 <label class="block font-black uppercase mb-2">Email</label>
 <input 
 type="email" 
 v-model="email"
 class="w-full border-4 border-black p-3 font-mono focus:outline-none  transition-colors dark:border-[#222]"
 placeholder="dev@apihub.com"
 required
 />
 </div>

 <div>
 <label class="block font-black uppercase mb-2">Password</label>
 <input 
 type="password" 
 v-model="password"
 class="w-full border-4 border-black p-3 font-mono focus:outline-none  transition-colors dark:border-[#222]"
 placeholder="••••••••"
 required
 minlength="6"
 />
 </div>
 
 <div>
 <label class="block font-black uppercase mb-2">Confirm Password</label>
 <input 
 type="password" 
 v-model="confirmPassword"
 class="w-full border-4 border-black p-3 font-mono focus:outline-none  transition-colors dark:border-[#222]"
 placeholder="••••••••"
 required
 minlength="6"
 />
 </div>

 <button 
 type="submit" 
 :disabled="isLoading"
 class="w-full bg-black text-white dark:bg-white dark:text-black font-black text-xl uppercase py-4 border-4 border-black hover: hover:-translate-y-1 hover:-translate-x-1 transition-all active:translate-y-0 active:translate-x-0 active:shadow-none mt-4 disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#222]"
 >
 {{ isLoading ? 'Creating Account...' : 'Create Account' }} <i class="pi pi-check ml-2" v-if="!isLoading"></i>
 </button>
 </form>
 
 <div class="flex items-center my-6">
 <div class="flex-1 border-b-4 border-black dark:border-[#222]"></div>
 <span class="px-4 font-black font-mono">OR</span>
 <div class="flex-1 border-b-4 border-black dark:border-[#222]"></div>
 </div>

 <button 
 type="button" 
 @click="loginWithGoogle"
 class="w-full bg-white text-black font-black text-lg uppercase py-3 border-4 border-black hover: hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black ] hover:-translate-y-1 hover:-translate-x-1 transition-all active:translate-y-0 active:translate-x-0 active:shadow-none flex items-center justify-center gap-3 dark:bg-[#0a0a0a] dark:text-gray-100 dark:border-[#222]" 
 >
 <i class="pi pi-google text-xl"></i> Sign up with Google
 </button>

 <div class="mt-8 pt-6 border-t-4 border-black text-center font-mono font-bold dark:border-[#222]">
 Already have an account? <router-link to="/login" class="text-neo-blue hover:underline hover:text-neo-pink">Log In</router-link>
 </div>
 </div>
 </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

const loginWithGoogle = () => {
 toast.info('Google signup is not connected to backend yet.')
}

const handleSignup = async () => {
 if (password.value !== confirmPassword.value) {
 toast.error("Passwords don't match!")
 return
 }
 
 isLoading.value = true
 const res = await authStore.register(name.value, email.value, password.value)
 isLoading.value = false
 
 if (res.success) {
 toast.success('Registration successful! Welcome.')
 router.push('/dashboard')
 } else {
 toast.error(res.message)
 }
}
</script>
