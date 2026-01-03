import ActivityLog from './pages/ActivityLog';
import Analytics from './pages/Analytics';
import Attendance from './pages/Attendance';
import CRM from './pages/CRM';
import Calendar from './pages/Calendar';
import Communication from './pages/Communication';
import ConstructionExpense from './pages/ConstructionExpense';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DriverDashboard from './pages/DriverDashboard';
import EmployeeDocuments from './pages/EmployeeDocuments';
import EmployeeSelfService from './pages/EmployeeSelfService';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import ExpenseManagement from './pages/ExpenseManagement';
import Finance from './pages/Finance';
import HRAnalytics from './pages/HRAnalytics';
import HRManagement from './pages/HRManagement';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import InventoryFix from './pages/InventoryFix';
import JoinOrganisation from './pages/JoinOrganisation';
import Locations from './pages/Locations';
import OrganisationManage from './pages/OrganisationManage';
import OrganisationRequests from './pages/OrganisationRequests';
import OrphanedData from './pages/OrphanedData';
import PendingJoinRequests from './pages/PendingJoinRequests';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import RequestOrganisation from './pages/RequestOrganisation';
import ResetData from './pages/ResetData';
import RolePermissions from './pages/RolePermissions';
import Sales from './pages/Sales';
import Settings from './pages/Settings';
import StockAudit from './pages/StockAudit';
import SuperAdminPanel from './pages/SuperAdminPanel';
import Suppliers from './pages/Suppliers';
import Support from './pages/Support';
import Transport from './pages/Transport';
import UploadedDocuments from './pages/UploadedDocuments';
import UserManagement from './pages/UserManagement';
import WorkSchedules from './pages/WorkSchedules';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ActivityLog": ActivityLog,
    "Analytics": Analytics,
    "Attendance": Attendance,
    "CRM": CRM,
    "Calendar": Calendar,
    "Communication": Communication,
    "ConstructionExpense": ConstructionExpense,
    "Dashboard": Dashboard,
    "Documents": Documents,
    "DriverDashboard": DriverDashboard,
    "EmployeeDocuments": EmployeeDocuments,
    "EmployeeSelfService": EmployeeSelfService,
    "ExecutiveDashboard": ExecutiveDashboard,
    "ExpenseManagement": ExpenseManagement,
    "Finance": Finance,
    "HRAnalytics": HRAnalytics,
    "HRManagement": HRManagement,
    "Home": Home,
    "Inventory": Inventory,
    "InventoryFix": InventoryFix,
    "JoinOrganisation": JoinOrganisation,
    "Locations": Locations,
    "OrganisationManage": OrganisationManage,
    "OrganisationRequests": OrganisationRequests,
    "OrphanedData": OrphanedData,
    "PendingJoinRequests": PendingJoinRequests,
    "Profile": Profile,
    "Reports": Reports,
    "RequestOrganisation": RequestOrganisation,
    "ResetData": ResetData,
    "RolePermissions": RolePermissions,
    "Sales": Sales,
    "Settings": Settings,
    "StockAudit": StockAudit,
    "SuperAdminPanel": SuperAdminPanel,
    "Suppliers": Suppliers,
    "Support": Support,
    "Transport": Transport,
    "UploadedDocuments": UploadedDocuments,
    "UserManagement": UserManagement,
    "WorkSchedules": WorkSchedules,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};