const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { ForwardModal } from './components/ForwardModal';",
  "import { ForwardModal } from './components/ForwardModal';\nimport { SharedMediaSidebar } from './components/SharedMediaSidebar';\nimport { Folder } from 'lucide-react';"
);

// 2. Add state
code = code.replace(
  "const [forwardingMessage, setForwardingMessage] = useState<PersonalMessage | null>(null);",
  "const [forwardingMessage, setForwardingMessage] = useState<PersonalMessage | null>(null);\n  const [showSharedMedia, setShowSharedMedia] = useState(false);"
);

// 3. Add Folder button to Header
const searchUiBlock = `                  autoFocus
                />
                <button onClick={() => {
                  setSearchQuery('');
                  setIsSearching(false);
                }} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsSearching(true)} className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>`;

const searchUiNew = `                  autoFocus
                />
                <button onClick={() => {
                  setSearchQuery('');
                  setIsSearching(false);
                }} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-4 h-4 text-white/50" />
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

// Find the end to close the flex-1 div and add SharedMediaSidebar
const endBlock = `      )}
    </DashboardLayout>`;
    
const newEndBlock = `      )}
        </div>
        
        {showSharedMedia && (
          <SharedMediaSidebar 
            messages={messages}
            userProfiles={{ [targetUserId || '']: targetUser, [currentUser?.uid || '']: { username: currentUser?.displayName || currentUser?.email?.split('@')[0] } }}
            currentUserId={currentUser?.uid || ''}
            onClose={() => setShowSharedMedia(false)}
          />
        )}
      </div>
    </DashboardLayout>`;

code = code.replace(endBlock, newEndBlock);

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
