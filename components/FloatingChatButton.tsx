import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const BUTTON_SIZE = 60;

interface FloatingChatButtonProps {
    onPress: () => void;
}

export default function FloatingChatButton({ onPress }: FloatingChatButtonProps) {
    const [pulseAnim] = useState(new Animated.Value(1));
    const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - BUTTON_SIZE - 20, y: SCREEN_HEIGHT - 150 })).current;

    useEffect(() => {
        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value,
                });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gesture) => {
                pan.flattenOffset();

                // Check if it was a tap (minimal movement)
                const isTap = Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5;
                if (isTap) {
                    onPress();
                }

                // Get current position
                const currentX = (pan.x as any)._value;
                const currentY = (pan.y as any)._value;

                // Snap to edges
                const snapToLeft = currentX < SCREEN_WIDTH / 2;
                const targetX = snapToLeft ? 20 : SCREEN_WIDTH - BUTTON_SIZE - 20;

                // Keep within vertical bounds
                let targetY = currentY;
                if (currentY < 60) targetY = 60; // Top safe area
                if (currentY > SCREEN_HEIGHT - 150) targetY = SCREEN_HEIGHT - 150; // Bottom above tab bar

                Animated.spring(pan, {
                    toValue: { x: targetX, y: targetY },
                    useNativeDriver: false,
                    friction: 7,
                }).start();
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateX: pan.x },
                        { translateY: pan.y },
                        { scale: pulseAnim },
                    ],
                },
            ]}
            {...panResponder.panHandlers}
        >
            <LinearGradient
                colors={['#0891b2', '#1e40af']}
                style={styles.button}
            >
                <Ionicons name="chatbubbles" size={28} color="white" />
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        zIndex: 1000,
    },
    button: {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0891b2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
