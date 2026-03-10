import Pageclient from "./page.client";
import { getAllProducts } from "@/shared/serverActions/productos";

const ageFilters = [
  { label: "0-12m", emoji: "👶", filter: "0" },
  { label: "1-3 años", emoji: "🧒", filter: "1" },
  { label: "3-6 años", emoji: "👦", filter: "3" },
  { label: "6+ años", emoji: "🎒", filter: "6" },
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
  const products = await getAllProducts();
  console.log(products);
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-muted/30 to-background">
      <main>
        <Pageclient
          ageFilters={ageFilters}
          featuredProducts={products?.sort((a, b) => a.featured ? -1 : b.featured ? 1 : 0).slice(0, 4) ?? []}
          trendingProducts={products?.sort((a, b) => a.trending ? -1 : b.trending ? 1 : 0).slice(0, 4) ?? []}
          testimonials={testimonials}
        />
      </main>
    </div>
  );
}
