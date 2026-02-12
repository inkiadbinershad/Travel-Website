import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Star, Clock, MapPin, X } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";

interface Destination {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  location: string;
  country: string;
  price_per_person: number;
  duration_days: number;
  images: string[];
  rating: number;
  review_count: number;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Destinations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState("popularity");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      let query = supabase
        .from("destinations")
        .select("*")
        .eq("is_active", true);

      // Apply category filter
      if (selectedCategory && selectedCategory !== "all") {
        const category = categories.find((c) => c.slug === selectedCategory);
        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      // Apply price filter
      query = query
        .gte("price_per_person", priceRange[0])
        .lte("price_per_person", priceRange[1]);

      // Apply search
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,country.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          query = query.order("price_per_person", { ascending: true });
          break;
        case "price-high":
          query = query.order("price_per_person", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        default:
          query = query.order("review_count", { ascending: false });
      }

      const { data, error } = await query;

      if (!error && data) {
        setDestinations(data);
      }
      setLoading(false);
    };

    fetchDestinations();
  }, [selectedCategory, sortBy, priceRange, searchTerm, categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange([0, 5000]);
    setSortBy("popularity");
    setSearchParams({});
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all" || priceRange[0] > 0 || priceRange[1] < 5000;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero Banner */}
        <section className="bg-primary py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4"
            >
              Explore Destinations
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-primary-foreground/80 max-w-2xl mx-auto mb-8"
            >
              Discover extraordinary places and create unforgettable memories
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSearch}
              className="max-w-xl mx-auto flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-background"
                />
              </div>
              <Button type="submit" className="h-12 px-6 bg-accent hover:bg-accent/90">
                Search
              </Button>
            </motion.form>
          </div>
        </section>

        {/* Filters & Results */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="md:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Price Range: ${priceRange[0]} - ${priceRange[1]}
                        </label>
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          min={0}
                          max={5000}
                          step={100}
                        />
                      </div>
                      <Button onClick={() => setIsFilterOpen(false)} className="w-full">
                        Apply Filters
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Results Count */}
              <p className="text-muted-foreground">
                {loading ? "Loading..." : `${destinations.length} destinations found`}
              </p>
            </div>

            {/* Desktop Price Filter */}
            <div className="hidden md:block mb-8">
              <div className="flex items-center gap-4 max-w-md">
                <span className="text-sm font-medium whitespace-nowrap">
                  Price: ${priceRange[0]} - ${priceRange[1]}
                </span>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={5000}
                  step={100}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-64 w-full" />
                    <CardContent className="p-5">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : destinations.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="font-display text-2xl font-semibold mb-2">No destinations found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {destinations.map((destination) => (
                  <motion.div
                    key={destination.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <Link to={`/destinations/${destination.slug}`}>
                      <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="relative h-64 overflow-hidden">
                          <img
                            src={destination.images?.[0] || "/placeholder.svg"}
                            alt={destination.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                            From ${destination.price_per_person}
                          </div>
                          <div className="absolute bottom-4 left-4 flex items-center gap-1 text-white">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {destination.location}, {destination.country}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {destination.name}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {destination.short_description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-travel-gold fill-travel-gold" />
                                <span className="font-medium text-foreground">
                                  {destination.rating}
                                </span>
                                <span>({destination.review_count})</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{destination.duration_days} days</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Destinations;
