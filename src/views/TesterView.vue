<template>
 <div class="p-6 lg:p-10 h-full flex flex-col">
 <div class="mb-6 flex justify-between items-end">
 <div>
 <h2 class="text-4xl md:text-5xl font-black uppercase mb-2">API Tester</h2>
 <p class="font-mono font-bold text-gray-600 border-l-4 border-neo-purple pl-4 dark:text-gray-400">Test endpoints directly from the browser.</p>
 </div>
 </div>

 <div class="bg-white border-4 border-black flex-1 flex flex-col lg:flex-row overflow-hidden dark:bg-[#0a0a0a] dark:border-[#222]">
 <!-- Request Config -->
 <div class="w-full lg:w-1/2 border-b-4 lg:border-b-0 lg:border-r-4 border-black flex flex-col bg-gray-50 dark:border-[#222] dark:bg-[#111]">
 
 <!-- URL Bar -->
 <div class="p-6 border-b-4 border-black dark:border-[#222]">
 <label class="block font-black uppercase mb-2">Endpoint URL</label>
 <div class="flex">
 <select v-model="testMethod" class="bg-neo-pink text-black dark:bg-white dark:text-black font-bold font-mono border-4 border-black px-4 py-3 outline-none focus:bg-gray-800 focus:text-white dark:focus:bg-gray-800 dark:focus:text-white dark:border-[#222]">
 <option>GET</option>
 <option>POST</option>
 <option>PUT</option>
 <option>PATCH</option>
 <option>DELETE</option>
 </select>
 <input type="text" v-model="testUrl" placeholder="https://api.example.com/data" class="flex-1 w-0 border-4 border-l-0 border-black px-4 py-3 font-mono font-bold outline-none  dark:border-[#222]">
 </div>
 </div>
 
 <!-- Tabs -->
 <div class="flex px-6 pt-6 border-b-4 border-black bg-gray-50 dark:border-[#222] dark:bg-[#111]">
 <button @click="activeTestTab = 'params'" :class="activeTestTab === 'params' ? 'bg-black text-white dark:bg-white dark:text-black border-b-0 border-x-4 border-t-4' : 'bg-white dark:bg-[#111] dark:text-gray-100 border-b-4 border-t-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black ]'" class="flex-1 font-black uppercase py-3 border-black transition-colors dark:border-[#222]">Params</button> 
 <button @click="activeTestTab = 'authorization'" :class="activeTestTab === 'authorization' ? 'bg-black text-white dark:bg-white dark:text-black border-b-0 border-r-4 border-t-4' : 'bg-white dark:bg-[#111] dark:text-gray-100 border-b-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black ]'" class="flex-1 font-black uppercase py-3 border-black transition-colors dark:border-[#222]">Auth</button> 
 <button @click="activeTestTab = 'headers'" :class="activeTestTab === 'headers' ? 'bg-black text-white dark:bg-white dark:text-black border-b-0 border-r-4 border-t-4' : 'bg-white dark:bg-[#111] dark:text-gray-100 border-b-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black ]'" class="flex-1 font-black uppercase py-3 border-black transition-colors dark:border-[#222]">Headers</button> 
 <button @click="activeTestTab = 'body'" :class="activeTestTab === 'body' ? 'bg-black text-white dark:bg-white dark:text-black border-b-0 border-r-4 border-t-4' : 'bg-white dark:bg-[#111] dark:text-gray-100 border-b-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black ]'" class="flex-1 font-black uppercase py-3 border-black transition-colors dark:border-[#222]">Body</button> 
 </div>

 <!-- Tab Content -->
 <div class="flex-1 overflow-y-auto p-6 bg-white min-h-[200px] dark:bg-[#0a0a0a]">
 
 <!-- Params Tab -->
 <div v-show="activeTestTab === 'params'" class="flex flex-col gap-3">
 <div class="flex gap-2" v-for="(param, index) in testParams" :key="'param-'+index">
 <input type="text" v-model="param.key" placeholder="Key" class="flex-1 w-0 border-4 border-black px-3 py-2 font-mono text-sm outline-none  dark:border-[#222]">
 <input type="text" v-model="param.value" placeholder="Value" class="flex-1 w-0 border-4 border-black px-3 py-2 font-mono text-sm outline-none  dark:border-[#222]">
 <button @click="removeTestParam(index)" class="border-4 border-black px-3 py-2 font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors dark:border-[#222]"><i class="pi pi-trash"></i></button> 
 </div>
 <button @click="addTestParam" class="self-start border-4 border-black px-4 py-2 font-black text-sm uppercase bg-black text-white dark:bg-white dark:text-black hover:translate-x-[2px] hover:translate-y-[2px] transition-all dark:border-[#222]">+ Add Param</button>
 </div>

 <!-- Authorization Tab -->
 <div v-show="activeTestTab === 'authorization'" class="flex flex-col gap-4">
 <div>
 <label class="block font-black uppercase mb-2">Type</label>
 <select v-model="authType" class="w-full border-4 border-black px-3 py-2 font-mono text-sm outline-none  bg-white dark:border-[#222] dark:bg-[#0a0a0a]">
 <option value="none">No Auth</option>
 <option value="bearer">Bearer Token</option>
 <option value="basic">Basic Auth</option>
 <option value="apikey">API Key</option>
 </select>
 </div>

 <!-- Bearer Token -->
 <div v-if="authType === 'bearer'" class="flex flex-col gap-2">
 <label class="font-black uppercase text-sm">Token</label>
 <input type="text" v-model="authBearerToken" placeholder="Paste your token here" class="w-full border-4 border-black px-3 py-2 font-mono text-sm outline-none  dark:border-[#222]">
 <p class="font-mono text-xs text-gray-500 dark:text-gray-400">Will be sent as: <span class="font-bold">Authorization: Bearer &lt;token&gt;</span></p>
 </div>

 <!-- Basic Auth -->
 <div v-if="authType === 'basic'" class="flex flex-col gap-3">
 <div>
 <label class="block font-black uppercase text-sm mb-1">Username</label>
 <input type="text" v-model="authBasicUser" placeholder="username" class="w-full border-4 border-black px-3 py-2 font-mono text-sm outline-none  dark:border-[#222]">
 </div>
 <div>
 <label class="block font-black uppercase text-sm mb-1">Password</label>
 <input type="password" v-model="authBasicPass" placeholder="password" class="w-full border-4 border-black px-3 py-2 font-mono text-sm outline-none  dark:border-[#222]">
 </div>
 <p class="font-mono text-xs text-gray-500 dark:text-gray-400">Sent as: <span class="font-bold">Authorization: Basic base64(user:pass)</span></p>
 </div>

 <!-- API Key -->
 <div v-if="authType === 'apikey'" class="flex flex-col gap-3">
 <div>
 <label class="block font-black uppercase text-sm mb-1">Key</label>
 <input type="text" v-model="authApiKey" placeholder="X-API-Key" class="w-full border-4 border-black px-3 py-2 font-mono text-sm outline-none  dark:border-[#222]">
 </div>
 <div>
 <label class="block font-black uppercase text-sm mb-1">Value</label>
 <input type="text" v-model="authApiValue" placeholder="your-api-key-value" class="w-full border-4 border-black px-3 py-2 font-mono text-sm outline-none  dark:border-[#222]">
 </div>
 <div>
 <label class="block font-black uppercase text-sm mb-1">Add to</label>
 <select v-model="authApiAddTo" class="w-full border-4 border-black px-3 py-2 font-mono text-sm outline-none  bg-white dark:border-[#222] dark:bg-[#0a0a0a]">
 <option value="header">Header</option>
 <option value="query">Query Params</option>
 </select>
 </div>
 </div>

 <label class="flex items-center gap-2 font-mono font-bold text-sm cursor-pointer mt-2">
 <input type="checkbox" v-model="authUseSessionToken" class="w-4 h-4 border-2 border-black accent-neo-purple dark:border-[#222]">
 Use logged-in session token (overrides above)
 </label>
 </div>

 <!-- Headers Tab -->
 <div v-show="activeTestTab === 'headers'" class="flex flex-col gap-3">
 <div class="flex gap-2" v-for="(header, index) in testHeaders" :key="'header-'+index">
 <input type="text" v-model="header.key" placeholder="Key" class="flex-1 w-0 border-4 border-black px-3 py-2 font-mono text-sm outline-none  dark:border-[#222]">
 <input type="text" v-model="header.value" placeholder="Value" class="flex-1 w-0 border-4 border-black px-3 py-2 font-mono text-sm outline-none  dark:border-[#222]">
 <button @click="removeTestHeader(index)" class="border-4 border-black px-3 py-2 font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors dark:border-[#222]"><i class="pi pi-trash"></i></button> 
 </div>
 <button @click="addTestHeader" class="self-start border-4 border-black px-4 py-2 font-black text-sm uppercase bg-black text-white dark:bg-white dark:text-black hover:translate-x-[2px] hover:translate-y-[2px] transition-all dark:border-[#222]">+ Add Header</button>
 </div>

 <!-- Body Tab -->
 <div v-show="activeTestTab === 'body'" class="flex flex-col h-full">
 <div class="flex items-center gap-4 mb-3 font-mono font-bold text-sm">
 <label class="flex items-center gap-2 cursor-pointer"><input type="radio" v-model="bodyType" value="raw" class="accent-black"> raw</label>
 <label class="flex items-center gap-2 cursor-pointer"><input type="radio" v-model="bodyType" value="form-data" class="accent-black"> form-data</label>
 </div>
 
 <textarea v-show="bodyType === 'raw'" v-model="testBody" class="w-full min-h-[250px] flex-1 border-4 border-black p-4 font-mono text-sm resize-none outline-none  dark:border-[#222]" placeholder='{
"key":"value"
}'></textarea>

 <div v-show="bodyType === 'form-data'" class="flex flex-col gap-3">
 <div class="flex gap-2" v-for="(form, index) in testFormData" :key="'form-'+index">
 <input type="text" v-model="form.key" placeholder="Key" class="flex-1 w-0 border-4 border-black px-3 py-2 font-mono text-sm outline-none  dark:border-[#222]">
 <input type="text" v-model="form.value" placeholder="Value" class="flex-1 w-0 border-4 border-black px-3 py-2 font-mono text-sm outline-none  dark:border-[#222]">
 <button @click="removeTestFormData(index)" class="border-4 border-black px-3 py-2 font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors dark:border-[#222]"><i class="pi pi-trash"></i></button> 
 </div>
 <button @click="addTestFormData" class="self-start border-4 border-black px-4 py-2 font-black text-sm uppercase bg-black text-white dark:bg-white dark:text-black hover:translate-x-[2px] hover:translate-y-[2px] transition-all dark:border-[#222]">+ Add Form Data</button>
 </div>
 </div>
 
 </div>

 <!-- Send Button -->
 <div class="p-6 border-t-4 border-black bg-gray-50 dark:border-[#222] dark:bg-[#111]">
 <button @click="runTest" :disabled="isTesting" class="w-full bg-black text-white dark:bg-white dark:text-black border-4 border-black font-black text-xl py-4 uppercase hover:-translate-y-1 hover: transition-all disabled:opacity-50 disabled:transform-none dark:border-[#222]">
 <i class="pi pi-play mr-2" v-if="!isTesting"></i>
 <i class="pi pi-spinner pi-spin mr-2" v-if="isTesting"></i>
 {{ isTesting ? 'Sending...' : 'Send Request' }}
 </button>
 </div>
 </div>

 <!-- Response Viewer -->
 <div class="w-full lg:w-1/2 p-0 flex flex-col bg-black text-neo-green">
 <div class="border-b-4 border-black bg-gray-900 dark:bg-[#111] px-4 py-2 flex justify-between items-center gap-2 flex-wrap dark:border-[#222]">
 <div class="flex items-center gap-2">
 <span class="font-bold font-mono text-white">Response</span>
 <button @click="responseView = 'body'" :class="responseView === 'body' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-700 text-white'" class="font-bold font-mono px-2 py-0.5 text-xs border-2 border-black dark:border-[#222]">Body</button>
 <button @click="responseView = 'curl'" :class="responseView === 'curl' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-700 text-white'" class="font-bold font-mono px-2 py-0.5 text-xs border-2 border-black dark:border-[#222]">cURL</button>
 </div>
 <div class="flex items-center gap-2">
 <span v-if="responseStatus" class="font-bold font-mono px-2 py-0.5 text-xs" :class="responseStatus >= 200 && responseStatus < 300 ? 'bg-neo-yellow text-black dark:bg-white dark:text-black' : 'bg-neo-purple text-black dark:bg-white dark:text-black'">{{ responseStatus }} {{ responseStatusText }}</span>
 <span v-if="responseTime" class="font-bold font-mono bg-gray-700 text-white px-2 py-0.5 text-xs">{{ responseTime }} ms</span>
 <span v-if="responseSize" class="font-bold font-mono bg-gray-700 text-white px-2 py-0.5 text-xs">{{ responseSize }}</span>
 </div>
 </div>
 <div v-show="responseView === 'body'" class="p-6 font-mono text-sm overflow-y-auto flex-1 whitespace-pre-wrap relative min-h-[300px] max-h-[calc(100vh-250px)]">
 <button @click="copyResponse" class="absolute top-2 right-2 bg-black text-white dark:bg-white dark:text-black border-2 border-black px-2 py-1 text-xs font-black uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors dark:border-[#222]">Copy</button> 
 <span v-if="!testResponse">// Enter URL and click Send Request to see the response here.</span>
 <span v-else>{{ testResponse }}</span>
 </div>
 <div v-show="responseView === 'curl'" class="p-6 font-mono text-sm overflow-y-auto flex-1 whitespace-pre-wrap relative min-h-[300px] max-h-[calc(100vh-250px)]">
 <button @click="copyCurl" class="absolute top-2 right-2 bg-black text-white dark:bg-white dark:text-black border-2 border-black px-2 py-1 text-xs font-black uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors dark:border-[#222]">Copy</button> 
 <span v-if="!curlCommand">// cURL command will appear here after sending a request.</span>
 <span v-else>{{ curlCommand }}</span>
 </div>
 </div>
 </div>
 </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from '@/composables/useToast';
import { useApiStore } from '@/stores/apiStore';

const toast = useToast();
const store = useApiStore();

const TESTER_STORAGE_KEY = 'api_tester_state'

const testMethod = ref('GET');
const testUrl = ref(store.initialTestUrl);
const testResponse = ref('');
const isTesting = ref(false);

// Response meta
const responseStatus = ref(null);
const responseStatusText = ref('');
const responseTime = ref(null);
const responseSize = ref('');
const responseView = ref('body');
const curlCommand = ref('');

const activeTestTab = ref('params');
const testParams = ref([{ key: '', value: '' }]);
const testHeaders = ref([{ key: '', value: '' }]);
const bodyType = ref('raw');
const testBody = ref('');
const testFormData = ref([{ key: '', value: '' }]);

// Authorization (default, persisted, cannot be deleted)
const authType = ref('none'); // none | bearer | basic | apikey
const authBearerToken = ref('');
const authBasicUser = ref('');
const authBasicPass = ref('');
const authApiKey = ref('');
const authApiValue = ref('');
const authApiAddTo = ref('header'); // header | query
const authUseSessionToken = ref(false);

let isUpdatingFromUrl = false;
let isUpdatingFromParams = false;

watch(testUrl, (newUrl) => {
 if (isUpdatingFromParams) return;
 isUpdatingFromUrl = true;
 
 const parts = (newUrl || '').split('?');
 if (parts.length > 1) {
 const paramsString = parts.slice(1).join('?');
 const searchParams = new URLSearchParams(paramsString);
 const newParams = [];
 for (const [key, value] of searchParams.entries()) {
 newParams.push({ key, value });
 }
 if (newParams.length === 0) newParams.push({ key: '', value: '' });
 testParams.value = newParams;
 } else {
 if (testParams.value.length !== 1 || testParams.value[0].key !== '') {
 testParams.value = [{ key: '', value: '' }];
 }
 }
 
 isUpdatingFromUrl = false;
}, { immediate: true });

watch(testParams, (newParams) => {
 if (isUpdatingFromUrl) return;
 isUpdatingFromParams = true;
 
 const parts = (testUrl.value || '').split('?');
 const base = parts[0];
 const validParams = newParams.filter(p => p.key && p.key.trim());
 
 if (validParams.length) {
 const query = validParams.map(p => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value)}`).join('&');
 testUrl.value = `${base}?${query}`;
 } else {
 testUrl.value = base;
 }
 
 isUpdatingFromParams = false;
}, { deep: true });

const addTestParam = () => testParams.value.push({ key: '', value: '' });
const removeTestParam = (index) => testParams.value.splice(index, 1);

const addTestFormData = () => testFormData.value.push({ key: '', value: '' });
const removeTestFormData = (index) => testFormData.value.splice(index, 1);
const addTestHeader = () => testHeaders.value.push({ key: '', value: '' });
const removeTestHeader = (index) => testHeaders.value.splice(index, 1);

// Persist tester state (auth is default & cannot be removed)
const persistState = () => {
 try {
 localStorage.setItem(TESTER_STORAGE_KEY, JSON.stringify({
 testMethod: testMethod.value,
 testUrl: testUrl.value,
 activeTestTab: activeTestTab.value,
 testParams: testParams.value,
 testHeaders: testHeaders.value,
 bodyType: bodyType.value,
 testBody: testBody.value,
 testFormData: testFormData.value,
 authType: authType.value,
 authBearerToken: authBearerToken.value,
 authBasicUser: authBasicUser.value,
 authBasicPass: authBasicPass.value,
 authApiKey: authApiKey.value,
 authApiValue: authApiValue.value,
 authApiAddTo: authApiAddTo.value,
 authUseSessionToken: authUseSessionToken.value
 }));
 } catch (e) {
 console.error('Failed to persist tester state:', e);
 }
};

const loadState = () => {
 try {
 const stored = localStorage.getItem(TESTER_STORAGE_KEY);
 if (!stored) return;
 const s = JSON.parse(stored);
 if (s.testMethod) testMethod.value = s.testMethod;
 if (s.testUrl) testUrl.value = s.testUrl;
 if (s.activeTestTab) activeTestTab.value = s.activeTestTab;
 if (Array.isArray(s.testParams) && s.testParams.length) testParams.value = s.testParams;
 if (Array.isArray(s.testHeaders) && s.testHeaders.length) testHeaders.value = s.testHeaders;
 if (s.bodyType) bodyType.value = s.bodyType;
 if (s.testBody) testBody.value = s.testBody;
 if (Array.isArray(s.testFormData) && s.testFormData.length) testFormData.value = s.testFormData;
 if (s.authType) authType.value = s.authType;
 if (s.authBearerToken) authBearerToken.value = s.authBearerToken;
 if (s.authBasicUser) authBasicUser.value = s.authBasicUser;
 if (s.authBasicPass) authBasicPass.value = s.authBasicPass;
 if (s.authApiKey) authApiKey.value = s.authApiKey;
 if (s.authApiValue) authApiValue.value = s.authApiValue;
 if (s.authApiAddTo) authApiAddTo.value = s.authApiAddTo;
 if (typeof s.authUseSessionToken === 'boolean') authUseSessionToken.value = s.authUseSessionToken;
 } catch (e) {
 console.error('Failed to load tester state:', e);
 }
};

onMounted(() => {
 loadState();
});

// Auto-persist on changes
watch([
 testMethod, testUrl, activeTestTab, testParams, testHeaders, bodyType, testBody, testFormData,
 authType, authBearerToken, authBasicUser, authBasicPass, authApiKey, authApiValue, authApiAddTo, authUseSessionToken
], persistState, { deep: true });

watch(() => store.initialTestUrl, (newUrl) => {
 if (newUrl) {
 testUrl.value = newUrl;
 testMethod.value = 'GET';
 }
});

const buildHeaders = () => {
 const headers = {};
 for (const h of testHeaders.value) {
 if (h.key && h.key.trim()) headers[h.key.trim()] = h.value;
 }
 return headers;
};

const buildAuthHeaders = () => {
 const headers = {};
 let queryAuth = null;

 const sessionToken = localStorage.getItem('auth_token');
 if (authUseSessionToken.value && sessionToken) {
 headers['Authorization'] = `Bearer ${sessionToken}`;
 return { headers, queryAuth };
 }

 if (authType.value === 'bearer' && authBearerToken.value) {
 headers['Authorization'] = `Bearer ${authBearerToken.value}`;
 } else if (authType.value === 'basic' && (authBasicUser.value || authBasicPass.value)) {
 const creds = btoa(`${authBasicUser.value}:${authBasicPass.value}`);
 headers['Authorization'] = `Basic ${creds}`;
 } else if (authType.value === 'apikey' && authApiKey.value && authApiValue.value) {
 if (authApiAddTo.value === 'header') {
 headers[authApiKey.value] = authApiValue.value;
 } else {
 queryAuth = { key: authApiKey.value, value: authApiValue.value };
 }
 }
 return { headers, queryAuth };
};

const buildQuery = () => {
 const params = new URLSearchParams();
 const { queryAuth } = buildAuthHeaders();
 if (queryAuth) params.append(queryAuth.key, queryAuth.value);
 return params.toString();
};

const buildBody = () => {
 if (testMethod.value === 'GET' || testMethod.value === 'DELETE') return undefined;
 if (bodyType.value === 'raw') {
 if (!testBody.value || !testBody.value.trim()) return undefined;
 return testBody.value;
 }
 // form-data
 const fd = new URLSearchParams();
 for (const f of testFormData.value) {
 if (f.key && f.key.trim()) fd.append(f.key.trim(), f.value);
 }
 return fd.toString();
};

const formatBytes = (bytes) => {
 if (bytes === 0) return '0 B';
 const k = 1024;
 const sizes = ['B', 'KB', 'MB', 'GB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const copyCurl = async () => {
 if (!curlCommand.value) return;
 try {
 await navigator.clipboard.writeText(curlCommand.value);
 toast.success('cURL copied to clipboard');
 } catch (e) {
 toast.error('Failed to copy');
 }
};

const copyResponse = async () => {
 if (!testResponse.value) return;
 try {
 await navigator.clipboard.writeText(testResponse.value);
 toast.success('Response copied to clipboard');
 } catch (e) {
 toast.error('Failed to copy');
 }
};

const runTest = async () => {
 if (!testUrl.value) {
 toast.error('Please enter an Endpoint URL');
 return;
 }

 isTesting.value = true;
 testResponse.value = '';
 responseStatus.value = null;
 responseStatusText.value = '';
 responseTime.value = null;
 responseSize.value = '';

 const headers = { ...buildHeaders(), ...buildAuthHeaders().headers };
 const query = buildQuery();
 const body = buildBody();

 if (bodyType.value === 'raw' && body !== undefined) {
 headers['Content-Type'] = 'application/json';
 } else if (bodyType.value === 'form-data' && body !== undefined) {
 headers['Content-Type'] = 'application/x-www-form-urlencoded';
 }

  try {
    let data;
    if (window.electronAPI && window.electronAPI.proxyRequest) {
      const res = await window.electronAPI.proxyRequest({
        url: testUrl.value,
        method: testMethod.value,
        headers,
        query: query ? Object.fromEntries(new URLSearchParams(query)) : {},
        body: body ?? null,
        timeout: 30,
      });
      if (res.success) {
        data = res.data;
      } else {
        throw { isElectronError: true, data: res.error };
      }
    } else {
      // Fallback for non-electron (will probably fail on CORS but that's expected)
      const start = performance.now();
      const res = await axios({
        url: testUrl.value,
        method: testMethod.value,
        headers,
        params: query ? Object.fromEntries(new URLSearchParams(query)) : {},
        data: body ?? null,
        timeout: 30000,
        validateStatus: () => true
      });
      const elapsed = Math.round(performance.now() - start);
      data = {
        status: res.status,
        status_text: res.statusText,
        elapsed_ms: elapsed,
        body: res.data,
        curl: '',
        headers: res.headers
      };
    }

    responseStatus.value = data.status;
    responseStatusText.value = data.status_text;
    responseTime.value = data.elapsed_ms;
    const payload = data.body !== undefined ? (typeof data.body === 'string' ? data.body : JSON.stringify(data.body, null, 2)) : JSON.stringify(data, null, 2);
    responseSize.value = data.size_bytes ? formatBytes(data.size_bytes) : formatBytes(new Blob([payload]).size);
    testResponse.value = payload;
    curlCommand.value = data.curl || '';
  } catch (err) {
    if (err.isElectronError) {
      const d = err.data;
      responseStatus.value = d.status;
      responseStatusText.value = d.status_text;
      responseTime.value = d.elapsed_ms;
      const payload = d.body !== undefined ? (typeof d.body === 'string' ? d.body : JSON.stringify(d.body, null, 2)) : JSON.stringify(d, null, 2);
      responseSize.value = formatBytes(new Blob([payload]).size);
      testResponse.value = payload;
      curlCommand.value = d.curl || '';
      toast.error('Request failed');
    } else {
      responseStatus.value = 0;
      responseStatusText.value = 'ERROR';
      testResponse.value = `// Request failed\n${err.message}\n\n${err.stack || ''}`;
      curlCommand.value = '';
      toast.error('Request failed: ' + err.message);
    }
  } finally {
 isTesting.value = false;
 }
};
</script>
