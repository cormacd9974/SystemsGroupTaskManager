// Central export file for shared UI components
// This allows other files to import multiple components from one place.

import AddUser from "./AddUser";
import Button from "./Button";
import ChangePassword from "./ChangePassword";
import { Chart } from "./Chart";
import ConfirmationDialog, { UserAction } from "./ConfirmationDialog";
import Loading from "./Loading";
import ModalWrapper from "./ModalWrapper";
import Navbar from "./Navbar";
import NotificationPanel from "./NotificationPanel";
import SelectList from "./SelectList";
import Sidebar from "./Sidebar";
import Table from "./Table";
import Tabs from "./Tabs";
import Textbox from "./Textbox";
import Title from "./Title";
import UserAvatar from "./UserAvatar";
import UserInfo from "./UserInfo";
import ViewNotification from "./ViewNotification";

// Re-export all shared components for cleaner imports elsewhere in the app
export {
    AddUser,
    Button,
    ChangePassword,
    Chart, 
    ConfirmationDialog, 
    Loading, 
    ModalWrapper, 
    Navbar, 
    NotificationPanel, 
    SelectList,
    Sidebar, 
    Table,
    Tabs,
    Textbox, 
    Title,
    UserAction,
    UserAvatar, 
    UserInfo,
    ViewNotification
};