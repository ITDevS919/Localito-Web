// Public assets are served at the root path
const logoImage = "/logo.png";
const darklogoImage = "/logo-dark.png";

export interface Product {
  id: string;
  name: string;
  price: number;
  business: string; // Business name 
  image: string;
  category: string;
  rating: number; 
  reviews: number;
  pickupTime: string;
  isNew?: boolean;
  discount?: number;
  // Location information from business
  businessPostcode?: string; // Formerly retailerPostcode
  businessCity?: string; // Formerly retailerCity
  // Additional fields for business view
  isApproved?: boolean;
  stock?: number;
  description?: string;
  syncFromEpos?: boolean;
  squareItemId?: string | null;
  shopifyProductId?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

// Note: Categories should be fetched from the API endpoint /api/categories
// This is kept as a fallback for offline/initial load scenarios
// The API returns categories from the database with the comprehensive list
export const CATEGORIES: Category[] = [
  { id: "1", name: "Food & Drink", slug: "food-drink" },
  { id: "2", name: "Health & Beauty", slug: "health-beauty" },
  { id: "3", name: "Fashion & Accessories", slug: "fashion-accessories" },
  { id: "4", name: "Home & Living", slug: "home-living" },
  { id: "5", name: "Electronics & Tech", slug: "electronics-tech" },
  { id: "6", name: "Books, Music & Hobbies", slug: "books-music-hobbies" },
  { id: "7", name: "Kids & Family", slug: "kids-family" },
  { id: "8", name: "Sports & Outdoors", slug: "sports-outdoors" },
  { id: "9", name: "Gifts, Flowers & Stationery", slug: "gifts-flowers-stationery" },
  { id: "10", name: "Pets", slug: "pets" },
  { id: "11", name: "Services", slug: "services" },
  { id: "12", name: "Other", slug: "other" },
];

export const ASSETS = {
  logo: logoImage,
  darklogo: darklogoImage
};
