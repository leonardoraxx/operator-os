import {
  LayoutDashboard,
  Target,
  Building2,
  FolderKanban,
  FileVideo,
  Scissors,
  TrendingUp,
  Dumbbell,
  Wallet,
  CheckSquare,
  BookOpen,
  Bot,
  Calendar,
  BarChart3,
  Layers,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Businesses", href: "/businesses", icon: Building2 },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Content", href: "/content", icon: FileVideo },
  { label: "Clipping", href: "/clipping", icon: Scissors },
  { label: "Trading", href: "/trading", icon: TrendingUp },
  { label: "Fitness", href: "/fitness", icon: Dumbbell },
  { label: "Money", href: "/money", icon: Wallet },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Reviews", href: "/reviews", icon: BookOpen },
  { label: "Agent Inbox", href: "/agent-inbox", icon: Bot, badge: 3 },
  { label: "Queue", href: "/queue", icon: Layers },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

// Legacy group shape kept for any consumers that import NAV_GROUPS
export const NAV_GROUPS: NavGroup[] = [{ items: NAV_ITEMS }];

export const ALL_NAV_ITEMS = NAV_ITEMS;
