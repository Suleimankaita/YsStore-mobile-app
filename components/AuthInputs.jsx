import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const AuthInput = ({
  label,
  value,
  onChangeText,
  readOnly=false,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) => {
  const [focused, setFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(secureTextEntry);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const animateBorder = (toValue) => {
    Animated.timing(borderAnim, {
      toValue,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2B2F3A', '#6D5EF8'],
  });

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <Animated.View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          value={value}
          readOnly={readOnly}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#7C8498"
          secureTextEntry={hidePassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={styles.input}
          onFocus={() => {
            setFocused(true);
            animateBorder(1);
          }}
          onBlur={() => {
            setFocused(false);
            animateBorder(0);
          }}
        />

        {secureTextEntry ? (
          <Pressable onPress={() => setHidePassword((prev) => !prev)}>
            <Text style={styles.toggleText}>
              {hidePassword ? 'Show' : 'Hide'}
            </Text>
          </Pressable>
        ) : null}
      </Animated.View>

      {focused ? <View style={styles.underlineGlow} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    color: '#E9ECF5',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    minHeight: 56,
    borderWidth: 1.2,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 14,
  },
  toggleText: {
    color: '#A9AFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  underlineGlow: {
    height: 2,
    backgroundColor: '#6D5EF8',
    borderRadius: 999,
    marginTop: 8,
    opacity: 0.75,
  },
});

export default AuthInput;