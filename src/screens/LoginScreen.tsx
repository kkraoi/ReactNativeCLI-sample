import React, { useState } from "react";
import { StyleSheet, View, Text, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, TextInput, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../components/CustomButton";

interface LoginScreenProps {
    navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [userId, setUserId] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleLogin = () => {
        if (!userId || !password) {
            Alert.alert("入力してください");
        }

        console.log("Login:", userId, password);

        navigation.navigate("MainMenuScreen");
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={"height"}
                style={styles.inner}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.content}>
                        <Text style={styles.title}>ログイン</Text>

                        <View style={styles.form}>
                            <TextInput 
                                style={styles.input}
                                placeholder="ユーザーID"
                                value={userId}
                                onChangeText={setUserId}
                                autoCapitalize="none"
                            />
                            <TextInput 
                                style={styles.input}
                                placeholder="パスワード"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={true}
                                autoCapitalize="none"
                            />
                        </View>

                        <CustomButton title="ログイン" onPress={handleLogin}/>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    inner: {
        flex: 1
    },
    content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 32,
        textAlign: 'center',
        color: '#333',
    },
    form: {
        marginBottom:14,
        gap: 16
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: "#fafafa"
    }
})