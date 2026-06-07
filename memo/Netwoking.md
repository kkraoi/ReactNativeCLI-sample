# Networking　について
- 公式：https://reactnative.dev/docs/network

## フェッチしてリストアップする
```tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View, SafeAreaView } from 'react-native';

// 1. 汎用的なデータ型の定義（案件に応じて書き換え）
type ItemType = {
  id: string; // FlatListのキーは文字列が理想
  title: string;
};

const ApiListScreen = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ItemType[]>([]);

  // 2. 非同期データフェッチ（三種の神器：async, fetch, try-catch-finally）
  const fetchData = async () => {
    try {
      const response = await fetch('https://reactnative.dev/movies.json'); // 任意のAPI URL
      const json = await response.json();
      
      // APIのレスポンス構造に合わせてデータ抽入（例：json.movies など）
      setData(json.movies || json); 
    } catch (error) {
      console.error('通信エラー:', error);
    } finally {
      setLoading(false); // 成功・失敗に関わらずローディングを終了
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 3. パフォーマンス最適化：レンダリング関数のメモ化（不要な再描画の防止）
  const renderItem = React.useCallback(({ item }: { item: ItemType }) => (
    <View>
      <Text>{item.title}</Text>
    </View>
  ), []);

  // 4. パフォーマンス最適化：キー抽出の高速化
  const keyExtractor = React.useCallback((item: ItemType) => item.id.toString(), []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          // パフォーマンス向上：コンポーネントが変化しないことをRNに伝える
          removeClippedSubviews={true} 
          // パフォーマンス向上：初期描画の件数を制限して起動を高速化
          initialNumToRender={10} 
        />
      )}
    </SafeAreaView>
  );
};

export default ApiListScreen;
```

JavaScript（Web）の知識に加え、React Nativeで大量データを扱うためのベストプラクティスを組み込んでいます。

### React.useCallback の使用
renderItem と keyExtractor を useCallback で囲むことで、コンポーネントが再描画されるたびにこれらの関数が再生成されるのを防ぎます。これにより、FlatList 内の各アイテムの無駄な再描画が抑制されます。

### initialNumToRender={10}
最初に画面に描画するアイテム数を制限します。デフォルトのまま全件を一気にレンダリングしようとすると、端末のメモリを圧迫してアプリが一瞬カクつく（フレームドロップ）原因になるため、スマホアプリでは必須の設定です。

### removeClippedSubviews={true}
画面の外にスクロールアウトしたアイテムのネイティブビューをメモリから一時的に解放する、Androidで特に効果を発揮する強力な最適化オプションです。