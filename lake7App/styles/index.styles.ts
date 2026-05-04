import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50 for a professional feel
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60, // Increased for status bar
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

  },
  appTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1E40AF', // Deep blue
    letterSpacing: -1.5,
    fontStyle: 'italic',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    color: '#64748B', // Slate 500
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B', // Slate 800
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 32,
  },
  servicesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  serviceTouchable: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '600',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles kept but updated for consistency
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    width: '100%',
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
    color: '#1E293B',
    textAlign: 'left',
  },
  input: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  signupButton: {
    backgroundColor: '#2563eb',
    marginTop: 12,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalBackButton: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  loginSuccessBox: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F0FDF4',
    borderRadius: 24,
    marginBottom: 16,
  },
  loginSuccessTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 8,
  },
  loginSuccessMessage: {
    fontSize: 16,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  loginSuccessButton: {
    backgroundColor: '#166534',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  loginSuccessButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  signupText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  modalFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  modalLinkText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '700',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  quickActionItem: {
    alignItems: 'center',
    width: '23%',
  },
  quickActionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  mapModalContent: {
    backgroundColor: 'white',
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: 'white',
    zIndex: 10,
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});