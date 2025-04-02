import { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useTranslation } from '../hooks/useTranslation';

const PhotoUpload = ({ onPhotoSelect }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [crop, setCrop] = useState();
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const imgRef = useRef(null);
  const { t } = useTranslation();

  function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
        setShowCropModal(true);
        // Reset crop when new image is selected
        setCrop(undefined);
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !crop) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = imgRef.current;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = 150; // Desired output size
    canvas.height = 150;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      150,
      150
    );

    // Convert the cropped image to a blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a new file from the blob
        const croppedFile = new File([blob], selectedFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        // Create URL for preview
        const croppedUrl = URL.createObjectURL(blob);
        setPreviewUrl(croppedUrl);
        
        // Send both the file and the URL to parent
        if (onPhotoSelect) {
          onPhotoSelect(croppedFile, croppedUrl);
        }
      }
    }, 'image/jpeg', 0.95);

    setShowCropModal(false);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/20">
        {previewUrl && !showCropModal ? (
          <img src={previewUrl} alt={t('profile')} className="w-full h-full object-cover" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <label className="cursor-pointer">
        <span className="px-4 py-2 text-sm text-white bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors duration-200">
          {t('selectPhoto')}
        </span>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handlePhotoSelect}
        />
      </label>

      {showCropModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl max-w-2xl w-full mx-4">
            <div className="mb-4">
              <h3 className="text-white text-lg font-semibold">{t('cropPhoto')}</h3>
              <p className="text-white/80 text-sm">{t('cropInstructions')}</p>
            </div>
            <div className="relative max-h-[60vh] overflow-auto">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={previewUrl}
                  alt={t('cropMe')}
                  onLoad={onImageLoad}
                  className="max-w-full"
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleCropComplete}
                className="px-4 py-2 text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg hover:opacity-90 transition-opacity duration-200"
              >
                {t('apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload; 