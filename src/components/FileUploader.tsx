'use client';

import React, { useCallback, useState } from 'react';
import { Upload, Image, X, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUploader({ onFileSelect, isProcessing }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  const clearFile = () => { setPreview(null); setFileName(''); };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragActive ? 'border-medium-blue bg-light-blue' : 'border-gray-300 hover:border-medium-blue hover:bg-sky-blue'}`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        >
          <input type="file" accept="image/*" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isProcessing} />
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${dragActive ? 'bg-medium-blue' : 'bg-gray-100'}`}>
              <Upload className={`w-8 h-8 ${dragActive ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">Drop your timesheet here</p>
              <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
            </div>
            <p className="text-xs text-gray-400">Supports JPG, PNG, JPEG images</p>
          </div>
        </div>
      ) : (
        <div className="relative border rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="absolute top-2 right-2 z-10">
            {!isProcessing && (
              <button onClick={clearFile} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><X className="w-4 h-4" /></button>
            )}
          </div>
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-medium-blue animate-spin" />
                <p className="text-sm font-medium text-gray-700">Processing timesheet...</p>
              </div>
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Image className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 truncate">{fileName}</span>
            </div>
            <img src={preview} alt="Timesheet preview" className="w-full h-auto max-h-[400px] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
