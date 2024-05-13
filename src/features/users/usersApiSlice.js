import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

//createEntity normalizes state : data includes ids array + entities, use ids to get data from entities
const usersAdapter = createEntityAdapter({})

const initialState = usersAdapter.getInitialState()      //call for the state if it exists 

export const usersApiSlice = apiSlice.injectEndpoints({   //we add endpoints from here
    endpoints: builder => ({
        getUsers: builder.query({        //function for GET /users, create automatic hook
            query: () => ({
                url:'/users',    //base url provided in app/api/apiSlice
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError  //Check for error or wrong status
                }
            }),
            keepUnusedDateFor: 60,   //in seconds, default = 60s
            transformResponse: responseData => {
                const loadedUsers = responseData.map(user => {  //changes every user's _id to id to make CRUD work
                    user.id = user._id                  //Our normalize data ids array wouldn't work with _id
                    return user
                })
                return usersAdapter.setAll(initialState, loadedUsers)  //Change state to loadedUsers(with id)
            },
            providesTags: (result, error, arg) => { //Provides Tags to invalidate for cached data
                if (result?.ids) { 
                    return [
                        {type: 'User', id: 'LIST' },
                        ...result.ids.map(id => ({type: 'User', id})) //any id can invalidate the tag
                    ]
                } else return [{ type: 'User', id: 'LIST' }]  //if no id in result, still create TAGS
            }
        }),
        addNewUser: builder.mutation({   // POST /users
            query: initialUserData => ({
                url: '/users',
                method: 'POST',
                body: {
                    ...initialUserData
                }
            }),
            invalidatesTags: [
                {type: 'User', id:"LIST"}  //invalidating make it refetch cached data with this tag
            ]
        }),
        updateUser: builder.mutation({
            query: initialUserData => ({
                url: '/users',
                method: 'PATCH',
                body: {
                    ...initialUserData
                }
            }),
            invalidatesTags: (result, error, arg) => [
                {type: 'User', id: arg.id }     //re-cache for this id
            ]
        }),
        deleteUser: builder.mutation({
            query: ({ id }) => ({
                url: "/users",
                method: "DELETE",
                body: { id }
            }),
            invalidatesTags: (result, err, arg) => [
                { type:"User", id: arg.id}
            ]
        })
    })

})

export const {       //export hooks
    useGetUsersQuery,
    useAddNewUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = usersApiSlice

//        Create Selectors : 
// returns the query result Object
export const selectUsersResult = usersApiSlice.endpoints.getUsers.select()

//creates memoized selector (memoized == kept in memory)
const selectUserData = createSelector(
    selectUsersResult,
    usersResult => usersResult.data  // normalized state obkect with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring

export const {
    selectAll: selectAllUsers,
    selectById: selectUserById,
    selectIds: selectUserIds
} = usersAdapter.getSelectors(state => selectUserData(state) ?? initialState)