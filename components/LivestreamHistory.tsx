import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import * as LiveAPI from '../api/liveApi';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LivestreamHistory() {
    const [recordings, setRecordings] = useState<LiveAPI.LivestreamRecording[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<LiveAPI.LivestreamRecording | null>(null);

    // Load recordings on mount
    useEffect(() => {
        loadRecordings();
    }, []);

    const loadRecordings = async () => {
        try {
            setLoading(true);
            const data = await LiveAPI.liveApi.getRecordingHistory();
            setRecordings(data);
        } catch (error) {
            console.error('Error loading recordings:', error);
        } finally {
            setLoading(false);
        }
    };

    // Format file size
    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    };

    // Format duration
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Format date
    const formatDate = (isoString: string): string => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    // Delete recording
    const handleDelete = (recording: LiveAPI.LivestreamRecording) => {
        Alert.alert(
            'Xóa video',
            'Bạn có chắc muốn xóa video này khỏi lịch sử?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await LiveAPI.liveApi.deleteRecording(recording.recordingId);
                            loadRecordings();
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa video');
                        }
                    },
                },
            ]
        );
    };

    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Lịch sử phát sóng</Text>
                <Text style={styles.subtitle}>
                    {recordings.length} video đã lưu
                </Text>

                {loading ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="hourglass-outline" size={64} color="#475569" />
                        <Text style={styles.emptyText}>Đang tải...</Text>
                    </View>
                ) : recordings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="videocam-off" size={64} color="#475569" />
                        <Text style={styles.emptyTitle}>Chưa có video nào</Text>
                        <Text style={styles.emptyText}>
                            Các video livestream bạn ghi lại sẽ xuất hiện ở đây
                        </Text>
                    </View>
                ) : (
                    recordings.map((recording) => (
                        <TouchableOpacity
                            key={recording.recordingId}
                            style={styles.recordingCard}
                            onPress={() => setSelectedVideo(recording)}
                        >
                            <View style={styles.recordingIcon}>
                                <LinearGradient
                                    colors={['#ec4899', '#8b5cf6']}
                                    style={styles.iconGradient}
                                >
                                    <Ionicons name="videocam" size={28} color="#fff" />
                                </LinearGradient>
                            </View>

                            <View style={styles.recordingInfo}>
                                <Text style={styles.recordingTitle} numberOfLines={1}>
                                    {recording.roomTitle}
                                </Text>
                                <View style={styles.recordingMeta}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="time-outline" size={14} color="#94a3b8" />
                                        <Text style={styles.metaText}>
                                            {formatDuration(recording.duration)}
                                        </Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                                        <Text style={styles.metaText}>
                                            {formatDate(recording.recordedAt)}
                                        </Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="document-outline" size={14} color="#94a3b8" />
                                        <Text style={styles.metaText}>
                                            {formatFileSize(recording.fileSize)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDelete(recording)}
                            >
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Video Player Modal */}
            {selectedVideo && (
                <Modal
                    visible={true}
                    animationType="slide"
                    statusBarTranslucent
                    onRequestClose={() => setSelectedVideo(null)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setSelectedVideo(null)}
                            >
                                <Ionicons name="close" size={28} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle} numberOfLines={1}>
                                {selectedVideo.roomTitle}
                            </Text>
                        </View>

                        <Video
                            source={{ uri: selectedVideo.videoUri }}
                            style={styles.video}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay
                        />

                        <View style={styles.videoInfo}>
                            <View style={styles.infoRow}>
                                <Ionicons name="time-outline" size={18} color="#94a3b8" />
                                <Text style={styles.infoText}>
                                    Thời lượng: {formatDuration(selectedVideo.duration)}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
                                <Text style={styles.infoText}>
                                    {formatDate(selectedVideo.recordedAt)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 100,
    },
    title: {
        color: 'white',
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 8,
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 20,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        color: '#e2e8f0',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    recordingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    recordingIcon: {
        marginRight: 12,
    },
    iconGradient: {
        width: 56,
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordingInfo: {
        flex: 1,
    },
    recordingTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    recordingMeta: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: '#94a3b8',
        fontSize: 12,
    },
    deleteButton: {
        padding: 8,
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    closeButton: {
        padding: 8,
        marginRight: 12,
    },
    modalTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    video: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoInfo: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 20,
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        color: '#94a3b8',
        fontSize: 14,
    },
});
