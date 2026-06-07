import React from "react";
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle, TextStyle} from "react-native";

interface CustomButtomProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary";
    disabled?: boolean;
    loading?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export const CustomButton: React.FC<CustomButtomProps> = ({
    title,
    onPress,
    variant = "primary",
    disabled = false,
    loading = false,
    style,
    textStyle,
}) => {
    const buttonStyles = [
        styles.button,
        variant === 'secondary' ? styles.secondaryButton : styles.primaryButton,
        disabled && styles.disabledButton,
        style, // 外部から渡されたスタイルを最後に結合して上書き可能にする
    ];

    const textStyles = [
        styles.text,
        variant === 'secondary' ? styles.secondaryText : styles.primaryText,
        disabled && styles.disabledText,
        textStyle,
    ];

    return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#007AFF' : '#fff'} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // すべてのボタンに共通する基本の形状（ガワ）
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  // メインボタン
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryText: {
    color: '#fff',
  },
  // サブボタン
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryText: {
    color: '#007AFF',
  },
  // 無効化（非活性）状態のスタイル（グレーアウト）
  disabledButton: {
    backgroundColor: '#E5E5EA',
    borderColor: '#E5E5EA',
  },
  disabledText: {
    color: '#8E8E93',
  },
  // 文字の基本スタイル
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});