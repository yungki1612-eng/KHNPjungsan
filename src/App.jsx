import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ReceiptItem from './components/ReceiptItem';
import CropModal from './components/CropModal';
import BottomActions from './components/BottomActions';
import { jsPDF } from 'jspdf';
import { Share2, Download, AlertCircle } from 'lucide-react';

function App() {
  const [receipts, setReceipts] = useState([]);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState(null); // { url, blob }

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      receipts.forEach(r => {
        URL.revokeObjectURL(r.originalUrl);
        if (r.croppedUrl) URL.revokeObjectURL(r.croppedUrl);
      });
    };
  }, []);

  const handleAddFiles = (files) => {
    const newReceipts = Array.from(files).map(file => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      originalUrl: URL.createObjectURL(file),
      croppedUrl: null,
      file: file,
      timestamp: Date.now()
    }));
    
    // Automatically open crop for the first added image if it's a single add?
    // Maybe just add to list for now.
    setReceipts(prev => [...prev, ...newReceipts]);
  };

  const handleDelete = (id) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = (receipt) => {
    setEditingReceipt(receipt);
  };

  const handleCropSave = (croppedUrl) => {
    setReceipts(prev => prev.map(r => 
      r.id === editingReceipt.id 
        ? { ...r, croppedUrl } 
        : r
    ));
    setEditingReceipt(null);
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      let cursorY = margin;
      
      // Title
      doc.setFontSize(18);
      doc.text("출장비 영수증 정산서", pageWidth / 2, cursorY, { align: "center" });
      cursorY += 15;
      
      doc.setFontSize(10);
      doc.text(`생성일: ${new Date().toLocaleDateString()}`, margin, cursorY);
      cursorY += 10;

      // Images
      // Simple layout logic: Append images one by one. If it overflows, add page.
      // We need to load images to get dimensions.
      
      for (const receipt of receipts) {
        const imgUrl = receipt.croppedUrl || receipt.originalUrl;
        
        // Load image to get dimensions
        const img = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = imgUrl;
        });

        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const imgRatio = imgHeight / imgWidth;
        
        // Target width: full width minus margins
        const targetWidth = pageWidth - (margin * 2);
        let targetHeight = targetWidth * imgRatio;

        // If image is too tall (more than 1/2 page), maybe scale it down or just let it be?
        // Let's constrain height to max 2/3 of page to be safe, otherwise scale width down.
        const maxHeight = pageHeight * 0.7;
        if (targetHeight > maxHeight) {
             targetHeight = maxHeight;
             // Recalculate width to maintain aspect ratio
             // targetWidth / targetHeight = 1 / imgRatio
             // targetWidth = targetHeight / imgRatio
             const newWidth = targetHeight / imgRatio;
             // Center it?
             // For now let's just use the calculated width
        }

        // Check for page overflow
        if (cursorY + targetHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }

        doc.addImage(imgUrl, 'JPEG', margin, cursorY, targetWidth, targetHeight);
        
        // Draw a border or label?
        // doc.rect(margin, cursorY, targetWidth, targetHeight);
        
        cursorY += targetHeight + 10;
      }

      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setGeneratedPdf({ url: pdfUrl, blob: pdfBlob });
      
    } catch (error) {
      console.error("PDF Gen Error:", error);
      alert("PDF 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!generatedPdf) return;

    const file = new File([generatedPdf.blob], "expenses.pdf", { type: "application/pdf" });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: '출장 영수증',
          text: '출장 영수증 정산 파일입니다.',
        });
      } catch (error) {
        console.log('Share failed', error);
      }
    } else {
      // Fallback: Download
      const link = document.createElement('a');
      link.href = generatedPdf.url;
      link.download = 'expenses.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Also try opening mailto
      // window.location.href = "mailto:?subject=출장영수증&body=첨부파일을 확인해주세요.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      
      <main className="container mx-auto p-4 max-w-2xl">
        {receipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <AlertCircle className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-lg">영수증이 없습니다.</p>
            <p className="text-sm">하단의 버튼을 눌러 사진을 추가하세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {receipts.map(receipt => (
              <ReceiptItem
                key={receipt.id}
                receipt={receipt}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </main>

      <BottomActions 
        onAdd={handleAddFiles} 
        onGenerate={generatePDF} 
        count={receipts.length}
      />

      {/* Editing Modal */}
      {editingReceipt && (
        <CropModal
          imageSrc={editingReceipt.originalUrl}
          onClose={() => setEditingReceipt(null)}
          onSave={handleCropSave}
        />
      )}

      {/* Generated PDF Modal/Preview Overlay */}
      {generatedPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg">PDF 생성 완료</h2>
              <button onClick={() => setGeneratedPdf(null)} className="text-gray-500">닫기</button>
            </div>
            
            <div className="p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Share2 className="w-8 h-8" />
              </div>
              <p className="text-gray-600">
                정산 내역 PDF가 생성되었습니다.<br/>
                회사 이메일로 전송하거나 저장하세요.
              </p>
            </div>

            <div className="p-4 bg-gray-50 flex gap-3">
              <button 
                onClick={handleShare}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700"
              >
                <Share2 className="w-5 h-5" />
                공유 / 전송
              </button>
               <a 
                href={generatedPdf.url}
                download="expenses.pdf"
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <Download className="w-5 h-5" />
                다운로드
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-4">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="font-medium">PDF 생성 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;