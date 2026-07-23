const fs = require('fs');
let content = fs.readFileSync('src/DashboardPages.tsx', 'utf-8');

const targetEffect = `  useEffect(() => {
    if (!auth.currentUser) {
      setLoadingBots(false);
      return;
    }

    const botsRef = collection(db, 'bots');
    const q = query(botsRef, where("ownerUid", "==", auth.currentUser.uid), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const botsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMyBots(botsData);
      setLoadingBots(false);
    }, (error) => {
      console.error("Error fetching user bots:", error);
      setLoadingBots(false);
    });

    return () => unsubscribe();
  }, []);`;

const newEffect = `  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const botsRef = collection(db, 'bots');
        const q = query(botsRef, where("ownerUid", "==", user.uid));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const botsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          // Sort in memory to avoid needing a composite index
          botsData.sort((a: any, b: any) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
          });
          setMyBots(botsData);
          setLoadingBots(false);
        }, (error) => {
          console.error("Error fetching user bots:", error);
          setLoadingBots(false);
        });
        
        return () => unsubscribe();
      } else {
        setLoadingBots(false);
        setMyBots([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);`;

content = content.replace(targetEffect, newEffect);
fs.writeFileSync('src/DashboardPages.tsx', content);
console.log("Updated useEffect!");
