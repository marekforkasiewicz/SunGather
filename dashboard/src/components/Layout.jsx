import { Outlet } from 'react-router-dom'
import { Sun, Moon, Activity } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Layout() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary-500" />
            <div>
              <h1 className="text-2xl font-bold">SunGather</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Solar Monitoring Dashboard</p>
            </div>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>SunGather v1.0.0 - Modern Solar Monitoring</p>
        </div>
      </footer>
    </div>
  )
}
