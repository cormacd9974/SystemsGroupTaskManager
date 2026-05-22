// Simple loading indicator made of three animated bouncing dots
const Loading = () => (
    <div className="flex items-center justify-center gap-1.5 py-2">
        {[0, 1, 2].map(i => (
        <div 
        key={i}
        className="w-2 h-2 rounded-full animate-bounce"
        // Stagger each dot animation slightly for a smoother loading effect
        style={{ animationDelay: `${i * 0.15}s`, backgroundColor: "0068B5" }}
        />
        ))}
    </div>
)

// Export the Loading component
export default Loading;