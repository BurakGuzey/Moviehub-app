import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Movie } from '@/types';
import MovieCard from '@/components/MovieCard';
import { useNavigation } from '@react-navigation/native';
import { TMDB_API_KEY, TMDB_BASE_URL } from '@/constants/api';

export default function SearchScreen() {
  console.log('📺 HomeScreen mounted');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const isDark = backgroundColor === '#000';

  const navigation = useNavigation<any>();

  const isFavorite = (id: number): boolean => {
    return false; // Update with real favorite logic if needed
  };

  useEffect(() => {
    console.log('🔍 Query changed:', query);
    const fetchMovies = async () => {
      if (query.length < 2) return;

      setLoading(true);
      setError(null);

      try {
        const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`;
        console.log('🌐 TMDB URL:', url);
        const response = await fetch(url);
        const json = await response.json();

        if (json.results) {
          setResults(json.results);
          console.log('✅ TMDB results:', json.results.length);
        } else {
          setResults([]);
          console.warn('⚠️ TMDB returned no results');
          setError('No movies found');
        }
      } catch (e) {
        console.error('❌ TMDB fetch error:', e);
        setError('Failed to fetch movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [query]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <TextInput
        style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#555' : '#ccc' }]}
        placeholder="Search movies..."
        placeholderTextColor={isDark ? '#aaa' : '#888'}
        value={query}
        onChangeText={setQuery}
      />
      {loading && <ActivityIndicator size="large" color="#999" />}
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MovieCard
            movie={item}
            onPress={() => navigation.navigate('Details', { imdbID: item.id })}
            isFavorite={isFavorite(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
