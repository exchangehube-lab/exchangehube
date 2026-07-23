const fs = require('fs');

let pCode = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

// Imports
pCode = pCode.replace(
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music } from 'lucide-react';",
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic } from 'lucide-react';\nimport { VoiceRecorder, VoicePlayer } from './components/VoiceMessage';"
);

// State
pCode = pCode.replace(
  "const [uploadError, setUploadError] = useState<string | null>(null);",
  "const [uploadError, setUploadError] = useState<string | null>(null);\n  const [isRecordingVoice, setIsRecordingVoice] = useState(false);"
);

// Handle Voice Upload
const handleVoiceSend = `
  const handleVoiceSend = async (blob: Blob, duration: number) => {
    if (!currentUser || !chatId || !targetUserId) return;
    
    setIsRecordingVoice(false);
    setUploading(true);
    setUploadProgress(10);
    
    try {
      const file = new File([blob], 'voice_message.webm', { type: 'audio/webm' });
      const result = await uploadFileToCloudinary(file);
      
      await personalMessageService.sendMessage({
        chat_id: chatId,
        sender_id: currentUser.uid,
        content: '',
        message_type: 'voice',
        file_url: result.url,
        file_name: 'Voice Message',
        file_size: file.size,
        voice_duration: duration
      });
    } catch (err: any) {
      console.error("Voice upload error:", err);
      setUploadError(err.message || "Failed to upload voice message");
      setTimeout(() => setUploadError(null), 3000);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
`;
pCode = pCode.replace("const handleFileSelect = async", handleVoiceSend + "\n\n  const handleFileSelect = async");

// Render Voice Message
const renderVoiceMsg = `
                      {msg.message_type === 'voice' && msg.file_url ? (
                        <div className="mb-1">
                          <VoicePlayer url={msg.file_url} duration={msg.voice_duration} />
                        </div>
                      ) : msg.message_type === 'image' && msg.file_url ? (
`;
pCode = pCode.replace(/\{msg\.message_type === 'image' && msg\.file_url \? \(/, renderVoiceMsg);

// Replace form area
const formUI = `
          {isRecordingVoice ? (
            <div className="flex max-w-4xl mx-auto w-full">
              <VoiceRecorder 
                onSend={handleVoiceSend} 
                onCancel={() => setIsRecordingVoice(false)} 
                disabled={uploading || sending}
              />
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto w-full">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect} 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || sending}
                className="w-12 h-12 shrink-0 bg-white/5 hover:bg-white/10 text-[#B8C0D0] hover:text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea 
                value={newMessage}
                onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={\`Message @\${targetUser?.username || 'user'}...\`}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 resize-none max-h-32 min-h-[48px]"
                rows={1}
              />
              {newMessage.trim() ? (
                <button 
                  type="submit"
                  disabled={uploading || sending}
                  className="w-12 h-12 shrink-0 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => setIsRecordingVoice(true)}
                  disabled={uploading || sending}
                  className="w-12 h-12 shrink-0 bg-white/5 hover:bg-white/10 text-[#B8C0D0] hover:text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </form>
          )}
`;
pCode = pCode.replace(/<form onSubmit=\{handleSendMessage\} className="flex items-end gap-2 max-w-4xl mx-auto w-full">[\s\S]*?<\/form>/, formUI);

fs.writeFileSync('src/PersonalChatWindow.tsx', pCode);


let cCode = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');

cCode = cCode.replace(
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music } from 'lucide-react';",
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic } from 'lucide-react';\nimport { VoiceRecorder, VoicePlayer } from './components/VoiceMessage';"
);

cCode = cCode.replace(
  "const [uploadError, setUploadError] = useState<string | null>(null);",
  "const [uploadError, setUploadError] = useState<string | null>(null);\n  const [isRecordingVoice, setIsRecordingVoice] = useState(false);"
);

const channelVoiceSend = `
  const handleVoiceSend = async (blob: Blob, duration: number) => {
    if (!currentUser || !channelId) return;
    
    setIsRecordingVoice(false);
    setUploading(true);
    setUploadProgress(10);
    
    try {
      const file = new File([blob], 'voice_message.webm', { type: 'audio/webm' });
      const result = await uploadFileToCloudinary(file);
      
      await channelMessageService.sendMessage({
        channel_id: channelId,
        sender_id: currentUser.uid,
        content: '',
        message_type: 'voice',
        file_url: result.url,
        file_name: 'Voice Message',
        file_size: file.size,
        voice_duration: duration
      });
    } catch (err: any) {
      console.error("Voice upload error:", err);
      setUploadError(err.message || "Failed to upload voice message");
      setTimeout(() => setUploadError(null), 3000);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
`;
cCode = cCode.replace("const handleFileSelect = async", channelVoiceSend + "\n\n  const handleFileSelect = async");

cCode = cCode.replace(/\{msg\.message_type === 'image' && msg\.file_url \? \(/, renderVoiceMsg);

const channelFormUI = `
          {isRecordingVoice ? (
            <div className="flex w-full">
              <VoiceRecorder 
                onSend={handleVoiceSend} 
                onCancel={() => setIsRecordingVoice(false)} 
                disabled={uploading || sending}
              />
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect} 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || sending}
                className="w-12 h-12 shrink-0 bg-white/5 hover:bg-white/10 text-[#B8C0D0] hover:text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea 
                value={newMessage}
                onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Message this channel..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 resize-none max-h-32 min-h-[48px]"
                rows={1}
              />
              {newMessage.trim() ? (
                <button 
                  type="submit"
                  disabled={uploading || sending}
                  className="w-12 h-12 shrink-0 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => setIsRecordingVoice(true)}
                  disabled={uploading || sending}
                  className="w-12 h-12 shrink-0 bg-white/5 hover:bg-white/10 text-[#B8C0D0] hover:text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </form>
          )}
`;
cCode = cCode.replace(/<form onSubmit=\{handleSendMessage\} className="flex items-end gap-2">[\s\S]*?<\/form>/, channelFormUI);

fs.writeFileSync('src/ChannelChatPage.tsx', cCode);

