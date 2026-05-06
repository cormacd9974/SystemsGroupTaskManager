const Loading = () => (
    <div className="flex items-center justify-center gap-1.5 py-2">
        {[0, 1, 2].map(i => (
        <div 
        key={i}
        className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
        />
        ))}
    </div>
)

export default Loading;