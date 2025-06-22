import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import Slider from '@react-native-community/slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
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
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [sortKey, setSortKey] = useState('popularity.desc');
  const [ratingRange, setRatingRange] = useState([0, 10]);
  const [yearRange, setYearRange] = useState([2000, new Date().getFullYear()]);

  const backgroundColor = useThemeColor({}, 'background');
  const navigation = useNavigation<any>();
  const listRef = useRef<FlatList>(null);

  const fetchMovies = async (nextPage = 1, overrideSortKey: string | null = null) => {
    if (nextPage > totalPages) return;

    try {
      if (nextPage === 1) setLoading(true);
      else setIsFetchingMore(true);

      const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&page=${nextPage}` +
        `&sort_by=${overrideSortKey || sortKey}` +
        `&vote_average.gte=${ratingRange[0].toFixed(1)}&vote_average.lte=${ratingRange[1].toFixed(1)}` +
        `&primary_release_date.gte=${yearRange[0]}-01-01&primary_release_date.lte=${yearRange[1]}-12-31`;

      const response = await fetch(url);
      const json = await response.json();

      if (json.results) {
        const newItems = json.results
          .filter((m: Movie) => m.poster_path)
          .filter((m: Movie) => m.overview && m.genre_ids?.length && m.vote_average && m.release_date)
          .filter((m: Movie) => !movies.some((prev) => prev.id === m.id));

        const updated = nextPage === 1 ? newItems : [...movies, ...newItems];
        setMovies(updated);
        setTotalPages(json.total_pages);
        setPage(nextPage);
      } else {
        setError('No movies found');
      }
    } catch (e) {
      console.error('❌ Failed to fetch movies:', e);
      setError('Failed to load movies');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const applySort = (key: string) => {
    setSortKey(key);
    setMovies([]);
    setPage(1);
    setShowSort(false);
    fetchMovies(1, key);
  };

  const applyFilter = () => {
    setMovies([]);
    setPage(1);
    setShowFilter(false);
    fetchMovies(1);
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
      <View style={styles.controlRow}>
        <TouchableOpacity onPress={() => setShowSort(true)} style={styles.chip}>
          <Text style={styles.chipText}>Sort ⬇</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowFilter(true)} style={styles.chip}>
          <Text style={styles.chipText}>Filter 🎛</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 100 }} size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          ref={listRef}
          data={movies.filter((m) => m.poster_path)}
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

      <Modal visible={showSort} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowSort(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Sort by</Text>
            <TouchableOpacity onPress={() => applySort('popularity.desc')}><Text>🔥 Popularity</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => applySort('vote_average.desc')}><Text>⭐ Rating (high to low)</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => applySort('vote_average.asc')}><Text>⭐ Rating (low to high)</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => applySort('release_date.desc')}><Text>📅 Newest</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => applySort('original_title.asc')}><Text>🔤 Title A-Z</Text></TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showFilter} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowFilter(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Rating: {ratingRange[0].toFixed(1)} - {ratingRange[1].toFixed(1)}</Text>
            <MultiSlider
              values={ratingRange}
              min={0}
              max={10}
              step={0.1}
              onValuesChange={setRatingRange}
              allowOverlap={false}
              snapped
            />

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Year: {yearRange[0]} - {yearRange[1]}</Text>
            <MultiSlider
              values={yearRange}
              min={1950}
              max={new Date().getFullYear()}
              step={1}
              onValuesChange={setYearRange}
              allowOverlap={false}
              snapped
            />

            <TouchableOpacity onPress={applyFilter} style={{ marginTop: 16 }}>
              <Text style={{ fontWeight: 'bold' }}>✅ Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controlRow: { flexDirection: 'row', gap: 12, marginTop: 8, marginLeft: 16 },
  chip: { backgroundColor: '#ddd', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 },
  chipText: { fontSize: 14 },
  error: { color: 'red', textAlign: 'center', marginTop: 100, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12, minWidth: 280, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
});
