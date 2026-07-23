import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

# Fix dashboard create channel
old_create = """      // Automatically join the creator to the channel
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
      });"""

if old_create in content:
    content = content.replace(old_create, "")

# Fix dashboard join channel
old_join = """                        const memberRef = doc(db, 'channel_members', `${currentUser.uid}_${channel.id}`);
                        await setDoc(memberRef, {
                          userId: currentUser.uid,
                          channelId: channel.id,
                          joinedAt: serverTimestamp(),
                          role: 'member',
                          status: 'active',
                          lastReadAt: serverTimestamp(),
                          unreadCount: 0,
                          notificationsEnabled: true,
                          isMuted: false
                        });"""

if old_join in content:
    content = content.replace(old_join, "")

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)


with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

# Fix chatpage join channel
old_join2 = """      const memberRef = doc(db, 'channel_members', `${currentUser.uid}_${channelId}`);
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
      });"""

if old_join2 in content:
    content = content.replace(old_join2, "")

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)

print("Removed channel_members usages.")
