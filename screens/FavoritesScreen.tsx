import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, Animated, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MovieCard from '@/components/MovieCard';
import { Movie } from '@/types';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Swipeable } from 'react-native-gesture-handler';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const backgroundColor = useThemeColor({}, 'background');
  const navigation = useNavigation<any>();

  const loadFavorites = async () => {
    const data = await AsyncStorage.getItem('favorites');
    if (data) {
      setFavorites(JSON.parse(data));
    } else {
      setFavorites([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const removeFavorite = async (id: number) => {
    const updated = favorites.filter((movie) => movie.id !== id);
    setFavorites(updated);
    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
  };

  const toggleFavorite = async (movie: Movie) => {
  const exists = favorites.some((m) => m.id === movie.id);
  let updatedFavorites;

  if (exists) {
    updatedFavorites = favorites.filter((m) => m.id !== movie.id);
  } else {
    updatedFavorites = [...favorites, movie];
  }

  setFavorites(updatedFavorites);
  await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
};


  const renderRightActions = (id: number) => (
    <Pressable onPress={() => removeFavorite(id)} style={styles.deleteButton}>
      <Text style={styles.deleteText}>Delete</Text>
    </Pressable>
  );

  const isFavorite = (id: number): boolean => {
    return favorites.some((f) => f.id === id);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {favorites.length === 0 ? (
        <Text style={styles.empty}>No favorites yet. Add some!</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item.id)}>
              <MovieCard
                movie={item}
                onPress={() => navigation.navigate('Details', { imdbID: item.id })}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={() => toggleFavorite(item)}
              />
            </Swipeable>
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
  empty: {
    marginTop: 50,
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginVertical: 6,
    borderRadius: 10,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
