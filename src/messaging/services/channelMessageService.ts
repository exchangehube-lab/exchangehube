
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { ChannelMessage } from '../types';

export const channelMessageService = {
  async getMessages(channelId: string): Promise<ChannelMessage[]> {
    const q = query(
      collection(db, 'channel_messages'),
      where('channel_id', '==', channelId)
    );
    const snap = await getDocs(q);
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChannelMessage));
    return msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async sendMessage(message: Omit<ChannelMessage, 'id' | 'created_at'>): Promise<ChannelMessage> {
    const data = {
      ...message,
      created_at: new Date().toISOString()
    };
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    const docRef = await addDoc(collection(db, 'channel_messages'), cleanData);
    return { id: docRef.id, ...message, created_at: new Date().toISOString() } as ChannelMessage;
  },

  async updateReactions(messageId: string, reactions: Record<string, string[]>) {
    await updateDoc(doc(db, 'channel_messages', messageId), { reactions });
  },

  async deleteMessage(messageId: string) {
    await updateDoc(doc(db, 'channel_messages', messageId), { 
      deleted: true, 
      content: 'This message was deleted', 
      message_type: 'text', 
      file_url: null, 
      voice_url: null 
    });
  },

  async pinMessage(messageId: string, pinned: boolean) {
    await updateDoc(doc(db, 'channel_messages', messageId), { pinned });
  },

  async editMessage(messageId: string, newContent: string) {
    await updateDoc(doc(db, 'channel_messages', messageId), { 
      content: newContent, 
      edited: true, 
      edited_at: new Date().toISOString() 
    });
  },

  subscribeToChannel(channelId: string, callback: (payload: any) => void) {
    const q = query(
      collection(db, 'channel_messages'),
      where('channel_id', '==', channelId)
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
      console.error("Error subscribing to channel messages:", error);
    });
    return { unsubscribe: unsub };
  },

  unsubscribe(subscription: any) {
    if (subscription && typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe();
    }
  }
};
