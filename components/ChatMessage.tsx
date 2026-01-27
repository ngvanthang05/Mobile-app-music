import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
    message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.sender === 'user';

    return (
        <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
            {/* Avatar */}
            {!isUser && (
                <View style={styles.avatarContainer}>
                    <LinearGradient
                        colors={['#0891b2', '#1e40af']}
                        style={styles.avatar}
                    >
                        <Ionicons name="musical-notes" size={16} color="white" />
                    </LinearGradient>
                </View>
            )}

            {/* Message Bubble */}
            {isUser ? (
                <LinearGradient
                    colors={['#0891b2', '#1e40af']}
                    style={[styles.bubble, styles.userBubble]}
                >
                    <Text style={styles.userText}>{message.content}</Text>
                    <Text style={styles.timestamp}>
                        {formatTime(message.timestamp)}
                    </Text>
                </LinearGradient>
            ) : (
                <View style={[styles.bubble, styles.aiBubble]}>
                    <Text style={styles.aiText}>{message.content}</Text>
                    <Text style={styles.timestamp}>
                        {formatTime(message.timestamp)}
                    </Text>
                </View>
            )}

            {/* User Avatar */}
            {isUser && (
                <View style={styles.avatarContainer}>
                    <LinearGradient
                        colors={['#ec4899', '#8b5cf6']}
                        style={styles.avatar}
                    >
                        <Ionicons name="person" size={16} color="white" />
                    </LinearGradient>
                </View>
            )}
        </View>
    );
}

function formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    aiContainer: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        marginHorizontal: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bubble: {
        maxWidth: '70%',
        borderRadius: 16,
        padding: 12,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomLeftRadius: 4,
    },
    userText: {
        color: 'white',
        fontSize: 15,
        lineHeight: 20,
    },
    aiText: {
        color: 'white',
        fontSize: 15,
        lineHeight: 20,
    },
    timestamp: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        marginTop: 4,
    },
});
