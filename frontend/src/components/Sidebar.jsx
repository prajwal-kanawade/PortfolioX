import { Link, useLocation } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import './Sidebar.css'

/**
 * items: [{ key, label, icon, to }] for route links, or
 *        [{ key, label, icon, active, onClick }] for in-page tabs.
 */
export default function Sidebar({ header, items, collapsed, onToggleCollapse }) {
  const location = useLocation()

  return (
    <aside className={`app-sidebar ${collapsed ? 'app-sidebar-collapsed' : ''}`}>
      <button
        type="button"
        className="app-sidebar-toggle"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </button>

      {header && <div className="app-sidebar-header">{header}</div>}

      <nav className="app-sidebar-nav">
        {items.map(item => {
          const isActive = item.to ? location.pathname === item.to : !!item.active
          const inner = (
            <>
              <item.icon size={18} className="app-sidebar-link-icon" />
              <span className="app-sidebar-label">{item.label}</span>
            </>
          )
          return item.to ? (
            <Link
              key={item.key}
              to={item.to}
              className={`app-sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              {inner}
            </Link>
          ) : (
            <button
              key={item.key}
              type="button"
              className={`app-sidebar-link ${isActive ? 'active' : ''}`}
              onClick={item.onClick}
              title={collapsed ? item.label : undefined}
            >
              {inner}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
