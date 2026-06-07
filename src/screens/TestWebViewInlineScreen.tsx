import React, { useRef } from "react";
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {WebView} from "react-native-webview";

export const TestWebViewInlineScreen: React.FC = () => {
    const webViewRef = useRef<any>(null);

    const myInlineHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: sans-serif; text-align: center; padding: 20px; background-color: #f0f0f0; }
        button { padding: 15px 20px; font-size: 18px; background-color: #007AFF; color: white; border: none; border-radius: 5px; margin: 10px; }
      </style>
    </head>
    <body>
      <h2>荷物仕分け Web画面</h2>
      <button onclick="sendToNative()">仕分け完了（ネイティブへ通知）</button>
      
      <p id="message-box" style="color: red; font-weight: bold;"></p>

      <script>
        // Web から ネイティブ（React Native）へデータを送る関数
        function sendToNative() {
          const data = { action: 'SORT_COMPLETE', itemCode: '12345-AB' };
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(data));
          } else {
            alert('WebView環境ではありません');
          }
        }

        // ネイティブから送られてきたデータを受け取るリスナー
        window.addEventListener('message', function(event) {
          document.getElementById('message-box').innerText = "ネイティブからの指令: " + event.data;
        });
      </script>
    </body>
    </html>
    `;

    const handleMessage = (event: any) => {
        const messageData = JSON.parse(event.nativeEvent.data);
        
        if (messageData.action === "SORT_COMPLETE") {
            Alert.alert(
                "ネイティブ側で検知",
                `商品コード [${messageData.itemCode}] の仕分けが完了しました`
            )
        }
    }

    const sendToWeb = () => {
        const instructions = "つぎの荷物をスキャンしてください";
        webViewRef.current.injectJavaScript(`
            (function() {
                window.dispatchEvent(new MessageEvent('message', { data: '${instructions}' }));
            })();
        `);
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.nativeHeader}>
                <Text>ネイティブ領域</Text>
                <Button title="Web側に次の指示を送る" onPress={sendToWeb} color="#28a745"/>
            </View>

            <WebView
                ref={webViewRef}
                originWhitelist={["*"]}
                source={{html: myInlineHTML}}
                onMessage={handleMessage}
                style={{ flex: 1 }}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    nativeHeader: {
        flex: 1,
        backgroundColor: "#333",
        alignItems: "center"
    },
    headerText: {
        color: "#fff",
        marginBottom: 10,
        fontWeight: "bold"
    }
});