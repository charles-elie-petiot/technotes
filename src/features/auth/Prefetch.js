import { store } from '../../app/store'
import { notesApiSlice } from '../notes/notesApiSlice'
import { usersApiSlice } from '../users/usersApiSlice'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

const Prefetch = () => {
  
    useEffect(() => {

        store.dispatch(notesApiSlice.util.prefetch('getNotes', 'notesList', { force: true})) //'getNotes' = choose endpoint, notesList = name those, force query
        store.dispatch(usersApiSlice.util.prefetch('getUsers', 'usersList', { force: true}))

    }, []) //will only work on mount

    return <Outlet />
}

export default Prefetch