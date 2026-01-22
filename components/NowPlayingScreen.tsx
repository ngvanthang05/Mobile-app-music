import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ScrollView,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useMusic } from '../context/MusicContext';
import { getLyrics } from '../api/songApi'; // Import API lấy lyrics

const { width, height } = Dimensions.get('window');

interface NowPlayingScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function NowPlayingScreen({ visible, onClose }: NowPlayingScreenProps) {
  const {
    currentSong,
    isPlaying,
    progress,
    setProgress,
    setIsPlaying,
    isShuffle,
    repeatMode,
    toggleShuffle,
    toggleRepeat,
    nextSong,
    prevSong,
    likedSongs,
    toggleLike,
  } = useMusic();

  const [showLyrics, setShowLyrics] = useState(false);
  const [rawLyrics, setRawLyrics] = useState(''); // Lưu trữ lyric thô
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Hiệu ứng trượt màn hình lên/xuống
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Gọi API lấy Lyrics mỗi khi đổi bài hoặc mở màn hình
  useEffect(() => {
    if (visible && currentSong) {
      const fetchLyrics = async () => {
        setLoadingLyrics(true);
        try {
          const res = await getLyrics(
            currentSong.title,
            currentSong.artist,
            currentSong.album
          );
          
          // Ưu tiên lấy plainLyrics (lời văn bản), nếu không có thì lấy syncedLyrics (lời có thời gian)
          const lyricData = res.data.plainLyrics || res.data.syncedLyrics || 'No lyrics available for this song.';
          setRawLyrics(lyricData);
        } catch (error) {
          console.log("❌ Lỗi lấy lời nhạc:", error);
          setRawLyrics('Could not load lyrics.');
        } finally {
          setLoadingLyrics(false);
        }
      };

      fetchLyrics();
    }
  }, [currentSong?.id, visible]);

  if (!currentSong) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <Animated.View style={{ flex: 1, transform: [{ translateY: slideAnim }] }}>
        <LinearGradient
          colors={['#1e3a8a', '#0e7490', '#000000']}
          style={styles.container}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                <Ionicons name="chevron-down" size={32} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Now Playing</Text>
              <TouchableOpacity
                onPress={() => setShowLyrics(!showLyrics)}
                style={styles.lyricsToggle}
              >
                <Ionicons 
                  name={showLyrics ? "image-outline" : "musical-notes-outline"} 
                  size={24} 
                  color="#67e8f9" 
                />
              </TouchableOpacity>
            </View>

            {/* Vùng hiển thị chính: Ảnh bìa hoặc Lời nhạc */}
            <View style={styles.mainDisplay}>
              {!showLyrics ? (
                <Image
                  source={{ uri: currentSong.cover }}
                  style={[styles.albumArt, { width: width - 80, height: width - 80 }]}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.lyricsWrapper}>
                  {loadingLyrics ? (
                    <ActivityIndicator size="large" color="#67e8f9" />
                  ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <Text style={styles.rawLyricsText}>{rawLyrics}</Text>
                    </ScrollView>
                  )}
                </View>
              )}
            </View>

            {/* Thông tin bài hát */}
            <View style={styles.songInfoContainer}>
              <View style={styles.songTextContainer}>
                <Text style={styles.songTitle} numberOfLines={1}>
                  {currentSong.title}
                </Text>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {currentSong.artist}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleLike(currentSong.id)}
                style={styles.iconButton}
              >
                <Ionicons
                  name={likedSongs.includes(currentSong.id) ? 'heart' : 'heart-outline'}
                  size={28}
                  color={likedSongs.includes(currentSong.id) ? '#ec4899' : '#67e8f9'}
                />
              </TouchableOpacity>
            </View>

            {/* Thanh tiến trình */}
            <View style={styles.progressContainer}>
              <Slider
                style={{ width: width - 48, height: 40 }}
                minimumValue={0}
                maximumValue={100}
                value={progress}
                onValueChange={setProgress}
                minimumTrackTintColor="#67e8f9"
                maximumTrackTintColor="rgba(255,255,255,0.2)"
                thumbTintColor="#ffffff"
              />
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {Math.floor((progress / 100) * 225 / 60)}:{String(Math.floor((progress / 100) * 225 % 60)).padStart(2, '0')}
                </Text>
                <Text style={styles.timeText}>{currentSong.duration}</Text>
              </View>
            </View>

            {/* Bộ điều khiển nhạc */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity onPress={toggleShuffle} style={styles.controlButtonSmall}>
                <Ionicons name="shuffle" size={24} color={isShuffle ? '#67e8f9' : '#9ca3af'} />
              </TouchableOpacity>

              <View style={styles.mainControls}>
                <TouchableOpacity onPress={prevSong}>
                  <Ionicons name="play-skip-back" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsPlaying(!isPlaying)}
                  style={styles.playButton}
                >
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={40} color="#1e3a8a" />
                </TouchableOpacity>

                <TouchableOpacity onPress={nextSong}>
                  <Ionicons name="play-skip-forward" size={36} color="white" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={toggleRepeat} style={styles.repeatButton}>
                <Ionicons name="repeat" size={24} color={repeatMode !== 'off' ? '#67e8f9' : '#9ca3af'} />
                {repeatMode === 'one' && (
                  <View style={styles.badge}><Text style={styles.badgeText}>1</Text></View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingTop: 48, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '500', opacity: 0.8 },
  lyricsToggle: { padding: 8 },
  iconButton: { padding: 8 },
  mainDisplay: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  albumArt: { borderRadius: 16, elevation: 10 },
  lyricsWrapper: { flex: 1, width: '100%', paddingVertical: 20 },
  rawLyricsText: {
    color: 'white',
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.9,
  },
  songInfoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  songTextContainer: { flex: 1 },
  songTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  songArtist: { color: '#67e8f9', fontSize: 18, marginTop: 4 },
  progressContainer: { marginBottom: 16 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
  timeText: { color: '#67e8f9', fontSize: 14 },
  controlsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 },
  mainControls: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  playButton: { backgroundColor: 'white', borderRadius: 999, padding: 20 },
  controlButtonSmall: { padding: 12 },
  repeatButton: { padding: 12, position: 'relative' },
  badge: {
    position: 'absolute', top: 5, right: 5, backgroundColor: '#06b6d4',
    borderRadius: 99, width: 14, height: 14, alignItems: 'center', justifyContent: 'center'
  },
  badgeText: { color: 'white', fontSize: 8, fontWeight: 'bold' },
});