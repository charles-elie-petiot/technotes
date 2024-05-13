import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
  const location = useLocation()
  const { roles } = useAuth()

  const content = (
    roles.some(role => allowedRoles.includes(role)) // if any1 true it's ok
        ? <Outlet />
        : <Navigate to="/login" state={{ from: location }} replace /> //send back to login
  )

  return content
}

export default RequireAuth