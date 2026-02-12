import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "New York, USA",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    rating: 5,
    text: "Our trip to Bali was absolutely magical! The attention to detail and personalized experiences made it unforgettable. The team went above and beyond to ensure every moment was perfect.",
    destination: "Bali Paradise Escape",
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "Toronto, Canada",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    rating: 5,
    text: "The Swiss Alps adventure exceeded all expectations. From the stunning mountain views to the cozy chalets, everything was perfectly organized. Will definitely book again!",
    destination: "Swiss Alps Adventure",
  },
  {
    id: 3,
    name: "Emma Williams",
    location: "London, UK",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
    rating: 5,
    text: "Santorini was a dream come true! The romantic dinner at sunset, the wine tasting, and the beautiful accommodations made our anniversary truly special.",
    destination: "Santorini Romance",
  },
  {
    id: 4,
    name: "David Kim",
    location: "Seoul, South Korea",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
    rating: 5,
    text: "The Tokyo Cultural Journey was an incredible experience. The blend of traditional and modern Japan, combined with expert local guides, made every day an adventure.",
    destination: "Tokyo Cultural Journey",
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-4"
          >
            Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          >
            What Our Travelers Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-primary-foreground/80 max-w-2xl mx-auto"
          >
            Hear from adventurers who have explored the world with us.
          </motion.p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-10 text-primary-foreground hover:bg-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-10 text-primary-foreground hover:bg-white/10"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Testimonial Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12"
            >
              <Quote className="h-12 w-12 text-accent mb-6" />
              
              <p className="text-lg md:text-xl mb-8 leading-relaxed">
                "{testimonials[currentIndex].text}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-lg">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-sm text-primary-foreground/70">
                    {testimonials[currentIndex].location}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-travel-gold fill-travel-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-primary-foreground/70">
                    {testimonials[currentIndex].destination}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-accent"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
