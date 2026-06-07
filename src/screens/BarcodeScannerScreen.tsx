import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button, Linking, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCameraPermission } from "react-native-vision-camera";
import { CodeScanner } from "react-native-vision-camera-barcode-scanner";

// 現在の画面サイズを取得するためのAPI
// 現在の画面サイズ情報を取得します。
const { width } = Dimensions.get("window");
 
export const BarcodeScannerScreen: React.FC = () => {
    const { hasPermission, requestPermission } = useCameraPermission();
    const [scannedData, setScannedData] = useState<{ value: string, format: string} | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkPermission = async () => {
            console.log("1");
            
            if (!hasPermission) {
                await requestPermission();
                console.log("2")
            }
            setIsChecking(false);
            console.log("3")
        };
        checkPermission();
    }, [hasPermission, requestPermission]);

    if (isChecking) {
        return (
            <View style={styles.center}>
                <Text style={styles.darkText}>カメラの状態を確認中</Text>
            </View>
        )
    }

    if (!hasPermission) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>カメラの権限が必要です。</Text>
                <Button title="設定画面を開く" onPress={() => Linking.openSettings()}/>
            </View> 
        )
    }
 
    return (
        <SafeAreaView style={styles.container}>
            {/* ★第二弾：本格コードスキャナー */}
            <CodeScanner
                style={StyleSheet.absoluteFill}
                isActive={true}
                barcodeFormats={[
                    "qr-code",   // QRコード
                    "ean-13",    // 日本の商品（JANコード 13桁）
                    "ean-8",     // 短縮タイプのJANコード（8桁）
                    "code-128",  // 物流・梱包箱・伝票で最も一般的な規格
                    "code-39",   // 工業用・社内管理用
                    "upc-a",     // 海外の流通コード
                ]}
                onBarcodeScanned={(barcodes) => {
                    if(barcodes.length > 0 && barcodes[0].rawValue) {
                        const value = barcodes[0].rawValue;
                        const format = barcodes[0].format || "unknown";

                        // 読み取りの重複を防止
                        if (scannedData?.value === value) return;

                        // 値だけでなく、コードの種類（Format）も一緒に保存
                        setScannedData({ value, format });
                        console.log(`[${format}]を検出: ${value}`)

                    }
                }}
                onError={(error) => {
                    console.error("スキャンエラー： ", error)
                }}
            />

            {/* 前面UI：現場っぽいターゲット枠とオーバーレイ */}
            <View style={styles.overlayContainer}>
                <View style={styles.headerSection}>
                    <Text style={styles.title}>マルチバーコードリーダー</Text>
                    <Text style={styles.subTitle}>JAN / CODE128 / QR 対応</Text>
                </View>

                {/* 現場仕様の「横長」スキャンガイド枠（バーコードに合わせやすい形状） */}
                <View style={styles.scanTargetArea}/>

                {/* 下部：読み取り結果表示エリア */}
                <View style={styles.resultSection}>
                    {scannedData ? (
                        <View style={styles.resultWrapper}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{scannedData.format.toUpperCase()}</Text>
                            </View>
                            <Text style={styles.resultText}>{scannedData.value}</Text>
                            <Button title="次の荷物をスキャン" onPress={() => setScannedData(null)} color="#34C759"/>
                        </View>
                    ) : (
                        <Text style={styles.hintText}>バーコードまたはQRを枠に合わせてください</Text>
                    )}
                </View>
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
        backgroundColor: "#fff",
        padding: 20
    },
    darkText: {
        color: "#333",
        fontSize: 16
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20
    },
    overlayContainer: {
        ...StyleSheet.absoluteFill,
        justifyContent: "space-between",
        paddingVertical: 40,
        paddingHorizontal: 20
    },
    headerSection: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        padding: 12,
        borderRadius: 10,
        alignItems: "center"
    },
    title: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },
    subTitle: {
        color: "#aaa",
        fontSize: 12,
        marginTop: 2
    },
    // ★横長の商品コードに合わせたスキャン枠
    scanTargetArea: {
        width: width * 0.85,
        height: 140, // バーコードを狙いやすいように上下を浅く、横を広く
        alignSelf: "center",
        borderWidth: 2,
        borderColor: "#007AFF",
        borderRadius: 8,
        backgroundColor: "transparent"
    },
    resultSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 16,
        borderRadius: 12,
        minHeight: 80,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4
    },
    resultWrapper: {
        alignItems: "center",
        width: "100%"
    },
    badge: {
        backgroundColor: "007AFF",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginBottom: 6
    },
    badgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold"
    },
    hintText: {
        color: "#666",
        fontSize: 14,
        fontWeight: "500"
    },
    resultText: {
        color: "#111",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center"
    }
})