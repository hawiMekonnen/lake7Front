import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { serviceCardStyles } from '../styles/serviceCard.styles';
import { Ionicons } from '@expo/vector-icons';

type ServiceCardProps = {
  title: string;
  subtitle?: string; // New subtitle prop
  image: any;
  onPress: () => void;
};

export const ServiceCard = ({ title, subtitle, image, onPress }: ServiceCardProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={serviceCardStyles.touchable}>
      <View style={serviceCardStyles.card}>
        {/* Background Decorative Circle */}
        <View style={serviceCardStyles.decorCircle} />

        <Image source={image} style={serviceCardStyles.image} resizeMode="contain" />

        <View style={serviceCardStyles.contentContainer}>
          <Text style={serviceCardStyles.title}>{title}</Text>
          {subtitle && <Text style={serviceCardStyles.subtitle}>{subtitle}</Text>}

          <View style={serviceCardStyles.arrowContainer}>
            <Ionicons name="arrow-forward" size={16} color="#1E40AF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
