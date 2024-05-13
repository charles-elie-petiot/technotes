import { Outlet, Link } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { useRefreshMutation } from "./authApiSlice"
import usePersist from "../../hooks/usePersit"
import { useSelector } from "react-redux"
import { selectCurrentToken } from "./authSlice"
import { PulseLoader } from "react-spinners"

const PersistLogin = () => {
  
    const [persist] = usePersist()
    const token = useSelector(selectCurrentToken)
    const effectRan = useRef(false) //handle strict mode in react 18

    const [trueSuccess, setTrueSuccess] = useState(false)

    const [refresh, {
        isUninitialized,   //means 'refresh' hasn't been called yet
        isLoading,
        isSuccess,
        isError,
        error
    }] = useRefreshMutation()

    useEffect(() => {  //handles React 18 Strict Mode
        if (effectRan.current === true || process.env.NODE_ENV !== 'development') { // React 18 Strict Mode only happens in development

            const verifyRefreshToken = async () => {
                console.log('verifying refresh token')
                try {
                    //const reponse =
                    await refresh()
                    //const { accessToken } = response.data
                    setTrueSuccess(true)  //gives time to wait for credentials
                } catch(err) {
                    console.log(err)
                }
            }

            if (!token && persist) verifyRefreshToken()
        }
        return () => effectRan.current = true  //clean up function, useRef keeps it even after unmount

        // eslint-disable-next line //removes warning
    }, []) //Strict Mode => Mount, dismount and remount ==> effectRan becomes true for 2nd mount

    let content
    if (!persist) { //persist : no
        console.log("no persist")
        content = <Outlet />
    } else if (isLoading) { //persist : yes ; token : no
        console.log("Loading")
        content = <PulseLoader color={"#FFF"} />
    } else if (isError) { //persist : yes ; token : no
        console.log("error")
        content = (
            <p className="errmsg">
                {`${error?.data?.message} - `}
                <Link to="/login">Please Login again</Link>
            </p>
        )
    } else if (isSuccess && trueSuccess) { //persist : yes ; token : yes
        console.log("success")
        content = <Outlet />
    } else if (token && isUninitialized) { //persist : yes ; token : yes
        console.log("token and uninit")
        console.log(isUninitialized)
        content = <Outlet />
    }


    return content
}

export default PersistLogin