/**
 * Multi-Model Support Module
 * Provides abstraction for multiple AI providers
 */

export type AIProvider = 'gemini' | 'claude' | 'openai';

export interface AIModelConfig {
    provider: AIProvider;
    apiKey: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
}

export interface ModelCapabilities {
    vision: boolean;
    maxImageSize: number;
    maxTokens: number;
    supportedFormats: string[];
}

export const MODEL_CONFIGS: Record<AIProvider, { models: string[]; capabilities: ModelCapabilities }> = {
    gemini: {
        models: ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-3.0-flash', 'gemini-2.0-flash'],
        capabilities: {
            vision: true,
            maxImageSize: 20 * 1024 * 1024, // 20MB
            maxTokens: 32000,
            supportedFormats: ['png', 'jpg', 'webp', 'gif'],
        },
    },
    claude: {
        models: ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
        capabilities: {
            vision: true,
            maxImageSize: 5 * 1024 * 1024, // 5MB
            maxTokens: 200000,
            supportedFormats: ['png', 'jpg', 'webp', 'gif'],
        },
    },
    openai: {
        models: ['gpt-4o', 'gpt-4-vision-preview', 'gpt-4-turbo'],
        capabilities: {
            vision: true,
            maxImageSize: 20 * 1024 * 1024, // 20MB
            maxTokens: 128000,
            supportedFormats: ['png', 'jpg', 'webp', 'gif'],
        },
    },
};

/**
 * Get available models for a provider
 */
export function getAvailableModels(provider: AIProvider): string[] {
    return MODEL_CONFIGS[provider]?.models || [];
}

/**
 * Get capabilities for a provider
 */
export function getModelCapabilities(provider: AIProvider): ModelCapabilities | null {
    return MODEL_CONFIGS[provider]?.capabilities || null;
}

/**
 * Validate API key format (basic check)
 */
export function validateApiKey(provider: AIProvider, apiKey: string): boolean {
    if (!apiKey || apiKey.trim() === '') return false;

    switch (provider) {
        case 'gemini':
            return apiKey.startsWith('AI') && apiKey.length > 30;
        case 'claude':
            return apiKey.startsWith('sk-ant-') && apiKey.length > 40;
        case 'openai':
            return apiKey.startsWith('sk-') && apiKey.length > 40;
        default:
            return false;
    }
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: AIProvider): string {
    switch (provider) {
        case 'gemini':
            return 'gemini-3-flash-preview';
        case 'claude':
            return 'claude-3.5-sonnet';
        case 'openai':
            return 'gpt-4o';
    }
}

/**
 * Format API endpoint URL for each provider
 */
export function getApiEndpoint(provider: AIProvider, model: string): string {
    switch (provider) {
        case 'gemini':
            return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        case 'claude':
            return 'https://api.anthropic.com/v1/messages';
        case 'openai':
            return 'https://api.openai.com/v1/chat/completions';
    }
}

/**
 * Storage key for saved model config
 */
const CONFIG_KEY = 'usability-tester-model-config';

/**
 * Save model configuration
 */
export async function saveModelConfig(config: AIModelConfig): Promise<void> {
    await figma.clientStorage.setAsync(CONFIG_KEY, config);
}

/**
 * Load model configuration
 */
export async function loadModelConfig(): Promise<AIModelConfig | null> {
    return await figma.clientStorage.getAsync(CONFIG_KEY) as AIModelConfig | null;
}
