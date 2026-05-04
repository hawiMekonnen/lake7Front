import { StyleSheet } from "react-native";

export const serviceCardStyles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  card: {
    height: 220, // Slightly taller
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  decorCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    opacity: 0.8,
  },
  image: {
    width: '100%',
    height: '55%',
    marginTop: 10,
  },
  contentContainer: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#1E40AF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  arrowContainer: {
    marginTop: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});