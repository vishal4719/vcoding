import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import { useAuth } from '../Authentication/AuthContext';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const token = user?.token;

  const [userLoginEnabled, setUserLoginEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastTestInfo, setLastTestInfo] = useState(null);

  const [allowedDomains, setAllowedDomains] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const [domainError, setDomainError] = useState('');
  const [domainSuccess, setDomainSuccess] = useState('');

  useEffect(() => {
    async function fetchStatus() {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:8080/api/auth/user-login-enabled');
        setUserLoginEnabled(res.data.enabled);
      } catch (err) {
        setError('Failed to fetch status');
      } finally {
        setLoading(false);
      }
    }

    async function fetchDomains() {
      try {
        const res = await axios.get('http://localhost:8080/admin/allowed-domains', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAllowedDomains(res.data);
      } catch (err) {
        setDomainError('Failed to fetch allowed domains');
      }
    }

    fetchStatus();
    fetchDomains();

    const info = localStorage.getItem('lastTestInfo');
    if (info) {
      setLastTestInfo(JSON.parse(info));
    }
  }, []);

  const handleChange = async (e) => {
    const enabled = e.target.checked;
    setUserLoginEnabled(enabled);
    setSaving(true);
    setError('');
    try {
      await axios.post('http://localhost:8080/api/auth/set-user-login-enabled', { enabled }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      setError('Failed to update login status');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    setDomainError('');
    setDomainSuccess('');
    if (!newDomain.trim()) {
      setDomainError('Please enter a domain.');
      return;
    }
    try {
      await axios.post(
        `http://localhost:8080/admin/add-domain?domain=${encodeURIComponent(newDomain.trim())}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setDomainSuccess('Domain added successfully!');
      setNewDomain('');
      const res = await axios.get('http://localhost:8080/admin/allowed-domains', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAllowedDomains(res.data);
    } catch (err) {
      setDomainError(err.response?.data || 'Failed to add domain');
    }
  };

  const handleRemoveDomain = async (domainToRemove) => {
    try {
      await axios.delete('http://localhost:8080/admin/remove-domain', {
        params: { domain: domainToRemove },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAllowedDomains(allowedDomains.filter(d => d.domain !== domainToRemove));
    } catch (err) {
      alert('Failed to remove domain');
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <AdminNavbar />
      <div className="p-6 max-w-3xl mx-auto bg-white mt-8 rounded-xl shadow-md space-y-6">
        <h2 className="text-2xl font-semibold text-orange-600">Admin Dashboard</h2>

       
        {/* Toggle User Login */}
        {loading ? (
          <div className="text-gray-500">Loading login status...</div>
        ) : (
          <div className="flex items-center space-x-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userLoginEnabled}
                onChange={handleChange}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-orange-500 transition-all duration-300"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {userLoginEnabled ? 'User Login/Signup Enabled' : 'User Login/Signup Disabled'}
              </span>
            </label>
          </div>
        )}
        {error && <div className="text-red-500 text-sm">{error}</div>}

        {/* Allowed Email Domains Section */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded">
          <h3 className="text-lg font-bold mb-2 text-orange-700">Allowed Email Domains</h3>
          <form onSubmit={handleAddDomain} className="flex gap-2 mb-2">
            <input
              type="text"
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              placeholder="e.g. tcetmumbai.in"
              className="border rounded px-2 py-1 flex-1"
            />
            <button
              type="submit"
              className="bg-orange-600 text-white px-4 py-1 rounded"
            >
              Add Domain
            </button>
          </form>
          {domainError && <div className="text-red-600 text-sm mb-1">{domainError}</div>}
          {domainSuccess && <div className="text-green-600 text-sm mb-1">{domainSuccess}</div>}

          <div>
            <b>Current Allowed Domains:</b>
            <ul className="mt-2 space-y-2">
              {allowedDomains.length === 0 ? (
                <li className="text-gray-500">No domains added yet.</li>
              ) : (
                allowedDomains.map((d, idx) => (
                  <li
                    key={d.domain || idx}
                    className="flex justify-between items-center bg-white border rounded px-3 py-1"
                  >
                    <span>{d.domain}</span>
                    <button
                      onClick={() => handleRemoveDomain(d.domain)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
