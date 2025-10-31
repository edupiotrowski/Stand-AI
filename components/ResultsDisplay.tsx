import React from 'react';
import { WarningIcon } from './Icons';
import Loader from './Loader';

interface GenerationDisplayProps {
  images: string[];
  currentPhase: number;
  isLoading: boolean;
  error: string | null;
}

const ImageCard: React.FC<{ 
    base64Image?: string; 
    isGenerating: boolean; 
    title: string; 
    notes: string;
}> = ({ base64Image, isGenerating, title, notes }) => {
    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg aspect-w-16 aspect-h-9 flex flex-col">
            <div className="flex-grow flex items-center justify-center bg-gray-900/50">
                {base64Image ? (
                    <img src={`data:image/png;base64,${base64Image}`} alt={title} className="w-full h-full object-cover" />
                ) : isGenerating ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <Loader isCardLoader={true} />
                    </div>
                ) : (
                    <div className="w-full h-full bg-gray-800"></div>
                )}
            </div>
            <div className="p-4 bg-gray-800">
                <h4 className="font-bold text-lg text-white">{title}</h4>
                <p className="text-sm text-gray-400">{notes}</p>
            </div>
        </div>
    );
}

const GenerationDisplay: React.FC<GenerationDisplayProps> = ({ images, currentPhase, isLoading, error }) => {
    const renderInfo = [
        { title: 'CAM-01-FRONTAL', notes: 'Isométrica frontal ~35°, altura 1.60 m, 35mm' },
        { title: 'CAM-02-OBLIQUA-ESQ', notes: 'Isométrica oblíqua esquerda ~35°, altura 1.60 m, 35mm' },
        { title: 'CAM-03-OBLIQUA-DIR', notes: 'Isométrica oblíqua direita ~35°, altura 1.60 m, 35mm' },
        { title: 'CAM-04-EYE-LEVEL', notes: 'Eye-level corredor, 1.55 m, 28–35mm, leve DOF' },
    ];
    
    if (error) {
        return (
            <div className="text-center p-8 bg-gray-800 rounded-lg">
                <WarningIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 font-semibold mb-4 text-xl">Generation Failed</p>
                <p className="text-gray-300 mb-4">{error}</p>
            </div>
        );
    }

    const getLoadingText = () => {
        if (!isLoading) {
            return 'All images generated successfully!';
        }
        if (currentPhase > 0 && currentPhase <= renderInfo.length) {
            return `Generating Image ${currentPhase} of 4: ${renderInfo[currentPhase - 1].title}`;
        }
        return 'Preparing to generate remaining images...';
    };
    
    return (
        <div>
            <div className="mb-6 text-center">
                 <h2 className="text-2xl md:text-3xl font-bold text-white">Generation Progress</h2>
                 <p className="text-gray-400 mt-2">
                    {getLoadingText()}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInfo.map((info, index) => (
                    <ImageCard 
                        key={index}
                        title={info.title}
                        notes={info.notes}
                        base64Image={images[index]}
                        isGenerating={isLoading && currentPhase === index + 1}
                    />
                ))}
            </div>
        </div>
    );
};

export default GenerationDisplay;