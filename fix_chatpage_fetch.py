import sys
import re

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_fetch = """  // Fetch joined channels
  useEffect(() => {
    if (!currentUser) {
      setChannels([]);
      return;
    }

    const membersRef = collection(db, 'channel_members');
    const qMembers = query(membersRef, where('userId', '==', currentUser.uid));
    
    const unsubMembers = onSnapshot(qMembers, (memberSnapshot) => {
      const channelIds = memberSnapshot.docs.map(doc => doc.data().channelId);
      
      if (channelIds.length === 0) {
        setChannels([]);
        setChannelsLoading(false);
        return;
      }
      
      const channelsRef = collection(db, 'channels');
      // To get real-time updates for the channels, we can listen to the channels collection
      // and filter it, or use multiple onSnapshots. For simplicity and since array-contains-any 
      // is limited to 10, we'll fetch all active channels and filter by our joined IDs.
      const unsubChannels = onSnapshot(channelsRef, (channelSnapshot) => {
        const fetchedChannels = channelSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((c: any) => channelIds.includes(c.id) && c.status === 'active');
        setChannels(fetchedChannels);
        setChannelsLoading(false);
      });
      
      return () => unsubChannels();
    });

    return () => unsubMembers();
  }, [currentUser]);"""

new_fetch = """  // Fetch joined channels
  useEffect(() => {
    if (!currentUser) {
      setChannels([]);
      return;
    }

    let unsubChannels: (() => void) | null = null;
    const membersRef = collection(db, 'channel_members');
    const qMembers = query(membersRef, where('userId', '==', currentUser.uid));
    
    const unsubMembers = onSnapshot(qMembers, (memberSnapshot) => {
      const channelIds = memberSnapshot.docs.map(doc => doc.data().channelId);
      
      if (unsubChannels) {
        unsubChannels();
        unsubChannels = null;
      }

      if (channelIds.length === 0) {
        setChannels([]);
        setChannelsLoading(false);
        return;
      }
      
      const channelsRef = collection(db, 'channels');
      unsubChannels = onSnapshot(channelsRef, (channelSnapshot) => {
        const fetchedChannels = channelSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((c: any) => channelIds.includes(c.id) && c.status === 'active');
        setChannels(fetchedChannels);
        setChannelsLoading(false);
      });
    });

    return () => {
      unsubMembers();
      if (unsubChannels) {
        unsubChannels();
      }
    };
  }, [currentUser]);"""

if old_fetch in content:
    content = content.replace(old_fetch, new_fetch)
    with open('src/ChatPage.tsx', 'w') as f:
        f.write(content)
    print("ChatPage.tsx inner listener leak fixed.")
else:
    print("Could not find the target code to fix leak in ChatPage.tsx.")
