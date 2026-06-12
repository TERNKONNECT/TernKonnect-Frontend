const fs = require('fs');
const path = require('path');

// 1. Create theme-provider.tsx
const themeProviderContent = `import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
`;
fs.writeFileSync(path.join('src', 'components', 'theme-provider.tsx'), themeProviderContent);

// 2. Create ThemeToggle.tsx
const themeToggleContent = `import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full w-10 h-10 transition-transform hover:scale-105"
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
`;
fs.writeFileSync(path.join('src', 'components', 'ThemeToggle.tsx'), themeToggleContent);

// 3. Inject ThemeProvider into App.tsx
let appContent = fs.readFileSync(path.join('src', 'App.tsx'), 'utf8');
if (!appContent.includes('ThemeProvider')) {
  appContent = appContent.replace(
    'import { AuthProvider } from "@/contexts/AuthContext";',
    'import { AuthProvider } from "@/contexts/AuthContext";\nimport { ThemeProvider } from "@/components/theme-provider";'
  );
  appContent = appContent.replace(
    '<QueryClientProvider client={queryClient}>',
    '<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">\n  <QueryClientProvider client={queryClient}>'
  );
  appContent = appContent.replace(
    '  </QueryClientProvider>\n)',
    '  </QueryClientProvider>\n  </ThemeProvider>\n)'
  );
  fs.writeFileSync(path.join('src', 'App.tsx'), appContent);
}

console.log("Theme setup complete");
