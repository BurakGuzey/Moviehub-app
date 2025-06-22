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
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
        {movie.title} ({movie.release_date?.substring(0, 4)})
      </Text>
      <Text style={[styles.text, { color: isDark ? '#aaa' : '#333' }]}>{i18n.t('genre')}: {movie.genres?.map((g: any) => g.name).join(', ')}</Text>
      <Text style={[styles.text, { color: isDark ? '#aaa' : '#333' }]}>{i18n.t('director')}: —</Text>
      <Text style={[styles.text, { color: isDark ? '#aaa' : '#333' }]}>{i18n.t('actors')}: —</Text>
      <Text style={[styles.plot, { color: isDark ? '#ccc' : '#000' }]}>{movie.overview}</Text>

      <Pressable onPress={toggleFavorite} style={styles.favButton}>
        <Text style={styles.favText}>
          {isFav ? i18n.t('removeFromFavorites') : i18n.t('addToFavorites')}
        </Text>
      </Pressable>

      {cast.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Cast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castList}>
            {cast.map((actor) => (
              <View key={actor.id} style={styles.castItem}>
                <Image
                  source={{
                    uri: actor.profile_path
                      ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}`
                      : 'https://via.placeholder.com/100x150?text=No+Image',
                  }}
                  style={styles.castImage}
                />
                <Text style={[styles.castName, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
                  {actor.name}
                </Text>
                <Text style={[styles.castCharacter, { color: isDark ? '#aaa' : '#666' }]} numberOfLines={1}>
                  as {actor.character}
                </Text>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  poster: { width: '100%', height: 400, borderRadius: 10, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  text: { fontSize: 16, marginBottom: 6 },
  plot: { marginTop: 12, fontSize: 15, lineHeight: 22 },
  favButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
  },
  favText: { color: 'white', fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  castList: { flexDirection: 'row', marginBottom: 20 },
  castItem: { marginRight: 12, alignItems: 'center', width: 80 },
  castImage: { width: 80, height: 120, borderRadius: 6, marginBottom: 4, backgroundColor: '#ccc' },
  castName: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  castCharacter: { fontSize: 11, textAlign: 'center' },
});
