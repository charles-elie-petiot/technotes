import { useState, useEffect } from "react"
import { useUpdateNoteMutation, useDeleteNoteMutation } from "./notesApiSlice"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import useAuth from "../../hooks/useAuth"

const TITLE_REGEX = /^[A-z0-9\s!@#$%]{4,12}$/
const TEXT_REGEX = /^[A-z0-9\s!@#$%]{4,50}$/

const EditNoteForm = ( {note, users}) => {

    const {isManager, isAdmin} = useAuth()
    
    const [updateNote, {         //use update hook
        isLoading,
        isSuccess,
        isError,
        error
     }] = useUpdateNoteMutation()

    const [deleteNote, {        //use delete hook
        isSuccess: isDelSuccess,  //renamed or would have the same name than update hook
        isError: isDelError,
        error: delerror
     }] = useDeleteNoteMutation()

    const navigate = useNavigate()

    const [title, setTitle] = useState(note.title)
    const [validTitle, setValidTitle] = useState(false) //false by default
    const [text, setText] = useState(note.text) 
    const [validText, setValidText] = useState(false)
    const [userId, setUserId] = useState(note.user)
    const [completed, setCompleted] = useState(note.completed)
 
    useEffect(() => {
        setValidTitle(TITLE_REGEX.test(title))
    }, [title])

    useEffect(() => {
        setValidText((TEXT_REGEX.test(text)))
    }, [text])

    useEffect(() => {
        if (isSuccess || isDelSuccess) {
            setTitle('')
            setText('')
            setUserId('')
            navigate('/dash/notes')
        }
    }, [isSuccess, isDelSuccess, navigate]) //navigate won't change but we get a warning if we don't include it here

    const onTitleChanged = e => setTitle(e.target.value) //controlled input
    const onTextChanged = e => setText(e.target.value) //controlled input
    const onUserIdChanged = e => setUserId(e.target.value) //controlled input

    const onCompletedChanged = () => setCompleted(prev => !prev)

    const onSaveNoteClicked = async (e) => {
        
        await updateNote({ id: note.id, user: userId, title, text, completed})
       
    }
  
    const onDeleteNoteClicked = async () => {
        await deleteNote({id: note.id})
    } 

    const options = users.map(user => {
        return (
            <option key={user.id} value={user.id}>
                {user.username}
            </option>
        )
    })

    
    const canSave = [validTitle, validText, userId].every(Boolean) && !isLoading
    

    const errClass = isError && isDelError ? "errmsg" : "offscreen"
    const validTitleClass = !validTitle ? 'form__input--incomplete' : ''
    const validTextClass = !validText ? 'form__input--incomplete' : ''

    const errContent = (error?.data?.message || delerror?.data?.message) ?? ''

    let deleteButton = null
    if (isManager || isAdmin) {
        deleteButton = (
            <button
                className="icon-button"
                title="delete"
                onClick={onDeleteNoteClicked}>
                    <FontAwesomeIcon icon={faTrashCan} />
            </button>
        )
    }

    const content = (
        <>
            <p className={errClass}>{errContent}</p>

            <form className="form" onSubmit={e => e.preventDefault()}>
                <div className="form__title-row">
                    <h2>Edit Note</h2>
                    <div className="form__action-buttons">
                        <button
                            className="icon-button"
                            title="Save"
                            onClick={onSaveNoteClicked}
                            disabled={!canSave}
                        >
                            <FontAwesomeIcon icon={faSave} />
                        </button>
                        {deleteButton}
                    </div>
                </div>
                <label className="form__label" htmlFor="title">
                    Title: </label>
                <input
                    className={`form__input ${validTitleClass}`}
                    id="title"
                    name="title"
                    type="text"
                    autoComplete="off"
                    value={title}
                    onChange={onTitleChanged}
                />

                <label className="form__label" htmlFor="text">
                    Text: </label>
                <input
                    className={`form__input ${validTextClass}`}
                    id="text"
                    name="text"
                    type="text"
                    value={text}
                    onChange={onTextChanged}
                />

                <label className="form__label form__checkbox-container" htmlFor="note-completed">
                    Completed:
                    <input
                        className="form__checkbox"
                        id="note-completed"
                        name="note-completed"
                        type="checkbox"
                        checked={completed}
                        onChange={onCompletedChanged}
                    />
                </label>

                <label className="form__label" htmlFor='roles'>
                        ASSIGNED TO:
                </label>
                <select
                    className={`form__select`} 
                    id='user'
                    name="user"
                    value={userId}
                    onChange={onUserIdChanged} >
                        {options}
                </select>

            </form>
        </>
    )
    return content
}

export default EditNoteForm