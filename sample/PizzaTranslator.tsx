import {View, Text, TextInput} from "react-native";
import React, {useState} from "react";

const PizzaTranslator = () => {
    const [text, setText] = useState("");

    return (
        <View style={{flex: 1, justifyContent: "center"}}>
            <TextInput
                placeholder="Type here to translate"
                onChangeText={newText => setText(newText)}
                style={{
                    height: 40,
                    padding: 5,
                    marginHorizontal: 8,
                    borderWidth: 1,
                }}
            />
            <Text style={{padding:10, fontSize: 42}}>
                {text
                    .split(" ")
                    .map(word => word && "🍕")
                    .join(" ")}
            </Text>
        </View>
    )
}

export default PizzaTranslator