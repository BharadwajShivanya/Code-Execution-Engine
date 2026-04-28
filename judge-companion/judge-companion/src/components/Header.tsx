import { useState, useEffect } from "react";
import { Code2, ChevronLeft, ChevronRight, Clock, BarChart3, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthModal, AuthUser, getStoredUser, clearStoredUser } from "@/components/AuthModal";

interface HeaderProps {
  progressHint?: string;
}

export function Header({ progressHint }: HeaderProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const openSignIn = () => { setAuthTab("signin"); setAuthOpen(true); };
  const openSignUp = () => { setAuthTab("signup"); setAuthOpen(true); };

  const handleSignOut = () => {
    clearStoredUser();
    setUser(null);
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        {/* Left: Logo & Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground hidden sm:inline">CodeArena</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous Problem</TooltipContent>
            </Tooltip>
            
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Problem List
            </Button>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next Problem</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Center: Progress Hint */}
        <div className="flex-1 flex justify-center">
          {progressHint && (
            <Badge variant="secondary" className="text-xs font-normal px-3 py-1">
              {progressHint}
            </Badge>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Clock className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Timer</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Statistics</TooltipContent>
          </Tooltip>

          <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-border">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-foreground">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline max-w-[120px] truncate">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem className="gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  id="signin-btn"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={openSignIn}
                >
                  Sign In
                </Button>
                <Button
                  id="signup-btn"
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  onClick={openSignUp}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        open={authOpen}
        defaultTab={authTab}
        onClose={() => setAuthOpen(false)}
        onAuth={(u) => setUser(u)}
      />
    </>
  );
}
