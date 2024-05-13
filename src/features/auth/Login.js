import { useRef, useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"

import { useDispatch } from "react-redux"
import { setCredentials } from "./authSlice"
import { useLoginMutation } from "./authApiSlice"
import usePersist from "../../hooks/usePersit"
import { PulseLoader } from "react-spinners"

const Login = () => {
    const userRef = useRef() //set focus on user input
    const errRef = useRef() //set focus on error
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errMsg, setErrMsg] = useState('')
    const [persist, setPersist]= usePersist()

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [login, { isLoading}] = useLoginMutation()

    useEffect(() => {
      userRef.current.focus()
    }, [])

    useEffect(() => {
      setErrMsg('')  
    }, [username, password]) //once user read error and starts typing it clears out error

    const handleUserInput = (e) => setUsername(e.target.value)
    const handlePwdInput = (e) => setPassword(e.target.value)

    const handleToggle = () => setPersist(prev => !prev)

    const handleSubmit = async (e) => {
      e.preventDefault()
      try {
        const  { accessToken } = await login({ username, password}).unwrap() //unwrap => not using err state since try/catch block
        dispatch(setCredentials({accessToken}))
        setUsername('')
        setPassword('')
        navigate('/dash')
      } catch(err) {
        if (!err.status) {
          setErrMsg("No server Response")
        } else if (err.status=== 400) {
          setErrMsg("Missing Username or Password")
        } else if (err.status=== 401) {
          setErrMsg("Unauthorized")
        } else {
          setErrMsg(err.data?.message)
        }
        errRef.current?.focus() //focus set on err ==> read by screen reader since aria live = assertive
      }
    }

    const errClass = errMsg ? "errMsg" : "offscreen"

    if (isLoading) return <PulseLoader color={"#FFF"} />

    const content = (
      <section className="public">
        <header>
          <h1>Employee Login</h1>
        </header>
        <main className="login">
          <p ref={errRef} className={errClass} aria-live="assertive">{errMsg}</p>

          <form className="form" onSubmit={handleSubmit}>
            <label htmlFor="username">Username: </label>
            <input 
              className="form__input"
              type='text'
              id="username"
              ref={userRef}
              value={username}
              onChange={handleUserInput}
              autoComplete="off"
              required
            />

            <label htmlFor="password">Password: </label>
            <input 
              className="form__input"
              type="password"
              id="password"
              ref={userRef}
              value={password}
              onChange={handlePwdInput}
              required
            />
            <button className="form__submit-button" type="submit">Sign In</button>

            <label htmlFor="persist" className="form__persist">
              <input 
                type="checkbox"
                className="form__checkbox"
                id="persist"
                onChange={handleToggle}
                checked={persist}
              />
              Trust This Device
            </label>
          </form>
        </main>
        <footer>
          <Link to="/">Back to Home</Link>
        </footer>
      </section>
    )




    return content


}

export default Login