import { GoogleGenAI, Modality, Part } from "@google/genai";

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

const base64ToGenerativePart = (base64Data: string): Part => {
    return {
        inlineData: {
            data: base64Data,
            mimeType: 'image/png'
        }
    };
}

export async function generateImageFromPrompt(systemPrompt: string, userPromptParts: Part[]): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: userPromptParts },
      config: {
        systemInstruction: systemPrompt,
        responseModalities: [Modality.IMAGE],
      },
    });
    
    const candidate = response?.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find(p => p.inlineData);

    if (imagePart?.inlineData) {
      return imagePart.inlineData.data;
    }

    // If we are here, something went wrong. Let's find out why.
    let debugMessage = "Invalid response from AI: No image data was generated.";
    
    const finishReason = candidate?.finishReason;
    const blockReason = response?.promptFeedback?.blockReason;

    if (finishReason && finishReason !== 'STOP') {
        debugMessage = `Generation stopped. Reason: ${finishReason}.`;
    } else if (blockReason) {
        debugMessage = `Generation blocked. Reason: ${blockReason}.`;
    }

    const safetyRatings = candidate?.safetyRatings || response?.promptFeedback?.safetyRatings;
    if (safetyRatings && safetyRatings.some(r => r.probability !== 'NEGLIGIBLE' && r.probability !== 'LOW')) {
        const highRiskCategories = safetyRatings
            .filter(r => r.probability !== 'NEGLIGIBLE' && r.probability !== 'LOW')
            .map(r => `${r.category.replace('HARM_CATEGORY_', '')} (${r.probability})`)
            .join(', ');
        debugMessage += ` High-risk categories detected: ${highRiskCategories}. Please adjust your inputs.`;
    }
    
    throw new Error(debugMessage);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // Re-throw specific errors from the try block or other Gemini errors
        throw error;
    }
    // Catch non-Error objects
    throw new Error("An unexpected error occurred during the API call.");
  }
}

export const getPhaseSystemPrompt = (phase: number): string => {
    switch (phase) {
        case 1:
            return `Você é “Stand IA”. Leia o briefing em PDF e a logo anexada. Gere UMA imagem base realista e funcional de um estande inserido em pavilhão corporativo. Priorize: viabilidade, fluxo, acessibilidade (circulação ≥ 1,20 m), zoning e mídia (LED/tótem) plausíveis. Proíba textos legíveis e marcas reais (se precisar, use "MC Stands" pouco nítido). Ambiente padrão: pavilhão moderno, piso vinílico/epóxi cinza, teto branco com refletores, stands vizinhos genéricos desfocados.
Gere apenas UMA imagem no ângulo: isométrica frontal (~35°), altura 1,60 m, 35mm, em proporção 16:9 (ex: 1920x1080). Não produza outras vistas nesta fase.
Se faltarem medidas críticas no PDF, assuma proporções realistas e descreva-as no quadro mental sem inventar números explícitos.`;
        case 2:
            return `Você é "Stand IA", um motor de renderização arquitetônica. Sua tarefa é recriar o estande da imagem de referência a partir de um NOVO ÂNGULO DE CÂMERA.
A consistência é CRÍTICA. NÃO altere o design, materiais, cores, iluminação ou layout do estande. A única mudança permitida é a câmera.
[INSTRUÇÃO DE CÂMERA] Posição: vista isométrica oblíqua esquerda (ângulo de 45 graus à esquerda). Mantenha a altura da câmera (aprox. 1,60 m) e a lente (35mm).
[OBJETIVO] O resultado deve ser um render fotorrealista e cinematográfico, com perspectiva fisicamente correta, mostrando a lateral esquerda e a profundidade do estande.
[OUTPUT] Gere uma única imagem em proporção 16:9 (ex: 1920x1080).`;
        case 3:
            return `Você é "Stand IA", um motor de renderização arquitetônica. Sua tarefa é recriar o estande da imagem de referência a partir de um NOVO ÂNGULO DE CÂMERA.
A consistência é CRÍTICA. NÃO altere o design, materiais, cores, iluminação ou layout do estande. A única mudança permitida é a câmera.
[INSTRUÇÃO DE CÂMERA] Posição: vista isométrica oblíqua direita (ângulo de 45 graus à direita). Mantenha a altura da câmera (aprox. 1,60 m) e a lente (35mm).
[OBJETIVO] O resultado deve ser um render fotorrealista e cinematográfico, com perspectiva fisicamente correta, mostrando a lateral direita e a profundidade do estande.
[OUTPUT] Gere uma única imagem em proporção 16:9 (ex: 1920x1080).`;
        case 4:
            return `Você é "Stand IA", um motor de renderização arquitetônica. Sua tarefa é recriar o estande da imagem de referência a partir de um NOVO ÂNGULO DE CÂMERA.
A consistência é CRÍTICA. NÃO altere o design, materiais, cores, iluminação ou layout do estande. A única mudança permitida é a câmera.
[INSTRUÇÃO DE CÂMERA] Posição: vista do nível do olho (eye-level) a partir do corredor, como se uma pessoa estivesse olhando para o estande. Altura da câmera: 1,55 m. Lente: 28-35mm com leve profundidade de campo (DOF).
[OBJETIVO] O resultado deve ser um render fotorrealista e cinematográfico, com perspectiva fisicamente correta, criando uma visão imersiva do corredor.
[OUTPUT] Gere uma única imagem em proporção 16:9 (ex: 1920x1080).`;
        default:
            return '';
    }
}

export const getPhaseUserPrompt = (phase: number): string => {
    switch (phase) {
        case 1:
            return `Objetivo: criar a cena canônica do stand com materiais, paleta, volumetria e zoning coerentes com o briefing.
Instruções: gere somente 1 imagem (base). Sem variações. Sem textos adicionais.`;
        case 2:
            return `A imagem de referência está anexada. Renderize o mesmo estande, mudando apenas a câmera para a 'vista isométrica oblíqua esquerda'. Mantenha consistência absoluta com a referência.`;
        case 3:
            return `A imagem de referência está anexada. Renderize o mesmo estande, mudando apenas a câmera para a 'vista isométrica oblíqua direita'. Mantenha consistência absoluta com a referência.`;
        case 4:
            return `A imagem de referência está anexada. Renderize o mesmo estande, mudando apenas a câmera para a 'vista do nível do olho (eye-level)'. Mantenha consistência absoluta com a referência.`;
        default:
            return '';
    }
}

export { fileToGenerativePart, base64ToGenerativePart };