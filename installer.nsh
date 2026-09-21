!macro customInstall
  DetailPrint "Menginstal dependensi AI Agents (Opencode & Claude CLI) secara global..."
  ExecWait 'cmd.exe /c "echo Menginstall Opencode dan Claude CLI... && npm install -g opencode @anthropic-ai/claude-code && echo Instalasi selesai! && timeout /t 3"'
!macroend
