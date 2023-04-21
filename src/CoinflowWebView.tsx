import React, {useMemo} from 'react';
import WebView from 'react-native-webview';
import {Linking, StyleProp, ViewStyle} from 'react-native';
import {
  CoinflowEnvs,
  ReactNativeCoinflowUtils,
} from './ReactNativeCoinflowUtils';
import {Transaction} from '@solana/web3.js';

type CoinflowIFrameProps = {
  publicKey: string;
  IFrameRef: React.RefObject<HTMLIFrameElement>;
  env?: CoinflowEnvs;
  route: string;
  amount?: number;
  transaction?: Transaction;
  onLoad?: () => void;
};

export type CoinflowWebViewProps = Omit<CoinflowIFrameProps, 'IFrameRef'> & {
  handleIframeMessages: ({data}: {data: string}) => Promise<void>;
  WebViewRef: React.RefObject<WebView>;
};

export type WithStyles = {style?: StyleProp<ViewStyle>};

export function CoinflowWebView({
  publicKey,
  env,
  route,
  transaction,
  amount,
  handleIframeMessages,
  WebViewRef,
  style,
  onLoad,
}: CoinflowWebViewProps & WithStyles) {
  const url = useMemo(() => {
    return ReactNativeCoinflowUtils.getCoinflowUrl({
      amount,
      env,
      publicKey,
      route,
      transaction,
    });
  }, [amount, env, publicKey, route, transaction]);

  return useMemo(
    () => (
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
          if (request.url.includes('solscan')) {
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
    ),
    [url]
  );
}
