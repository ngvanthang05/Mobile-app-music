import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Modal } from 'react-native';
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
  const { playSong, likedSongs, songs: allSongs, toggleLike } = useMusic();

  const [songs, setSongs] = useState<SongApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLikedModal, setShowLikedModal] = useState(false);

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
                    audioUrl: song.streamUrl,
                    album: 'Unknown',
                    duration: '0:00',
                    size: '0 MB',
                    quality: 'streaming'
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
        <TouchableOpacity
          onPress={() => setShowLikedModal(true)}
          activeOpacity={0.8}
        >
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
        </TouchableOpacity>
      </ScrollView>

      {/* Liked Songs Modal */}
      <Modal
        visible={showLikedModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLikedModal(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1e3a8a', '#0e7490', '#000000']}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowLikedModal(false)}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Liked Songs</Text>
              <View style={{ width: 28 }} />
            </View>

            {/* Liked Songs List */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {likedSongs.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="heart-outline" size={64} color="#94a3b8" />
                  <Text style={styles.emptyText}>No liked songs yet</Text>
                  <Text style={styles.emptySubtext}>Tap the heart icon on songs you love</Text>
                </View>
              ) : (
                allSongs
                  .filter(song => likedSongs.includes(song.id))
                  .map((song) => (
                    <View key={song.id} style={styles.likedSongRow}>
                      <TouchableOpacity
                        style={styles.likedSongContent}
                        onPress={() => {
                          playSong(song);
                          setShowLikedModal(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Image
                          source={{ uri: song.cover }}
                          style={styles.likedSongImage}
                          resizeMode="cover"
                        />
                        <View style={styles.likedSongInfo}>
                          <Text style={styles.likedSongTitle} numberOfLines={1}>
                            {song.title}
                          </Text>
                          <Text style={styles.likedSongArtist} numberOfLines={1}>
                            {song.artist}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => toggleLike(song.id)}
                        style={styles.unlikeButton}
                      >
                        <Ionicons name="heart" size={24} color="#ec4899" />
                      </TouchableOpacity>
                    </View>
                  ))
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>

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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  modalTitle: {
    flex: 1,
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  likedSongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  likedSongContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
  },
  likedSongImage: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  likedSongInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  likedSongTitle: {
    color: 'white',
    fontWeight: '500',
    marginBottom: 4,
  },
  likedSongArtist: {
    color: '#67e8f9',
    fontSize: 14,
  },
  unlikeButton: {
    padding: 8,
    marginLeft: 8,
  },
});
