import {Text, View, Button} from "react-native";
import {useState} from "react";

type CatProps = {
    name: string;
};

const Cat = (props: CatProps) => {
    const [isHungry, setIsHungry] = useState(true);

    return (
        <View>
            <Text>Hello, I am {props.name}</Text>
            <Text>and, I am {isHungry ? "hungry" : "full"}</Text>
            <Button
                onPress={() => {
                    setIsHungry(false);
                }}
                disabled={!isHungry}
                title={isHungry ? "Give me some food, please!" : "Thank you"}
            />
        </View>
    );
}

const Cafe = () => {
    return (
        <View>
            <Cat name="Maru"/>
        </View>
    );
}

export default Cafe;