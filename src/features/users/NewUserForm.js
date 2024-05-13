import { useState, useEffect } from "react"
import { useAddNewUserMutation } from "./usersApiSlice"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave } from "@fortawesome/free-solid-svg-icons"
import { ROLES } from "../../config/roles"

const USER_REGEX = /^[A-z]{3,20}$/  //any letter, min or MAJ, between 3 and 20 characters
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/

const NewUserForm = () => {
    
    const [addNewUser, {     //mutation => gives us addNewUser to be used whenever we need
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewUserMutation()

    const navigate = useNavigate()

    const [username, setUsername] = useState('') //state piece and a function to modify it, = '' at the start
    const [validUsername, setValidUsername] = useState(false) //false by default
    const [password, setPassword] = useState('') 
    const [validPassword, setValidPassword] = useState(false)
    const [roles, setRoles] = useState(["Employee"])

    useEffect(() => {
        setValidUsername(USER_REGEX.test(username))
    }, [username])  //whenever username changes, apply this function

    useEffect(() => {
        setValidPassword((PWD_REGEX.test(password)))
    }, [password])

    useEffect(() => {
        if (isSuccess) {
            setUsername('')
            setPassword('')
            setRoles([])
            navigate('/dash/users')
        }
    }, [isSuccess, navigate]) //navigate won't change but we get a warning if we don't include it here

    const onUsernameChanged = e => setUsername(e.target.value) //controlled input
    const onPasswordChanged = e => setPassword(e.target.value) //controlled input

    const onRolesChanged = e => {
        const values = Array.from(
            e.target.selectedOptions,  //HTMLCollection 
            (option) => option.value
        )
        setRoles(values)
    }

    const canSave = [roles.length, validUsername, validPassword].every(Boolean) && !isLoading

    const onSaveUserClicked = async (e) => {
        e.preventDefault()  //Would refresh the page otherwise
        if (canSave) {
            await addNewUser({ username, password, roles})
        }
    }

    const options = Object.values(ROLES).map(role => {
        return (
            <option key={role} value={role}>
                {role}
            </option>
        )
    })

    const errClass = isError ? "errmsg" : "offscreen"
    const validUserClass = !validUsername ? 'form__input--incomplete' : ''
    const validPwdClass = !validPassword ? 'form__input--incomplete' : ''
    const validRolesClass = !Boolean(roles.length) ? 'form__input--incomplete' : ''

    const content = (
        <>
            <p className={errClass}>{error?.data?.message}</p>

            <form className="form" onSubmit={onSaveUserClicked}>
                <div className="form__title-row">
                  <h2>New User</h2>
                  <div className="form__action-buttons">
                    <button className="icon-button" title="Save" disabled={!canSave}>
                        <FontAwesomeIcon icon={faSave}></FontAwesomeIcon>
                    </button>
                  </div>
                </div>
                <label className="form-label" htmlFor='username'>
                    Username: <span className="nowrap">[3-20 letters]</span>
                </label>
                <input 
                    className={`form__input ${validUserClass}`} 
                    id='username'
                    name="username"
                    type='text'
                    autoComplete='off'
                    value={username}
                    onChange={onUsernameChanged} />
                <label className="form-label" htmlFor='password'>
                    Password: <span className="nowrap">[4-12 chars incl. !@#$%]</span>
                </label>
                <input 
                    className={`form__input ${validPwdClass}`} 
                    id='password'
                    name="password"
                    type='password'
                    value={password}
                    onChange={onPasswordChanged} />
                <label className="form-label" htmlFor='roles'>
                        ASSIGNED ROLES:
                </label>
                <select
                    className={`form__select ${validRolesClass}`} 
                    id='roles'
                    name="roles"
                    multiple={true}
                    size="3"
                    value={roles}
                    onChange={onRolesChanged} >
                        {options}
                </select>

            </form>
        </>
    )






    return content

}

export default NewUserForm