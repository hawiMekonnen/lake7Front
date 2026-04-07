import { StyleSheet} from "react-native";

export const discountCardStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#3b82f6', 
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 140,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  discountText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  subtitle: {
    color: '#e0f2fe',
    fontSize: 14,
    marginTop: 8,
  },
  foodImage: {
    width: 120,
    height: 120,
    marginRight: -20,
  },
});