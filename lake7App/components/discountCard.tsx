import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { discountCardStyles } from '../styles/discountCard.styles';

export const DiscountCard = () => {
  return (
    <TouchableOpacity activeOpacity={0.9} style={discountCardStyles.container}>
      <View style={discountCardStyles.card}>
        <View style={discountCardStyles.content}>
          <Text style={discountCardStyles.discountText}>30% OFF</Text>
          <Text style={discountCardStyles.title}>On your first delivery</Text>
          <Text style={discountCardStyles.subtitle}>Use code: LAKE30</Text>
        </View>

        <Image
          source={require('../assets/images/burger.png')} // Change to your actual image
          style={discountCardStyles.foodImage}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
};
