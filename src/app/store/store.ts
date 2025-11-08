import { configureStore } from '@reduxjs/toolkit';
import modelReducer from '../reducers/model/modelSlice';
import hfModelReducer from '../reducers/model/hfModelSlice';

export const store = configureStore({
  reducer: {
    model: modelReducer,
    hfModel: hfModelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;