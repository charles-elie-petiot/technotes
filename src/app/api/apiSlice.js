import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { setCredentials } from "../../features/auth/authSlice"

const baseQuery = fetchBaseQuery({
    baseUrl: "https://technotes-api-owgd.onrender.com",   //url de base
    credentials: 'include',            // always send cookie containing refresh token
    prepareHeaders: (headers, { getState }) => {  //getState destructured from api object
        const token = getState().auth.token
        
        headers.set("Access-Control-Allow-Origin", "https://technotes-4ljv.onrender.com")
        if (token) {
            headers.set("authorization", `Bearer ${token}`)
        }

        return headers   //applied to every request
    }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    //console.log(args) //request url, method, body
    //console.log(api)  //signal, dispatch, getState()
    //console.log(extraOptions)  //custom like {shout: true}

    let result = await baseQuery(args, api, extraOptions)   //query succeeds unless accesstoken expired
  
    //If you want, handle other status codes too
    if (result?.error?.status === 403) {
        console.log("sending refresh token")

        //send refresh token to get new access token
        const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)

        if (refreshResult?.data) {

            //store the new token
            api.dispatch(setCredentials( { ...refreshResult.data }))

            //retry original query with new access token
            result = await baseQuery(args, api, extraOptions)
        } else {

            if (refreshResult?.error?.status === 403) {
                refreshResult.error.data.message = "Your login has expired."
            }

            return refreshResult
        }
    }

    return result
}

export const apiSlice = createApi({  //API : Interface de Programmation d'Application
    baseQuery: baseQueryWithReauth, 
    tagTypes: ['Note', 'User'],  //tags used for cached data
    endpoints: builder => ({})   //endpoints are added separately for notes and users
})
