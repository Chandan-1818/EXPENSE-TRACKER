import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import Drawer from '../components/Drawer';
import './MainLayout.css';

const MainLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="main-layout">
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar-wrapper">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        position="left"
        title="ExpensePro"
      >
        <Sidebar isMobile onClickLink={() => setIsDrawerOpen(false)} />
      </Drawer>

      <div className="main-content">
        <Topbar onMenuClick={() => setIsDrawerOpen(true)} />
        <main className="page-content">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
