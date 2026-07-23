import React, { useState } from 'react';
import { X, Image as ImageIcon, FileText, Mic, Link as LinkIcon, Download, Play } from 'lucide-react';
import { format } from 'date-fns';

interface SharedMediaSidebarProps {
  messages: any[];
  userProfiles: Record<string, any>;
  currentUserId: string;
  onClose: () => void;
}

export function SharedMediaSidebar({ messages, userProfiles, currentUserId, onClose }: SharedMediaSidebarProps) {
  const [activeTab, setActiveTab] = useState<'media' | 'docs' | 'voice' | 'links'>('media');
  const [fullScreenMedia, setFullScreenMedia] = useState<any | null>(null);

  const mediaMessages = messages.filter(m => (m.message_type === 'image' || m.message_type === 'video') && !m.deleted_for_all);
  const docMessages = messages.filter(m => m.message_type === 'file' && !m.deleted_for_all);
  const voiceMessages = messages.filter(m => (m.message_type === 'voice' || m.message_type === 'audio') && !m.deleted_for_all);
  
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const linkMessages = messages.filter(m => !m.deleted_for_all && m.content && linkRegex.test(m.content)).flatMap(m => {
    const links = m.content.match(linkRegex) || [];
    return links.map(link => ({ ...m, extractedLink: link }));
  });

  const getSenderName = (senderId: string) => {
    if (senderId === currentUserId) return 'You';
    return userProfiles[senderId]?.username || 'Unknown';
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return (bytes / 1024).toFixed(0) + ' KB';
    return mb.toFixed(1) + ' MB';
  };

  const tabs = [
    { id: 'media', label: 'Media', icon: ImageIcon, count: mediaMessages.length },
    { id: 'docs', label: 'Docs', icon: FileText, count: docMessages.length },
    { id: 'voice', label: 'Voice', icon: Mic, count: voiceMessages.length },
    { id: 'links', label: 'Links', icon: LinkIcon, count: linkMessages.length },
  ] as const;

  return (
    <>
      <div className="w-80 border-l border-white/10 bg-[#050816] flex flex-col h-full shrink-0 z-20 shadow-2xl transition-all relative">
        <div className="h-[70px] border-b border-white/10 px-6 flex items-center justify-between bg-white/5 backdrop-blur-md shrink-0">
          <h2 className="text-lg font-bold text-white">Shared Media</h2>
          <button onClick={onClose} className="p-2 -mr-2 bg-transparent hover:bg-white/10 rounded-xl text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex px-2 pt-2 gap-1 overflow-x-auto scrollbar-hide border-b border-white/10 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 border-b-2 transition-colors min-w-[60px] ${
                activeTab === tab.id ? 'border-purple-500 text-purple-400' : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'media' && (
            <div className="grid grid-cols-3 gap-1">
              {mediaMessages.length === 0 && <div className="col-span-3 text-center text-white/40 text-sm mt-10">No media shared yet</div>}
              {mediaMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className="aspect-square bg-white/5 rounded relative group cursor-pointer overflow-hidden"
                  onClick={() => setFullScreenMedia(msg)}
                >
                  {msg.message_type === 'image' ? (
                    <img src={msg.file_url} alt="media" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                      <Play className="w-6 h-6 text-white/70" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="flex flex-col gap-2">
              {docMessages.length === 0 && <div className="text-center text-white/40 text-sm mt-10">No documents shared yet</div>}
              {docMessages.map(msg => (
                <a 
                  key={msg.id} 
                  href={msg.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-white truncate">{msg.file_name || 'Document'}</span>
                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                      {formatSize(msg.file_size)} • {getSenderName(msg.sender_id)} • {format(new Date(msg.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-white/50 shrink-0" />
                </a>
              ))}
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="flex flex-col gap-2">
              {voiceMessages.length === 0 && <div className="text-center text-white/40 text-sm mt-10">No voice messages shared yet</div>}
              {voiceMessages.map(msg => (
                <div key={msg.id} className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Mic className="w-3 h-3 text-white/70" />
                    </div>
                    <span className="text-xs text-white/70 font-medium truncate flex-1">{getSenderName(msg.sender_id)}</span>
                    <span className="text-[10px] text-white/40">{format(new Date(msg.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  <audio src={msg.voice_url || msg.file_url} controls className="w-full h-8" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'links' && (
            <div className="flex flex-col gap-2">
              {linkMessages.length === 0 && <div className="text-center text-white/40 text-sm mt-10">No links shared yet</div>}
              {linkMessages.map((msg, i) => (
                <a 
                  key={`${msg.id}-${i}`} 
                  href={msg.extractedLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-white truncate">{msg.extractedLink}</span>
                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                      {getSenderName(msg.sender_id)} • {format(new Date(msg.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {fullScreenMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <button 
            onClick={() => setFullScreenMedia(null)} 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-5xl max-h-screen w-full h-full flex flex-col items-center justify-center relative">
            {fullScreenMedia.message_type === 'image' ? (
              <img src={fullScreenMedia.file_url} alt="Full screen" className="max-w-full max-h-[80vh] object-contain" />
            ) : (
              <video src={fullScreenMedia.file_url} controls className="max-w-full max-h-[80vh] bg-black" autoPlay />
            )}
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="bg-[#1A1D2D]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{getSenderName(fullScreenMedia.sender_id)}</span>
                  <span className="text-xs text-white/50">{format(new Date(fullScreenMedia.created_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <a 
                  href={fullScreenMedia.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
