function isJson(test) {
    if (test == null || ['string', 'number', 'boolean'].indexOf(typeof test) != -1)
        return true;
    if (Array.isArray(test)) {
        for (let value of test)
            if (!isJson(value))
                return false;
        return true;
    }
    if (typeof test == 'object') {
        if (Object.getPrototypeOf(test) != null && test.constructor != Object)
            return false;
        if (Object.getOwnPropertySymbols(test).length > 0)
            return false;
        for (let [key, value] of Object.entries(test))
            if (!isJson(test[key]))
                return false;
        return true;
    }
    return false;
}
function toJson(struct) {
    let json = null;
    if (isJson(struct))
        json = struct;
    else if (Array.isArray(struct) || struct instanceof Set) {
        json = [];
        let structCast = struct instanceof Set ? struct : struct;
        for (let value of structCast)
            json.push(toJson(value));
    }
    else if (Object.getPrototypeOf(struct) == null || struct.constructor == Object || struct instanceof Map) {
        json = {};
        let structCast = struct instanceof Map ? struct : Object.entries(struct);
        for (let [key, value] of structCast)
            json[key] = toJson(value);
    }
    return json;
}
//# sourceMappingURL=toJson.js.map