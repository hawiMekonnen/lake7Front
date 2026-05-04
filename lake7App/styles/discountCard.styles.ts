import { StyleSheet} from "react-native";

export const discountCardStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#3b82f6', // Bright Blue
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 160,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    zIndex: 1, // Ensure text stays above images
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
    opacity: 0.9,
  },
  subtitle: {
    color: '#E0F2FE',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  foodImage: {
    width: 140,
    height: 140,
    marginRight: -25,
    marginBottom: -20, // Give it a dynamic pop-out feel
  },
});