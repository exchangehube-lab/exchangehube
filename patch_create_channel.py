import sys
import re

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_create = """      await addDoc(collection(db, 'channels'), {
        channelName,
        channelUsername: channelType === 'Public Channel' ? channelUsername : null,
        channelLink: finalLink,
        channelImageURL: finalImageURL,
        channelType,
        postPermission,
        channelBio,
        status: "active",
        ownerUid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setShowAddModal(false);"""

new_create = """      const newChannelRef = await addDoc(collection(db, 'channels'), {
        channelName,
        channelUsername: channelType === 'Public Channel' ? channelUsername : null,
        channelLink: finalLink,
        channelImageURL: finalImageURL,
        channelType,
        postPermission,
        channelBio,
        status: "active",
        ownerUid: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Automatically join the creator to the channel
      await setDoc(doc(db, 'channel_members', `${auth.currentUser.uid}_${newChannelRef.id}`), {
        userId: auth.currentUser.uid,
        channelId: newChannelRef.id,
        joinedAt: serverTimestamp(),
        role: 'owner',
        status: 'active',
        lastReadAt: serverTimestamp(),
        unreadCount: 0,
        notificationsEnabled: true,
        isMuted: false
      });

      setShowAddModal(false);"""

if old_create in content:
    content = content.replace(old_create, new_create)
    with open('src/DashboardPages.tsx', 'w') as f:
        f.write(content)
    print("DashboardPages.tsx create channel patched successfully.")
else:
    print("Could not find the target code in DashboardPages.tsx to patch channel creation.")
