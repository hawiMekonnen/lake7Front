import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  locationText: {
    color: '#000000',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 20,
  },
  servicesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  serviceTouchable: {
    flex: 1,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  loginText: {
    color: '#2563eb',
    fontSize: 16,
  },
  iconContainer: {
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  signupButton: {
    backgroundColor: '#2563eb',
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBackButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  modalBackText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  loginSuccessBox: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    marginBottom: 10,
  },
  loginSuccessTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8,
  },
  loginSuccessMessage: {
    fontSize: 16,
    color: '#166534',
    textAlign: 'center',
    marginBottom: 16,
  },
  loginSuccessButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  loginSuccessButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signupText: {
    color: 'white',
    fontSize: 16,
  },
  modalFooter: {
    marginTop: 16,
    alignItems: 'center',
  },
  modalLinkText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
});