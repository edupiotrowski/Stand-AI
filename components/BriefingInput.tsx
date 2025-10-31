import React from 'react';
import FileInput from './FileInput';
import { WarningIcon } from './Icons';


interface BriefingInputProps {
  onBriefingSelect: (file: File | null) => void;
  onLogoSelect: (file: File | null) => void;
  onSubmit: () => void;
  isLoading: boolean;
  briefingFile: File | null;
  logoFile: File | null;
  error: string | null;
}

const BriefingInput: React.FC<BriefingInputProps> = ({ 
    onBriefingSelect, 
    onLogoSelect, 
    onSubmit, 
    isLoading,
    briefingFile,
    logoFile,
    error
}) => {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-300 mb-2">Upload Your Briefing Files</h2>
      <p className="text-gray-400 mb-6">
        Provide a PDF with the stand details and an optional logo. The AI will generate a series of consistent renders based on your files.
      </p>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-4 text-left flex items-center gap-3">
          <WarningIcon className="h-5 w-5"/>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col sm:flex-row gap-6 mb-4">
        <FileInput 
          label="Briefing PDF"
          accept=".pdf"
          file={briefingFile}
          onFileSelect={onBriefingSelect}
          required
        />
        <FileInput 
          label="Company Logo"
          accept="image/png, image/jpeg, image/svg+xml"
          file={logoFile}
          onFileSelect={onLogoSelect}
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={isLoading || !briefingFile}
        className="w-full px-6 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
      >
        {isLoading ? 'Generating...' : 'Start Generation Process'}
      </button>
    </div>
  );
};

export default BriefingInput;
