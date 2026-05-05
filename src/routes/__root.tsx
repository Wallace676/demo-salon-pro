import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { applyTheme, getSettings } from "@/lib/demoSettings";

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
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sistema de Gestão para Salão de Beleza" },
      { name: "description", content: "Sistema completo de gestão para salões de beleza com agendamentos, clientes, relatórios e bot WhatsApp 24h" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Sistema de Gestão para Salão de Beleza" },
      { property: "og:description", content: "Sistema completo de gestão para salões de beleza com agendamentos, clientes, relatórios e bot WhatsApp 24h" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Sistema de Gestão para Salão de Beleza" },
      { name: "twitter:description", content: "Sistema completo de gestão para salões de beleza com agendamentos, clientes, relatórios e bot WhatsApp 24h" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2d68e32b-2375-43a7-937c-9ab84c6813fe/id-preview-e889fe66--6f77dc6a-178d-4327-8d3c-023ba1306dc3.lovable.app-1777409857291.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2d68e32b-2375-43a7-937c-9ab84c6813fe/id-preview-e889fe66--6f77dc6a-178d-4327-8d3c-023ba1306dc3.lovable.app-1777409857291.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
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
      <Outlet />
      <Toaster />
    </>
  );
}
