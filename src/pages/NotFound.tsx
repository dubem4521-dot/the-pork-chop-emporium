import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import brandBg from "@/assets/brand-bg.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative">
      <SEOHead title="404 - Page Not Found | PureBreed Pork" description="The page you're looking for doesn't exist." />
      <div 
        className="fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url(${brandBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="relative z-10 text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/80">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
