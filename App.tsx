
import React, { useState, useCallback } from 'react';
import { Part } from '@google/genai';
import { 
    generateImageFromPrompt, 
    getPhaseSystemPrompt, 
    getPhaseUserPrompt,
    fileToGenerativePart,
} from './services/geminiService';
import BriefingInput from './components/BriefingInput';
import ResultsDisplay from './components/ResultsDisplay';
import ReviewAndUploadStep from './components/Phase1Result'; // Repurposed component
import Loader from './components/Loader';
import { Logo } from './components/Icons';

const App: React.FC = () => {
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [briefingFile, setBriefingFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
  
  const currentPhase = generatedImages.length + 1;

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
        const systemPrompt = getPhaseSystemPrompt(currentPhase);
        const userPrompt = getPhaseUserPrompt(currentPhase);
        
        let userPromptParts: Part[];
        const finalSystemPrompt = systemPrompt;

        if (currentPhase === 1) {
            if (!briefingFile) throw new Error('Briefing PDF is required.');
            userPromptParts = [await fileToGenerativePart(briefingFile)];
            if (logoFile) {
                userPromptParts.push(await fileToGenerativePart(logoFile));
            }
            userPromptParts.push({ text: userPrompt });
        } else {
            if (!referenceImageFile) throw new Error('Reference image for this phase is required.');
            userPromptParts = [
                await fileToGenerativePart(referenceImageFile),
                { text: userPrompt }
            ];
        }

        const newImage = await generateImageFromPrompt(finalSystemPrompt, userPromptParts);
        
        setGeneratedImages(prev => [...prev, newImage]);
        setReferenceImageFile(null);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during generation.';
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, [currentPhase, briefingFile, logoFile, referenceImageFile]);

  const handleReset = () => {
    setGeneratedImages([]);
    setIsLoading(false);
    setError(null);
    setBriefingFile(null);
    setLogoFile(null);
    setReferenceImageFile(null);
  };
  
  const hasStarted = generatedImages.length > 0 || isLoading;

  const renderContent = () => {
    if (isLoading) {
        return <Loader />;
    }

    if (currentPhase > 4) {
        return (
            <ResultsDisplay 
                images={generatedImages}
                currentPhase={0}
                isLoading={false}
                error={null}
            />
        );
    }

    if (currentPhase === 1) {
        return (
            <BriefingInput
              briefingFile={briefingFile}
              logoFile={logoFile}
              onBriefingSelect={setBriefingFile}
              onLogoSelect={setLogoFile}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              error={error}
            />
        );
    }
    
    return (
        <ReviewAndUploadStep
            latestImage={generatedImages[generatedImages.length - 1]}
            currentPhaseNumber={currentPhase}
            referenceFile={referenceImageFile}
            onFileSelect={setReferenceImageFile}
            onSubmit={handleGenerate}
            isLoading={isLoading}
            error={error}
        />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Logo />
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Stand <span className="text-yellow-400">IA</span>
            </h1>
            <span className="hidden md:inline-block text-sm bg-gray-700 text-yellow-400 px-2 py-1 rounded-md">Architect</span>
          </div>
          {hasStarted && (
             <button
              onClick={handleReset}
              className="px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition-colors"
            >
              New Briefing
            </button>
          )}
        </header>

        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
