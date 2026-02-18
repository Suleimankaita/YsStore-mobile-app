import { router, Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, Platform, Modal, 
  Text, Dimensions, Pressable, Alert,SafeAreaView 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Modern Camera API
import { HapticTab } from '@/components/haptic-tab';

const { width, height } = Dimensions.get('window');

// --- 1. SCANNER COMPONENT (Barcode & QR) ---
function ScannerModal({ visible, onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Request permission when modal opens
  useEffect(() => {
    if (visible) {
      setScanned(false);
      requestPermission();
    }
  }, [visible]);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    Alert.alert("Success", `Scanned Data: ${data}`, [
      { text: "OK", onPress: () => onClose() }
    ]);
  };

  if (!permission) return null;

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.scannerContainer}>
        {!permission.granted ? (
          <View style={styles.centerContent}>
            <Text style={styles.permissionText}>Camera access is required to scan</Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>Enable Camera</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr", "barcode", "upc_e"] }}
          >
            <SafeAreaView style={styles.scannerOverlay}>
              <TouchableOpacity onPress={onClose} style={styles.closeScanner}>
                <Ionicons name="close-circle" size={45} color="white" />
              </TouchableOpacity>
              <View style={styles.scanFrame} />
              <Text style={styles.scanHint}>Align QR/Barcode within the frame</Text>
            </SafeAreaView>
          </CameraView>
        )}
      </View>
    </Modal>
  );
}

// --- 2. QUICK ACTION MODAL ---
function QuickActionModal({ visible, onClose, onOpenScanner }) {
  const actions = [
    { id: '1', title: 'Scan QR', icon: 'qr-code-outline', color: '#4D96FF', action: onOpenScanner },
    { id: '2', title: 'Shop Now', icon: 'cart-outline', color: '#FF6B6B', action: () => router.push('/(Shopnow)/ShopNow') },
    { id: '3', title: 'Add Story', icon: 'camera-outline', color: '#6BCB77', action: onClose },
    { id: '4', title: 'Map View', icon: 'map-outline', color: '#F9D923', action: onClose },
  ];

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={modalStyles.modalCard}>
          <View style={modalStyles.indicator} />
          <Text style={modalStyles.modalTitle}>Shortcuts</Text>
          <View style={modalStyles.grid}>
            {actions.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={modalStyles.actionItem} 
                onPress={() => { item.action(); onClose(); }}
              >
                <View style={[modalStyles.iconCircle, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={26} color={item.color} />
                </View>
                <Text style={modalStyles.actionText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// --- 3. MAIN TAB LAYOUT ---
export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const activeColor = '#0F172A'; 
  const inactiveColor = '#94A3B8';

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarShowLabel: true,
          tabBarStyle: styles.floatingTabBar,
          tabBarItemStyle: { height: "100%", justifyContent: 'center',alignItems:'center' }, // Centers the icons vertically
        }}>
        
        <Tabs.Screen name="index"
         options={{
          title:"Home",
          tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons name={focused ? "home" : "home-outline"} size={24} color={focused ? activeColor : inactiveColor} />
                {focused && <View style={styles.activeDot} />}
              </View>
            ),
        }} />

        <Tabs.Screen name="Shoplist" options={{
          title:"Shop List",

            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons name={focused ? "storefront" : "storefront-outline"} size={24} color={focused ? activeColor : inactiveColor} />
                {focused && <View style={styles.activeDot} />}
              </View>
            ),
        }} />

        <Tabs.Screen name="scan-trigger"
          listeners={{ tabPress: (e) => { e.preventDefault(); setModalVisible(true); } }}
          options={{
            tabBarButton: (props) => (
              <TouchableOpacity {...props} activeOpacity={0.9} style={styles.fabWrapper}>
                <View style={styles.fab}><Ionicons name="add" size={32} color="white" /></View>
              </TouchableOpacity>
            ),
          }} />

        <Tabs.Screen name="wishlist" options={{
            title:"Wishlist",
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons name={focused ? "heart" : "heart-outline"} size={24} color={focused ? "#FF6B6B" : inactiveColor} />
                <View style={styles.badge} />
                {focused && <View style={[styles.activeDot, {backgroundColor: '#FF6B6B'}]} />}
              </View>
            ),
        }} />

        <Tabs.Screen name="me" options={{
            title:"Me",
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons name={focused ? "person" : "person-outline"} size={24} color={focused ? activeColor : inactiveColor} />
                {focused && <View style={styles.activeDot} />}
              </View>
            ),
        }} />
      </Tabs>

      <QuickActionModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onOpenScanner={() => setScannerVisible(true)} 
      />

      <ScannerModal 
        visible={scannerVisible} 
        onClose={() => setScannerVisible(false)} 
      />
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  floatingTabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    height: 70,
    borderRadius: 35,
    borderTopWidth: 0,
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  iconContainer: { alignItems: 'center', justifyContent: 'center', height: '100%' },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#0F172A', position: 'absolute', bottom: 10 },
  badge: { position: 'absolute', top: 12, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B6B', borderWidth: 1.5, borderColor: 'white' },
  fabWrapper: { top: -28, justifyContent: 'center', alignItems: 'center', width: 70 },
  fab: { backgroundColor: '#0F172A', width: 62, height: 62, borderRadius: 31, justifyContent: 'center', alignItems: 'center', borderWidth: 6, borderColor: '#F8FAFC', elevation: 10 },
  
  // Scanner Styles
  scannerContainer: { flex: 1, backgroundColor: 'black' },
  scannerOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#4D96FF', borderRadius: 20, backgroundColor: 'transparent' },
  scanHint: { color: 'white', marginTop: 30, fontWeight: '600' },
  closeScanner: { position: 'absolute', top: 60, right: 30 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { color: 'white', marginBottom: 20, textAlign: 'center' },
  permissionBtn: { backgroundColor: '#4D96FF', padding: 15, borderRadius: 10 }
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25, paddingBottom: 40, alignItems: 'center' },
  indicator: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  actionItem: { width: '23%', alignItems: 'center', marginBottom: 10 },
  iconCircle: { width: 55, height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
});