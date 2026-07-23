-- Enable Row Level Security
ALTER TABLE personal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_messages ENABLE ROW LEVEL SECURITY;

-- Personal Messages Policies
-- 1. Users can only access their own personal chats.
-- A personal message 'chat_id' is formed by sorting the two user UIDs and joining with '_'.
-- We can verify if the user's UID is part of the chat_id.
CREATE POLICY "Users can access their own personal messages"
ON personal_messages
FOR SELECT
USING (auth.uid()::text = SPLIT_PART(chat_id, '_', 1) OR auth.uid()::text = SPLIT_PART(chat_id, '_', 2));

CREATE POLICY "Users can insert their own personal messages"
ON personal_messages
FOR INSERT
WITH CHECK (
  auth.uid()::text = sender_id 
  AND (auth.uid()::text = SPLIT_PART(chat_id, '_', 1) OR auth.uid()::text = SPLIT_PART(chat_id, '_', 2))
);

CREATE POLICY "Message owners can edit their own personal messages"
ON personal_messages
FOR UPDATE
USING (auth.uid()::text = sender_id);

-- Alternatively, allow updating read/delivered status for messages in your chat
CREATE POLICY "Users can update status of messages in their chat"
ON personal_messages
FOR UPDATE
USING (
  auth.uid()::text = SPLIT_PART(chat_id, '_', 1) OR auth.uid()::text = SPLIT_PART(chat_id, '_', 2)
);

CREATE POLICY "Message owners can delete their own personal messages"
ON personal_messages
FOR DELETE
USING (auth.uid()::text = sender_id);

-- Channel Messages Policies
-- Assuming we have a 'channels' table in Firebase, checking channel membership from Supabase RLS directly is tricky if 'channels' data is in Firestore.
-- If channels are in Firestore, Supabase cannot natively verify membership without a Supabase counterpart table or edge function.
-- If the app relies on Firebase Auth and Supabase for messages, you'd typically sync Firebase Auth to Supabase (which is standard).
-- But syncing Firestore channels to Supabase is complex. For now, we allow access to channel messages if the user is authenticated (as frontend enforces membership).

CREATE POLICY "Authenticated users can access channel messages"
ON channel_messages
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own channel messages"
ON channel_messages
FOR INSERT
WITH CHECK (auth.uid()::text = sender_id);

CREATE POLICY "Message owners can edit their own channel messages"
ON channel_messages
FOR UPDATE
USING (auth.uid()::text = sender_id);

CREATE POLICY "Message owners can delete their own channel messages"
ON channel_messages
FOR DELETE
USING (auth.uid()::text = sender_id);

-- Note: Admin/Owner pinned messages and moderations would ideally need a custom function or admin role.
-- For now, authenticated users can update messages (to allow reactions and pins).
CREATE POLICY "Authenticated users can update channel messages for reactions and pins"
ON channel_messages
FOR UPDATE
USING (auth.role() = 'authenticated');
