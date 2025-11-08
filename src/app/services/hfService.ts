import { HuggingfaceModel } from "../../utils/types";

export const getModelsFromHuggingfaceAPI = async (): Promise<HuggingfaceModel[]> => {
    try {
        const response = await fetch('https://huggingface.co/api/models');
        console.log('Huggingface API response:', response);
        const data = await response.json();
        console.log('Huggingface API data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching models from Huggingface API:', error);
        throw error;
    }
}