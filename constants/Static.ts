
// Hugging Face API base URL
export const HF_API_BASE_URL = 'https://huggingface.co';
export const HF_API_MODELS_URL = `${HF_API_BASE_URL}/api/models`;

//user-friendly model  names to Hugging Face repository paths
export const HF_TO_GGUF: { [key: string]: string } = {
    'Llama-3.2-1B-Instruct': 'medmekk/Llama-3.2-1B-Instruct.GGUF',
    'DeepSeek-R1-Distill-Qwen-1.5B': 'medmekk/DeepSeek-R1-Distill-Qwen-1.5B.GGUF',
    'Qwen2-0.5B-Instruct': 'medmekk/Qwen2.5-0.5B-Instruct.GGUF',
    'SmolLM2-1.7B-Instruct': 'medmekk/SmolLM2-1.7B-Instruct.GGUF',
};

export enum HF_MODEL_FORMATS {
    LLAMA_3_2_1B_INSTRUCT = 'Llama-3.2-1B-Instruct',
    DEEPSEEK_R1_DISTILL_QWEN_1_5B = 'DeepSeek-R1-Distill-Qwen-1.5B',
    QWEN2_0_5B_INSTRUCT = 'Qwen2-0.5B-Instruct',
    SMOLLM2_1_7B_INSTRUCT = 'SmolLM2-1.7B-Instruct',
}

export const MODELS_DIRECTORY =  "models";