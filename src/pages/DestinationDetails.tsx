import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Clock, Users, Calendar, Check, X, 
  Heart, Share2, ChevronLeft, ChevronRight, ArrowLeft
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import ReviewSection from "@/components/destinations/ReviewSection";

interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  location: string;
  country: string;
  price_per_person: number;
  duration_days: number;
  max_group_size: number;
  images: string[];
  highlights: string[];
  included: string[];
  not_included: string[];
  rating: number;
  review_count: number;
}

const DestinationDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [travelers, setTravelers] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);

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
    const fetchDestination = async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        navigate("/destinations");
        return;
      }

      setDestination(data);
      setLoading(false);
    };

    fetchDestination();
  }, [slug, navigate]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !destination) return;

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("destination_id", destination.id)
        .single();

      setIsFavorite(!!data);
    };

    checkFavorite();
  }, [user, destination]);

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites.",
      });
      navigate("/auth");
      return;
    }

    if (!destination) return;

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("destination_id", destination.id);
      setIsFavorite(false);
      toast({ title: "Removed from favorites" });
    } else {
      await supabase.from("favorites").insert({
        user_id: user.id,
        destination_id: destination.id,
      });
      setIsFavorite(true);
      toast({ title: "Added to favorites" });
    }
  };

  const handleBookNow = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make a booking.",
      });
      navigate("/auth");
      return;
    }

    if (!selectedDate) {
      toast({
        variant: "destructive",
        title: "Select a date",
        description: "Please select a travel date.",
      });
      return;
    }

    navigate(`/booking/${destination?.slug}`, {
      state: {
        destination,
        travelDate: selectedDate,
        travelers,
      },
    });
  };

  const nextImage = () => {
    if (destination?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % destination.images.length);
    }
  };

  const prevImage = () => {
    if (destination?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + destination.images.length) % destination.images.length);
    }
  };

  const totalPrice = destination ? destination.price_per_person * travelers : 0;
  const returnDate = selectedDate && destination ? addDays(selectedDate, destination.duration_days) : null;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <div className="h-[60vh] w-full">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="container mx-auto px-4 py-12">
            <Skeleton className="h-10 w-1/2 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-8" />
            <Skeleton className="h-40 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!destination) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Image Gallery */}
        <section className="relative h-[60vh] overflow-hidden">
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={destination.images?.[currentImageIndex] || "/placeholder.svg"}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Navigation Arrows */}
          {destination.images?.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Thumbnails */}
          {destination.images?.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {destination.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? "w-8 bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Back Button */}
          <Link
            to="/destinations"
            className="absolute top-4 left-4 flex items-center gap-2 text-white bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-black/40 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white"
              onClick={handleFavorite}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-accent text-accent" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Title & Meta */}
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
                  >
                    {destination.name}
                  </motion.h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{destination.location}, {destination.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-travel-gold fill-travel-gold" />
                      <span className="font-medium text-foreground">{destination.rating}</span>
                      <span>({destination.review_count} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{destination.duration_days} days</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Max {destination.max_group_size} travelers</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="font-display text-2xl font-semibold mb-4">About This Trip</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {destination.description}
                  </p>
                </motion.div>

                {/* Highlights */}
                {destination.highlights?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="font-display text-2xl font-semibold mb-4">Highlights</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {destination.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-travel-success/20 flex items-center justify-center">
                            <Check className="h-4 w-4 text-travel-success" />
                          </div>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Included / Not Included */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {destination.included?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="font-display text-xl font-semibold mb-4 text-travel-success">
                        What's Included
                      </h3>
                      <ul className="space-y-2">
                        {destination.included.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-muted-foreground">
                            <Check className="h-4 w-4 text-travel-success" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {destination.not_included?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="font-display text-xl font-semibold mb-4 text-destructive">
                        Not Included
                      </h3>
                      <ul className="space-y-2">
                        {destination.not_included.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-muted-foreground">
                            <X className="h-4 w-4 text-destructive" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>

                {/* Reviews */}
                <ReviewSection destinationId={destination.id} />
              </div>

              {/* Booking Card */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="sticky top-24"
                >
                  <Card className="shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">
                          ${destination.price_per_person}
                        </span>
                        <span className="text-muted-foreground font-normal">/ person</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Date Selection */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Travel Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              <Calendar className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {returnDate && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Return: {format(returnDate, "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>

                      {/* Travelers */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Travelers</label>
                        <select
                          value={travelers}
                          onChange={(e) => setTravelers(Number(e.target.value))}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        >
                          {[...Array(destination.max_group_size)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i === 0 ? "Traveler" : "Travelers"}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Price Summary */}
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            ${destination.price_per_person} x {travelers} travelers
                          </span>
                          <span>${totalPrice}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span className="text-primary">${totalPrice}</span>
                        </div>
                      </div>

                      {/* Book Button */}
                      <Button
                        onClick={handleBookNow}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        size="lg"
                      >
                        Book Now
                      </Button>

                      <p className="text-center text-sm text-muted-foreground">
                        Free cancellation up to 48 hours before
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DestinationDetails;
