import sys
import re

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_join = """                <button 
                  onClick={async () => {
                    if (!auth.currentUser) return;
                    const isMember = channel.members?.includes(currentUser?.uid);
                    if (!isMember) {
                      try {
                        await updateDoc(doc(db, 'channels', channel.id), {
                          members: arrayUnion(currentUser?.uid)
                        });
                      } catch (err: any) {
                        console.error(err);
                        if (err.message && err.message.includes("permission")) {
                           alert("Permission denied. Please update your Firestore security rules in the Firebase Console to allow joining channels.");
                           return;
                        }
                      }
                    }
                    navigate(`/channels/${channel.id}/chat`);
                  }}"""

new_join = """                <button 
                  onClick={async () => {
                    if (!currentUser) return;
                    const isMember = channel.members?.includes(currentUser?.uid);
                    if (!isMember) {
                      try {
                        const memberRef = doc(db, 'channel_members', `${currentUser.uid}_${channel.id}`);
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
                        });
                        await updateDoc(doc(db, 'channels', channel.id), {
                          members: arrayUnion(currentUser.uid)
                        });
                      } catch (err: any) {
                        console.error(err);
                        if (err.message && err.message.includes("permission")) {
                           alert("Permission denied. Please update your Firestore security rules in the Firebase Console to allow joining channels.");
                        }
                        return;
                      }
                    }
                    navigate(`/channels/${channel.id}/chat`);
                  }}"""

if old_join in content:
    content = content.replace(old_join, new_join)
    with open('src/DashboardPages.tsx', 'w') as f:
        f.write(content)
    print("DashboardPages.tsx patched successfully.")
else:
    print("Could not find the target code in DashboardPages.tsx.")
