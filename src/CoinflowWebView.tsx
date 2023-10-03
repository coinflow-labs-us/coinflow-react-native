import React, {useMemo} from 'react';
import WebView from 'react-native-webview';
import {Linking} from 'react-native';
import {ReactNativeCoinflowUtils} from './ReactNativeCoinflowUtils';
import {CoinflowWebViewProps, WithStyles} from './CoinflowTypes';

export function CoinflowWebView(props: CoinflowWebViewProps & WithStyles) {
  const url = useMemo(() => {
    return ReactNativeCoinflowUtils.getCoinflowUrl(props);
  }, [props]);

  const {handleIframeMessages, WebViewRef, style, onLoad} = props;
  return useMemo(() => {
    if (!props.publicKey) return null;

    return (
      <WebView
        style={[
          {
            flex: 1,
          },
          style,
        ]}
        keyboardDisplayRequiresUserAction={false}
        showsVerticalScrollIndicator={false}
        onShouldStartLoadWithRequest={request => {
          const whitelist = [
            'solscan',
            'etherscan',
            'persona',
            'polyscan',
            'near.org',
            'plaid',
            'coinflow.cash',
          ];
          const shouldRedirect =
            (request.url.includes('https') || request.url.includes('http')) &&
            whitelist.some(item => request.url.includes(item));

          if (!shouldRedirect) return true;

          Linking.openURL(request.url).catch();
          return false;
        }}
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
