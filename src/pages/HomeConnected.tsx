import { Navigation } from "@/components/Navigation";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { TrendingProducts } from "@/components/TrendingProducts";
import { HeroCarousel } from "@/components/HeroCarousel";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Award, Truck, Heart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();

    // Subscribe to realtime product changes
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          loadProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Failed to load products");
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);

      if (error) {
        toast.error("Failed to update cart");
      } else {
        toast.success("Cart updated!");
      }
    } else {
      // Add new item
      const { error } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1,
        });

      if (error) {
        toast.error("Failed to add to cart");
      } else {
        toast.success("Added to cart!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Feature Banner */}
      <section className="py-12 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group animate-fade-in">
              <div className="mb-4 flex justify-center">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <Award className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Premium Quality</h3>
              <p className="text-muted-foreground text-sm">Ethically raised, naturally fed</p>
            </div>
            <div className="group animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="mb-4 flex justify-center">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground text-sm">Fresh from farm to your door</p>
            </div>
            <div className="group animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="mb-4 flex justify-center">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Family Run</h3>
              <p className="text-muted-foreground text-sm">Personal care in every step</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <TrendingProducts />

      {/* Products Section */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Our Premium Selection</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Every cut is carefully selected and prepared to ensure the highest quality for your family. Taste the difference of farm-fresh pork.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    description={product.description || ""}
                    price={Number(product.price)}
                    image={product.image_url || "/placeholder.svg"}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 drop-shadow-lg animate-fade-in">
            Ready to Experience Farm-Fresh Quality?
          </h2>
          <p className="text-primary-foreground/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md animate-fade-in leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Join our community of satisfied customers who trust us for their premium pork needs. Order today and taste the PureBreed difference!
          </p>
          {!user && (
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white hover:bg-white/90 text-primary border-white font-semibold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: '0.2s' }}
              onClick={() => window.location.href = "/auth"}
            >
              Create an Account
            </Button>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
