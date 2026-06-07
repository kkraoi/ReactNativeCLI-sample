# VisonCameraについて
- 公式：https://visioncamera.margelo.com/docs
- QRコード・バーコード・JANコード いろんなものに対応している
- CLIに向いている

## 導入
RN CLI（Expoなし）を前提とする

### ライブラリインストール
```sh
# コアライブラリと必要な依存関係のインストール
npm install react-native-vision-camera react-native-nitro-modules react-native-nitro-image

# バーコードスキャナを扱う場合
npm install react-native-vision-camera-barcode-scanner
```
補足: 最新のVisionCameraは「Nitro Modules」という次世代の高速ネイティブバインディングを採用しているため、上記3つのパッケージがセットで必要になります。

### Android: カメラ権限の設定
- 設定しないとクラッシュする
- `android/app/src/main/AndroidManifest.xml`を開き、<manifest> タグの直下に以下の権限を追加します。

```xml
<uses-permission android:name="android.permission.CAMERA" />
<!-- オーディオも必要であれば下記も -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### Android: Windows でのビルドエラー対処（Nitro Modules 必須）

VisionCamera v5 は Nitro Modules（`react-native-nitro-modules` / `react-native-nitro-image`）経由で C++ をビルドする。Windows では **4 アーキテクチャ同時ビルド** と **長いプロジェクトパス** の組み合わせで、次のエラーが出ることがある。

```
Execution failed for task ':react-native-nitro-image:buildCMakeDebug[armeabi-v7a]'.
ninja: error: manifest 'build.ninja' still dirty after 100 tries
```

ログに `[0/1] Re-running CMake...` が何度も繰り返されているのが特徴。

#### 原因（再現条件）

| 要因 | 内容 |
|------|------|
| 直接原因 | `gradle.properties` のデフォルト `reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64` により、Nitro 系ライブラリの CMake/Ninja が **4 ABI を並列ビルド** する |
| 環境要因 | プロジェクトパスが長い（例: `C:\Users\user\Documents\git\reactnative\tutorial\testapp\...`）。Windows のパス長制限と相まって Ninja が `build.ninja` を書き直し続ける |
| 誤解しやすい点 | NDK 未インストールやカメラ権限不足 **ではない**。`.cxx` 削除や `gradlew clean` **だけでは直らない**（検証済み） |

#### 本質的な修正（必須・1 行）

`android/gradle.properties` を開き、ビルド対象 ABI を **1 つに絞る**。

```properties
# 実機（USB 接続）開発向け。2017 年以降の実機の大半は arm64-v8a
reactNativeArchitectures=arm64-v8a
```

これだけで `npm run android` が通ることを確認済み（RN 0.85.3 / VisionCamera 5.0.11 / NDK 27.1.12297006 / Windows）。

**プロジェクトへの恒久変更はこの 1 行のみ。** 他ファイル（`App.tsx` 等）は触っていない。

#### 検証手順（再現性の確認）

エラー解消前後で、次のコマンドで切り分けできる。

```powershell
# プロジェクトルートで実行
cd android
.\gradlew --stop
cd ..

# エラー再現（4 ABI 指定）— 失敗する
cd android
.\gradlew app:assembleDebug -PreactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
cd ..

# 修正確認（arm64-v8a のみ）— 成功する
cd android
.\gradlew app:assembleDebug -PreactNativeArchitectures=arm64-v8a
cd ..
```

`gradle.properties` を `arm64-v8a` に書き換えた後は、通常どおり以下でよい。

```sh
npm run android
```

#### 補助的なクリーン（任意・効果は限定的）

ビルドキャッシュが壊れた状態からやり直すとき用。**アーキテクチャ変更なしでは同エラーは再発する。**

```powershell
# プロジェクトルートで実行
cd android
.\gradlew --stop
.\gradlew clean
cd ..

Remove-Item -Recurse -Force android\app\build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\.gradle -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\react-native-nitro-image\android\.cxx -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\react-native-nitro-modules\android\.cxx -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\react-native-vision-camera\android\.cxx -ErrorAction SilentlyContinue

npm run android
```

#### 用途別 ABI の切り替え

| 用途 | 設定 |
|------|------|
| 実機（USB） | `reactNativeArchitectures=arm64-v8a` |
| Android エミュレータ | `reactNativeArchitectures=x86_64`、または `-PreactNativeArchitectures=x86_64` を付けて実行 |
| リリース APK（全 ABI） | CI（Linux/macOS）でビルドするか、Windows ではプロジェクトを短いパス（例: `C:\dev\myapp`）に置いてから 4 ABI を試す |

#### それでも失敗する場合

1. **プロジェクトを短いパスに移す**（例: `C:\dev\testapp`）— Windows + Ninja 系で最も確実な回避策
2. **CMake を新しめにする** — Android Studio の SDK Manager で CMake 3.22.1 以外（3.31 系など）を入れ、環境変数 `CMAKE_HOME` を設定
3. **Windows 長いパスを有効化** — レジストリ `LongPathsEnabled=1`（効果は限定的な場合あり）

#### 無視してよい警告

ビルドログに出る次のメッセージは、今回の失敗原因ではない。

```
No modules to process in combine-js-to-schema-cli.
```

`react-native-nitro-image` の Codegen 関連の情報メッセージ。

---

### Android: Windows でのビルドエラー対処（バーコードスキャナ追加時・パス長）

`react-native-vision-camera-barcode-scanner` を追加すると、**前項の ABI 対策（`arm64-v8a` のみ）だけでは不足**することがある。同じ `ninja: build.ninja still dirty after 100 tries` でも、ログの中身が異なる。

#### エラーの見分け方

| | Type A（VisionCamera 本体） | Type B（バーコードスキャナ等） |
|---|---|---|
| 失敗タスク | `:react-native-nitro-image:buildCMakeDebug[armeabi-v7a]` など | `:react-native-vision-camera-barcode-scanner:buildCMakeDebug[arm64-v8a]` |
| 決定的なログ | ABI 名（`armeabi-v7a` 等）が主因 | **`CMAKE_OBJECT_PATH_MAX` 警告**が大量に出る |
| 対策 | `reactNativeArchitectures=arm64-v8a` | **パスを短くする**（下記） |

Type B で必ず確認する警告（これが出ていれば Type B）:

```
CMake Warning in CMakeLists.txt:
  The object file directory
    C:/Users/user/.../react-native-vision-camera-barcode-scanner/android/.cxx/.../VisionCameraBarcodeScanner.dir/./
  has 195 characters.  The maximum full path to an object file is 250
  characters (see CMAKE_OBJECT_PATH_MAX).  Object file
    C_/Users/user/.../VisionCameraBarcodeScannerOnLoad.cpp.o
  cannot be safely placed under this directory.  The build may not work correctly.
```

#### 原因

1. パッケージ名 `react-native-vision-camera-barcode-scanner` が非常に長い（43 文字）
2. Nitro Modules が C++ ビルド時、ソースパスをそのままオブジェクトファイル名に埋め込む
3. プロジェクトパス `C:\Users\user\Documents\git\reactnative\tutorial\testapp` も長い
4. 合計が CMake の **250 文字制限**（`CMAKE_OBJECT_PATH_MAX`）を超える
5. CMake がパス短縮に失敗 → `build.ninja` を書き直し続ける → `[0/1] Re-running CMake...` が 100 回 → Ninja エラー

**`.cxx` 削除や `gradlew clean` だけでは再発する。** `arm64-v8a` のみにしても、パッケージ名の長さは変わらない。

#### 対策 1（推奨）: CMake ビルド出力先を短いパスに逃がす

**`android/settings.gradle` の末尾**に追加する（`build.gradle` ではない）。`.cxx` の生成先を `C:/cxx/` に固定し、オブジェクトファイルのパス長を削る。

```gradle
// Windows: Nitro 系ネイティブモジュールの .cxx を短いパスへ（パス長 250 文字制限回避）
gradle.beforeProject { project ->
    project.afterEvaluate {
        if (project.plugins.hasPlugin('com.android.library') || project.plugins.hasPlugin('com.android.application')) {
            def cmake = project.extensions.findByName("android")?.externalNativeBuild?.cmake
            if (cmake != null) {
                cmake.buildStagingDirectory = new File("C:/cxx/${project.name}")
            }
        }
    }
}
```

> **なぜ `build.gradle` ではダメか**  
> `android/build.gradle` の `apply plugin: "com.facebook.react.rootproject"` 実行後に `subprojects { afterEvaluate { ... } }` を書くと、サブプロジェクトがすでに評価済みのため次のエラーになる（RN 0.85 で再現）:
> ```
> Cannot run Project.afterEvaluate(Closure) when the project is already evaluated.
> ```
> `settings.gradle` の `gradle.beforeProject` なら、各プロジェクト評価前に `afterEvaluate` を登録できる。

実行前にフォルダを作成:

```powershell
New-Item -ItemType Directory -Force -Path C:\cxx
```

ビルド前のクリーン:

```powershell
cd android
.\gradlew --stop
cd ..
Remove-Item -Recurse -Force C:\cxx -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\react-native-vision-camera-barcode-scanner\android\.cxx -ErrorAction SilentlyContinue
npm run android
```

#### 対策 2（最も確実）: プロジェクトを短いパスへ移動

リポジトリごと移す。Nitro 系ライブラリを追加するたびに有効。

```
# 例: 58 文字 → 11 文字
C:\Users\user\Documents\git\reactnative\tutorial\testapp
↓
C:\dev\testapp
```

移動後: `npm install` → `npm run android`

#### 対策 3（一時回避）: subst でドライブレターを割り当て

ファイルを移さず、ビルド時だけパスを短くする。

```powershell
subst X: C:\Users\user\Documents\git\reactnative\tutorial\testapp
X:
npm run android
```

解除: `subst X: /D`

**注意:** ターミナル・Cursor は `X:\` をカレントにして開き直すこと。

#### 対策 4（補助）: Ninja を新しいバージョンにする

Android SDK 同梱の CMake 3.22.1 付属 Ninja は古く、長いパスに弱い。  
[Reanimated の Windows 向けガイド](https://docs.swmansion.com/react-native-reanimated/docs/guides/building-on-windows) も Ninja 更新を推奨。

1. [Ninja Releases](https://github.com/ninja-build/ninja/releases) から最新版を取得
2. `ninja.exe` を PATH の **Android SDK の ninja より前**に置く
3. PC 再起動後にビルド

#### 効果が薄い／非推奨の対策

| 対策 | 理由 |
|------|------|
| `.cxx` 削除のみ | パス長は変わらないため再発 |
| `LongPathsEnabled=1` | Ninja / CMake の 250 文字制限は別問題で、単体では直らないことが多い |
| `CMAKE_OBJECT_PATH_MAX=512` を CMakeLists に追加 | 警告は消えても Ninja 側で失敗することが多い（[expo#26166](https://github.com/expo/expo/issues/26166)） |

#### Type A + Type B の完全チェックリスト（Windows / RN CLI）

1. `npm install react-native-vision-camera react-native-nitro-modules react-native-nitro-image`
2. バーコードが必要なら `npm install react-native-vision-camera-barcode-scanner`
3. `AndroidManifest.xml` に `CAMERA` 権限
4. **`gradle.properties` → `reactNativeArchitectures=arm64-v8a`**（Type A 対策）
5. **バーコードスキャナを入れたら Type B 対策も**（対策 1 または 2）
6. `npm run android`

---

設定出来たら `npm run android`

### 所定のライブラリに実装
```tsx
import React, { useEffect } from 'react'
import { Camera, useCameraPermission } from 'react-native-vision-camera'

function App() {
  const { hasPermission, requestPermission } = useCameraPermission()

  useEffect(() => {
    if (!hasPermission) requestPermission()
  }, [hasPermission, requestPermission])

  return (
    <Camera
      style={{ flex: 1 }}
      isActive={true}
      device="back"
    />
  )
}
```