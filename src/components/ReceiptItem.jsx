import React from 'react';
import { Trash2, Crop } from 'lucide-react';

export default function ReceiptItem({ receipt, onDelete, onEdit }) {
  const displayUrl = receipt.croppedUrl || receipt.originalUrl;

  return (
    <div className="relative group overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white aspect-[3/4]">
      <img
        src={displayUrl}
        alt="Receipt"
        className="w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
        <button
          onClick={() => onEdit(receipt)}
          className="p-3 bg-white rounded-full text-gray-800 hover:bg-gray-100 shadow-lg"
          title="자르기 / 편집"
        >
          <Crop className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(receipt.id)}
          className="p-3 bg-white rounded-full text-red-500 hover:bg-red-50 shadow-lg"
          title="삭제"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      {/* Mobile delete/edit buttons always visible or different interaction? 
          For mobile, hover doesn't work well. Let's make a small overlay or bar at bottom.
      */}
      <div className="absolute bottom-0 inset-x-0 bg-white/90 p-2 flex justify-around md:hidden">
          <button onClick={() => onEdit(receipt)} className="p-2 text-gray-700">
              <Crop className="w-5 h-5" />
          </button>
          <button onClick={() => onDelete(receipt.id)} className="p-2 text-red-500">
              <Trash2 className="w-5 h-5" />
          </button>
      </div>
    </div>
  );
}
