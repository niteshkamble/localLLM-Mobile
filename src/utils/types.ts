export type Model = {
    id: number;
    name: string;
    description: string;
    url: string;
    createdAt: string;
    updatedAt: string;
}

export type ModelState = {
    localModels: Model[] | null;
    isLoading: boolean;
    error: string | null;
}

export type HuggingfaceModelsState = {
    huggingfaceModels: HuggingfaceModel[] | null;
    isLoading: boolean;
    error: string | null;
}

export type HuggingfaceModel = {
    id: string;
    modelId: string;
    createdAt: string;
    downloads: number;
    library_name: string;
    likes: number;
    pipeline_tag: string;
    private: boolean;
    tags: string[];
}

export type Chat = {
    id: string;
    title: string;
    createdAt: string;
}
