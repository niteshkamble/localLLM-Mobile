import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Model, ModelState } from '../../../utils/types';
import { getModels, insertModel, removeModel } from '../../database/modelDatabase';

const initialState: ModelState = {
    localModels: null,
    isLoading: false,
    error: null
};

//get models from local storage
export const getModelsFromLocalStorage = createAsyncThunk(
    'model/getModelsFromLocalStorage',
    async (_, { rejectWithValue }) => {
        try {
            const localModels = await getModels();
            return localModels;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch models');
        }
    }
);

export const addModelToLocalStorage = createAsyncThunk(
    'model/addModelToLocalStorage',
    async (localModel: Model, { rejectWithValue }) => {
        try {
            const insertedModel = await insertModel(localModel);
            return insertedModel;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to add model');
        }
    }
);

export const removeModelFromLocalStorage = createAsyncThunk(
    'model/removeModelFromLocalStorage',
    async (localModelId: number, { rejectWithValue }) => {
        try {
            const result = await removeModel(localModelId);
            return result;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove model');
        }
    }   
);

export const modelSlice = createSlice({
    name: 'model',
    initialState,
    reducers: {
        addModel: (state, action) => {
            // TODO: Implement add model logic
        },
        removeModel: (state, action) => {
            // TODO: Implement remove model logic
        },
    },
    extraReducers: (builder) => {
        builder
            // getModelsFromLocalStorage pending
            .addCase(getModelsFromLocalStorage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            //getModelsFromLocalStorage fulfilled
            .addCase(getModelsFromLocalStorage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.localModels = action.payload;
                state.error = null;
            })
            //getModelsFromLocalStorage rejected 
            .addCase(getModelsFromLocalStorage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // addModelToLocalStorage pending
            .addCase(addModelToLocalStorage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            //addModelToLocalStorage fulfilled - optimistically add to state
            .addCase(addModelToLocalStorage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.localModels = [...(state.localModels || []), action.payload];
                state.error = null;
            })
            //addModelToLocalStorage rejected
            .addCase(addModelToLocalStorage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })


            // // removeModelFromLocalStorage pending
            // .addCase(removeModelFromLocalStorage.pending, (state) => {
            //     state.isLoading = true;
            //     state.error = null;
            // })
            // //removeModelFromLocalStorage fulfilled
            // .addCase(removeModelFromLocalStorage.fulfilled, (state, action) => {
            //     state.isLoading = false;
            //     state.models = (state.models || [] as Model[]).filter((model) => model.id !== action.payload);
            //     state.error = null;
            // })
            // //removeModelFromLocalStorage rejected
            // .addCase(removeModelFromLocalStorage.rejected, (state, action) => {
            //     state.isLoading = false;
            //     state.error = action.payload as string;
            // });
    },
});

export default modelSlice.reducer;
