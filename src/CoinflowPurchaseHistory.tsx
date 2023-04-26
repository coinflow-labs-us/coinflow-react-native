import React, {useMemo} from 'react';
import {CoinflowWebView} from './CoinflowWebView';
import {CoinflowHistoryProps, WithStyles} from './CoinflowTypes';

export function CoinflowPurchaseHistory(
  props: CoinflowHistoryProps & WithStyles
) {
  const WebViewRef = React.useRef<any | null>(null); // TODO dont use any

  const publicKey = useMemo(() => {
    switch (props.blockchain) {
      case 'solana':
        return props.wallet.publicKey?.toString();
      case 'near':
        return props.wallet.accountId;
      case 'polygon':
        return props.wallet.address;
    }
  }, []);

  return (
    <CoinflowWebView
      publicKey={publicKey}
      WebViewRef={WebViewRef}
      handleIframeMessages={() => Promise.resolve()}
      route={`/history/purchase/${props.merchantId}`}
      {...props}
    />
  );
}
