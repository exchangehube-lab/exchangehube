import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey);
    initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Admin SDK operations will fail.");
    initializeApp();
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

const db = getFirestore();
const auth = getAuth();
const app = express();

app.use(cors());
app.use(express.json());

// Middleware to verify Admin token
const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const adminDoc = await db.collection('Admin').doc(decodedToken.uid).get();
    
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin' || adminDoc.data()?.isActive !== true) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Create a new admin
app.post('/api/admins', verifyAdmin, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: 'ExchangeHube Admin',
    });

    await db.collection('Admin').doc(userRecord.uid).set({
      displayName: 'ExchangeHube Admin',
      email: email,
      role: 'admin',
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ message: 'Admin created successfully', uid: userRecord.uid });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return res.status(500).json({ error: error.message || 'Failed to create admin' });
  }
});

// Block/Unblock an admin
app.patch('/api/admins/:uid/status', verifyAdmin, async (req, res) => {
  const { uid } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'isActive must be a boolean' });
  }

  try {
    await db.collection('Admin').doc(uid).update({ isActive });
    return res.json({ message: `Admin ${isActive ? 'unblocked' : 'blocked'} successfully` });
  } catch (error: any) {
    console.error('Error updating admin status:', error);
    return res.status(500).json({ error: error.message || 'Failed to update admin status' });
  }
});

// Delete an admin
app.delete('/api/admins/:uid', verifyAdmin, async (req, res) => {
  const { uid } = req.params;

  try {
    await auth.deleteUser(uid);
    await db.collection('Admin').doc(uid).delete();
    return res.json({ message: 'Admin deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete admin' });
  }
});


// Proxy send-message to Supabase Edge Function to bypass CORS during development
app.post('/api/send-message', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const response = await fetch('https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error:', errorText);
      return res.status(response.status).json({ error: 'Failed to send message', details: errorText });
    }
    
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return res.json(data);
    } catch(e) {
      return res.json({ success: true, text });
    }
  } catch (error) {
    console.error('Error proxying message:', error);
    return res.status(500).json({ error: error.message || 'Failed to proxy message' });
  }
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', async (req, res) => {
      try {
        let html = await require('fs').promises.readFile(path.join(distPath, 'index.html'), 'utf-8');
        const envScript = `<script>window.__ENV__ = ${JSON.stringify({
          SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
        })}</script>`;
        html = html.replace('<head>', '<head>' + envScript);
        res.send(html);
      } catch (err) {
        res.status(500).send('Error loading index.html');
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
