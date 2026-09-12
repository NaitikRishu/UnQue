import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import io from 'socket.io-client';

const DEFAULT_SERVER_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

export default function App() {
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [leads, setLeads] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(DEFAULT_SERVER_URL);

  useEffect(() => {
    const newSocket = io(serverUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to backend:', serverUrl);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from backend');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Socket error:', err.message);
      setIsConnected(false);
    });

    newSocket.on('initial_leads', (initialLeads) => {
      if (Array.isArray(initialLeads)) {
        setLeads(initialLeads);
      }
    });

    newSocket.on('new_lead', (newLead) => {
      setLeads((prevLeads) => [newLead, ...prevLeads.filter((l) => l.id !== newLead.id)]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [serverUrl]);

  const handleSaveUrl = () => {
    if (tempUrl.trim()) {
      setServerUrl(tempUrl.trim());
      setShowSettings(false);
    }
  };

  const handleClearLeads = () => {
    setLeads([]);
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Live Leads</Text>
          <Text style={styles.subtitle}>Meta Lead Ads Stream</Text>
        </View>

        <TouchableOpacity
          style={styles.statusBadge}
          onPress={() => setShowSettings(true)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? '#22c55e' : '#ef4444' },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? 'Live' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subBar}>
        <Text style={styles.countText}>
          {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'} Received
        </Text>
        {leads.length > 0 && (
          <TouchableOpacity onPress={handleClearLeads}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {leads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.pulseCircle}>
            <View style={styles.innerPulse} />
          </View>
          <Text style={styles.emptyTitle}>Listening for test leads...</Text>
          <Text style={styles.emptySubtitle}>
            Submit a lead in the Meta Lead Ads Testing Tool. It will appear here instantly in real-time.
          </Text>
          <TouchableOpacity
            style={styles.serverButton}
            onPress={() => setShowSettings(true)}
          >
            <Text style={styles.serverButtonText}>Backend: {serverUrl}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <View style={[styles.card, index === 0 && styles.newCardBorder]}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(item.name || 'L').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardTime}>{formatTime(item.createdAt)}</Text>
                </View>
                {index === 0 && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardBody}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Email:</Text>
                  <Text style={styles.fieldValue}>{item.email}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Phone:</Text>
                  <Text style={styles.fieldValue}>{item.phone}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Lead ID:</Text>
                  <Text style={styles.fieldIdValue}>{item.id}</Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal visible={showSettings} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Backend Server URL</Text>
            <Text style={styles.modalSubtitle}>
              Enter backend address (localhost, LAN IP, or ngrok URL)
            </Text>
            <TextInput
              style={styles.input}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="http://localhost:4000"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSaveUrl}
              >
                <Text style={styles.saveBtnText}>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  subBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#131f37',
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f43f5e',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  pulseCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  innerPulse: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  serverButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  serverButtonText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  newCardBorder: {
    borderColor: '#3b82f6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  cardTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  newBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
    gap: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  fieldIdValue: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: '#334155',
  },
  cancelBtnText: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
