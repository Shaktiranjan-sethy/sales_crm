import { NavLink, useNavigate } from "react-router-dom";
import { useNotificationsQuery, useMarkAllReadMutation } from "../app/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { useState, useEffect } from "react";

import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  ClipboardList,
  UserCog,
} from "lucide-react";

// Helper function to format time ago
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";

  return "Just now";
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { user, can } = useAuth();
  const { data: notices } = useNotificationsQuery(undefined, { pollingInterval: 30000 });
  const [markAll] = useMarkAllReadMutation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  function logout() {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    navigate("/login");
  }

  function toggleNotifications(e) {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  }

  function closeNotifications() {
    setShowNotifications(false);
  }

  function toggleUserMenu(e) {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  }

  function closeUserMenu() {
    setShowUserMenu(false);
  }

  function toggleSidebar() {
    setSidebarOpen(!sidebarOpen);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function toggleDropdown(dropdownName) {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.menu-toggle')) {
        closeSidebar();
      }
      if (showNotifications && !event.target.closest('.bell') && !event.target.closest('.notice-drop')) {
        closeNotifications();
      }
      if (showUserMenu && !event.target.closest('.user-menu') && !event.target.closest('.user-menu-btn')) {
        closeUserMenu();
      }
      if (openDropdown && !event.target.closest('.nav-dropdown') && !event.target.closest('.nav-dropdown-toggle')) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [sidebarOpen, showNotifications, showUserMenu, openDropdown]);

  const navStructure = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard, listPermission: "view_dashboard" },
    {
      label: "Lead Management",
      icon: Users,
      listPermission: "list_leads",
      items: [
        { path: "/leads", label: "Leads", listPermission: "list_leads" },
        { path: "/enquiries", label: "Enquiries", listPermission: "list_leads" },
      ]
    },
    {
      label: "Customer Management",
      icon: Building2,
      listPermission: "list_customers",
      items: [
        { path: "/customers", label: "Customers", listPermission: "list_customers" },
      ]
    },
    {
      label: "Deal Management",
      icon: Briefcase,
      listPermission: "list_deals",
      items: [
        { path: "/deals", label: "Deals", listPermission: "list_deals" },
      ]
    },
    {
      label: "Activity Management",
      icon: ClipboardList,
      listPermission: "list_activities",
      items: [
        { path: "/activities", label: "Activities", listPermission: "list_activities" },
        { path: "/followups", label: "Follow-ups", listPermission: "list_activities" },
        { path: "/reminders", label: "Reminders", listPermission: "list_activities" },
      ]
    },
    {
      label: "User Management",
      icon: UserCog,
      listPermission: "list_users",
      items: [
        { path: "/users", label: "Users", listPermission: "list_users" },
        { path: "/roles", label: "Roles", listPermission: "list_roles" },
        { path: "/permissions", label: "Permissions", listPermission: "list_permissions" },
      ]
    },
  ];

  const visibleNavStructure = navStructure.filter(item => {
    if (item.items) {
      // For dropdowns, show if any item is accessible
      return item.items.some(subItem => can(subItem.listPermission));
    }
    return can(item.listPermission);
  });

  const getFilteredDropdownItems = (items) => {
    return items.filter(item => can(item.listPermission));
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">Sales <span>CRM</span></div>

        {visibleNavStructure.map((item) => {
          if (item.items) {
            const filteredItems = getFilteredDropdownItems(item.items);
            const isOpen = openDropdown === item.label;
            const Icon = item.icon;

            return (
              <div key={item.label} className="nav-dropdown">
                <button
                  className="nav-dropdown-toggle"
                  onClick={() => toggleDropdown(item.label)}
                >
                  <span className="nav-label">
                    <Icon size={18} strokeWidth={1.75} className="nav-icon" />
                    {item.label}
                  </span>
                  <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
                </button>
                {isOpen && (
                  <div className="nav-dropdown-menu">
                    {filteredItems.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        className="nav-dropdown-item"
                        to={subItem.path}
                        onClick={() => { closeSidebar(); }}
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          } else {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                className="nav-link"
                to={item.path}
                end={item.path === "/"}
                onClick={closeSidebar}
              >
                <Icon size={18} strokeWidth={1.75} className="nav-icon" />
                {item.label}
              </NavLink>
            );
          }
        })}

        <div className="user-box">
          <div><b>{user?.name || "User"}</b></div>
          <small>{user?.roleName || "No role"}</small>
          <div><button className="btn ghost" onClick={logout}>Sign out</button></div>
        </div>
      </aside>
      <div className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`} onClick={closeSidebar}></div>
      <main className="main">
        <div className="topbar">
          <button className="menu-toggle btn secondary" onClick={toggleSidebar}>
            ☰
          </button>
          <div />
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="bell">
              <button
                className="notification-btn"
                type="button"
                onClick={toggleNotifications}
                style={{ position: "relative" }}
              >
                🔔
                {notices?.unread > 0 && (
                  <span className="notification-badge">{notices.unread}</span>
                )}
              </button>
              {showNotifications && (
                <div className="notice-drop" onClick={(e) => e.stopPropagation()}>
                  <div className="notice-header">
                    <h4>Notifications</h4>
                    {notices?.unread > 0 && (
                      <span className="notice-unread-count">{notices.unread} unread</span>
                    )}
                  </div>
                  {notices?.items && notices.items.length > 0 ? (
                    <div className="notice-list">
                      {notices.items.map((notice) => (
                        <div key={notice._id} className={`notice-item ${!notice.read ? 'unread' : ''}`}>
                          <div className="notice-content">
                            <div className="notice-message">{notice.message}</div>
                            <div className="notice-time">{timeAgo(notice.createdAt)}</div>
                          </div>
                          {!notice.read && <div className="notice-indicator"></div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="notice-empty">
                      <div className="notice-empty-icon">🔔</div>
                      <div>No notifications yet</div>
                    </div>
                  )}
                  {notices?.items && notices.items.length > 0 && (
                    <button className="btn secondary notice-mark-read" onClick={() => markAll()}>
                      Mark all as read
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="user-menu">
              <button
                className="user-menu-btn"
                type="button"
                onClick={toggleUserMenu}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--brand)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 600
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </button>
              {showUserMenu && (
                <div className="user-menu-drop" onClick={(e) => e.stopPropagation()}>
                  <div className="user-menu-header">
                    <div className="user-menu-name">{user?.name || "User"}</div>
                    <div className="user-menu-email">{user?.email || ""}</div>
                    <div className="user-menu-role">{user?.roleName || "No role"}</div>
                  </div>
                  <div className="user-menu-divider"></div>
                  <button className="user-menu-item" onClick={() => { navigate("/profile"); closeUserMenu(); }}>
                    👤 My Profile
                  </button>
                  <button className="user-menu-item" onClick={() => { navigate("/change-password"); closeUserMenu(); }}>
                    🔒 Change Password
                  </button>
                  <div className="user-menu-divider"></div>
                  <button className="user-menu-item user-menu-logout" onClick={logout}>
                    🚪 Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
