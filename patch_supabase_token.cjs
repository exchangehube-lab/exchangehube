const fs = require('fs');

let code = `import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

let _supabase: SupabaseClient | null = null;
let currentToken: string | null = null;

export function getSupabaseUrl(): string {
  let url = (import.meta as any).env.SUPABASE_URL || (import.meta as any).env.VITE_SUPABASE_URL;
  if (!url && (window as any).__ENV__) {
    url = (window as any).__ENV__.SUPABASE_URL;
  }
  return url || '';
}

export function getSupabaseAnonKey(): string {
  let key = (import.meta as any).env.SUPABASE_ANON_KEY || (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  if (!key && (window as any).__ENV__) {
    key = (window as any).__ENV__.SUPABASE_ANON_KEY;
  }
  return key || '';
}

const createMockSupabase = (): SupabaseClient => {
  const mockQuery: any = {
    select: () => mockQuery,
    insert: () => mockQuery,
    upsert: () => mockQuery,
    update: () => mockQuery,
    delete: () => mockQuery,
    eq: () => mockQuery,
    neq: () => mockQuery,
    is: () => mockQuery,
    order: () => mockQuery,
    limit: () => mockQuery,
    single: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: [], error: null })
  };
  const mockChannel: any = {
    on: () => mockChannel,
    subscribe: () => mockChannel,
    unsubscribe: () => Promise.resolve()
  };
  return {
    from: () => mockQuery,
    channel: () => mockChannel,
    removeChannel: () => Promise.resolve(),
    realtime: { setAuth: () => {} }
  } as unknown as SupabaseClient;
};

// Use a custom fetch so that every REST request includes the latest Firebase token
const customFetch = async (url: RequestInfo | URL, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  if (currentToken) {
    headers.set('Authorization', \`Bearer \${currentToken}\`);
    headers.set('X-Firebase-Token', currentToken);
  }
  return fetch(url, {
    ...options,
    headers
  });
};

function initClient(): SupabaseClient {
  let supabaseUrl = getSupabaseUrl();
  let supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL and Anon Key are missing. Using mock client.');
    return createMockSupabase();
  } else {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: customFetch
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      }
    });
  }
}

function getClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = initClient();

    // Listen to Firebase auth changes to keep token updated
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          currentToken = token;
          // Also set the token for Realtime WebSockets
          if (_supabase && _supabase.realtime) {
            _supabase.realtime.setAuth(token);
          }
        } catch (err) {
          console.error("Failed to get Firebase token for Supabase:", err);
          currentToken = null;
        }
      } else {
        currentToken = null;
        if (_supabase && _supabase.realtime) {
          _supabase.realtime.setAuth(null);
        }
      }
    });
  }
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    return Reflect.get(getClient(), prop);
  }
});
`;

fs.writeFileSync('src/messaging/supabase.ts', code);
