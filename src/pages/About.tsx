import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { ByTheNumbers } from "@/components/ByTheNumbers";
import { Heart, Award, Users } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <img
          src={heroImage}
          alt="Our Farm - Premium Pork Since 2019"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl animate-fade-in-up">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                About Our Farm
              </h1>
              <p className="text-xl text-white/90 drop-shadow-md">
                The story of Tinahe & Jeff's commitment to quality, sustainability, and exceptional pork products.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20">

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-20 animate-fade-in-up -mt-16 relative z-10">
          <Card className="p-8 md:p-12 shadow-[var(--shadow-card)]">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Founded in 2019, Tinahe & Jeff's Farm began with a simple vision: to provide families with the highest quality pork, raised with care and respect. What started as a small operation has grown into a trusted source for premium pork products.
              </p>
              <p>
                Our farm is built on the principles of ethical animal husbandry, sustainable farming practices, and a deep commitment to quality. Every pig on our farm is raised in a clean, stress-free environment with plenty of space to roam and natural feed.
              </p>
              <p>
                Tinahe and Jeff personally oversee every aspect of the operation, from the care of the animals to the processing and delivery of the final product. This hands-on approach ensures that every cut of meat meets our exacting standards.
              </p>
              <p>
                When you purchase from Tinahe & Jeff's Farm, you're not just buying pork – you're supporting a family business dedicated to traditional farming values and exceptional quality.
              </p>
            </div>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">What Sets Us Apart</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-[var(--shadow-card)] transition-all animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Care & Compassion</h3>
              <p className="text-muted-foreground">
                Our animals are raised with respect and care, ensuring they live healthy, stress-free lives on our farm.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-[var(--shadow-card)] transition-all animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Premium Quality</h3>
              <p className="text-muted-foreground">
                Every product is carefully selected and processed to meet the highest standards of quality and freshness.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-[var(--shadow-card)] transition-all animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Family Tradition</h3>
              <p className="text-muted-foreground">
                As a family-run operation, we bring personal attention and traditional values to everything we do.
              </p>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
          <Card className="p-8 md:p-12 bg-primary/5">
            <h2 className="text-3xl font-bold text-foreground mb-4">Visit Our Farm</h2>
            <p className="text-muted-foreground mb-6">
              We welcome visitors to see our operation firsthand. Contact us to schedule a farm tour and meet the team behind your premium pork.
            </p>
            <p className="text-foreground font-medium">
              Established: 2019<br />
              Owners: Tinahe & Jeff
            </p>
          </Card>
        </div>
      </div>

      {/* By The Numbers Section */}
      <ByTheNumbers />

      <Footer />
    </div>
  );
};

export default About;
