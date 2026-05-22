import { BiMessageAltDetail } from "react-icons/bi";
import { FaList } from "react-icons/fa";
import { MdAttachFile } from "react-icons/md";
import { getCompletedSubTasks} from "../../utils";

// Displays compact task metadata such as:
// - number of activities/comments
// - number of attachments
// - completed sub-tasks out of total sub-tasks
const TaskAssets = ({ activities, assets, subTasks }) => (
    <div className="flex items-center gap-3">
        {/* Activities count */}
        <div className="flex gap-1 items-center text-xs text-gray-500">
            <BiMessageAltDetail />
            <span>{activities}</span>
        </div>

        {/* Attachments count */}
        <div className="flex gap-1 items-center text-xs text-gray-500">
            <MdAttachFile />
            <span>{assets}</span>
        </div>

        {/* Completed sub-task count */}
        <div className="flex gap-1 items-center text-xs text-gray-500">
            <FaList />
            <span>{getCompletedSubTasks(subTasks)}/{subTasks?.length}</span>
        </div>
    </div>
);

// Export the TaskAssets component
export default TaskAssets;