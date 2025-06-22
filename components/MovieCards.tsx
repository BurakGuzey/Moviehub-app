import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function MovieCard({ movie }: { movie: any }) {
  console.log("🎬 Rendering MovieCard:", movie?.title); // Log title

  if (!movie) {
    console.warn("🚨 MovieCard received undefined movie prop");
    return null;
  }

  return (
    <View style={styles.card}>
      <Image source={{ uri: movie.poster }} style={styles.image} />
      <Text style={styles.title}>{movie.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#333',
    overflow: 'hidden',
  },
  image: {
    height: 200,
    width: '100%',
  },
  title: {
    color: 'white',
    padding: 8,
  },
});
