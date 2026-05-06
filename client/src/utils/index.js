export const formatDate = (date) => {
    const month = date.tolLocaleString("en-US", {month: "short"});
    return `${date.getDate()}-${month}-${date.getFullYear()}`;
};

export function dateFormatter(dateString) {
    const d = new Date(dateString);
    if(isNaN(d)) {
        return "Invalid Date";
    }
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function  getInitials(fullName) {
    if(!fullName) return "?";
    return fullName.split(" ").slice(0, 2).map((name) => name[0].toUpperCase()).join("");
};

export const updateURL = ({ searchTerm, navigate, location}) => {
    const params = new URLSearchParams();
    if(searchTerm) params.set("search", searchTerm);
    const newURL = `${location?.pathname}?${params.toString()}`;
    navigate(newURL, { replace: true });
    return newURL;
}

export const TASK_TYPE = {
    todo: "bg-blue-600",
   "in progress": "bg-yellow-600",
    completed: "bg-green-600"
};
export const BGS = [
    "bg-blue-600",
    "bg-yellow-600",
    "bg-red-600",
    "bg-green-600",
];

export const getCompletedSubTasks = (items) =>
    items?.filter(i => i?.isCompleted).length || 0;

export const CATEGORY_LABEL = {
    "report-created": "Report . Created",
    "report-enhanced": "Report . Enhanced",
    "report-validated": "Report . Validated",
    "config-new": "Config . New",
    "config-updated": "Config . Updated",
    "project-new": "Project . New",
};