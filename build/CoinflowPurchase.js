import { __assign } from "tslib";
import React, { useMemo } from 'react';
import { CoinflowWebView, useRandomHandleHeightChangeId, } from './CoinflowWebView';
import { CoinflowUtils, getHandlers, getWalletPubkey, } from './common';
function useCoinflowPurchase(purchaseProps, version) {
    var handleHeightChangeId = useRandomHandleHeightChangeId();
    var webviewProps = useMemo(function () {
        var walletPubkey = getWalletPubkey(purchaseProps);
        return __assign(__assign({}, purchaseProps), { walletPubkey: walletPubkey, route: "/purchase".concat(version, "/").concat(purchaseProps.merchantId), transaction: CoinflowUtils.getTransaction(purchaseProps), onLoad: purchaseProps.onLoad, handleHeightChangeId: handleHeightChangeId });
    }, [handleHeightChangeId, purchaseProps, version]);
    var messageHandlers = useMemo(function () {
        return __assign(__assign({}, getHandlers(purchaseProps)), { handleHeightChange: purchaseProps.handleHeightChange });
    }, [purchaseProps]);
    return { webviewProps: webviewProps, messageHandlers: messageHandlers };
}
export function CoinflowPurchase(purchaseProps) {
    var _a = useCoinflowPurchase(purchaseProps, '-v2'), webviewProps = _a.webviewProps, messageHandlers = _a.messageHandlers;
    return (React.createElement(CoinflowWebView, __assign({}, webviewProps, messageHandlers, { waitForWebviewLoadedMessage: true })));
}
//# sourceMappingURL=CoinflowPurchase.js.map