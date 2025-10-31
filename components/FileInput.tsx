import React, { useRef } from 'react';
import { UploadIcon, FileIcon, XCircleIcon } from './Icons';

interface FileInputProps {
  label: string;
  accept: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  required?: boolean;
}

const FileInput: React.FC<FileInputProps> = ({ label, accept, file, onFileSelect, required = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onFileSelect(selectedFile);
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) {
        inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-1">{label} {required && <span className="text-red-400">*</span>}</label>
      <div 
        onClick={() => inputRef.current?.click()}
        className={`w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
            file ? 'border-green-500 bg-gray-700/50' : 'border-gray-600 hover:border-yellow-400 hover:bg-gray-800/50'
        }`}
      >
        <input type="file" accept={accept} ref={inputRef} onChange={handleFileChange} className="hidden" />
        {file ? (
            <div className="flex items-center gap-3 text-gray-200">
                <FileIcon />
                <span className="font-semibold truncate max-w-xs">{file.name}</span>
                <button onClick={handleClearFile} className="text-gray-400 hover:text-white transition-colors">
                    <XCircleIcon />
                </button>
            </div>
        ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
                <UploadIcon />
                <span className="text-sm">Click to upload</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default FileInput;
