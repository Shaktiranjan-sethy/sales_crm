import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PermissionRoute from "./components/PermissionRoute.jsx";
import Toast from "./components/Toast.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LeadsPage from "./pages/LeadsPage.jsx";
import LeadFormPage from "./pages/LeadFormPage.jsx";
import LeadDetailPage from "./pages/LeadDetailPage.jsx";
import CustomersPage from "./pages/CustomersPage.jsx";
import CustomerFormPage from "./pages/CustomerFormPage.jsx";
import CustomerDetailPage from "./pages/CustomerDetailPage.jsx";
import DealsPage from "./pages/DealsPage.jsx";
import DealFormPage from "./pages/DealFormPage.jsx";
import DealDetailPage from "./pages/DealDetailPage.jsx";
import ActivitiesPage from "./pages/ActivitiesPage.jsx";
import ActivityFormPage from "./pages/ActivityFormPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import UserFormPage from "./pages/UserFormPage.jsx";
import RoleListPage from "./pages/roles/RoleListPage.jsx";
import AddRolePage from "./pages/roles/AddRolePage.jsx";
import EditRolePage from "./pages/roles/EditRolePage.jsx";
import ViewRolePage from "./pages/roles/ViewRolePage.jsx";
import EnquiriesPage from "./pages/EnquiriesPage.jsx";
import RemindersPage from "./pages/RemindersPage.jsx";
import FollowupsPage from "./pages/FollowupsPage.jsx";
import PermissionListPage from "./pages/permissions/PermissionListPage.jsx";
import AddPermissionPage from "./pages/permissions/AddPermissionPage.jsx";
import EditPermissionPage from "./pages/permissions/EditPermissionPage.jsx";
import ViewPermissionPage from "./pages/permissions/ViewPermissionPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";

function Shell({ children }) {
  return (
    <Layout>
      {children}
      <Toast />
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Shell><DashboardPage /></Shell>} />
        <Route path="/leads" element={<PermissionRoute permission="list_leads"><Shell><LeadsPage /></Shell></PermissionRoute>} />
        <Route path="/leads/add" element={<PermissionRoute permission="add_leads"><Shell><LeadFormPage /></Shell></PermissionRoute>} />
        <Route path="/leads/:id" element={<PermissionRoute permission="view_leads"><Shell><LeadDetailPage /></Shell></PermissionRoute>} />
        <Route path="/leads/:id/edit" element={<PermissionRoute permission="edit_leads"><Shell><LeadFormPage /></Shell></PermissionRoute>} />
        <Route path="/enquiries" element={<PermissionRoute permission="list_leads"><Shell><EnquiriesPage /></Shell></PermissionRoute>} />
        <Route path="/customers" element={<PermissionRoute permission="list_customers"><Shell><CustomersPage /></Shell></PermissionRoute>} />
        <Route path="/customers/add" element={<PermissionRoute permission="add_customers"><Shell><CustomerFormPage /></Shell></PermissionRoute>} />
        <Route path="/customers/:id" element={<PermissionRoute permission="view_customers"><Shell><CustomerDetailPage /></Shell></PermissionRoute>} />
        <Route path="/customers/:id/edit" element={<PermissionRoute permission="edit_customers"><Shell><CustomerFormPage /></Shell></PermissionRoute>} />
        <Route path="/deals" element={<PermissionRoute permission="list_deals"><Shell><DealsPage /></Shell></PermissionRoute>} />
        <Route path="/deals/add" element={<PermissionRoute permission="add_deals"><Shell><DealFormPage /></Shell></PermissionRoute>} />
        <Route path="/deals/:id" element={<PermissionRoute permission="view_deals"><Shell><DealDetailPage /></Shell></PermissionRoute>} />
        <Route path="/deals/:id/edit" element={<PermissionRoute permission="edit_deals"><Shell><DealFormPage /></Shell></PermissionRoute>} />
        <Route path="/followups" element={<PermissionRoute permission="list_activities"><Shell><FollowupsPage /></Shell></PermissionRoute>} />
        <Route path="/reminders" element={<PermissionRoute permission="list_activities"><Shell><RemindersPage /></Shell></PermissionRoute>} />
        <Route path="/activities" element={<PermissionRoute permission="list_activities"><Shell><ActivitiesPage /></Shell></PermissionRoute>} />
        <Route path="/activities/add" element={<PermissionRoute permission="add_activities"><Shell><ActivityFormPage /></Shell></PermissionRoute>} />
        <Route path="/activities/:id/edit" element={<PermissionRoute permission="edit_activities"><Shell><ActivityFormPage /></Shell></PermissionRoute>} />
        <Route path="/users" element={<PermissionRoute permission="list_users"><Shell><UsersPage /></Shell></PermissionRoute>} />
        <Route path="/users/add" element={<PermissionRoute permission="add_users"><Shell><UserFormPage /></Shell></PermissionRoute>} />
        <Route path="/users/:id/edit" element={<PermissionRoute permission="edit_users"><Shell><UserFormPage /></Shell></PermissionRoute>} />
        <Route path="/roles" element={<PermissionRoute permission="list_roles"><Shell><RoleListPage /></Shell></PermissionRoute>} />
        <Route path="/roles/add" element={<PermissionRoute permission="add_roles"><Shell><AddRolePage /></Shell></PermissionRoute>} />
        <Route path="/roles/:id" element={<PermissionRoute permission="view_roles"><Shell><ViewRolePage /></Shell></PermissionRoute>} />
        <Route path="/roles/:id/edit" element={<PermissionRoute permission="edit_roles"><Shell><EditRolePage /></Shell></PermissionRoute>} />
        <Route path="/permissions" element={<PermissionRoute permission="list_permissions"><Shell><PermissionListPage /></Shell></PermissionRoute>} />
        <Route path="/permissions/add" element={<PermissionRoute permission="add_permissions"><Shell><AddPermissionPage /></Shell></PermissionRoute>} />
        <Route path="/permissions/:id" element={<PermissionRoute permission="view_permissions"><Shell><ViewPermissionPage /></Shell></PermissionRoute>} />
        <Route path="/permissions/:id/edit" element={<PermissionRoute permission="edit_permissions"><Shell><EditPermissionPage /></Shell></PermissionRoute>} />
        <Route path="/profile" element={<Shell><ProfilePage /></Shell>} />
        <Route path="/change-password" element={<Shell><ChangePasswordPage /></Shell>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
