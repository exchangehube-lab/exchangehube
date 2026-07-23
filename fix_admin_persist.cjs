const fs = require('fs');

// 1. Update App.tsx (Home component)
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
const oldHomeEffect = `  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const lastPage = localStorage.getItem('last_visited_page') || '/charts';
        navigate(lastPage);
      } else {
        setUser(currentUser);
        setIsAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);`;

const newHomeEffect = `  useEffect(() => {
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
        setUser(currentUser);
        setIsAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);`;
appContent = appContent.replace(oldHomeEffect, newHomeEffect);
fs.writeFileSync('src/App.tsx', appContent);

// 2. Update DashboardPages.tsx
let dashboardContent = fs.readFileSync('src/DashboardPages.tsx', 'utf-8');
const oldDashboardEffect = `  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/');
      } else {
        setUser(currentUser);
        setIsAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);`;

const newDashboardEffect = `  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/');
      } else {
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
        setUser(currentUser);
        setIsAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);`;
dashboardContent = dashboardContent.replace(oldDashboardEffect, newDashboardEffect);
fs.writeFileSync('src/DashboardPages.tsx', dashboardContent);

// 3. Update AdminPages.tsx (AdminLayout)
let adminContent = fs.readFileSync('src/AdminPages.tsx', 'utf-8');
const oldAdminEffect = `  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/admin-login');
      } else {
        try {
          const docRef = doc(db, 'Admin', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            await signOut(auth);
            navigate('/admin-login?error=not-admin');
            return;
          }
          
          const data = docSnap.data();
          if (data.role !== 'admin' || data.isActive !== true) {
            await signOut(auth);
            navigate('/admin-login?error=denied');
            return;
          }
          
          setUser(currentUser);
          setIsAuthChecking(false);
        } catch (err: any) {
          console.error("Admin check error:", err);
          await signOut(auth);
          if (err.code === 'permission-denied') {
            navigate('/admin-login?error=permission-denied');
          } else {
            navigate('/admin-login?error=error');
          }
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);`;

const newAdminEffect = `  useEffect(() => {
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
adminContent = adminContent.replace(oldAdminEffect, newAdminEffect);
fs.writeFileSync('src/AdminPages.tsx', adminContent);

