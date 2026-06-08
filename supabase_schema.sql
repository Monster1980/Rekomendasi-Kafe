-- SQL Schema for Supabase (PostgreSQL)

-- 1. Create Cafes Table
CREATE TABLE cafes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    imageUrl TEXT,
    overallRating DECIMAL(3, 1),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Reviews Table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE,
    review_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Example function for Keyword Counting (Optional if done in Backend)
-- For this project, we process the keywords in the Next.js Server Actions 
-- or directly in the UI as implemented.

-- Dummy Data Insertion Script
INSERT INTO cafes (name, imageUrl, overallRating, address) VALUES
('Kopi Nanti Dulu', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24', 4.8, 'Jl. Senopati No. 12, Jakarta Selatan'),
('Warung Kopi Hemat', 'https://images.unsplash.com/photo-1501339819358-683280f119ba', 4.2, 'Jl. Margonda Raya No. 45, Depok');

-- Insert reviews for Kopi Nanti Dulu (Example)
-- Assuming the ID is grabbed from the previous insert.
