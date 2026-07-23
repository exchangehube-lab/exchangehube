const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

// Imports
code = code.replace(
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare, Pencil } from 'lucide-react';",
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare, Pencil, Trash2 } from 'lucide-react';"
);

// State
code = code.replace(
  "const [editingMessageId, setEditingMessageId] = useState<string | null>(null);",
  "const [editingMessageId, setEditingMessageId] = useState<string | null>(null);\n  const [messageToDelete, setMessageToDelete] = useState<PersonalMessage | null>(null);"
);

// handleDelete
const handleDelete = `
  const handleDelete = async (forAll: boolean) => {
    if (!messageToDelete) return;
    try {
      await personalMessageService.deleteMessage(messageToDelete.id, forAll);
      setMessageToDelete(null);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };
`;
code = code.replace("const handleSendMessage =", handleDelete + "\n\n  const handleSendMessage =");


// UI changes inside messages.map
const oldMap = /const isEditable = isMine && \(!msg\.message_type \|\| msg\.message_type === 'text'\) && !msg\.file_url && !msg\.voice_url && \(new Date\(\)\.getTime\(\) - new Date\(msg\.created_at\)\.getTime\(\) < 15 \* 60 \* 1000\);/;

const newMap = `
              if (msg.deleted && isMine && !msg.deleted_for_all) return null; // Hide if deleted for me
              const isEditable = isMine && (!msg.message_type || msg.message_type === 'text') && !msg.file_url && !msg.voice_url && (new Date().getTime() - new Date(msg.created_at).getTime() < 15 * 60 * 1000) && !msg.deleted_for_all;
`;
code = code.replace(oldMap, newMap);


// Add Trash2 to hover buttons
const editButtonRegex = /\{isEditable && \(\s*<button onClick=\{\(\) => startEditing\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-white transition-colors">\s*<Pencil className="w-3\.5 h-3\.5" \/>\s*<\/button>\s*\)\}/;
const newButtons = `{isEditable && (
                            <button onClick={() => startEditing(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {!msg.deleted_for_all && (
                            <button onClick={() => setMessageToDelete(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}`;
code = code.replace(editButtonRegex, newButtons);


// Style deleted_for_all message
const contentRegex = /\{msg\.content && <p className="whitespace-pre-wrap break-words">\{msg\.content\}<\/p>\}/;
const newContent = `{msg.content && <p className={\`whitespace-pre-wrap break-words \${msg.deleted_for_all ? 'italic opacity-60' : ''}\`}>{msg.content}</p>}`;
code = code.replace(contentRegex, newContent);


// Add confirmation Modal
const modalUI = `
      {/* Delete Confirmation Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1A1D2D] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Delete Message</h3>
            <p className="text-white/70 mb-6 text-sm">Are you sure you want to delete this message?</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleDelete(true)}
                className="w-full py-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-medium transition-colors"
              >
                Delete for Everyone
              </button>
              <button 
                onClick={() => handleDelete(false)}
                className="w-full py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
              >
                Delete for Me
              </button>
              <button 
                onClick={() => setMessageToDelete(null)}
                className="w-full py-3 mt-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
`;

code = code.replace(/<\/DashboardLayout>/, modalUI);

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
