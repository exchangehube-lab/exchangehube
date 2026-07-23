const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

// Add Paperclip icon
code = code.replace(
  "import { Send, ArrowLeft } from 'lucide-react';",
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music } from 'lucide-react';"
);
code = code.replace(
  "import { personalMessageService, PersonalMessage, presenceService, typingService } from './messaging';",
  "import { personalMessageService, PersonalMessage, presenceService, typingService } from './messaging';\nimport { uploadFileToCloudinary } from './utils/cloudinary';"
);

// State for uploading
const stateVars = `
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
`;
code = code.replace("const [sending, setSending] = useState(false);", "const [sending, setSending] = useState(false);\n" + stateVars);

const handleFileUpload = `
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !chatId || !targetUserId) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File exceeds 50MB limit");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(10); // Fake start

    try {
      const result = await uploadFileToCloudinary(file);
      setUploadProgress(100);
      
      let msgType: 'text' | 'image' | 'file' | 'video' | 'audio' = 'file';
      if (result.resource_type === 'image') msgType = 'image';
      else if (result.resource_type === 'video') {
        if (file.type.startsWith('audio/')) msgType = 'audio';
        else msgType = 'video';
      }

      await personalMessageService.sendMessage({
        chat_id: chatId,
        sender_id: currentUser.uid,
        content: '',
        message_type: msgType,
        file_url: result.url,
        file_name: file.name || result.original_filename,
        file_size: file.size || result.bytes
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload file");
      setTimeout(() => setUploadError(null), 3000);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
`;

code = code.replace("const handleSendMessage = async", handleFileUpload + "\n\n  const handleSendMessage = async");

// Message rendering
const renderMsg = `
                      {msg.message_type === 'image' && msg.file_url ? (
                        <div className="mb-1 rounded-xl overflow-hidden max-w-sm">
                          <img src={msg.file_url} alt={msg.file_name || 'image'} className="w-full h-auto object-cover max-h-60" />
                        </div>
                      ) : msg.message_type === 'video' && msg.file_url ? (
                        <div className="mb-1 rounded-xl overflow-hidden max-w-sm bg-black">
                          <video src={msg.file_url} controls className="w-full max-h-60" />
                        </div>
                      ) : msg.message_type === 'audio' && msg.file_url ? (
                        <div className="mb-1 rounded-xl overflow-hidden max-w-sm">
                          <audio src={msg.file_url} controls className="w-full" />
                        </div>
                      ) : (msg.message_type === 'file' || (!msg.message_type && msg.file_url)) && msg.file_url ? (
                        <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/10 rounded-xl mb-1 hover:bg-white/20 transition-colors">
                          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">{msg.file_name || 'Attachment'}</span>
                            <span className="text-xs text-white/50">
                              {msg.file_size ? (msg.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'File'}
                            </span>
                          </div>
                          <Download className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                        </a>
                      ) : null}
                      {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
`;
code = code.replace(/<p className="whitespace-pre-wrap break-words">\{msg\.content\}<\/p>/, renderMsg);

// Input area UI
const inputUI = `
          {uploadError && (
            <div className="mb-2 max-w-4xl mx-auto w-full px-4 py-2 bg-red-500/20 text-red-300 text-sm rounded-lg flex items-center justify-between">
              <span>{uploadError}</span>
              <button onClick={() => setUploadError(null)}><X className="w-4 h-4" /></button>
            </div>
          )}
          {uploading && (
            <div className="mb-2 max-w-4xl mx-auto w-full px-4 py-2 bg-white/5 text-white/70 text-sm rounded-lg flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading... {uploadProgress > 10 ? uploadProgress + '%' : ''}</span>
            </div>
          )}
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
`;
code = code.replace(/<form onSubmit=\{handleSendMessage\} className="flex items-end gap-2 max-w-4xl mx-auto w-full">\s*<textarea/, inputUI);

fs.writeFileSync('src/PersonalChatWindow.tsx', code);

// Same for ChannelChatPage.tsx
let channelCode = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');

channelCode = channelCode.replace(
  "import { Send, ArrowLeft } from 'lucide-react';",
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music } from 'lucide-react';"
);
channelCode = channelCode.replace(
  "import { channelMessageService, ChannelMessage, typingService } from './messaging';",
  "import { channelMessageService, ChannelMessage, typingService } from './messaging';\nimport { uploadFileToCloudinary } from './utils/cloudinary';"
);

channelCode = channelCode.replace("const [sending, setSending] = useState(false);", "const [sending, setSending] = useState(false);\n" + stateVars);

const channelHandleFileUpload = handleFileUpload.replace(/personalMessageService/g, 'channelMessageService').replace(/chat_id: chatId,/g, 'channel_id: channelId,').replace(/chatId/g, 'channelId').replace(/!chatId \|\| !targetUserId/g, '!channelId');

channelCode = channelCode.replace("const handleSendMessage = async", channelHandleFileUpload + "\n\n  const handleSendMessage = async");

channelCode = channelCode.replace(/<p className="whitespace-pre-wrap break-words">\{msg\.content\}<\/p>/, renderMsg);

const channelInputUI = `
            <div className="w-full">
              {uploadError && (
                <div className="mb-2 w-full px-4 py-2 bg-red-500/20 text-red-300 text-sm rounded-lg flex items-center justify-between">
                  <span>{uploadError}</span>
                  <button onClick={() => setUploadError(null)}><X className="w-4 h-4" /></button>
                </div>
              )}
              {uploading && (
                <div className="mb-2 w-full px-4 py-2 bg-white/5 text-white/70 text-sm rounded-lg flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading... {uploadProgress > 10 ? uploadProgress + '%' : ''}</span>
                </div>
              )}
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
`;
channelCode = channelCode.replace(/<form onSubmit=\{handleSendMessage\} className="flex items-end gap-2">\s*<textarea/, channelInputUI);
channelCode = channelCode.replace(/<\/form>\s*\)\}\s*<\/div>/, "</form>\n            </div>\n          )}\n        </div>");

fs.writeFileSync('src/ChannelChatPage.tsx', channelCode);
