import React from 'react'
import { useGetUsersQuery } from './usersApiSlice'
import User from './User'
import { PulseLoader } from 'react-spinners'

const UsersList = () => {

  const {
    data: users,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetUsersQuery("usersList", {
    pollingInterval: 60000,    //refetch after 60000 ms
    refetchOnFocus: true,       //refetch when refocusing on the page
    refetchOnMountOrArgChange: true
  })

  let content         

  if(isLoading) content = <PulseLoader color={"#FFF"} />

  if (isError) {
    content = <p className="errmsg">{error?.data?.message}</p>
  }

  if (isSuccess) {
    const {ids} = users

    const tableContent = ids?.length && ids.map(userId => <User key={userId} userId={userId} />)  //It is mapped

    content = (          //tables flattened to be used with grid
      <table className='table table--users'>    
        <thead className='table__thead'>
          <tr>
            <th scope="col" className='table__th user__username'>Username</th>
            <th scope="col" className='table__th user__roles'>Roles</th>
            <th scope="col" className='table__th user__edit'>Edit</th>
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

export default UsersList