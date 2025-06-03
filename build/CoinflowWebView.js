import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Linking, Platform, View } from 'react-native';
import WebView from 'react-native-webview';
import { CoinflowSkeleton } from './CoinflowSkeleton';
import { CoinflowUtils, handleIFrameMessage, } from './common';
export function useRandomHandleHeightChangeId() {
    return useMemo(function () { return Math.random().toString(16).substring(2); }, []);
}
export function CoinflowWebView(props) {
    var WebViewRef = useRef(null);
    var _a = useState(true), isLoading = _a[0], setIsLoading = _a[1];
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
    var handleError = function () {
        setIsLoading(false);
    };
    var handleLoad = function () {
        // if we we only listen to a certain message, we shouldn't use onLoad to stop the loading, as the message they are listening for might not be sent yet
        if (props.waitForWebviewLoadedMessage)
            return;
        setIsLoading(false);
        onLoad === null || onLoad === void 0 ? void 0 : onLoad();
    };
    var handleMessage = function (event) {
        var data = event.nativeEvent.data;
        handleIframeMessages({ data: data });
        if (props.waitForWebviewLoadedMessage) {
            try {
                var message = JSON.parse(data);
                if (message &&
                    typeof message === 'object' &&
                    message.method === 'loaded') {
                    setIsLoading(false);
                    onLoad === null || onLoad === void 0 ? void 0 : onLoad();
                }
            }
            catch (error) {
                console.error('Failed to parse message:', error);
            }
        }
    };
    return useMemo(function () {
        var enableApplePay = props.route.includes('/purchase/') && Platform.OS === 'ios';
        return (React.createElement(View, { style: { flex: 1, position: 'relative' } },
            isLoading && (React.createElement(CoinflowSkeleton, { loaderBackground: props.loaderBackground, style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1000,
                } })),
            React.createElement(WebView, { style: [
                    {
                        flex: 1,
                    },
                    style,
                ], webviewDebuggingEnabled: true, originWhitelist: ['*'], enableApplePay: enableApplePay, keyboardDisplayRequiresUserAction: false, showsVerticalScrollIndicator: false, onShouldStartLoadWithRequest: onShouldStartLoadWithRequest, ref: WebViewRef, source: { uri: url }, onMessage: handleMessage, onError: handleError, onLoad: handleLoad })));
    }, [url, isLoading]);
}
//# sourceMappingURL=CoinflowWebView.js.map