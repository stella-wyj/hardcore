-- ============================================
-- AIRBNB DATABASE - SQL OUTLINE
-- ============================================

-- TODO: Create database
-- CREATE DATABASE airbnb;

-- TODO: Use the database
-- USE airbnb;

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- TODO: Create users table to store user information
-- Should include:
-- - id (PRIMARY KEY, AUTO_INCREMENT)
-- - username
-- - email (UNIQUE)
-- - password_hash
-- - first_name
-- - last_name
-- - phone_number
-- - profile_image_url
-- - created_at (TIMESTAMP)
-- - updated_at (TIMESTAMP)

-- CREATE TABLE users (
--     -- TODO: Add columns here
-- );


-- ============================================
-- 2. LISTINGS TABLE
-- ============================================
-- TODO: Create listings table to store property information
-- Should include:
-- - id (PRIMARY KEY, AUTO_INCREMENT)
-- - host_id (FOREIGN KEY to users.id)
-- - title
-- - description
-- - address
-- - city
-- - state
-- - country
-- - postal_code
-- - latitude
-- - longitude
-- - property_type (e.g., "Apartment", "House", "Condo")
-- - room_type (e.g., "Entire place", "Private room", "Shared room")
-- - accommodates (number of guests)
-- - bedrooms
-- - beds
-- - bathrooms
-- - price_per_night
-- - cleaning_fee
-- - security_deposit
-- - created_at (TIMESTAMP)
-- - updated_at (TIMESTAMP)
-- - is_active (BOOLEAN)

-- CREATE TABLE listings (
--     -- TODO: Add columns here
--     -- TODO: Add FOREIGN KEY constraint for host_id
-- );


-- ============================================
-- 3. LISTING_IMAGES TABLE
-- ============================================
-- TODO: Create listing_images table (one listing can have many images)
-- Should include:
-- - id (PRIMARY KEY, AUTO_INCREMENT)
-- - listing_id (FOREIGN KEY to listings.id)
-- - image_url
-- - image_order (for ordering images)
-- - is_primary (BOOLEAN - for main image)
-- - created_at (TIMESTAMP)

-- CREATE TABLE listing_images (
--     -- TODO: Add columns here
--     -- TODO: Add FOREIGN KEY constraint for listing_id
-- );


-- ============================================
-- 4. BOOKINGS TABLE
-- ============================================
-- TODO: Create bookings table to store reservation information
-- Should include:
-- - id (PRIMARY KEY, AUTO_INCREMENT)
-- - listing_id (FOREIGN KEY to listings.id)
-- - guest_id (FOREIGN KEY to users.id)
-- - check_in_date (DATE)
-- - check_out_date (DATE)
-- - number_of_guests
-- - total_price
-- - status (e.g., "pending", "confirmed", "cancelled", "completed")
-- - created_at (TIMESTAMP)
-- - updated_at (TIMESTAMP)

-- CREATE TABLE bookings (
--     -- TODO: Add columns here
--     -- TODO: Add FOREIGN KEY constraints
--     -- TODO: Add CHECK constraint for check_out_date > check_in_date
-- );


-- ============================================
-- 5. REVIEWS TABLE
-- ============================================
-- TODO: Create reviews table for guest reviews
-- Should include:
-- - id (PRIMARY KEY, AUTO_INCREMENT)
-- - booking_id (FOREIGN KEY to bookings.id)
-- - reviewer_id (FOREIGN KEY to users.id - the guest)
-- - listing_id (FOREIGN KEY to listings.id)
-- - rating (INTEGER, 1-5)
-- - comment (TEXT)
-- - created_at (TIMESTAMP)
-- - updated_at (TIMESTAMP)

-- CREATE TABLE reviews (
--     -- TODO: Add columns here
--     -- TODO: Add FOREIGN KEY constraints
--     -- TODO: Add CHECK constraint for rating between 1 and 5
-- );


-- ============================================
-- 6. AMENITIES TABLE
-- ============================================
-- TODO: Create amenities table (many-to-many relationship with listings)
-- Should include:
-- - id (PRIMARY KEY, AUTO_INCREMENT)
-- - name (e.g., "WiFi", "Pool", "Kitchen", "Air conditioning")
-- - icon_url (optional)

-- CREATE TABLE amenities (
--     -- TODO: Add columns here
-- );


-- ============================================
-- 7. LISTING_AMENITIES TABLE (Junction Table)
-- ============================================
-- TODO: Create junction table for listing-amenities many-to-many relationship
-- Should include:
-- - listing_id (FOREIGN KEY to listings.id)
-- - amenity_id (FOREIGN KEY to amenities.id)
-- - PRIMARY KEY (listing_id, amenity_id)

-- CREATE TABLE listing_amenities (
--     -- TODO: Add columns here
--     -- TODO: Add FOREIGN KEY constraints
--     -- TODO: Add composite PRIMARY KEY
-- );


-- ============================================
-- 8. CATEGORIES TABLE (Optional)
-- ============================================
-- TODO: Create categories table (Beach, Mountain, City, etc.)
-- Should include:
-- - id (PRIMARY KEY, AUTO_INCREMENT)
-- - name
-- - image_url

-- CREATE TABLE categories (
--     -- TODO: Add columns here
-- );


-- ============================================
-- 9. LISTING_CATEGORIES TABLE (Junction Table)
-- ============================================
-- TODO: Create junction table for listing-categories relationship
-- Should include:
-- - listing_id (FOREIGN KEY)
-- - category_id (FOREIGN KEY)
-- - PRIMARY KEY (listing_id, category_id)

-- CREATE TABLE listing_categories (
--     -- TODO: Add columns here
-- );


-- ============================================
-- 10. SAMPLE DATA (INSERT STATEMENTS)
-- ============================================
-- TODO: Insert sample users
-- INSERT INTO users (username, email, password_hash, first_name, last_name) 
-- VALUES (...);

-- TODO: Insert sample amenities
-- INSERT INTO amenities (name) VALUES ('WiFi'), ('Pool'), ('Kitchen'), ...;

-- TODO: Insert sample categories
-- INSERT INTO categories (name, image_url) VALUES (...);

-- TODO: Insert sample listings
-- INSERT INTO listings (host_id, title, description, address, city, price_per_night, ...)
-- VALUES (...);

-- TODO: Insert sample listing images
-- INSERT INTO listing_images (listing_id, image_url, is_primary) VALUES (...);

-- TODO: Insert sample listing-amenities relationships
-- INSERT INTO listing_amenities (listing_id, amenity_id) VALUES (...);


-- ============================================
-- 11. USEFUL QUERIES
-- ============================================

-- TODO: Query to get all listings with their host information
-- SELECT listings.*, users.first_name, users.last_name
-- FROM listings
-- JOIN users ON listings.host_id = users.id;

-- TODO: Query to get all listings with their images
-- SELECT listings.*, listing_images.image_url, listing_images.is_primary
-- FROM listings
-- LEFT JOIN listing_images ON listings.id = listing_images.listing_id;

-- TODO: Query to get available listings (not booked for specific dates)
-- SELECT listings.*
-- FROM listings
-- WHERE listings.id NOT IN (
--     SELECT listing_id FROM bookings
--     WHERE (check_in_date <= ? AND check_out_date >= ?)
--     AND status = 'confirmed'
-- );

-- TODO: Query to get listings with average rating
-- SELECT listings.*, AVG(reviews.rating) as avg_rating, COUNT(reviews.id) as review_count
-- FROM listings
-- LEFT JOIN reviews ON listings.id = reviews.listing_id
-- GROUP BY listings.id;

-- TODO: Query to search listings by location
-- SELECT * FROM listings
-- WHERE city LIKE ? OR address LIKE ?;

-- TODO: Query to get listings with amenities
-- SELECT listings.*, GROUP_CONCAT(amenities.name) as amenity_list
-- FROM listings
-- LEFT JOIN listing_amenities ON listings.id = listing_amenities.listing_id
-- LEFT JOIN amenities ON listing_amenities.amenity_id = amenities.id
-- GROUP BY listings.id;


-- ============================================
-- 12. INDEXES (For Performance)
-- ============================================
-- TODO: Create indexes on frequently queried columns

-- CREATE INDEX idx_listings_city ON listings(city);
-- CREATE INDEX idx_listings_host_id ON listings(host_id);
-- CREATE INDEX idx_listings_price ON listings(price_per_night);
-- CREATE INDEX idx_bookings_listing_id ON bookings(listing_id);
-- CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
-- CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
-- CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);


-- ============================================
-- 13. STORED PROCEDURES (Optional)
-- ============================================
-- TODO: Create stored procedure to check listing availability
-- DELIMITER //
-- CREATE PROCEDURE CheckAvailability(IN listing_id INT, IN check_in DATE, IN check_out DATE)
-- BEGIN
--     -- TODO: Check if listing is available for given dates
-- END //
-- DELIMITER ;

-- TODO: Create stored procedure to calculate booking total
-- DELIMITER //
-- CREATE PROCEDURE CalculateBookingTotal(IN listing_id INT, IN check_in DATE, IN check_out DATE, IN guests INT)
-- BEGIN
--     -- TODO: Calculate total price including nights, cleaning fee, etc.
-- END //
-- DELIMITER ;


-- ============================================
-- 14. TRIGGERS (Optional)
-- ============================================
-- TODO: Create trigger to update updated_at timestamp
-- CREATE TRIGGER update_listings_timestamp
-- BEFORE UPDATE ON listings
-- FOR EACH ROW
-- SET NEW.updated_at = CURRENT_TIMESTAMP;

-- TODO: Create trigger to validate booking dates
-- CREATE TRIGGER validate_booking_dates
-- BEFORE INSERT ON bookings
-- FOR EACH ROW
-- BEGIN
--     -- TODO: Check that check_out > check_in
-- END;

