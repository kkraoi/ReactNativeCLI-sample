import React, { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../components/CustomButton";

interface MainMenuScreenProps {
    navigation: any;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({navigation}) => {

    return (
        <SafeAreaView>
            <Text>メインメニュー</Text>

            <View style={{
                paddingTop: 24,
                marginHorizontal: 24,
                gap: 20,
            }}>
                <CustomButton
                    title="WebViewインライン"
                    onPress={() => navigation.navigate("TestWebViewInlineScreen")}
                    variant="secondary"
                />
                <CustomButton
                    title="WebViewインライン アセット利用"
                    onPress={() => navigation.navigate("TestWebViewOuterScreen")}
                    variant="secondary"
                />
                <CustomButton
                    title="Networking"
                    onPress={() => navigation.navigate("NetworkingScreen")}
                    variant="secondary"
                />
                <CustomButton
                    title="QRスキャナー"
                    onPress={() => navigation.navigate("QrScannerScreen")}
                    variant="secondary"
                />
                <CustomButton
                    title="バーコードスキャナー"
                    onPress={() => navigation.navigate("BarcodeScannerScreen")}
                    variant="secondary"
                />
            </View>
        </SafeAreaView>
    )
}