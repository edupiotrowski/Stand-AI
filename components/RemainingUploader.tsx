import React from 'react';
import FileInput from './FileInput';
import { ArrowRightIcon, WarningIcon } from './Icons';

interface RemainingUploaderProps {
  onFileSelect: (file: File | null) => void;
  onSubmit: () => void;
  isLoading: boolean;
  referenceFile: File | null;
  error: string | null;
}

const RemainingUploader: React.FC<RemainingUploaderProps> = ({ 
    onFileSelect, 
    onSubmit, 
    isLoading,
    referenceFile,
    error,
}) => {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-300 mb-2">Phase 2: Upload Reference Image</h2>
      <p className="text-gray-400 mb-6">
        Upload the downloaded base image. This will be used as a strong reference to ensure consistency for the remaining camera angles.
      </p>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-4 text-left flex items-center gap-3">
          <WarningIcon className="h-5 w-5"/>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center gap-6 mb-4">
        <FileInput 
          label="Base Image Reference"
          accept="image/png, image/jpeg"
          file={referenceFile}
          onFileSelect={onFileSelect}
          required
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={isLoading || !referenceFile}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
      >
        {isLoading ? 'Generating...' : 'Generate Remaining Images'}
        {!isLoading && <ArrowRightIcon />}
      </button>
    </div>
  );
};

export default RemainingUploader;
