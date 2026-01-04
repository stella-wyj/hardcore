// ============================================
// AIRBNB APP - JAVASCRIPT OUTLINE
// ============================================

// ============================================
// 1. SAMPLE DATA
// ============================================
// TODO: Create an array of listing objects
// Each listing should have properties like:
// - id
// - title
// - location
// - price
// - image (URL)
// - rating
// - type (e.g., "Entire place", "Private room")
// - description (optional)

const listings = [
    // TODO: Add sample listing objects here
    // Example structure:
    // {
    //     id: 1,
    //     title: "Cozy beachfront apartment",
    //     location: "Malibu, California",
    //     price: 150,
    //     image: "https://...",
    //     rating: 4.8,
    //     type: "Entire place"
    // }
];


// ============================================
// 2. DOM ELEMENT REFERENCES
// ============================================
// TODO: Get references to important DOM elements
// Examples:
// - listings grid container
// - search inputs
// - filter buttons
// - etc.

const listingsGrid = document.getElementById('listings-grid');
// TODO: Add more DOM references here


// ============================================
// 3. INITIALIZATION
// ============================================
// TODO: Function to initialize the app
// - Render initial listings
// - Set up event listeners
// - Initialize any libraries (date pickers, etc.)

function init() {
    // TODO: Call renderListings with all listings
    // TODO: Set up event listeners
}

// Call init when DOM is loaded
// TODO: Add DOMContentLoaded event listener


// ============================================
// 4. RENDER LISTINGS
// ============================================
// TODO: Function to render listings to the page
// Parameters: listings array
// Should create HTML elements for each listing and append to grid

function renderListings(listingsToRender) {
    // TODO: Clear existing listings from grid
    // TODO: Loop through listingsToRender array
    // TODO: Create listing card element for each listing
    // TODO: Append each card to listingsGrid
}

// Helper function to create a single listing card
function createListingCard(listing) {
    // TODO: Create and return a DOM element for a listing card
    // Should include:
    // - Image
    // - Title
    // - Location
    // - Price
    // - Rating
    // - Type
}


// ============================================
// 5. SEARCH FUNCTIONALITY
// ============================================
// TODO: Function to handle search
// Should filter listings based on search criteria

function handleSearch() {
    // TODO: Get search input values
    // TODO: Filter listings based on criteria
    // TODO: Call renderListings with filtered results
}

// TODO: Function to filter listings by location
function filterByLocation(listings, location) {
    // TODO: Return filtered listings array
}

// TODO: Function to filter listings by date availability
function filterByDate(listings, checkIn, checkOut) {
    // TODO: Return filtered listings array
}

// TODO: Function to filter listings by guest count
function filterByGuests(listings, guestCount) {
    // TODO: Return filtered listings array
}


// ============================================
// 6. EVENT LISTENERS
// ============================================
// TODO: Set up event listeners for:
// - Search button/form submission
// - Date picker changes
// - Guest count changes
// - Category filter buttons
// - Any other interactive elements

// TODO: Add event listener for search button
// TODO: Add event listeners for date inputs
// TODO: Add event listener for guest input


// ============================================
// 7. UTILITY FUNCTIONS
// ============================================
// TODO: Helper functions that might be useful

// Function to format price display
function formatPrice(price) {
    // TODO: Format price (e.g., add $, format decimals)
}

// Function to format rating display
function formatRating(rating) {
    // TODO: Format rating (e.g., show stars, round to 1 decimal)
}

// Function to handle errors
function handleError(error) {
    // TODO: Display error messages to user
}


// ============================================
// 8. ADDITIONAL FEATURES (Optional)
// ============================================

// TODO: Feature to save favorites
function toggleFavorite(listingId) {
    // TODO: Add/remove listing from favorites
}

// TODO: Feature to sort listings
function sortListings(sortBy) {
    // TODO: Sort by price, rating, etc.
}

// TODO: Feature to show listing details modal
function showListingDetails(listingId) {
    // TODO: Display detailed view of a listing
}

