import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

bad = """          if (user) {
            import { doc, updateDoc } from "firebase/firestore";
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { profilePhotoURL: '' });
            setProfile(prev => prev ? { ...prev, profilePhotoURL: '' } : null);
          }"""

good = """          if (user) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { profilePhotoURL: '' });
            setProfile(prev => prev ? { ...prev, profilePhotoURL: '' } : null);
          }"""

content = content.replace(bad, good)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
