import { __assign } from "tslib";
import React, { useMemo } from 'react';
import { CoinflowWebView, useRandomHandleHeightChangeId, } from './CoinflowWebView';
import { getWalletPubkey, getHandlers, } from './common';
export function CoinflowPurchaseHistory(props) {
    var handleHeightChangeId = useRandomHandleHeightChangeId();
    var webviewProps = useMemo(function () {
        var walletPubkey = getWalletPubkey(props);
        return __assign(__assign({}, props), { walletPubkey: walletPubkey, route: "/history/purchase/".concat(props.merchantId), onLoad: props.onLoad, handleHeightChangeId: handleHeightChangeId });
    }, [props, handleHeightChangeId]);
    var messageHandlers = useMemo(function () {
        return __assign(__assign({}, getHandlers(props)), { handleHeightChange: props.handleHeightChange });
    }, [props]);
    return React.createElement(CoinflowWebView, __assign({}, webviewProps, messageHandlers));
}
//# sourceMappingURL=CoinflowPurchaseHistory.js.map