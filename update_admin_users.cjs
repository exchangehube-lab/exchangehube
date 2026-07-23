const fs = require('fs');

let content = fs.readFileSync('src/AdminUsersPage.tsx', 'utf-8');

// replace getDocs with onSnapshot
if (!content.includes('onSnapshot')) {
  content = content.replace("import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';", "import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore';");
}

const fetchRegex = /const fetchUsers = async \(\) => \{[\s\S]*?(?=\};)/;

const newFetch = `useEffect(() => {
    setIsLoading(true);
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(fetchedUsers);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching users:", err);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Remove the old fetchUsers function
  const fetchUsers = async () => {};`;

content = content.replace(fetchRegex, newFetch);

// we also need to remove the existing `useEffect(() => { fetchUsers(); }, []);`
content = content.replace(/useEffect\(\(\) => \{\s*fetchUsers\(\);\s*\}, \[\]\);/, "");

fs.writeFileSync('src/AdminUsersPage.tsx', content);
