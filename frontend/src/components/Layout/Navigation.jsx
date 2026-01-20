import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Heart, 
  LayoutDashboard, 
  Activity, 
  Baby, 
  LogOut, 
  User 
} from 'lucide-react'

const Navigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      path: '/health-entry',
      icon: Activity,
      label: 'Health Entry'
    },
    {
      path: '/pregnancy-tracker',
      icon: Baby,
      label: 'Pregnancy Tracker'
    }
  ]

  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="nav-logo">
          <Heart className="nav-logo-icon" />
          <span>MaternalCare AI</span>
        </div>
      </div>

      <div className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="nav-footer">
        <div className="nav-user">
          <User size={20} />
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
        
        <button onClick={handleLogout} className="nav-logout">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <style jsx>{`
        .navigation {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 250px;
          background: var(--surface-color);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .nav-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary-color);
        }

        .nav-logo-icon {
          width: 28px;
          height: 28px;
        }

        .nav-menu {
          flex: 1;
          padding: 1rem 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s ease;
          border-right: 3px solid transparent;
        }

        .nav-item:hover {
          background-color: var(--background-color);
          color: var(--primary-color);
        }

        .nav-item.active {
          background-color: rgba(37, 99, 235, 0.1);
          color: var(--primary-color);
          border-right-color: var(--primary-color);
          font-weight: 500;
        }

        .nav-footer {
          padding: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background-color: var(--background-color);
          border-radius: 8px;
          margin-bottom: 0.75rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .nav-logout {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .nav-logout:hover {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
        }

        @media (max-width: 768px) {
          .navigation {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          
          .navigation.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </nav>
  )
}

export default Navigation