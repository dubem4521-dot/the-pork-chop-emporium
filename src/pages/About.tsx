import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { ByTheNumbers } from "@/components/ByTheNumbers";
import { SEOHead } from "@/components/SEOHead";
import { Heart, Award, Users, Calendar } from "lucide-react";
import heroFarm from "@/assets/hero-farm.jpg";
import porkChops from "@/assets/pork-chops.jpg";
import porkBelly from "@/assets/pork-belly.jpg";
import brandBg from "@/assets/brand-bg.png";

export const About = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <SEOHead 
        title="About Us - PureBreed Pork | Tinashe & Jeff's Farm"
        description="Meet Tinashe and Jeff, founders of PureBreed Pork. Learn about our family farm, ethical farming practices, and commitment to premium quality pork since 2019."
        keywords="about purebreed, tinashe jeff farm, ethical farming, family farm, premium pork farm, sustainable farming, south africa farm"
      />
      <div 
        className="fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url(${brandBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="relative z-10">
        <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <img
          src={heroFarm}
          alt="Tinashe & Jeff's Farm"
          className="w-full h-full object-cover animate-[scale-in_1.5s_ease-out]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">Our Story</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto px-4 drop-shadow-md">
              A journey of passion, dedication, and premium quality pork
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Our Story with Animated Images */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-4xl font-bold text-foreground">Founded on Quality & Care</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                In 2022, Tinashe and Jeff started PureBreed with a simple mission: to provide the finest quality pork
                products while maintaining the highest standards of animal welfare and sustainable farming practices.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our farm combines traditional methods with modern techniques to ensure every cut of meat meets our
                exacting standards. We believe in treating our animals with respect and care, which translates directly
                into the quality of our products.
              </p>
            </div>
            <div className="relative h-[400px] overflow-hidden rounded-lg shadow-[var(--shadow-warm)] group">
              <img
                src={porkChops}
                alt="Premium pork chops"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </section>

        {/* What Sets Us Apart with Animated Images */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12 animate-fade-in">What Sets Us Apart</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-[var(--shadow-warm)] transition-all duration-500 hover:-translate-y-2 animate-fade-in group border-2 border-transparent hover:border-primary/20">
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <Heart className="h-10 w-10 text-primary group-hover:animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">Care & Compassion</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our animals are raised in a stress-free environment with plenty of space to roam and natural feed.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-[var(--shadow-warm)] transition-all duration-500 hover:-translate-y-2 animate-fade-in group border-2 border-transparent hover:border-primary/20" style={{ animationDelay: '0.1s' }}>
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <Award className="h-10 w-10 text-primary group-hover:animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">Premium Quality</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every cut is inspected to ensure it meets our high standards before reaching your table.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-[var(--shadow-warm)] transition-all duration-500 hover:-translate-y-2 animate-fade-in group border-2 border-transparent hover:border-primary/20" style={{ animationDelay: '0.2s' }}>
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <Users className="h-10 w-10 text-primary group-hover:animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">Family Tradition</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built on generations of farming knowledge and a commitment to excellence in every aspect.
              </p>
            </Card>
          </div>
        </section>

        {/* Animated Product Showcase Section */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] overflow-hidden rounded-lg shadow-[var(--shadow-warm)] group order-2 md:order-1">
              <img
                src={porkBelly}
                alt="Premium pork belly"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm p-4 rounded-lg transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-white font-semibold">Premium Pork Belly</p>
                <p className="text-white/80 text-sm">Perfect marbling for incredible flavor</p>
              </div>
            </div>
            <div className="space-y-6 animate-fade-in order-1 md:order-2">
              <h2 className="text-4xl font-bold text-foreground">Premium Cuts, Every Time</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From our farm to your kitchen, we ensure every cut maintains the highest quality. Our expert butchers
                prepare each piece with precision and care.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="text-center bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-12 animate-fade-in border-2 border-primary/10">
          <h2 className="text-4xl font-bold text-foreground mb-6">Visit Our Farm</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Want to see where the magic happens? We welcome farm visits by appointment. Come meet Tinashe and Jeff,
            and see firsthand how we raise our pigs with care and dedication.
          </p>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center text-left">
            <div className="flex items-center gap-3 group">
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Established</p>
                <p className="text-muted-foreground">2022</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Founders</p>
                <p className="text-muted-foreground">Tinashe & Jeff</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ByTheNumbers />
      <Footer />
      </div>
    </div>
  );
};

export default About;
