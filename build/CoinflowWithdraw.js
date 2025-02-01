import { __assign } from "tslib";
import React, { useMemo } from 'react';
import { CoinflowWebView, useRandomHandleHeightChangeId, } from './CoinflowWebView';
import { getWalletPubkey, getHandlers, } from './common';
export function CoinflowWithdraw(withdrawProps) {
    var handleHeightChangeId = useRandomHandleHeightChangeId();
    var webviewProps = useMemo(function () {
        var walletPubkey = getWalletPubkey(withdrawProps);
        return __assign(__assign({}, withdrawProps), { walletPubkey: walletPubkey, route: "/withdraw/".concat(withdrawProps.merchantId), onLoad: withdrawProps.onLoad, handleHeightChangeId: handleHeightChangeId });
    }, [withdrawProps, handleHeightChangeId, withdrawProps]);
    var messageHandlers = useMemo(function () {
        return __assign(__assign({}, getHandlers(withdrawProps)), { handleHeightChange: withdrawProps.handleHeightChange });
    }, [withdrawProps]);
    return React.createElement(CoinflowWebView, __assign({}, webviewProps, messageHandlers));
}
//# sourceMappingURL=CoinflowWithdraw.js.map