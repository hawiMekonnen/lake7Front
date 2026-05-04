import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/context/AuthContext';
import { removeToken } from '../../src/utils/auth';
import { styles } from '@/styles/profile.style';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "User Name");
  const [email, setEmail] = useState(user?.email || "user@example.com");
  
  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "User Name");
      setEmail(user.email || "user@example.com");
    }
  }, [user]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    // Here you would typically send an API request to update the user's profile
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            await removeToken();
            logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'Personal Information':
        return (
          <View style={{ padding: 20 }}>
            <Text style={styles.modalLabel}>Phone Number</Text>
            <TextInput style={styles.modalInput} value="+251 911 234 567" editable={false} />
            <Text style={styles.modalLabel}>Date of Birth</Text>
            <TextInput style={styles.modalInput} value="01/01/1990" editable={false} />
            <Text style={styles.modalLabel}>Gender</Text>
            <TextInput style={styles.modalInput} value="Not specified" editable={false} />
          </View>
        );
      case 'Payment Methods':
        return (
          <View style={{ padding: 20 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <Ionicons name="card" size={24} color="#1E40AF" />
              <Text style={{ marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#1e293b' }}>Visa ending in 4242</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', padding: 16, borderRadius: 12 }}>
              <Ionicons name="add" size={20} color="#1E40AF" />
              <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#1E40AF' }}>Add Payment Method</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Saved Addresses':
        return (
          <View style={{ padding: 20, gap: 12 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12 }}>
              <Ionicons name="home" size={24} color="#1E40AF" />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>Home</Text>
                <Text style={{ color: '#64748b' }}>Bole, Addis Ababa</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12 }}>
              <Ionicons name="briefcase" size={24} color="#1E40AF" />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>Work</Text>
                <Text style={{ color: '#64748b' }}>Piassa, Addis Ababa</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      case 'Settings':
        return (
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#e2e8f0' }}>
              <Text style={{ fontSize: 16, color: '#1e293b' }}>Push Notifications</Text>
              <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ true: '#1E40AF' }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#e2e8f0' }}>
              <Text style={{ fontSize: 16, color: '#1e293b' }}>Dark Mode</Text>
              <Switch value={darkModeEnabled} onValueChange={setDarkModeEnabled} trackColor={{ true: '#1E40AF' }} />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Blue Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: profileImage || 'https://via.placeholder.com/150' }} 
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton} onPress={pickImage}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.editActionRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            <TouchableOpacity style={styles.editProfileButton} onPress={() => setIsEditing(true)}>
              <Ionicons name="pencil-outline" size={16} color="#1E40AF" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Menu */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveModal('Personal Information')}>
          <Ionicons name="person-outline" size={24} color="#64748b" />
          <Text style={styles.menuText}>Personal Information</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveModal('Payment Methods')}>
          <Ionicons name="card-outline" size={24} color="#64748b" />
          <Text style={styles.menuText}>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveModal('Saved Addresses')}>
          <Ionicons name="location-outline" size={24} color="#64748b" />
          <Text style={styles.menuText}>Saved Addresses</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveModal('Settings')}>
          <Ionicons name="settings-outline" size={24} color="#64748b" />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={[styles.menuText, { color: '#ef4444' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

    {/* Dynamic Modal */}
    <Modal visible={!!activeModal} animationType="slide" transparent={true} onRequestClose={() => setActiveModal(null)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{activeModal}</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {renderModalContent()}
          </ScrollView>
        </View>
      </View>
    </Modal>
    </>
  );
}
