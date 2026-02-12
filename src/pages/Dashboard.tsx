import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, Calendar, Heart, Star, Settings, LogOut, MapPin, 
  Clock, ChevronRight, Loader2
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  bio: string;
}

interface Booking {
  id: string;
  travel_date: string;
  return_date: string;
  travelers: number;
  total_price: number;
  status: string;
  created_at: string;
  destinations: {
    name: string;
    slug: string;
    images: string[];
    location: string;
    country: string;
  };
}

interface Favorite {
  id: string;
  destination_id: string;
  destinations: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    location: string;
    country: string;
    price_per_person: number;
    rating: number;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setProfileForm({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
        });
      }

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          *,
          destinations (
            name,
            slug,
            images,
            location,
            country
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bookingsData) {
        setBookings(bookingsData);
      }

      // Fetch favorites
      const { data: favoritesData } = await supabase
        .from("favorites")
        .select(`
          *,
          destinations (
            id,
            name,
            slug,
            images,
            location,
            country,
            price_per_person,
            rating
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (favoritesData) {
        setFavorites(favoritesData);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          bio: profileForm.bio,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({ title: "Profile updated successfully!" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const removeFavorite = async (favoriteId: string) => {
    await supabase.from("favorites").delete().eq("id", favoriteId);
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    toast({ title: "Removed from favorites" });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-travel-warning/20 text-travel-warning",
    confirmed: "bg-travel-success/20 text-travel-success",
    cancelled: "bg-destructive/20 text-destructive",
    completed: "bg-primary/20 text-primary",
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20 py-12">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <Skeleton className="h-64" />
              <div className="lg:col-span-3">
                <Skeleton className="h-96" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 py-12">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-foreground mb-8"
          >
            My Dashboard
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || "User"}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">
                      {profile?.full_name || "Traveler"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <span className="text-sm">Total Bookings</span>
                      <span className="font-semibold">{bookings.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <span className="text-sm">Saved Destinations</span>
                      <span className="font-semibold">{favorites.length}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-6"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <Tabs defaultValue="bookings">
                <TabsList className="mb-6">
                  <TabsTrigger value="bookings" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Bookings
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="gap-2">
                    <Heart className="h-4 w-4" />
                    Favorites
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                {/* Bookings Tab */}
                <TabsContent value="bookings">
                  {bookings.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No bookings yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start planning your next adventure!
                        </p>
                        <Link to="/destinations">
                          <Button>Explore Destinations</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="py-4">
                            <div className="flex flex-col md:flex-row gap-4">
                              <img
                                src={booking.destinations?.images?.[0] || "/placeholder.svg"}
                                alt={booking.destinations?.name}
                                className="w-full md:w-32 h-24 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-lg">
                                      {booking.destinations?.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {booking.destinations?.location}, {booking.destinations?.country}
                                    </p>
                                  </div>
                                  <Badge className={statusColors[booking.status]}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(booking.travel_date), "MMM dd, yyyy")}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {booking.travelers} travelers
                                  </span>
                                  <span className="font-semibold text-foreground">
                                    ${booking.total_price}
                                  </span>
                                </div>
                              </div>
                              <Link to={`/destinations/${booking.destinations?.slug}`}>
                                <Button variant="ghost" size="icon">
                                  <ChevronRight className="h-5 w-5" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Favorites Tab */}
                <TabsContent value="favorites">
                  {favorites.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No favorites yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Save destinations you love for later!
                        </p>
                        <Link to="/destinations">
                          <Button>Explore Destinations</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favorites.map((favorite) => (
                        <Card key={favorite.id} className="overflow-hidden">
                          <div className="flex">
                            <img
                              src={favorite.destinations?.images?.[0] || "/placeholder.svg"}
                              alt={favorite.destinations?.name}
                              className="w-32 h-full object-cover"
                            />
                            <CardContent className="flex-1 py-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Link to={`/destinations/${favorite.destinations?.slug}`}>
                                    <h3 className="font-semibold hover:text-primary transition-colors">
                                      {favorite.destinations?.name}
                                    </h3>
                                  </Link>
                                  <p className="text-sm text-muted-foreground">
                                    {favorite.destinations?.location}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-travel-gold fill-travel-gold" />
                                      <span className="text-sm font-medium">
                                        {favorite.destinations?.rating}
                                      </span>
                                    </div>
                                    <span className="text-sm font-semibold text-primary">
                                      ${favorite.destinations?.price_per_person}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFavorite(favorite.id)}
                                >
                                  <Heart className="h-5 w-5 fill-accent text-accent" />
                                </Button>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                              id="full_name"
                              value={profileForm.full_name}
                              onChange={(e) =>
                                setProfileForm((prev) => ({ ...prev, full_name: e.target.value }))
                              }
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={profileForm.phone}
                              onChange={(e) =>
                                setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                              }
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Input
                            id="bio"
                            value={profileForm.bio}
                            onChange={(e) =>
                              setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                            }
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                        <Button type="submit" disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
