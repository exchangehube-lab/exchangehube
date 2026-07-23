const fs = require('fs');

let code = `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-firebase-token',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let token = req.headers.get('x-firebase-token');
    
    if (!token) {
      // Fallback: check Authorization header if x-firebase-token is not present
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing x-firebase-token header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Decode the Firebase JWT payload to extract the UID
    const base64Url = token.split('.')[1];
    if (!base64Url) throw new Error('Invalid JWT format');
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const decodedToken = JSON.parse(jsonPayload);
    const uid = decodedToken.user_id || decodedToken.sub;

    if (!uid) {
      return new Response(JSON.stringify({ error: 'Invalid token payload' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { 
      conversation_id, channel_id, sender_uid, sender_id,
      message, content, message_type, 
      file_url, voice_url, file_name, file_size, voice_duration, reply_to 
    } = body;

    const actualSenderId = sender_uid || sender_id;
    if (actualSenderId !== uid) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Sender UID does not match token UID' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let data, error;

    if (conversation_id) {
      const res = await supabase.from('personal_messages').insert([{
        conversation_id: conversation_id,
        sender_uid: actualSenderId,
        content: message || content || '',
        message_type: message_type || 'text',
        file_url, voice_url, file_name, file_size, voice_duration, reply_to
      }]).select().single();
      
      data = res.data; 
      error = res.error;
    } else if (channel_id) {
      const res = await supabase.from('channel_messages').insert([{
        channel_id: channel_id,
        sender_uid: actualSenderId,
        content: message || content || '',
        message_type: message_type || 'text',
        file_url, voice_url, file_name, file_size, voice_duration, reply_to
      }]).select().single();
      
      data = res.data; 
      error = res.error;
    } else {
      throw new Error('Must provide either conversation_id or channel_id');
    }

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
`;
fs.writeFileSync('supabase/functions/send-message/index.ts', code);
