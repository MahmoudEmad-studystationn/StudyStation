import React from 'react';
import SideBar from '../SideBar/SideBar';

const DashboardLayout = ({ children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      <SideBar />
      <div style={{ 
        flex: 1, 
        padding: '20px',
        marginLeft: '20px',
        overflow: 'auto'
      }}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;