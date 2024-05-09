import { __assign } from "tslib";
import React, { useMemo } from 'react';
import { CoinflowWebView, } from './CoinflowWebView';
import { getWalletPubkey, getHandlers, CoinflowUtils, } from './common';
export function CoinflowPurchase(purchaseProps) {
    var webviewProps = useMemo(function () {
        var walletPubkey = getWalletPubkey(purchaseProps);
        return __assign(__assign({}, purchaseProps), { walletPubkey: walletPubkey, route: "/purchase/".concat(purchaseProps.merchantId), transaction: CoinflowUtils.getTransaction(purchaseProps), onLoad: purchaseProps.onLoad });
    }, [purchaseProps]);
    var messageHandlers = useMemo(function () {
        return __assign(__assign({}, getHandlers(purchaseProps)), { handleHeightChange: purchaseProps.handleHeightChange });
    }, [purchaseProps]);
    return React.createElement(CoinflowWebView, __assign({}, webviewProps, messageHandlers));
}
//# sourceMappingURL=CoinflowPurchase.js.map