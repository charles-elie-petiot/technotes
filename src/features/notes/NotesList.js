import { useGetNotesQuery } from "./notesApiSlice"
import Note from "./Note"
import useAuth from "../../hooks/useAuth"
import { PulseLoader } from "react-spinners"

const NotesList = () => {

  const { username, isManager, isAdmin} = useAuth()

  const {
    data: notes,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetNotesQuery('notesList', {
    pollingInterval: 15000,    //refetch after 15000 ms
    refetchOnFocus: true,       //refetch when refocusing on the page
    refetchOnMountOrArgChange: true})

  let content         

  if (isLoading) content = <PulseLoader color={"#FFF"} />

  if (isError) {
    content = <p className="errmsg">{error?.data?.message}</p>
  }

  if (isSuccess) {
    const {ids, entities } = notes

    let filteredIds  //Employee only see his notes
    if (isManager || isAdmin) {
      filteredIds = [...ids]
    } else {
      filteredIds = ids.filter(noteId => entities[noteId].username === username)
    }

    const tableContent = ids?.length && filteredIds.map(noteId => <Note key={noteId} noteId={noteId} />)  //It is mapped
    
    content = (          //tables flattened to be used with grid
      <table className='table table--notes'>    
        <thead className='table__thead'>
          <tr>
            <th scope="col" className='table__th note__status'>Status</th>
            <th scope="col" className='table__th note__created'>Created</th>
            <th scope="col" className='table__th note__updated'>Updated</th>
            <th scope="col" className='table__th note__title'>Title</th>
            <th scope="col" className='table__th note__username'>Owner</th>
            <th scope="col" className='table__th note__edit'>Edit</th>
          </tr>

        </thead>
        <tbody>
          {tableContent}
        </tbody>
      </table>
    )
  }
  return content
}

export default NotesList