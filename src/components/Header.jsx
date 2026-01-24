import React from 'react';
import { Receipt } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-6 h-6" />
          <h1 className="text-xl font-bold">출장 영수증 정산</h1>
        </div>
      </div>
    </header>
  );
}
