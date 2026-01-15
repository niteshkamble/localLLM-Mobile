export type DownloadedModel = {
    id: number;
    modelId: string; // e.g., "microsoft/phi-2"
    fileName: string;
    filePath: string;
    size: number; // in bytes
    format: string; // e.g., "gguf"
    downloadedAt: string; // ISO timestamp
    status: 'downloading' | 'completed' | 'error';
};

// Type for GGUF file
export type GGUFFile = {
    rfilename: string;
    size?: number;
};

// export type Model = {
//     id: number;
//     name: string;
//     description: string;
//     url: string;
//     createdAt: string;
//     updatedAt: string;
// }

// export type HuggingfaceModel = {
//     id: string;
//     modelId: string;
//     createdAt: string;
//     downloads: number;
//     library_name: string;
//     likes: number;
//     pipeline_tag: string;
//     private: boolean;
//     tags: string[];
// }

type gguf = {
    architecture: string;
    bos_token: string;
    chat_template: string;
    context_length: number;
    eos_token: string;
    quantize_imatrix_file: string;
    total: number;
}

export type HuggingfaceModelAPIResponse = {
    data: {
        author: string;
        createdAt: string;
        disabled: boolean;
        downloads: number;
        id: string;
        lastModified: string;
        likes: number;
        modelId: string;
        private: boolean;
        tags: string[];
        gguf: gguf;
        siblings: GGUFFile[];
    },
    status: number;
    statusText: string;
}