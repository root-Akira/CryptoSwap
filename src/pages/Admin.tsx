import React from 'react';
import AdminPanel from '@/components/AdminPanel';

const AdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">CryptoSwap Admin</h1>
            </div>
            
            <a 
              href="/" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to App
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
            <p className="text-gray-600">Manage your CryptoSwap contract</p>
          </div>

          <AdminPanel />
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
