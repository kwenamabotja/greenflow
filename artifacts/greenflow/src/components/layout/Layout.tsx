import { Link, useLocation } from "wouter";
import { LayoutDashboard, Map, Bus, Leaf, Wallet, MapPin, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  // In development mode without Clerk, these will be undefined
  // This component now works with or without Clerk authentication
  const user = undefined;
  const signOut = undefined;

  const navItems = [
    { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
    { href: "/route-planner", label: "Power-Aware Routes", icon: Map },
    { href: "/transit", label: "Live Transit", icon: Bus },
    { href: "/carbon", label: "Carbon Ledger", icon: Leaf },
    { href: "/green-wallet", label: "Green Wallet", icon: Wallet },
    { href: "/hubs", label: "Transit Hubs", icon: MapPin },
  ];

  const initials = user
    ? ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")).toUpperCase() || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "U"
    : "DEV";

  return (
    <div className="min-h-screen flex w-full bg-background dark">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col fixed inset-y-0 z-10">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">GreenFlow</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Gauteng MaaS</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center gap-2 px-2 py-2 h-auto justify-start hover:bg-muted"
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.firstName || user?.emailAddresses[0]?.emailAddress || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.emailAddresses[0]?.emailAddress}
                </p>
                <p className="text-xs text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</p>
              </div>
              <DropdownMenuSeparator />
              {signOut && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer gap-2"
                  onClick={() => signOut({ redirectUrl: "/" })}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
