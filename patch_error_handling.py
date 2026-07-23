import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_join = """                    if (!isMember) {
                      await updateDoc(doc(db, 'channels', channel.id), {
                        members: arrayUnion(auth.currentUser.uid)
                      });
                    }"""

new_join = """                    if (!isMember) {
                      try {
                        await updateDoc(doc(db, 'channels', channel.id), {
                          members: arrayUnion(auth.currentUser.uid)
                        });
                      } catch (err: any) {
                        console.error(err);
                        if (err.message && err.message.includes("permission")) {
                           alert("Permission denied. Please update your Firestore security rules in the Firebase Console to allow joining channels.");
                           return;
                        }
                      }
                    }"""

content = content.replace(old_join, new_join)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)

with open('src/ChatPage.tsx', 'r') as f:
    chat_content = f.read()

old_chat_join = """  const handleJoinChannel = async () => {
    if (!auth.currentUser || !channelId) return;
    try {
      await updateDoc(doc(db, 'channels', channelId), {
        members: arrayUnion(auth.currentUser.uid)
      });
    } catch (err) {
      console.error(err);
    }
  };"""

new_chat_join = """  const handleJoinChannel = async () => {
    if (!auth.currentUser || !channelId) return;
    try {
      await updateDoc(doc(db, 'channels', channelId), {
        members: arrayUnion(auth.currentUser.uid)
      });
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("permission")) {
        alert("Permission denied. Please update your Firestore security rules in the Firebase Console to allow joining channels and sending messages.");
      }
    }
  };"""

chat_content = chat_content.replace(old_chat_join, new_chat_join)

with open('src/ChatPage.tsx', 'w') as f:
    f.write(chat_content)

