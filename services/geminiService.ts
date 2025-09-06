
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A brief overall summary of the voice analysis, written in a gentle and supportive tone."
    },
    conditions: {
      type: Type.ARRAY,
      description: "An array of potential health conditions analyzed from the voice.",
      items: {
        type: Type.OBJECT,
        properties: {
          conditionName: {
            type: Type.STRING,
            description: "The name of the health condition being analyzed (e.g., 'Asthma', 'COPD', 'Depression')."
          },
          riskLevel: {
            type: Type.STRING,
            enum: ['Low', 'Medium', 'High', 'Minimal', 'Not Detected'],
            description: "The assessed risk level for this condition based on the voice analysis."
          },
          explanation: {
            type: Type.STRING,
            description: "A detailed explanation of why this risk level was assigned, citing specific vocal indicators if possible."
          },
          symptoms: {
            type: Type.ARRAY,
            description: "A list of key vocal indicators or symptoms that were detected or are associated with this condition.",
            items: {
              type: Type.STRING
            }
          }
        },
        required: ['conditionName', 'riskLevel', 'explanation', 'symptoms'],
      },
    },
  },
  required: ['summary', 'conditions'],
};


export const analyzeVoice = async (audioBase64: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const prompt = `Analyze this voice recording for potential indicators of the following health conditions: Asthma, COPD, Lung Infection, Throat Issues, and Depression. You are an expert in vocal biomarkers. Be cautious and empathetic in your analysis. Do not provide a medical diagnosis. The user is looking for potential risks. Evaluate the user's speech, breathing patterns, tone, and any audible artifacts like coughing or wheezing. Provide a structured analysis in JSON format.`;

    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, audioPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing voice with Gemini API:", error);
    throw new Error("Failed to get analysis from AI. Please try again.");
  }
};
