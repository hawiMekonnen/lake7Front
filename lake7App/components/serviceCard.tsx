// components/serviceCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { serviceCardStyles } from '../styles/serviceCard.styles';

type ServiceCardProps = {
  title: string;
  image: any;
  onPress: () => void;
};

export const ServiceCard = ({ title, image, onPress }: ServiceCardProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={serviceCardStyles.card}>
        <Image source={image} style={serviceCardStyles.image} resizeMode="contain" />
        <View style={serviceCardStyles.overlay}>
          <Text style={serviceCardStyles.title}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
