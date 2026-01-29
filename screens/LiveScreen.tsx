import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useMusic } from '../context/MusicContext';
import * as RadioAPI from '../api/radioApi';
import CameraBroadcast from '../components/CameraBroadcast';
import * as LiveAPI from '../api/liveApi';
import LivestreamHistory from '../components/LivestreamHistory';
import LivestreamViewer from '../components/LivestreamViewer';

// Podcast categories
const categories = ['Technology', 'Comedy', 'News', 'Education', 'Business', 'Arts'];

// Trending podcasts
const trendingPodcasts = [
    { id: 1, title: 'The Daily Tech', host: 'Tech Insider', cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=400&auto=format&fit=crop' },
    { id: 2, title: 'Morning Coffee', host: 'Sarah Jenkins', cover: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=400&auto=format&fit=crop' },
    { id: 3, title: 'Future World', host: 'Dr. Alan Grant', cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop' },
];

// Podcast episodes
const episodes = [
    { id: 101, title: 'Ep. 45: AI Revolution', podcast: 'The Daily Tech', duration: '45 min', date: 'Today' },
    { id: 102, title: 'How to Start a Business', podcast: 'Business 101', duration: '32 min', date: 'Yesterday' },
    { id: 103, title: 'The Art of Minimalism', podcast: 'Mindful Living', duration: '28 min', date: '2 days ago' },
    { id: 104, title: 'Hidden Histories', podcast: 'Past & Present', duration: '55 min', date: 'Last week' },
];

// Mock livestream data
const mockLivestreams: LiveAPI.LiveRoom[] = [
    {
        roomId: '1',
        roomTitle: 'Nhạc EDM buổi tối 🎵',
        streamer: 'user1',
        streamerName: 'DJ Night Mix',
        thumbnailUrl: 'https://images.unsplash.com/photo-1571266028243-d220c6e1b60f?q=80&w=400&auto=format&fit=crop',
        viewerCount: 1234,
        streamUrl: '',
        isLive: true,
    },
    {
        roomId: '2',
        roomTitle: 'Hòa âm trực tiếp từ studio 🎹',
        streamer: 'user2',
        streamerName: 'Music Studio Live',
        thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400&auto=format&fit=crop',
        viewerCount: 856,
        streamUrl: '',
        isLive: true,
    },
];

export default function LiveScreen() {
    const [activeTab, setActiveTab] = useState<'livestream' | 'podcast'>('livestream');
    const [radioStations, setRadioStations] = useState<RadioAPI.RadioStation[]>([]);
    const [loading, setLoading] = useState(false);
    const { playSong, currentSong, isPlaying } = useMusic();

    // Camera broadcast modal
    const [showCamera, setShowCamera] = useState(false);

    // Livestream viewer modal
    const [selectedRoom, setSelectedRoom] = useState<LiveAPI.LiveRoom | null>(null);
    const [showTitleInput, setShowTitleInput] = useState(false);
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [livestreams, setLivestreams] = useState<LiveAPI.LiveRoom[]>(mockLivestreams);
    const [currentBroadcast, setCurrentBroadcast] = useState<LiveAPI.LiveRoom | null>(null);
    const [viewerCount, setViewerCount] = useState(0);

    // Start broadcast
    const handleStartBroadcast = () => {
        setShowTitleInput(true);
    };

    const confirmStartBroadcast = () => {
        if (!broadcastTitle.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề phát sóng');
            return;
        }

        // Create new broadcast room
        const newBroadcast: LiveAPI.LiveRoom = {
            roomId: Date.now().toString(),
            roomTitle: broadcastTitle,
            streamer: 'currentUser',
            streamerName: 'Bạn',
            viewerCount: 0,
            thumbnailUrl: '',
            streamUrl: '',
            isLive: true,
        };

        setCurrentBroadcast(newBroadcast);
        setViewerCount(0);
        setShowCamera(true); // Changed from setShowBroadcastModal to setShowCamera
        setShowTitleInput(false);
        setBroadcastTitle('');
    };

    const handleEndBroadcast = () => {
        setShowCamera(false); // Changed from setShowBroadcastModal to setShowCamera
        setCurrentBroadcast(null);
        setViewerCount(0);
    };

    const formatListeners = (votes: number): string => {
        if (votes >= 1000) {
            return `${(votes / 1000).toFixed(1)}K`;
        }
        return votes.toString();
    };

    return (
        <>
            <LinearGradient
                colors={['#1e3a8a', '#0e7490', '#000000']}
                style={styles.container}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Livestream & Podcasts</Text>

                    {/* Tab Switcher */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'livestream' && styles.activeTab]}
                            onPress={() => setActiveTab('livestream')}
                        >
                            <Ionicons
                                name="videocam"
                                size={18}
                                color={activeTab === 'livestream' ? '#ffffff' : '#94a3b8'}
                            />
                            <Text style={[styles.tabText, activeTab === 'livestream' && styles.activeTabText]}>
                                Livestream
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'podcast' && styles.activeTab]}
                            onPress={() => setActiveTab('podcast')}
                        >
                            <Ionicons
                                name="mic"
                                size={18}
                                color={activeTab === 'podcast' ? '#ffffff' : '#94a3b8'}
                            />
                            <Text style={[styles.tabText, activeTab === 'podcast' && styles.activeTabText]}>
                                Podcasts
                            </Text>
                        </TouchableOpacity>

                        {/* TODO: Re-enable when recording feature is fixed */}
                        {/* <TouchableOpacity
                            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                            onPress={() => setActiveTab('history')}
                        >
                            <Ionicons
                                name="film"
                                size={18}
                                color={activeTab === 'history' ? '#ffffff' : '#94a3b8'}
                            />
                            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                                Lịch sử
                            </Text>
                        </TouchableOpacity> */}
                    </View>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {activeTab === 'livestream' ? (
                        // Livestream Tab
                        <>
                            {/* Start Broadcast Button */}
                            <TouchableOpacity
                                style={styles.startBroadcastCard}
                                onPress={handleStartBroadcast}
                            >
                                <LinearGradient
                                    colors={['#ec4899', '#8b5cf6']}
                                    style={styles.startBroadcastGradient}
                                >
                                    <Ionicons name="videocam" size={32} color="#ffffff" />
                                    <View style={styles.startBroadcastText}>
                                        <Text style={styles.startBroadcastTitle}>Bắt đầu phát sóng trực tiếp</Text>
                                        <Text style={styles.startBroadcastSubtitle}>Chia sẻ âm nhạc với mọi người</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                                </LinearGradient>
                            </TouchableOpacity>

                            <Text style={styles.sectionTitle}>🔴 Đang phát sóng</Text>
                            <Text style={styles.sectionSubtitle}>Tham gia các buổi livestream đang diễn ra</Text>

                            {/* Livestream Rooms */}
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#67e8f9" />
                                    <Text style={styles.loadingText}>Đang tải...</Text>
                                </View>
                            ) : (
                                <>
                                    {livestreams.map((room) => (
                                        <TouchableOpacity
                                            key={room.roomId}
                                            style={styles.livestreamCard}
                                            onPress={() => setSelectedRoom(room)}
                                        >
                                            <Image
                                                source={{ uri: room.thumbnailUrl }}
                                                style={styles.livestreamThumbnail}
                                            />

                                            <View style={styles.livestreamOverlay}>
                                                <View style={styles.liveBadge}>
                                                    <View style={styles.liveDot} />
                                                    <Text style={styles.liveText}>LIVE</Text>
                                                </View>

                                                <View style={styles.viewerBadge}>
                                                    <Ionicons name="eye" size={12} color="#fff" />
                                                    <Text style={styles.viewerText}>
                                                        {formatListeners(room.viewerCount)}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.livestreamInfo}>
                                                <Text style={styles.livestreamTitle} numberOfLines={1}>
                                                    {room.roomTitle}
                                                </Text>
                                                <Text style={styles.livestreamStreamer} numberOfLines={1}>
                                                    {room.streamerName || room.streamer || 'Unknown'}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}

                                    {livestreams.length === 0 && (
                                        <View style={styles.emptyState}>
                                            <Ionicons name="videocam-off" size={64} color="#475569" />
                                            <Text style={styles.emptyStateTitle}>Chưa có livestream nào</Text>
                                            <Text style={styles.emptyStateText}>
                                                Hãy là người đầu tiên bắt đầu phát sóng!
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        // Podcasts Tab
                        <>
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
                        </>
                    )}
                </ScrollView>
            </LinearGradient>

            {/* Title Input Modal */}
            {showTitleInput && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Tiêu đề phát sóng</Text>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="VD: Nhạc chill buổi tối 🎵"
                            placeholderTextColor="#64748b"
                            value={broadcastTitle}
                            onChangeText={setBroadcastTitle}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowTitleInput(false);
                                    setBroadcastTitle('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={confirmStartBroadcast}
                            >
                                <LinearGradient
                                    colors={['#ec4899', '#8b5cf6']}
                                    style={styles.confirmGradient}
                                >
                                    <Text style={styles.confirmButtonText}>Bắt đầu</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Camera Broadcast Modal */}
            <CameraBroadcast
                visible={showCamera}
                onClose={handleEndBroadcast}
                roomTitle={currentBroadcast?.roomTitle || ''}
                viewerCount={viewerCount}
                onViewerCountChange={setViewerCount}
            />

            {/* Livestream Viewer Modal */}
            <LivestreamViewer
                visible={!!selectedRoom}
                room={selectedRoom}
                onClose={() => setSelectedRoom(null)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 56,
        paddingBottom: 16,
    },
    headerTitle: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
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
        color: '#ffffff',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 8,
    },
    sectionSubtitle: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 16,
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    loadingText: {
        color: '#94a3b8',
        marginTop: 12,
        fontSize: 14,
    },
    // Live Station Styles
    liveStationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
    },
    activeStationCard: {
        backgroundColor: 'rgba(8, 145, 178, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(8, 145, 178, 0.3)',
    },
    stationCover: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: '#334155',
    },
    stationInfo: {
        flex: 1,
        marginLeft: 12,
    },
    stationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    stationName: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        marginRight: 8,
        flex: 1,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ef4444',
    },
    liveText: {
        color: '#ef4444',
        fontSize: 10,
        fontWeight: 'bold',
    },
    stationMetadata: {
        marginBottom: 4,
    },
    stationCountry: {
        color: '#67e8f9',
        fontSize: 12,
    },
    listenersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    listenersText: {
        color: '#94a3b8',
        fontSize: 11,
    },
    playButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#0891b2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activePlayButton: {
        backgroundColor: '#06b6d4',
    },
    discoverCard: {
        marginTop: 16,
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
    },
    discoverGradient: {
        padding: 24,
        alignItems: 'center',
    },
    discoverTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
    },
    discoverSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginTop: 4,
    },
    // Podcast Styles
    categoriesContainer: {
        marginBottom: 24,
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
        color: '#94a3b8',
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
    },
    // Livestream Styles
    startBroadcastCard: {
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    startBroadcastGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    startBroadcastText: {
        flex: 1,
    },
    startBroadcastTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    startBroadcastSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    livestreamCard: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    livestreamThumbnail: {
        width: '100%',
        height: 200,
        backgroundColor: '#334155',
    },
    livestreamOverlay: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    viewerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    viewerText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    livestreamInfo: {
        padding: 12,
    },
    livestreamTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    livestreamHost: {
        color: '#94a3b8',
        fontSize: 13,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        color: '#e2e8f0',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptyStateText: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    titleInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    cancelButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        overflow: 'hidden',
    },
    confirmGradient: {
        padding: 14,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    livestreamStreamer: {
        fontSize: 12,
        color: '#94a3b8',
    },
});
