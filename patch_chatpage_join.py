import sys
import re

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_join = """  const handleJoinChannel = async () => {
    if (!currentUser || !channelId) return;
    try {
      await updateDoc(doc(db, 'channels', channelId), {
        members: arrayUnion(currentUser.uid)
      });
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("permission")) {
        alert("Permission denied. Please update your Firestore security rules in the Firebase Console to allow joining channels and sending messages.");
      }
    }
  };"""

new_join = """  const handleJoinChannel = async () => {
    if (!currentUser || !channelId) return;
    try {
      const memberRef = doc(db, 'channel_members', `${currentUser.uid}_${channelId}`);
      await setDoc(memberRef, {
        userId: currentUser.uid,
        channelId: channelId,
        joinedAt: serverTimestamp(),
        role: 'member',
        status: 'active',
        lastReadAt: serverTimestamp(),
        unreadCount: 0,
        notificationsEnabled: true,
        isMuted: false
      });
      await updateDoc(doc(db, 'channels', channelId), {
        members: arrayUnion(currentUser.uid)
      });
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("permission")) {
        alert("Permission denied. Please update your Firestore security rules in the Firebase Console to allow joining channels and sending messages.");
      }
    }
  };"""

if old_join in content:
    content = content.replace(old_join, new_join)
    with open('src/ChatPage.tsx', 'w') as f:
        f.write(content)
    print("ChatPage.tsx patched successfully.")
else:
    print("Could not find the target code in ChatPage.tsx.")
