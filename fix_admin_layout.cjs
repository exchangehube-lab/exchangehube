const fs = require('fs');

let adminContent = fs.readFileSync('src/AdminPages.tsx', 'utf-8');

const regex = /useEffect\(\(\) => \{\s*const unsubscribe = onAuthStateChanged\(auth, async \(currentUser\) => \{[\s\S]*?return \(\) => unsubscribe\(\);\s*\}, \[navigate\]\);/m;

const newAdminEffect = `useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/admin-login');
      } else {
        try {
          const docRef = doc(db, 'Admin', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            navigate('/');
            return;
          }
          
          const data = docSnap.data();
          if (data.role !== 'admin' || data.isActive !== true) {
            navigate('/');
            return;
          }
          
          setUser(currentUser);
          setIsAuthChecking(false);
        } catch (err: any) {
          console.error("Admin check error:", err);
          navigate('/');
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);`;

adminContent = adminContent.replace(regex, newAdminEffect);
fs.writeFileSync('src/AdminPages.tsx', adminContent);
