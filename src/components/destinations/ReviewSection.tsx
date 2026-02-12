import { useEffect, useState } from "react";
import { Star, ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  helpful_count: number;
  is_verified: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface ReviewSectionProps {
  destinationId: string;
}

const ReviewSection = ({ destinationId }: ReviewSectionProps) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("destination_id", destinationId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Fetch profiles separately
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
        
        const reviewsWithProfiles = data.map(review => ({
          ...review,
          profiles: profilesMap.get(review.user_id) || null
        }));
        
        setReviews(reviewsWithProfiles as Review[]);
      }
      setLoading(false);
    };

    fetchReviews();
  }, [destinationId]);

  useEffect(() => {
    const fetchUserVotes = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("helpful_votes")
        .select("review_id")
        .eq("user_id", user.id);

      if (data) {
        setUserVotes(new Set(data.map((v) => v.review_id)));
      }
    };

    fetchUserVotes();
  }, [user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          user_id: user.id,
          destination_id: destinationId,
          rating: newReview.rating,
          title: newReview.title,
          content: newReview.content,
        })
        .select("*")
        .single();

      if (error) throw error;

      // Fetch profile for the new review
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      const newReviewWithProfile = {
        ...data,
        profiles: profileData || null
      } as Review;

      setReviews([newReviewWithProfile, ...reviews]);
      setNewReview({ rating: 5, title: "", content: "" });
      setShowReviewForm(false);
      toast({ title: "Review submitted successfully!" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote.",
      });
      return;
    }

    if (userVotes.has(reviewId)) {
      // Remove vote
      await supabase
        .from("helpful_votes")
        .delete()
        .eq("user_id", user.id)
        .eq("review_id", reviewId);

      await supabase
        .from("reviews")
        .update({ helpful_count: reviews.find((r) => r.id === reviewId)!.helpful_count - 1 })
        .eq("id", reviewId);

      setUserVotes((prev) => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpful_count: r.helpful_count - 1 } : r
        )
      );
    } else {
      // Add vote
      await supabase.from("helpful_votes").insert({
        user_id: user.id,
        review_id: reviewId,
      });

      await supabase
        .from("reviews")
        .update({ helpful_count: reviews.find((r) => r.id === reviewId)!.helpful_count + 1 })
        .eq("id", reviewId);

      setUserVotes((prev) => new Set(prev).add(reviewId));

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
        )
      );
    }
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const hasUserReviewed = reviews.some((r) => r.user_id === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">
          Reviews ({reviews.length})
        </h2>
        {user && !hasUserReviewed && (
          <Button onClick={() => setShowReviewForm(!showReviewForm)}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Rating Summary */}
      <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground">{averageRating}</div>
          <div className="flex items-center gap-1 justify-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(Number(averageRating))
                    ? "text-travel-gold fill-travel-gold"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {reviews.length} reviews
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= newReview.rating
                            ? "text-travel-gold fill-travel-gold"
                            : "text-muted-foreground hover:text-travel-gold"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Summarize your experience"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Review</label>
                <Textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your experience..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {review.profiles?.avatar_url ? (
                      <img
                        src={review.profiles.avatar_url}
                        alt={review.profiles.full_name || "User"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">
                          {review.profiles?.full_name || "Anonymous"}
                          {review.is_verified && (
                            <span className="ml-2 text-xs bg-travel-success/20 text-travel-success px-2 py-0.5 rounded">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "text-travel-gold fill-travel-gold"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span>•</span>
                          <span>{format(new Date(review.created_at), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </div>

                    {review.title && (
                      <h4 className="font-medium mb-1">{review.title}</h4>
                    )}
                    <p className="text-muted-foreground">{review.content}</p>

                    {/* Helpful Button */}
                    <div className="mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={userVotes.has(review.id) ? "text-primary" : ""}
                        onClick={() => handleHelpfulVote(review.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpful_count})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
