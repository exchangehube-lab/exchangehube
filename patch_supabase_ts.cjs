const fs = require('fs');
let code = fs.readFileSync('src/messaging/supabase.ts', 'utf8');

code = code.replace(
  "_supabase = createClient(supabaseUrl, supabaseAnonKey);",
  `_supabase = createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        }
      });`
);

fs.writeFileSync('src/messaging/supabase.ts', code);
