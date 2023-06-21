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
          if (request.url === url || request.url.startsWith('about:blank')) {
            return true;
          }
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
