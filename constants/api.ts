export const TMDB_API_KEY = '16e807f61c3e7c6382feff585c3859ad';

export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export async function fetchCastDetails(personId: number) {
  const res = await fetch(`https://api.themoviedb.org/3/person/${personId}?api_key=${TMDB_API_KEY}&language=en-US`);
  return await res.json();
}

export async function fetchCastMovies(personId: number) {
  const res = await fetch(`https://api.themoviedb.org/3/person/${personId}/movie_credits?api_key=${TMDB_API_KEY}&language=en-US`);
  const data = await res.json();
  return data.cast;
}
