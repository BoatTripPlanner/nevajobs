import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Exclude PWA/metadata routes (no file extension) so next-intl does not 404 them in production
  matcher: [
    "/((?!api|_next|_vercel|icon|apple-icon|manifest\\.webmanifest|.*\\..*).*)",
  ],
};
