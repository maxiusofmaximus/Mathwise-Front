"use client";

import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useLanguageStore } from "@/store/language";
import { translations } from "@/lib/translations";
import api from "@/lib/api";
import { 
  Settings, Globe, Moon, SunMedium, LogOut, 
  Type, Eye, ZapOff 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import styles from "./SettingsMenu.module.scss";

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
    api.post("/auth/logout").catch(() => undefined);
    logout();
    router.push("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={styles.trigger}>
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={styles.content} align="end">
        <div className={styles.section}>
          <div className={styles.row}>
            <h4>{t.settings}</h4>
            <span>{user.email}</span>
          </div>

          {/* Language Section */}
          <div className={styles.section}>
            <div className={styles.row}>
              <Globe className="h-4 w-4" />
              <span>{t.language}</span>
            </div>
            <div className={styles.toggleRow}>
              <Button 
                variant={language === 'en' ? "default" : "outline"} 
                size="sm" 
                onClick={() => setLanguage('en')}
              >
                English
              </Button>
              <Button 
                variant={language === 'es' ? "default" : "outline"} 
                size="sm" 
                onClick={() => setLanguage('es')}
              >
                Español
              </Button>
            </div>
          </div>

          {/* Theme Section */}
          <div className={styles.row}>
            <div className={styles.row}>
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
              <span>{t.theme}</span>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? t.dark : t.light}
            </Button>
          </div>

          {/* Accessibility Section */}
          <div className={styles.section}>
            <h5>{t.accessibility}</h5>
            
            {/* Font Size */}
            <div className={styles.section}>
              <div className={styles.row}>
                <Type className="h-4 w-4" />
                <span>{t.fontSize}</span>
              </div>
              <div className={styles.toggleRow}>
                <Button 
                  variant={fontSize === 'text-base' ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setFontSize('text-base')}
                >
                  A
                </Button>
                <Button 
                  variant={fontSize === 'text-lg' ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setFontSize('text-lg')}
                >
                  A+
                </Button>
                <Button 
                  variant={fontSize === 'text-xl' ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setFontSize('text-xl')}
                >
                  A++
                </Button>
              </div>
            </div>

            {/* Reduced Motion */}
            <div className={styles.row}>
              <div className={styles.row}>
                <ZapOff className="h-4 w-4" />
                <span>{t.reducedMotion}</span>
              </div>
              <Switch 
                checked={reducedMotion} 
                onCheckedChange={setReducedMotion} 
              />
            </div>

            {/* High Contrast */}
            <div className={styles.row}>
              <div className={styles.row}>
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
          <div>
            <Button 
              variant="destructive" 
              className="w-full"
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
