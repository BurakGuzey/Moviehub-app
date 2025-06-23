import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Movie } from '@/types';
import MovieCard from '@/components/MovieCard';
import { useNavigation } from '@react-navigation/native';
import { TMDB_API_KEY, TMDB_BASE_URL } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth / numColumns - 20;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'movie' | 'person'>('movie');

  const backgroundColor = useThemeColor({}, 'background');
  const isDark = backgroundColor === '#000';

  const navigation = useNavigation<any>();

  const fetchSearchResults = async () => {
    if (query.length < 2) return;

    setLoading(true);
    setError(null);

    try {
      if (searchType === 'movie') {
        const movieRes = await fetch(
          `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
        );
        const movieJson = await movieRes.json();
        const filtered = (movieJson.results || []).filter((m: any) => m.poster_path);
        setResults(filtered);
        setPeople([]);
      } else {
        let allPeople: any[] = [];
        for (let page = 1; page <= 6; page++) {
          const res = await fetch(
            `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${page}`
          );
          const json = await res.json();
          const filtered = (json.results || []).filter((p: any) => p.profile_path);
          allPeople = allPeople.concat(filtered);
          if (allPeople.length >= 20) break;
        }
        setPeople(allPeople);
        setResults([]);
      }
    } catch (e) {
      console.error('❌ TMDB fetch error:', e);
      setError('Failed to fetch search results');
    } finally {
      setLoading(false);
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
    loadFavorites();
  }, []);

  useEffect(() => {
    fetchSearchResults();
  }, [query, searchType]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, searchType === 'movie' && styles.activeToggle]}
          onPress={() => setSearchType('movie')}
        >
          <Text style={{ color: searchType === 'movie' ? '#fff' : '#000' }}>Movies</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, searchType === 'person' && styles.activeToggle]}
          onPress={() => setSearchType('person')}
        >
          <Text style={{ color: searchType === 'person' ? '#fff' : '#000' }}>Cast</Text>
        </TouchableOpacity>
      </View>

      <View style={{ position: 'relative' }}>
        <TextInput
          style={[
            styles.input,
            {
              color: isDark ? '#fff' : '#000',
              backgroundColor: isDark ? '#1a1a1a' : '#fff',
              borderColor: isDark ? '#555' : '#ccc',
              paddingRight: 30,
            },
          ]}
          placeholder={`Search ${searchType === 'movie' ? 'movies' : 'cast'}...`}
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery('');
              setResults([]);
              setPeople([]);
            }}
            style={styles.clearButton}
          >
            <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 16 }}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && <ActivityIndicator size="large" color="#999" />}
      {error && <Text style={styles.error}>{error}</Text>}

      {searchType === 'person' ? (
        <FlatList
          key={searchType}
          data={people}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          renderItem={({ item }) => (
  <Pressable
    onPress={() => navigation.navigate('CastDetail', { personId: item.id })}
    style={{
      backgroundColor: isDark ? '#fff' : '#f0f0f0',
      borderRadius: 10,
      padding: 8,
      marginBottom: 16,
      marginHorizontal: 6, // ✅ horizontal spacing between cards
      alignItems: 'center',
      width: cardWidth - 12, // ✅ compensate for margin to prevent overflow
      alignSelf: 'center',
    }}
  >
    {item.profile_path ? (
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w185${item.profile_path}` }}
        style={{ width: cardWidth * 0.9, height: 160, borderRadius: 8 }}
        resizeMode="contain"
      />
    ) : (
      <View
        style={{
          width: cardWidth * 0.9,
          height: 120,
          backgroundColor: '#ccc',
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#555', fontSize: 12, textAlign: 'center' }}>No Image</Text>
      </View>
    )}
    <Text
      numberOfLines={1}
      style={{
        width: cardWidth,
        marginTop: 6,
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        color: '#000',
      }}
    >
      {item.name}
    </Text>
  </Pressable>
)}

        />
      ) : (
        <FlatList
          key={searchType}
          data={results}
          keyExtractor={(item) => item.id.toString()}
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
    padding: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 8,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#ccc',
    borderRadius: 20,
  },
  activeToggle: {
    backgroundColor: '#333',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
