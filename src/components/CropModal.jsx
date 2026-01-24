import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCw } from 'lucide-react';
import getCroppedImg from '../utils/canvasUtils';

export default function CropModal({ imageSrc, onClose, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      onSave(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <button onClick={onClose} className="p-2">
          <X className="w-6 h-6" />
        </button>
        <span className="font-medium">이미지 자르기</span>
        <button onClick={handleSave} className="p-2 text-blue-400">
          <Check className="w-6 h-6" />
        </button>
      </div>

      {/* Cropper Area */}
      <div className="relative flex-1 bg-gray-900">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={undefined} // Free aspect ratio
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
        />
      </div>

      {/* Controls */}
      <div className="p-6 bg-black text-white flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs w-12">Zoom</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-center">
            <button 
                onClick={() => setRotation((prev) => prev + 90)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full text-sm"
            >
                <RotateCw className="w-4 h-4" /> 
                회전
            </button>
        </div>
      </div>
    </div>
  );
}
