import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const categories = ['Technology', 'Comedy', 'News', 'Education', 'Business', 'Arts'];

const trendingPodcasts = [
  { id: 1, title: 'The Daily Tech', host: 'Tech Insider', cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=400&auto=format&fit=crop' },
  { id: 2, title: 'Morning Coffee', host: 'Sarah Jenkins', cover: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=400&auto=format&fit=crop' },
  { id: 3, title: 'Future World', host: 'Dr. Alan Grant', cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop' },
];

const episodes = [
  { id: 101, title: 'Ep. 45: AI Revolution', podcast: 'The Daily Tech', duration: '45 min', date: 'Today' },
  { id: 102, title: 'How to Start a Business', podcast: 'Business 101', duration: '32 min', date: 'Yesterday' },
  { id: 103, title: 'The Art of Minimalism', podcast: 'Mindful Living', duration: '28 min', date: '2 days ago' },
  { id: 104, title: 'Hidden Histories', podcast: 'Past & Present', duration: '55 min', date: 'Last week' },
];

export default function PodcastScreen() {
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
        <Text style={styles.headerTitle}>Podcasts</Text>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((cat, idx) => (
            <TouchableOpacity key={idx} style={styles.categoryChip}>
              <Text style={styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending */}
        <Text style={styles.sectionTitle}>Trending Shows</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingContainer}>
          {trendingPodcasts.map((pod) => (
            <TouchableOpacity key={pod.id} style={styles.podcastCard}>
              <Image source={{ uri: pod.cover }} style={styles.podcastCover} />
              <Text style={styles.podcastTitle} numberOfLines={1}>{pod.title}</Text>
              <Text style={styles.podcastHost} numberOfLines={1}>{pod.host}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* New Episodes */}
        <Text style={styles.sectionTitle}>New Episodes</Text>
        {episodes.map((ep) => (
          <TouchableOpacity key={ep.id} style={styles.episodeCard}>
            <View style={styles.playButtonContainer}>
              <Ionicons name="play-circle" size={40} color="#67e8f9" />
            </View>
            <View style={styles.episodeInfo}>
              <Text style={styles.episodeTitle} numberOfLines={1}>{ep.title}</Text>
              <Text style={styles.episodeSubtitle}>{ep.podcast} • {ep.date}</Text>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{ep.duration}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.downloadBtn}>
               <Ionicons name="download-outline" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

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
  categoriesContainer: {
    marginBottom: 32,
    maxHeight: 40,
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryText: {
    color: 'white',
    fontWeight: '500',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  trendingContainer: {
    marginBottom: 32,
  },
  podcastCard: {
    width: 140,
    marginRight: 16,
  },
  podcastCover: {
    width: 140,
    height: 140,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#334155',
  },
  podcastTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  podcastHost: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  playButtonContainer: {
    marginRight: 12,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  episodeSubtitle: {
    color: '#94a3b8', // slate-400
    fontSize: 12,
    marginBottom: 6,
  },
  durationBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#67e8f9',
    fontSize: 10,
    fontWeight: 'bold',
  },
  downloadBtn: {
    padding: 8,
  }
});
