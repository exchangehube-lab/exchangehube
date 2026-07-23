import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

import_stmt = "import { ImagePickerOptionsModal } from './components/ImagePickerOptionsModal';\n"
content = content.replace("import { uploadToCloudinary }", import_stmt + "import { uploadToCloudinary }")

# Channel State
old_channel_state = """  const [cropperState, setCropperState] = useState<{isOpen: boolean, src: string}>({ isOpen: false, src: '' });"""
new_channel_state = """  const [cropperState, setCropperState] = useState<{isOpen: boolean, src: string}>({ isOpen: false, src: '' });
  const [showChannelPicker, setShowChannelPicker] = useState(false);"""
content = content.replace(old_channel_state, new_channel_state)

# Channel picker click
old_channel_input = """                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>"""
new_channel_input = """                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setShowChannelPicker(true)}>"""
content = content.replace(old_channel_input, new_channel_input)

# Channel picker image click
old_channel_img_input = """                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>"""
new_channel_img_input = """                  <div className="relative group cursor-pointer" onClick={() => setShowChannelPicker(true)}>"""
content = content.replace(old_channel_img_input, new_channel_img_input)

# Channel picker modal component
old_channel_end = """      {cropperState.isOpen && ("""
new_channel_end = """      <ImagePickerOptionsModal
        isOpen={showChannelPicker}
        onClose={() => setShowChannelPicker(false)}
        hasExistingImage={!!logoPreview}
        onSelectUpload={() => {
          setShowChannelPicker(false);
          fileInputRef.current?.click();
        }}
        onRemove={() => {
          setLogoPreview('');
          setLogoFile(null);
          setShowChannelPicker(false);
        }}
      />
      {cropperState.isOpen && ("""
content = content.replace(old_channel_end, new_channel_end)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
