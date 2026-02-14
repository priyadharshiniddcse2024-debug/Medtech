import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Heart, 
  LayoutDashboard, 
  Activity, 
  Baby, 
  Thermometer,
  BarChart3,
  Phone,
  FileText
} from 'lucide-react'

const Navigation = () => {
  const location = useLocation()

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
    },
    {
      path: '/symptoms',
      icon: Thermometer,
      label: 'Symptoms'
    },
    {
      path: '/analytics',
      icon: BarChart3,
      label: 'Analytics'
    },
    {
      path: '/emergency',
      icon: Phone,
      label: 'Emergency'
    },
    {
      path: '/medical',
      icon: FileText,
      label: 'Medical Records'
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
          <div className="user-info">
            <span className="user-name">Demo User</span>
            <span className="user-email">demo@maternalcare.ai</span>
          </div>
        </div>
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