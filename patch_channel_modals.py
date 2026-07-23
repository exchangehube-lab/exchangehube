import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_text = """        </div>
      )}
      {showSuccessModal && ("""

new_text = """        </div>
      )}
      <ImagePickerOptionsModal
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
      {cropperState.isOpen && (
        <ImageCropperModal
          imageSrc={cropperState.src}
          onClose={() => setCropperState({ isOpen: false, src: '' })}
          onSave={handleCropperSave}
          onChangeImage={() => {
            setCropperState({ isOpen: false, src: '' });
            fileInputRef.current?.click();
          }}
          title="Crop Channel Logo"
          description="Your logo will be visible to everyone."
        />
      )}
      {showSuccessModal && ("""

content = content.replace(old_text, new_text)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
