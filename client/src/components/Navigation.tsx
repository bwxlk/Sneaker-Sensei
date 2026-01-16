import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Heart, 
  Search, 
  LogOut, 
  Menu,
  X,
  TrendingUp
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/collection", label: "Collection", icon: ShoppingBag },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
  ];

  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          <span className="font-display font-bold text-xl">SOLESTATS</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-background z-40 lg:hidden pt-20 px-6 space-y-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <div 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg text-lg font-medium transition-colors ${
                  isActive(link.href) 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </div>
            </Link>
          ))}
          <div className="border-t pt-4 mt-4">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-background h-screen sticky top-0">
        <div className="p-8 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              SOLESTATS
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <div 
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                  ${isActive(link.href) 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1"
                  }
                `}
              >
                <link.icon className={`h-5 w-5 ${isActive(link.href) ? "" : "opacity-70"}`} />
                {link.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background border shadow-sm mb-3">
            <Avatar className="h-8 w-8">
              {/* TS fix: coerce null/undefined to undefined */}
              <AvatarImage src={user?.profileImageUrl ?? undefined} />
              <AvatarFallback>
                {(user?.firstName?.[0] ?? "")}
                {(user?.lastName?.[0] ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
