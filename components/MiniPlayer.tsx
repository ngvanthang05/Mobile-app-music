import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useMusic } from '../context/MusicContext';
import { Audio } from 'expo-av';
import { fixStreamUrl } from '../utils/audioUrl';

const { width } = Dimensions.get('window');

interface MiniPlayerProps {
  onPress: () => void;
}

export default function MiniPlayer({ onPress }: MiniPlayerProps) {
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

  const soundRef = useRef<Audio.Sound | null>(null);

  // Load & play khi đổi bài
  useEffect(() => {
    if (!currentSong) return;

    const loadAndPlay = async () => {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }

        const url = fixStreamUrl(currentSong.audioUrl);
        console.log("🎵 STREAM:", url);

        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true }
        );

        soundRef.current = sound;
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && status.durationMillis) {
            const percent =
              (status.positionMillis / status.durationMillis) * 100;
            setProgress(percent);

            if (status.didJustFinish) {
              nextSong();
            }
          }
        });

      } catch (err) {
        console.log("❌ Lỗi phát nhạc:", err);
      }
    };

    loadAndPlay();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [currentSong]);

  // Play / Pause
  useEffect(() => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.playAsync();
    } else {
      soundRef.current.pauseAsync();
    }
  }, [isPlaying]);

  // Seek khi kéo slider
  const handleSeek = async (value: number) => {
    if (!soundRef.current) return;

    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded || !status.durationMillis) return;

    const position = (value / 100) * status.durationMillis;
    await soundRef.current.setPositionAsync(position);
    setProgress(value);
  };

  if (!currentSong) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={styles.content}>
          {/* Song Info */}
          <View style={styles.songInfoContainer}>
            <Image source={{ uri: currentSong.cover }} style={styles.songImage} />
            <View style={styles.textContainer}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {currentSong.title}
              </Text>
              <Text style={styles.songArtist} numberOfLines={1}>
                {currentSong.artist}
              </Text>
            </View>
            <TouchableOpacity onPress={() => toggleLike(currentSong.id)} style={styles.iconButton}>
              <Ionicons
                name={likedSongs.includes(currentSong.id) ? 'heart' : 'heart-outline'}
                size={20}
                color={likedSongs.includes(currentSong.id) ? '#ec4899' : '#67e8f9'}
              />
            </TouchableOpacity>
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={toggleShuffle} style={styles.iconButton}>
              <Ionicons name="shuffle" size={18} color={isShuffle ? '#67e8f9' : '#9ca3af'} />
            </TouchableOpacity>

            <View style={styles.mainControls}>
              <TouchableOpacity onPress={prevSong} style={styles.skipButton}>
                <Ionicons name="play-skip-back" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={styles.playButton}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#1e3a8a" />
              </TouchableOpacity>

              <TouchableOpacity onPress={nextSong} style={styles.skipButton}>
                <Ionicons name="play-skip-forward" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={toggleRepeat} style={styles.repeatButton}>
              <Ionicons name="repeat" size={18} color={repeatMode !== 'off' ? '#67e8f9' : '#9ca3af'} />
              {repeatMode === 'one' && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>1</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <Slider
            style={{ width: width - 32, height: 20, marginTop: -4 }}
            minimumValue={0}
            maximumValue={100}
            value={progress}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor="#1f2937"
            maximumTrackTintColor="#e5e7eb"
            thumbTintColor="#ffffff"
          />

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {Math.floor((progress / 100) * 225 / 60)}:
              {String(Math.floor((progress / 100) * 225 % 60)).padStart(2, '0')}
            </Text>
            <Text style={styles.timeText}>{currentSong.duration}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 65,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  songInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  songImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  songTitle: {
    color: 'white',
    fontWeight: '600',
  },
  songArtist: {
    color: '#67e8f9',
    fontSize: 14,
  },
  iconButton: {
    padding: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skipButton: {
    padding: 4,
  },
  playButton: {
    backgroundColor: 'white',
    borderRadius: 9999,
    padding: 12,
  },
  repeatButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#06b6d4',
    borderRadius: 9999,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    color: '#67e8f9',
    fontSize: 12,
  },
});
