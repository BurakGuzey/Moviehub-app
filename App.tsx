import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import i18n from './localization/i18n';

import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import MovieDetail from './screens/MovieDetail';
import FavoritesScreen from './screens/FavoritesScreen';

export type RootStackParamList = {
  Movies: undefined;
  Details: { imdbID: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Translation shortcut
const t = (key: string) => i18n.t(key);

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('home') }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: t('search') }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: t('favorites') }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const scheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack.Navigator>
            <Stack.Screen name="Movies" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Details" component={MovieDetail} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
