const fs = require('fs');

const code = `
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDocs, limit, setDoc } from 'firebase/firestore';
import { PersonalMessage } from '../types';

export const personalMessageService = {
  async getRecentConversations(): Promise<PersonalMessage[]> {
    // This requires a composite index, fallback to simple for now
    const q = query(
      collection(db, 'personal_messages'),
      orderBy('created_at', 'desc'),
      limit(100)
    );
    const snap = await getDocs(q);
    const uniqueChats = new Map<string, PersonalMessage>();
    snap.docs.forEach(d => {
      const msg = { id: d.id, ...d.data() } as PersonalMessage;
      if (!uniqueChats.has(msg.conversation_id)) {
        uniqueChats.set(msg.conversation_id, msg);
      }
    });
    return Array.from(uniqueChats.values());
  },

  async getMessages(chatId: string): Promise<PersonalMessage[]> {
    const q = query(
      collection(db, 'personal_messages'),
      where('conversation_id', '==', chatId),
      orderBy('created_at', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PersonalMessage));
  },

  async sendMessage(message: Omit<PersonalMessage, 'id' | 'created_at' | 'is_read' | 'delivered' | 'delivered_at' | 'seen' | 'seen_at'>): Promise<PersonalMessage> {
    const docRef = await addDoc(collection(db, 'personal_messages'), {
      ...message,
      created_at: new Date().toISOString(),
      is_read: false,
      delivered: false,
      seen: false
    });
    return { id: docRef.id, ...message, created_at: new Date().toISOString() } as PersonalMessage;
  },

  async updateReactions(messageId: string, reactions: Record<string, string[]>) {
    await updateDoc(doc(db, 'personal_messages', messageId), { reactions });
  },

  async deleteMessage(messageId: string, forAll: boolean) {
    const updateData = forAll 
      ? { deleted_for_all: true, content: 'This message was deleted', message_type: 'text', file_url: null, voice_url: null }
      : { deleted: true };
    await updateDoc(doc(db, 'personal_messages', messageId), updateData);
  },

  async pinMessage(messageId: string, pinned: boolean) {
    await updateDoc(doc(db, 'personal_messages', messageId), { pinned });
  },

  async editMessage(messageId: string, newContent: string) {
    await updateDoc(doc(db, 'personal_messages', messageId), { 
      content: newContent, 
      edited: true, 
      edited_at: new Date().toISOString() 
    });
  },

  async markAsDelivered(chatId: string, userId: string) {
    const q = query(
      collection(db, 'personal_messages'),
      where('conversation_id', '==', chatId),
      where('delivered', '==', false)
    );
    const snap = await getDocs(q);
    const batch = [];
    snap.docs.forEach(d => {
      const data = d.data();
      if (data.sender_uid !== userId) {
        batch.push(updateDoc(doc(db, 'personal_messages', d.id), { delivered: true, delivered_at: new Date().toISOString() }));
      }
    });
    await Promise.all(batch);
  },

  async markAsRead(chatId: string, userId: string) {
    const q = query(
      collection(db, 'personal_messages'),
      where('conversation_id', '==', chatId),
      where('is_read', '==', false)
    );
    const snap = await getDocs(q);
    const batch = [];
    snap.docs.forEach(d => {
      const data = d.data();
      if (data.sender_uid !== userId) {
        batch.push(updateDoc(doc(db, 'personal_messages', d.id), { is_read: true, seen: true, seen_at: new Date().toISOString() }));
      }
    });
    await Promise.all(batch);
  },

  subscribeToChat(chatId: string, callback: (payload: any) => void) {
    const q = query(
      collection(db, 'personal_messages'),
      where('conversation_id', '==', chatId),
      orderBy('created_at', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const payload = {
          eventType: change.type === 'added' ? 'INSERT' : change.type === 'modified' ? 'UPDATE' : 'DELETE',
          new: change.type !== 'removed' ? { id: change.doc.id, ...change.doc.data() } : null,
          old: change.type === 'removed' ? { id: change.doc.id } : null
        };
        callback(payload);
      });
    }, (error) => {
      console.error("Error subscribing to personal messages:", error);
    });
    return { unsubscribe: unsub };
  },

  unsubscribe(subscription: any) {
    if (subscription && typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe();
    }
  }
};
`;

fs.writeFileSync('src/messaging/services/personalMessageService.ts', code);
