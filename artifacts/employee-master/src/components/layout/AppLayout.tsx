import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, Users, MonitorSmartphone, Shield, 
  Trello, Mail, HardDrive, Database, PhoneCall, FileBarChart, 
  Settings, LogOut, Menu, X, ChevronRight, UserCircle,
  FolderTree, Server, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employee Master", icon: Users },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/system-users", label: "System Users", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

const serviceNavItems = [
  { href: "/branch-file-station", label: "Branch File Station", icon: FolderTree },
  { href: "/assetcuez", label: "Assetcues", icon: MonitorSmartphone },
  { href: "/vpn", label: "VPN", icon: Shield },
  { href: "/jira", label: "Jira", icon: Trello },
  { href: "/mailvault", label: "MailVault", icon: Mail },
  { href: "/ftp", label: "FTP", icon: HardDrive },
  { href: "/acronis", label: "Acronis Backup", icon: Database },
  { href: "/tata-tele", label: "Tata Tele", icon: PhoneCall },
];

export function AppLayout({ children, title }: AppLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isServiceActive = serviceNavItems.some(item => location === item.href);
  const [servicesOpen, setServicesOpen] = useState(isServiceActive);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarOpen ? "280px" : "0px",
          x: sidebarOpen ? 0 : -280
        }}
        className={`fixed md:relative z-50 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-shrink-0 shadow-2xl md:shadow-none overflow-hidden`}
      >
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border w-[280px]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-3 shadow-lg">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-display font-bold text-lg tracking-wide text-white">Light Finance</h1>
          <button className="ml-auto md:hidden text-sidebar-foreground/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto w-[280px] h-[calc(100vh-64px)] pb-24 scrollbar-thin">
          {/* Main Nav */}
          <div className="mb-4 px-2">
            <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3">Management</p>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
                return (
                  <Link key={item.href} href={item.href} className="block">
                    <div className={`
                      flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer
                      ${isActive 
                        ? 'bg-primary/15 text-primary font-medium' 
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'}
                    `}>
                      <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-white'}`} />
                      {item.label}
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto text-primary" />}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Services Group */}
          <div className="px-2">
            <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3">Services</p>
            <div>
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer
                  ${isServiceActive
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'}
                `}
              >
                <Server className={`w-5 h-5 mr-3 transition-colors ${isServiceActive ? 'text-primary' : 'group-hover:text-white'}`} />
                <span>Services</span>
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''} ${isServiceActive ? 'text-primary' : ''}`} />
              </button>

              <AnimatePresence initial={false}>
                {servicesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <nav className="space-y-1 mt-1 ml-3 pl-3 border-l border-sidebar-border/50">
                      {serviceNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.href;
                        return (
                          <Link key={item.href} href={item.href} className="block">
                            <div className={`
                              flex items-center px-3 py-2 rounded-xl transition-all duration-200 group cursor-pointer
                              ${isActive 
                                ? 'bg-primary/15 text-primary font-medium' 
                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'}
                            `}>
                              <Icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-white'}`} />
                              <span className="text-sm">{item.label}</span>
                              {isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary" />}
                            </div>
                          </Link>
                        );
                      })}
                    </nav>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-[280px] p-4 border-t border-sidebar-border bg-sidebar">
          <div className="flex items-center px-3 py-2 rounded-xl bg-sidebar-accent/50 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user?.role}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-8 shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center">
            <button 
              className="mr-4 p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-display font-semibold text-foreground">{title}</h2>
          </div>
          
          <div className="flex items-center space-x-4">
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
