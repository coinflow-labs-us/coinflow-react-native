import { __assign } from "tslib";
import React, { useMemo } from 'react';
import { CoinflowWebView, } from './CoinflowWebView';
import { getWalletPubkey, getHandlers, CoinflowUtils, } from './common';
function useCoinflowPurchase(purchaseProps, version) {
    var webviewProps = useMemo(function () {
        var walletPubkey = getWalletPubkey(purchaseProps);
        return __assign(__assign({}, purchaseProps), { walletPubkey: walletPubkey, route: "/purchase".concat(version, "/").concat(purchaseProps.merchantId), transaction: CoinflowUtils.getTransaction(purchaseProps), onLoad: purchaseProps.onLoad });
    }, [purchaseProps, version]);
    var messageHandlers = useMemo(function () {
        return __assign(__assign({}, getHandlers(purchaseProps)), { handleHeightChange: purchaseProps.handleHeightChange });
    }, [purchaseProps]);
    return { webviewProps: webviewProps, messageHandlers: messageHandlers };
}
export function CoinflowPurchase(purchaseProps) {
    var _a = useCoinflowPurchase(purchaseProps, '-v2'), webviewProps = _a.webviewProps, messageHandlers = _a.messageHandlers;
    return React.createElement(CoinflowWebView, __assign({}, webviewProps, messageHandlers));
}
//# sourceMappingURL=CoinflowPurchase.js.map