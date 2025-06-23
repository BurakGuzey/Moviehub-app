import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';

import { Movie } from '@/types';
import MovieCard from '@/components/MovieCard';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function FavoriteScreen() {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const navigation = useNavigation<any>();
  const backgroundColor = useThemeColor({}, 'background');

  const loadFavorites = async () => {
    const data = await AsyncStorage.getItem('favorites');
    if (data) {
      const favList = JSON.parse(data);
      setFavorites(favList);
    } else {
      setFavorites([]);
    }
  };

  const removeFavorite = async (movieId: number) => {
    const updated = favorites.filter((m) => m.id !== movieId);
    setFavorites(updated);
    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
  };

  const confirmRemove = (movie: Movie) => {
    Alert.alert(
      'Remove Favorite',
      `Are you sure you want to remove "${movie.title}" from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFavorite(movie.id) },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const renderRightActions = (movie: Movie) => (
    <RectButton
      style={styles.deleteButton}
      onPress={() => confirmRemove(movie)}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </RectButton>
  );

  const renderItem = ({ item }: { item: Movie }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <MovieCard
        movie={item}
        onPress={() => navigation.navigate('Details', { imdbID: item.id })}
        // ✅ No isFavorite or toggleFavorite props here
      />
    </Swipeable>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {favorites.length === 0 ? (
        <Text style={styles.empty}>No favorites yet</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: 'gray',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
