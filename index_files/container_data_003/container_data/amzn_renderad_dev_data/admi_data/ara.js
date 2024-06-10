const doc = typeof window !== 'undefined' ? window.document : document;
const thisScript = doc.currentScript;
const MIN_SUPPORTED_BRAND_VERSIONS = {
    'Google Chrome': 106,
};

function checkIsBrowserSupported() {
    const userAgentData = navigator.userAgentData;
    if (userAgentData == null) {
        return false;
    }
    const brands = userAgentData.brands;
    return isEligible(brands) && checkIsFeatureAllowed();
}

function isEligible(agentBrands) {
    if (!agentBrands || agentBrands.length === 0) {
        return false;
    }
    for (let brand of agentBrands) {
        const version = Number.parseFloat(brand.version);
        if (version >= MIN_SUPPORTED_BRAND_VERSIONS[brand.brand]) {
            return true;
        }
    }
    return false;
}

function checkIsFeatureAllowed() {
    if ('featurePolicy' in document && typeof document.featurePolicy.allowsFeature === 'function') {
        return document.featurePolicy.allowsFeature('attribution-reporting');
    } else {
        return false;
    }
}

function extractParamsValues(paramKeyMapping) {
    const url = new URL(thisScript.src);

    var queryString = '';
    try {
        queryString = url.search;
    } catch (error) {
        console.log ("Error obtaining script query parameters: ", error);
    }

    var paramValues = {};
    try {
        var payloadParams = new URLSearchParams(decodeURIComponent(queryString));
        if (payloadParams) {
            for (var paramKey in paramKeyMapping) {
                var value = payloadParams.has(paramKey) ? payloadParams.get(paramKey) : null;
                var mappedParamKey = paramKeyMapping[paramKey];
                paramValues[mappedParamKey] = value;
            }
        }
    } catch (error) {
        console.log ("Error fetching params: ", error);
    }
    return paramValues;
}

function handleView() {
    const baseUrl = 'https://ara.paa-reporting-advertising.amazon/register-source';
    const attributionReporting = {
      eventSourceEligible: true,
      triggerEligible: false,
    };

    const paramKeyMapping = {
        adId: 'lineId',
        bidId: 'bidId',
        campaignId: 'campaignId',
        clickDestnUrl: 'destination',
        creativeId: 'creativeId',
        gdpr: 'gdpr',
        gdprConsent: 'gdprConsent',
        is3p: 'is3p',
        sessionId: 'sessionId', 
        srcName: 'sourceName',
        uid: 'uid',
    };
    const params = extractParamsValues(paramKeyMapping);
    var queryString = '?eventType=view';
    for(var key in params){
        queryString += '&' + key + '=' + encodeURIComponent(params[key]);
    }
    window.fetch(baseUrl + queryString, {keepalive: true, attributionReporting, credentials: 'include'});
}

function init() {
    if (checkIsBrowserSupported()) {
        document.addEventListener("amzncsmIabView", handleView);
    }
}

init();
