import aiConfig from '../../config.json';
import { streamText, tool, jsonSchema } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

export const directGenerateStream = async (systemPrompt, history, onChunk, onComplete, onError, signal, projectPath = '') => {
   // Ambil pengaturan kustom model dari config.json
   const defaultProviderKey = aiConfig.ai_default || Object.keys(aiConfig.providers)[0];
   const provider = aiConfig.providers[defaultProviderKey];
   const url = provider.url;
   const apiKey = provider.key;
   const modelName = provider.model || (provider.models && provider.models.length > 0 ? provider.models[0] : 'gpt-4o');

   // Hubungkan ke endpoint kustom yang ada di config.json
   const customOpenAI = createOpenAI({
      baseURL: url,
      apiKey: apiKey,
   });

   // Susun histori chat, abaikan pesan kosong (indikator loading)
   const messages = history
      .filter(msg => msg.content !== '' || (msg.images && msg.images.length > 0))
      .map(msg => {
         const role = msg.role === 'user' ? 'user' : 'assistant';
         
         if (msg.images && msg.images.length > 0) {
            const contentParts = [];
            if (msg.content) {
               contentParts.push({ type: 'text', text: msg.content });
            } else {
               contentParts.push({ type: 'text', text: 'Tolong perhatikan gambar terlampir.' });
            }
            
            msg.images.forEach(img => {
               contentParts.push({ type: 'image', image: img });
            });
            
            return { role, content: contentParts };
         }
         
         return {
            role,
            content: msg.content
         };
      });

   let activeTools = {
      searchWeb: tool({
         description: 'Mencari informasi real-time dari internet. Gunakan ini jika butuh data aktual atau gambar.',
         parameters: z.object({
            query: z.string().describe('Kata kunci pencarian internet'),
         }),
         execute: async (args) => {
            const inputObj = args || {};
            const query = inputObj.query || Object.values(inputObj).filter(v => typeof v === 'string').join(' ');
            
            if (window.ipcRenderer && query) {
               const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
               // Mengeksekusi permintaan melalui background process Electron untuk menembus CORS
               const res = await window.ipcRenderer.invoke('app:proxyRequest', {
                  url: searchUrl,
                  method: 'GET',
                  headers: {
                     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                  }
               });
               if (res && res.success && res.data.body) {
                  const bodyMatch = res.data.body.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                  if (bodyMatch) {
                     // Pembersihan tag HTML sederhana untuk menghemat token
                     let text = bodyMatch[1].replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
                     return text.substring(0, 3000); 
                  }
               }
            }
            return "Pencarian gagal atau tidak ada hasil.";
         },
      })
   };

   // Dynamically load tools from MCP
   if (window.electronAPI && window.electronAPI.mcpListTools) {
      try {
         const mcpRes = await window.electronAPI.mcpListTools();
         if (mcpRes.success && mcpRes.tools) {
            mcpRes.tools.forEach(mcpTool => {
               activeTools[mcpTool.name] = tool({
                  description: mcpTool.description || `MCP Tool: ${mcpTool.name}`,
                  parameters: jsonSchema(mcpTool.inputSchema),
                  execute: async (args) => {
                     try {
                        const callRes = await window.electronAPI.mcpCallTool(mcpTool.name, args);
                        if (callRes.success) {
                           // MCP responses often have an array of content inside result.content
                           const content = callRes.result?.content || callRes.result;
                           return typeof content === 'string' ? content : JSON.stringify(content);
                        } else {
                           return `[MCP ERROR] ${callRes.error}`;
                        }
                     } catch (err) {
                        return `[SYSTEM ERROR] Failed calling MCP tool: ${err.message}`;
                     }
                  }
               });
            });
         }
      } catch (err) {
         console.error('Failed to load MCP tools:', err);
      }
   }

   try {
      let currentMessages = [...messages];
      let step = 0;
      let continueGenerating = true;

      while (step < 5 && continueGenerating) {
         continueGenerating = false;

         const result = streamText({
            model: customOpenAI.chat(modelName),
            system: systemPrompt,
            messages: currentMessages,
            temperature: 0.7,
            abortSignal: signal,
            tools: activeTools,
         });

         let toolCallsObj = {};
         let toolResultsArr = [];
         let assistantText = "";

         for await (const part of result.fullStream) {
            if (signal.aborted) return;
            
            if (part.type === 'text-delta') {
               const chunkText = part.textDelta || part.text || "";
               assistantText += chunkText;
               onChunk(chunkText);
            } else if (part.type === 'tool-call') {
               const toolName = part.toolName;
               toolCallsObj[part.toolCallId] = {
                   toolCallId: part.toolCallId,
                   toolName: part.toolName,
                   args: part.args
               };
               
               if (toolName === 'searchWeb') {
                  const query = part.args?.query || 'target';
                  onChunk(`\n> 🧠 **Mencari informasi:** _"${query}"_...\n\n`);
               } else {
                  onChunk(`\n> 💻 **Memanggil Tool:** \`${toolName}\`\n\n`);
               }
            } else if (part.type === 'tool-result') {
               const toolName = part.toolName;
               toolResultsArr.push({
                   toolCallId: part.toolCallId,
                   toolName: part.toolName,
                   result: part.result
               });

               if (toolName === 'searchWeb') {
                  onChunk(`\n> ✨ **Pencarian selesai.** Menganalisa...\n\n`);
               } else {
                  const rawResult = part.result;
                  const isError = String(rawResult).includes('[MCP ERROR]') || String(rawResult).includes('[SYSTEM ERROR]') || String(rawResult).includes('"isError":true');
                  if (!isError) {
                     onChunk(`\n> ⚡ **Tool \`${toolName}\` selesai.** Menganalisa hasil...\n\n`);
                  } else {
                     onChunk(`\n> ⚠️ **Tool \`${toolName}\` gagal.** Mengevaluasi ulang...\n\n`);
                  }
               }
               continueGenerating = true;
            } else if (part.type === 'error') {
               onChunk(`\n> ❌ **Error:** _${part.error}_\n\n`);
            }
         }

         if (continueGenerating) {
             let assistantContent = [];
             if (assistantText) {
                assistantContent.push({ type: 'text', text: assistantText });
             }
             for (const tc of Object.values(toolCallsObj)) {
                assistantContent.push({
                   type: 'tool-call',
                   toolCallId: tc.toolCallId,
                   toolName: tc.toolName,
                   args: tc.args || {}
                });
             }

             currentMessages.push({
                 role: 'assistant',
                 content: assistantContent
             });
             currentMessages.push({
                 role: 'tool',
                 content: toolResultsArr.map(tr => ({
                     type: 'tool-result',
                     toolCallId: tr.toolCallId,
                     toolName: tr.toolName,
                     result: tr.result
                 }))
             });
             step++;
         }
      }

      if (onComplete) onComplete();
   } catch (error) {
      if (onError) onError(error);
   }
};
