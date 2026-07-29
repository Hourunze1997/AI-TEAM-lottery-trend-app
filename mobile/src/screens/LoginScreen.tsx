import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';

import { apiClient, extractError } from '../api/client';
import { setToken } from '../store/authSlice';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username || !password) {
      Alert.alert('请填写用户名与密码');
      return;
    }
    try {
      setLoading(true);
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await apiClient.post(path, { username, password });
      const { access_token, user_id } = res.data;
      dispatch(setToken({ token: access_token, user: { id: user_id, username } }));
    } catch (e) {
      const { message } = extractError(e);
      Alert.alert('失败', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'login' ? '登录' : '注册'}</Text>
      <TextInput
        placeholder="用户名"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="密码"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Pressable style={styles.btn} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? '...' : mode === 'login' ? '登录' : '注册'}</Text>
      </Pressable>
      <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={styles.switch}>
          {mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#ffcc00',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { fontSize: 16, fontWeight: '600' },
  switch: { marginTop: 16, textAlign: 'center', color: '#666' },
});
