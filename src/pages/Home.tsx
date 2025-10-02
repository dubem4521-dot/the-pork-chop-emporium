import { Navigation } from "@/components/Navigation";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import heroImage from "@/assets/hero-farm.jpg";
import porkCuts from "@/assets/pork-cuts.jpg";
import porkChops from "@/assets/pork-chops.jpg";
import porkRibs from "@/assets/pork-ribs.jpg";
import porkBelly from "@/assets/pork-belly.jpg";

const products = [
  {
    id: "1",
    name: "Premium Pork Cuts",
    description: "High-quality mixed pork cuts, perfect for any occasion. Locally raised with care.",
    price: 85.00,
    image: porkCuts,
  },
  {
    id: "2",
    name: "Pork Chops",
    description: "Tender and juicy pork chops, ideal for grilling or pan-frying. Cut fresh daily.",
    price: 95.00,
    image: porkChops,
  },
  {
    id: "3",
    name: "Pork Ribs",
    description: "Fall-off-the-bone ribs, perfect for BBQ. Raised on our farm with traditional methods.",
    price: 120.00,
    image: porkRibs,
  },
  {
    id: "4",
    name: "Pork Belly",
    description: "Rich and flavorful pork belly, great for roasting or curing. Premium quality guaranteed.",
    price: 110.00,
    image: porkBelly,
  },
];

const Home = () => {
  const handleAddToCart = (id: string) => {
    toast.success("Added to cart!", {
      description: "Product has been added to your cart.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <img
          src={heroImage}
          alt="Farm Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl animate-fade-in-up">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                Premium Pork from Our Farm to Your Table
              </h1>
              <p className="text-xl text-white/90 mb-8 drop-shadow-md">
                Since 2019, Tinahe & Jeff have been raising the finest pigs with care and dedication. Experience the difference of farm-fresh quality.
              </p>
              <Button variant="hero" size="lg" className="text-lg">
                Shop Our Products
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Premium Selection</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every cut is carefully selected and prepared to ensure the highest quality for your family.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
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
          <Button variant="outline" size="lg" className="bg-white hover:bg-white/90 text-primary border-white">
            Create an Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
