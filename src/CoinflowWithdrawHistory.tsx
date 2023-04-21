import React from 'react';
import {CoinflowWebView, WithStyles} from './CoinflowWebView';
import {CoinflowEnvs} from './ReactNativeCoinflowUtils';
import {Connection} from '@solana/web3.js';
import {WebView} from 'react-native-webview';

export type CoinflowHistoryProps = {
  wallet: any;
  merchantId: string;
  connection: Connection;
  env?: CoinflowEnvs;
  WebViewRef: React.RefObject<WebView>;
  handleIframeMessages: ({data}: {data: string}) => Promise<void>;
};

export function CoinflowWithdrawHistory({
  wallet,
  merchantId,
  env,
  style,
  WebViewRef,
  handleIframeMessages,
}: CoinflowHistoryProps & WithStyles) {
  if (!wallet.publicKey || !wallet.connected) return null;

  return (
    <CoinflowWebView
      publicKey={wallet.publicKey.toString()}
      WebViewRef={WebViewRef}
      handleIframeMessages={handleIframeMessages}
      style={style}
      route={`/history/withdraw/${merchantId}`}
      env={env}
    />
  );
}
