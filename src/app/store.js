import { configureStore } from "@reduxjs/toolkit"
import { apiSlice } from "./api/apiSlice"
import { setupListeners } from "@reduxjs/toolkit/query"
import authReducer from "../features/auth/authSlice"

export const store = configureStore({
    reducer: {    //reducers == fonctions
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer
    },
    middleware: getDefaultMiddleware =>  //middleware added to apiSlice 
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: false     //to use redux devtools
})

setupListeners(store.dispatch)