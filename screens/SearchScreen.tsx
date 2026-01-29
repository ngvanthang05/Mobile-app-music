import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMusic } from '../context/MusicContext';
import * as SongAPI from '../api/songApi';

// Music genres/categories
const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'musical-notes' },
  { id: 'pop', name: 'Pop', icon: 'radio' },
  { id: 'rock', name: 'Rock', icon: 'flame' },
  { id: 'hiphop', name: 'Hip-hop', icon: 'headset' },
  { id: 'edm', name: 'EDM', icon: 'pulse' },
  { id: 'jazz', name: 'Jazz', icon: 'wine' },
  { id: 'classical', name: 'Classical', icon: 'musical-note' },
  { id: 'indie', name: 'Indie', icon: 'leaf' },
  { id: 'rnb', name: 'R&B', icon: 'heart' },
];

// Map category IDs to possible genre names in database
const GENRE_MAP: Record<string, string[]> = {
  'pop': ['Pop', 'K-Pop', 'J-Pop', 'Pop Rock'],
  'rock': ['Rock', 'Hard Rock', 'Soft Rock', 'Alternative Rock', 'Indie Rock'],
  'hiphop': ['Hip-Hop', 'Hip Hop', 'Rap', 'Trap'],
  'edm': ['EDM', 'Electronic', 'Dance', 'House', 'Techno', 'Dubstep'],
  'jazz': ['Jazz', 'Smooth Jazz', 'Jazz Fusion'],
  'classical': ['Classical', 'Orchestra', 'Symphony'],
  'indie': ['Indie', 'Indie Rock', 'Indie Pop', 'Alternative'],
  'rnb': ['R&B', 'RnB', 'Soul', 'Neo-Soul'],
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [results, setResults] = useState<SongAPI.Song[]>([]);
  const [loading, setLoading] = useState(false);
  const { playSong } = useMusic();

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        handleSearch(searchQuery);
      } else {
        setResults([]);
        // Load popular songs by category when no search
        if (selectedCategory !== 'all') {
          loadPopularByGenre(selectedCategory);
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Load songs when category changes
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      if (selectedCategory === 'all') {
        setResults([]);
      } else {
        loadPopularByGenre(selectedCategory);
      }
    }
  }, [selectedCategory]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const res = await SongAPI.searchPublicSongs(query);
      setResults(res.data);
    } catch (error) {
      console.error('❌ Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load songs by genre
  const loadPopularByGenre = async (genre: string) => {
    setLoading(true);
    try {
      // Fetch all songs
      const res = await SongAPI.getAllPublicSongs();
      console.log(`🔍 Fetched ${res.data.length} songs total`);
      console.log(`🎵 Looking for genre: "${genre}"`);

      // Show sample of genres in data
      if (res.data.length > 0) {
        const sampleGenres = res.data.slice(0, 5).map((s: SongAPI.Song) => s.genre);
        console.log('📊 Sample genres from API:', sampleGenres);
      }

      // Get possible genre names for this category
      const possibleGenres = GENRE_MAP[genre] || [genre];
      console.log(`🎯 Matching against: ${possibleGenres.join(', ')}`);

      // Filter by genre using mapping
      const filtered = res.data.filter((song: SongAPI.Song) => {
        if (!song.genre) return false;

        const songGenres = Array.isArray(song.genre) ? song.genre : [song.genre];

        // Check if any song genre matches any possible genre
        return songGenres.some(songGenre => {
          const songGenreNormalized = songGenre.toLowerCase().trim();
          return possibleGenres.some(possibleGenre => {
            const possibleNormalized = possibleGenre.toLowerCase().trim();
            return songGenreNormalized === possibleNormalized ||
              songGenreNormalized.includes(possibleNormalized) ||
              possibleNormalized.includes(songGenreNormalized);
          });
        });
      });

      console.log(`✅ Filtered to ${filtered.length} songs for genre "${genre}"`);

      // Only show filtered results (no fallback)
      setResults(filtered);

      // If no results, log available genres for debugging
      if (filtered.length === 0 && res.data.length > 0) {
        const allGenres = new Set<string>();
        res.data.forEach((s: SongAPI.Song) => {
          if (s.genre) {
            const genres = Array.isArray(s.genre) ? s.genre : [s.genre];
            genres.forEach(g => allGenres.add(g));
          }
        });
        console.log('⚠️ No matches found! Available genres in database:', Array.from(allGenres).sort());
      }
    } catch (error) {
      console.error('❌ Load by genre error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Results are already filtered by API when category is selected
  const displayResults = results;

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
          <Ionicons name="search" size={20} color="#67e8f9" style={styles.searchIcon} />
          <TextInput
            placeholder="Search for songs, artists..."
            placeholderTextColor="#67e8f9"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {loading && <ActivityIndicator size="small" color="#67e8f9" />}
        </View>

        {/* Category Filters */}
        <Text style={styles.sectionTitle}>Thể loại</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={18}
                color={selectedCategory === category.id ? '#fff' : '#67e8f9'}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Results */}
        {displayResults.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'Kết quả' : `${CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
              {' '}({displayResults.length})
            </Text>
            {displayResults.map((song) => (
              <TouchableOpacity
                key={song.id}
                style={styles.resultItem}
                onPress={() => playSong({
                  id: song.id,
                  title: song.title,
                  artist: song.artistName,
                  cover: song.coverUrl,
                  audioUrl: song.streamUrl,
                  album: song.albumName || '',
                  duration: song.duration?.toString() || '0',
                  size: '0',
                  quality: 'high',
                })}  >
                <Image source={{ uri: song.coverUrl }} style={styles.resultImage} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle} numberOfLines={1}>
                    {song.title}
                  </Text>
                  <Text style={styles.resultArtist} numberOfLines={1}>
                    {song.artistName}
                  </Text>
                </View>
                <Ionicons name="play-circle" size={32} color="#67e8f9" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (selectedCategory !== 'all' && searchQuery.length === 0) ? (
          <View style={styles.noResultsContainer}>
            <Ionicons name="musical-notes-outline" size={64} color="#475569" />
            <Text style={styles.noResultsText}>
              Không tìm thấy bài hát {CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </Text>
            <Text style={styles.noResultsSubtext}>
              Kiểm tra console logs để xem genres có trong database
            </Text>
          </View>
        ) : null}

        {/* Browse All - Show when no search */}
        {searchQuery.length === 0 && (
          <>
            <Text style={styles.sectionTitle}>Khám phá</Text>
            <View style={styles.gridContainer}>
              {CATEGORIES.filter(c => c.id !== 'all').map((genre, index) => (
                <TouchableOpacity
                  key={genre.id}
                  style={styles.genreCard}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCategory(genre.id)}
                >
                  <LinearGradient
                    colors={
                      index % 3 === 0
                        ? ['#0891b2', '#1e40af']
                        : index % 3 === 1
                          ? ['#1e40af', '#581c87']
                          : ['#c026d3', '#ea580c']
                    }
                    style={styles.genreGradient}
                  >
                    <Ionicons name={genre.icon as any} size={32} color="#fff" />
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
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
    paddingBottom: 100,
  },
  headerTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  searchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingRight: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: '#0891b2',
  },
  categoryText: {
    color: '#67e8f9',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsContainer: {
    marginBottom: 32,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  resultArtist: {
    color: '#67e8f9',
    fontSize: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  genreCard: {
    width: '48%',
    aspectRatio: 1.2,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  genreGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  genreText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  noResultsSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});