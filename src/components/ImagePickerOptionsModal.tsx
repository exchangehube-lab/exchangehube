import React from 'react';
import { Camera, Image as ImageIcon, Trash2, X } from 'lucide-react';

export interface ImagePickerOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUpload: () => void;
  onRemove?: () => void;
  hasExistingImage: boolean;
}

export function ImagePickerOptionsModal({ isOpen, onClose, onSelectUpload, onRemove, hasExistingImage }: ImagePickerOptionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end md:items-center justify-center p-4 bg-[#070b1a]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#172045]/90 border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-lg font-bold text-white">Profile Photo</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#B8C0D0] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-2 flex flex-col gap-1">
          <button onClick={onSelectUpload} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 text-left text-white font-medium transition-colors rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-blue-400" />
            </div>
            Choose from Gallery
          </button>
          
          <button onClick={onSelectUpload} className="flex md:hidden items-center gap-4 w-full p-4 hover:bg-white/5 text-left text-white font-medium transition-colors rounded-xl">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-400" />
            </div>
            Take a Photo
          </button>
          
          {hasExistingImage && onRemove && (
            <button onClick={onRemove} className="flex items-center gap-4 w-full p-4 hover:bg-red-500/10 text-left text-red-400 font-medium transition-colors rounded-xl">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              Remove Current Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
