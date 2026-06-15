$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
Set-Location "C:\Users\as252\ailog"

Write-Host "Bundling JS..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "android/app/src/main/assets" | Out-Null
npx expo export:embed --platform android --entry-file index.ts --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

Write-Host "Configuring signing..." -ForegroundColor Cyan
(Get-Content android/app/build.gradle) -replace 'release \{', "release {`n            signingConfig signingConfigs.debug" | Set-Content android/app/build.gradle

Write-Host "Setting Gradle to 8.13..." -ForegroundColor Cyan
(Get-Content android/gradle/wrapper/gradle-wrapper.properties) -replace 'gradle-[0-9.]+-bin', 'gradle-8.13-bin' | Set-Content android/gradle/wrapper/gradle-wrapper.properties

Write-Host "Building APK..." -ForegroundColor Cyan
Set-Location android
./gradlew assembleRelease
Set-Location ..

Write-Host "Done! APK: android/app/build/outputs/apk/release/app-release.apk" -ForegroundColor Green
