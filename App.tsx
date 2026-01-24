import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';

import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import LibraryScreen from './screens/LibraryScreen';
import PremiumScreen from './screens/PremiumScreen';
import LiveScreen from './screens/LiveScreen';
import MiniPlayer from './components/MiniPlayer';
import NowPlayingScreen from './components/NowPlayingScreen';
import { MusicProvider } from './context/MusicContext';

const Tab = createBottomTabNavigator();

export default function App() {
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  return (
    <SafeAreaProvider>
      <MusicProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap = 'home';

                if (route.name === 'Home') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Search') {
                  iconName = focused ? 'search' : 'search-outline';
                } else if (route.name === 'Library') {
                  iconName = focused ? 'library' : 'library-outline';
                } else if (route.name === 'Live') {
                  iconName = focused ? 'radio' : 'radio-outline';
                } else if (route.name === 'Premium') {
                  iconName = focused ? 'diamond' : 'diamond-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#ffffff',
              tabBarInactiveTintColor: '#67e8f9',
              tabBarStyle: {
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                borderTopColor: 'rgba(255, 255, 255, 0.1)',
                paddingBottom: 8,
                paddingTop: 8,
                height: 65,
                position: 'absolute',
                bottom: 0,
              },
              tabBarLabelStyle: {
                fontSize: 10,
                fontWeight: '500',
              },
              headerShown: false,
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Live" component={LiveScreen} />
            <Tab.Screen name="Library" component={LibraryScreen} />
            <Tab.Screen name="Premium" component={PremiumScreen} />
          </Tab.Navigator>

          <MiniPlayer onPress={() => setShowNowPlaying(true)} />

          <NowPlayingScreen
            visible={showNowPlaying}
            onClose={() => setShowNowPlaying(false)}
          />

          <StatusBar style="light" />
        </NavigationContainer>
      </MusicProvider>
    </SafeAreaProvider>
  );
}
