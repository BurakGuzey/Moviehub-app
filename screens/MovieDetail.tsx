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
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import i18n from '../localization/i18n';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '@/constants/api';

export default function MovieDetail() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { imdbID } = route.params as { imdbID: number };

  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
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

        const reviewsRes = await fetch(`${TMDB_BASE_URL}/movie/${imdbID}/reviews?api_key=${TMDB_API_KEY}`);
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.results?.slice(0, 5) || []);

        const recRes = await fetch(`${TMDB_BASE_URL}/movie/${imdbID}/recommendations?api_key=${TMDB_API_KEY}`);
        const recData = await recRes.json();
        setRecommendations(recData.results?.slice(0, 5) || []);

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

  const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={{
      backgroundColor: isDark ? '#111' : '#f2f2f2',
      padding: 12,
      borderRadius: 12,
      marginTop: 16
    }}>
      <Text style={[styles.section, { color: isDark ? '#fff' : '#000', marginBottom: 6 }]}>{title}</Text>
      {children}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {movie?.poster_path && (
        <View style={styles.posterWrapper}>
          <Image source={{ uri: `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` }} style={styles.poster} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradientOverlay}
          />
          <Text style={styles.posterTitle}>{movie.title}</Text>
        </View>
      )}

      {movie.tagline ? <Text style={[styles.tagline, { color: isDark ? '#aaa' : '#555' }]}>{movie.tagline}</Text> : null}

      <SectionCard title="Overview">
        <Text style={[styles.text, { color: isDark ? '#ddd' : '#333' }]}>{movie.overview}</Text>
      </SectionCard>

      <SectionCard title="Genres">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {movie.genres.map((g: any) => (
            <View key={g.id} style={{ backgroundColor: isDark ? '#333' : '#e0e0e0', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, marginBottom: 8 }}>
              <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 13 }}>{g.name}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Rating">
        <Text style={{ fontSize: 16, color: isDark ? '#fff' : '#000' }}>⭐ {movie.vote_average.toFixed(1)} / 10</Text>
      </SectionCard>

      <SectionCard title="Release Date">
        <Text style={[styles.text, { color: isDark ? '#ddd' : '#333' }]}>{movie.release_date}</Text>
      </SectionCard>

      <SectionCard title="Runtime">
        <Text style={[styles.text, { color: isDark ? '#ddd' : '#333' }]}>{movie.runtime} min</Text>
      </SectionCard>

      {movie.homepage && (
        <SectionCard title="Homepage">
          <Text
            style={[styles.link, { color: isDark ? '#4eaaff' : '#0066cc' }]} onPress={() => Linking.openURL(movie.homepage)}>
            Visit Homepage
          </Text>
        </SectionCard>
      )}

      <TouchableOpacity
        onPress={toggleFavorite}
        style={{ alignSelf: 'center', marginTop: 24, backgroundColor: isDark ? '#444' : '#ccc', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 30 }}>
        <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 16 }}>{isFav ? '❤️ Remove Favorite' : '🤍 Add to Favorites'}</Text>
      </TouchableOpacity>

      {cast.length > 0 && (
        <SectionCard title="Top Cast">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {cast.map((member) => (
              <Pressable
                key={member.id}
                onPress={() => navigation.navigate('CastDetail', { personId: member.id })}
                style={{ marginRight: 12, alignItems: 'center' }}>
                {member.profile_path ? (
                  <Image source={{ uri: `https://image.tmdb.org/t/p/w185${member.profile_path}` }} style={{ width: 80, height: 100, borderRadius: 8 }} />
                ) : (
                  <View style={{ width: 80, height: 100, backgroundColor: '#ccc', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#555', fontSize: 12, textAlign: 'center' }}>No Image</Text>
                  </View>
                )}
                <Text numberOfLines={1} style={{ width: 80, marginTop: 6, color: isDark ? '#fff' : '#000', fontSize: 12 }}>{member.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </SectionCard>
      )}

      {reviews.length > 0 && (
        <SectionCard title="Reviews">
          <TouchableOpacity onPress={() => setShowReviews(!showReviews)}>
            <Text style={{ color: isDark ? '#ccc' : '#333', marginBottom: 6 }}>{showReviews ? 'Hide reviews ▲' : 'Show reviews ▼'}</Text>
          </TouchableOpacity>
          {showReviews && reviews.map((review) => (
            <View key={review.id} style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>{review.author}</Text>
              <Text numberOfLines={6} style={{ color: isDark ? '#aaa' : '#333', fontSize: 14 }}>{review.content}</Text>
            </View>
          ))}
        </SectionCard>
      )}

      {recommendations.length > 0 && (
        <SectionCard title="You May Also Like">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {recommendations.map((rec) => (
              <Pressable key={rec.id} onPress={() => navigation.push('Details', { imdbID: rec.id })} style={{ marginRight: 12 }}>
                <Image source={{ uri: `${TMDB_IMAGE_BASE_URL}${rec.poster_path}` }} style={{ width: 100, height: 150, borderRadius: 8 }} />
                <Text numberOfLines={2} style={{ width: 100, marginTop: 6, fontSize: 12, color: isDark ? '#fff' : '#000' }}>{rec.title}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </SectionCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  posterWrapper: {
    position: 'relative',
    width: '100%',
    height: 400,
    marginBottom: 16,
  },
  poster: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  posterTitle: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
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
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  link: {
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});
