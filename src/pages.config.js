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
import OrganisationSetup from './pages/OrganisationSetup';
import OrganisationManage from './pages/OrganisationManage';
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
    "OrganisationSetup": OrganisationSetup,
    "OrganisationManage": OrganisationManage,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};