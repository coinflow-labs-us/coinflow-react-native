import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Dimensions, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import WebView from 'react-native-webview';
import {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes';
import {CoinflowSkeleton} from './CoinflowSkeleton';
import {useRandomHandleHeightChangeId, WithStyles} from './CoinflowWebView';
import {
  CoinflowPurchaseProps,
  CoinflowUtils,
  getHandlers,
  getWalletPubkey,
  handleIFrameMessage,
  IFrameMessageHandlers,
  WithGeo,
} from './common';

export type CoinflowPayPalButtonProps = CoinflowPurchaseProps &
  WithStyles &
  WithGeo & {
    /** Email tied to the PayPal account, used to create the order. */
    email?: string;
    /** Phone number tied to the PayPal account, used to create the order. */
    phoneNumber?: {countryCode: string; nationalNumber: string};
    /** Saved PayPal account token, used to create the order directly. */
    token?: string;
    /**
     * Fires once the PayPal purchase is approved/complete, with the resulting
     * payment. Unlike the hosted purchase flow, the standalone button does not
     * render its own "purchase complete" screen — use this to drive your own
     * post-purchase UI.
     */
    onApprove?: (info: {paymentId: string}) => void;
    /** Fires if the PayPal purchase fails, with the error message. */
    onError?: (error: string) => void;
    /** Called once the button has loaded. */
    onLoad?: () => void;
    /**
     * Screen insets the approval overlay should respect when it expands. The
     * overlay fills from `top` (e.g. the top safe-area inset) down to
     * `screenHeight - bottom` (e.g. the bottom tab-bar height), so it never
     * covers the status bar / notch or the host app's tab bar. Both default to
     * 0 (full screen).
     */
    overlayInsets?: {top?: number; bottom?: number};
  };

/**
 * Standalone PayPal button for the React Native SDK.
 *
 * Renders the hosted `/paypal/:merchantId` button page inside a WebView and,
 * unlike {@link CoinflowPurchase}, shows only the PayPal button rather than the
 * full checkout. The identifier (email / phone / saved token) is passed as
 * query params so the page can create the order, and when PayPal's approval
 * modal opens the WebView expands to fill the screen.
 */
export function CoinflowPayPalButton(props: CoinflowPayPalButtonProps) {
  const {
    email,
    phoneNumber,
    token,
    onApprove,
    onError,
    onLoad,
    style,
    overlayInsets,
  } = props;
  const webViewRef = useRef<WebView>(null);
  const containerRef = useRef<View>(null);
  const handleHeightChangeId = useRandomHandleHeightChangeId();
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [windowOffset, setWindowOffset] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const overlayTop = overlayInsets?.top ?? 0;
  const overlayBottom = overlayInsets?.bottom ?? 0;

  // The identifier is deliberately kept out of the URL. It is delivered via
  // postMessage instead (see `sendIdentifier`), so it can update live as the
  // merchant changes `email`/`phoneNumber`/`token` without reloading the page.
  const url = useMemo(() => {
    const walletPubkey = getWalletPubkey(props);
    return CoinflowUtils.getCoinflowUrl({
      ...props,
      walletPubkey,
      email: undefined,
      transaction: undefined,
      routePrefix: 'form',
      route: `/paypal/${props.merchantId}`,
      handleHeightChangeId,
      baseUrl: CoinflowUtils.getCoinflowBaseUrl(props.env),
    });
  }, [props, handleHeightChangeId]);

  // Memoized so a re-render (e.g. the merchant typing an email) doesn't hand the
  // WebView a new source object and trigger a reload.
  const source = useMemo(() => ({uri: url}), [url]);

  const sendMessage = useCallback((message: string) => {
    webViewRef.current?.postMessage(message);
  }, []);

  const sendIdentifier = useCallback(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        method: 'paypalIdentifier',
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        token: token || undefined,
      })
    );
  }, [email, phoneNumber, token]);

  // Push the identifier once the page is loaded, and again whenever it changes.
  useEffect(() => {
    if (loaded) sendIdentifier();
  }, [loaded, sendIdentifier]);

  const measureContainer = useCallback(() => {
    containerRef.current?.measureInWindow((x, y, width, height) => {
      setWindowOffset({x, y, width, height});
    });
  }, []);

  // Tell the hosted page where the button sits on screen relative to the
  // expanded overlay region, so when the approval modal opens the page renders
  // the PayPal button back at its original slot (rather than at the top of the
  // region) while the modal fills the rest. Mirrors the web SDK's overlay
  // offset; the page reads it via `paypalOverlayOffset`.
  const sendOverlayOffset = useCallback(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        method: 'paypalOverlayOffset',
        top: windowOffset.y - overlayTop,
        left: windowOffset.x,
        width: windowOffset.width,
        height: windowOffset.height,
      })
    );
  }, [windowOffset, overlayTop]);

  useEffect(() => {
    if (loaded) sendOverlayOffset();
  }, [loaded, sendOverlayOffset]);

  const messageHandlers = useMemo<IFrameMessageHandlers>(
    () => ({
      ...getHandlers(props),
      onSuccess: info => {
        props.onSuccess?.(info);
        onApprove?.(info as {paymentId: string});
      },
      handleOverlay: state => {
        // Re-measure before expanding so the overlay anchors to the button's
        // current on-screen position (layout may have shifted since mount).
        if (state === 'open') measureContainer();
        setOverlayOpen(state === 'open');
      },
    }),
    [props, onApprove, measureContainer]
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const {data} = event.nativeEvent;

      try {
        const parsed = JSON.parse(data);
        if (parsed.method === 'loaded') {
          setIsLoading(false);
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

  // When PayPal's approval modal opens, expand the WebView full-width to fill
  // the content region: from the top inset (safe area) down to the bottom inset
  // (e.g. the tab bar). `windowOffset` maps these screen coordinates back to the
  // container, which is the absolute wrapper's positioning origin.
  const screen = Dimensions.get('window');
  const webViewWrapperStyle: StyleProp<ViewStyle> = overlayOpen
    ? {
        position: 'absolute',
        top: overlayTop - windowOffset.y,
        left: -windowOffset.x,
        width: screen.width,
        height: Math.max(screen.height - overlayTop - overlayBottom, 0),
        zIndex: 9999,
        elevation: 9999,
      }
    : StyleSheet.absoluteFillObject;

  return (
    <View
      ref={containerRef}
      onLayout={measureContainer}
      style={[styles.container, style]}
    >
      <View style={webViewWrapperStyle}>
        {isLoading && (
          <CoinflowSkeleton
            loaderBackground={props.loaderBackground}
            style={styles.skeleton}
          />
        )}
        <WebView
          ref={webViewRef}
          style={styles.webView}
          webviewDebuggingEnabled={true}
          originWhitelist={['*']}
          keyboardDisplayRequiresUserAction={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          source={source}
          onMessage={handleMessage}
          onLoadStart={overlayOpen ? undefined : measureContainer}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    width: '100%',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});
