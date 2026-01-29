import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Share,
    Alert,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LiveAPI from '../api/liveApi';

interface LivestreamViewerProps {
    visible: boolean;
    room: LiveAPI.LiveRoom | null;
    onClose: () => void;
}

// Virtual gifts
const GIFTS = [
    { id: '1', name: 'Tim', icon: '❤️', coins: 10 },
    { id: '2', name: 'Hoa hồng', icon: '🌹', coins: 50 },
    { id: '3', name: 'Bánh ngọt', icon: '🎂', coins: 100 },
    { id: '4', name: 'Kim cương', icon: '💎', coins: 500 },
    { id: '5', name: 'Vương miện', icon: '👑', coins: 1000 },
    { id: '6', name: 'Pháo hoa', icon: '🎆', coins: 2000 },
];

export default function LivestreamViewer({ visible, room, onClose }: LivestreamViewerProps) {
    const [viewerCount] = useState(Math.floor(Math.random() * 500) + 100);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showGiftModal, setShowGiftModal] = useState(false);

    // Handle share
    const handleShare = async () => {
        try {
            await Share.share({
                message: `Xem livestream "${room?.roomTitle}" của ${room?.streamerName || 'streamer'} ngay! 🎵`,
                title: 'Chia sẻ Livestream',
            });
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chia sẻ');
        }
    };

    // Handle send gift
    const handleSendGift = (gift: typeof GIFTS[0]) => {
        setShowGiftModal(false);
        Alert.alert(
            'Đã gửi quà! 🎁',
            `Bạn đã tặng ${gift.icon} ${gift.name} (${gift.coins} coins) cho ${room?.streamerName}`,
            [{ text: 'OK' }]
        );
        // TODO: Implement actual gift sending logic with backend
    };

    if (!visible || !room) return null;

    return (
        <Modal visible={visible} animationType="slide" statusBarTranslucent>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                {/* Placeholder for video stream */}
                <LinearGradient
                    colors={['#1e293b', '#0f172a']}
                    style={styles.videoPlaceholder}
                >
                    <Ionicons name="videocam" size={64} color="#475569" />
                    <Text style={styles.placeholderText}>
                        Video stream sẽ hiển thị ở đây
                    </Text>
                    <Text style={styles.placeholderSubtext}>
                        (Cần tích hợp real-time streaming service)
                    </Text>
                </LinearGradient>

                {/* Top Overlay */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'transparent']}
                    style={styles.topOverlay}
                    pointerEvents="box-none"
                >
                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>

                    {/* Live indicator and info */}
                    <View style={styles.liveInfo}>
                        <View style={styles.liveBadge}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                        <View style={styles.viewerContainer}>
                            <Ionicons name="eye" size={16} color="#fff" />
                            <Text style={styles.viewerText}>
                                {viewerCount.toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    {/* Streamer info */}
                    <View style={styles.streamerInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {(room.streamerName || room.streamer || 'U').charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.streamerDetails}>
                            <Text style={styles.streamerName}>
                                {room.streamerName || room.streamer || 'Unknown Streamer'}
                            </Text>
                            <Text style={styles.roomTitle} numberOfLines={2}>
                                {room.roomTitle || 'Livestream'}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Bottom Controls */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.bottomOverlay}
                    pointerEvents="box-none"
                >
                    <View style={styles.controls}>
                        {/* Follow button */}
                        <TouchableOpacity
                            style={[
                                styles.controlButton,
                                isFollowing && styles.followingButton
                            ]}
                            onPress={() => setIsFollowing(!isFollowing)}
                        >
                            <Ionicons
                                name={isFollowing ? 'heart' : 'heart-outline'}
                                size={28}
                                color={isFollowing ? '#ef4444' : '#fff'}
                            />
                            <Text style={styles.controlLabel}>
                                {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                            </Text>
                        </TouchableOpacity>

                        {/* Share button */}
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={handleShare}
                        >
                            <Ionicons name="share-outline" size={28} color="#fff" />
                            <Text style={styles.controlLabel}>Chia sẻ</Text>
                        </TouchableOpacity>

                        {/* Gift button */}
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => setShowGiftModal(true)}
                        >
                            <Ionicons name="gift-outline" size={28} color="#fff" />
                            <Text style={styles.controlLabel}>Quà tặng</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            {/* Gift Modal */}
            <Modal
                visible={showGiftModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowGiftModal(false)}
            >
                <View style={styles.giftModalOverlay}>
                    <View style={styles.giftModalContent}>
                        <View style={styles.giftModalHeader}>
                            <Text style={styles.giftModalTitle}>Chọn quà tặng 🎁</Text>
                            <TouchableOpacity onPress={() => setShowGiftModal(false)}>
                                <Ionicons name="close" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.giftList}>
                            {GIFTS.map((gift) => (
                                <TouchableOpacity
                                    key={gift.id}
                                    style={styles.giftItem}
                                    onPress={() => handleSendGift(gift)}
                                >
                                    <Text style={styles.giftIcon}>{gift.icon}</Text>
                                    <View style={styles.giftInfo}>
                                        <Text style={styles.giftName}>{gift.name}</Text>
                                        <View style={styles.giftPrice}>
                                            <Ionicons name="logo-bitcoin" size={14} color="#fbbf24" />
                                            <Text style={styles.giftCoins}>{gift.coins} coins</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#64748b" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.giftModalClose}
                            onPress={() => setShowGiftModal(false)}
                        >
                            <Text style={styles.giftModalCloseText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    placeholderText: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
    },
    placeholderSubtext: {
        color: '#64748b',
        fontSize: 13,
    },
    topOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 8,
    },
    liveInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 12,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    liveText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    viewerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    viewerText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    streamerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ec4899',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    streamerDetails: {
        flex: 1,
    },
    streamerName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    roomTitle: {
        color: '#cbd5e1',
        fontSize: 14,
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 40,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    controlButton: {
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        minWidth: 100,
    },
    followingButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    controlLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    // Gift Modal Styles
    giftModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'flex-end',
    },
    giftModalContent: {
        backgroundColor: '#1e293b',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    giftModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    giftModalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    giftList: {
        padding: 16,
    },
    giftItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    giftIcon: {
        fontSize: 40,
        marginRight: 16,
    },
    giftInfo: {
        flex: 1,
    },
    giftName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    giftPrice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    giftCoins: {
        color: '#fbbf24',
        fontSize: 14,
        fontWeight: '600',
    },
    giftModalClose: {
        marginHorizontal: 20,
        marginTop: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    giftModalCloseText: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '600',
    },
});
