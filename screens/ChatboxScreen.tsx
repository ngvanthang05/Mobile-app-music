// import React, { useState, useRef, useEffect } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TextInput,
//     TouchableOpacity,
//     ScrollView,
//     KeyboardAvoidingView,
//     Platform,
//     ActivityIndicator,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ChatMessage from '../components/ChatMessage';
// import { ChatMessage as ChatMessageType } from '../types';
// import { sendMessageToAI, getMusicPrompts, resetChatSession } from '../api/aiApi';

// const STORAGE_KEY = '@music_app_chat_history';

// export default function ChatboxScreen() {
//     const [messages, setMessages] = useState<ChatMessageType[]>([]);
//     const [inputText, setInputText] = useState('');
//     const [isTyping, setIsTyping] = useState(false);
//     const scrollViewRef = useRef<ScrollView>(null);

//     // Load chat history on mount
//     useEffect(() => {
//         loadChatHistory();
//     }, []);

//     // Save chat history whenever messages change
//     useEffect(() => {
//         saveChatHistory();
//     }, [messages]);

//     // Auto scroll to bottom when new messages arrive
//     useEffect(() => {
//         setTimeout(() => {
//             scrollViewRef.current?.scrollToEnd({ animated: true });
//         }, 100);
//     }, [messages]);

//     const loadChatHistory = async () => {
//         try {
//             const stored = await AsyncStorage.getItem(STORAGE_KEY);
//             if (stored) {
//                 const parsed = JSON.parse(stored);
//                 // Convert timestamp strings back to Date objects
//                 const messagesWithDates = parsed.map((msg: any) => ({
//                     ...msg,
//                     timestamp: new Date(msg.timestamp),
//                 }));
//                 setMessages(messagesWithDates);
//             }
//         } catch (error) {
//             console.error('Error loading chat history:', error);
//         }
//     };

//     const saveChatHistory = async () => {
//         try {
//             await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
//         } catch (error) {
//             console.error('Error saving chat history:', error);
//         }
//     };

//     const handleSend = async () => {
//         if (!inputText.trim()) return;

//         const userMessage: ChatMessageType = {
//             id: Date.now().toString(),
//             content: inputText.trim(),
//             sender: 'user',
//             timestamp: new Date(),
//         };

//         setMessages((prev) => [...prev, userMessage]);
//         setInputText('');
//         setIsTyping(true);

//         try {
//             const aiResponse = await sendMessageToAI(userMessage.content);

//             const aiMessage: ChatMessageType = {
//                 id: (Date.now() + 1).toString(),
//                 content: aiResponse,
//                 sender: 'ai',
//                 timestamp: new Date(),
//             };

//             setMessages((prev) => [...prev, aiMessage]);
//         } catch (error) {
//             console.error('Error getting AI response:', error);

//             const errorMessage: ChatMessageType = {
//                 id: (Date.now() + 1).toString(),
//                 content: 'Sorry, I encountered an error. Please try again! 🎵',
//                 sender: 'ai',
//                 timestamp: new Date(),
//             };

//             setMessages((prev) => [...prev, errorMessage]);
//         } finally {
//             setIsTyping(false);
//         }
//     };

//     const handleQuickPrompt = (prompt: string) => {
//         setInputText(prompt);
//     };

//     const handleClearChat = async () => {
//         setMessages([]);
//         resetChatSession();
//         await AsyncStorage.removeItem(STORAGE_KEY);
//     };

//     const prompts = getMusicPrompts();

//     return (
//         <LinearGradient colors={['#1e3a8a', '#0e7490', '#000000']} style={styles.container}>
//             <KeyboardAvoidingView
//                 style={styles.keyboardView}
//                 behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//                 keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//             >
//                 {/* Header */}
//                 <View style={styles.header}>
//                     <View style={styles.headerLeft}>
//                         <LinearGradient colors={['#0891b2', '#1e40af']} style={styles.headerIcon}>
//                             <Ionicons name="musical-notes" size={24} color="white" />
//                         </LinearGradient>
//                         <View>
//                             <Text style={styles.headerTitle}>Music Assistant</Text>
//                             <Text style={styles.headerSubtitle}>AI-powered music helper 🎵</Text>
//                         </View>
//                     </View>
//                     <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
//                         <Ionicons name="trash-outline" size={22} color="#67e8f9" />
//                     </TouchableOpacity>
//                 </View>

//                 {/* Messages List */}
//                 <ScrollView
//                     ref={scrollViewRef}
//                     style={styles.messagesContainer}
//                     contentContainerStyle={styles.messagesContent}
//                     showsVerticalScrollIndicator={false}
//                 >
//                     {messages.length === 0 ? (
//                         <View style={styles.emptyState}>
//                             <Ionicons name="chatbubbles-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
//                             <Text style={styles.emptyTitle}>Start a conversation!</Text>
//                             <Text style={styles.emptySubtitle}>
//                                 Ask me anything about music, get recommendations, or discover new artists!
//                             </Text>

//                             {/* Quick Prompts */}
//                             <View style={styles.quickPromptsContainer}>
//                                 <Text style={styles.quickPromptsTitle}>Try asking:</Text>
//                                 {prompts.map((prompt, index) => (
//                                     <TouchableOpacity
//                                         key={index}
//                                         style={styles.quickPromptButton}
//                                         onPress={() => handleQuickPrompt(prompt)}
//                                     >
//                                         <LinearGradient
//                                             colors={['rgba(8, 145, 178, 0.3)', 'rgba(30, 64, 175, 0.3)']}
//                                             style={styles.quickPromptGradient}
//                                         >
//                                             <Text style={styles.quickPromptText}>{prompt}</Text>
//                                         </LinearGradient>
//                                     </TouchableOpacity>
//                                 ))}
//                             </View>
//                         </View>
//                     ) : (
//                         <>
//                             {messages.map((message) => (
//                                 <ChatMessage key={message.id} message={message} />
//                             ))}

//                             {/* Typing Indicator */}
//                             {isTyping && (
//                                 <View style={styles.typingContainer}>
//                                     <View style={styles.typingBubble}>
//                                         <ActivityIndicator size="small" color="#67e8f9" />
//                                         <Text style={styles.typingText}>AI is typing...</Text>
//                                     </View>
//                                 </View>
//                             )}
//                         </>
//                     )}
//                 </ScrollView>

//                 {/* Input Area */}
//                 <View style={styles.inputContainer}>
//                     <View style={styles.inputWrapper}>
//                         <TextInput
//                             style={styles.input}
//                             placeholder="Ask about music..."
//                             placeholderTextColor="rgba(255, 255, 255, 0.5)"
//                             value={inputText}
//                             onChangeText={setInputText}
//                             multiline
//                             maxLength={500}
//                         />
//                         <TouchableOpacity
//                             onPress={handleSend}
//                             disabled={!inputText.trim() || isTyping}
//                             style={[
//                                 styles.sendButton,
//                                 (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
//                             ]}
//                         >
//                             <LinearGradient
//                                 colors={
//                                     inputText.trim() && !isTyping
//                                         ? ['#0891b2', '#1e40af']
//                                         : ['rgba(148, 163, 184, 0.5)', 'rgba(148, 163, 184, 0.5)']
//                                 }
//                                 style={styles.sendButtonGradient}
//                             >
//                                 <Ionicons name="send" size={20} color="white" />
//                             </LinearGradient>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </KeyboardAvoidingView>
//         </LinearGradient>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     keyboardView: {
//         flex: 1,
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingTop: 56,
//         paddingHorizontal: 20,
//         paddingBottom: 16,
//     },
//     headerLeft: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     headerIcon: {
//         width: 48,
//         height: 48,
//         borderRadius: 24,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 12,
//     },
//     headerTitle: {
//         color: 'white',
//         fontSize: 20,
//         fontWeight: '600',
//     },
//     headerSubtitle: {
//         color: '#67e8f9',
//         fontSize: 12,
//         marginTop: 2,
//     },
//     clearButton: {
//         padding: 8,
//     },
//     messagesContainer: {
//         flex: 1,
//     },
//     messagesContent: {
//         paddingVertical: 16,
//         paddingBottom: 100,
//     },
//     emptyState: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingHorizontal: 32,
//         paddingTop: 40,
//     },
//     emptyTitle: {
//         color: 'white',
//         fontSize: 24,
//         fontWeight: '600',
//         marginTop: 16,
//     },
//     emptySubtitle: {
//         color: '#67e8f9',
//         fontSize: 14,
//         textAlign: 'center',
//         marginTop: 8,
//         lineHeight: 20,
//     },
//     quickPromptsContainer: {
//         width: '100%',
//         marginTop: 32,
//     },
//     quickPromptsTitle: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '600',
//         marginBottom: 12,
//     },
//     quickPromptButton: {
//         marginBottom: 8,
//     },
//     quickPromptGradient: {
//         borderRadius: 12,
//         padding: 14,
//         borderWidth: 1,
//         borderColor: 'rgba(103, 232, 249, 0.2)',
//     },
//     quickPromptText: {
//         color: 'white',
//         fontSize: 14,
//     },
//     typingContainer: {
//         paddingHorizontal: 16,
//         marginBottom: 16,
//     },
//     typingBubble: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: 'rgba(255, 255, 255, 0.1)',
//         borderRadius: 16,
//         padding: 12,
//         alignSelf: 'flex-start',
//         marginLeft: 48,
//     },
//     typingText: {
//         color: '#67e8f9',
//         fontSize: 14,
//         marginLeft: 8,
//     },
//     inputContainer: {
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         paddingBottom: 100,
//         backgroundColor: 'rgba(0, 0, 0, 0.3)',
//     },
//     inputWrapper: {
//         flexDirection: 'row',
//         alignItems: 'flex-end',
//         backgroundColor: 'rgba(255, 255, 255, 0.1)',
//         borderRadius: 24,
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//     },
//     input: {
//         flex: 1,
//         color: 'white',
//         fontSize: 15,
//         maxHeight: 100,
//         paddingVertical: 8,
//     },
//     sendButton: {
//         marginLeft: 8,
//     },
//     sendButtonDisabled: {
//         opacity: 0.5,
//     },
//     sendButtonGradient: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
// });
