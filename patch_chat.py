import re

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_effect = """  useEffect(() => {
    let unsubChannels: (() => void) | undefined;

    const unsubAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      
      if (unsubChannels) {
        unsubChannels();
        unsubChannels = undefined;
      }

      if (!user) {
        setChannels([]);
        setChannelsLoading(false);
        return;
      }

      const channelsRef = collection(db, 'channels');
      const qChannels = query(channelsRef, where('members', 'array-contains', user.uid));
      
      unsubChannels = onSnapshot(qChannels, (snapshot) => {
        const fetchedChannels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChannels(fetchedChannels);
        setChannelsLoading(false);
      }, (error) => {
        console.error("Error fetching channels:", error);
        setChannelsLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubChannels) {
        unsubChannels();
      }
    };
  }, []);"""

new_effect = """  useEffect(() => {
    let unsubChannels: (() => void) | undefined;
    let isMounted = true;

    const setupListener = (user: any) => {
      if (unsubChannels) {
        unsubChannels();
        unsubChannels = undefined;
      }

      if (!user || !user.uid) {
        if (isMounted) {
          setChannels([]);
          setChannelsLoading(false);
        }
        return;
      }

      const channelsRef = collection(db, 'channels');
      const qChannels = query(channelsRef, where('members', 'array-contains', user.uid));
      
      unsubChannels = onSnapshot(qChannels, (snapshot) => {
        if (!isMounted) return;
        const fetchedChannels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChannels(fetchedChannels);
        setChannelsLoading(false);
      }, (error) => {
        console.error("Error fetching channels:", error);
        if (isMounted) setChannelsLoading(false);
      });
    };

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!isMounted) return;
      setCurrentUser(user);
      setupListener(user);
    });

    return () => {
      isMounted = false;
      unsubAuth();
      if (unsubChannels) {
        unsubChannels();
      }
    };
  }, []);"""

if old_effect in content:
    content = content.replace(old_effect, new_effect)
    with open('src/ChatPage.tsx', 'w') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Could not find effect block")

