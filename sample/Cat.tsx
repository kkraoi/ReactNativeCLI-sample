import {Text, TextInput, View} from "react-native";

const getFullName = (
    firstName: string,
    secondName: string,
    thirdName: string
) => {
    return firstName + " " + secondName + " " + thirdName;
}

const Cat = () => {
    const name = "Maru";
    return (
        <View>
            <Text>Hello, I am your cat, {getFullName(name, "mie", "mori")}</Text>
            <TextInput 
                style={{
                    height: 40,
                    borderColor: "gary",
                    borderWidth: 1,
                }}
            ></TextInput>
        </View>
        )
}

export default Cat;