"use client";

import { Settings, LogOut, Globe, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useLanguageStore } from "@/store/language";
import { translations } from "@/lib/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Settings, Globe, Moon, SunMedium, LogOut, 
  Type, Eye, ZapOff 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function SettingsMenu() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const { language, setLanguage } = useLanguageStore();
  const t = translations[language].common;

  // Accessibility State
  const [fontSize, setFontSize] = useState<'text-base' | 'text-lg' | 'text-xl'>('text-base');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Apply font size
    document.documentElement.classList.remove('text-base', 'text-lg', 'text-xl');
    document.documentElement.classList.add(fontSize);

    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.style.setProperty('--transition-duration', '0s');
      document.body.classList.add('motion-reduce');
    } else {
      document.documentElement.style.removeProperty('--transition-duration');
      document.body.classList.remove('motion-reduce');
    }

    // Apply high contrast (simple border/contrast boost)
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [fontSize, reducedMotion, highContrast]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 right-4 z-50 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm">
          <Settings className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mr-4 mt-2 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{t.settings}</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
          </div>

          {/* Language Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Globe className="h-4 w-4" />
              <span>{t.language}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={language === 'en' ? "default" : "outline"} 
                size="sm" 
                className="flex-1"
                onClick={() => setLanguage('en')}
              >
                English
              </Button>
              <Button 
                variant={language === 'es' ? "default" : "outline"} 
                size="sm" 
                className="flex-1"
                onClick={() => setLanguage('es')}
              >
                Español
              </Button>
            </div>
          </div>

          {/* Theme Section */}
          <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
              <span>{t.theme}</span>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? t.dark : t.light}
            </Button>
          </div>

          {/* Accessibility Section */}
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.accessibility}</h5>
            
            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Type className="h-4 w-4" />
                <span>{t.fontSize}</span>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant={fontSize === 'text-base' ? "default" : "ghost"} 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => setFontSize('text-base')}
                >
                  A
                </Button>
                <Button 
                  variant={fontSize === 'text-lg' ? "default" : "ghost"} 
                  size="sm" 
                  className="flex-1 text-sm font-medium"
                  onClick={() => setFontSize('text-lg')}
                >
                  A+
                </Button>
                <Button 
                  variant={fontSize === 'text-xl' ? "default" : "ghost"} 
                  size="sm" 
                  className="flex-1 text-base font-bold"
                  onClick={() => setFontSize('text-xl')}
                >
                  A++
                </Button>
              </div>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <ZapOff className="h-4 w-4" />
                <span>{t.reducedMotion}</span>
              </div>
              <Switch 
                checked={reducedMotion} 
                onCheckedChange={setReducedMotion} 
              />
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Eye className="h-4 w-4" />
                <span>{t.highContrast}</span>
              </div>
              <Switch 
                checked={highContrast} 
                onCheckedChange={setHighContrast} 
              />
            </div>
          </div>

          {/* Logout Section */}
          <div className="border-t dark:border-gray-700 pt-4">
            <Button 
              variant="destructive" 
              className="w-full flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {t.logout}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
