import { useEffect } from "react"

const useTitle = (title) => {
  
    useEffect(() => {
        const prevTitle = document.title
        document.title = title

        return () => document.title = prevTitle  //cleanUp function when unmount
    }, [title])
}

export default useTitle