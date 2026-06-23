// React hooks for component state and lifecycle management
import { useState, useEffect } from "react"; // State management and side effects
import { FaList } from "react-icons/fa"; // Font Awesome list icon for list view tab

// Redux and routing imports (commented imports preserved for context)
//import { useSelector } from "react-redux"; // Redux state access (currently unused)
import { IoMdAdd } from "react-icons/io"; // Ionicons add icon for new task button
import { FiDownload } from "react-icons/fi"; // Feather download icon (for future CSV export)

// Additional UI icons and components
import { MdGridView } from "react-icons/md"; // Material Design grid icon for board view tab
import { Loading, Table, Tabs, Title } from "../components"; // Reusable UI components
import { AddTask, BoardView } from "../components/tasks"; // Task-specific components
import { useGetAllTaskQuery } from "../redux/slices/api/taskApiSlice"; // RTK Query hook for task data
import { useSearchParams } from "react-router-dom"; // Hook for URL search parameter access

/**
 * Tab configuration for view switching
 * Provides two distinct ways to visualize and interact with tasks
 *
 * Design decision: Board view for visual workflow management, List view for detailed data display
 */
const TABS = [
  { title: "Board View", icon: <MdGridView /> }, // Kanban-style board for visual task management
  { title: "List View", icon: <FaList /> }, // Table-based view for detailed task information
];

/**
 * Tasks Component - Main task management interface with multiple view modes
 *
 * @component
 *
 * Architecture decisions:
 * - Dual view modes (Board/List) for different user preferences and use cases
 * - URL-based search integration for shareable filtered views
 * - Stage-based filtering for workflow management
 * - Modal-based task creation for focused input experience
 * - Real-time data fetching with automatic updates
 *
 * UX considerations:
 * - Persistent view selection within session
 * - Clear visual feedback for active filters
 * - Task count display for immediate context
 * - Smooth scrolling behavior for modal interactions
 * - Loading states for better perceived performance
 *
 * Business features:
 * - Comprehensive task filtering by stage and search terms
 * - Multiple visualization modes for different workflows
 * - Quick task creation with immediate feedback
 * - Scalable interface supporting large task datasets
 *
 * @returns {JSX.Element} Complete task management interface with filtering and view options
 */
const Tasks = () => {
  /**
   * URL parameter integration for search functionality
   * Enables shareable URLs with search filters applied
   */

  // Extract search parameters from URL for persistent search state
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || ""; // Default to empty string if no search param

  /**
   * Local state management for UI interactions
   */

  // Controls the visibility of the "Add Task" modal
  // Modal pattern: Provides focused task creation experience
  const [open, setOpen] = useState(false);

  // Redux user state access (currently commented out but preserved for future use)
  //const { user } = useSelector((state) => state.auth);

  // Active view tab selection (0 = Board View, 1 = List View)
  // Allows users to switch between different task visualization modes
  const [selected, setSelected] = useState(0);

  // Current stage filter for task workflow management
  // Empty string shows all tasks, specific stages filter by workflow status
  const [stageFilter, setStageFilter] = useState("");

  /**
   * Data fetching with dynamic filtering
   * RTK Query provides efficient caching and automatic re-fetching
   *
   * Query parameters:
   * - strQuery: Stage-based filtering (all, todo, in-progress)
   * - isTrashed: Exclude deleted tasks (empty string = not trashed)
   * - search: Text-based search filtering from URL parameters
   */
  const { data, isLoading } = useGetAllTaskQuery(
    {
      strQuery: stageFilter,
      isTrashed: "",
      search: searchTerm,
    },
    {
      refetchOnMountOrArgChange: true, // Ensures fresh data on component mount
    },
  );

  /**
   * Future CSV export functionality (preserved for implementation)
   * Business requirement: Allow users to export task data for external analysis
   */
  /*const { user } = useSelector(s => s.auth);
    const exportToCSV = () => {
        const tasks = data?.tasks || [];
        if(tasks.length === 0) return;
        const headers = ["Title", "Category", "Stage", "Priority", "Start Date", "Due Date", "Team", "Sub-tasks"];
        const rows = tasks.map(t => [
            `"${(t.title || "").replace(/"/g, '""')}"`,
                t.category || "",
                t.stage || "",
                t.priority || "",
                t.startDate ? new Date(t.startDate).toLocaleDateString() : "",
                t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "",

        ])
    }*/ //Possible export to csv function
  const exportToExcel = () => {
    const tasks = data?.tasks || [];
    if (tasks.length === 0) return;

    const esc = (v) =>
      String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const stageLabel = (s) =>
      s === "todo"
        ? "To Do"
        : s === "in-progress"
          ? "In Progress"
          : s === "completed"
            ? "Completed"
            : s || "";

    // Column widths in points (bigger number = wider column)
    const cols = [
      { label: "Title", width: 260 }, // ← wide
      { label: "Stage", width: 80 },
      { label: "Priority", width: 70 },
      { label: "Category", width: 160 }, // ← wide
      { label: "Due Date", width: 80 },
      { label: "Sub-tasks", width: 70 },
      { label: "Team", width: 200 },
    ];

    const header = `<Row>${cols
      .map(
        (c) =>
          `<Cell ss:StyleID="hdr"><Data ss:Type="String">${esc(c.label)}</Data></Cell>`,
      )
      .join("")}</Row>`;

    const body = tasks
      .map((t) => {
        const completed = (t.subTasks || []).filter(
          (s) => s.isCompleted,
        ).length;
        const total = (t.subTasks || []).length;
        const cells = [
          t.title || "",
          stageLabel(t.stage),
          t.priority
            ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1)
            : "",
          t.category || "",
          t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-IE") : "",
          total > 0 ? `${completed}/${total}` : "No sub-tasks",
          (t.team || []).map((m) => m.name).join(", "),
        ];
        return `<Row>${cells
          .map((v) => `<Cell><Data ss:Type="String">${esc(v)}</Data></Cell>`)
          .join("")}</Row>`;
      })
      .join("");

    const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="hdr">
<Font ss:Bold="1" ss:Color="#FFFFFF"/>
<Interior ss:Color="#0068B5" ss:Pattern="Solid"/>
</Style>
</Styles>
<Worksheet ss:Name="Tasks">
<Table>
${cols.map((c) => `<Column ss:Width="${c.width}"/>`).join("")}
${header}
${body}
</Table>
</Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasks-${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Side effect for smooth scrolling behavior
   * UX enhancement: Ensures modal interactions don't leave users disoriented
   * Triggers when add-task modal state changes to provide consistent navigation experience
   */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [open]); // Dependency on modal open state

  /**
   * Loading state handling
   * Provides user feedback during initial data fetch and filter changes
   */
  return isLoading ? (
    <div className="py-16 flex justify-center">
      <Loading />
    </div>
  ) : (
    <div className="w-full space-y-4">
      {/* Page header with title, task count, and primary action */}
      {/* Design: Clear hierarchy with title on left, action on right */}
      <div className="flex items-center justify-between">
        <div>
          {/* Page title component for consistent styling */}
          <Title title="Tasks" />

          {/* Task count for immediate context and data awareness */}
          {/* UX: Helps users understand the scope of their task list */}
          <p className="text-sm text-gray-400 mt-0.5">
            {data?.tasks?.length || 0} tasks
          </p>
        </div>

        {/* Primary action button for task creation */}
        {/* Design: Prominent placement and styling for key user action */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel} // Opens the task creation modal
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-[#0068B5] hover:text-[#0068B5] transition-colors"
          >
            <FiDownload className="text-base" />
            <span>Export to Excel</span>
          </button>
          <button
            onClick={() => setOpen(true)} // Opens the task creation modal
            className="btn-primary flex items-center gap-2"
          >
            <IoMdAdd className="text-lg" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Stage filter buttons for workflow management */}
      {/* UX: Toggle-style buttons for clear filter state indication */}
      <div>
        {["", "todo", "in-progress"].map((stage) => (
          <button
            key={stage}
            onClick={() => setStageFilter(stage)} // Updates active filter
            className={`px-4 py-2 rounded-lg text-xs font-medium border ${
              stageFilter === stage
                ? "border-[#0068B5] text-white" // Active state: Brand blue with white text
                : "text-gray-700 border-gray-200 bg-white hover:border-[#0068B5]" // Inactive state: Gray with hover effect
            }`}
            // Dynamic background color for active state
            style={stageFilter === stage ? { backgroundColor: "#0068B5" } : {}}
          >
            {/* User-friendly filter labels */}
            {/* Business logic: Maps internal stage values to readable labels */}
            {stage === "" ? "All" : stage === "todo" ? "To Do" : "In Progress"}
          </button>
        ))}
      </div>

      {/* Main content container with tabbed view switching */}
      {/* Design: Card-based layout with clean borders and subtle shadows */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <Tabs tabs={TABS} setSelected={setSelected}>
          {/* Conditional padding based on selected view */}
          {/* Design decision: Board view handles its own padding, List view needs container padding */}
          <div className={selected === 0 ? "" : "p-4"}>
            {/* Conditional rendering based on active tab */}
            {/* Architecture: Separate components for different visualization modes */}
            {
              selected === 0 ? (
                <BoardView tasks={data?.tasks} /> // Kanban-style board for visual workflow
              ) : (
                <Table tasks={data?.tasks} />
              ) // Detailed table view for comprehensive data
            }
          </div>
        </Tabs>
      </div>

      {/* Task creation modal */}
      {/* Modal pattern: Provides focused, distraction-free task creation experience */}
      {/* Conditional rendering: Only mounts when needed for performance */}
      <AddTask open={open} setOpen={setOpen} />
    </div>
  );
};

/**
 * Export the Tasks component as default export
 *
 * Component Summary:
 * - Comprehensive task management interface with dual view modes
 * - URL-integrated search functionality for shareable filtered views
 * - Stage-based filtering for workflow management
 * - Modal-based task creation with smooth UX transitions
 * - Real-time data integration with automatic updates
 *
 * Key Features:
 * - Board View: Kanban-style visual workflow management
 * - List View: Detailed table format for comprehensive task data
 * - Stage filtering: All, To Do, In Progress workflow states
 * - URL search integration: Persistent and shareable search filters
 * - Task count display: Immediate context for data scope
 * - New task creation: Modal-based focused input experience
 * - Loading states: User feedback during data operations
 *
 * Data Integration:
 * - RTK Query for efficient data fetching and caching
 * - Dynamic filtering with real-time updates
 * - URL parameter integration for persistent search state
 * - Automatic refetching on component mount and filter changes
 *
 * UX Design Principles:
 * - Clear visual hierarchy with title, count, and primary action
 * - Toggle-style filter buttons with active state indication
 * - Smooth scrolling behavior for modal interactions
 * - Responsive design adapting to different screen sizes
 * - Consistent styling with application design system
 *
 * Architecture Patterns:
 * - Component composition with specialized view components
 * - Modal pattern for focused task creation
 * - Tabbed interface for view mode switching
 * - URL state integration for shareable application state
 * - Conditional rendering for performance optimization
 *
 * Business Value:
 * - Multiple workflow visualization options for different user preferences
 * - Efficient task filtering and search capabilities
 * - Scalable interface supporting large task datasets
 * - Quick task creation with immediate feedback
 * - Shareable filtered views for team collaboration
 *
 * Future Enhancements:
 * - CSV export functionality (code structure prepared)
 * - User-specific task filtering (Redux integration ready)
 * - Advanced search and filtering options
 * - Bulk task operations and management
 * - Custom view preferences and saved filters
 */
export default Tasks;
