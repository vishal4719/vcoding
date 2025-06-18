import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Authentication/AuthContext';
import AdminNavbar from './AdminNavbar';

function UserDetails() {
  const { user } = useAuth();
  const token = user?.token;
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:8080/admin/users/all', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(res.data);
      } catch (err) {
        setError('Failed to fetch user details');
      }
    };
    if (token) fetchUsers();
  }, [token]);

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!users || users.length === 0) {
    return <div>Loading user details...</div>;
  }

  return (
    <div>
      <AdminNavbar />
      <h1 className="text-2xl font-bold mb-4">All User Details</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Roles</th>
              <th className="px-4 py-2 border">Created At</th>
              <th className="px-4 py-2 border">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id || u._id || idx}>
                <td className="px-4 py-2 border">{u.name||'no name field added in v1'}</td>
                <td className="px-4 py-2 border">{u.email}</td>
                <td className="px-4 py-2 border">{Array.isArray(u.roles) ? u.roles.join(', ') : u.roles||'nill for now'}</td>
                <td className="px-4 py-2 border">{u.createdAt ? new Date(u.createdAt).toLocaleString() : 'before production no input was given'}</td>
                <td className="px-4 py-2 border">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'not yet login'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserDetails;