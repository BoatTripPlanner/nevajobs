import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Nevajobs — Winter Jobs in Europe",
    short_name: "Nevajobs",
    description:
      "Serious professionals and serious employers in the private snow sector — hotels, ski schools, rental shops and resort offices across the Alps & Pyrenees.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f0f9ff",
    theme_color: "#0891b2",
    categories: ["business", "lifestyle"],
    lang: "en",
    dir: "ltr",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
