import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

import_stmt = "import { ImagePickerOptionsModal } from './components/ImagePickerOptionsModal';\n"
new_import = """import { ImagePickerOptionsModal } from './components/ImagePickerOptionsModal';
import { ImageCropperModal } from './components/ImageCropperModal';
"""

content = content.replace(import_stmt, new_import)

# For AddChannelModal
old_end_add = """            </form>
          </div>
        </div>
      )}"""
new_end_add = """            </form>
          </div>
        </div>
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
      )}"""
content = content.replace(old_end_add, new_end_add)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
