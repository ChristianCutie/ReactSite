import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/Dashboard'
import InventoryIcon from '@mui/icons-material/Inventory'
import CategoryIcon from '@mui/icons-material/Category'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PeopleIcon from '@mui/icons-material/People'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import SettingsIcon from '@mui/icons-material/Settings'
import HelpIcon from '@mui/icons-material/Help'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import LogoutIcon from '@mui/icons-material/Logout'

const Sidebar = ({onLogout}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const location = useLocation()

  const menuItems = [
    { label: 'Dashboard', icon: DashboardIcon, path: '/' },
    { label: 'Products', icon: InventoryIcon, path: '/products' },
    { label: 'Categories', icon: CategoryIcon, path: '/categories' },
    { label: 'Inventory', icon: AssignmentIcon, path: '/inventory' },
    { label: 'Orders', icon: ShoppingCartIcon, path: '/orders' },
    { label: 'Customers', icon: PeopleIcon, path: '/customers' },
    { label: 'Analytics', icon: AnalyticsIcon, path: '/analytics' },
    { label: 'Suppliers', icon: LocalShippingIcon, path: '/suppliers' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <aside
      className={`${
        isExpanded ? 'w-72' : 'w-24'
      } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out shadow-2xl overflow-y-auto`}
    >
      {/* Logo Section */}
      <div className='flex items-center justify-between p-6 border-b border-slate-700'>
        {isExpanded && (
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm'>
              IH
            </div>
            <span className='font-bold text-lg text-white'>Inventory</span>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200'
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className='mt-8 px-3 space-y-2'>
        {menuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={!isExpanded ? item.label : ''}
            >
              <IconComponent className='text-xl flex-shrink-0' />
              {isExpanded && (
                <span className='font-medium text-sm'>{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      {isExpanded && (
        <div className='mx-4 my-8 border-t border-slate-700'></div>
      )}

      {/* Settings Section */}
      {isExpanded && (
        <nav className='px-3 space-y-2 mb-8'>
          <button className='w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200'>
            <SettingsIcon className='text-xl' />
            <span className='font-medium text-sm'>Settings</span>
          </button>
          <button className='w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200'>
            <HelpIcon className='text-xl' />
            <span className='font-medium text-sm'>Help</span>
          </button>
        </nav>
      )}

      {/* User Profile Section */}
      <div className={`${isExpanded ? 'p-4' : 'p-3'} border-t border-slate-700 mt-auto`}>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0'>
            JD
          </div>
          {isExpanded && (
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-white truncate'>John Doe</p>
              <p className='text-xs text-slate-400'>Administrator</p>
            </div>
          )}
        </div>
        {isExpanded && (
          <button onClick={onLogout} className='w-full mt-4 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors duration-200 text-slate-200 flex items-center justify-center space-x-2'>
            <LogoutIcon className='text-lg' />
            <span>Logout</span>
          </button>

        )}
      </div>
    </aside>
  )
}

export default Sidebar