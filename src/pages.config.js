import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import HR from './pages/HR';
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
import EmployeeDashboard from './pages/EmployeeDashboard';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Locations from './pages/Locations';
import HRAnalytics from './pages/HRAnalytics';
import CRM from './pages/CRM';
import WorkSchedules from './pages/WorkSchedules';
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import StockAudit from './pages/StockAudit';
import ResetData from './pages/ResetData';
import EmployeeSelfService from './pages/EmployeeSelfService';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Sales": Sales,
    "Inventory": Inventory,
    "HR": HR,
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
    "EmployeeDashboard": EmployeeDashboard,
    "Analytics": Analytics,
    "Reports": Reports,
    "Locations": Locations,
    "HRAnalytics": HRAnalytics,
    "CRM": CRM,
    "WorkSchedules": WorkSchedules,
    "Landing": Landing,
    "Privacy": Privacy,
    "Terms": Terms,
    "StockAudit": StockAudit,
    "ResetData": ResetData,
    "EmployeeSelfService": EmployeeSelfService,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};