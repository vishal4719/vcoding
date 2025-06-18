import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Authentication/Login';
import Signup from './Authentication/Signup';
import { AuthProvider } from './Authentication/AuthContext';
import { UserRoute, AdminRoute } from './Routes/ProtectedRoute';
import Dashboard from './Home/Dashboard';
import AdminDashboard from './Admin/AdminDashboard';
import AddQuestionForm from './Admin/AddQuestionForm';
import TestManagement from './Admin/TestManagement';
import QuestionList from './Admin/QuestionList';
import CodeCompiler from './components/CodeCompiler';
import TestTakingPage from './TestTakingPage';
import UserDetails from './Admin/UserDetails';
import TestResultPage from './Admin/TestResultPage';
import AdminControllDocs from './Docs/AdminControllDocs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
             <Route path="/instruction/userguide/docs" element={<AdminControllDocs />} />

          
          {/* Protected User Route */}
          <Route
            path="/dashboard"
            element={
              <UserRoute>
                <Dashboard />
              </UserRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
           <Route
            path="/admin/users/all"
            element={
              <AdminRoute>
                <UserDetails />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <AdminRoute>
                <QuestionList />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/add-question"
            element={
              <AdminRoute>
                <AddQuestionForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/tests"
            element={
              <AdminRoute>
                <TestManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/compiler"
            element={
              <UserRoute>
                <CodeCompiler />
              </UserRoute>
            }
          />
          <Route
            path="/test/:testId"
            element={
              <UserRoute>
                <TestTakingPage />
              </UserRoute>
            }
          />
          <Route
            path="/result/:testId"
            element={
              <AdminRoute>
                <TestResultPage />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
