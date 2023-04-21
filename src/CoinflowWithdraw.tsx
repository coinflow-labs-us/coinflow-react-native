import {
  CoinflowWebView,
  CoinflowWebViewProps,
  WithStyles,
} from './CoinflowWebView';
import React from 'react';
import {Connection} from '@solana/web3.js';
import {CoinflowEnvs} from './ReactNativeCoinflowUtils';

type CoinflowWithdrawProps = {
  wallet: any;
  merchantId: string;
  connection: Connection;
  env?: CoinflowEnvs;
} & CoinflowWebViewProps;

export function CoinflowWithdraw({
  wallet,
  merchantId,
  env,
  style,
  WebViewRef,
  handleIframeMessages,
}: CoinflowWithdrawProps & WithStyles) {
  if (!wallet.publicKey || !wallet.connected) return null;

  return (
    <CoinflowWebView
      publicKey={wallet.publicKey.toString()}
      WebViewRef={WebViewRef}
      handleIframeMessages={handleIframeMessages}
      route={`/withdraw/${merchantId}`}
      env={env}
      style={style}
    />
  );
}
