import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const features = [
  { title: 'Ad-free listening', desc: 'Enjoy uninterrupted music', icon: 'musical-notes' },
  { title: 'Offline playback', desc: 'Download and listen anywhere', icon: 'download' },
  { title: 'High quality audio', desc: 'Experience crystal clear sound', icon: 'volume-high' },
  { title: 'Unlimited skips', desc: 'Skip as many songs as you want', icon: 'play-skip-forward' }
];

export default function PremiumScreen() {
  return (
    <LinearGradient
      colors={['#1e3a8a', '#0e7490', '#000000']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.headerTitle}>Premium</Text>

        {/* Premium Card */}
        <LinearGradient
          colors={['#0891b2', '#1e40af', '#581c87']}
          style={styles.premiumCard}
        >
          <Ionicons name="diamond" size={64} color="#fbbf24" />
          <Text style={styles.premiumTitle}>Go Premium</Text>
          <Text style={styles.premiumSubtitle}>
            Unlock unlimited music experience
          </Text>
          <TouchableOpacity 
            style={styles.subscribeButton} 
            activeOpacity={0.8}
          >
            <Text style={styles.subscribeButtonText}>Get Premium</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Features */}
        <Text style={styles.sectionTitle}>Premium Features</Text>
        <View style={styles.featuresContainer}>
          {features.map((feature, idx) => (
            <View key={idx} style={styles.featureCard}>
              <View style={styles.featureHeader}>
                <Ionicons name={feature.icon as any} size={24} color="#67e8f9" />
                <Text style={styles.featureTitle}>
                  {feature.title}
                </Text>
              </View>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  premiumCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  premiumTitle: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  premiumSubtitle: {
    color: '#cffafe', // cyan-100
    textAlign: 'center',
    marginBottom: 24,
  },
  subscribeButton: {
    backgroundColor: 'white',
    borderRadius: 9999,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  subscribeButtonText: {
    color: '#1e3a8a', // blue-900
    fontWeight: 'bold',
    fontSize: 18,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  featuresContainer: {
    // space-y-3 equivalent handled by marginBottom in featureCard
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    marginLeft: 12,
  },
  featureDesc: {
    color: '#67e8f9',
    fontSize: 14,
  },
});
