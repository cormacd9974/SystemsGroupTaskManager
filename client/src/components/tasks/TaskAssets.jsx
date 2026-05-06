import { BiMessageAltDetail } from "react-icons/bi";
import { FaList } from "react-icons/fa";
import { MdAttachFile } from "react-icons/md";
import { getCompletedSubTasks} from "../../utils";

const TaskAssets = ({ activities, assets, subTasks }) => (
    <div className="flex items-center gap-3">
        <div className="flex gap-1 items-center text-xs text-gray-500">
            <BiMessageAltDetail />
            <span>{activities}</span>
        </div>
        <div className="flex gap-1 items-center text-xs text-gray-500">
            <MdAttachFile />
            <span>{assets}</span>
        </div>
        <div className="flex gap-1 items-center text-xs text-gray-500">
            <FaList />
            <span>{getCompletedSubTasks(subTasks)}/{subTasks?.length}</span>
        </div>
    </div>
);

export default TaskAssets;