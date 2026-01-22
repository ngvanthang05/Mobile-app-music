import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useMusic } from '../context/MusicContext';

export default function LibraryScreen() {
  const { songs, playSong, likedSongs, toggleLike, playlists, createPlaylist } = useMusic();
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>('songs');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setIsModalVisible(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1e3a8a', '#0e7490', '#000000']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'songs' && styles.activeTab]}
            onPress={() => setActiveTab('songs')}
          >
            <Text style={[styles.tabText, activeTab === 'songs' && styles.activeTabText]}>Songs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'playlists' && styles.activeTab]}
            onPress={() => setActiveTab('playlists')}
          >
            <Text style={[styles.tabText, activeTab === 'playlists' && styles.activeTabText]}>Playlists</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'songs' ? (
          // Songs List
          songs.map((song) => (
            <TouchableOpacity
              key={song.id}
              style={styles.songRow}
              onPress={() => playSong(song)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: song.cover }}
                style={styles.songImage}
                resizeMode="cover"
              />
              <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>
                  {song.title}
                </Text>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {song.artist}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleLike(song.id)}
                style={styles.likeButton}
              >
                <Ionicons
                  name={likedSongs.includes(song.id) ? 'heart' : 'heart-outline'}
                  size={22}
                  color={likedSongs.includes(song.id) ? '#ec4899' : '#67e8f9'}
                />
              </TouchableOpacity>
              <Text style={styles.durationText}>{song.duration}</Text>
            </TouchableOpacity>
          ))
        ) : (
          // Playlists Grid
          <View>
            <TouchableOpacity 
              style={styles.createPlaylistButton}
              onPress={() => setIsModalVisible(true)}
            >
              <View style={styles.createIcon}>
                <Ionicons name="add" size={32} color="white" />
              </View>
              <Text style={styles.createPlaylistText}>Create Playlist</Text>
            </TouchableOpacity>

            <View style={styles.gridContainer}>
              {playlists.map((playlist) => (
                <TouchableOpacity key={playlist.id} style={styles.playlistCard}>
                  <Image source={{ uri: playlist.cover }} style={styles.playlistCover} />
                  <Text style={styles.playlistName} numberOfLines={1}>{playlist.name}</Text>
                  <Text style={styles.playlistCount}>{playlist.count} songs</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Playlist Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Playlist Name"
              placeholderTextColor="#94a3b8"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9999,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9999,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 180,
    paddingTop: 8,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  songImage: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    color: 'white',
    fontWeight: '500',
  },
  songArtist: {
    color: '#67e8f9',
    fontSize: 14,
  },
  likeButton: {
    padding: 8,
  },
  durationText: {
    color: '#67e8f9',
    fontSize: 14,
    marginLeft: 8,
  },
  createPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  createIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  createPlaylistText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  playlistCard: {
    width: '48%',
    marginBottom: 20,
  },
  playlistCover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#334155',
  },
  playlistName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  playlistCount: {
    color: '#94a3b8',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 16,
    color: 'white',
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#0891b2',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
