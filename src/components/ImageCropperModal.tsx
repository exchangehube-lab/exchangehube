import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, RotateCcw, RotateCw, MoveHorizontal, MoveVertical, RefreshCw, Maximize, Upload, Check, ImageIcon } from 'lucide-react';
import getCroppedImg from '../utils/cropImage';

export interface ImageCropperModalProps {
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedFile: File, previewUrl: string, setProgress: (msg: string) => void) => Promise<void>;
  onChangeImage: () => void;
  cropShape?: 'rect' | 'round';
  title?: string;
  description?: string;
  successMessage?: string;
}

export function ImageCropperModal({ 
  imageSrc, 
  onClose, 
  onSave, 
  onChangeImage,
  cropShape = 'round',
  title = "Crop Image",
  description = "Your image will appear like this.",
  successMessage = "Image updated successfully."
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLowRes, setIsLowRes] = useState(false);
  
  React.useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      if (img.width < 512 || img.height < 512) {
        setIsLowRes(true);
      }
    };
  }, [imageSrc]);
  
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCropAndSave = async () => {
    try {
      setIsUploading(true);
      setProgressStatus('Preparing Image...');
      
      setProgressStatus('Cropping...');
      const croppedFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      
      if (!croppedFile) throw new Error("Failed to crop image");
      
      setProgressStatus('Uploading...');
      const previewUrl = URL.createObjectURL(croppedFile);
      
      await onSave(croppedFile, previewUrl, setProgressStatus);
      
      setProgressStatus('Complete');
      setIsSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
      setIsUploading(false);
      setProgressStatus('');
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#070b1a]/80 backdrop-blur-md">
        <div className="bg-[#172045]/90 border border-[#8278ff]/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_40px_rgba(168,85,247,0.3)] flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Success</h3>
          <p className="text-[#B8C0D0]">✅ {successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#070b1a]/80 backdrop-blur-md">
      <div className="relative bg-[#172045]/90 border border-white/10 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Left Side: Crop Editor */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-white/10 relative">
          {isUploading && (
            <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
              <p className="text-purple-300 font-medium animate-pulse">{progressStatus}</p>
            </div>
          )}

          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              {isLowRes && (
                <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
                  This image may appear blurry
                </span>
              )}
            </div>
            <button onClick={onClose} disabled={isUploading} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#B8C0D0] hover:text-white transition-colors disabled:opacity-50">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative flex-1 min-h-[300px] md:min-h-[400px] bg-black/50">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape={cropShape}
              showGrid={true}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              classes={{
                containerClassName: 'absolute inset-0',
                mediaClassName: 'object-contain',
              }}
            />
          </div>
          
          <div className="p-4 bg-white/5 border-t border-white/10 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <ZoomOut className="w-4 h-4 text-[#B8C0D0]" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                disabled={isUploading}
                className="flex-1 accent-purple-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <ZoomIn className="w-4 h-4 text-[#B8C0D0]" />
            </div>
            
            <div className="flex justify-center gap-2">
              <button disabled={isUploading} onClick={() => setRotation(r => r - 90)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[#B8C0D0] transition-colors disabled:opacity-50" title="Rotate Left">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button disabled={isUploading} onClick={() => setRotation(r => r + 90)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[#B8C0D0] transition-colors disabled:opacity-50" title="Rotate Right">
                <RotateCw className="w-4 h-4" />
              </button>
              <button disabled={isUploading} onClick={handleReset} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[#B8C0D0] transition-colors disabled:opacity-50" title="Reset">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button disabled={isUploading} onClick={() => setCrop({ x: 0, y: 0 })} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[#B8C0D0] transition-colors disabled:opacity-50" title="Center Image">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Side: Preview & Actions */}
        <div className="w-full md:w-80 flex flex-col bg-white/5">
          <div className="p-6 flex-1 flex flex-col items-center justify-center">
             <h4 className="text-[#B8C0D0] font-medium mb-6 text-center">{description}</h4>
             
             {/* Live Preview */}
             <div className={`relative overflow-hidden border border-white/20 bg-black/30 shadow-2xl ${cropShape === 'round' ? 'rounded-full w-48 h-48' : 'rounded-3xl w-48 h-48'}`}>
               <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape={cropShape}
                  showGrid={false}
                  disableInteractive={true}
                  onCropChange={() => {}}
                  onCropComplete={() => {}}
                  onZoomChange={() => {}}
                  style={{
                    containerStyle: { width: '100%', height: '100%', backgroundColor: 'transparent' }
                  }}
               />
             </div>
          </div>
          
          <div className="p-6 border-t border-white/10 flex flex-col gap-3">
             <button
               onClick={handleApplyCropAndSave}
               disabled={isUploading}
               className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
             >
               <Upload className="w-4 h-4" /> Save
             </button>
             
             <button
               onClick={onChangeImage}
               disabled={isUploading}
               className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10 flex items-center justify-center gap-2"
             >
               <ImageIcon className="w-4 h-4" /> Change Image
             </button>
             
             <div className="flex gap-2">
               <button
                 onClick={handleReset}
                 disabled={isUploading}
                 className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
               >
                 Reset
               </button>
               <button
                 onClick={onClose}
                 disabled={isUploading}
                 className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
               >
                 Cancel
               </button>
             </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
