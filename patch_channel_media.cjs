const fs = require('fs');
let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { ForwardModal } from './components/ForwardModal';",
  "import { ForwardModal } from './components/ForwardModal';\nimport { SharedMediaSidebar } from './components/SharedMediaSidebar';\nimport { Folder } from 'lucide-react';"
);

// 2. Add state
code = code.replace(
  "const [forwardingMessage, setForwardingMessage] = useState<ChannelMessage | null>(null);",
  "const [forwardingMessage, setForwardingMessage] = useState<ChannelMessage | null>(null);\n  const [showSharedMedia, setShowSharedMedia] = useState(false);"
);

// 3. Add Folder button to Header
const searchUiBlock = `                <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="p-1 hover:text-white text-white/50 ml-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsSearching(true)} className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>`;

const searchUiNew = `                <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="p-1 hover:text-white text-white/50 ml-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsSearching(true)} className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => setShowSharedMedia(!showSharedMedia)} className={\`p-2 hover:bg-white/10 rounded-full transition-colors ml-1 \${showSharedMedia ? 'text-purple-400 bg-white/10' : 'text-white/70'}\`}>
              <Folder className="w-5 h-5" />
            </button>
          </div>`;

code = code.replace(searchUiBlock, searchUiNew);

// 4. Wrap layout
code = code.replace(
  '<div className="flex flex-col h-[calc(100vh-80px)] md:h-screen w-full relative bg-[#050816]">',
  '<div className="flex h-[calc(100vh-80px)] md:h-screen w-full relative bg-[#050816] overflow-hidden">\n        <div className="flex-1 flex flex-col min-w-0 relative h-full">'
);

// We need to add the SharedMedia sidebar right before the final closing div.
// Original tail ends with:
/*
      {forwardingMessage && (
        <ForwardModal 
          message={forwardingMessage} 
          userProfiles={userProfiles} 
          onClose={() => setForwardingMessage(null)} 
        />
      )}
    </DashboardLayout>
*/

const endBlock = `      )}
    </DashboardLayout>`;
    
const newEndBlock = `      )}
      
      {showSharedMedia && (
        <SharedMediaSidebar 
          messages={messages}
          userProfiles={userProfiles}
          currentUserId={currentUser?.uid || ''}
          onClose={() => setShowSharedMedia(false)}
        />
      )}
      </div>
    </DashboardLayout>`;

code = code.replace(endBlock, newEndBlock);

fs.writeFileSync('src/ChannelChatPage.tsx', code);
