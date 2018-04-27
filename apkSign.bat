set KEYSTORE_NAME=okr.ks
set KEYSTORE_ALIAS=weekreport
set KEYSTORE_STOREPASS=mochasoft

set APK_DIR=platforms\android\build\outputs\apk
set APK_UNSIGN_NAME=android-release-unsigned.apk
set APK_SIGN_NAME=okr.apk

set DEPLOY=deploy


jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore %KEYSTORE_NAME%  -storepass %KEYSTORE_STOREPASS% %APK_DIR%\%APK_UNSIGN_NAME% %KEYSTORE_ALIAS%
copy %APK_DIR%\%APK_UNSIGN_NAME% %DEPLOY%\
move %DEPLOY%\%APK_UNSIGN_NAME% %DEPLOY%\%APK_SIGN_NAME%