import { useAuth } from "../../context/AuthContext";

// returns greetings based on the current time and day
function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12 ) return 'Morning'
    if (hour < 17) return 'Afternoon'
    return 'Evening'
}

export default function Header({ user }) {
    const { logout } = useAuth()

    return (
        <header 
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-gray-100"
        style={{ backgroundColor: '#FBFBFD'}}
        >
            {/* left side: greeting + streak badge */}
            <div className="flex items-center gap-3">
                <div>
                    <p className="text-sm text-gray-500">
                        {getGreeting()}
                    </p>
                    <p className="font-semibold text-gray-800" style={{ color: ' #253244'}} >
                        {user?.name?.split(' ')[1]} 👋
                    </p>
                </div>

                {/* Streak badge */}
                <div
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: '#3AA76D'}}
                >
                   🔥 <span>0 days</span>
                </div>
            </div>

            {/* right side: quick action icon */}
            <div className="flex items-center gap-4">
                {/* add check-in */}
                <button className="text-gray-500 hover:text-gray-700 text-xl">+</button>

                {/* journal */}
                <button className="text-gray-500 hover:text-gray-700 text-xl">📖</button>

                {/* Logout */}
                <button 
                onClick={logout}
                className="text-sm text-red-400 hover:text-red-600"
                >
                    Logout
                </button>
            </div>
        </header>
    )
}