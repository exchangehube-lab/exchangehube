import sys
import re

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

# Fix for onSnapshot of membersRef
old_members = """    const unsubMembers = onSnapshot(qMembers, (memberSnapshot) => {
      const channelIds = memberSnapshot.docs.map(doc => doc.data().channelId);"""

new_members = """    const unsubMembers = onSnapshot(qMembers, (memberSnapshot) => {
      const channelIds = memberSnapshot.docs.map(doc => doc.data().channelId);"""

# We actually need to find the end of the onSnapshot for qMembers and add the error handler.
# The previous code was:
old_fetch = """      const channelsRef = collection(db, 'channels');
      unsubChannels = onSnapshot(channelsRef, (channelSnapshot) => {
        const fetchedChannels = channelSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((c: any) => channelIds.includes(c.id) && c.status === 'active');
        setChannels(fetchedChannels);
        setChannelsLoading(false);
      });
    });

    return () => {"""

new_fetch = """      const channelsRef = collection(db, 'channels');
      unsubChannels = onSnapshot(channelsRef, (channelSnapshot) => {
        const fetchedChannels = channelSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((c: any) => channelIds.includes(c.id) && c.status === 'active');
        setChannels(fetchedChannels);
        setChannelsLoading(false);
      }, (error) => {
        console.error("Error fetching channels:", error);
        setChannelsLoading(false);
      });
    }, (error) => {
      console.error("Error fetching channel memberships:", error);
      setChannelsLoading(false);
    });

    return () => {"""

if old_fetch in content:
    content = content.replace(old_fetch, new_fetch)
    with open('src/ChatPage.tsx', 'w') as f:
        f.write(content)
    print("Patched ChatPage.tsx to handle onSnapshot errors.")
else:
    print("Could not find the target code in ChatPage.tsx.")
