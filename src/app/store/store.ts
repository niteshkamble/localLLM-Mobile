import { configureStore } from '@reduxjs/toolkit';
import modelReducer from '../reducers/model/modelSlice';
import hfModelReducer from '../reducers/model/hfModelSlice';
import hfModelDownloadReducer from '../reducers/model/hfModelDownloadSlice';
import selectedModelReducer from '../reducers/model/selectedModelSlice';
import chatReducer from '../reducers/chat/chatSlice';

export const store = configureStore({
  reducer: {
    model: modelReducer,
    hfModel: hfModelReducer,
    hfModelDownload: hfModelDownloadReducer,
    selectedModel: selectedModelReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;