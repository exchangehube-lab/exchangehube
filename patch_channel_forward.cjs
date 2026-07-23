const fs = require('fs');
let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');

// Imports
code = code.replace(
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare, Pencil, Trash2, Pin, PinOff, Search, ChevronUp, ChevronDown } from 'lucide-react';",
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare, Pencil, Trash2, Pin, PinOff, Search, ChevronUp, ChevronDown, Forward } from 'lucide-react';\nimport { ForwardModal } from './components/ForwardModal';"
);

// State
code = code.replace(
  "const [messageToDelete, setMessageToDelete] = useState<ChannelMessage | null>(null);",
  "const [messageToDelete, setMessageToDelete] = useState<ChannelMessage | null>(null);\n  const [forwardingMessage, setForwardingMessage] = useState<ChannelMessage | null>(null);"
);

// Forwarded Label
const forwardedLabel = `
                        {msg.forwarded_from && (
                          <div className={\`mb-1 px-3 py-1 rounded-xl text-[10px] flex items-center gap-1 max-w-sm \${isMine ? 'text-white/60 mr-1 justify-end' : 'text-white/60 ml-1'}\`}>
                            <Forward className="w-3 h-3 shrink-0" />
                            <span className="truncate italic">Forwarded from {msg.forwarded_from}</span>
                          </div>
                        )}
                        {msg.reply_to`;
code = code.replace("{msg.reply_to", forwardedLabel);


// Forward Button - isMine
const isMineForwardButton = `
                          <button onClick={() => setForwardingMessage(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Forward className="w-3.5 h-3.5" />
                          </button>
                          <ReactionPicker`;
code = code.replace("<ReactionPicker", isMineForwardButton);


// Forward Button - !isMine
const notMineForwardButton = `
                          <button onClick={() => setForwardingMessage(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Forward className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>`;
code = code.replace(/<\/div>\s*\)\}\s*<\/div>/, notMineForwardButton);


// Modal
const modal = `
      {forwardingMessage && (
        <ForwardModal 
          message={forwardingMessage} 
          userProfiles={userProfiles} 
          onClose={() => setForwardingMessage(null)} 
        />
      )}
    </DashboardLayout>
  );
}`;
code = code.replace(/<\/DashboardLayout>\s*\);\s*\}/, modal);

fs.writeFileSync('src/ChannelChatPage.tsx', code);
