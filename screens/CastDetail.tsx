import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { fetchCastDetails, fetchCastMovies } from '../constants/api';

export default function CastDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
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

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  if (!cast) return <Text style={{ textAlign: 'center', marginTop: 50 }}>No cast info available.</Text>;

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {cast.profile_path && (
        <Image
          style={styles.image}
          source={{ uri: `https://image.tmdb.org/t/p/w500${cast.profile_path}` }}
          resizeMode="cover"
        />
      )}
      <Text style={styles.name}>{cast.name}</Text>
      {cast.known_for_department && (
        <Text style={styles.detail}>Department: {cast.known_for_department}</Text>
      )}
      {cast.place_of_birth && (
        <Text style={styles.detail}>Place of Birth: {cast.place_of_birth}</Text>
      )}
      {cast.birthday && <Text style={styles.detail}>Birthday: {cast.birthday}</Text>}

      <SectionCard title="Biography">
        <Text style={styles.biography}>{cast.biography || 'No biography available.'}</Text>
      </SectionCard>

      <SectionCard title="Known For">
        <FlatList
          data={movies}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('Details', { imdbID: item.id })}>
              <View style={styles.movieCard}>
                <Image
                  style={styles.moviePoster}
                  source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }}
                />
                <Text numberOfLines={1} style={styles.movieTitle}>{item.title}</Text>
              </View>
            </Pressable>
          )}
        />
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  image: { width: '100%', height: 400, borderRadius: 16, marginBottom: 16 },
  name: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  detail: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 4 },
  biography: { fontSize: 16, lineHeight: 22 },
  sectionCard: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  movieCard: { marginRight: 12, width: 120 },
  moviePoster: { width: 120, height: 180, borderRadius: 8 },
  movieTitle: { fontSize: 14, marginTop: 4 },
});
