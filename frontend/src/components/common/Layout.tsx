import React from 'react';
// import Header from '/Header';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-14"> {/* Add top padding to account for fixed header */}
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};


export default Layout;
