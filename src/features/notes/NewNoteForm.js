import { useState, useEffect } from "react"
import { useAddNewNoteMutation } from "./notesApiSlice"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave } from "@fortawesome/free-solid-svg-icons"

const TITLE_REGEX = /^[A-z0-9\s!@#$%]{4,20}$/
const TEXT_REGEX = /^[A-z0-9\s!@#$%]{4,50}$/

const NewNoteForm = ({users}) => {
    
    const [addNewNote, {   
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewNoteMutation()

    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [validTitle, setValidTitle] = useState(false) //false by default
    const [text, setText] = useState('') 
    const [validText, setValidText] = useState(false)
    const [userId, setUserId] = useState(users[0].id)

    useEffect(() => {
        setValidTitle(TITLE_REGEX.test(title))
    }, [title])

    useEffect(() => {
        setValidText((TEXT_REGEX.test(text)))
    }, [text])

    useEffect(() => {
        if (isSuccess) {
            setTitle('')
            setText('')
            setUserId('')
            navigate('/dash/notes')
        }
    }, [isSuccess, navigate]) //navigate won't change but we get a warning if we don't include it here

    const onTitleChanged = e => setTitle(e.target.value) //controlled input
    const onTextChanged = e => setText(e.target.value) //controlled input
    const onUserIdChanged = e => setUserId(e.target.value) //controlled input

    const canSave = [validTitle, validText, userId].every(Boolean) && !isLoading

    const onSaveNoteClicked = async (e) => {
        e.preventDefault()  //Would refresh the page otherwise
        if (canSave) {
            await addNewNote({ user: userId, title, text})
        }
    }

    const options = users.map(user => {
        return (
            <option key={user.id} value={user.id}>
                {user.username}
            </option>
        )
    })

    const errClass = isError ? "errmsg" : "offscreen"
    const validTitleClass = !validTitle ? 'form__input--incomplete' : ''
    const validTextClass = !validText ? 'form__input--incomplete' : ''

    const content = (
        <>
            <p className={errClass}>{error?.data?.message}</p>

            <form className="form" onSubmit={onSaveNoteClicked}>
                <div className="form__title-row">
                  <h2>New Note</h2>
                  <div className="form__action-buttons">
                    <button className="icon-button" title="Save" disabled={!canSave}>
                        <FontAwesomeIcon icon={faSave}></FontAwesomeIcon>
                    </button>
                  </div>
                </div>
                <label className="form__label" htmlFor='title'>
                    Title: <span className="nowrap">[4-20 characters]</span>
                </label>
                <input 
                    className={`form__input ${validTitleClass}`} 
                    id='title'
                    name="title"
                    type='text'
                    autoComplete='off'
                    value={title}
                    onChange={onTitleChanged} />

                <label className="form__label" htmlFor='text'>
                    Text: <span className="nowrap">[4-50 chars incl. !@#$%]</span>
                </label>
                <input 
                    className={`form__input ${validTextClass}`} 
                    id='text'
                    name="text"
                    type='text'
                    value={text}
                    onChange={onTextChanged} />
                    
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

export default NewNoteForm