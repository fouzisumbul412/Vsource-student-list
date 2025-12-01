"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: "always",
            refetchInterval: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <ReactQueryDevtools buttonPosition="bottom-right" />
      {children}
    </QueryClientProvider>
  );
}
