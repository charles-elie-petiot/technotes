import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

//createEntity normalizes state : data includes ids array + entities, use ids to get data from entities
const notesAdapter = createEntityAdapter({
    sortComparer: (a,b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1    //sort 'completed' at the end
})

const initialState = notesAdapter.getInitialState()      //call for the state if it exists 

export const notesApiSlice = apiSlice.injectEndpoints({   //we add endpoints from here
    endpoints: builder => ({
        getNotes: builder.query({        //function for GET /notes, create automatic hook
            query: () => ({
                url:'/notes',    //base url provided in app/api/apiSlice
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError  //Check for error or wrong status
                }
            }),
            keepUnusedDateFor: 60,   //in seconds, default = 60s
            transformResponse: responseData => {
                const loadedNotes = responseData.map(note => {  //changes every note's _id to id to make CRUD work
                    note.id = note._id                  //Our normalize data ids array wouldn't work with _id
                    return note
                })
                return notesAdapter.setAll(initialState, loadedNotes)  //Change state to loadedNotes(with id)
            },
            providesTags: (result, error, arg) => { //Provides Tags to invalidate for cached data
                if (result?.ids) { 
                    return [
                        {type: 'Note', id: 'LIST' },
                        ...result.ids.map(id => ({type: 'Note', id})) //any id can invalidate the tag
                    ]
                } else return [{ type: 'Note', id: 'LIST' }]  //if no id in result, still create TAGS
            }
        }),
        addNewNote: builder.mutation({   // POST /notes
            query: initialNoteData => ({
                url: '/notes',
                method: 'POST',
                body: {
                    ...initialNoteData
                }
            }),
            invalidatesTags: [
                {type: 'Note', id:"LIST"}  //invalidating make it refetch cached data with this tag
            ]
        }),
        updateNote: builder.mutation({
            query: initialNoteData => ({
                url: '/notes',
                method: 'PATCH',
                body: {
                    ...initialNoteData
                }
            }),
            invalidatesTags: (result, error, arg) => [
                {type: 'Note', id: arg.id }     //re-cache for this id
            ]
        }),
        deleteNote: builder.mutation({
            query: ({ id }) => ({
                url: "/notes",
                method: "DELETE",
                body: { id }
            }),
            invalidatesTags: (result, err, arg) => [
                { type:"Note", id: arg.id}
            ]
        })
    })

})

export const {       //export hooks
    useGetNotesQuery,
    useAddNewNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation
} = notesApiSlice

//        Create Selectors : 
// returns the query result Object
export const selectNotesResult = notesApiSlice.endpoints.getNotes.select()

//creates memoized selector (memoized == kept in memory)
const selectNoteData = createSelector(
    selectNotesResult,
    notesResult => notesResult.data  // normalized state obkect with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring

export const {
    selectAll: selectAllNotes,
    selectById: selectNoteById,
    selectIds: selectNoteIds
} = notesAdapter.getSelectors(state => selectNoteData(state) ?? initialState)