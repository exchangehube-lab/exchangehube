import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_button = """                <button 
                  onClick={async () => {
                    if (!auth.currentUser) return;
                    const isMember = channel.members?.includes(auth.currentUser.uid);
                    if (!isMember) {
                      await updateDoc(doc(db, 'channels', channel.id), {
                        members: arrayUnion(auth.currentUser.uid)
                      });
                    }
                    navigate(`/chat/${channel.id}`);
                  }}
                  className="w-full py-3 mb-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-purple-600 group-hover:border-purple-500"
                >
                  Join Channel
                </button>"""

new_button = """                <button 
                  onClick={async () => {
                    if (!auth.currentUser) return;
                    const isMember = channel.members?.includes(auth.currentUser.uid);
                    if (!isMember) {
                      await updateDoc(doc(db, 'channels', channel.id), {
                        members: arrayUnion(auth.currentUser.uid)
                      });
                    }
                    navigate(`/channels/${channel.id}/chat`);
                  }}
                  className="w-full py-3 mb-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-purple-600 group-hover:border-purple-500"
                >
                  {channel.members?.includes(auth?.currentUser?.uid) ? 'Open Chat' : 'Join Channel'}
                </button>"""

content = content.replace(old_button, new_button)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
