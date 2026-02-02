interface AIConfig {
  provider: 'Gemini';
  model: string;
  geminiApiModel: string;
  maxTokens: number;
  temperature: number;
  requestInterval: number;
  docRefine: boolean;
  maxRounds: number;
  minDist: number;
  geminiBaseUrl: string;
  apiKey: string;
}

const defaultAIConfig: AIConfig = {
  provider: 'Gemini',
  model: 'AI',
  geminiApiModel: 'gemini-3-flash-preview',
  maxTokens: 8192,
  temperature: 1.0,
  requestInterval: 10,
  docRefine: false,
  maxRounds: 20,
  minDist: 30,
  geminiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/',
  apiKey: '',
};

export let aiConfig: AIConfig = { ...defaultAIConfig };

export function updateAIConfig(updates: Partial<AIConfig>) {
  aiConfig = {
    ...aiConfig,
    ...updates,
  };
}
