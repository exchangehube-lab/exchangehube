const fs = require('fs');

let content = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');

// Imports
content = content.replace(
  `import { doc, getDoc, onSnapshot } from 'firebase/firestore';`,
  `import { doc, getDoc, onSnapshot, updateDoc, arrayRemove } from 'firebase/firestore';`
);
content = content.replace(
  `import { Folder } from 'lucide-react';`,
  `import { Folder, LogOut } from 'lucide-react';`
);

// UI Button
const targetUI = `            <button onClick={() => setShowSharedMedia(!showSharedMedia)} className={\`p-2 hover:bg-white/10 rounded-full transition-colors ml-1 \${showSharedMedia ? 'text-purple-400 bg-white/10' : 'text-white/70'}\`}>
              <Folder className="w-5 h-5" />
            </button>
          </div>
        </div>`;

const replacementUI = `            <button onClick={() => setShowSharedMedia(!showSharedMedia)} className={\`p-2 hover:bg-white/10 rounded-full transition-colors ml-1 \${showSharedMedia ? 'text-purple-400 bg-white/10' : 'text-white/70'}\`}>
              <Folder className="w-5 h-5" />
            </button>
            {isMember && !isAdmin && (
              <button 
                onClick={async () => {
                  if (window.confirm("Are you sure you want to leave this channel?")) {
                    try {
                      await updateDoc(doc(db, 'channels', channelId!), {
                        members: arrayRemove(currentUser.uid)
                      });
                      navigate('/channels');
                    } catch (e) {
                      console.error("Error leaving channel", e);
                    }
                  }
                }}
                className="ml-2 p-2 hover:bg-red-500/20 text-red-400 rounded-full transition-colors hidden md:block"
                title="Leave Channel"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>`;

if (content.includes(targetUI)) {
  content = content.replace(targetUI, replacementUI);
  fs.writeFileSync('src/ChannelChatPage.tsx', content);
  console.log("Success Leave Channel Patch");
} else {
  console.log("Target UI not found");
}

