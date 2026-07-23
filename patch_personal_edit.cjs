const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

// Imports
code = code.replace(
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare } from 'lucide-react';",
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare, Pencil } from 'lucide-react';"
);

// State
code = code.replace(
  "const [replyingTo, setReplyingTo] = useState<PersonalMessage | null>(null);",
  "const [replyingTo, setReplyingTo] = useState<PersonalMessage | null>(null);\n  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);"
);

// handleSendMessage
const newHandleSendMessage = `
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !chatId || !targetUserId) return;

    setSending(true);
    try {
      if (editingMessageId) {
        await personalMessageService.editMessage(editingMessageId, newMessage.trim());
        setEditingMessageId(null);
      } else {
        await personalMessageService.sendMessage({
          chat_id: chatId,
          sender_id: currentUser.uid,
          content: newMessage.trim(),
          reply_to: replyingTo?.id
        });
      }
      setNewMessage('');
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to send/edit message:", err);
    } finally {
      setSending(false);
    }
  };
`;
const oldHandleSendMessage = /const handleSendMessage = async \(e: React\.FormEvent\) => \{[\s\S]*?setSending\(false\);\s*\}\s*\};\s*/;
code = code.replace(oldHandleSendMessage, newHandleSendMessage);

// startEditing
const startEditing = `
  const startEditing = (msg: PersonalMessage) => {
    setEditingMessageId(msg.id);
    setNewMessage(msg.content);
    setReplyingTo(null);
  };
`;
code = code.replace("const handleSendMessage =", startEditing + "\n\n  const handleSendMessage =");

// Button UI in Message
const isEditableStr = `
              const isEditable = isMine && (!msg.message_type || msg.message_type === 'text') && !msg.file_url && !msg.voice_url && (new Date().getTime() - new Date(msg.created_at).getTime() < 15 * 60 * 1000);
`;
code = code.replace("const isMine = msg.sender_id === currentUser?.uid;", "const isMine = msg.sender_id === currentUser?.uid;\n              " + isEditableStr);

const editButtonRegex = /<button onClick=\{\(\) => setReplyingTo\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-white transition-colors">\s*<Reply className="w-4 h-4" \/>\s*<\/button>/;
const newButtons = `<button onClick={() => setReplyingTo(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Reply className="w-4 h-4" />
                          </button>
                          {isEditable && (
                            <button onClick={() => startEditing(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}`;
code = code.replace(editButtonRegex, newButtons); // Note: this replaces the first occurrence (which is isMine == true block)

// Display Edited timestamp
const timeStringRegex = /<span className="text-\[10px\] text-white\/40">\{timeString\}<\/span>/;
const newTimeString = `<span className="text-[10px] text-white/40">{timeString}{msg.edited && ' (Edited)'}</span>`;
code = code.replace(timeStringRegex, newTimeString);

// Input Area UI
const editingUIRegex = /\{\/\* Input Area \*\/\}\s*<div className="p-4 bg-white\/5 border-t border-white\/10 backdrop-blur-md shrink-0">/;
const editingUI = `{/* Input Area */}
        <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-md shrink-0">
          
          {editingMessageId && (
            <div className="max-w-4xl mx-auto w-full mb-2 bg-[#1A1D2D]/80 border border-white/10 rounded-xl p-3 flex items-start justify-between">
              <div className="flex flex-col min-w-0">
                <div className="text-xs text-purple-400 font-medium flex items-center gap-1.5 mb-1">
                  <Pencil className="w-3 h-3" />
                  Editing message
                </div>
              </div>
              <button 
                onClick={() => { setEditingMessageId(null); setNewMessage(''); }}
                className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}`;
code = code.replace(editingUIRegex, editingUI);

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
