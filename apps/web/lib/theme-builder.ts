export type ThemePalette = {
  background: string;
  foreground: string;
  card: string;
  border: string;
  muted: string;
  primary: string;
  primaryForeground: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarAccent: string;
  sidebarMuted: string;
  charts: string[];
};

export type GeneratedTheme = {
  name: string;
  light: ThemePalette;
  dark: ThemePalette;
};

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3 ? [...value].map((char) => char + char).join("") : value;
  const number = Number.parseInt(normalized, 16);
  return { r: (number >> 16) & 255, g: (number >> 8) & 255, b: number & 255 };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

function mix(first: string, second: string, amount: number) {
  const a = hexToRgb(first);
  const b = hexToRgb(second);
  return rgbToHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  });
}

function luminance(color: string) {
  const channels = Object.values(hexToRgb(color)).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(first: string, second: string) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

export function bestTextColor(background: string) {
  return contrastRatio(background, "#111111") >=
    contrastRatio(background, "#ffffff")
    ? "#111111"
    : "#ffffff";
}

export function generateTheme({
  dark,
  page,
  button,
}: {
  dark: string;
  page: string;
  button: string;
}): GeneratedTheme {
  const lightText = bestTextColor(page);
  const darkPage = mix(dark, "#000000", 0.18);
  const darkText = bestTextColor(darkPage);
  return {
    name: "Custom theme",
    light: {
      background: page,
      foreground: lightText,
      card: mix(page, "#ffffff", 0.45),
      border: mix(page, lightText, 0.2),
      muted: mix(page, lightText, 0.55),
      primary: button,
      primaryForeground: bestTextColor(button),
      sidebar: dark,
      sidebarForeground: bestTextColor(dark),
      sidebarAccent: mix(dark, "#ffffff", 0.14),
      sidebarMuted: mix(dark, bestTextColor(dark), 0.62),
      charts: [
        button,
        mix(dark, "#ffffff", 0.35),
        mix(page, button, 0.45),
        "#669c84",
        "#d08b58",
      ],
    },
    dark: {
      background: darkPage,
      foreground: darkText,
      card: mix(darkPage, "#ffffff", 0.12),
      border: mix(darkPage, darkText, 0.22),
      muted: mix(darkPage, darkText, 0.56),
      primary: mix(button, "#ffffff", 0.16),
      primaryForeground: bestTextColor(mix(button, "#ffffff", 0.16)),
      sidebar: mix(dark, "#000000", 0.28),
      sidebarForeground: bestTextColor(mix(dark, "#000000", 0.28)),
      sidebarAccent: mix(dark, "#ffffff", 0.2),
      sidebarMuted: mix(dark, "#ffffff", 0.68),
      charts: [
        mix(button, "#ffffff", 0.16),
        mix(dark, "#ffffff", 0.48),
        "#e6c16a",
        "#8fc9b1",
        "#e18a7b",
      ],
    },
  };
}

export function themeCss(theme: GeneratedTheme, id: string) {
  const declarations = (palette: ThemePalette) =>
    [
      `--background:${palette.background}`,
      `--foreground:${palette.foreground}`,
      `--card:${palette.card}`,
      `--card-foreground:${palette.foreground}`,
      `--popover:${palette.card}`,
      `--popover-foreground:${palette.foreground}`,
      `--primary:${palette.primary}`,
      `--primary-foreground:${palette.primaryForeground}`,
      `--secondary:${palette.card}`,
      `--secondary-foreground:${palette.foreground}`,
      `--muted:${palette.card}`,
      `--muted-foreground:${palette.muted}`,
      `--accent:${palette.sidebarAccent}`,
      `--accent-foreground:${palette.foreground}`,
      `--border:${palette.border}`,
      `--input:${palette.border}`,
      `--ring:${palette.primary}`,
      `--sidebar:${palette.sidebar}`,
      `--sidebar-foreground:${palette.sidebarForeground}`,
      `--sidebar-muted:${palette.sidebarMuted}`,
      `--sidebar-primary:${palette.primary}`,
      `--sidebar-primary-foreground:${palette.primaryForeground}`,
      `--sidebar-accent:${palette.sidebarAccent}`,
      `--sidebar-accent-foreground:${palette.sidebarForeground}`,
      ...palette.charts.map((color, index) => `--chart-${index + 1}:${color}`),
    ].join(";");

  return `[data-theme="custom-${id}"]{${declarations(theme.light)}}.dark [data-theme="custom-${id}"],[data-theme="custom-${id}"].dark{${declarations(theme.dark)}}`;
}
