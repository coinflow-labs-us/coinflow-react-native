import React, {useMemo} from 'react';
import {
  CoinflowWebView,
  CoinflowWebViewProps,
  WithOnLoad,
  WithStyles,
} from './CoinflowWebView';
import {
  getWalletPubkey,
  getHandlers,
  IFrameMessageHandlers,
  CoinflowWithdrawProps,
} from './common';

export function CoinflowWithdraw(
  withdrawProps: CoinflowWithdrawProps & WithStyles & WithOnLoad
) {
  const webviewProps = useMemo<CoinflowWebViewProps>(() => {
    const walletPubkey = getWalletPubkey(withdrawProps);
    return {
      ...withdrawProps,
      walletPubkey,
      route: `/withdraw/${withdrawProps.merchantId}`,
      onLoad: withdrawProps.onLoad,
    };
  }, [withdrawProps]);

  const messageHandlers = useMemo<IFrameMessageHandlers>(() => {
    return {
      ...getHandlers(withdrawProps),
      handleHeightChange: withdrawProps.handleHeightChange,
    };
  }, [withdrawProps]);

  return <CoinflowWebView {...webviewProps} {...messageHandlers} />;
}
