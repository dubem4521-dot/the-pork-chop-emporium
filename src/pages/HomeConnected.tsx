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

      {/* Trending Products Section */}
      <TrendingProducts />

      {/* Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Premium Selection</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every cut is carefully selected and prepared to ensure the highest quality for your family.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description || ""}
                  price={Number(product.price)}
                  image={product.image_url || "/placeholder.svg"}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Experience Farm-Fresh Quality?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Join our community of satisfied customers who trust us for their premium pork needs.
          </p>
          {!user && (
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white hover:bg-white/90 text-primary border-white"
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
