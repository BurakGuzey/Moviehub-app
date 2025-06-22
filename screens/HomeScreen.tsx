import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Movie } from '@/types';
import MovieCard from '@/components/MovieCard';
import { TMDB_API_KEY, TMDB_BASE_URL } from '@/constants/api';

export default function HomeScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const backgroundColor = useThemeColor({}, 'background');
  const navigation = useNavigation<any>();

  const listRef = useRef<FlatList>(null);

  const fetchMovies = async (nextPage = 1) => {
    if (nextPage > totalPages) return;

    try {
      if (nextPage === 1) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${nextPage}`;
      const response = await fetch(url);
      const json = await response.json();

      if (json.results) {
        setMovies((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newItems = json.results.filter((m: Movie) => !existingIds.has(m.id));
          return nextPage === 1 ? json.results : [...prev, ...newItems];
        });
        setTotalPages(json.total_pages);
        setPage(nextPage);
      } else {
        setError('No popular movies found');
      }
    } catch (e) {
      console.error('❌ Failed to fetch popular movies:', e);
      setError('Failed to load popular movies');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const loadFavorites = async () => {
    const data = await AsyncStorage.getItem('favorites');
    if (data) {
      const favList = JSON.parse(data);
      setFavorites(favList.map((m: Movie) => m.id));
    }
  };

  const toggleFavorite = async (movie: Movie) => {
    let updatedFavorites;
    const stored = await AsyncStorage.getItem('favorites');
    let favList = stored ? JSON.parse(stored) : [];

    if (favorites.includes(movie.id)) {
      favList = favList.filter((m: Movie) => m.id !== movie.id);
      updatedFavorites = favorites.filter((id) => id !== movie.id);
    } else {
      favList.push(movie);
      updatedFavorites = [...favorites, movie.id];
    }

    await AsyncStorage.setItem('favorites', JSON.stringify(favList));
    setFavorites(updatedFavorites);
  };

  useEffect(() => {
    fetchMovies();
    loadFavorites();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 100 }} size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          ref={listRef}
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          onEndReached={() => fetchMovies(page + 1)}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
              onPress={() => navigation.navigate('Details', { imdbID: item.id })}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={() => toggleFavorite(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
});
