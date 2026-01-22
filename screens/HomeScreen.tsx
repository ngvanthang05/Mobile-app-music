import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useMusic } from '../context/MusicContext';
import { getTrendingSongs } from '../api/songApi';   // ✅ API backend

// Kiểu dữ liệu song từ backend
interface SongApi {
  id: string;
  title: string;
  artistName: string;
  coverUrl: string;
  streamUrl: string;
}

export default function HomeScreen() {
  const { playSong, likedSongs } = useMusic();

  const [songs, setSongs] = useState<SongApi[]>([]);
  const [loading, setLoading] = useState(true);

  // ======================
  // Load songs from backend
  // ======================
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await getTrendingSongs(8);
        setSongs(res.data);
      } catch (error) {
        console.error('❌ Lỗi load bài hát:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  return (
    <LinearGradient
      colors={['#1e3a8a', '#0e7490', '#000000']}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.headerTitle}>Music</Text>
        <Text style={styles.headerSubtitle}>Your soundtrack, your way</Text>

        {/* Recently Played */}
        <Text style={styles.sectionTitle}>Recently Played</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#67e8f9" />
        ) : (
          <View style={styles.gridContainer}>
            {songs.slice(0, 4).map((song) => (
              <TouchableOpacity
                key={song.id}
                style={styles.songCard}
                onPress={() =>
                  playSong({
                    id: song.id,
                    title: song.title,
                    artist: song.artistName,
                    cover: song.coverUrl,
                    audioUrl: song.streamUrl
                  })
                }
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: song.coverUrl }}
                  style={styles.songImage}
                  resizeMode="cover"
                />
                <Text style={styles.songTitle} numberOfLines={1}>
                  {song.title}
                </Text>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {song.artistName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Your Playlists */}
        <Text style={styles.sectionTitle}>Your Playlists</Text>
        <LinearGradient
          colors={['#0891b2', '#1e40af']}
          style={styles.playlistCard}
        >
          <View style={styles.playlistContent}>
            <Ionicons name="heart" size={28} color="white" />
            <View style={styles.playlistTextContainer}>
              <Text style={styles.playlistTitle}>Liked Songs</Text>
              <Text style={styles.playlistSubtitle}>{likedSongs.length} songs</Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  scrollContent: {
    paddingBottom: 180,
  },
  headerTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#67e8f9',
    fontSize: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  songCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  songImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  songTitle: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  songArtist: {
    color: '#67e8f9',
    fontSize: 12,
    marginTop: 2,
  },
  playlistCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  playlistContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playlistTextContainer: {
    marginLeft: 16,
  },
  playlistTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  playlistSubtitle: {
    color: '#cffafe',
    fontSize: 14,
    marginTop: 2,
  },
});
