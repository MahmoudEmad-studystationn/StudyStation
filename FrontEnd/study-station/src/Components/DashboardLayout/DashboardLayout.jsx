import React from 'react';
import SideBar from '../SideBar/SideBar';
import { useThemeContext } from "../Theme/ThemeContext";

const DashboardLayout = ({ children }) => {
  const { isDarkMode } = useThemeContext();

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#171717' : '#F3F4F6',
      position: 'relative',
    }}>
      <SideBar />
      <div style={{
        flex: 1,
        overflow: 'auto',
        position: 'relative',  /* ← عشان الـ absolute children تتحسب جوّاه */
      }}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;