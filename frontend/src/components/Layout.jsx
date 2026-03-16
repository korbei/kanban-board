import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, KanbanSquare, LayoutDashboard, FolderKanban } from 'lucide-react';
import { useTheme } from './ThemeProvider.jsx';

export default function Layout() {
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isTasksPage = location.pathname.includes('/tasks');
  const isDashboard = location.pathname === '/';
  const isProjects = location.pathname === '/projects';

  return (
    <div className="min-h-screen bg-nord6 dark:bg-nord0 transition-colors duration-300">
      <header className="sticky top-0 z-40 bg-nord5/80 dark:bg-nord1/80 backdrop-blur-md border-b border-nord4 dark:border-nord2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {isTasksPage && (
                <button
                  onClick={() => navigate('/projects')}
                  className="p-2 rounded-lg text-nord3 dark:text-nord4 hover:bg-nord4/50 dark:hover:bg-nord2/50 transition-colors"
                  aria-label="Back to projects"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <KanbanSquare size={24} className="text-nord9" />
                <h1 className="text-xl font-semibold text-nord0 dark:text-nord6">
                  Kanban Board
                </h1>
              </div>

              {/* Navigation tabs */}
              {!isTasksPage && (
                <nav className="flex items-center gap-1 ml-6">
                  <button
                    onClick={() => navigate('/')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isDashboard
                        ? 'bg-nord9/15 text-nord9 dark:bg-nord9/20 dark:text-nord8'
                        : 'text-nord3 dark:text-nord4 hover:bg-nord4/50 dark:hover:bg-nord2/50'
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/projects')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isProjects
                        ? 'bg-nord9/15 text-nord9 dark:bg-nord9/20 dark:text-nord8'
                        : 'text-nord3 dark:text-nord4 hover:bg-nord4/50 dark:hover:bg-nord2/50'
                    }`}
                  >
                    <FolderKanban size={16} />
                    Projects
                  </button>
                </nav>
              )}
            </div>

            <button
              onClick={toggle}
              className="p-2 rounded-lg text-nord3 dark:text-nord4 hover:bg-nord4/50 dark:hover:bg-nord2/50 transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
