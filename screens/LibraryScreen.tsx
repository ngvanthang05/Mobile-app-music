import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useMusic } from '../context/MusicContext';

export default function LibraryScreen() {
  const { songs, playSong, likedSongs, toggleLike, playlists, createPlaylist, addSongToPlaylist, removeSongFromPlaylist, deletePlaylist } = useMusic();
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>('songs');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState<string | null>(null);
  const [isPlaylistDetailVisible, setIsPlaylistDetailVisible] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setIsModalVisible(false);
    }
  };

  const handleOpenPlaylistModal = (songId: string) => {
    setSelectedSongForPlaylist(songId);
    setIsPlaylistModalVisible(true);
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (selectedSongForPlaylist !== null) {
      await addSongToPlaylist(playlistId, selectedSongForPlaylist);
      setIsPlaylistModalVisible(false);
      setSelectedSongForPlaylist(null);
    }
  };

  const handleOpenPlaylistDetail = (playlist: any) => {
    setSelectedPlaylist(playlist);
    setIsPlaylistDetailVisible(true);
  };

  const handleRemoveSong = async (songId: string) => {
    if (selectedPlaylist) {
      await removeSongFromPlaylist(selectedPlaylist.id, songId);
      // Refresh the selected playlist data
      const updatedPlaylist = playlists.find(p => p.id === selectedPlaylist.id);
      if (updatedPlaylist) {
        setSelectedPlaylist(updatedPlaylist);
      }
    }
  };

  const handleDeletePlaylist = async () => {
    if (selectedPlaylist) {
      Alert.alert(
        'Delete Playlist',
        `Are you sure you want to delete "${selectedPlaylist.name}"?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deletePlaylist(selectedPlaylist.id);
              setIsPlaylistDetailVisible(false);
              setSelectedPlaylist(null);
            },
          },
        ]
      );
    }
  };

  // Helper function to get gradient colors based on playlist name
  const getPlaylistGradient = (name: string): [string, string] => {
    const gradients: [string, string][] = [
      ['#ec4899', '#8b5cf6'], // Pink to Purple
      ['#3b82f6', '#06b6d4'], // Blue to Cyan
      ['#f59e0b', '#ef4444'], // Orange to Red
      ['#10b981', '#06b6d4'], // Green to Cyan
      ['#8b5cf6', '#ec4899'], // Purple to Pink
      ['#f43f5e', '#fb923c'], // Rose to Orange
    ];
    const index = (name?.charCodeAt(0) || 0) % gradients.length;
    return gradients[index];
  };

  // Component to render playlist cover with gradient placeholder
  const renderPlaylistCover = (playlist: any, size: number = 150, borderRadius: number = 8) => {
    if (playlist.coverImage) {
      return (
        <Image
          source={{ uri: playlist.coverImage }}
          style={{ width: size, height: size, borderRadius, backgroundColor: '#334155' }}
        />
      );
    }
    const gradient = getPlaylistGradient(playlist.name);
    const firstLetter = playlist.name?.charAt(0).toUpperCase() || 'P';
    return (
      <LinearGradient
        colors={gradient}
        style={{
          width: size,
          height: size,
          borderRadius,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{
          color: 'white',
          fontSize: size * 0.4,
          fontWeight: 'bold',
          textShadowColor: 'rgba(0, 0, 0, 0.3)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        }}>
          {firstLetter}
        </Text>
      </LinearGradient>
    );
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
              <TouchableOpacity
                onPress={() => handleOpenPlaylistModal(song.id)}
                style={styles.addButton}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color="#67e8f9"
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
                <TouchableOpacity
                  key={playlist.id}
                  style={styles.playlistCard}
                  onPress={() => handleOpenPlaylistDetail(playlist)}
                >
                  {renderPlaylistCover(playlist)}
                  <Text style={styles.playlistName} numberOfLines={1}>{playlist.name}</Text>
                  <Text style={styles.playlistCount}>{playlist.tracks?.length || 0} songs</Text>
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

      {/* Add to Playlist Modal */}
      <Modal
        visible={isPlaylistModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPlaylistModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Playlist</Text>

            {playlists.length === 0 ? (
              <View style={styles.emptyPlaylistContainer}>
                <Ionicons name="musical-notes-outline" size={48} color="#94a3b8" />
                <Text style={styles.emptyPlaylistText}>No playlists yet</Text>
                <Text style={styles.emptyPlaylistSubtext}>Create a playlist first</Text>
                <TouchableOpacity
                  style={styles.createFirstButton}
                  onPress={() => {
                    setIsPlaylistModalVisible(false);
                    setActiveTab('playlists');
                    setTimeout(() => setIsModalVisible(true), 300);
                  }}
                >
                  <Text style={styles.createFirstButtonText}>Create Playlist</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.playlistList} showsVerticalScrollIndicator={false}>
                {playlists.map((playlist) => (
                  <TouchableOpacity
                    key={playlist.id}
                    style={styles.playlistItem}
                    onPress={() => handleAddToPlaylist(playlist.id)}
                  >
                    <Image
                      source={{ uri: playlist.coverImage || 'https://via.placeholder.com/50' }}
                      style={styles.playlistItemImage}
                    />
                    <View style={styles.playlistItemInfo}>
                      <Text style={styles.playlistItemName} numberOfLines={1}>
                        {playlist.name}
                      </Text>
                      <Text style={styles.playlistItemCount}>
                        {playlist.tracks?.length || 0} songs
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#67e8f9" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsPlaylistModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Playlist Detail Modal */}
      <Modal
        visible={isPlaylistDetailVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPlaylistDetailVisible(false)}
      >
        <View style={styles.playlistDetailContainer}>
          <LinearGradient
            colors={['#1e3a8a', '#0e7490', '#000000']}
            style={styles.playlistDetailGradient}
          >
            {/* Header */}
            <View style={styles.playlistDetailHeader}>
              <TouchableOpacity
                onPress={() => setIsPlaylistDetailVisible(false)}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.playlistDetailTitle} numberOfLines={1}>
                {selectedPlaylist?.name || 'Playlist'}
              </Text>
              <TouchableOpacity
                onPress={handleDeletePlaylist}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>

            {/* Playlist Info */}
            <View style={styles.playlistDetailInfo}>
              {selectedPlaylist && renderPlaylistCover(selectedPlaylist, 200, 12)}
              <Text style={styles.playlistDetailName}>{selectedPlaylist?.name}</Text>
              <Text style={styles.playlistDetailCount}>
                {selectedPlaylist?.tracks?.length || 0} songs
              </Text>
            </View>

            {/* Songs List */}
            <ScrollView
              style={styles.playlistDetailSongs}
              showsVerticalScrollIndicator={false}
            >
              {(!selectedPlaylist?.tracks || selectedPlaylist.tracks.length === 0) ? (
                <View style={styles.emptyPlaylistDetailContainer}>
                  <Ionicons name="musical-notes-outline" size={64} color="#94a3b8" />
                  <Text style={styles.emptyPlaylistDetailText}>No songs yet</Text>
                  <Text style={styles.emptyPlaylistDetailSubtext}>
                    Add songs from the Songs tab
                  </Text>
                </View>
              ) : (
                selectedPlaylist.tracks.map((trackId: string, index: number) => {
                  // Find the song details from songs array
                  const song = songs.find(s => s.id === trackId);
                  if (!song) return null;

                  return (
                    <View key={`${trackId}-${index}`} style={styles.playlistDetailSongRow}>
                      <TouchableOpacity
                        style={styles.playlistDetailSongContent}
                        onPress={() => playSong(song)}
                        activeOpacity={0.7}
                      >
                        <Image
                          source={{ uri: song.cover }}
                          style={styles.playlistDetailSongImage}
                          resizeMode="cover"
                        />
                        <View style={styles.playlistDetailSongInfo}>
                          <Text style={styles.playlistDetailSongTitle} numberOfLines={1}>
                            {song.title}
                          </Text>
                          <Text style={styles.playlistDetailSongArtist} numberOfLines={1}>
                            {song.artist}
                          </Text>
                        </View>
                        <Text style={styles.playlistDetailSongDuration}>{song.duration}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveSong(trackId)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  );
                })
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
  addButton: {
    padding: 8,
  },
  durationText: {
    color: '#67e8f9',
    fontSize: 14,
    marginLeft: 8,
  },
  playlistList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  playlistItemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  playlistItemInfo: {
    flex: 1,
  },
  playlistItemName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  playlistItemCount: {
    color: '#94a3b8',
    fontSize: 13,
  },
  emptyPlaylistContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPlaylistText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyPlaylistSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: '#0891b2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
  // Playlist Detail Modal Styles
  playlistDetailContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  playlistDetailGradient: {
    flex: 1,
  },
  playlistDetailHeader: {
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
  deleteButton: {
    padding: 4,
  },
  playlistDetailTitle: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  playlistDetailInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  playlistDetailCover: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#334155',
  },
  playlistDetailName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  playlistDetailCount: {
    color: '#94a3b8',
    fontSize: 16,
  },
  playlistDetailSongs: {
    flex: 1,
    paddingHorizontal: 24,
  },
  playlistDetailSongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playlistDetailSongContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
  },
  playlistDetailSongImage: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  playlistDetailSongInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  playlistDetailSongTitle: {
    color: 'white',
    fontWeight: '500',
    marginBottom: 4,
  },
  playlistDetailSongArtist: {
    color: '#67e8f9',
    fontSize: 14,
  },
  playlistDetailSongDuration: {
    color: '#67e8f9',
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyPlaylistDetailContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyPlaylistDetailText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyPlaylistDetailSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
  },
});
