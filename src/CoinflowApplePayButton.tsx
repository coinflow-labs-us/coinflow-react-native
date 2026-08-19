import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import WebView from 'react-native-webview';
import ApplePayLogoBlack from './assets/ApplePayBlack.png';
import ApplePayLogoWhite from './assets/ApplePayWhite.png';
import {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes';
import {useRandomHandleHeightChangeId, WithStyles} from './CoinflowWebView';
import {
  CoinflowPurchaseProps,
  CoinflowUtils,
  getHandlers,
  getWalletPubkey,
  handleIFrameMessage,
  IFrameMessageHandlers,
  IFrameMessageMethods,
  WithGeo,
} from './common';

export type CoinflowApplePayButtonProps = CoinflowPurchaseProps &
  WithStyles &
  WithGeo & {
    /** Background color of the Apple Pay button. Defaults to `black`. */
    color?: 'white' | 'black';
    /** Fires once the purchase completes, with the resulting payment. */
    onApprove?: (info: {paymentId: string}) => void;
    /** Fires if the purchase fails, with the error message. */
    onError?: (error: string) => void;
    /** Called once the button has loaded. */
    onLoad?: () => void;
  };

/** Solid loading shades of the two button colors: lighter for black, dimmed
 * for white (white cannot get lighter). */
const LOADING_OVERLAY_COLORS: Record<'white' | 'black', string> = {
  black: '#2E2E2E',
  white: '#F0F0F0',
};

/**
 * Standalone Apple Pay button for the React Native SDK.
 *
 * Renders the hosted `/apple-pay/:merchantId` button page inside a WebView and,
 * unlike {@link CoinflowPurchase}, shows only the Apple Pay button rather than
 * the full checkout. Mirrors the web `CoinflowApplePayButton`: an Apple Pay
 * logo overlay is rendered permanently above the WebView and passes touches
 * through to it, so the button appears instantly and there is no visual change
 * when the hosted page finishes loading.
 *
 * Apple Pay only works on a real iOS device — it will not run in the simulator.
 */
export function CoinflowApplePayButton(props: CoinflowApplePayButtonProps) {
  const {color = 'black', onApprove, onError, onLoad, style} = props;
  const webViewRef = useRef<WebView>(null);
  const handleHeightChangeId = useRandomHandleHeightChangeId();
  const loadedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

  // The subtotal is pinned to its initial value in the WebView URL so that
  // amount changes don't change the URL and force a reload.
  //
  // Updates cannot be posted to this WebView directly: iOS disables the Apple
  // Pay JS API in WKWebViews that inject scripts, so react-native-webview
  // drops all JS injection (including ref.postMessage) when `enableApplePay`
  // is set. Instead, updates are posted to a hidden same-origin bridge
  // WebView (without Apple Pay), which relays them to the Apple Pay page
  // through localStorage — shared between the two WebViews because they are
  // same-origin and use the default shared process pool. Do NOT set
  // `useSharedProcessPool={false}` on either WebView.
  const [initialSubtotal] = useState(props.subtotal);
  const lastSentSubtotalRef = useRef(JSON.stringify(initialSubtotal));
  const bridgeWebViewRef = useRef<WebView>(null);
  const [bridgeLoaded, setBridgeLoaded] = useState(false);
  const bridgeId = useMemo(() => Math.random().toString(16).substring(2), []);

  const url = useMemo(() => {
    const walletPubkey = getWalletPubkey(props);
    return CoinflowUtils.getCoinflowUrl({
      ...props,
      subtotal: initialSubtotal,
      walletPubkey,
      transaction: undefined,
      routePrefix: 'form',
      route: `/apple-pay/${props.merchantId}`,
      handleHeightChangeId,
      bridgeId,
      baseUrl: CoinflowUtils.getCoinflowBaseUrl(props.env),
    });
  }, [props, handleHeightChangeId, initialSubtotal, bridgeId]);

  const source = useMemo(() => ({uri: url}), [url]);

  const bridgeSource = useMemo(
    () => ({
      uri: `${CoinflowUtils.getCoinflowBaseUrl(props.env)}/rn-bridge?bridgeId=${bridgeId}`,
    }),
    [props.env, bridgeId]
  );

  const sendMessage = useCallback((message: string) => {
    webViewRef.current?.postMessage(message);
  }, []);

  const handleBridgeMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const parsed = JSON.parse(event.nativeEvent.data);
      if (parsed.method === 'loaded') setBridgeLoaded(true);
    } catch {
      // Ignore non-JSON messages.
    }
  }, []);

  const {subtotal} = props;
  useEffect(() => {
    if (!bridgeLoaded || !subtotal) return;

    const serializedSubtotal = JSON.stringify(subtotal);
    if (lastSentSubtotalRef.current === serializedSubtotal) return;

    lastSentSubtotalRef.current = serializedSubtotal;
    bridgeWebViewRef.current?.postMessage(
      `${IFrameMessageMethods.UpdateSubtotal}:${serializedSubtotal}`
    );
  }, [bridgeLoaded, subtotal]);

  const messageHandlers = useMemo<IFrameMessageHandlers>(
    () => ({
      ...getHandlers(props),
      onSuccess: info => {
        props.onSuccess?.(info);
        onApprove?.(info as {paymentId: string});
      },
    }),
    [props, onApprove]
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const {data} = event.nativeEvent;

      try {
        const parsed = JSON.parse(data);
        if (parsed.method === 'loaded' && !loadedRef.current) {
          loadedRef.current = true;
          setLoaded(true);
          onLoad?.();
        }
        if (typeof parsed.data === 'string' && parsed.data.startsWith('ERROR'))
          onError?.(parsed.info ?? parsed.data);
      } catch {
        // Not JSON, fall through to the iframe message handler.
      }

      const promise = handleIFrameMessage(
        data,
        messageHandlers,
        handleHeightChangeId
      );
      promise?.then(sendMessage).catch(e => sendMessage('ERROR ' + e.message));
    },
    [messageHandlers, handleHeightChangeId, sendMessage, onError, onLoad]
  );

  const onShouldStartLoadWithRequest = useCallback(
    (_request: ShouldStartLoadRequest) => true,
    []
  );

  return (
    <View style={[styles.container, style]}>
      <View
        pointerEvents="none"
        style={[
          styles.overlay,
          {backgroundColor: loaded ? color : LOADING_OVERLAY_COLORS[color]},
        ]}
      >
        <AppleButtonOverlayLogo color={color} />
      </View>
      <WebView
        ref={webViewRef}
        style={styles.webView}
        webviewDebuggingEnabled={true}
        originWhitelist={['*']}
        enableApplePay={true}
        keyboardDisplayRequiresUserAction={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        source={source}
        onMessage={handleMessage}
      />
      <WebView
        ref={bridgeWebViewRef}
        // react-native-webview wraps the webview in a {flex: 1} container;
        // the size must be constrained on that wrapper (containerStyle) or
        // the bridge steals flex space from the visible WebView above.
        containerStyle={styles.bridgeWebView}
        pointerEvents="none"
        originWhitelist={['*']}
        source={bridgeSource}
        onMessage={handleBridgeMessage}
      />
    </View>
  );
}

export function AppleButtonOverlayLogo({
  color,
}: Pick<CoinflowApplePayButtonProps, 'color'>) {
  const source = color === 'white' ? ApplePayLogoBlack : ApplePayLogoWhite;
  return <Image source={source} style={styles.logo} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    width: '100%',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // Kept 1x1 rather than 0x0 so WebKit does not suspend the page.
  bridgeWebView: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: '50%',
    aspectRatio: 2.43,
    backgroundColor: 'transparent',
  },
});
