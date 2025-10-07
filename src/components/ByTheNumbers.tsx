import { Card } from "./ui/card";
import { TrendingUp, Users, Award, Package } from "lucide-react";

export const ByTheNumbers = () => {
  const stats = [
    {
      icon: TrendingUp,
      number: "2022",
      label: "Year Established",
      description: "Years of excellence"
    },
    {
      icon: Users,
      number: "500+",
      label: "Happy Customers",
      description: "Families served monthly"
    },
    {
      icon: Award,
      number: "100%",
      label: "Quality Guarantee",
      description: "Premium products"
    },
    {
      icon: Package,
      number: "1000+",
      label: "Orders Fulfilled",
      description: "Delivered with care"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">By The Numbers</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our commitment to excellence, reflected in numbers that matter
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-8 text-center hover:shadow-[var(--shadow-warm)] transition-all duration-300 hover:-translate-y-2 animate-scale-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-6 group-hover:scale-110 transition-transform">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                {stat.number}
              </h3>
              <p className="text-lg font-semibold text-foreground mb-2">{stat.label}</p>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
