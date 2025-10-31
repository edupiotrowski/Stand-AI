import React from 'react';
import FileInput from './FileInput';
import { DownloadIcon, ArrowRightIcon, WarningIcon } from './Icons';

interface ReviewAndUploadStepProps {
  latestImage: string;
  currentPhaseNumber: number; // The phase we are ABOUT to generate (e.g., 2, 3, 4)
  referenceFile: File | null;
  onFileSelect: (file: File | null) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
}

const ReviewAndUploadStep: React.FC<ReviewAndUploadStepProps> = ({
    latestImage,
    currentPhaseNumber,
    referenceFile,
    onFileSelect,
    onSubmit,
    isLoading,
    error
}) => {
  const downloadUrl = `data:image/png;base64,${latestImage}`;
  const prevPhaseNumber = currentPhaseNumber - 1;

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Phase {prevPhaseNumber} Complete: Review & Upload</h2>
      <p className="text-gray-400 mb-6">
        Download the image below, then upload it as a reference to generate the next camera angle for Phase {currentPhaseNumber}.
      </p>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-4 text-left flex items-center gap-3">
          <WarningIcon className="h-5 w-5"/>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg aspect-w-16 aspect-h-9 mb-6">
        <img src={downloadUrl} alt={`Generated Image for Phase ${prevPhaseNumber}`} className="w-full h-full object-contain" />
      </div>
      
       <div className="flex items-center justify-center mb-6">
          <a
            href={downloadUrl}
            download={`stand_ia_phase_${prevPhaseNumber}.png`}
            className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors`}
          >
            <DownloadIcon />
            Download Phase {prevPhaseNumber} Image
          </a>
       </div>
       
       <div className="max-w-3xl mx-auto text-center bg-gray-800/50 border border-gray-700 p-6 rounded-lg">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-300 mb-2">Upload for Phase {currentPhaseNumber}</h3>
            <p className="text-gray-400 mb-6">
                Upload the image you just downloaded to ensure consistency.
            </p>
            <div className="max-w-md mx-auto mb-4">
                <FileInput 
                    label={`Reference for Phase ${currentPhaseNumber}`}
                    accept="image/png, image/jpeg"
                    file={referenceFile}
                    onFileSelect={onFileSelect}
                    required
                />
            </div>
            <button
                onClick={onSubmit}
                disabled={isLoading || !referenceFile}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
                {isLoading ? 'Generating...' : `Generate Phase ${currentPhaseNumber} Image`}
                {!isLoading && <ArrowRightIcon />}
            </button>
       </div>
    </div>
  );
};

export default ReviewAndUploadStep;