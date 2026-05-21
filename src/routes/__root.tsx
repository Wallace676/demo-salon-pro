import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { RoutePersistence } from "@/components/pwa/RoutePersistence";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      },
      { title: "BellaSalon — Gestão para Salões de Beleza" },
      { name: "description", content: "Sistema completo de gestão para salões de beleza com agendamentos, clientes, relatórios e bot WhatsApp 24h" },
      { name: "author", content: "BellaSalon" },
      { name: "theme-color", content: "#C8826A" },
      { name: "background-color", content: "#FDF6F0" },
      { name: "application-name", content: "BellaSalon" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "BellaSalon" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "format-detection", content: "telephone=no" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "msapplication-TileColor", content: "#C8826A" },
      { name: "msapplication-TileImage", content: "/icon-512.png" },
      { property: "og:title", content: "BellaSalon — Gestão para Salões de Beleza" },
      { property: "og:description", content: "Sistema completo de gestão para salões de beleza com agendamentos, clientes, relatórios e bot WhatsApp 24h" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "BellaSalon" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "BellaSalon — Gestão para Salões de Beleza" },
      { name: "twitter:description", content: "Sistema completo de gestão para salões de beleza com agendamentos, clientes, relatórios e bot WhatsApp 24h" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2d68e32b-2375-43a7-937c-9ab84c6813fe/id-preview-e889fe66--6f77dc6a-178d-4327-8d3c-023ba1306dc3.lovable.app-1777409857291.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2d68e32b-2375-43a7-937c-9ab84c6813fe/id-preview-e889fe66--6f77dc6a-178d-4327-8d3c-023ba1306dc3.lovable.app-1777409857291.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", type: "image/png", href: "/icon-512.png" },
      { rel: "apple-touch-icon", href: "/icon-512.png" },
      { rel: "apple-touch-icon", sizes: "152x152", href: "/icon-512.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/icon-512.png" },
      { rel: "apple-touch-startup-image", href: "/icon-512.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <RoutePersistence />
      <Outlet />
      <Toaster />
      <InstallPrompt />
    </>
  );
}
