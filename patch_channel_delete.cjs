const fs = require('fs');
let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');

// Imports
code = code.replace(
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare, Pencil } from 'lucide-react';",
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare, Pencil, Trash2 } from 'lucide-react';"
);

// State
code = code.replace(
  "const [editingMessageId, setEditingMessageId] = useState<string | null>(null);",
  "const [editingMessageId, setEditingMessageId] = useState<string | null>(null);\n  const [messageToDelete, setMessageToDelete] = useState<ChannelMessage | null>(null);"
);

// handleDelete
const handleDelete = `
  const handleDelete = async () => {
    if (!messageToDelete) return;
    try {
      await channelMessageService.deleteMessage(messageToDelete.id);
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
              const canDelete = isMine || isAdmin;
              const isEditable = isMine && (!msg.message_type || msg.message_type === 'text') && !msg.file_url && !msg.voice_url && (new Date().getTime() - new Date(msg.created_at).getTime() < 15 * 60 * 1000) && !msg.deleted_for_all;
`;
code = code.replace(oldMap, newMap);


// Add Trash2 to hover buttons. Wait, for channel, the buttons might be grouped by isMine and !isMine, but since admin can delete, we should put the delete button where it makes sense.
// If isMine, it's on the left. If !isMine, it's on the right. 
// But wait, currently the buttons on the right for !isMine are just ReactionPicker and Reply. We need to add Trash2 there if isAdmin.
// Let's check how it's structured.
