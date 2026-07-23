import sys

with open('src/components/ImageCropperModal.tsx', 'r') as f:
    content = f.read()

old_state = """  const [isSuccess, setIsSuccess] = useState(false);"""
new_state = """  const [isSuccess, setIsSuccess] = useState(false);
  const [isLowRes, setIsLowRes] = useState(false);
  
  React.useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      if (img.width < 512 || img.height < 512) {
        setIsLowRes(true);
      }
    };
  }, [imageSrc]);"""

content = content.replace(old_state, new_state)

old_title = """<h3 className="text-xl font-bold text-white">{title}</h3>"""
new_title = """<div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              {isLowRes && (
                <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
                  This image may appear blurry
                </span>
              )}
            </div>"""

content = content.replace(old_title, new_title)

with open('src/components/ImageCropperModal.tsx', 'w') as f:
    f.write(content)
