// Format a Date object as DD-MMM-YYYY
export const formatDate = (date) => {
    const month = date.toLocaleString("en-US", {month: "short"});
    return `${date.getDate()}-${month}-${date.getFullYear()}`;
};

// Convert a date string into YYYY-MM-DD format
export function dateFormatter(dateString) {
    const d = new Date(dateString);
    if(isNaN(d)) {
        return "Invalid Date";
    }
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Get up to 2 initials from a person's name
export function  getInitials(name) {
    if(!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

// Update the URL with a search term and replace the current history entry
export const updateURL = ({ searchTerm, navigate, location}) => {
    const params = new URLSearchParams();
    if(searchTerm) params.set("search", searchTerm);
    const newURL = `${location?.pathname}?${params.toString()}`;
    navigate(newURL, { replace: true });
    return newURL;
}

// Task stage color mapping
export const TASK_TYPE = {
    todo: "bg-blue-600",
   "in-progress": "bg-yellow-600",
    completed: "bg-green-600"
};

// Background color options used for avatars or badges
export const BGS = [
    "bg-[#0068B5]",
    "bg-[#004f8c]",
    "bg-[#003d6d]",
    "bg-[#005a9e]",
    "bg-[#0079cc]",
    "bg-[#0086e0]",
    "bg-[#0057a0]",
    "bg-[#0073c6]",
    "bg-[#004a85]",
    "bg-[#006ab8]"
];

// Count how many sub-tasks are marked as completed
export const getCompletedSubTasks = (items) =>
    items?.filter(i => i?.isCompleted).length || 0;

// Friendly labels for task categories
export const CATEGORY_LABEL = {
    "report-created": "Report . Created",
    "report-enhanced": "Report . Enhanced",
    "report-validated": "Report . Validated",
    "config-new": "Config . New",
    "config-updated": "Config . Updated",
    "project-new": "Project . New",
    "other" : "Other"
};