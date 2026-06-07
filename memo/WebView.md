# WebViewについて
- 公式：https://github.com/react-native-webview/react-native-webview/blob/master/docs/Getting-Started.md

## 導入
### step1. インストール
```sh
npm install --save react-native-webview
```

### step2. アンドロイドの調整
android/gradle.properties に下記がなければ追記する
```sh
android.useAndroidX=true
android.enableJetifier=true
```

## 使い方
### ファイル記述、ファーストタッチ
```jsx
import React, { useRef } from "react";
import {WebView} from "react-native-webview";

export const コンポーネント: React.FC = () => {
    // 起動したWebViewをバインドする
    const webViewRef = useRef<any>(null);
    ...

    return (
        ...
        <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{html: myInlineHTML}}
            onMessage={handleMessage}
            style={{ flex: 1 }}
        />
```
WebViewコンポーネントの各プロパティ
- `ref={webViewRef}`
    - UseRefによるバインド（紐づけ）
- `originWhitelist={["*"]}`
    - ナビゲーション（遷移）を許可するドメインの安全フィルター
    - アプリ内のWebViewが、どこのサイト（Origin）にアクセスして良いかを制限するセキュリティ設定
    - デフォルトでは http://* と https://* しか許可されていません。
    - `["*"]`
        - すべて許可
        - インターネット上のURLではなく「インラインHTML（文字列）」や「ローカルのHTMLファイル」を直接読み込ませる場合、オリジンが about:blank や file:// になるため、デフォルトの制限に引っかかって画面が真っ白になります
        - それを回避し、「どんなオリジンでも受け入れる」ために ["*"] を指定します。
- `source={{html: myInlineHTML}}`
    - WebViewに「何を映すか」のデータソース
    - 表示するコンテンツを指定します。大きく分けて2つの指定方法があります。
        1. インラインHTML（今回）： source={{ html: '...HTMLの文字列...' }} と書くと、アプリ内で生成したHTMLを即座にレンダリングします。
        2. 通常のWebサイト・ローカルファイル： source={{ uri: 'https://...' }} や source={{ uri: 'file://...' }} のように、URLやパスを指定して読み込みます。
- `onMessage={handleMessage}`
    - Web側からの「ポスト（投函）」を待ち受ける郵便受け
    - 双方向通信の最重要プロパティ
    - Webから受け取ったものをRNのメソッドで処理させる
    - このプロパティに、ネイティブ側の関数（handleMessage）をセットしておくことで、WebView内のJavaScriptの世界に `window.ReactNativeWebView.postMessage()` という特別な関数が自動的に生み出されます。
    - Web側で`window.ReactNativeWebView.postMessage()`が実行されてデータが送られてくると、この onMessage がそれを感知し、ネイティブ側の処理をトリガーします
    - これがないと、Webからネイティブへ合図を送ることができません。

### 注意：スタイルの罠
- <WebView> は、親要素のサイズいっぱいに広がろうとする性質があります。
- 親要素にサイズ指定（flex: 1）がないため、WebViewが画面上に潰れて表示されない（高さ0になってしまう）ことがあります。
- そのため、移植する際は全体を flex: 1 で囲むようにしてください。

### injectJavaScript による逆方向の制御
- RNからWebに処理実行（JS）を命令する
- なぜ必要なのか
    - Webサイト側のJavaScriptは、通常「画面内のボタンが押されたとき」などに動きます。しかし、アプリ開発では「スマホの画面（ネイティブ側）で発生したイベントを、Web側にリアルタイムで伝えたい」というケースが多発します。
    - スマホ内蔵のカメラやハンディスキャナでバーコードを読み取った（ネイティブ側のイベント）瞬間、その「読み取った値」をWebView内の入力フォームに自動注入したり、Web側の「検索実行」JS関数をプログラムで勝手に発火させたりするときに使います。
- 記述ルール
    - 引数には「文字列（String）に変形したJavaScriptコード」を渡す 
    - 即時関数 (function(){ ... })() で囲む
        - 即時関数でカプセル化（独立）させておくと安全
        - Web側にもともとある変数名と衝突して、Webサイト側のシステムが壊れる（バグる）のを防ぐ防護服の役割を果たします
    - 文字リテラルの埋め込みが超強力
        - JSのコードを文字列（``）で書くため、TypeScript側の変数を ${} で簡単に流し込めます。
    - 戻り値は受け取れない（一方通行の命令）
        - ※「実行した結果のデータをアプリ側に返してほしい」という場合は、撃ち込むJSコードの末尾に `window.ReactNativeWebView.postMessage()` を仕込んで、前述の onMessage 郵便受けに送り返してもらうコンビネーション技が必要になります。
        - その場合、onMessageに対する関数をswitch構文で整理する

```tsx
const webViewRef = useRef<any>(null);
...
const code = `
(function() {
Javascriptプログラム
})();
`
webViewRef.current?.injectJavaScript(code);
...
<WebView
    ref={webViewRef}
```

### JSONのカプセル化
postMessage で送るデータは文字列である必要があるため、JSON.stringify() と JSON.parse() を挟んでいます。実務の複雑なデータ構造のやり取りはすべてこの応用です

## onMessageの設計思想
- 単一の窓口&多目的処理
    - WebViewからの通信はすべて一つの関数に集約されるため、データには必ず「用件名（type）」と「中身（payload）」を持たせる。
- Reduxなどの大手アーキテクチャに似せる
    - type と payload で switch 分岐させる構造
- try-catchの配置
    - Web側が万が一 JSON.stringify していない生文字列を送ってきた場合にアプリがクラッシュするのを防ぐため、switch の手前での try-catch は必須。

### テンプレート：Web側からデータを返信するJS
```js
// 例：Web側の現在の注文総額を計算して、RN側に返送する命令
(function() {
  const totalAmount = calculateTotal(); // Web側で計算
  
  const responseData = {
    type: 'GET_TOTAL_AMOUNT_SUCCESS', // RNのswitch文が判断するための識別子
    payload: { amount: totalAmount }  // 実際のデータ
  };

  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(responseData));
  }
})();
```
- データ構造に注目：onMessageに対する関数内のswitch文のため、type（もしくはaction）などのフラグをつくる

### テンプレート：RN側（アプリ側）の switch 構文による交通整理
```tsx
const handleMessage = (event: any) => {
  try {
    // 1. 安全のためにJSONにパースする
    const message = JSON.parse(event.nativeEvent.data);

    // 2. type（用件）に応じて switch 文で分岐
    switch (message.type) {
      case 'GET_TOTAL_AMOUNT_SUCCESS':
        // Web側から帰ってきたデータを使ってRN側のステートを更新する
        setAppAmount(message.payload.amount);
        break;

      case 'SORT_COMPLETE':
        // 荷物の仕分け完了時のネイティブ処理
        triggerVibration(); 
        break;

      case 'WEB_ERROR':
        // Web側で発生したエラーをアプリ側で検知してログに残す
        console.error('Web Error:', message.payload.errorMsg);
        break;

      default:
        // 想定外のtypeが届いた場合の安全弁
        console.warn('未定義のメッセージタイプです:', message.type);
        break;
    }
  } catch (error) {
    console.error('データのパースに失敗しました（JSON形式ではない可能性があります）', error);
  }
};
```

## HTMLをアセットとしてアプリに持たせる

### 1. web側のリソースの配置
- `android/app/src/main/`に`assets`フォルダをつくり、htmlファイルを格納する構成
- React Native CLIのAndroid開発において、WebViewにローカルファイルを読み込ませる場合、ファイルはAndroidプロジェクトの専用アセットディレクトリに配置する必要があります
- ローカルアセットを新しく追加した場合、npm run android でアプリを一度完全にビルドし直す（再起動する）必要があります
- なぜなら、android/app/src/main/assets フォルダの中身は、アプリをスマホにインストールするタイミングで一緒にパッケージングされるためです
- Fast Refresh（自動更新）では新しいHTMLファイルがエミュレータ側に転送されず、画面が真っ白、あるいは「ファイルが見つかりません」というエラー（Net::ERR_FILE_NOT_FOUND）になることがあります

### 2. ＲＮ側の実装
```jsx
// 💡 【重要】Androidのアセットを読み込むための魔法のURIパス
// android_asset/ のプレフィックスの後は、assetsフォルダ基点の相対パスになります。
const assetSource = { uri: "file:///android_asset/sample.html" };

<WebView
    ref={webViewRef}
    originWhitelist={["*"]}
    source={assetSource} // 💡 定義したローカルアセットを指定
    onMessage={handleMessage}
    style={{ flex: 1 }}
    allowFileAccess={true} // 💡 Androidでローカルファイルへのアクセスを許可するプロパティ
    />
```

### file:///android_asset/ について
- 「`file:///android_asset/`」はAndroid OS（Google）のネイティブ開発における大原則の共通ルール（仕様）
- file:///（プロトコル部分）
    - 「file://」は「この端末のローカル（内部）にあるファイルを直接読みに行く」 という世界共通の決まり事（URIスキーム）
    - スラッシュが3つある理由：
        - 本来は 「file://」＋「ホスト名」＋「/パス」 という構造なのですが、自分のスマホ（ローカル）を指すときはホスト名が空（無し）になります。
        - そのため、file:// ＋ （空） ＋ /android_asset/... となり、スラッシュが3つ連なる file:/// になっています。
- android_asset/
    - Android OS固有のルール
    - Androidアプリをビルドするとき、src/main/assets フォルダに入れたファイルは、圧縮されてアプリの本体（.apk ファイル）の内部にそのまま埋め込まれます
    - しかし、アプリを実行するときに、アプリの内部（バイナリの中）に隠れているHTMLファイルをWebViewから読み込もうとしても、通常のファイルパス（C:/... や /Users/... のようなパス）では指定できません
    - そこで、Android OSは「android_asset というキーワードを使ってアクセスしてきたら、アプリの内部に埋め込まれている assets フォルダのファイルを身代わりとして引き出してあげるよ」という特別な「仮想ショートカット（マッピング）」をOSの機能として提供しています。

## 現場のWebView開発・標準ワークフローまとめ
### 1. プロジェクトの構造（責任の分離）
- 土台（外側）： React Native CLI プロジェクト
    - 主な責任： 画面のガワ（ヘッダーやタブなど）、ネイティブ機能（カメラ、スキャナ、ローカル通知、バイブレーションなど）の制御、WebViewの配置。
- 中身（内側）： Next.js / Vite などのフロントエンドプロジェクト（RNプロジェクトの中に専用フォルダとして内包）
    - 主な責任： 業務UI画面（荷物の仕分けリスト、ボタン、入力フォームなど）の構築、JavaバックエンドAPIとの通信。

### 2. 開発時の同時起動コマンド（毎日やるルーティン）
- PCのターミナルを2つ開き、以下の2つの世界を同時に立ち上げます。
    - ターミナル①（Webの世界）： npm run dev (Next.js等を起動、ポート3000等)
    - ターミナル②（アプリの世界）： npm run android (RNアプリを起動、エミュレータへ)

### 3. 通信のルーティング（開発と本番の切り替え）
```tsx
// 開発モード（__DEV__）かどうかでWebViewの接続先を自動スイッチ
const webViewSource = __DEV__
  ? { uri: "http://10.0.2.2:3000" }              // 🏃 開発時はPCのNext.jsを直視（ホットリロード有効）
  : { uri: "file:///android_asset/sample.html" }; // 📦 本番（リリース）時は内蔵アセットを固定視
```