import React, {useMemo} from 'react';
import {
  CoinflowWebView,
  CoinflowWebViewProps,
  useRandomHandleHeightChangeId,
  WithOnLoad,
  WithStyles,
} from './CoinflowWebView';
import {
  getWalletPubkey,
  getHandlers,
  IFrameMessageHandlers,
  CoinflowHistoryProps,
} from './common';

export function CoinflowPurchaseHistory(
  props: CoinflowHistoryProps & WithStyles & WithOnLoad
) {
  const handleHeightChangeId = useRandomHandleHeightChangeId();
  const webviewProps = useMemo<CoinflowWebViewProps>(() => {
    const walletPubkey = getWalletPubkey(props);
    return {
      ...props,
      walletPubkey,
      route: `/history/purchase/${props.merchantId}`,
      onLoad: props.onLoad,
      handleHeightChangeId,
    };
  }, [props, handleHeightChangeId]);

  const messageHandlers = useMemo<IFrameMessageHandlers>(() => {
    return {
      ...getHandlers(props),
      handleHeightChange: props.handleHeightChange,
    };
  }, [props]);

  return <CoinflowWebView {...webviewProps} {...messageHandlers} />;
}
