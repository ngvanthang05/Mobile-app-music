import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Alert,
    Dimensions,
    Animated,
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as LiveAPI from '../api/liveApi';

const { width, height } = Dimensions.get('window');

interface CameraBroadcastProps {
    visible: boolean;
    onClose: () => void;
    roomTitle: string;
    viewerCount: number;
    onViewerCountChange?: (count: number) => void;
}

export default function CameraBroadcast({
    visible,
    onClose,
    roomTitle,
    viewerCount,
    onViewerCountChange,
}: CameraBroadcastProps) {
    const [facing, setFacing] = useState<CameraType>('front');
    const [permission, requestPermission] = useCameraPermissions();
    const [isMuted, setIsMuted] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [duration, setDuration] = useState(0);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Recording states
    const cameraRef = useRef<CameraView>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
    const recordingRef = useRef<{ stopRecording: () => void } | null>(null);

    // Pulsing animation for LIVE indicator
    useEffect(() => {
        if (isLive) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.3,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [isLive]);

    // Timer for broadcast duration
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isLive) {
            interval = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isLive]);

    // Simulate viewer count changes
    useEffect(() => {
        if (!isLive) return;

        const interval = setInterval(() => {
            const change = Math.random() > 0.5 ? 1 : -1;
            const newCount = Math.max(0, viewerCount + change);
            onViewerCountChange?.(newCount);
        }, 3000);

        return () => clearInterval(interval);
    }, [isLive, viewerCount]);

    // Camera ready handler
    const handleCameraReady = () => {
        console.log('✅ Camera is ready!');
        setCameraReady(true);
    };

    // TODO: Recording feature disabled due to expo-camera bug
    // Bug: Camera reports "not ready" even after onCameraReady callback fires
    // This happens consistently across multiple attempts and delays
    // Keep this code for future when expo-camera fixes the bug
    // Issue: https://github.com/expo/expo/issues/...

    // Start recording manually
    const startRecording = async () => {
        if (!cameraRef.current) {
            console.warn('Cannot start recording - no camera ref');
            return;
        }

        if (!isLive) {
            Alert.alert('Chưa phát sóng', 'Vui lòng bắt đầu phát sóng trước khi ghi hình');
            return;
        }

        try {
            console.log('🎥 Starting manual recording...');
            setIsRecording(true);
            const recording = await cameraRef.current.recordAsync();
            recordingRef.current = recording as any;
            console.log('✅ Recording started successfully');
            Alert.alert('Đang ghi', 'Video đang được ghi hình');
        } catch (error: any) {
            console.error('❌ Recording error:', error.message);
            setIsRecording(false);
            Alert.alert('Lỗi', 'Không thể ghi hình. Camera có thể chưa sẵn sàng, vui lòng thử lại sau vài giây.');
        }
    };

    // Stop recording and save
    const stopRecording = async () => {
        if (!cameraRef.current || !isRecording) return;

        try {
            cameraRef.current.stopRecording();
            setIsRecording(false);
        } catch (error) {
            console.error('Stop recording error:', error);
        }
    };

    // Save recording to device
    const saveRecording = async (videoUri: string) => {
        try {
            // Request media library permission if needed
            if (!mediaPermission?.granted) {
                const result = await requestMediaPermission();
                if (!result.granted) {
                    Alert.alert('Lỗi', 'Cần quyền truy cập thư viện để lưu video');
                    return;
                }
            }

            // Save to device gallery
            const asset = await MediaLibrary.createAssetAsync(videoUri);

            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(videoUri);
            const fileSize = (fileInfo as any).size || 0;

            // Save metadata to AsyncStorage
            const recording: LiveAPI.LivestreamRecording = {
                recordingId: Date.now().toString(),
                roomTitle: roomTitle,
                videoUri: asset.uri,
                duration: duration,
                recordedAt: new Date().toISOString(),
                fileSize: fileSize,
            };

            await LiveAPI.liveApi.saveRecording(recording);
            Alert.alert('Thành công', 'Video đã được lưu vào thư viện');
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Lỗi', 'Không thể lưu video');
        }
    };

    // Start broadcast
    const startBroadcast = () => {
        if (!roomTitle.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề phòng');
            return;
        }
        if (!permission?.granted) {
            Alert.alert('Lỗi', 'Vui lòng cấp quyền camera');
            return;
        }
        console.log('Starting broadcast, camera ready:', cameraReady);
        setIsLive(true);
    };

    // End broadcast
    const endBroadcast = () => {
        Alert.alert(
            'Kết thúc phát sóng',
            'Bạn có chắc muốn kết thúc phát sóng trực tiếp?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Kết thúc',
                    style: 'destructive',
                    onPress: async () => {
                        // Stop recording if active
                        if (isRecording) {
                            await stopRecording();
                        }
                        setIsLive(false);
                        setDuration(0);
                        setCameraReady(false);
                        onClose();
                    },
                },
            ]
        );
    };

    // Toggle camera
    const toggleCameraFacing = () => {
        setFacing((current: CameraType) => (current === 'back' ? 'front' : 'back'));
    };

    // Format duration (HH:MM:SS)
    const formatDuration = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins
            .toString()
            .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" statusBarTranslucent>
            <View style={styles.container}>
                {permission?.granted ? (
                    <>
                        <CameraView
                            style={styles.camera}
                            facing={facing}
                            ref={cameraRef}
                            onCameraReady={handleCameraReady}
                        />

                        {/* Top Overlay */}
                        <LinearGradient
                            colors={['rgba(0,0,0,0.7)', 'transparent']}
                            style={styles.topOverlay}
                            pointerEvents="box-none"
                        >
                            {/* Close button */}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={endBroadcast}
                            >
                                <Ionicons name="close" size={28} color="#fff" />
                            </TouchableOpacity>

                            {/* Live indicator and info */}
                            {isLive && (
                                <View style={styles.liveInfo}>
                                    <View style={styles.liveBadge}>
                                        <Animated.View
                                            style={[
                                                styles.liveDot,
                                                { transform: [{ scale: pulseAnim }] },
                                            ]}
                                        />
                                        <Text style={styles.liveText}>LIVE</Text>
                                    </View>
                                    <Text style={styles.durationText}>
                                        {formatDuration(duration)}
                                    </Text>

                                    {/* Recording indicator */}
                                    {isRecording && (
                                        <View style={styles.recordingBadge}>
                                            <View style={styles.recordingDot} />
                                            <Text style={styles.recordingText}>REC</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Room title */}
                            <View style={styles.titleContainer}>
                                <Text style={styles.titleText} numberOfLines={2}>
                                    {roomTitle}
                                </Text>
                            </View>

                            {/* Viewer count */}
                            {isLive && (
                                <View style={styles.viewerContainer}>
                                    <Ionicons name="eye" size={16} color="#fff" />
                                    <Text style={styles.viewerText}>
                                        {viewerCount.toLocaleString()}
                                    </Text>
                                </View>
                            )}
                        </LinearGradient>

                        {/* Bottom Controls */}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={styles.bottomOverlay}
                            pointerEvents="box-none"
                        >
                            <View style={styles.controls}>
                                {isLive ? (
                                    <>
                                        {/* Flip camera */}
                                        <TouchableOpacity
                                            style={styles.controlButton}
                                            onPress={toggleCameraFacing}
                                        >
                                            <Ionicons
                                                name="camera-reverse"
                                                size={28}
                                                color="#fff"
                                            />
                                            <Text style={styles.controlLabel}>Lật</Text>
                                        </TouchableOpacity>

                                        {/* Record/Stop Recording - DISABLED DUE TO EXPO-CAMERA BUG */}
                                        {/* TODO: Re-enable when expo-camera fixes "not ready" bug */}
                                        {/* <TouchableOpacity
                                            style={[
                                                styles.controlButton,
                                                isRecording && styles.recordingButton
                                            ]}
                                            onPress={isRecording ? stopRecording : startRecording}
                                        >
                                            <Ionicons
                                                name={isRecording ? 'stop-circle' : 'radio-button-on'}
                                                size={28}
                                                color={isRecording ? '#fff' : '#ef4444'}
                                            />
                                            <Text style={styles.controlLabel}>
                                                {isRecording ? 'Dừng ghi' : 'Ghi hình'}
                                            </Text>
                                        </TouchableOpacity> */}

                                        {/* Mute/Unmute */}
                                        <TouchableOpacity
                                            style={styles.controlButton}
                                            onPress={() => setIsMuted(!isMuted)}
                                        >
                                            <Ionicons
                                                name={isMuted ? 'mic-off' : 'mic'}
                                                size={28}
                                                color={isMuted ? '#ef4444' : '#fff'}
                                            />
                                            <Text style={styles.controlLabel}>
                                                {isMuted ? 'Tắt mic' : 'Bật mic'}
                                            </Text>
                                        </TouchableOpacity>

                                        {/* End broadcast */}
                                        <TouchableOpacity
                                            style={[
                                                styles.controlButton,
                                                styles.endButton,
                                            ]}
                                            onPress={endBroadcast}
                                        >
                                            <Ionicons
                                                name="close-circle"
                                                size={28}
                                                color="#fff"
                                            />
                                            <Text style={styles.controlLabel}>
                                                Kết thúc
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        {/* Start broadcast button */}
                                        <TouchableOpacity
                                            style={styles.startButton}
                                            onPress={startBroadcast}
                                        >
                                            <LinearGradient
                                                colors={['#ec4899', '#8b5cf6']}
                                                style={styles.startGradient}
                                            >
                                                <Ionicons
                                                    name="radio"
                                                    size={32}
                                                    color="#fff"
                                                />
                                                <Text style={styles.startText}>
                                                    Bắt đầu phát sóng
                                                </Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </LinearGradient>
                    </>
                ) : (
                    // Permission not granted
                    <View style={styles.permissionContainer}>
                        <Ionicons name="camera-outline" size={64} color="#94a3b8" />
                        <Text style={styles.permissionTitle}>
                            Cần quyền truy cập Camera
                        </Text>
                        <Text style={styles.permissionText}>
                            Để phát sóng trực tiếp, bạn cần cấp quyền truy cập camera
                            và microphone.
                        </Text>
                        <TouchableOpacity
                            style={styles.permissionButton}
                            onPress={requestPermission}
                        >
                            <Text style={styles.permissionButtonText}>
                                Cấp quyền
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
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
        fontSize: 13,
        fontWeight: 'bold',
    },
    durationText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
    },
    titleContainer: {
        marginTop: 16,
    },
    titleText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    viewerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    viewerText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
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
        gap: 6,
        padding: 12,
    },
    controlLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    endButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
        borderRadius: 16,
    },
    startButton: {
        borderRadius: 50,
        overflow: 'hidden',
        width: '80%',
        alignSelf: 'center',
    },
    startGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 32,
        gap: 12,
    },
    startText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#1e293b',
    },
    permissionTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 24,
        textAlign: 'center',
    },
    permissionText: {
        color: '#94a3b8',
        fontSize: 15,
        marginTop: 12,
        textAlign: 'center',
        lineHeight: 22,
    },
    permissionButton: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 32,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        marginTop: 16,
        padding: 12,
    },
    cancelButtonText: {
        color: '#94a3b8',
        fontSize: 15,
    },
    // Recording styles
    recordToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 12,
        gap: 8,
    },
    recordToggleText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
    },
    recordToggleTextActive: {
        color: '#ef4444',
    },
    recordingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    recordingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    recordingButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
    },
});
