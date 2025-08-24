
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="md:pl-64">
        <Header />
        
        <main className="px-6 md:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
