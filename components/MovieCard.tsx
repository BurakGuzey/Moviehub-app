import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Movie } from '@/types';
import { TMDB_IMAGE_BASE_URL } from '@/constants/api';

type Props = {
  movie: Movie;
  onPress: () => void;
  isFavorite: boolean;
};

const MovieCard: React.FC<Props> = ({ movie, onPress, isFavorite }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {movie.poster_path ? (
        <Image
          source={{ uri: `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{movie.title}</Text>
        <Text style={styles.rating}>⭐ {movie.vote_average?.toFixed(1) ?? 'N/A'}</Text>
        <Text style={styles.release}>{movie.release_date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#1c1c1c',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 150,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
  },
  placeholderText: {
    color: '#ccc',
    fontSize: 12,
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rating: {
    color: '#ffcc00',
    marginBottom: 4,
  },
  release: {
    color: '#aaa',
  },
});

export default MovieCard;
