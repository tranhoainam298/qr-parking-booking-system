/**
 * Search Routes — Controller / Route Layer
 * Handles: Search parking sites, filter by area/postal/distance, GPS-based search
 */

// GET /api/search/sites
// GET /api/search/sites/nearby?lat=&lng=&radius=
// GET /api/search/sites/filter?area=&postalCode=&available=

export const searchRoutes = {
  searchSites: '/api/search/sites',
  nearbySites: '/api/search/sites/nearby',
  filterSites: '/api/search/sites/filter',
}
