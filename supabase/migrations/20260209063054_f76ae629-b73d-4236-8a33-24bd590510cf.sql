-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create destinations table
CREATE TABLE public.destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  price_per_person DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 1,
  max_group_size INTEGER DEFAULT 20,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  included TEXT[] DEFAULT '{}',
  not_included TEXT[] DEFAULT '{}',
  rating DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  travel_date DATE NOT NULL,
  return_date DATE,
  travelers INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  traveler_details JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  images TEXT[] DEFAULT '{}',
  helpful_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, destination_id)
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, destination_id)
);

-- Create helpful_votes table for review voting
CREATE TABLE public.helpful_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, review_id)
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to update destination rating
CREATE OR REPLACE FUNCTION public.update_destination_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.destinations
  SET 
    rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE destination_id = COALESCE(NEW.destination_id, OLD.destination_id)),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE destination_id = COALESCE(NEW.destination_id, OLD.destination_id))
  WHERE id = COALESCE(NEW.destination_id, OLD.destination_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_destination_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_destination_rating();

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpful_votes ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Destinations policies (public read for active)
CREATE POLICY "Active destinations are viewable by everyone"
  ON public.destinations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage destinations"
  ON public.destinations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Helpful votes policies
CREATE POLICY "Users can view helpful votes"
  ON public.helpful_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add helpful votes"
  ON public.helpful_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes"
  ON public.helpful_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, icon) VALUES
  ('Beach', 'beach', 'Sun, sand, and crystal-clear waters', '🏖️'),
  ('Mountain', 'mountain', 'Majestic peaks and hiking adventures', '⛰️'),
  ('City', 'city', 'Urban exploration and cultural experiences', '🏙️'),
  ('Adventure', 'adventure', 'Thrilling activities and outdoor sports', '🎯'),
  ('Cultural', 'cultural', 'History, art, and local traditions', '🏛️'),
  ('Romantic', 'romantic', 'Perfect getaways for couples', '💕');

-- Insert sample destinations
INSERT INTO public.destinations (name, slug, description, short_description, location, country, price_per_person, duration_days, category_id, images, highlights, included, is_featured, rating, review_count) VALUES
  ('Bali Paradise Escape', 'bali-paradise-escape', 'Experience the magic of Bali with its stunning temples, lush rice terraces, and beautiful beaches. This comprehensive tour takes you through the cultural heart of Ubud, the sacred temples of Tanah Lot, and the pristine shores of Seminyak.', 'Discover ancient temples, rice terraces, and pristine beaches', 'Ubud, Seminyak', 'Indonesia', 1299.00, 7, (SELECT id FROM public.categories WHERE slug = 'beach'), ARRAY['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'], ARRAY['Temple visits', 'Rice terrace walks', 'Beach relaxation', 'Traditional dance shows', 'Spa treatments'], ARRAY['Accommodation', 'Daily breakfast', 'Airport transfers', 'Guided tours', 'Entrance fees'], true, 4.8, 156),
  
  ('Swiss Alps Adventure', 'swiss-alps-adventure', 'Embark on an unforgettable journey through the Swiss Alps. From the iconic Matterhorn to charming alpine villages, experience breathtaking mountain scenery, world-class skiing, and authentic Swiss hospitality.', 'Majestic mountain views and alpine adventures await', 'Zermatt, Interlaken', 'Switzerland', 2499.00, 5, (SELECT id FROM public.categories WHERE slug = 'mountain'), ARRAY['https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800', 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=800', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'], ARRAY['Matterhorn viewing', 'Glacier Express ride', 'Mountain hiking', 'Fondue dinner', 'Cable car experiences'], ARRAY['4-star accommodation', 'Half-board meals', 'Train passes', 'Guided hikes', 'Travel insurance'], true, 4.9, 89),
  
  ('Tokyo Cultural Journey', 'tokyo-cultural-journey', 'Immerse yourself in the fascinating blend of ancient tradition and cutting-edge modernity that is Tokyo. From serene temples to neon-lit streets, discover why Tokyo is one of the world''s most captivating cities.', 'Where ancient tradition meets futuristic innovation', 'Tokyo, Kyoto', 'Japan', 1899.00, 8, (SELECT id FROM public.categories WHERE slug = 'city'), ARRAY['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800'], ARRAY['Temple visits', 'Tea ceremony', 'Sushi making class', 'Shibuya crossing', 'Mt. Fuji day trip'], ARRAY['Premium hotels', 'JR Rail Pass', 'Guided tours', 'Authentic meals', 'Cultural activities'], true, 4.7, 234),
  
  ('Santorini Romance', 'santorini-romance', 'Fall in love with the stunning sunsets, whitewashed buildings, and azure waters of Santorini. This romantic escape offers couples the perfect blend of relaxation, adventure, and Greek hospitality.', 'Sunset views and romantic moments in paradise', 'Oia, Fira', 'Greece', 1699.00, 5, (SELECT id FROM public.categories WHERE slug = 'romantic'), ARRAY['https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800', 'https://images.unsplash.com/photo-1559511260-66a1adb5e1da?w=800'], ARRAY['Sunset dinner', 'Wine tasting', 'Catamaran cruise', 'Ancient ruins tour', 'Cooking class'], ARRAY['Boutique hotel', 'Daily breakfast', 'Wine tour', 'Boat excursion', 'Private transfers'], true, 4.9, 178),
  
  ('Costa Rica Eco Adventure', 'costa-rica-eco-adventure', 'Explore the incredible biodiversity of Costa Rica through rainforest hikes, wildlife spotting, and thrilling adventures. From zip-lining through the canopy to relaxing in natural hot springs.', 'Rainforests, wildlife, and adventure await', 'Arenal, Monteverde', 'Costa Rica', 1599.00, 6, (SELECT id FROM public.categories WHERE slug = 'adventure'), ARRAY['https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800', 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800', 'https://images.unsplash.com/photo-1523815378073-0d8126cfaa5d?w=800'], ARRAY['Zip-lining', 'Hot springs', 'Wildlife tours', 'Volcano hike', 'Waterfall visit'], ARRAY['Eco-lodges', 'All meals', 'Guided tours', 'Equipment', 'National park fees'], true, 4.6, 145),
  
  ('Moroccan Desert Safari', 'moroccan-desert-safari', 'Journey through the enchanting landscapes of Morocco, from the bustling medinas of Marrakech to the golden dunes of the Sahara. Experience traditional Berber hospitality under the stars.', 'Ancient medinas and golden Sahara dunes', 'Marrakech, Sahara', 'Morocco', 1199.00, 6, (SELECT id FROM public.categories WHERE slug = 'cultural'), ARRAY['https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800', 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800', 'https://images.unsplash.com/photo-1548018560-c7196548e84d?w=800'], ARRAY['Medina exploration', 'Camel trek', 'Desert camping', 'Traditional hammam', 'Cooking class'], ARRAY['Riad accommodation', 'Desert camp', 'All transport', 'Most meals', 'Local guides'], false, 4.5, 98);