import { lazy } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import FiberOrdering from './pages/FiberOrdering';
import UserManagement from './pages/UserManagement';
import Supplier from './pages/Supplier';
import Settings from './pages/Settings';
import SiteSurvey from './pages/SiteSurvey';
import NaasPreDesign from './pages/NaasPreDesign';
import DesignCustomer from './pages/DesignCustomer';
import OrderProcessing from './pages/OrderProcessing';
import NaasInstallation from './pages/NaasInstallation';
import Rfs from './pages/Rfs';
import Analytics from './pages/Analytics';
import DataSources from './pages/DataSources';
import MyAccount from './pages/MyAccount';
import Contact from './pages/Contact';
import CriticalDataStreams from './pages/CriticalDataStreams';
import WorkflowPresentation from './pages/WorkflowPresentation';
import SiteOverview from './pages/SiteOverview';
import SiteProgressV2 from './pages/SiteProgressV2';
import DataViewer from './pages/DataViewer';
import __Layout from './Layout.jsx';

export const PAGES = {
    "Home": Home,
    "Login": Login,
    "FiberOrdering": FiberOrdering,
    "UserManagement": UserManagement,
    "Supplier": Supplier,
    "Settings": Settings,
    "SiteSurvey": SiteSurvey,
    "NaasPreDesign": NaasPreDesign,
    "DesignCustomer": DesignCustomer,
    "OrderProcessing": OrderProcessing,
    "NaasInstallation": NaasInstallation,
    "Rfs": Rfs,
    "Analytics": Analytics,
    "DataSources": DataSources,
    "MyAccount": MyAccount,
    "Contact": Contact,
    "CriticalDataStreams": CriticalDataStreams,
    "WorkflowPresentation": WorkflowPresentation,
    "SiteOverview": SiteOverview,
    "SiteProgress": SiteProgressV2,
    "DataViewer": DataViewer,
};

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};