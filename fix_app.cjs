const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    setIsSignUpLoading(true);

    try {
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
        setSignUpError(\`Error: \${checkErr.code} - \${checkErr.message}\`);
        setIsSignUpLoading(false);
        return;
      }
      
      // Create the Firebase Authentication account`;

const replacement = `    setIsSignUpLoading(true);

    try {
      // Create the Firebase Authentication account`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Success");
} else {
    console.log("Target not found");
}
