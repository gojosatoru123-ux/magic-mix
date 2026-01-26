import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Calendar, 
  StickyNote, 
  Lightbulb, 
  Folder, 
  Share2, 
  Settings,
  ChevronUp,
  ChevronDown,
  Network,
  Layers
} from "lucide-react";

interface AppSidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

const AppSidebar = ({ activeNav, onNavChange }: AppSidebarProps) => {
  const [noteExpanded, setNoteExpanded] = useState(true);

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "calendar", icon: Calendar, label: "Calendar" },
    { id: "flashcards", icon: Layers, label: "Flashcards" },
    { id: "graph", icon: Network, label: "Graph View" },
  ];

  const noteSubItems = [
    { id: "ideas", icon: Lightbulb, label: "Ideas" },
    { id: "folder", icon: Folder, label: "Folder" },
  ];

  const bottomNavItems = [
    { id: "shared", icon: Share2, label: "Shared" },
    { id: "setting", icon: Settings, label: "Setting" },
  ];

  const isNoteSection = activeNav === "ideas" || activeNav === "folder";

  return (
    <aside className="w-64 h-full sidebar-gradient flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-6 pb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <span className="text-white font-bold text-sm">🐘</span>
          </div>
          <span className="text-xl font-semibold text-white">
            Eleph<span className="text-gold-400">ant</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            className={`nav-link w-full ${activeNav === item.id ? 'active' : ''}`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </motion.button>
        ))}

        {/* Note Section with Dropdown */}
        <div className="pt-2">
          <motion.button
            onClick={() => setNoteExpanded(!noteExpanded)}
            className={`nav-link w-full justify-between ${isNoteSection ? 'active' : ''}`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <StickyNote className="w-5 h-5" />
              <span className="font-medium">Note</span>
            </div>
            {noteExpanded ? (
              <ChevronUp className="w-4 h-4 opacity-60" />
            ) : (
              <ChevronDown className="w-4 h-4 opacity-60" />
            )}
          </motion.button>

          <AnimatePresence>
            {noteExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-4 mt-1 space-y-1 border-l border-white/20 pl-3">
                  {noteSubItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => onNavChange(item.id)}
                      className={`nav-link w-full text-sm ${activeNav === item.id ? 'active' : ''}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Nav Items */}
        <div className="pt-4 space-y-1">
          {bottomNavItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`nav-link w-full ${activeNav === item.id ? 'active' : ''}`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 flex-shrink-0">
        <motion.div 
          className="flex items-center gap-3 p-3 rounded-xl bg-white/10 cursor-pointer hover:bg-white/15 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
            alt="User avatar"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Jemka Gasanov</p>
            <p className="text-xs text-white/60 truncate">Apple Designer</p>
          </div>
          <ChevronUp className="w-4 h-4 text-white/60" />
        </motion.div>
      </div>
    </aside>
  );
};

export default AppSidebar;