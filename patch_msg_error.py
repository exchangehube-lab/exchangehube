import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_send = """    try {
      await addDoc(collection(db, 'channels', channelId, 'messages'), {
        text: newMessage,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || 'Anonymous User',
        senderPhotoURL: auth.currentUser.photoURL || null,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }"""

new_send = """    try {
      await addDoc(collection(db, 'channels', channelId, 'messages'), {
        text: newMessage,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || 'Anonymous User',
        senderPhotoURL: auth.currentUser.photoURL || null,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      if (err.message && err.message.includes("permission")) {
        alert("Permission denied. Please update your Firestore security rules in the Firebase Console to allow sending messages.");
      }
    }"""

content = content.replace(old_send, new_send)

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)

