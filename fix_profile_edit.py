import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_profile_check = """      try {
        const q = query(collection(db, 'users'), where('username', '==', setupUsername));
        const snapshot = await getCountFromServer(q);
        if (snapshot.data().count > 0) {
          setSetupError('Username already taken.');
          setIsSetupSaving(false);
          return;
        }
      } catch (checkErr: any) {"""

new_profile_check = """      try {
        const q = query(collection(db, 'users'), where('username', '==', setupUsername));
        const { getDocs } = await import('firebase/firestore');
        const snapshot = await getDocs(q);
        const isTaken = snapshot.docs.some(doc => doc.id !== user.uid);
        if (isTaken) {
          setSetupError('Username already taken.');
          setIsSetupSaving(false);
          return;
        }
      } catch (checkErr: any) {"""

content = content.replace(old_profile_check, new_profile_check)

old_profile_double_check = """      // double check before write
      const q2 = query(collection(db, 'users'), where('username', '==', setupUsername));
      const snapshot2 = await getCountFromServer(q2);
      if (snapshot2.data().count > 0) {
        throw new Error("USERNAME_TAKEN");
      }"""

new_profile_double_check = """      // double check before write
      const q2 = query(collection(db, 'users'), where('username', '==', setupUsername));
      const { getDocs: getDocs2 } = await import('firebase/firestore');
      const snapshot2 = await getDocs2(q2);
      const isTaken2 = snapshot2.docs.some(doc => doc.id !== user.uid);
      if (isTaken2) {
        throw new Error("USERNAME_TAKEN");
      }"""

content = content.replace(old_profile_double_check, new_profile_double_check)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
