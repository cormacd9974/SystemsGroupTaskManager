// ── Dashboard.jsx ─────────────────────────────────────────────
export const dashboardData = {
  totalTasks: 12,
  last10Task: [
    { _id: "1", title: "COS/AE Job Maintenance",        stage: "in progress", priority: "high",   date: new Date(), team: [{ name: "Dunne, Cormac",   title: "Production Engineer" }],    category: "report-created"   },
    { _id: "2", title: "Executive Summary Maintenance", stage: "todo",        priority: "medium", date: new Date(), team: [{ name: "Acharya, Sushanti",   title: "Production Engineer" }],    category: "report-enhanced"  },
    { _id: "3", title: "REV CEID Creation",             stage: "completed",   priority: "normal", date: new Date(), team: [{ name: "Allen, Michael",    title: "Production Engineer" }], category: "config-new"       },
    { _id: "4", title: "STRS Auto-Update Maintenance",  stage: "in progress", priority: "high",   date: new Date(), team: [{ name: "Dunne, Cormac",   title: "Production Engineer" }],    category: "project-new"      },
    { _id: "5", title: "CT Goal Work",                  stage: "completed",   priority: "medium", date: new Date(), team: [{ name: "Acharya, Sushanti",   title: "Production Engineer" }],    category: "report-validated" },
  ],
  users: [
    { _id: "1", name: "Dunne, Cormac",   role: "Production Engineer",    isActive: true,  createdAt: new Date() },
    { _id: "2", name: "Acharya, Sushanti",   role: "Production Engineer",    isActive: true,  createdAt: new Date() },
    { _id: "3", name: "Allen, Michael",    role: "Production Engineer", isActive: true,  createdAt: new Date() },
    { _id: "4", name: "Vechoorkaroot, Don Sam", role: "Production Engineer",     isActive: false, createdAt: new Date() },
  ],
  teamStatus: [
    {
      _id: "1", name: "Dunne, Cormac", title: "Production Engineer",
      inProgressTasks: [
        { _id: "1", title: "COS/AE Job Maintenance",       priority: "high",   category: "report-created", stage: "in progress" },
        { _id: "4", title: "STRS Auto-Update Maintenance", priority: "high",   category: "project-new",    stage: "in progress" },
      ],
    },
    {
      _id: "2", name: "Acharya, Sushanti", title: "Production Engineer",
      inProgressTasks: [
        { _id: "2", title: "Executive Summary Maintenance", priority: "medium", category: "report-enhanced", stage: "in progress" },
      ],
    },
    {
      _id: "3", name: "Allen, Michael", title: "Production Engineer",
      inProgressTasks: [],
    },
    {
      _id: "4", name: "Vechoorkaroot, Don Sam", title: "Production Engineer",
      inProgressTasks: [],
    },
  ],
  tasks: { completed: 4, "in progress": 5, todo: 3 },
  graphData: [
    { name: "high",   total: 4 },
    { name: "medium", total: 5 },
    { name: "normal", total: 2 },
    { name: "low",    total: 1 },
  ],
};
// ── Tasks.jsx ─────────────────────────────────────────────────
export const tasksData = {
  tasks: [
    { _id: "1", title: "COS/AE Job Maintenance",        stage: "in progress", priority: "high",   category: "report-created",   date: new Date(), team: [{ name: "Dunne, Cormac" }],   activities: [], subTasks: [], assets: [] },
    { _id: "2", title: "Executive Summary Maintenance", stage: "todo",        priority: "medium", category: "report-enhanced",  date: new Date(), team: [{ name: "Acharya, Sushanti" }],   activities: [], subTasks: [], assets: [] },
    { _id: "3", title: "REV CEID Creation",             stage: "completed",   priority: "normal", category: "report-validated", date: new Date(), team: [{ name: "Allen, Michael" }],    activities: [], subTasks: [], assets: [] },
    { _id: "4", title: "STRS Auto-Update Maintenance",  stage: "in progress", priority: "high",   category: "config-new",       date: new Date(), team: [{ name: "Dunne, Cormac" }],   activities: [], subTasks: [], assets: [] },
    { _id: "5", title: "CT Goal Work",                  stage: "todo",        priority: "medium", category: "config-updated",   date: new Date(), team: [{ name: "Acharya, Sushanti" }],   activities: [], subTasks: [], assets: [] },
    { _id: "6", title: "New Hire Integration Project",  stage: "todo",        priority: "low",    category: "project-new",      date: new Date(), team: [{ name: "Vechoorkaroot, Don Sam" }], activities: [], subTasks: [], assets: [] },
    { _id: "7", title: "Q1 Production Report",          stage: "completed",   priority: "high",   category: "report-created",   date: new Date(), team: [{ name: "Allen, Michael" }],    activities: [], subTasks: [], assets: [] },
    { _id: "8", title: "System Config Baseline Update", stage: "in progress", priority: "medium", category: "config-updated",   date: new Date(), team: [{ name: "Dunne, Cormac" }],   activities: [], subTasks: [], assets: [] },
  ],
};
// ── Team.jsx ──────────────────────────────────────────────────
export const teamData = {
  teamStatus: [
    {
      _id: "1", name: "Dunne, Cormac", title: "Production Engineer",
      inProgressTasks: [
        { _id: "1", title: "COS/AE Job Maintenance",       priority: "high",   category: "report-created", stage: "in progress" },
        { _id: "4", title: "STRS Auto-Update Maintenance", priority: "high",   category: "config-new",     stage: "in progress" },
        { _id: "8", title: "System Config Baseline Update",priority: "medium", category: "config-updated", stage: "in progress" },
      ],
    },
    {
      _id: "2", name: "Acharya, Sushanti", title: "Production Engineer",
      inProgressTasks: [
        { _id: "2", title: "Executive Summary Maintenance", priority: "medium", category: "report-enhanced", stage: "in progress" },
      ],
    },
    {
      _id: "3", name: "Allen, Michael", title: "Production Engineer",
      inProgressTasks: [],
    },
    {
      _id: "4", name: "Vechoorkaroot, Don Sam", title: "Production Engineer",
      inProgressTasks: [],
    },
  ],
};
// ── History.jsx ───────────────────────────────────────────────
export const historyData = {
  tasks: [
    { _id: "3", title: "REV CEID Creation",          priority: "normal", category: "report-validated", updatedAt: new Date("2024-03-15"), team: [{ name: "Allen, Michael" }]    },
    { _id: "5", title: "CT Goal Work",               priority: "medium", category: "config-updated",   updatedAt: new Date("2024-02-20"), team: [{ name: "Acharya, Sushanti" }]   },
    { _id: "7", title: "Q1 Production Report",       priority: "high",   category: "report-created",   updatedAt: new Date("2024-01-10"), team: [{ name: "Dunne, Cormac" }]   },
    { _id: "8", title: "System Config Update",       priority: "low",    category: "config-new",       updatedAt: new Date("2024-04-01"), team: [{ name: "Vechoorkaroot, Don Sam" }] },
    { _id: "9", title: "New Hire Onboarding Setup",  priority: "medium", category: "project-new",      updatedAt: new Date("2024-03-28"), team: [{ name: "Allen, Michael" }]    },
    { _id: "10", title: "Annual Report Validation",  priority: "high",   category: "report-validated", updatedAt: new Date("2024-04-10"), team: [{ name: "Acharya, Sushanti" }]   },
    { _id: "11", title: "Config Rollback Procedure", priority: "normal", category: "config-updated",   updatedAt: new Date("2024-02-05"), team: [{ name: "Dunne, Cormac" }]   },
  ],
};
// ── Trash.jsx ─────────────────────────────────────────────────
export const trashData = {
  tasks: [
    { _id: "12", title: "Old Report Template v1",    stage: "todo",        priority: "low",    date: new Date("2024-01-05") },
    { _id: "13", title: "Deprecated Config File",    stage: "in progress", priority: "normal", date: new Date("2024-02-10") },
    { _id: "14", title: "Test Project Draft",        stage: "todo",        priority: "low",    date: new Date("2024-03-01") },
  ],
};
// ── Users.jsx (Settings page) ─────────────────────────────────
export const usersData = [
  { _id: "1", name: "Dunne, Cormac",   title: "Production Engineer",    email: "cormac@systemsgroup.com",   role: "Admin",               isActive: true  },
  { _id: "2", name: "Acharya, Sushanti",   title: "Production Engineer",    email: "sushanti@systemsgroup.com",  role: "Production Engineer",    isActive: true  },
  { _id: "3", name: "Allen, Michael",    title: "Production Engineer", email: "michael@systemsgroup.com",   role: "Production Engineer", isActive: true  },
  { _id: "4", name: "Vechoorkaroot, Don Sam", title: "Production Engineer",     email: "don@systemsgroup.com",  role: "Production Engineer",     isActive: false },
  { _id: "5", name: "Gliozeris, Mindaugas",    title: "Production Engineer",    email: "mindaugas@systemsgroup.com",   role: "Production Engineer",    isActive: true  },
];