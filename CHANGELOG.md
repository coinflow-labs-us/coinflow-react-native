# Changelog

## 4.21.0

- `CoinflowApplePayButton` no longer reloads the WebView when the `subtotal` prop changes. Apple Pay WebViews cannot receive `postMessage` from React Native (iOS disables the Apple Pay JS API in WKWebViews that inject scripts), so updates are relayed through a hidden same-origin bridge WebView and shared localStorage instead. Requires the default shared process pool on the WebViews.
- Add an optional `useNativeSubtotal` prop to `CoinflowApplePayButton`. When true, the Apple Pay button skips the totals (fee quote) fetch and charges exactly the `subtotal` passed to the component.

## 4.16.0

- Add a skeleton loader to the V2 card forms (`CoinflowCardForm`, `CoinflowCardNumberForm`, `CoinflowCvvForm`). The skeleton occupies the same space as the rendered form to prevent layout shift and disappears once the form is ready for input, removing the blank state during load.
