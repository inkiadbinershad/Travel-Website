import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

interface TravelerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const destination = location.state?.destination;
  const travelDate = location.state?.travelDate ? new Date(location.state.travelDate) : null;
  const travelers = location.state?.travelers || 2;

  const [travelerDetails, setTravelerDetails] = useState<TravelerDetails[]>(
    Array(travelers).fill(null).map(() => ({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    }))
  );

  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    if (!destination || !travelDate) {
      navigate(`/destinations/${slug}`);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [destination, travelDate, navigate, slug]);

  const totalPrice = destination ? destination.price_per_person * travelers : 0;
  const returnDate = travelDate && destination ? addDays(travelDate, destination.duration_days) : null;

  const handleTravelerChange = (index: number, field: keyof TravelerDetails, value: string) => {
    setTravelerDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateStep1 = () => {
    return travelerDetails.every(
      (t) => t.firstName && t.lastName && t.email && t.phone
    );
  };

  const handleSubmitBooking = async () => {
    if (!user || !destination || !travelDate) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([{
          user_id: user.id,
          destination_id: destination.id,
          booking_date: new Date().toISOString().split("T")[0],
          travel_date: format(travelDate, "yyyy-MM-dd"),
          return_date: returnDate ? format(returnDate, "yyyy-MM-dd") : null,
          travelers: travelers,
          total_price: totalPrice,
          special_requests: specialRequests || null,
          traveler_details: JSON.parse(JSON.stringify(travelerDetails)),
          status: "pending" as const,
        }])
        .select()
        .single();

      if (error) throw error;

      setBookingId(data.id);
      setBookingComplete(true);
      toast({
        title: "Booking confirmed!",
        description: "You'll receive a confirmation email shortly.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!destination || !travelDate) {
    return null;
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="w-20 h-20 rounded-full bg-travel-success/20 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-travel-success" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground mb-2">
              Your adventure to <span className="font-medium text-foreground">{destination.name}</span> is booked.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Booking ID: {bookingId?.slice(0, 8).toUpperCase()}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-accent hover:bg-accent/90"
              >
                View My Bookings
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/destinations")}
                className="w-full"
              >
                Explore More Destinations
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 py-12">
        <div className="container mx-auto px-4">
          {/* Progress Steps */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step > s ? <Check className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-16 md:w-24 h-1 mx-2 ${
                        step > s ? "bg-accent" : "bg-secondary"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className={step >= 1 ? "text-foreground" : "text-muted-foreground"}>
                Traveler Info
              </span>
              <span className={step >= 2 ? "text-foreground" : "text-muted-foreground"}>
                Review
              </span>
              <span className={step >= 3 ? "text-foreground" : "text-muted-foreground"}>
                Confirm
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="font-display text-2xl font-semibold mb-6">
                    Traveler Information
                  </h2>
                  <div className="space-y-6">
                    {travelerDetails.map((traveler, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Traveler {index + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`firstName-${index}`}>First Name</Label>
                            <Input
                              id={`firstName-${index}`}
                              value={traveler.firstName}
                              onChange={(e) =>
                                handleTravelerChange(index, "firstName", e.target.value)
                              }
                              placeholder="John"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`lastName-${index}`}>Last Name</Label>
                            <Input
                              id={`lastName-${index}`}
                              value={traveler.lastName}
                              onChange={(e) =>
                                handleTravelerChange(index, "lastName", e.target.value)
                              }
                              placeholder="Doe"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`email-${index}`}>Email</Label>
                            <Input
                              id={`email-${index}`}
                              type="email"
                              value={traveler.email}
                              onChange={(e) =>
                                handleTravelerChange(index, "email", e.target.value)
                              }
                              placeholder="john@example.com"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`phone-${index}`}>Phone</Label>
                            <Input
                              id={`phone-${index}`}
                              type="tel"
                              value={traveler.phone}
                              onChange={(e) =>
                                handleTravelerChange(index, "phone", e.target.value)
                              }
                              placeholder="+1 (555) 123-4567"
                              required
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <div>
                      <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                      <Textarea
                        id="specialRequests"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Any dietary requirements, accessibility needs, or special requests..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!validateStep1()}
                      className="bg-accent hover:bg-accent/90"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="font-display text-2xl font-semibold mb-6">
                    Review Your Booking
                  </h2>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Trip Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={destination.images?.[0] || "/placeholder.svg"}
                            alt={destination.name}
                            className="w-32 h-24 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-display text-xl font-semibold">
                              {destination.name}
                            </h3>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {destination.location}, {destination.country}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Travel Date</p>
                              <p className="font-medium">{format(travelDate, "MMM dd, yyyy")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Return Date</p>
                              <p className="font-medium">
                                {returnDate ? format(returnDate, "MMM dd, yyyy") : "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Travelers</p>
                              <p className="font-medium">{travelers}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Travelers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {travelerDetails.map((traveler, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">
                                  {traveler.firstName} {traveler.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {traveler.email}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Traveler {index + 1}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {specialRequests && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Special Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{specialRequests}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="bg-accent hover:bg-accent/90"
                    >
                      Continue to Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="font-display text-2xl font-semibold mb-6">
                    Confirm Your Booking
                  </h2>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <p className="text-lg mb-4">
                          Ready to book your adventure to{" "}
                          <span className="font-semibold">{destination.name}</span>?
                        </p>
                        <p className="text-muted-foreground mb-6">
                          By clicking confirm, you agree to our terms and conditions.
                        </p>
                        <Button
                          size="lg"
                          onClick={handleSubmitBooking}
                          disabled={loading}
                          className="bg-accent hover:bg-accent/90"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Confirm Booking - ${totalPrice}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-start mt-6">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-xl">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={destination.images?.[0] || "/placeholder.svg"}
                      alt={destination.name}
                      className="w-20 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{destination.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {destination.duration_days} days
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Travel Date</span>
                      <span>{format(travelDate, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Travelers</span>
                      <span>{travelers}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${destination.price_per_person} x {travelers}
                      </span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">${totalPrice}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
