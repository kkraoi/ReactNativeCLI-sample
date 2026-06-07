# React Navigation について
公式：https://reactnavigation.org/docs/getting-started

## 導入
```sh
# 本体
npm install @react-navigation/native

# 依存関係
npm install react-native-screens react-native-safe-area-context

# ネイティブスタックナビゲーター
# リンクをクリックすると履歴スタックに追加され、戻るを押すとスタックから画面がポップされ、前の画面がアクティブになる
npm install @react-navigation/native-stack
```

## 使い方
- SafeAreaProvider と SafeAreaView の親子関係: 大元（App.tsx）で数値を測るシステム（Provider）を置き、各画面で実際に余白を空ける箱（View）を置く。
- 画面部品（Components）は名前付き: export const で縛ることで、VS Codeの自動インポートやタイポの赤波線検知の恩恵を最大化する。
- ビジネスロジックとUIの分離: 画面遷移（navigation.navigate）などの具体的な命令は「画面（Screens）」側で行い、共通の「部品（Components）」側には onPress などの関数を外から渡すだけに留める。

### App.tsx の設定
アプリ全体に安全地帯（Safe Area）とナビゲーションの仕組みを組み込み、画面リストの型定義（RootStackParamList）で安全性を担保する土台です。
```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 1. 作成した画面コンポーネントのインポート
import { LoginScreen } from './src/screens/LoginScreen'; 
import { MainMenuScreen } from './src/screens/MainMenuScreen'; 

// 2. ナビゲーションの型定義（画面名と渡すパラメータを指定）
export type RootStackParamList = {
  Login: undefined;      // パラメータなし
  MainMenu: undefined;   // パラメータなし（画面が増えたらここに追記）
};

// 3. 型安全なスタックナビゲーターの生成
const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: true,     // ヘッダーバーの表示
            headerBackTitle: '',   // iOSで「戻る」の横の文字を消す実務テク
          }}
        >
          {/* 4. 画面の登録 */}
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'ログイン' }} />
          <Stack.Screen name="MainMenu" component={MainMenuScreen} options={{ title: 'メインメニュー' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
```

### 各画面の設定
画面側では、アロー関数（const）と名前付きエクスポート（export const）を使い、引数から navigation オブジェクトを受け取って遷移させます。
```tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 1. プロップス（引数）の型定義（一旦anyですが、遷移機能はこれで動きます）
interface LoginScreenProps {
  navigation: any;
}

// 2. 名前付きエクスポート（タイポ防止用の実務標準）
export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text>ログイン画面</Text>
        
        {/* 3. 遷移させる処理 */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('MainMenu')} // App.tsxで定義した正確な名前を指定
        >
          <Text style={styles.buttonText}>メインメニューへ遷移</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: { marginTop: 20, padding: 15, backgroundColor: '#007AFF', borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
```

## パラメータの受け渡し（値のバトンタッチ）
- どんなとき使う？：「商品一覧画面」でタップした商品のIDを、「商品詳細画面」に渡して中身を表示したいとき。
- キーワード：route.params

## 画面を「戻れなく」する（認証フローの制御）
- どんなとき使う？：ログイン画面からメイン画面に遷移した後、スマホの戻るボタンを押したときに「ログイン画面に戻ってしまう」のを防ぎたいとき。
- キーワード：navigation.replace()、または公式ドキュメントの「Authentication flows（認証フロー）」

## タブナビゲーションの追加
- どんなとき使う？：以前お話しした、画面の下部に常駐するメニュー（ホーム、マイページなど）を実装したいとき。
- キーワード：@react-navigation/bottom-tabs