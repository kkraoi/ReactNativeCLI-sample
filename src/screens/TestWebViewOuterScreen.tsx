import React, { useRef } from "react";
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export const TestWebViewOuterScreen: React.FC = () => {
  const webViewRef = useRef<any>(null);

  // 💡 【重要】Androidのアセットを読み込むための魔法のURIパス
  // android_asset/ のプレフィックスの後は、assetsフォルダ基点の相対パスになります。
  const assetSource = { uri: "file:///android_asset/sample.html" };

  // 1. Web（アセットHTML）からのメッセージを集約して捌く窓口
  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      // 前回の気付き「Switch構文」を実戦投入！
      switch (message.type) {
        case "REQUEST_SCAN":
          Alert.alert(
            "ネイティブ機能発動",
            `ユーザー[${message.payload.userId}]からスキャン要求。ここでカメラ等を起動します。`
          );
          break;

        case "ALERT_ERROR":
          Alert.alert(
            "⚠️ 現場異常検知",
            `エラーコード: ${message.payload.code}\n詳細: ${message.payload.detail}`
          );
          break;

        default:
          console.warn("未定義のタイプです:", message.type);
      }
    } catch (error) {
      console.error("JSONパースエラー:", error);
    }
  };

  // 2. ネイティブからアセットHTML側へ命令を撃ち込む
  const sendCommandToAsset = () => {
    const instructions = "次の便（トラックA）の仕分けを開始してください";
    webViewRef.current?.injectJavaScript(`
      (function() {
        window.dispatchEvent(new MessageEvent('message', { data: '${instructions}' }));
      })();
    `);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nativeHeader}>
        <Text style={styles.headerText}>アセット読み込み画面 (RN側)</Text>
        <Button title="指示をアセットへ送信" onPress={sendCommandToAsset} color="#ffc107" />
      </View>

      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={assetSource} // 💡 定義したローカルアセットを指定
        onMessage={handleMessage}
        style={{ flex: 1 }}
        allowFileAccess={true} // 💡 Androidでローカルファイルへのアクセスを許可するプロパティ
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  nativeHeader: {
    padding: 20,
    backgroundColor: "#17a2b8", // インライン版と区別がつくように色を変更
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    marginBottom: 10,
    fontWeight: "bold",
  },
});