import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {HuggingfaceModelsState } from "../../../utils/types";
import { getModelsFromHuggingfaceAPI } from "../../services/hfService";


const initialState: HuggingfaceModelsState = {
    huggingfaceModels: null,
    isLoading: false,
    error: null
};

export const getModelsFromHuggingface = createAsyncThunk(
    'hfModel/getModelsFromHuggingface',
    async (_, { rejectWithValue }) => {
        try {
            const models = await getModelsFromHuggingfaceAPI();
            return models;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch huggingface models');
        }
    }
);


export const hfModelSlice = createSlice({
    name: 'hfModel',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getModelsFromHuggingface.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getModelsFromHuggingface.fulfilled, (state, action) => {
                state.isLoading = false;
                state.huggingfaceModels = action.payload;
                state.error = null;
            })
            .addCase(getModelsFromHuggingface.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
    }   
});

export default hfModelSlice.reducer;