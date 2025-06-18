import React from 'react'

function AdminControllDocs  () {
  return (
    <div>
        <div>
            <h1 className="text-2xl font-bold text-center my-4">Admin Control Documentation</h1>
            <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
                <h2 className="text-xl font-semibold text-orange-600">Overview</h2>
                <p>
                    This documentation provides an overview of the admin control features available in the Test Management System.
                    Admins can manage users, questions, tests, and submissions effectively.
                </p>

                <h2 className="text-xl font-semibold text-orange-600">Features</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Manage Users: View and manage all registered users.</li>
                    <li>Manage Questions: Add, edit, or delete questions for tests.</li>
                    <li>Manage Tests: Create and manage tests for users.</li>
                    <li>View Submissions: Review user submissions for tests.</li>
                </ul>

                <h2 className="text-xl font-semibold text-orange-600">Usage</h2>
                <p>
                    Admins can access the admin panel from the main navigation menu. Each feature is accessible through dedicated links.
                </p>

                <h2 className="text-xl font-semibold text-orange-600">Support</h2>
                <p>
                    For any issues or support requests, please contact the development team.
                </p>
        </div>
    </div>
    </div>
  )
}

export default AdminControllDocs