import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_fetch = """  // Fetch joined channels
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
      }, (error) => {
        console.error("Error fetching channels:", error);
        setChannelsLoading(false);
      });
    }, (error) => {
      console.error("Error fetching channel memberships:", error);
      setChannelsLoading(false);
    });

    return () => {
      unsubMembers();
      if (unsubChannels) {
        unsubChannels();
      }
    };
  }, [currentUser]);"""

new_fetch = """  // Fetch joined channels
  useEffect(() => {
    if (!currentUser) {
      setChannels([]);
      setChannelsLoading(false);
      return;
    }

    const channelsRef = collection(db, 'channels');
    const qChannels = query(channelsRef, where('members', 'array-contains', currentUser.uid));
    
    const unsubChannels = onSnapshot(qChannels, (snapshot) => {
      const fetchedChannels = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((c: any) => c.status === 'active');
      setChannels(fetchedChannels);
      setChannelsLoading(false);
    }, (error) => {
      console.error("Error fetching channels:", error);
      setChannelsLoading(false);
    });

    return () => unsubChannels();
  }, [currentUser]);"""

if old_fetch in content:
    content = content.replace(old_fetch, new_fetch)
    with open('src/ChatPage.tsx', 'w') as f:
        f.write(content)
    print("ChatPage.tsx fetch patched successfully.")
else:
    print("Could not find the target code in ChatPage.tsx fetch.")
