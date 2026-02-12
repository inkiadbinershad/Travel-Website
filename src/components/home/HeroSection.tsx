import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

const heroImages = [
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80",
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [travelers, setTravelers] = useState(2);
  const [currentImageIndex] = useState(0);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("search", destination);
    if (date) params.set("date", format(date, "yyyy-MM-dd"));
    if (travelers) params.set("travelers", travelers.toString());
    navigate(`/destinations?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <motion.div
          key={currentImageIndex}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={heroImages[currentImageIndex]}
            alt="Beautiful travel destination"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1.5 bg-accent/90 text-accent-foreground rounded-full text-sm font-medium mb-6">
              ✨ Discover Your Next Adventure
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Explore the World's Most
            <span className="text-accent"> Beautiful </span>
            Destinations
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto"
          >
            From pristine beaches to majestic mountains, discover handpicked experiences that will create memories lasting a lifetime.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Destination */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Where to?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10 h-12 border-0 bg-secondary/50 focus-visible:ring-primary"
                />
              </div>

              {/* Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-12 justify-start bg-secondary/50 hover:bg-secondary/70 text-left font-normal"
                  >
                    <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                    {date ? format(date, "MMM dd, yyyy") : "When?"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>

              {/* Travelers */}
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full h-12 pl-10 pr-4 rounded-md bg-secondary/50 border-0 text-foreground focus:ring-2 focus:ring-primary"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Traveler" : "Travelers"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                className="h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12 text-white"
          >
            {[
              { value: "500+", label: "Destinations" },
              { value: "10k+", label: "Happy Travelers" },
              { value: "4.9", label: "Average Rating" },
              { value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-1"
        >
          <div className="w-1.5 h-3 bg-white/70 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
