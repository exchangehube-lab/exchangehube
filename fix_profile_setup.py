import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_profile_setup = """    try {
      const usernameDocRef = doc(db, 'usernames', normalizedUsername);
      const userRef = doc(db, 'users', user.uid);

      try {
        const usernameSnap = await getDoc(usernameDocRef);
        if (usernameSnap.exists()) {
          setSetupError('Username ID already taken.');
          setIsSetupSaving(false);
          return;
        }
      } catch (checkErr: any) {
        setSetupError(`Error: ${checkErr.code} - ${checkErr.message}`);
        setIsSetupSaving(false);
        return;
      }

      let finalPhotoURL = '';
      if (setupPhotoFile) {
        try {
          finalPhotoURL = await uploadToCloudinary(setupPhotoFile);
        } catch (uploadErr: any) {
          console.error("Photo upload error:", uploadErr);
          setSetupError(`Failed to upload photo: ${uploadErr.message}`);
          setIsSetupSaving(false);
          return;
        }
      } else if (user.photoURL) {
        finalPhotoURL = user.photoURL; // fallback to google photo if they didn't upload custom
      }

      const { runTransaction, serverTimestamp } = await import('firebase/firestore');
      
      await runTransaction(db, async (transaction) => {
        const usernameDoc = await transaction.get(usernameDocRef);
        if (usernameDoc.exists()) {
          throw new Error("USERNAME_TAKEN");
        }
        
        const userData: any = {
          uid: user.uid,
          fullName: setupFullName,
          username: setupUsername,
          normalizedUsername: normalizedUsername,
          email: user.email || '',
          role: "user",
          createdAt: serverTimestamp()
        };
        
        if (finalPhotoURL) {
          userData.profilePhotoURL = finalPhotoURL;
        }
        
        transaction.set(userRef, userData);
        
        transaction.set(usernameDocRef, {
          uid: user.uid,
          username: setupUsername,
          createdAt: serverTimestamp()
        });
      });"""

new_profile_setup = """    try {
      const userRef = doc(db, 'users', user.uid);

      try {
        const q = query(collection(db, 'users'), where('username', '==', setupUsername));
        const snapshot = await getCountFromServer(q);
        if (snapshot.data().count > 0) {
          setSetupError('Username already taken.');
          setIsSetupSaving(false);
          return;
        }
      } catch (checkErr: any) {
        setSetupError(`Error: ${checkErr.code} - ${checkErr.message}`);
        setIsSetupSaving(false);
        return;
      }

      let finalPhotoURL = '';
      if (setupPhotoFile) {
        try {
          finalPhotoURL = await uploadToCloudinary(setupPhotoFile);
        } catch (uploadErr: any) {
          console.error("Photo upload error:", uploadErr);
          setSetupError(`Failed to upload photo: ${uploadErr.message}`);
          setIsSetupSaving(false);
          return;
        }
      } else if (user.photoURL) {
        finalPhotoURL = user.photoURL; // fallback to google photo if they didn't upload custom
      }
      
      const { serverTimestamp } = await import('firebase/firestore');
      
      // double check before write
      const q2 = query(collection(db, 'users'), where('username', '==', setupUsername));
      const snapshot2 = await getCountFromServer(q2);
      if (snapshot2.data().count > 0) {
        throw new Error("USERNAME_TAKEN");
      }
        
      const userData: any = {
        uid: user.uid,
        fullName: setupFullName,
        username: setupUsername,
        normalizedUsername: normalizedUsername,
        email: user.email || '',
        role: "user",
        createdAt: serverTimestamp()
      };
      
      if (finalPhotoURL) {
        userData.profilePhotoURL = finalPhotoURL;
      }
      
      await updateDoc(userRef, userData).catch(async (e) => {
         if (e.code === 'not-found') {
            const { setDoc } = await import('firebase/firestore');
            await setDoc(userRef, userData);
         } else {
            throw e;
         }
      });"""

content = content.replace(old_profile_setup, new_profile_setup)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)

