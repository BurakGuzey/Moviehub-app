import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { fetchCastDetails, fetchCastMovies } from '../constants/api';

export default function CastDetailScreen() {
  const route = useRoute();
  const { personId } = route.params as { personId: number };

  const [cast, setCast] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const details = await fetchCastDetails(personId);
        const credits = await fetchCastMovies(personId);
        setCast(details);
        setMovies(credits);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [personId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (!cast) return <Text style={{ textAlign: 'center', marginTop: 50 }}>No cast info available.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        style={styles.image}
        source={{ uri: `https://image.tmdb.org/t/p/w500${cast.profile_path}` }}
        resizeMode="cover"
      />
      <Text style={styles.name}>{cast.name}</Text>
      <Text style={styles.detail}>Birthday: {cast.birthday || 'N/A'}</Text>

      <Text style={styles.section}>Biography</Text>
      <Text style={styles.biography}>{cast.biography || 'No biography available.'}</Text>

      <Text style={styles.section}>Known For</Text>
      <FlatList
        data={movies}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.movieCard}>
            <Image
              style={styles.moviePoster}
              source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }}
            />
            <Text numberOfLines={1} style={styles.movieTitle}>{item.title}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  image: { width: '100%', height: 400, borderRadius: 12 },
  name: { fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  detail: { fontSize: 14, color: '#888', marginBottom: 8 },
  biography: { fontSize: 16, lineHeight: 22, marginTop: 8 },
  section: { fontSize: 20, fontWeight: '600', marginTop: 24, marginBottom: 12 },
  movieCard: { marginRight: 12, width: 120 },
  moviePoster: { width: 120, height: 180, borderRadius: 8 },
  movieTitle: { fontSize: 14, marginTop: 4 },
});
