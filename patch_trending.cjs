const fs = require('fs');
let content = fs.readFileSync('src/DashboardPages.tsx', 'utf-8');

const targetTrendingEffect = `  useEffect(() => {
    const botsRef = collection(db, 'bots');
    const q = query(botsRef, where("status", "==", "approved"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const botsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBots(botsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching trending bots:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);`;

const newTrendingEffect = `  useEffect(() => {
    const botsRef = collection(db, 'bots');
    const q = query(botsRef, where("status", "==", "approved"));
    
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
      
      setBots(botsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching trending bots:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);`;

content = content.replace(targetTrendingEffect, newTrendingEffect);
fs.writeFileSync('src/DashboardPages.tsx', content);
console.log("Updated TrendingBotsPage!");
