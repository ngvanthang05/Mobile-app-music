import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMusic } from '../context/MusicContext'; // Thêm để phát nhạc
import { searchPublicSongs, Song } from '../api/songApi'; // Thêm API

const genres = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical'];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]); // Lưu kết quả
  const [loading, setLoading] = useState(false);
  const { playSong } = useMusic(); // Để khi bấm vào kết quả thì phát nhạc

  // ================= LOGIC TÌM KIẾM (DEBOUNCE) =================
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        handleSearch(searchQuery);
      } else {
        setResults([]);
      }
    }, 500); // Đợi 0.5s sau khi ngừng gõ mới gọi API

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const res = await searchPublicSongs(query);
      setResults(res.data);
    } catch (error) {
      console.error('❌ Lỗi tìm kiếm:', error);
    } finally {
      setLoading(false);
    }
  };
  // ==========================================================

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
        <Text style={styles.headerTitle}>Search</Text>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search for songs, artists..."
            placeholderTextColor="#67e8f9"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {loading && <ActivityIndicator size="small" color="#67e8f9" />}
        </View>

        {/* HIỂN THỊ KẾT QUẢ TÌM KIẾM (Chỉ hiện khi có kết quả) */}
        {results.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <Text style={styles.sectionTitle}>Top Results</Text>
            {results.map((song) => (
              <TouchableOpacity
                key={song.id}
                style={styles.resultItem}
                onPress={() => playSong({
                  id: song.id,
                  title: song.title,
                  artist: song.artistName,
                  cover: song.coverUrl,
                  audioUrl: song.streamUrl // Đảm bảo dùng audioUrl để khớp với MiniPlayer
                })}
              >
                <Image source={{ uri: song.coverUrl }} style={styles.resultImage} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.resultTitle} numberOfLines={1}>{song.title}</Text>
                  <Text style={styles.resultArtist} numberOfLines={1}>{song.artistName}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Browse All (Giữ nguyên giao diện cũ) */}
        <Text style={styles.sectionTitle}>Browse All</Text>
        <View style={styles.gridContainer}>
          {genres.map((genre, index) => (
            <TouchableOpacity
              key={genre}
              style={styles.genreCard}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={
                  index % 2 === 0 
                    ? ['#0891b2', '#1e40af'] 
                    : ['#1e40af', '#581c87']
                }
                style={styles.genreGradient}
              >
                <Text style={styles.genreText}>{genre}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // ... Giữ nguyên các style cũ của bạn ...
  container: { flex: 1 },
  scrollView: { flex: 1, paddingHorizontal: 24, paddingTop: 56 },
  scrollContent: { paddingBottom: 100 },
  headerTitle: { color: 'white', fontSize: 36, fontWeight: 'bold', marginBottom: 24 },
  searchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: { flex: 1, color: 'white', fontSize: 16 },
  sectionTitle: { color: 'white', fontSize: 24, fontWeight: '600', marginBottom: 16 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  genreCard: { width: '48%', aspectRatio: 1, marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
  genreGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  genreText: { color: 'white', fontSize: 24, fontWeight: 'bold' },

  // STYLE MỚI CHO PHẦN KẾT QUẢ TÌM KIẾM (Đảm bảo đẹp và hợp tone)
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultImage: { width: 50, height: 50, borderRadius: 4 },
  resultTitle: { color: 'white', fontWeight: '600', fontSize: 16 },
  resultArtist: { color: '#67e8f9', fontSize: 14 },
});