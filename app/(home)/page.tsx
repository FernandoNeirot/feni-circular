import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Pageclient from "./page.client";
import { productsQueryOptions } from "@/shared/queries/productos";

const ageFilters = [
  { label: "0-12m", emoji: "👶", filter: "0-12m" },
  { label: "1-3 años", emoji: "🧒", filter: "1-3 años" },
  { label: "3-6 años", emoji: "👦", filter: "3-6 años" },
  { label: "6+ años", emoji: "🎒", filter: "6+ años" },
];

const testimonials = [
  {
    name: "Carolina M.",
    text: "Compré un abrigo Mimo a mitad de precio y llegó impecable. ¡Parecía nuevo!",
    rating: 5,
  },
  {
    name: "Lucía P.",
    text: "Las medidas reales son un golazo. Por fin no me equivoco de talle comprando online.",
    rating: 5,
  },
  {
    name: "Martina G.",
    text: "Ya compré 3 veces. La ropa llega limpia, bien empaquetada y siempre como la describe.",
    rating: 5,
  },
];

export default async function Home() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(productsQueryOptions);

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-muted/30 to-background">
      <main>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Pageclient
            ageFilters={ageFilters}
            testimonials={testimonials}
          />
        </HydrationBoundary>
      </main>
    </div>
  );
}
