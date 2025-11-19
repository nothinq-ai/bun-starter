import * as React from "react";

type Attribute = "class" | `data-${string}`;

interface ThemeProviderProps {
  children: React.ReactNode;
  /** List of all available theme names */
  themes?: string[];
  /** Forced theme name for the current page */
  forcedTheme?: string;
  /** Whether to switch between dark and light themes based on prefers-color-scheme */
  enableSystem?: boolean;
  /** Disable all CSS transitions when switching themes */
  disableTransitionOnChange?: boolean;
  /** Whether to indicate to browsers which color scheme is used (dark or light) */
  enableColorScheme?: boolean;
  /** Key used to store theme setting in localStorage */
  storageKey?: string;
  /** Default theme name */
  defaultTheme?: string;
  /** HTML attribute modified based on the active theme */
  attribute?: Attribute | Attribute[];
  /** Mapping of theme name to HTML attribute value */
  value?: Record<string, string>;
  /** Nonce string for CSP headers */
  nonce?: string;
}

interface UseThemeProps {
  /** List of all available theme names */
  themes: string[];
  /** Forced theme name for the current page */
  forcedTheme?: string;
  /** Update the theme */
  setTheme: (theme: string) => void;
  /** Active theme name */
  theme?: string;
  /** If enableSystem is true and the active theme is "system", this returns the resolved system preference */
  resolvedTheme?: string;
  /** If enableSystem is true, returns the System theme preference */
  systemTheme?: "dark" | "light";
}

const colorSchemes = ["light", "dark"];
const MEDIA = "(prefers-color-scheme: dark)";
const defaultThemes = ["light", "dark"];

const ThemeContext = React.createContext<UseThemeProps | undefined>(undefined);
const defaultContext: UseThemeProps = { setTheme: () => {}, themes: [] };

const getTheme = (key: string, fallback?: string): string | undefined => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const getSystemTheme = (
  e?: MediaQueryList | MediaQueryListEvent
): "dark" | "light" => {
  if (!e) e = window.matchMedia(MEDIA);
  return e.matches ? "dark" : "light";
};

const disableAnimation = (nonce?: string) => {
  const css = document.createElement("style");
  if (nonce) css.setAttribute("nonce", nonce);
  css.appendChild(
    document.createTextNode(
      `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
    )
  );
  document.head.appendChild(css);

  return () => {
    (() => window.getComputedStyle(document.body))();
    setTimeout(() => {
      document.head.removeChild(css);
    }, 1);
  };
};

export const useTheme = () => React.useContext(ThemeContext) ?? defaultContext;

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  forcedTheme,
  disableTransitionOnChange = false,
  enableSystem = true,
  enableColorScheme = true,
  storageKey = "theme",
  themes = defaultThemes,
  defaultTheme = enableSystem ? "system" : "light",
  attribute = "class",
  value,
  children,
  nonce,
}) => {
  const [theme, setThemeState] = React.useState<string>(
    () => getTheme(storageKey, defaultTheme)!
  );
  const [resolvedTheme, setResolvedTheme] = React.useState<"dark" | "light">(
    () => (theme === "system" ? getSystemTheme() : (theme as "dark" | "light"))
  );

  const attrs = !value ? themes : Object.values(value);

  const applyTheme = React.useCallback(
    (theme: string) => {
      let resolved = theme;
      if (!resolved) return;

      // If theme is system, resolve it before setting theme
      if (theme === "system" && enableSystem) {
        resolved = getSystemTheme();
      }

      const name = value ? value[resolved] : resolved;
      const enable = disableTransitionOnChange ? disableAnimation(nonce) : null;
      const d = document.documentElement;

      const handleAttribute = (attr: Attribute) => {
        if (attr === "class") {
          d.classList.remove(...attrs);
          if (name) d.classList.add(name);
        } else if (attr.startsWith("data-")) {
          if (name) {
            d.setAttribute(attr, name);
          } else {
            d.removeAttribute(attr);
          }
        }
      };

      if (Array.isArray(attribute)) attribute.forEach(handleAttribute);
      else handleAttribute(attribute);

      if (enableColorScheme) {
        const fallback = colorSchemes.includes(defaultTheme)
          ? defaultTheme
          : null;
        const colorScheme = colorSchemes.includes(resolved)
          ? resolved
          : fallback;
        d.style.colorScheme = colorScheme || "";
      }

      enable?.();
    },
    [
      attrs,
      attribute,
      value,
      enableColorScheme,
      defaultTheme,
      disableTransitionOnChange,
      nonce,
      enableSystem,
    ]
  );

  const setTheme = React.useCallback(
    (newTheme: string) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // Unsupported
      }
    },
    [storageKey]
  );

  const handleMediaQuery = React.useCallback(
    (e: MediaQueryListEvent | MediaQueryList) => {
      const resolved = getSystemTheme(e);
      setResolvedTheme(resolved);

      if (theme === "system" && enableSystem && !forcedTheme) {
        applyTheme("system");
      }
    },
    [theme, forcedTheme, enableSystem, applyTheme]
  );

  // Always listen to System preference
  React.useEffect(() => {
    const media = window.matchMedia(MEDIA);
    media.addEventListener("change", handleMediaQuery);
    handleMediaQuery(media);

    return () => media.removeEventListener("change", handleMediaQuery);
  }, [handleMediaQuery]);

  // localStorage event handling
  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;

      if (!e.newValue) {
        setTheme(defaultTheme);
      } else {
        setThemeState(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey, defaultTheme, setTheme]);

  // Whenever theme or forcedTheme changes, apply it
  React.useEffect(() => {
    applyTheme(forcedTheme ?? theme);
  }, [forcedTheme, theme, applyTheme]);

  const providerValue = React.useMemo(
    () => ({
      theme,
      setTheme,
      forcedTheme,
      resolvedTheme:
        theme === "system" ? resolvedTheme : (theme as "dark" | "light"),
      themes: enableSystem ? [...themes, "system"] : themes,
      systemTheme: (enableSystem ? resolvedTheme : undefined) as
        | "dark"
        | "light"
        | undefined,
    }),
    [theme, setTheme, forcedTheme, resolvedTheme, enableSystem, themes]
  );

  return (
    <ThemeContext.Provider value={providerValue}>
      {children}
    </ThemeContext.Provider>
  );
};
