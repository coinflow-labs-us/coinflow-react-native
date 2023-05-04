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
          // TODO ignore only coinflow urls all others open in browser
          if (
            request.url.includes('solscan') ||
            request.url.includes('persona')
          ) {
            Linking.openURL(request.url).catch();
            return false;
          }
          return true;
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
