import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Linking, Platform, StyleProp, View, ViewStyle} from 'react-native';
import WebView from 'react-native-webview';
import {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes';
import {CoinflowSkeleton} from './CoinflowSkeleton';
import {
  CoinflowIFrameProps,
  CoinflowUtils,
  handleIFrameMessage,
  IFrameMessageHandlers,
  RN_REDIRECT_MESSAGE_NAME,
} from './common';

export type WithStyles = {style?: StyleProp<ViewStyle>};

export type WithOnLoad = {
  onLoad?: () => void;
  /**
   * Override the onShouldStartLoadWithRequest with your own function
   *
   * Function that allows custom handling of any web view requests. Return true from the function to continue loading the request and false to stop loading.
   */
  onShouldStartLoadWithRequest?: (request: ShouldStartLoadRequest) => boolean;
};

/**
 * How Venmo checkouts hand off to a browser. The two variants encode the two
 * valid host/presentation pairings — they are not independently mixable:
 * - 'venmo-app': system Safari + popup presentation. The customer switches
 *   into the native Venmo app; the continue page shows a return-to-app link.
 *   Works with no extra dependencies (default).
 * - 'in-app-browser': merchant-supplied in-app browser (SFSafariViewController
 *   / Custom Tabs) + modal presentation. The whole checkout stays in the
 *   sheet; provide closeBrowser so the SDK can dismiss it automatically when
 *   the payment completes.
 */
export type VenmoFlow =
  | {type: 'venmo-app'}
  | {
      type: 'in-app-browser';
      openBrowser: (url: string) => Promise<unknown>;
      closeBrowser?: () => void;
    };

export type WithVenmoFlow = {
  venmoFlow?: VenmoFlow;
};

export type WithBrowserRedirect = {
  /**
   * Called when the checkout needs to hand off to the system browser (e.g.
   * Venmo checkouts, which cannot complete inside an embedded webview).
   *
   * Defaults to `Linking.openURL` (full browser app). Provide this to open
   * the URL in an in-app browser instead, e.g. SFSafariViewController via
   * expo-web-browser's `openBrowserAsync` or
   * react-native-inappbrowser-reborn.
   */
  handleBrowserRedirect?: (url: string) => void | Promise<unknown>;
};

export type CoinflowWebViewProps = Omit<CoinflowIFrameProps, 'IFrameRef'> &
  WithOnLoad &
  WithBrowserRedirect &
  WithVenmoFlow & {
    /**
     * If set, the webview will only render the content after the webview sends a "loaded" message
     */
    waitForWebviewLoadedMessage?: boolean;
  };

/**
 * Applies the Venmo host/presentation pairing: the flow type decides both
 * where the continue page opens and which SDK presentation it requests, so
 * mismatched combinations are unrepresentable.
 */
function handleVenmoRedirect({
  callbackUrl,
  venmoFlow,
}: {
  callbackUrl: string;
  venmoFlow?: VenmoFlow;
}) {
  if (venmoFlow?.type === 'in-app-browser') {
    Promise.resolve(
      venmoFlow.openBrowser(`${callbackUrl}&presentation=modal`)
    ).catch(() => openVenmoAppFlow(callbackUrl));
    return;
  }
  openVenmoAppFlow(callbackUrl);
}

function openVenmoAppFlow(callbackUrl: string) {
  Linking.openURL(`${callbackUrl}&presentation=popup&display=browser`).catch(
    () => {
      // Terminal fallback for the Venmo handoff: nothing left to try. The
      // checkout page's status polling will surface the eventual timeout.
    }
  );
}

export function useRandomHandleHeightChangeId() {
  return useMemo(() => Math.random().toString(16).substring(2), []);
}

export function CoinflowWebView(
  props: CoinflowWebViewProps & WithStyles & IFrameMessageHandlers
) {
  const WebViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  const url = useMemo(() => {
    return CoinflowUtils.getCoinflowUrl({
      ...props,
      baseUrl: CoinflowUtils.getCoinflowAppBaseUrl(props.env),
    });
  }, [props]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!WebViewRef?.current) throw new Error('WebViewRef not defined');
      WebViewRef.current.postMessage(message);
    },
    [WebViewRef]
  );

  const handleIframeMessages = useCallback(
    ({data}: {data: string}) => {
      const promise = handleIFrameMessage(
        data,
        props,
        props.handleHeightChangeId
      );
      if (!promise) return;
      promise.then(sendMessage).catch(e => sendMessage('ERROR ' + e.message));
    },
    [props, sendMessage]
  );

  const {style, onLoad, venmoFlow, handleBrowserRedirect} = props;

  const onShouldStartLoadWithRequestOverride =
    props.onShouldStartLoadWithRequest;
  const onShouldStartLoadWithRequest = useCallback(
    (_request: ShouldStartLoadRequest) => {
      return true;
    },
    []
  );

  const handleError = () => {
    setIsLoading(false);
  };

  const handleLoad = useCallback(() => {
    // if we we only listen to a certain message, we shouldn't use onLoad to stop the loading, as the message they are listening for might not be sent yet
    if (props.waitForWebviewLoadedMessage) return;

    setIsLoading(false);
    onLoad?.();
  }, [props.waitForWebviewLoadedMessage, onLoad]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const {data} = event.nativeEvent;

      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (
            parsed.method === RN_REDIRECT_MESSAGE_NAME &&
            parsed.info?.callbackUrl
          ) {
            const callbackUrl = parsed.info.callbackUrl;
            if (parsed.info?.flow === 'venmo') {
              handleVenmoRedirect({callbackUrl, venmoFlow});
              return;
            }
            if (handleBrowserRedirect) {
              Promise.resolve(handleBrowserRedirect(callbackUrl)).catch(() =>
                Linking.openURL(callbackUrl).catch(() => {})
              );
            } else {
              Linking.openURL(callbackUrl).catch(() => {});
            }
            return;
          }
          // Auto-dismiss the Venmo in-app browser once the checkout reports
          // success — the sheet's job is done and the app should be in view.
          if (
            parsed.method === 'success' &&
            venmoFlow?.type === 'in-app-browser'
          ) {
            try {
              venmoFlow.closeBrowser?.();
            } catch {
              // Nothing to dismiss — the sheet may already be closed.
            }
          }
        } catch {
          // Not JSON, continue...
        }
      }

      handleIframeMessages({data});

      if (props.waitForWebviewLoadedMessage) {
        try {
          const message = JSON.parse(data);
          if (
            message &&
            typeof message === 'object' &&
            message.method === 'loaded'
          ) {
            setIsLoading(false);
            onLoad?.();
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      }
    },
    [
      onLoad,
      props.waitForWebviewLoadedMessage,
      handleBrowserRedirect,
      venmoFlow,
      handleIframeMessages,
    ]
  );

  return useMemo(() => {
    const enableApplePay =
      props.route.includes('/purchase/') && Platform.OS === 'ios';

    return (
      <View style={{flex: 1, position: 'relative'}}>
        {isLoading && (
          <CoinflowSkeleton
            loaderBackground={props.loaderBackground}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
            }}
          />
        )}
        <WebView
          style={[
            {
              flex: 1,
            },
            style,
          ]}
          webviewDebuggingEnabled={__DEV__}
          originWhitelist={['*']}
          enableApplePay={enableApplePay}
          keyboardDisplayRequiresUserAction={false}
          showsVerticalScrollIndicator={false}
          onShouldStartLoadWithRequest={
            onShouldStartLoadWithRequestOverride ?? onShouldStartLoadWithRequest
          }
          ref={WebViewRef}
          source={{uri: url}}
          onMessage={handleMessage}
          onError={handleError}
          onLoad={handleLoad}
        />
      </View>
    );
  }, [
    url,
    isLoading,
    props.loaderBackground,
    onShouldStartLoadWithRequest,
    handleMessage,
    handleLoad,
    onShouldStartLoadWithRequestOverride,
    props.route,
    style,
  ]);
}
