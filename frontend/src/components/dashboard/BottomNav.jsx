import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
    { label: 'Home', icon: '🏠', path:'/dashboard'},
    { label: 'Journal', icon: '📖', path:'/journal'},
    { label: 'Insights', icon:'📊', path:'/insights'},
    { label: 'Circle', icon:'👥', path:'/circle'},
    { label: 'Profile', icon:'👤', path:'/profile'},
]

export default function BottomNav() {
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex justify-center">
            <div className="max-w-lg mc-auto flex items-center justify-around py-2">
                {navItems.map((item) => {
                    //check if nav item mathces the curremt page
                    const isActive = location.pathname === item.path

                    return (
                        <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="flex flex-col items-center gap-1 px-3 py-1 min-w-[44px]"
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span 
                            className="text-xs font-medium"
                            style={{ color: isActive ? '#3AA76D' : '#9ca3af'}}
                            >
                                {item.label}
                            </span>
                            {/* active indicator dot */}
                            {isActive && (
                                <div
                                className="w-1 h-1 rounded-full"
                                style={{backgroundColor: '#3AA76D'}}
                                />
                            )}
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}