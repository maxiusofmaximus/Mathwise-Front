"use client";

import { Settings, LogOut, Globe, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GoogleTranslate } from "./GoogleTranslate";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SettingsMenu() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Simple theme toggle placeholder (can be expanded with next-themes)
  const [isDark, setIsDark] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    // In a real implementation, this would use useTheme() from next-themes
    // document.documentElement.classList.toggle("dark");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 right-4 z-50 rounded-full bg-white/80 shadow-md hover:bg-white backdrop-blur-sm">
          <Settings className="h-5 w-5 text-gray-700" />
        </PopoverTrigger>
      </PopoverTrigger>
      <PopoverContent className="w-80 mr-4 mt-2 p-4 bg-white/95 backdrop-blur-md shadow-xl border-gray-200" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-semibold text-sm text-gray-900">Settings</h4>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>

          {/* Language Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Globe className="h-4 w-4" />
              <span>Language</span>
            </div>
            <GoogleTranslate />
            <p className="text-xs text-gray-400">Powered by Google Translate</p>
          </div>

          {/* Theme Section (Placeholder) */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>Theme</span>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme} disabled>
              {isDark ? "Dark" : "Light"} (Coming Soon)
            </Button>
          </div>

          {/* Logout Section */}
          <div className="border-t pt-2">
            <Button 
              variant="destructive" 
              className="w-full flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
