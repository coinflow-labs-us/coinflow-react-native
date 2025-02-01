import React, { useCallback, useMemo, useRef } from 'react';
import WebView from 'react-native-webview';
import { Linking, Platform } from 'react-native';
import { CoinflowUtils, handleIFrameMessage, } from './common';
export function useRandomHandleHeightChangeId() {
    return useMemo(function () { return Math.random().toString(16).substring(2); }, []);
}
export function CoinflowWebView(props) {
    var WebViewRef = useRef(null);
    var url = useMemo(function () {
        return CoinflowUtils.getCoinflowUrl(props);
    }, [props]);
    var sendMessage = useCallback(function (message) {
        if (!(WebViewRef === null || WebViewRef === void 0 ? void 0 : WebViewRef.current))
            throw new Error('WebViewRef not defined');
        WebViewRef.current.postMessage(message);
    }, [WebViewRef]);
    var handleIframeMessages = useCallback(function (_a) {
        var data = _a.data;
        var promise = handleIFrameMessage(data, props, props.handleHeightChangeId);
        if (!promise)
            return;
        promise.then(sendMessage).catch(function (e) { return sendMessage('ERROR ' + e.message); });
    }, [props, sendMessage]);
    var style = props.style, onLoad = props.onLoad;
    var onShouldStartLoadWithRequest = useCallback(function (request) {
        var whitelist = [
            'solscan',
            'etherscan',
            'persona',
            'polyscan',
            'localhost:3000',
            'coinflow.cash',
        ];
        var blacklist = ['pay.google.com', 'tokenex.com', 'api'];
        var shouldRedirect = (request.url.includes('https') || request.url.includes('http')) &&
            whitelist.some(function (item) { return request.url.includes(item); }) &&
            !blacklist.some(function (item) { return request.url.includes(item); });
        var isCurrentUrl = request.url.split('?')[0] === url.split('?')[0];
        if (!shouldRedirect || isCurrentUrl)
            return true;
        Linking.openURL(request.url).catch();
        return false;
    }, []);
    return useMemo(function () {
        var enableApplePay = props.route.includes('/purchase/') && Platform.OS === 'ios';
        return (React.createElement(WebView, { style: [
                {
                    flex: 1,
                },
                style,
            ], webviewDebuggingEnabled: true, originWhitelist: ['*'], enableApplePay: enableApplePay, keyboardDisplayRequiresUserAction: false, showsVerticalScrollIndicator: false, onShouldStartLoadWithRequest: onShouldStartLoadWithRequest, ref: WebViewRef, source: { uri: url }, onMessage: function (event) {
                return handleIframeMessages({ data: event.nativeEvent.data });
            }, onLoad: onLoad }));
    }, [url]);
}
//# sourceMappingURL=CoinflowWebView.js.map