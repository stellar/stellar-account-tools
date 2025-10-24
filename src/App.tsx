import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Revoke } from "@/page/Revoke.tsx";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Revoke />
    </QueryClientProvider>
  );
}

export default App;
