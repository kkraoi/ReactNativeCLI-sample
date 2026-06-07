import { Link } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react"
import { StyleSheet, Text, View, Linking, Button } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCameraPermission } from "react-native-vision-camera"
import { CodeScanner } from "react-native-vision-camera-barcode-scanner";

export const QrScannerScreen: React.FC = () => {
    const {hasPermission, requestPermission } = useCameraPermission();
    const [scannedValue, setScannedValue] = useState<string | null>(null)
    const [isChecking, setIsChecking] = useState(true);
     
    // 初回起動時に権限をリクエストする処理
    useEffect(() => {
        const checkPermission = async () => {
            if (!hasPermission) {
                await requestPermission();
            }
            setIsChecking(false);
        }
        checkPermission();
    }, [hasPermission, requestPermission]);

    // 「設定画面を開く」ボタンの処理
    const openSettings = useCallback(async () => {
        // スマホの設定画面（このアプリの権限ページ）へ直接ジャンプ
        await Linking.openSettings();
    }, []);

    // 起動直後の判定中ステート
    if(isChecking) {
        return (
            <View style={styles.center}>
                <Text style={styles.darkText}>カメラの状態を確認中...</Text>
            </View>
        )
    }
 
    if (!hasPermission) {
        return (
            <View style={styles.center}>
                <Text>カメラの権限を許可してください</Text>
                <View style={styles.buttonContainer}>
                    <Button title="スマホの設定画面を開く" onPress={openSettings} color={"#007AFF"}/>
                </View>
            </View>
        )
    }
 
    return (
        <SafeAreaView style={styles.container}>
            <CodeScanner
                style={StyleSheet.absoluteFill}
                isActive={true}
                barcodeFormats={["qr-code"]}
                onBarcodeScanned={(barcodes) => {
                    if (barcodes.length > 0 && barcodes[0].rawValue) {
                        const value = barcodes[0].rawValue;
                        setScannedValue(value);
                        console.log(`QRコード検出: ${value}`);
                    }
                }}
                onError={(error) => {
                    console.error("スキャンエラー: ", error);
                }}
            />

            {/* スキャン結果のオーバーレイ表示 */}
            <View style={styles.overlay}>
                <Text style={styles.title}>【第一弾】QRコードリーダー (V5最新版)</Text>
                {scannedValue ? (
                <Text style={styles.resultText}>読み取り結果: {scannedValue}</Text>
                ) : (
                <Text style={styles.hintText}>QRコードをカメラにかざしてください</Text>
                )}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000"
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff", // 権限エラー画面は見やすいように白背景に
        padding: 20,
    },
    darkText: {
        color: "#333",
        fontSize: 16,
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    subText: {
        color: "#666",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
    },
    buttonContainer: {
        width: "80%",
    },
    overlay: {
        position: "absolute",
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 15,
        borderRadius: 10,
        alignItems: "center"
    },
    title: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5
    },
    hintText: {
        color: "#aaa",
        fontSize: 14
    },
    resultText: {
        color: "#4CD964",
        fontSize: 16,
        fontWeight: "bold"
    }
})