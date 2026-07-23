import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Fix checkUsername
old_check = """      setUsernameStatus('checking');
      try {
        const usernameDocRef = doc(db, 'usernames', normalized);
        const usernameSnap = await getDoc(usernameDocRef);
        if (usernameSnap.exists()) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('available');
        }
      } catch (err: any) {
        console.warn("Firestore Error:", {
          errorCode: err.code,
          errorMessage: err.message,
          operationType: "getDoc",
          collectionPath: `usernames/${normalized}`,
          isAuthenticated: !!auth.currentUser
        });
        setUsernameStatus('idle');
      }"""

new_check = """      setUsernameStatus('checking');
      try {
        const q = query(collection(db, 'users'), where('username', '==', signUpUsername));
        const snapshot = await getCountFromServer(q);
        if (snapshot.data().count > 0) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('available');
        }
      } catch (err: any) {
        console.warn("Firestore Error:", err);
        setUsernameStatus('idle');
      }"""
content = content.replace(old_check, new_check)

# 2. Fix signUp submit
old_signup = """    try {
      const usernameDocRef = doc(db, 'usernames', normalizedUsername);
      
      // Initial check before Auth
      try {
        const usernameSnap = await getDoc(usernameDocRef);
        if (usernameSnap.exists()) {
          setSignUpError('Username ID already taken. Please choose another.');
          setIsSignUpLoading(false);
          return;
        }
      } catch (checkErr: any) {
        console.warn("Firestore Check Error:", {
          errorCode: checkErr.code,
          errorMessage: checkErr.message,
          operationType: "getDoc",
          collectionPath: `usernames/${normalizedUsername}`,
          isAuthenticated: !!auth.currentUser
        });
        setSignUpError(`Error: ${checkErr.code} - ${checkErr.message}`);
        setIsSignUpLoading(false);
        return;
      }
      
      // Create the Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      const user = userCredential.user;
      
      try {
        // Atomic transaction for ownership and profile
        await runTransaction(db, async (transaction) => {
          const usernameDoc = await transaction.get(usernameDocRef);
          if (usernameDoc.exists()) {
            throw new Error("USERNAME_TAKEN");
          }
          
          const userRef = doc(db, 'users', user.uid);
          
          transaction.set(userRef, {
            uid: user.uid,
            fullName: signUpName,
            username: signUpUsername,
            normalizedUsername: normalizedUsername,
            email: signUpEmail,
            role: "user",
            createdAt: serverTimestamp()
          });
          
          transaction.set(usernameDocRef, {
            uid: user.uid,
            username: signUpUsername,
            createdAt: serverTimestamp()
          });
        });
        
        const lastPage = localStorage.getItem('last_visited_page') || '/charts';
        navigate(lastPage);
      } catch (transactionErr: any) {
        // Rollback Auth user if transaction fails
        await user.delete().catch(console.error);
        console.error("Firestore Transaction Error:", {
          errorCode: transactionErr.code,
          errorMessage: transactionErr.message,
          operationType: "transaction","""

new_signup = """    try {
      // Initial check before Auth
      try {
        const q = query(collection(db, 'users'), where('username', '==', signUpUsername));
        const snapshot = await getCountFromServer(q);
        if (snapshot.data().count > 0) {
          setSignUpError('Username already taken. Please choose another.');
          setIsSignUpLoading(false);
          return;
        }
      } catch (checkErr: any) {
        console.warn("Firestore Check Error:", checkErr);
        setSignUpError(`Error: ${checkErr.code} - ${checkErr.message}`);
        setIsSignUpLoading(false);
        return;
      }
      
      // Create the Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      const user = userCredential.user;
      
      try {
        // Double check after auth
        const q = query(collection(db, 'users'), where('username', '==', signUpUsername));
        const snapshot = await getCountFromServer(q);
        if (snapshot.data().count > 0) {
          throw new Error("USERNAME_TAKEN");
        }
        
        const userRef = doc(db, 'users', user.uid);
        
        await setDoc(userRef, {
          uid: user.uid,
          fullName: signUpName,
          username: signUpUsername,
          normalizedUsername: normalizedUsername,
          email: signUpEmail,
          role: "user",
          createdAt: serverTimestamp()
        });
        
        const lastPage = localStorage.getItem('last_visited_page') || '/charts';
        navigate(lastPage);
      } catch (transactionErr: any) {
        // Rollback Auth user if transaction fails
        await user.delete().catch(console.error);
        console.error("Firestore Error:", {"""

content = content.replace(old_signup, new_signup)

with open('src/App.tsx', 'w') as f:
    f.write(content)

