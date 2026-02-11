import React from 'react'
import Sidebar from '../../components/layout/Sidebar'
import './AdminLayout.css'
import { useNavigate } from 'react-router-dom'

const AdminLayout = ({ children, setIsAuth }) => {

  const [showToast, setShowToast] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowToast(true);
    localStorage.removeItem("isAuth");
    setIsAuth(false);
  }

  return (
    <>
    <div className="admin-layout">
      <Sidebar onLogout={handleLogout} setIsAuth={setIsAuth} showToast={showToast} />
      <div className="content-wrapper">
        {children}
      </div>
    </div>
    </>
    
  )
}

export default AdminLayout
