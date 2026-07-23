const fs = require('fs');

let content = fs.readFileSync('src/AdminManagementPage.tsx', 'utf-8');

if (!content.includes('onSnapshot')) {
  content = content.replace("import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';", "import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';");
}

const fetchRegex = /const fetchAdmins = async \(\) => \{[\s\S]*?(?=\};)/;

const newFetch = `useEffect(() => {
    setIsLoading(true);
    const unsub = onSnapshot(collection(db, 'Admin'), (snapshot) => {
      const fetchedAdmins = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAdmins(fetchedAdmins);

      if (auth.currentUser) {
        const current = fetchedAdmins.find(a => a.id === auth.currentUser?.uid);
        if (current) {
          setCurrentUserData(current);
        }
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching admins:", err);
      setIsLoading(false);
    });
    
    return () => unsub();
  }, []);

  const fetchAdmins = async () => {};`;

content = content.replace(fetchRegex, newFetch);
content = content.replace(/useEffect\(\(\) => \{\s*fetchAdmins\(\);\s*\}, \[\]\);/, "");
fs.writeFileSync('src/AdminManagementPage.tsx', content);
