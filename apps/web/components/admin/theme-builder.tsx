"use client";

import { useMemo, useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import {
  generateTheme,
  contrastRatio,
  bestTextColor,
  themeCss,
  type GeneratedTheme,
} from "@/lib/theme-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type SavedTheme = GeneratedTheme & {
  id: string;
  enabled: boolean;
  isDefault: boolean;
};

const presets = [
  "brown",
  "sage",
  "graphite",
  "olive",
  "maroon",
  "terracotta",
] as const;
const paletteNames = ["Dark (sidebar)", "Page", "Button"] as const;
const initialColors = { dark: "#3B2418", page: "#F2E8DA", button: "#8EC5FF" };

function MiniPreview({
  palette,
  mode,
}: {
  palette: GeneratedTheme["light"];
  mode: string;
}) {
  return (
    <div
      className="theme-mini-preview"
      style={{ background: palette.background, color: palette.foreground }}
    >
      <aside
        style={{
          background: palette.sidebar,
          color: palette.sidebarForeground,
        }}
      >
        <strong>StoreDesk</strong>
        <span>Dashboard</span>
        <span>Inventory</span>
      </aside>
      <section>
        <header>
          Overview{" "}
          <button
            style={{
              background: palette.primary,
              color: palette.primaryForeground,
            }}
          >
            New bill
          </button>
        </header>
        <article
          style={{ background: palette.card, borderColor: palette.border }}
        >
          <b>Today&apos;s sales</b>
          <p style={{ color: palette.muted }}>₹28,450 · {mode}</p>
          <div className="theme-mini-bars">
            {palette.charts.slice(0, 4).map((color) => (
              <i key={color} style={{ background: color }} />
            ))}
          </div>
        </article>
        <div
          className="theme-mini-table"
          style={{ borderColor: palette.border }}
        >
          Premium Plain Shirt <span>In stock</span>
        </div>
      </section>
    </div>
  );
}

function ContrastRow({
  label,
  foreground,
  background,
}: {
  label: string;
  foreground: string;
  background: string;
}) {
  const ratio = contrastRatio(foreground, background);
  const passes = ratio >= 4.5;
  return (
    <div className="theme-contrast-row">
      <span>{label}</span>
      <b className={passes ? "contrast-pass" : "contrast-fail"}>
        {passes ? "Pass" : "Fail"} · {ratio.toFixed(2)}:1
      </b>
    </div>
  );
}

export function ThemeBuilder() {
  const [colors, setColors] = useState(initialColors);
  const [name, setName] = useState("");
  const [optionalButtonText, setOptionalButtonText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [customThemes, setCustomThemes] = useState<SavedTheme[]>([]);
  const generated = useMemo(() => generateTheme(colors), [colors]);
  const currentTheme = useMemo(
    () => ({
      ...generated,
      light: {
        ...generated.light,
        primaryForeground:
          optionalButtonText || generated.light.primaryForeground,
      },
    }),
    [generated, optionalButtonText],
  );
  const checks = [
    {
      label: "Button text on button · Light",
      foreground: currentTheme.light.primaryForeground,
      background: currentTheme.light.primary,
    },
    {
      label: "Text on page · Light",
      foreground: currentTheme.light.foreground,
      background: currentTheme.light.background,
    },
    {
      label: "Sidebar text on sidebar · Light",
      foreground: currentTheme.light.sidebarForeground,
      background: currentTheme.light.sidebar,
    },
    {
      label: "Button text on button · Dark",
      foreground: currentTheme.dark.primaryForeground,
      background: currentTheme.dark.primary,
    },
    {
      label: "Text on page · Dark",
      foreground: currentTheme.dark.foreground,
      background: currentTheme.dark.background,
    },
    {
      label: "Sidebar text on sidebar · Dark",
      foreground: currentTheme.dark.sidebarForeground,
      background: currentTheme.dark.sidebar,
    },
  ].map((check) => ({
    ...check,
    ratio: contrastRatio(check.foreground, check.background),
  }));
  const canSave =
    name.trim().length > 0 && checks.every((check) => check.ratio >= 4.5);
  const generatedStyles = customThemes
    .map((theme) => themeCss(theme, theme.id))
    .join("\n");

  const editTheme = (theme?: SavedTheme) => {
    if (theme) {
      setEditingId(theme.id);
      setName(theme.name);
      setColors({
        dark: theme.light.sidebar,
        page: theme.light.background,
        button: theme.light.primary,
      });
      setOptionalButtonText(theme.light.primaryForeground);
    } else {
      setEditingId(null);
      setName("");
      setColors(initialColors);
      setOptionalButtonText("");
    }
    setIsOpen(true);
  };

  const saveTheme = () => {
    if (!canSave) return;
    const id = editingId || `theme-${Date.now().toString(36)}`;
    const saved: SavedTheme = {
      ...currentTheme,
      name: name.trim(),
      id,
      enabled: true,
      isDefault: false,
    };
    setCustomThemes((existing) =>
      editingId
        ? existing.map((theme) => (theme.id === editingId ? saved : theme))
        : [...existing, saved],
    );
    setIsOpen(false);
  };

  const duplicateTheme = (theme: SavedTheme) => {
    setCustomThemes((existing) => [
      ...existing,
      {
        ...theme,
        id: `theme-${Date.now().toString(36)}`,
        name: `${theme.name} copy`,
        enabled: true,
        isDefault: false,
      },
    ]);
  };

  const duplicatePreset = (preset: (typeof presets)[number]) => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    const originalTheme = root.dataset.theme;
    root.classList.remove("dark");
    root.dataset.theme = preset;
    const styles = getComputedStyle(root);
    const presetColors = {
      dark: styles.getPropertyValue("--sidebar").trim(),
      page: styles.getPropertyValue("--background").trim(),
      button: styles.getPropertyValue("--primary").trim(),
    };
    if (originalTheme) root.dataset.theme = originalTheme;
    else delete root.dataset.theme;
    if (wasDark) root.classList.add("dark");
    setEditingId(null);
    setName(`${preset[0].toUpperCase() + preset.slice(1)} copy`);
    setColors(presetColors);
    setOptionalButtonText("");
    setIsOpen(true);
  };

  const setDefault = (id: string) => {
    setCustomThemes((existing) =>
      existing.map((theme) => ({ ...theme, isDefault: theme.id === id })),
    );
    document.documentElement.dataset.theme = `custom-${id}`;
  };

  const autoFix = () => {
    setOptionalButtonText(bestTextColor(currentTheme.light.primary));
  };

  return (
    <div className="theme-builder-page">
      <style>{generatedStyles}</style>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PLATFORM ADMIN</div>
          <h1>Themes</h1>
          <p>Choose the palettes your stores can use, or create a new one.</p>
        </div>
        <div className="heading-action">
          <Button
            variant="outline"
            onClick={() => (document.documentElement.dataset.theme = "brown")}
          >
            Set default
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button onClick={() => editTheme()}>
                  <Plus data-icon="inline-start" />
                  Create theme
                </Button>
              }
            />
            <SheetContent side="right" className="theme-builder-sheet">
              <SheetHeader>
                <SheetTitle>
                  {editingId ? "Edit custom theme" : "Create theme"}
                </SheetTitle>
                <SheetDescription>
                  Build a palette and check accessible contrast before saving.
                </SheetDescription>
              </SheetHeader>
              <div className="theme-editor-fields">
                <label>
                  Theme name
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Monsoon"
                  />
                </label>
                {(["dark", "page", "button"] as const).map((key, index) => (
                  <label className="theme-color-field" key={key}>
                    <span>{paletteNames[index]}</span>
                    <input
                      type="color"
                      value={colors[key]}
                      onChange={(event) =>
                        setColors((value) => ({
                          ...value,
                          [key]: event.target.value,
                        }))
                      }
                    />
                    <code>{colors[key].toUpperCase()}</code>
                  </label>
                ))}
                <label>
                  Optional button text colour
                  <input
                    type="color"
                    value={
                      optionalButtonText || currentTheme.light.primaryForeground
                    }
                    onChange={(event) =>
                      setOptionalButtonText(event.target.value)
                    }
                  />
                </label>
              </div>
              <div className="theme-preview-pair">
                <MiniPreview palette={currentTheme.light} mode="Light" />
                <MiniPreview palette={currentTheme.dark} mode="Dark" />
              </div>
              <section className="theme-contrast-checks">
                <h3>WCAG AA contrast check</h3>
                {checks.map((check) => (
                  <ContrastRow
                    key={check.label}
                    label={check.label}
                    foreground={check.foreground}
                    background={check.background}
                  />
                ))}
                {checks.some((check) => check.ratio < 4.5) && (
                  <Button variant="outline" onClick={autoFix}>
                    Fix automatically
                  </Button>
                )}
              </section>
              <div className="theme-sheet-actions">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button disabled={!canSave} onClick={saveTheme}>
                  Save theme
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="theme-card-grid">
        {presets.map((preset) => (
          <article
            className="theme-admin-card"
            data-theme={preset}
            key={preset}
          >
            <div className="mini-theme">
              <div className="mini-sidebar">
                <b>StoreDesk</b>
                <i />
                <i />
                <i />
              </div>
              <div className="mini-content">
                <b>Companies</b>
                <div className="mini-stats">
                  <i />
                  <i />
                </div>
                <div className="mini-button" />
              </div>
            </div>
            <div className="theme-admin-info">
              <div>
                <b>{preset[0].toUpperCase() + preset.slice(1)}</b>
                <small>
                  {preset === "brown" ? "Platform default" : "Store palette"}
                </small>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  defaultChecked
                  aria-label={`Enable ${preset} theme`}
                />
                <span />
              </label>
            </div>
            <div className="theme-card-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  document.documentElement.dataset.theme = preset;
                }}
              >
                Set as default
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Duplicate ${preset}`}
                onClick={() => duplicatePreset(preset)}
              >
                <Copy />
              </Button>
            </div>
          </article>
        ))}
        {customThemes.map((theme) => (
          <article
            className="theme-admin-card custom-theme-card"
            key={theme.id}
          >
            <div className="theme-preview-pair">
              <MiniPreview palette={theme.light} mode="Light" />
              <MiniPreview palette={theme.dark} mode="Dark" />
            </div>
            <div className="theme-admin-info">
              <div>
                <b>{theme.name}</b>
                <small>
                  {theme.isDefault ? "Platform default" : "Custom palette"}
                </small>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={theme.enabled}
                  aria-label={`Enable ${theme.name}`}
                  onChange={() =>
                    setCustomThemes((all) =>
                      all.map((item) =>
                        item.id === theme.id
                          ? { ...item, enabled: !item.enabled }
                          : item,
                      ),
                    )
                  }
                />
                <span />
              </label>
            </div>
            <div className="theme-card-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDefault(theme.id)}
              >
                Set as default
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${theme.name}`}
                onClick={() => editTheme(theme)}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Duplicate ${theme.name}`}
                onClick={() => duplicateTheme(theme)}
              >
                <Copy />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${theme.name}`}
                onClick={() =>
                  setCustomThemes((all) =>
                    all.filter((item) => item.id !== theme.id),
                  )
                }
              >
                <Trash2 />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
