import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  useColorScheme,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../localization/i18n';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '@/constants/api';

export default function MovieDetail() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { imdbID } = route.params as { imdbID: number };

  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const movieRes = await fetch(`${TMDB_BASE_URL}/movie/${imdbID}?api_key=${TMDB_API_KEY}&language=en-US`);
        const movieData = await movieRes.json();

        if (movieData.success === false) {
          throw new Error(movieData.status_message || 'Movie not found');
        }

        setMovie(movieData);

        const castRes = await fetch(`${TMDB_BASE_URL}/movie/${imdbID}/credits?api_key=${TMDB_API_KEY}`);
        const castData = await castRes.json();
        setCast(castData.cast?.slice(0, 10) || []);

        checkFavorite(movieData);
      } catch (err: any) {
        console.error('Error fetching movie details:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [imdbID]);

  const checkFavorite = async (movie: any) => {
    const data = await AsyncStorage.getItem('favorites');
    if (data) {
      const favs = JSON.parse(data);
      setIsFav(favs.some((f: any) => f.id === movie.id));
    }
  };

  const toggleFavorite = async () => {
    const data = await AsyncStorage.getItem('favorites');
    let favs = data ? JSON.parse(data) : [];

    if (isFav) {
      favs = favs.filter((f: any) => f.id !== movie.id);
    } else {
      favs.push(movie);
    }

    await AsyncStorage.setItem('favorites', JSON.stringify(favs));
    setIsFav(!isFav);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  if (error) return <Text style={{ color: 'red', textAlign: 'center', marginTop: 50 }}>{error}</Text>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {movie?.poster_path && (
        <Image
          source={{ uri: `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` }}
          style={styles.poster}
          resizeMode="contain"
        />
      )}

      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>{movie.title}</Text>

      {movie.tagline ? (
        <Text style={[styles.tagline, { color: isDark ? '#aaa' : '#555' }]}>"{movie.tagline}"</Text>
      ) : null}

      <Text style={[styles.section, { color: isDark ? '#fff' : '#000' }]}>Overview</Text>
      <Text style={[styles.text, { color: isDark ? '#ddd' : '#333' }]}>{movie.overview}</Text>

      <Text style={[styles.section, { color: isDark ? '#fff' : '#000' }]}>Genres</Text>
      <Text style={[styles.text, { color: isDark ? '#ddd' : '#333' }]}>
        {movie.genres.map((g: any) => g.name).join(', ')}
      </Text>

      <Text style={[styles.section, { color: isDark ? '#fff' : '#000' }]}>Release Date</Text>
      <Text style={[styles.text, { color: isDark ? '#ddd' : '#333' }]}>{movie.release_date}</Text>

      <Text style={[styles.section, { color: isDark ? '#fff' : '#000' }]}>Runtime</Text>
      <Text style={[styles.text, { color: isDark ? '#ddd' : '#333' }]}>{movie.runtime} min</Text>

      {movie.homepage && (
        <Text
          style={[styles.link, { color: isDark ? '#4eaaff' : '#0066cc' }]}
          onPress={() => Linking.openURL(movie.homepage)}
        >
          Visit Homepage
        </Text>
      )}

      {cast.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.section, { color: isDark ? '#fff' : '#000' }]}>Top Cast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {cast.map((member) => (
              <Pressable
                key={member.id}
                onPress={() => navigation.navigate('CastDetail', { personId: member.id })}
                style={{ marginRight: 12, alignItems: 'center' }}
              >
                {member.profile_path ? (
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w185${member.profile_path}` }}
                    style={{ width: 80, height: 100, borderRadius: 8 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 80,
                      height: 100,
                      backgroundColor: '#ccc',
                      borderRadius: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#555', fontSize: 12, textAlign: 'center' }}>No Image</Text>
                  </View>
                )}
                <Text numberOfLines={1} style={{ width: 80, marginTop: 6, color: isDark ? '#fff' : '#000', fontSize: 12 }}>
                  {member.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  poster: {
    width: '100%',
    height: 400,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  tagline: {
    fontStyle: 'italic',
    fontSize: 14,
    marginBottom: 8,
  },
  section: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  link: {
    marginTop: 8,
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});
