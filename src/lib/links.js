// Base-path-aware link to the live player — '/' in dev,
// '/quiz-builder/' on GitHub Pages.
export const liveUrl = (search = '') => import.meta.env.BASE_URL + search
