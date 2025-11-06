import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export const SEOHead = ({
  title = "PureBreed Pork - Premium Quality Farm-Fresh Pork | South Africa",
  description = "Experience the finest quality farm-fresh pork from PureBreed. Ethically raised, naturally fed premium pork cuts delivered fresh to your door in South Africa. Family-run farm since 2019.",
  keywords = "premium pork, farm fresh pork, pork cuts, pork chops, pork ribs, pork belly, free range pork, organic pork, south africa pork, purebreed pork, farm to table, meat delivery, quality meat, ethical farming",
}: SEOHeadProps) => {
  const fullTitle = title.includes("PureBreed") ? title : `${title} | PureBreed Pork`;

  useEffect(() => {
    document.title = fullTitle;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute("content", keywords);
    }
  }, [fullTitle, description, keywords]);

  return null;
};
