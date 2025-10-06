import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground">Tinashe & Jeff's Farm</h3>
            <p className="text-sm text-muted-foreground">
              Premium pork products from our farm to your table since 2019. Quality, care, and tradition in every cut.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/cart" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Shopping Cart
              </Link>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                My Account
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">+27 123 456 789</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">info@tinashejeff.farm</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Farm Location, South Africa</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-primary" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-primary" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Stay updated with our latest products and farm news!
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Tinashe & Jeff's Farm. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
