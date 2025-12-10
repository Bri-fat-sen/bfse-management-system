import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Transport from './pages/Transport';
import Communication from './pages/Communication';
import Finance from './pages/Finance';
import ActivityLog from './pages/ActivityLog';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Attendance from './pages/Attendance';
import Profile from './pages/Profile';
import RolePermissions from './pages/RolePermissions';
import Suppliers from './pages/Suppliers';
import OrganisationManage from './pages/OrganisationManage';
import Analytics from './pages/Analytics';
import Locations from './pages/Locations';
import CRM from './pages/CRM';
import WorkSchedules from './pages/WorkSchedules';
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import StockAudit from './pages/StockAudit';
import ResetData from './pages/ResetData';
import EmployeeSelfService from './pages/EmployeeSelfService';
import Calendar from './pages/Calendar';
import HRAnalytics from './pages/HRAnalytics';
import Reports from './pages/Reports';
import Documents from './pages/Documents';
import UserManagement from './pages/UserManagement';
import InventoryFix from './pages/InventoryFix';
import OrphanedData from './pages/OrphanedData';
import ConstructionExpense from './pages/ConstructionExpense';
import ExpenseManagement from './pages/ExpenseManagement';
import UploadedDocuments from './pages/UploadedDocuments';
import HRManagement from './pages/HRManagement';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Sales": Sales,
    "Inventory": Inventory,
    "Transport": Transport,
    "Communication": Communication,
    "Finance": Finance,
    "ActivityLog": ActivityLog,
    "Settings": Settings,
    "Support": Support,
    "Attendance": Attendance,
    "Profile": Profile,
    "RolePermissions": RolePermissions,
    "Suppliers": Suppliers,
    "OrganisationManage": OrganisationManage,
    "Analytics": Analytics,
    "Locations": Locations,
    "CRM": CRM,
    "WorkSchedules": WorkSchedules,
    "Landing": Landing,
    "Privacy": Privacy,
    "Terms": Terms,
    "StockAudit": StockAudit,
    "ResetData": ResetData,
    "EmployeeSelfService": EmployeeSelfService,
    "Calendar": Calendar,
    "HRAnalytics": HRAnalytics,
    "Reports": Reports,
    "Documents": Documents,
    "UserManagement": UserManagement,
    "InventoryFix": InventoryFix,
    "OrphanedData": OrphanedData,
    "ConstructionExpense": ConstructionExpense,
    "ExpenseManagement": ExpenseManagement,
    "UploadedDocuments": UploadedDocuments,
    "HRManagement": HRManagement,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};