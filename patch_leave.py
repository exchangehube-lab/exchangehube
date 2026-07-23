import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
old_import = "import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, setDoc, arrayUnion, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';"
new_import = "import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';"
if old_import in content:
    content = content.replace(old_import, new_import)
else:
    print("Could not update imports")

# 2. Add Leave Channel button
old_button = """              <button 
                onClick={() => {
                  if (navigator.share && channel.channelLink) {
                    navigator.share({
                      title: channel.channelName,
                      url: channel.channelLink
                    }).catch(console.error);
                  } else if (channel.channelLink) {
                    navigator.clipboard.writeText(channel.channelLink);
                    alert('Link copied!');
                  }
                }}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-medium transition-colors"
              >
                Share Channel Link
              </button>
            </div>
          </div>
        </div>"""

new_button = """              <button 
                onClick={() => {
                  if (navigator.share && channel.channelLink) {
                    navigator.share({
                      title: channel.channelName,
                      url: channel.channelLink
                    }).catch(console.error);
                  } else if (channel.channelLink) {
                    navigator.clipboard.writeText(channel.channelLink);
                    alert('Link copied!');
                  }
                }}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-medium transition-colors"
              >
                Share Channel Link
              </button>
              {channel.ownerUid !== currentUser?.uid && (
                <button 
                  onClick={async () => {
                    if (!currentUser || !channelId) return;
                    if (confirm("Are you sure you want to leave this channel?")) {
                      try {
                        await updateDoc(doc(db, 'channels', channelId), {
                          members: arrayRemove(currentUser.uid)
                        });
                        navigate('/chat');
                      } catch (err: any) {
                        console.error('Error leaving channel:', err);
                      }
                    }
                  }}
                  className="w-full py-2.5 mt-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-colors"
                >
                  Leave Channel
                </button>
              )}
            </div>
          </div>
        </div>"""

if old_button in content:
    content = content.replace(old_button, new_button)
    print("Added leave button")
else:
    print("Could not add leave button")

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)
