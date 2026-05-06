import { Tab, TabGroup, TabList, TabPanels } from "@headlessui/react";

const Tabs = ({ tabs, setSelected, children }) => {
    <div className="w-full">
        <TabGroup onChange={setSelected}>
            <TabList className="flex space-x-1 rounded-xl bg-gray-100 p-1">
                {tabs.map((tab, i) => (
                    <Tab
                        key={tab.title}
                        onClick={() => setSelected(i)}
                        className={({ selected }) =>
                            `flex items-center 
                        gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px
                        ${selected ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                        }
                    >
                        <span className="text-base">{tab.icon}</span>
                        <span>{tab.title}</span>
                    </Tab>
                ))} 
            </TabList>
            <TabPanels className="w-full">
                {children}
            </TabPanels>
        </TabGroup>
    </div>
};

export default Tabs;