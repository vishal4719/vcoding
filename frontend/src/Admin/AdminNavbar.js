import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';

function AdminNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <nav className="bg-orange-600 text-white px-6 py-4 shadow-md flex justify-between items-center">
      <div className="text-2xl font-bold tracking-wide">Admin Panel</div>
      <div className="space-x-6 flex items-center">
        <Link to="/admin/dashboard" className="hover:text-orange-200 transition duration-200">Dashboard</Link>
        <Link to="/admin/questions" className="hover:text-orange-200 transition duration-200">Questions</Link>
        <Link to="/admin/add-question" className="hover:text-orange-200 transition duration-200">Add Question</Link>
        <Link to="/admin/tests" className="hover:text-orange-200 transition duration-200">Manage Tests</Link>
        <Link to="/admin/users/all" className="hover:text-orange-200 transition duration-200">Users</Link>
        <button onClick={handleLogout} className="ml-4 bg-white text-orange-600 px-3 py-1 rounded hover:bg-orange-100 transition">Logout</button>
      </div>
    </nav>
  );
}

export default AdminNavbar;
