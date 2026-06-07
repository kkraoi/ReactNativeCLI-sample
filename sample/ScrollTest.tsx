import React from "react";
import {Image, ScrollView, Text} from "react-native";

const logo = {
    uri: "https://reactnative.dev/img/tiny_logo.png",
    width: 64,
    height: 64,
}

const ScrollTest = () => (
    <ScrollView>
        <Text style={{fontSize: 96}}>Scroll me plz</Text>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Text style={{fontSize: 96}}>Scroll me plz</Text>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Text style={{fontSize: 96}}>Scroll me plz</Text>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Text style={{fontSize: 96}}>Scroll me plz</Text>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Text style={{fontSize: 96}}>Scroll me plz</Text>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
        <Image source={logo}/>
    </ScrollView>
)

export default ScrollTest