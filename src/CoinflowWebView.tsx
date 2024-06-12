import React, {useCallback, useMemo, useRef} from 'react';
import WebView from 'react-native-webview';
import {Linking, Platform, StyleProp, ViewStyle} from 'react-native';
import {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';
import {
  CoinflowIFrameProps,
  CoinflowUtils,
  handleIFrameMessage,
  IFrameMessageHandlers,
} from './common';

export type WithStyles = {style?: StyleProp<ViewStyle>};

export type WithOnLoad = {
  onLoad?: () => void;
};

export type CoinflowWebViewProps = Omit<CoinflowIFrameProps, 'IFrameRef'> &
  WithOnLoad;

export function CoinflowWebView(
  props: CoinflowWebViewProps & WithStyles & IFrameMessageHandlers
) {
  const WebViewRef = useRef<WebView>(null);

  const url = useMemo(() => {
    return CoinflowUtils.getCoinflowUrl(props);
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
      const promise = handleIFrameMessage(data, props);
      if (!promise) return;
      promise.then(sendMessage).catch(e => sendMessage('ERROR ' + e.message));
    },
    [props, sendMessage]
  );

  const {style, onLoad} = props;

  const onShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest) => {
      const whitelist = [
        'solscan',
        'etherscan',
        'persona',
        'polyscan',
        'near.org',
        'plaid',
        'coinflow.cash',
      ];

      const blacklist = ['pay.google.com', 'tokenex.com'];

      const shouldRedirect =
        (request.url.includes('https') || request.url.includes('http')) &&
        whitelist.some(item => request.url.includes(item)) &&
        !blacklist.some(item => request.url.includes(item));

      const isCurrentUrl = request.url.split('?')[0] === url.split('?')[0];

      if (!shouldRedirect || isCurrentUrl) return true;

      Linking.openURL(request.url).catch();
      return false;
    },
    []
  );

  return useMemo(() => {
    if (!props.walletPubkey) return null;

    const enableApplePay =
      !props.disableApplePay &&
      props.route.includes('/purchase/') &&
      Platform.OS === 'ios';

    return (
      <WebView
        style={[
          {
            flex: 1,
          },
          style,
        ]}
        enableApplePay={enableApplePay}
        keyboardDisplayRequiresUserAction={false}
        showsVerticalScrollIndicator={false}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        ref={WebViewRef}
        source={{uri: url}}
        onMessage={event =>
          handleIframeMessages({data: event.nativeEvent.data})
        }
        onLoad={onLoad}
      />
    );
  }, [url]);
}
