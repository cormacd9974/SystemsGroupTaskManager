// Headless UI imports for accessible, unstyled tab components
import { Tab, TabGroup, TabList, TabPanels } from "@headlessui/react";

/**
 * Reusable Tabs Component - Provides accessible tabbed interface using Headless UI
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.tabs - Array of tab objects containing title and icon properties
 * @param {Function} props.setSelected - Callback function to handle tab selection changes
 * @param {React.ReactNode} props.children - Tab panel content (typically TabPanel components)
 *
 * Architecture decisions:
 * - Uses Headless UI for accessibility compliance (ARIA attributes, keyboard navigation)
 * - Implements compound component pattern where parent provides both tabs config and panel content
 * - Separates tab configuration from content rendering for maximum flexibility
 *
 * Design patterns:
 * - Render props pattern via Headless UI for dynamic styling based on selection state
 * - Controlled component pattern - parent manages selected state
 * - Composition pattern - children prop allows flexible content structure
 *
 * Accessibility features:
 * - Full keyboard navigation support (arrow keys, tab, enter, space)
 * - Screen reader announcements for tab changes
 * - Proper ARIA roles and attributes automatically applied
 * - Focus management handled by Headless UI
 *
 * Usage example:
 * <Tabs
 *   tabs={[{title: "Overview", icon: <IconComponent />}]}
 *   setSelected={handleTabChange}
 * >
 *   <TabPanel>Content for first tab</TabPanel>
 * </Tabs>
 *
 * @returns {JSX.Element} Rendered tabs component with header and content areas
 */
const Tabs = ({ tabs, setSelected, children }) => {
  return (
    <div className="w-full">
      {/* TabGroup provides the main container and manages tab state */}
      {/* onChange prop connects internal Headless UI state to parent component */}
      <TabGroup onChange={setSelected}>
        {/* Tab navigation header */}
        {/* Design decision: Uses pill-style container with rounded corners for modern appearance */}
        <TabList className="flex space-x-1 rounded-xl bg-gray-100 p-1">
          {/* Iterate through tabs configuration to render individual tab buttons */}
          {tabs.map((tab, i) => (
            <Tab
              key={tab.title} // Use title as key for stable component identity
              onClick={() => setSelected(i)} // Explicit click handler for additional control
              // Render prop pattern: className function receives selection state
              // This allows dynamic styling based on whether tab is currently active
              className={({ selected }) =>
                `flex items-center 
                            gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px
                            ${
                              selected
                                ? "border-blue-500 text-blue-600" // Active state: Blue theme for selected tab
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" // Inactive state: Subtle hover effects
                            }`
              }
            >
              {/* Tab icon display */}
              {/* UX consideration: Icons provide quick visual identification of tab purpose */}
              {/* Accessibility: Icons are decorative here, with text labels providing context */}
              <span className="text-base">{tab.icon}</span>

              {/* Tab title text */}
              {/* Primary label for tab identification and screen reader accessibility */}
              <span>{tab.title}</span>
            </Tab>
          ))}
        </TabList>

        {/* Tab content container */}
        {/* Design pattern: Content is provided via children prop for maximum flexibility */}
        {/* Parent component is responsible for providing TabPanel components as children */}
        <TabPanels className="w-full">{children}</TabPanels>
      </TabGroup>
    </div>
  );
};

/**
 * Export the Tabs component as default export
 *
 * Component Summary:
 * - Provides accessible, keyboard-navigable tabbed interface
 * - Built on Headless UI for robust accessibility and behavior
 * - Implements flexible composition pattern for content management
 * - Uses modern styling with smooth transitions and hover effects
 * - Supports icons and text labels for enhanced UX
 *
 * Key Features:
 * - Full accessibility compliance (WCAG guidelines)
 * - Keyboard navigation (arrow keys, tab, enter, space)
 * - Screen reader support with proper ARIA attributes
 * - Smooth visual transitions between states
 * - Responsive design with flexible width
 * - Icon + text tab labels for better usability
 *
 * Integration Points:
 * - Requires parent to manage selected tab state
 * - Expects tabs array with title and icon properties
 * - Children should be TabPanel components from Headless UI
 * - Callback function needed for handling tab selection changes
 *
 * Performance Considerations:
 * - Uses stable keys (tab.title) for efficient re-rendering
 * - Headless UI handles internal optimizations for state management
 * - CSS transitions provide smooth visual feedback without JavaScript animations
 *
 * Styling Architecture:
 * - Uses Tailwind CSS for consistent design system integration
 * - Implements semantic color scheme (blue for active, gray for inactive)
 * - Responsive spacing and typography for various screen sizes
 * - Hover states provide clear interactive feedback
 */
export default Tabs;
