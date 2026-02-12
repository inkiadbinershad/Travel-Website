import { motion } from "framer-motion";
import { Shield, Heart, Clock, Headphones, Award, Globe } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure Booking",
    description: "Your payments and personal information are protected with industry-standard security.",
  },
  {
    icon: Heart,
    title: "Handpicked Experiences",
    description: "Every destination is carefully selected and vetted for quality and authenticity.",
  },
  {
    icon: Clock,
    title: "Flexible Booking",
    description: "Plans change. Enjoy free cancellation up to 48 hours before your trip.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our travel experts are available around the clock to assist you.",
  },
  {
    icon: Award,
    title: "Best Price Guarantee",
    description: "Find a lower price? We'll match it and give you an extra 10% off.",
  },
  {
    icon: Globe,
    title: "Local Expertise",
    description: "Connect with local guides who bring destinations to life with insider knowledge.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-travel-success/10 text-travel-success rounded-full text-sm font-medium mb-4"
          >
            Why Wanderlust
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            Travel with Confidence
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            We're committed to making your travel dreams a reality with exceptional service and unforgettable experiences.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              className="group p-6 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
