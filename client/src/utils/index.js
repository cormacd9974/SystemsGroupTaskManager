export const formatDate = (date) => {
    const month = date.toLocaleString("en-US", {month: "short"});
    return `${date.getDate()}-${month}-${date.getFullYear()}`;
};

export function dateFormatter(dateString) {
    const d = new Date(dateString);
    if(isNaN(d)) {
        return "Invalid Date";
    }
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function  getInitials(name) {
    if(!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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
   "in-progress": "bg-yellow-600",
    completed: "bg-green-600"
};
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