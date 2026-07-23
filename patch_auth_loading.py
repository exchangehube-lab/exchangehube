import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_auth = """  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);"""

new_auth = """  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsub();
  }, []);"""

if old_auth in content:
    content = content.replace(old_auth, new_auth)
    print("Replaced auth effect")
else:
    print("Could not find auth effect")

old_fetch = """  // Fetch joined channels
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

new_fetch = """  // Fetch joined channels
  useEffect(() => {
    if (isAuthLoading) return;
    if (!currentUser) {
      setChannels([]);
      setChannelsLoading(false);
      return;
    }

    const channelsRef = collection(db, 'channels');
    const qChannels = query(channelsRef, where('members', 'array-contains', currentUser.uid));
    
    const unsubChannels = onSnapshot(qChannels, (snapshot) => {
      const fetchedChannels = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setChannels(fetchedChannels);
      setChannelsLoading(false);
    }, (error) => {
      console.error("Error fetching channels:", error);
      setChannelsLoading(false);
    });

    return () => unsubChannels();
  }, [currentUser, isAuthLoading]);"""

if old_fetch in content:
    content = content.replace(old_fetch, new_fetch)
    print("Replaced fetch effect")
else:
    print("Could not find fetch effect")

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)
