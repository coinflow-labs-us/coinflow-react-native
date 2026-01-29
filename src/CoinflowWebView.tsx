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

export type CoinflowWebViewProps = Omit<CoinflowIFrameProps, 'IFrameRef'> &
  WithOnLoad & {
    /**
     * If set, the webview will only render the content after the webview sends a "loaded" message
     */
    waitForWebviewLoadedMessage?: boolean;
  };

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

  const {style, onLoad} = props;

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
            Linking.openURL(parsed.info?.callbackUrl).catch();
            return;
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
    [onLoad, props.waitForWebviewLoadedMessage, handleIframeMessages]
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
          webviewDebuggingEnabled={true}
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
