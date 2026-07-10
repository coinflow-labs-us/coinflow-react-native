import React, {useCallback, useMemo, useRef} from 'react';
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

  const url = useMemo(() => {
    const walletPubkey = getWalletPubkey(props);
    return CoinflowUtils.getCoinflowUrl({
      ...props,
      walletPubkey,
      transaction: undefined,
      routePrefix: 'form',
      route: `/apple-pay/${props.merchantId}`,
      handleHeightChangeId,
      baseUrl: CoinflowUtils.getCoinflowBaseUrl(props.env),
    });
  }, [props, handleHeightChangeId]);

  const source = useMemo(() => ({uri: url}), [url]);

  const sendMessage = useCallback((message: string) => {
    webViewRef.current?.postMessage(message);
  }, []);

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
        style={[styles.overlay, {backgroundColor: color}]}
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
