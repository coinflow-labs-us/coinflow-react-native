import React, {useCallback, useMemo} from 'react';
import WebView from 'react-native-webview';
import {Linking, Platform} from 'react-native';
import {ReactNativeCoinflowUtils} from './ReactNativeCoinflowUtils';
import {CoinflowWebViewProps, WithStyles} from './CoinflowTypes';
import {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

export function CoinflowWebView(props: CoinflowWebViewProps & WithStyles) {
  const url = useMemo(() => {
    return ReactNativeCoinflowUtils.getCoinflowUrl(props);
  }, [props]);

  const {handleIframeMessages, WebViewRef, style, onLoad} = props;

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

      const blacklist = ['pay.google.com'];

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
    if (!props.publicKey) return null;

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
