const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /useEffect\(\(\) => \{\s*const unsubscribe = onAuthStateChanged\(auth, \(user\) => \{\s*if \(user\) \{\s*const lastPage = localStorage\.getItem\('last_visited_page'\) \|\| '\/charts';\s*navigate\(lastPage\);\s*\} else \{\s*setIsAuthChecking\(false\);\s*\}\s*\}\);\s*return \(\) => unsubscribe\(\);\s*\}, \[navigate\]\);/m;

const newSignupEffect = `  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'Admin', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.role === 'admin' && data.isActive === true) {
              navigate('/Admin/dashboard');
              return;
            }
          }
        } catch (err) {
          console.error("Admin check error:", err);
        }
        
        const lastPage = localStorage.getItem('last_visited_page') || '/charts';
        navigate(lastPage);
      } else {
        setIsAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);`;

appContent = appContent.replace(regex, newSignupEffect);
fs.writeFileSync('src/App.tsx', appContent);
