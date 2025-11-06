import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const TestimonialsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const { user } = useAuth();

  useEffect(() => {
    loadReviews();

    const channel = supabase
      .channel('reviews-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        () => {
          loadReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("Error loading reviews:", error);
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const comment = formData.get("comment") as string;

    const { error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        name: name,
        rating: rating,
        comment: comment,
        approved: false,
      });

    if (error) {
      toast.error("Failed to submit review");
      console.error(error);
    } else {
      toast.success("Review submitted! It will appear after admin approval.");
      setIsOpen(false);
      (e.target as HTMLFormElement).reset();
      setRating(5);
    }
  };

  return (
    <section className="py-20 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Feedback from Our Clients
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Hear what our satisfied customers have to say about our premium pork products
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-white/60">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 mb-6">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {reviews.map((review, index) => (
              <Card 
                key={review.id} 
                className="p-8 bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 animate-fade-in hover:scale-105 hover:shadow-2xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4">
                  <Quote className="h-8 w-8 text-primary/60 mb-4" />
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-white/90 mb-6 italic leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                <p className="font-semibold text-white text-lg">— {review.name}</p>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white text-black hover:bg-white/90 border-white font-semibold"
              >
                Share Your Experience
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
              <DialogHeader>
                <DialogTitle className="text-2xl">Write a Review</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="review-name">Your Name</Label>
                  <Input
                    id="review-name"
                    name="name"
                    required
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 cursor-pointer ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-comment">Your Review</Label>
                  <Textarea
                    id="review-comment"
                    name="comment"
                    required
                    rows={4}
                    placeholder="Share your experience with our products..."
                  />
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Submit Review
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};
