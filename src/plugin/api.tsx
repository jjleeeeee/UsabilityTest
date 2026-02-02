import { AIModelConfig } from '../UsabilityTester.type';

// Defines the AI model class and set types for the constructor and method
export class AIModel {
  provider: 'Gemini';
  model: string;
  temperature: number;
  maxTokens: number;
  modelType: string;
  baseUrl: string;
  apiKey: string;

  constructor(config: AIModelConfig) {
    this.provider = config.provider;
    this.model = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    this.modelType = config.modelType;
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  async getModelResponse(prompt: string, images: string[]) {
    return this.getGeminiResponse(prompt, images);
  }

  private async getGeminiResponse(prompt: string, images: string[]) {
    const contents = [
      {
        role: 'user',
        parts: [
          { text: prompt },
          ...images.map((image) => ({
            inline_data: {
              mime_type: 'image/jpeg',
              data: image,
            },
            media_resolution: { level: 'media_resolution_high' },
          })),
        ],
      },
    ];

    const payload = {
      contents: contents,
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
      },
    };

    const url = `${this.baseUrl}${this.model}:generateContent?key=${this.apiKey}`;

    const headers = {
      'Content-Type': 'application/json',
    };

    const result = await this.fetchResponse(url, payload, headers);
    if (result.success) {
      const text = result.rawOutput.candidates[0]?.content?.parts[0]?.text;
      return { success: true, data: text };
    }
    return result;
  }

  private async fetchResponse(url: string, payload: any, headers: any) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        let errorMessage = 'Unknown error';
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (data.error.message) {
            errorMessage = data.error.message;
          } else {
            errorMessage = JSON.stringify(data.error);
          }
        }
        console.error(`${this.modelType} Model error:`, errorMessage);
        return { success: false, error: errorMessage };
      }

      console.log(`${this.modelType} Model response:`, data);
      return { success: true, rawOutput: data };
    } catch (error) {
      console.error('Fetch error:', error);
      return { success: false, error: error.message };
    }
  }
}

export function createModelInstance(config: any) {
  const { geminiApiModel, temperature, maxTokens, geminiBaseUrl, apiKey } = config;

  return new AIModel({
    provider: 'Gemini',
    model: geminiApiModel,
    temperature: temperature,
    maxTokens: maxTokens,
    modelType: 'Gemini',
    baseUrl: geminiBaseUrl,
    apiKey: apiKey,
  });
}
