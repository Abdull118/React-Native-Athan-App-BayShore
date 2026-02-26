# Bay Shore Athan Web

This is the web-port of the Bay Shore Athan app.

## Run locally

```bash
cd BayShoreAthanWeb
npm install
npm run dev
```

The app serves at:

- `http://localhost:5173`

## Use from Android app shell

The mobile app (`BayShoreAthanApp`) now loads this web app inside a `WebView`.

If you are using a physical Android/Fire device connected by ADB, run:

```bash
adb -s 192.168.0.154:5555 reverse tcp:5173 tcp:5173
```

Then launch the Android app; it will resolve `http://localhost:5173` on the device to your local dev server.

## Override web URL

Set this env var before running the mobile app if you want a different web source:

- `EXPO_PUBLIC_ATHAN_WEB_URL`

Example:

```bash
EXPO_PUBLIC_ATHAN_WEB_URL=http://192.168.0.154:5173 npm run android
```
