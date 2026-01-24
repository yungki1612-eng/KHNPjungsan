import React, { useRef } from 'react';
import { Camera, FileText, Send } from 'lucide-react';

export default function BottomActions({ onAdd, onGenerate, count }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onAdd(e.target.files);
    }
    // Reset value to allow selecting same file again
    e.target.value = null;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto max-w-2xl flex items-center justify-between gap-4">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-medium transition-colors"
        >
          <Camera className="w-5 h-5" />
          <span>사진 추가</span>
        </button>

        <button
          onClick={onGenerate}
          disabled={count === 0}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
            count > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>PDF 생성 ({count})</span>
        </button>
      </div>
    </div>
  );
}
