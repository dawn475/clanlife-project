-- Profiles table: Stores player-specific data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  leaves INTEGER DEFAULT 100,
  stardust INTEGER DEFAULT 10,
  avatar TEXT DEFAULT '🐱',
  clan_name TEXT,
  biome TEXT DEFAULT 'forest',
  moons_played INTEGER DEFAULT 1,
  reputation INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Cats table: Stores all cats for all players
CREATE TABLE cats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  gender TEXT,
  age INTEGER DEFAULT 0,
  coat TEXT,
  pattern TEXT,
  eyes TEXT,
  art TEXT,
  traits TEXT[], -- Array of strings
  health INTEGER DEFAULT 100,
  attack INTEGER DEFAULT 50,
  speed INTEGER DEFAULT 50,
  stamina INTEGER DEFAULT 50,
  wisdom INTEGER DEFAULT 50,
  xp INTEGER DEFAULT 0,
  max_xp INTEGER DEFAULT 100,
  alive BOOLEAN DEFAULT true,
  mother_id UUID REFERENCES cats(id),
  father_id UUID REFERENCES cats(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inventory table: Stores items for each player
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  UNIQUE(owner_id, item_id)
);

-- Marketplace table: For global trading
CREATE TABLE marketplace (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  price_leaves INTEGER,
  price_stardust INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace ENABLE ROW LEVEL SECURITY;

-- Policies
-- Profiles: Everyone can see usernames, only owner can update
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Cats: Everyone can see cats, only owner can modify
CREATE POLICY "Cats are viewable by everyone." ON cats FOR SELECT USING (true);
CREATE POLICY "Users can insert their own cats." ON cats FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own cats." ON cats FOR UPDATE USING (auth.uid() = owner_id);

-- Inventory: Only owner can see/modify their own inventory
CREATE POLICY "Users can see own inventory." ON inventory FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can modify own inventory." ON inventory FOR ALL USING (auth.uid() = owner_id);

-- Marketplace: Everyone can see, only owner can modify their listings
CREATE POLICY "Marketplace is viewable by everyone." ON marketplace FOR SELECT USING (true);
CREATE POLICY "Users can list items." ON marketplace FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can remove own listings." ON marketplace FOR DELETE USING (auth.uid() = seller_id);
