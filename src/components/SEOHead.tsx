import { Helmet } from "react-helmet";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEOHead = ({
  title = "PureBreed Pork - Premium Quality Farm-Fresh Pork | South Africa",
  description = "Experience the finest quality farm-fresh pork from PureBreed. Ethically raised, naturally fed premium pork cuts delivered fresh to your door in South Africa. Family-run farm since 2019.",
  keywords = "premium pork, farm fresh pork, pork cuts, pork chops, pork ribs, pork belly, free range pork, organic pork, south africa pork, purebreed pork, farm to table, meat delivery, quality meat, ethical farming",
  image = "/purebreed-logo.png",
  url = "https://purebreedpork.co.za",
  type = "website",
}: SEOHeadProps) => {
  const fullTitle = title.includes("PureBreed") ? title : `${title} | PureBreed Pork`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="PureBreed Pork - Tinashe & Jeff" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="PureBreed Pork" />
      <meta property="og:locale" content="en_ZA" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Structured Data - Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "PureBreed Pork",
          "url": url,
          "logo": image,
          "description": description,
          "foundingDate": "2019",
          "founders": [
            {
              "@type": "Person",
              "name": "Tinashe"
            },
            {
              "@type": "Person",
              "name": "Jeff"
            }
          ],
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "ZA",
            "addressRegion": "South Africa"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+27-83-265-7249",
            "contactType": "Customer Service",
            "areaServed": "ZA",
            "availableLanguage": "English"
          },
          "sameAs": []
        })}
      </script>

      {/* Structured Data - LocalBusiness */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "PureBreed Pork",
          "image": image,
          "description": description,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "ZA"
          },
          "telephone": "+27-83-265-7249",
          "priceRange": "$$",
          "servesCuisine": "Meat Products",
          "url": url
        })}
      </script>

      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};
