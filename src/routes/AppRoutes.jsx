import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute, { HomeRedirect } from './ProtectedRoute';

import PublicLandingPage from "../pages/public/PublicLandingPage";

import LoginPage from '../pages/auth/LoginPage';
import StudentSignupPage from '../pages/auth/StudentSignupPage';
import AdminLayout from '../layouts/AdminLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import StudentLayout from '../layouts/StudentLayout';
import AdminDashboard from '../pages/admin/DashboardPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import RoleManagementPage from '../pages/admin/RoleManagementPage';
import PermissionManagementPage from '../pages/admin/PermissionManagementPage';
import LicenseKeyManagementPage from '../pages/admin/LicenseKeyManagementPage';
import FormulaManagementPage from '../pages/admin/FormulaManagementPage';
import StudentManagementPage from '../pages/admin/StudentManagementPage';
import SettingManagementPage from '../pages/admin/SettingManagementPage';
import TeacherDashboard from '../pages/teacher/DashboardPage';
import StudentDashboard from '../pages/student/DashboardPage';
import LicenseGuard from '../components/common/LicenseGuard';

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<StudentSignupPage />} />

          {/* Admin Routes: must be signed in with the Admin role */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* Also needs the user.read permission */}
              <Route element={<ProtectedRoute permissions="user.read" />}>
                <Route path="/admin/users" element={<UserManagementPage />} />
              </Route>

              {/* Role */}
              <Route element={<ProtectedRoute permissions="role.read" />}>
                <Route path="/admin/roles" element={<RoleManagementPage />} />
              </Route>

              {/* Permission */}
              <Route element={<ProtectedRoute permissions="permission.read" />}>
                <Route path="/admin/permissions" element={<PermissionManagementPage />} />
              </Route>
              {/* Permission */}
              <Route element={<ProtectedRoute permissions="license.read" />}>
                <Route path="/admin/licenses" element={<LicenseKeyManagementPage />} />
              </Route>

              {/* Formula management*/}
              <Route element={<ProtectedRoute permissions="formula.read" />}>
                <Route path="/admin/formulas" element={<FormulaManagementPage />} />
              </Route>

              {/* Student Management */}
              <Route element={<ProtectedRoute permissions="student.read" />}>
                <Route path="/admin/students" element={<StudentManagementPage />} />
              </Route>

               {/* Setting Management */}
              <Route element={<ProtectedRoute permissions="profile.show" />}>
                <Route path="/admin/settings" element={<SettingManagementPage />} />
              </Route>

              {/* អាចបន្ថែម Route ផ្សេងៗរបស់ Admin ទីនេះ */}
            </Route>
          </Route>

          {/* Teacher Routes: must be signed in with the Teacher role */}
          <Route element={<ProtectedRoute allowedRoles={['Teacher']} />}>
            <Route element={<TeacherLayout />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              {/* អាចបន្ថែម Route ផ្សេងៗរបស់ Teacher ទីនេះ */}
            </Route>
          </Route>

          {/* Student Routes: must be signed in with the Student role */}
          <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
            <Route element={<StudentLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />

              {/* Formula management*/}
              <Route element={<ProtectedRoute permissions="formula.read" />}>
                <Route path="/student/calculators" element={<LicenseGuard><FormulaManagementPage /></LicenseGuard>} />
              </Route>

              {/* Setting Management */}
              <Route element={<ProtectedRoute permissions="profile.show" />}>
                <Route path="/student/settings" element={<SettingManagementPage />} />
              </Route>
              {/* អាចបន្ថែម Route ផ្សេងៗរបស់ Student ទីនេះ */}
            </Route>
          </Route>

          {/* Default: signed-in users go to their dashboard, others to /login */}
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}