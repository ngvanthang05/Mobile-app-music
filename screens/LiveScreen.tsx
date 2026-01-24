import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useMusic } from '../context/MusicContext';
import * as RadioAPI from '../api/radioApi';

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

export default function LiveScreen() {
    const [activeTab, setActiveTab] = useState<'live' | 'podcast'>('live');
    const [radioStations, setRadioStations] = useState<RadioAPI.RadioStation[]>([]);
    const [loading, setLoading] = useState(true);
    const { playSong, currentSong, isPlaying } = useMusic();

    // Load radio stations on mount
    useEffect(() => {
        const loadRadioStations = async () => {
            try {
                setLoading(true);
                const stations = await RadioAPI.getTopRadioStations(15);
                setRadioStations(stations);
            } catch (error) {
                console.error('❌ Error loading radio stations:', error);
            } finally {
                setLoading(false);
            }
        };

        loadRadioStations();
    }, []);

    const handlePlayRadio = async (station: RadioAPI.RadioStation) => {
        try {
            // Track the click
            await RadioAPI.clickStation(station.stationuuid);

            // Play the radio station
            playSong({
                id: station.stationuuid,
                title: station.name,
                artist: `${station.country} • ${station.language}`,
                cover: station.favicon || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=400&auto=format&fit=crop',
                audioUrl: station.url_resolved || station.url,
                album: 'Live Radio',
                duration: 'LIVE',
                size: `${station.bitrate}kbps`,
                quality: station.codec || 'streaming',
            });
        } catch (error) {
            console.error('❌ Error playing radio:', error);
        }
    };

    const formatListeners = (votes: number): string => {
        if (votes >= 1000) {
            return `${(votes / 1000).toFixed(1)}K`;
        }
        return votes.toString();
    };

    return (
        <LinearGradient
            colors={['#1e3a8a', '#0e7490', '#000000']}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Live & Podcasts</Text>

                {/* Tab Switcher */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'live' && styles.activeTab]}
                        onPress={() => setActiveTab('live')}
                    >
                        <Ionicons
                            name="radio"
                            size={18}
                            color={activeTab === 'live' ? '#ffffff' : '#94a3b8'}
                        />
                        <Text style={[styles.tabText, activeTab === 'live' && styles.activeTabText]}>
                            Live
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
                </View>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {activeTab === 'live' ? (
                    // Live Streams Tab
                    <>
                        <Text style={styles.sectionTitle}>🔴 Live Radio Stations</Text>
                        <Text style={styles.sectionSubtitle}>Tune in to real radio from around the world</Text>

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#67e8f9" />
                                <Text style={styles.loadingText}>Loading stations...</Text>
                            </View>
                        ) : (
                            <>
                                {radioStations.map((station) => {
                                    const currentlyPlaying = currentSong?.id === station.stationuuid;

                                    return (
                                        <TouchableOpacity
                                            key={station.stationuuid}
                                            style={[
                                                styles.liveStationCard,
                                                currentlyPlaying && styles.activeStationCard
                                            ]}
                                            onPress={() => handlePlayRadio(station)}
                                        >
                                            <Image
                                                source={{
                                                    uri: station.favicon || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=400&auto=format&fit=crop'
                                                }}
                                                style={styles.stationCover}
                                            />

                                            <View style={styles.stationInfo}>
                                                <View style={styles.stationHeader}>
                                                    <Text style={styles.stationName} numberOfLines={1}>
                                                        {station.name}
                                                    </Text>
                                                    <View style={styles.liveBadge}>
                                                        <View style={styles.liveDot} />
                                                        <Text style={styles.liveText}>LIVE</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.stationMetadata}>
                                                    <Text style={styles.stationCountry} numberOfLines={1}>
                                                        {station.country} • {station.codec}
                                                    </Text>
                                                </View>

                                                <View style={styles.listenersRow}>
                                                    <Ionicons name="heart" size={14} color="#94a3b8" />
                                                    <Text style={styles.listenersText}>
                                                        {formatListeners(station.votes)} votes
                                                    </Text>
                                                </View>
                                            </View>

                                            <TouchableOpacity
                                                style={[
                                                    styles.playButton,
                                                    currentlyPlaying && styles.activePlayButton
                                                ]}
                                                onPress={() => handlePlayRadio(station)}
                                            >
                                                <Ionicons
                                                    name={currentlyPlaying && isPlaying ? "pause" : "play"}
                                                    size={24}
                                                    color="#ffffff"
                                                />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    );
                                })}

                                {/* Discover More */}
                                <TouchableOpacity style={styles.discoverCard}>
                                    <LinearGradient
                                        colors={['#ec4899', '#8b5cf6']}
                                        style={styles.discoverGradient}
                                    >
                                        <Ionicons name="sparkles" size={32} color="#ffffff" />
                                        <Text style={styles.discoverTitle}>30,000+ Radio Stations</Text>
                                        <Text style={styles.discoverSubtitle}>Powered by RadioBrowser API</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
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
});
