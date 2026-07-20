import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MdDashboard, 
  MdList, 
  MdAddCircle, 
  MdAnalytics, 
  MdPerson, 
  MdSettings,
  MdCategory,
  MdNotifications,
  MdInsertChart
} from 'react-icons/md';
import './Sidebar.css';

const Sidebar = ({ isMobile, onClickLink }) => {
  return (
    <aside className={`sidebar ${isMobile ? 'mobile-sidebar' : 'desktop-sidebar'}`}>
      {!isMobile && (
        <div className="sidebar-logo">
          <h2>Expense<span>Pro</span></h2>
        </div>
      )}
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard" onClick={onClickLink} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <MdDashboard className="nav-icon" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/history" onClick={onClickLink} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <MdList className="nav-icon" />
              <span>History</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/add-expense" onClick={onClickLink} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <MdAddCircle className="nav-icon" />
              <span>Add Expense</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/analytics" onClick={onClickLink} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <MdAnalytics className="nav-icon" />
              <span>Analytics</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" onClick={onClickLink} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <MdInsertChart className="nav-icon" />
              <span>Reports</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/categories" onClick={onClickLink} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <MdCategory className="nav-icon" />
              <span>Categories</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/notifications" onClick={onClickLink} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <MdNotifications className="nav-icon" />
              <span>Notifications</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" onClick={onClickLink} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <MdPerson className="nav-icon" />
              <span>Profile</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" onClick={onClickLink} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <MdSettings className="nav-icon" />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
