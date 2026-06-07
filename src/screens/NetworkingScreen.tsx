import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CargoItem = {
    id: number;
    title: string;
    completed: boolean;
}

export const NetworkingScreen: React.FC = () => {
    const [isLoading, setLoading] = useState(true);
    const [cargoData, setCargoData] = useState<CargoItem[]>([]);

    const getCargoFrameApi = async () => {
        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=10");
            const json = await response.json();
            setCargoData(json);
        } catch (error) {
            console.error("データ取得に失敗しました: ", error);
        } finally { 
            setLoading(false);
        }
    }

    useEffect(() => {
        getCargoFrameApi();
    }, []);

    const renderCargoItem = ({ item }: { item: CargoItem}) => (
        <View style={styles.itemContainer}>
            <Text style={styles.cargoId}>荷物No: {item.id}</Text>
            <Text style={styles.cargoTitle}>品名: {item.title}</Text>
            <Text style={[styles.cargoStatus, item.completed ? styles.statusDone : styles.statusYet]}>
                ステータス: {item.completed ? "配送完了" : "配送中"}
            </Text>
        </View>
    )

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>荷物一覧</Text>

            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader}/>
            ) : (
                <FlatList
                    data={cargoData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCargoItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </SafeAreaView>
    )
} 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 16
    },
    loader: {
        flex: 1,
        justifyContent: "center"
    },
    listContainer: {
        paddingHorizontal: 16
    },
    itemContainer: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2
    },
    cargoId: {
        fontSize: 12,
        color: "#666",
    },
    cargoTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginVertical: 4
    },
    cargoStatus: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 4
    },
    statusDone: {
        color: "green"
    },
    statusYet: {
        color: "orange"
    }
})