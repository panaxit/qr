var xdom = {};
xdom.app = {};
xdom.debug = {};
xdom.cache = {};
xdom.callStack = [];
xdom.browser = {};
xdom.cryptography = {};
xdom.cryptography.generateUUID = function () {//from https://gist.github.com/jed/982883
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ cryptography.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
xdom.cryptography.decodeJwt = function (token) {//from https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
xdom.cryptography.encodeBase64 = function (str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}
xdom.cryptography.encodeMD5 = function (str) {
    /*
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321.
     * Copyright (C) Paul Johnston 1999 - 2000.
     * Updated by Greg Holt 2000 - 2001.
     * See http://pajhome.org.uk/site/legal.html for details.
     */

    /*
     * Convert a 32-bit number to a hex string with ls-byte first
     */
    var hex_chr = "0123456789abcdef";
    function rhex(num) {
        str = "";
        for (j = 0; j <= 3; j++)
            str += hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) +
                hex_chr.charAt((num >> (j * 8)) & 0x0F);
        return str;
    }

    /*
     * Convert a string to a sequence of 16-word blocks, stored as an array.
     * Append padding bits and the length, as described in the MD5 standard.
     */
    function str2blks_MD5(str) {
        nblk = ((str.length + 8) >> 6) + 1;
        blks = new Array(nblk * 16);
        for (i = 0; i < nblk * 16; i++) blks[i] = 0;
        for (i = 0; i < str.length; i++)
            blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
        blks[i >> 2] |= 0x80 << ((i % 4) * 8);
        blks[nblk * 16 - 2] = str.length * 8;
        return blks;
    }

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally 
     * to work around bugs in some JS interpreters.
     */
    function add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left
     */
    function rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
     * These functions implement the basic operation for each round of the
     * algorithm.
     */
    function cmn(q, a, b, x, s, t) {
        return add(rol(add(add(a, q), add(x, t)), s), b);
    }
    function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    x = str2blks_MD5(str);
    a = 1732584193;
    b = -271733879;
    c = -1732584194;
    d = 271733878;

    for (i = 0; i < x.length; i += 16) {
        olda = a;
        oldb = b;
        oldc = c;
        oldd = d;

        a = ff(a, b, c, d, x[i + 0], 7, -680876936);
        d = ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = ff(c, d, a, b, x[i + 10], 17, -42063);
        b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = ff(b, c, d, a, x[i + 15], 22, 1236535329);

        a = gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = gg(b, c, d, a, x[i + 0], 20, -373897302);
        a = gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = gg(b, c, d, a, x[i + 12], 20, -1926607734);

        a = hh(a, b, c, d, x[i + 5], 4, -378558);
        d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = hh(d, a, b, c, x[i + 0], 11, -358537222);
        c = hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = hh(b, c, d, a, x[i + 2], 23, -995338651);

        a = ii(a, b, c, d, x[i + 0], 6, -198630844);
        d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = ii(b, c, d, a, x[i + 9], 21, -343485551);

        a = add(a, olda);
        b = add(b, oldb);
        c = add(c, oldc);
        d = add(d, oldd);
    }
    return rhex(a) + rhex(b) + rhex(c) + rhex(d);
}

xdom.custom = {};
xdom.defaults = {}
xdom.defaults.library = {}
xdom.devTools = {};
xdom.data = {};
xdom.data.stores = new Proxy({}, {
    get: function (self, key) {
        //key = (key || '#') == '#' && xdom.state.active || key
        if (self.hasOwnProperty(key) && self[key]) {
            return self[key];
        } else if (key.match(/^#/)) {
            let _stored_doc = xdom.session.getKey(key);
            let _store = self[key] || _stored_doc && _stored_doc.documentElement && new xdom.data.Store(_stored_doc, { tag: key }) || xdom.defaults[key] && new xdom.data.Store(xdom.defaults[key], { tag: key });
            if (_store) {
                self[key] = _store;
            }
            return self[key];
        } else {
            return null;
        }
    },
    set: function (self, key, value) {
        let refresh;
        if (value && !(value instanceof xdom.data.Store)) {
            throw ('Store supplied is not valid type');
        }
        //if (self[key] != value) {
        //    refresh = true
        //}
        //xdom.session.setKey("state:" + key, value);
        //var return_value;
        //if (refresh) {
        //    var key = key, value = value;

        //    let libraries = Object.values(xdom.data.stores).reduce((libraries, document) => {
        //        libraries = [...libraries, ...Object.values(document.library || {})];
        //        return libraries;
        //    }, []);
        //    await Promise.all(libraries);
        //    Object.values(xdom.data.stores.getActive()).filter(document => {
        //        return [...Object.values(document.library || {})].filter(stylesheet => {
        //            return !!(stylesheet || window.document.createElement('p')).selectFirst(`//xsl:stylesheet/xsl:param[@key='state:${key}']`)
        //        }).length
        //    }).map(document => {
        //        console.log(`Rendering ${document.tag} triggered by ${key}`);
        //        return_value = document.render(true, { delay: 0 });
        //    });
        //}
        self[key] = value
        return self[key];
    },
    deleteProperty: function (self, key) {
        sessionStorage.removeItem(key);
        delete self[key];
    }
});
xdom.data.binding = {};
xdom.data.binding["max_subscribers"] = 30;
xdom.data.binding.sources = {};
xdom.data.binding.requests = {};
xdom.data.filter = {};
xdom.data.history = {};
xdom.data.history.cascade = {};
xdom.data.history.undo = [];
xdom.data.history.redo = [];
xdom.data.titles = {};
xdom.deprecated = {};
xdom.db = {};
xdom.dom = {};
xdom.dom.history = [];
xdom.dom.intervals = new Proxy({}, {
    get: function (self, key) {
        return self[key];
    },
    set: function (self, key, input) {
        self[key] = input;
        return self[key];
    },
    deleteProperty: function (self, key) {
        if (key in self) {
            window.clearInterval(self[key]);
            delete self[key];
        }
    }
})

xdom.dom.controls = {};
xdom.dom.refreshTitle = function (input) {
    let document_title = (input || document.title).match(/([^\(]+)(.*)/);
    let [, title, environment] = (document_title || [, "", ""]);
    document.title = title.replace(/\s+$/, '') + (` (${xdom.session.database_id && xdom.session.database_id != 'main' ? xdom.session.database_id : 'v.'} ${xdom.session.cache_name && xdom.session.cache_name.split('_').pop() || ""})`).replace(/\((v\.)?\s+\)|\s+(?=\))/g, '');
}
xdom.dom.state = new Proxy({}, {
    get: function (target, name) {
        return target[name] || xdom.session.getKey("state:" + name);
    },
    set: function (target, name, value) {
        let refresh;
        if (value && ['object', 'function'].includes(typeof (value))) {
            throw ('State value is not valid type');
        }
        if (target[name] != value) {
            refresh = true
        }
        xdom.session.setKey("state:" + name, value);
        var return_value;
        if (refresh) {
            var name = name, value = value;

            let libraries = Object.values(xdom.data.stores).reduce((libraries, document) => {
                libraries = [...libraries, ...Object.values(document.library || {})];
                return libraries;
            }, []);
            Promise.all(libraries).then(() => {
                Object.values(xdom.data.stores.getActive()).filter(document => {
                    return [...Object.values(document.library || {})].filter(stylesheet => {
                        return !!(stylesheet || window.document.createElement('p')).selectFirst(`//xsl:stylesheet/xsl:param[@name='state:${name}']`)
                    }).length
                }).map(document => {
                    console.log(`Rendering ${document.tag} triggered by ${name}`);
                    return_value = document.render(true, { delay: 0 });
                });
            });
        }
        return (return_value || Promise.resolve());
    }
});
xdom.json = {};
xdom.listeners = {};
xdom.listeners.keys = {};
xdom.listeners.xml = {};
xdom.listeners.dom = {};
xdom.listeners.events = {};
xdom.mimeTypes = {};
xdom.mimeTypes["js"] = "application/javascript"
xdom.mimeTypes["json"] = "application/json"
xdom.mimeTypes["xml"] = "text/xml"
xdom.mimeTypes["xsl"] = "text/xsl"
xdom.mimeTypes["xslt"] = "text/xslt"
xdom.manifest = {};
xdom.messages = {};
xdom.server = new Proxy({}, {
    get: function (self, key) {
        if ((self.hasOwnProperty(key) && xdom.manifest.server && xdom.manifest.server.endpoints && xdom.manifest.server.endpoints[key])) {
            return self[key];
        } else {
            throw (`Endpoint "${key}" not configured`);
        }
    }
})

Object.defineProperty(xdom, 'state', {
    get: function () {
        let current_state = {
            seed: ((history.state || {}).seed || "#")
            , active: ((history.state || {}).active || "#")
            , prev: ((history.state || {}).prev || [])
            , next: ((history.state || {}).next || undefined)
            , active_tags: ((history.state || {}).active_tags || [])
            , stores: ((history.state || {}).stores || {})
        }
        if (Object.keys(history.state || {}).length != Object.keys(current_state).length) { /* xdom.json.difference(current_state, history.state)*/
            history.replaceState(current_state, {}, (window.top || window).location.hash);
        }

        let state = new Proxy(current_state, {
            get: function (self, key) {
                if (self[key]) {
                    return self[key];
                } else {
                    return history.state[key]
                }
            },
            set: function (self, key, input) {
                self.update(new Object().push(key, input));
            }
        })

        Object.defineProperty(state, 'active', {
            get: function () {
                if (xdom.session.status != 'authorized') {
                    return "#login";
                } else {
                    return history.state["active"];
                }
            },
            set: function (input) {
                this.update({ "active": input });
            }
        });

        Object.defineProperty(state, 'update', {
            value: function (new_state) {
                if (!new_state) return;
                let state = Object.assign({}, current_state, new_state);
                delete state.active;
                state.active = new_state.active || history.state.active;
                let store = xdom.data.stores[current_state.active] || xdom.data.stores['#shell'];
                let hash = xdom.data.coalesce(new_state.hash, store.hash, (window.top || window).location.hash);
                history.replaceState(state, ((event || {}).target || {}).textContent, hash);
            }
            , enumerable: false, configurable: false
        });
        return state
    }
})

xdom.sources = new Proxy({}, {
    get: function (self, key) {
        var _manifest = (xdom.manifest.sources || {}).cloneObject();
        var value = undefined;
        do {
            if (_manifest.hasOwnProperty(value)) {
                key = value;
            }
            value = _manifest[key];
            delete _manifest[key]; //se borra para evitar referencias cíclicas
        } while (_manifest.hasOwnProperty(value))
        if (!value) {
            return null;
        }
        var _value = isFunction(value) && Function.prototype || String.prototype;
        var _dictionary = {}
        if (isFunction(value)) {
            if (!value.hasOwnProperty('tag')) {
                Object.defineProperty(value, 'tag', {
                    get: function () {
                        return key
                    }
                });
            }
            _value.fetch = value;
        } else if (isObject(value) && value["url"]) {
            _dictionary[String(value)] = key;
            if (!value.hasOwnProperty('tag')) {
                Object.defineProperty(value, 'tag', {
                    value: key,
                    writable: false, enumerable: false, configurable: false
                });
            }
            Object.defineProperty(value, 'fetch', {
                value: async function () {
                    let key_name = this.tag;
                    let source = this.cloneObject();
                    let url = source["url"];
                    delete source["url"];
                    let document = await xdom.fetch.xml(url, source);
                    source["stylesheets"] && source["stylesheets"].reverse().map(stylesheet => {
                        document.addStylesheet(stylesheet);
                    });
                    document = new xdom.data.Store(document, { tag: key_name });
                    if (window.document.querySelector(`[xo-source='${key_name}']`)) {
                        document.isActive = true;
                    }
                    document.render();
                    return document;
                },
                writable: true, enumerable: false, configurable: false
            });
        } else {
            _dictionary[value] = key;
            if (!_value.hasOwnProperty('tag')) {
                Object.defineProperty(_value, 'tag', {
                    get: function () {
                        return _dictionary[this]
                    }
                });
            }
            Object.defineProperty(_value, 'fetch', {
                value: async function () {
                    let key_name = this.tag;
                    let value = this.toString();
                    try {
                        let document = await xdom.fetch.xml(value);
                        document = new xdom.data.Store(document, { tag: key_name });
                        if (window.document.querySelector(`[xo-source='${key_name}']`)) {
                            document.isActive = true;
                        }
                        document.render();
                        //if (key == "#" || xdom.data.stores[(window.top || window).location.hash]) {
                        //    xdom.data.document = document;
                        //}

                        return document;
                    } catch (e) {
                        throw (e);
                    }

                    if (key_name) {
                        !xdom.data.stores[key_name]
                    } else {
                        xdom.data.stores[document.tag];
                    }
                },
                writable: true, enumerable: false, configurable: false
            });
        }
        _value = value;
        return _value;
    }
})

xdom.session = new Proxy({}, {
    get: function (self, key) {
        if (self.hasOwnProperty(key)) {
            return self[key];
        } else {
            return xdom.session.getKey(key);
        }
    },
    set: function (self, key, value) {
        let refresh;
        let old_value = xdom.session[key];
        if (value && ['object', 'function'].includes(typeof (value))) {
            throw ('Session value is not valid type');
        }
        if (xdom.session[key] !== value) {
            refresh = true
        }
        if (self.hasOwnProperty(key)) {
            self[key] = value;
        }
        xdom.session.setKey(key, value);
        var return_value
        if (refresh) {
            var key = key, value = value;
            window.top.dispatchEvent(new CustomEvent('sessionChanged', { detail: { attribute: key, newValue: value, oldValue: old_value } }));
            let active_stores = xdom.data.stores.getActive();
            [...Object.values(active_stores), ...Object.values(active_stores.getInitiators())].filter(async document => {
                await document.library.load();
                let stylesheets = await document.getStylesheets().getDocuments();

                if (["status"].includes(key) || stylesheets.find(stylesheet => {
                    return !!(stylesheet || window.document.createElement('p')).selectFirst(`//xsl:stylesheet/xsl:param[@name='session:${key}']`)
                })) {
                    console.log(`Rendering ${document.tag} triggered by ${key}`);
                    if (xdom.data.document.initiator == document) {
                        xdom.data.document = document
                    } else if (document.initiator) {
                        xdom.data.document = document.initiator;
                    } else {
                        return_value = document.render(true, { delay: 0 });
                    }
                }
            })

            if (xdom.session.id) {
                xdom.storage.setKey(key, value);
                xdom.storage.setKey(key, undefined);
            }
        }
        return return_value;
    }
})
xdom.storage = {};
xdom.tools = {};
xdom.xhr = {};
xdom.fetch = {};
xdom.xhr.cache = {};
xdom.xhr.Requests = {};
xdom.xml = {};
xdom.xml.namespaces = {};
xdom.xml.namespaces["debug"] = 'http://panax.io/debug'
xdom.xml.namespaces["js"] = 'http://panax.io/xdom/javascript'
xdom.xml.namespaces["session"] = 'http://panax.io/session'
xdom.xml.namespaces["shell"] = 'http://panax.io/shell'
xdom.xml.namespaces["state"] = 'http://panax.io/state'
xdom.xml.namespaces["context"] = 'http://panax.io/context'
xdom.xml.namespaces["source"] = 'http://panax.io/xdom/binding/source'
xdom.xml.namespaces["temp"] = 'http://panax.io/temp'
xdom.xml.namespaces["xmlns"] = 'http://www.w3.org/2000/xmlns/'
xdom.xml.namespaces["x"] = 'http://panax.io/xdom'
xdom.xml.namespaces["xml"] = 'http://www.w3.org/XML/1998/namespace'
xdom.xml.namespaces["xsl"] = 'http://www.w3.org/1999/XSL/Transform'
xdom.xml.namespaces["transformiix"] = 'http://www.mozilla.org/TransforMiix'

xdom.datagrid = {};
xdom.datagrid.columns = {};

xdom.messages.alert = function (message) {
    let xMessage = xdom.data.createMessage(message)
    xMessage.addStylesheet({ href: "message.xslt", role: "modal" })
    dom = xdom.xml.transform(xMessage);
    document.body.appendChild(dom.documentElement)
}


Object.defineProperty(xdom.session, 'updateSession', {
    value: async function (attribute, sync) {
        //var xsl = (xdom.library["xdom/resources/session.xslt"] ? (xdom.library["xdom/resources/session.xslt"].document || xdom.library["xdom/resources/session.xslt"]) : undefined);
        //if (!xsl) {
        //    console.warn(xdom.messages["xdom.session.updateSession.error"] || "Can't find session file or variable " + attribute + " in it");
        //    return;
        //}
        let session_variables;
        if (!attribute) {
            return;
        } else if (attribute.constructor == {}.constructor) {
            session_variables = new URLSearchParams(attribute);
        } /*else {
            session_variables = new URLSearchParams(`${attribute}=${value}`);
        }*/
        for (var pair of session_variables.entries()) {
            xdom.session[pair[0]] = pair[1];
        }
        /*Se deshabilita la actualización por default*/
        if (sync && navigator.onLine && (xdom.manifest.server || {}).endpoints["session"] && xdom.session.status == 'authorized') {
            xdom.post.to((xdom.manifest.server || {}).endpoints["session"], session_variables).catch(([response]) => {
                console.log("Error al enviar sesión")
            })
        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'id', {
    get: function () {
        return xdom.session.getKey("id")
    }
    , set: function (input) {
        xdom.session.setKey("id", input);
    }
});

Object.defineProperty(xdom.session, 'status', {
    get: function () {
        return xdom.session.getKey("status")
    }
    , set: function (input) {
        xdom.session.setKey("status", input);
    }
});

Object.defineProperty(xdom.session, 'user_login', {
    get: function () {
        return xdom.session.getKey("user_login")
    }
    , set: function (input) {
        if (xdom.session.getKey("user_login") != input) {
            xdom.session.id_token = undefined;
        }
        xdom.session.setKey("user_login", input);
    }
});

Object.defineProperty(xdom.session, 'connection_id', {
    get: function () {
        return xdom.session.getKey("database_id")
    }
    , set: function (input) {
        xdom.session.database_id = input;
    }
});

//var __database_id_getter = function () { return xdom.session.getKey("database_id") }  /*muestra de getter dinámico*/
Object.defineProperty(xdom.session, 'database_id', {
    get: function () {
        return (isFunction(xdom.manifest.server.database_id) && xdom.manifest.server.database_id() || xdom.session.getKey("database_id") || xdom.manifest.server.database_id)
    }
    , set: async function (input) {
        xdom.session.setKey("database_id", input);
        xdom.dom.refreshTitle();
    }
});

Object.defineProperty(xdom.session, 'connect', {
    value: function (input) {
        xdom.session.id = (input || xdom.session.id || xdom.cryptography.generateUUID());
        return xdom.session.id;
    },
    writable: true, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'disconnect', {
    value: function (input) {
        xdom.session.id = undefined;
        return xdom.session.id;
    },
    writable: true, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'cache_name', {
    get: function () {
        return xdom.session.getKey("cache_name") || "";
    }
    , set: function (input) {
        xdom.session.setKey("cache_name", input);
    }
});

Object.defineProperty(xdom.session, 'getKey', {
    value: function (key) {
        if (typeof (Storage) !== "undefined") {
            var value = sessionStorage.getItem(key);
            if (value == "null" || value == "undefined") { //Para guardar específicamente null o undefined, se guardarían como texto plano;
                return eval(value);
            } else if (value && key.indexOf("#") != -1) {
                return (xdom.xml.createDocument(value, false) || value);
            } else {
                return (value || undefined); //Se está considerando que si no existe el key, estaría regresando null (si el valor que se quiso guardar fue null, se habría guardado como "null" y se habría atendido en la primer condición). En este caso es mejor definirlo como undefined (no se ha definido)
            }
        } else {
            console.error('Storage is not supported by your browser')
        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'setKey', {
    value: function (key, value) {
        if (typeof (Storage) !== "undefined") {
            if (value === undefined) {
                sessionStorage.removeItem(key);
            } else if (value == null) {
                sessionStorage.setItem(key, String(value));
            } else {
                sessionStorage.setItem(key, value.toString());
            }
        } else {
            console.error('Storage is not supported by your browser')
        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'setAttribute', {
    value: function (attribute, value) {
        xdom.library["xdom/resources/session.xslt"].selectNodes(`(//xsl:copy/xsl:attribute[@name="${attribute}" and text()!="${String(value).replace(/\"/g, '&quote;')}"])`).remove();
        if (value != undefined) {
            xdom.library["xdom/resources/session.xslt"].selectAll(`//xsl:template[@match="/*"]/xsl:copy[not(xsl:attribute[@name="${attribute}"])]/xsl:copy-of[@select="@*"]`).map(node => node.appendAfter(xdom.xml.createDocument(`<xsl:attribute xmlns:xsl="http://www.w3.org/1999/XSL/Transform" name="${attribute}">${value}</xsl:attribute>`)))
        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'getSessionFile', {
    value: async function () {
        var session_xsl = xdom.library["xdom/resources/session.xslt"];
        if (!session_xsl) {
            var url = "xdom/resources/session.xslt";
            let [data, request] = await xdom.fetch.from('xdom/resources/session.xslt');
            //var pathname = [...(location.pathname.match(/[^/]+/ig) || [])].filter((el, index, array) => !(array.length - 1 == index && el.indexOf('.') != -1)).join('/');
            //xdom.library[request.url.replace(new RegExp(`^${location.origin}/${pathname}`), "").replace(/^\/+/, '')] = xdom.xml.createDocument(data)
            xdom.library[request.url.replace(new RegExp(`^${location.origin}`), "").replace(new RegExp(`^${location.pathname}`), "").replace(/^\/+/, '')] = xdom.xml.createDocument(data)
            session_xsl = xdom.library["xdom/resources/session.xslt"];
        }
        if (!(xdom.manifest.server || {}).endpoints["login"] && session_xsl.selectFirst(`//xsl:processing-instruction/text()[contains(.,'role="login"')]/..`)) {
            (session_xsl.selectFirst(`//xsl:processing-instruction/text()[contains(.,'role="login"')]/..`) || document.createElement('p')).remove();
        }
        return session_xsl;
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'getUserLogin', {
    value: function () {
        return xdom.session.user_login;
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'getUserId', {
    value: function () {
        var user_id = xdom.session.getKey("userId");
        //var on_complete = function () {
        //    xdom.session.setUserId(user_id);
        //}
        //if (user_id === undefined && !xdom.session.connecting) {
        //    xdom.session.connecting = true;
        //    var oData = new xdom.xhr.Request(relative_path + "xdom/server/session.asp", { method: 'GET', async: false });
        //    oData.onSuccess = function (Response, Request) {
        //        user_id = null;
        //        if (Response.type == "json") {
        //            user_id = (Response.value.userId || null);
        //        }
        //        if (Response.value.message) {
        //            console.error(Response.value.message);
        //        }
        //        //on_complete.apply(this, arguments);
        //    }
        //    oData.onComplete = function () {
        //        xdom.session.connecting = undefined;
        //    }
        //    oData.load();
        //}
        //on_complete.apply(this, arguments);

        return user_id;
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'getCurrentStatus', {
    value: async function () {
        if (((xdom.manifest.server || {}).endpoints || {}).session) {
            xdom.session.checkStatus();
        }
    },
    writable: false, enumerable: false, configurable: false
});

//var session_attributes = ["status", "user_id", "user_name", "user_login"];
//session_attributes.map(attribute => {
//    Object.defineProperty(xdom.session, attribute, {
//        get: function () {
//            return xdom.session.getKey(attribute);
//        },
//        set: function (value) {
//            xdom.session.setKey(attribute, value);
//        }
//    });
//})

Object.defineProperty(xdom.session, 'checkStatus', {
    value: async function (settings) {
        if (!navigator.onLine) return;
        var session_xsl = await xdom.session.getSessionFile();
        var status;
        if (!(((xdom.manifest.server || {}).endpoints || {}).session)) {
            return Promise.reject(new Error("Session endpoint not configured."));
        }
        //fetch('xdom/server/session.asp').then(response => { let content_type = response.headers.get('Content-Type'); return content_type.indexOf('json') != 0 ? response.json() : response.text() }).then(text => console.log(text));
        await xdom.fetch.json(relative_path + xdom.manifest.server["endpoints"].session).then(json => {
            //TODO: Estandarizar las variables de json
            //status = json.success ? "authorized" : "unauthorized";
            xdom.session.updateSession(json);
            //xdom.session.updateSession({
            //    "status": (status || '')
            //    , "user_id": (json.userId || '')
            //    , "user_login": (json["user_login"] || '').toLowerCase()
            //    , "user_name": (json["user_name"] || '').toLowerCase()
            //    , "userId": (json.userId || null)
            //});
            ////xdom.dom.refresh();
            Promise.resolve(xdom.session.status);
        }).catch(error => {
            status = undefined;
            xdom.session.updateSession({ "status": "unauthorized" });
            ////xdom.session.setKey("userId", null)
            //xdom.dom.refresh();
            Promise.reject(status);
        });
        //var oData = new xdom.xhr.Request(, xdom.json.merge({ method: 'GET', async: true }, settings));
        return xdom.session.status;
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.server, 'login', {
    value: async function (username, password, database_id/*, target_node*/) {
        var database_id = (database_id || xdom.session.database_id || xdom.manifest.server.database_id || window.location.hostname);
        password = username !== undefined ? (password || xdom.data.coalesce(password != undefined && xdom.cryptography.encodeMD5(password), password) || "") : "";
        username = (username || "");
        /*target_node = (target_node || xdom.data.document.selectSingleNode('//*[@session:status][1]') || xdom.data.document.selectSingleNode('/*'));*/

        if (!(((xdom.manifest.server || {}).endpoints || {}).login)) {
            return Promise.reject("Login endpoint not configured.");
        }
        var Response = {}
        xdom.session["status"] = "authorizing";
        xdom.session["user_login"] = (username || "");
        //var messages = (target_node && target_node.selectNodes('*[local-name()="message" and namespace-uri()="http://panax.io/xdom"][@scope="login"]') || document.createElement('p'));
        //messages.remove();
        var url = new URL(relative_path + xdom.manifest.server["endpoints"]["login"], location.origin + location.pathname);
        return xdom.post.to(url, new URLSearchParams(`UserName=${username}&Password=${password}&database_id=${database_id}`)).then(async ([response, Request, Response]) => {
            //xdom.state.update({ active: undefined }, "");
            xdom.session.updateSession({
                "user_id": (response.userId || '')
                , "user_login": (response.user_login || '').toLowerCase()
                , "user_name": (response.user_name || '').toLowerCase()
                , "database_id": (response.database_id || database_id || '')
                , "status": "authorized"
                , "userId": response.userId
            });
            //if ((target_node.documentElement || target_node).tagName == 'x:empty') {
            //    xdom.data.document = null;
            //}
            //xdom.data.remove(messages);
            try {
                await xdom.init();
            } catch (message) {
                console.log(message)
            }
            if (xdom.data.hashTagName() == '#login') {
                xdom.data.document = xdom.data.default;
            }
            //await xdom.data.binding.trigger();
            console.info('Welcome to your session!')
            if (response.recordSet) {
                result = response.recordSet[0].Result;
                //if (cache_results) {
                //    xdom.cache[request] = result;
                //}
                xdom.data.update(target.getAttribute("x:id"), target_attribute, result);
            }
            return response
        }).catch(([response, Request, Response]) => {
            if (response) {
                if (Response && !Response.appended) {
                    switch (Response.bodyType) {
                        case 'json':
                        case 'text':
                            let message = xdom.data.coalesce(response.message, response);
                            if (message) {
                                let xMessage = xdom.data.createMessage(message);
                                xMessage.documentElement.setAttribute("scope", "login")
                                xdom.data.document.documentElement.appendChild(xMessage.documentElement);
                            }
                            break;
                        case 'xml':
                            xdom.data.document.documentElement.appendChild(response.documentElement || response);
                            break;
                    }
                }
            }
            xdom.session.updateSession({ "status": "unauthorized" });
            return response
        }).finally(() => {
            xdom.dom.refresh();
            if (xdom.debug["xdom.session.login"]) {
                console.log("\tCompleted: (" + request + ') = ' + result);
            }
            if (xdom.session.status == 'unauthorized') {
                return Promise.reject("Unauthorized");
            } else {
                return Promise.resolve(true)
            }
        });
        //xdom.dom.refresh();

        //oData.onSuccess = function (Response, Request) {
        //}

        //oData.onException = function (Response, Request) {
        //}
        //oData.onFail = oData.onException;
        //oData.load();
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'login', {
    value: function () {
        return xdom.server.login.apply(this, arguments);
    }
    , writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.server, 'logout', {
    value: function (options) {
        //target_node = (target_node || xdom.data.document.selectSingleNode('//*[@session:status][1]') || xdom.data.document.selectSingleNode('/*'));
        var { auto_reload = true } = (options || {});
        var oData = new xdom.xhr.Request(relative_path + xdom.manifest.server["endpoints"]["logout"], { method: 'POST', async: false, headers: { "Accept": 'application/json' } });
        oData.onSuccess = function (Response) {
            xdom.session.saveSession(xdom.data.document, { "xhr": { "async": false } });
            if (Response.json && Response.json.success) {
                for (var hashtag in sessionStorage) {
                    if (hashtag.indexOf("#") != -1) {
                        console.log('Clearing document ' + hashtag);
                        delete xdom.data.stores[hashtag];
                    }
                }
                xdom.session.setUserId(null);
                xdom.data.stores.clear();
                xdom.session.clearCache(options);
                var database_id = (xdom.session.database_id || xdom.session.getKey("database_id"));
                xdom.session.updateSession({ "status": "unauthorized" });

                xdom.session.setKey("database_id", database_id);
                xdom.xhr.cache = {}
                window.top.dispatchEvent(new CustomEvent('loggedOut', { detail: {} }));
                console.info('Session ended. Goodbye!')
            } else if (!Response.json.success && Response.json.message) {
                console.error(Response.json.message);
            }
            //        xdom.dom.refresh();
            if (auto_reload) {
                window.location.href.replace(/#.*$/g, '');
                window.removeEventListener("beforeunload", xdom.dom.beforeunload);
                window.location.reload(true);
            }
            return true;
        }
        oData.load();
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'logout', {
    value: function () {
        try {
            xdom.server.logout.apply(this, arguments)
        } catch (e) {
            console.warn(e);
        }
    }
    , writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'loadSession', {
    value: async function (session_id) {
        session_id = (session_id || prompt("Introduzca el id de la sesión", (xdom.session.last_id || "")));
        if (!session_id) return;
        xdom.session.last_id = session_id;
        //xdom.data.clear();

        return xdom.data.load(relative_path + xdom.manifest.server["endpoints"]["load_session"] + (session_id ? "?sessionId=" + session_id : "")).then(session_document => {
            var stylesheets = xdom.data.getStylesheets(session_document);
            if (!stylesheets.length && (session_document.documentElement || document.createElement('p')).getAttribute('controlType')) {
                new xdom.data.Store('<?xml-stylesheet type="text/xsl" href="' + session_document.getAttribute('controlType').toLowerCase() + '.xslt"?>' + xdom.xml.toString(session_document), function () {
                    xdom.data.document = this.document;
                    //xdom.dom.refresh();
                    return;
                });
            } else {
                xdom.data.document = session_document;
                return;
                //xdom.dom.refresh();
            }
        });
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'saveSession', {
    value: function (data, settings) {
        var data = (data || xdom.data.document)

        prepareData = function (data) {
            if (settings["prepareData"] && settings["prepareData"].apply) {
                settings["prepareData"].apply(this, [data])
            };
            return data;
        }

        var settings = (settings || {});
        //settings = xdom.json.merge(settings, { contentType: 'application/json' });
        var xhr_settings = xdom.json.merge({ headers: { "Accept": 'application/json', "Content-Type": 'text/xml' } }, (xhr_settings || settings["xhr"]));
        var onsuccess = (xhr_settings["onsuccess"] || function () { });
        if (data) {
            prepareData(data);
            var xhr = new xdom.xhr.Request(xdom.manifest.server["endpoints"]["save_session"] + '?test=true', xdom.json.merge(xhr_settings, {
                onSuccess: function () {
                    console.log(xdom.xml.toString(this.xmlDocument));
                }
            }));
            var payload = xdom.xml.createDocument(xdom.xml.toString(data));
            var nodes = payload.selectNodes('//source:value|//@source:value');
            //var nodes = payload.selectNodes('//Option|//source:value');
            //xdom.data.remove(nodes);
            xhr.send(payload);
            //xhr.upload.onprogress = p => {
            //    console.log(Math.round((p.loaded / p.total) * 100) + '%');
            //}

        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'use', {
    value: function (database_id, without_confirmation) {
        if (!(xdom.session.database_id == database_id)) {
            if (!without_confirmation && confirm("Change connection?")) {
                xdom.session.database_id = database_id;
                xdom.session.logout();
            }
        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'live', {
    value: function (live) {
        xdom.session.live.running = live;
        var refresh_rate, document_name_or_array;
        var a = 0;
        if (this.Interval) window.clearInterval(this.Interval);
        if (!live) return;

        refresh_rate = (refresh_rate || 5);
        refresh_rate = (refresh_rate * 1000);
        var refresh = function () {
            window.console.info('Checking for changes in session...');
            xdom.session.loadSession();
        };

        this.Interval = setInterval(function () { refresh() }, refresh_rate);
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'saveLocation', {
    value: function (key, value) {
        xdom.session.setKey("xdom.current_location", window.location.pathname);
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'getLocation', {
    value: function () {
        return xdom.session.getKey("xdom.current_location");
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'setData', {
    value: function (data) {
        if (typeof (Storage) !== "undefined") {
            if (data && data.documentElement) {
                data = data.documentElement.outerHTML;
            }
            xdom.session.setKey(location.pathname + "xdom.data", data);
        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'clearCache', {
    value: function (options) {
        var { auto_reload = true } = (options || {});
        if (typeof (Storage) !== "undefined") {
            sessionStorage.clear();
            navigator.serviceWorker && navigator.serviceWorker.getRegistrations().then(function (registrations) {
                for (let registration of registrations) {
                    registration.unregister()
                }
            }).then(() => {
                typeof (caches) != 'undefined' && caches.keys()
                    .then(cacheNames => {
                        return Promise.all(
                            cacheNames.map(cacheName => {
                                return caches.delete(cacheName)
                            })
                        )
                    }).then(() => auto_reload && window.location.reload(true))
            })
            //xdom.data.stores.clear();

            //xdom.data.load();
        } else {
            console.error('Storage is not supported by your browser')
        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'setUserLogin', {
    value: function (user_login, data) {
        data = (data || xdom.data.document);
        xdom.session.setKey("userLogin", user_login);
        if (data) {
            data = xdom.xml.transform(data, "xdom/resources/normalize_namespaces.xslt");
            if ((user_login == data.selectSingleNode('//*[@session:status][1]/@session:user_login') || {}).value) {
                return;
            }
        }
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.session, 'setUserId', {
    value: function (user_id, data) {
        data = (data || xdom.data.document);
        xdom.session.setKey("userId", user_id);
        if (data) {
            data = xdom.xml.transform(data, "xdom/resources/normalize_namespaces.xslt");
            if ((user_id == data.selectSingleNode('//*[@session:status][1]/@session:user_id') || {}).value) {
                return;
            }

            //xdom.data.update({
            //    "target": data.selectSingleNode("/*[1]")
            //    , "attributes": [
            //        { "@session:user_id": (user_id || "") }
            //        , { "@session:status": user_id ? 'authorized' : ((data.selectSingleNode("//*[@session:status='authorizing']/@session:status") || {}).value || 'unauthorized') }
            //    ]
            //});
        }
    },
    writable: false, enumerable: false, configurable: false
});

xdom.browser.isIE = function () {
    var ua = window.navigator.userAgent;
    return /MSIE|Trident/.test(ua) && !xdom.browser.isEdge();
}

xdom.browser.isEdge = function () {
    var ua = window.navigator.userAgent;
    return /Edge/.test(ua);
}

xdom.browser.isSafari = function () {
    var ua = window.navigator.userAgent;
    return /Safari/.test(ua);
}

xdom.browser.isIphone = function () {
    return navigator.userAgent.match(/iPhone/i);
}

xdom.browser.isIPad = function () {
    return navigator.userAgent.match(/iPad/i);
}

xdom.browser.isIOS = function () {
    return xdom.browser.isIphone() || xdom.browser.isIPad() || navigator.userAgent.match(/Macintosh/i);
}

Object.defineProperty(xdom.callStack, 'add', {
    value: function (ref) {
        this.push(ref);
    },
    writable: true, enumerable: false, configurable: false
});

Object.defineProperty(xdom.callStack, 'remove', {
    value: function (ref) {
        this.reverse().map((obj, index, array) => {
            if (obj.src === ref.src && obj.method === ref.method) {
                array.splice(index, 1);
                array.reverse();
                return;
            }
        });
    },
    writable: true, enumerable: false, configurable: false
});

Object.defineProperty(xdom.debug, 'enabled', {
    get: function (ref) {
        return xdom.session.debug;
    }
    , set: function (input) {
        xdom.session.debug = !!input;
    }
});

xdom.listeners.dispatcher = function (event) {
    /*Los listeners se adjuntan y ejecutan en el orden en que fueron creados. Con este método se ejecutan en orden inverso y pueden detener la propagación para quitar el comportamiento de ejecución natural. Se tienen que agregar con el método */
    Object.values(xdom.listeners.events[event.type]).slice(0).reverse().map((fnc) => !event.cancelBubble && fnc.apply(event.target, arguments));
}

Object.defineProperty(xdom.listeners.events, 'add', {
    value: function (event_name, fn) {
        xdom.listeners.events[event_name] = (xdom.listeners.events[event_name] || []);
        //if (!(fn.toString() in xdom.listeners.events[event_name])) {
        xdom.listeners.events[event_name][fn.toString()] = fn;
        window.top.removeEventListener(event_name, xdom.listeners.dispatcher);
        window.top.addEventListener(event_name, xdom.listeners.dispatcher);
        //}
    },
    writable: true, enumerable: false, configurable: false
});

xdom.Manifest = function (manifest) {
    let base_manifest = {
        "server": { "database_id": undefined, "endpoints": {} },
        "sources": {},
        "transforms": [],
        "namespaces": {},
        "modules": {}
    }
    var _dictionary = {}

    var _manifest = xdom.json.merge(base_manifest, (manifest || {}));

    Object.entries(_manifest.sources).filter(([key, value]) => !(typeof (value) == 'string' && value.match(/^#/))).map(([key, value]) => {
        _manifest.sources[key] = (function (key, value) {
            var _value = isFunction(value) && Function.prototype || String.prototype;
            if (isFunction(value)) {
                if (!value.hasOwnProperty('tag')) {
                    Object.defineProperty(value, 'tag', {
                        get: function () {
                            return key
                        }
                    });
                }
                _value.fetch = value;
            } else if (isObject(value) && value["url"]) {
                _dictionary[String(value)] = key;
                if (!value.hasOwnProperty('tag')) {
                    Object.defineProperty(value, 'tag', {
                        value: key,
                        writable: false, enumerable: false, configurable: false
                    });
                }
                Object.defineProperty(value, 'fetch', {
                    value: async function () {
                        let key_name = this.tag;
                        let source = this.cloneObject();
                        let url = source["url"];
                        delete source["url"];
                        let document = await xdom.fetch.xml(url, source);
                        source["stylesheets"] && source["stylesheets"].reverse().map(stylesheet => {
                            document.addStylesheet(stylesheet);
                        });
                        document = new xdom.data.Store(document, { tag: key_name });
                        if (window.document.querySelector(`[xo-source='${key_name}']`)) {
                            document.isActive = true;
                        }
                        document.render();
                        return document;
                    },
                    writable: true, enumerable: false, configurable: false
                });
            } else {
                _dictionary[value] = key;
                if (!_value.hasOwnProperty('tag')) {
                    Object.defineProperty(_value, 'tag', {
                        get: function () {
                            return _dictionary[this]
                        }
                    });
                }
                Object.defineProperty(_value, 'fetch', {
                    value: async function () {
                        let key_name = this.tag;
                        let value = this.toString();
                        try {
                            let [document, request, response] = await xdom.fetch.from(value);
                            if (response.headers.get('Content-Type').toLowerCase().indexOf("json") != -1) {
                                document = xdom.json.toXML(document);
                            }
                            document = new xdom.data.Store(document, { tag: key_name });
                            if (window.document.querySelector(`[xo-source='${key_name}']`)) {
                                document.isActive = true;
                            }
                            document.render();
                            //if (key == "#" || xdom.data.stores[(window.top || window).location.hash]) {
                            //    xdom.data.document = document;
                            //}

                            return document;
                        } catch (e) {
                            throw (e);
                        }

                        if (key_name) {
                            !xdom.data.stores[key_name]
                        } else {
                            xdom.data.stores[document.tag];
                        }
                    },
                    writable: true, enumerable: false, configurable: false
                });
            }
            _value = value;
            return _value;
        })(key, value);
    });

    //Object.entries(_manifest.sources).filter(([key, value]) => typeof (value) == 'string' && value.match(/^#/)).map(([key, value]) => {
    //    _manifest.sources[key] = (function (key, value) {
    //        return _manifest.sources[value];
    //    })(key, value);
    //});

    Object.defineProperty(_manifest.sources, 'fetch', {
        value: async function (key) {
            let important_sources = Object.entries(_manifest.sources).filter(([_key, _value]) => _key.match(/!$/));
            let tag = String(_manifest.sources[history.state.hash || (window.top || window).location.hash || "#"]).match(/^#/) && _manifest.sources[history.state.hash || (window.top || window).location.hash || "#"] || (window.top || window).location.hash || "#";

            to_fetch = [...(key && _manifest.sources[key] && [[tag, _manifest.sources[key]]] || []), ...(!key && tag != '#' && !xdom.data.stores[tag] && _manifest.sources[tag] && [[tag, _manifest.sources[tag]]] || [])];

            if (to_fetch.length) {
                to_fetch.map(async ([_key, _value]) => {
                    //if (_key == "#" && typeof (_value) == "string" && _manifest.sources[_value]) {
                    //    var doc = _value.fetch({ as: _value });
                    //    xdom.data.document = doc;
                    //} else {
                    var doc = await _value.fetch({ as: _key });
                    if (doc) {
                        xdom.data.document = doc;
                    }
                    //}
                });
            } else if (!key && xdom.data.stores[tag]) {
                xdom.data.document = xdom.data.stores[tag];
            }
            //}
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(_manifest, 'getConfig', {
        value: (xdom.manifest.getConfig || function (entity_name, config_name) {
            return (_manifest.modules[entity_name]
                || _manifest.modules[entity_name.toLowerCase()]
                || {})[config_name]
        }),
        writable: true, enumerable: false, configurable: false
    });

    Object.defineProperty(_manifest, 'setConfig', {
        value: function (entity_name, property_name, value) {
            if (arguments[0].constructor === {}.constructor) {
                const { entity_name, ...rest } = arguments[0];
                _manifest.modules[(entity_name || xdom.data.hashTagName())] = (_manifest.modules[(entity_name || xdom.data.hashTagName)] || {})
                xdom.json.merge(_manifest.modules[(entity_name || xdom.data.hashTagName())], rest);
            } else {
                _manifest.modules[(entity_name || xdom.data.hashTagName())] = (_manifest.modules[(entity_name || xdom.data.hashTagName())] || {});
                _manifest.modules[(entity_name || xdom.data.hashTagName())][property_name] = value
            }
        },
        writable: true, enumerable: false, configurable: false
    });

    return _manifest;
}

var relative_path = (relative_path || "");

function getdate() { return autoCompleteDate("") }

function autoCompleteDate(sDate) {
    var pattern = /\b(\d{1,2})(?:(\/)(\d{1,2})(?:\2(\d{2,4}))?)?/
    var currentDate = new Date();
    var parts = (sDate.match(pattern) || []);
    var day = (parts[1] || currentDate.getDate())
    var month = (parts[3] || currentDate.getMonth() + 1)
    var year = (parts[4] || currentDate.getFullYear())
    var new_date = new Date(month + "/" + day + "/" + year)
    var new_string_date = new_date.toLocaleDateString("en-GB");
    var full_pattern = /\b(\d{1,2})(?:(\/)(\d{1,2})(?:\2(\d{2,4})))/
    if (new_string_date.match(full_pattern)) {
        sDate = new_string_date
    } else {
        new_string_date = day + "/" + month + "/" + year;
        if (new_string_date.match(full_pattern)) {
            sDate = new_string_date
        } else {
            sDate = '';
        }
    }
    return sDate;
}

function setDefaultDate(control) {
    if (!control) return;
    new_string_date = autoCompleteDate(control.value);
    var full_pattern = /\b(\d{1,2})(?:(\/)(\d{1,2})(?:\2(\d{2,4})))/
    if (new_string_date.match(full_pattern)) {
        control.value = new_string_date
    } else {
        control.value = '';
    }
    xdom.data.update({
        target: control.id
        , attributes: [{ '@x:value': new_string_date }, { '@x:text': new_string_date }]
    });
    return new_string_date;
}

function isValidDate(sDate) {
    var full_pattern = /\b(\d{1,2})(?:(\/)(\d{1,2})(?:\2(\d{2,4})))/
    return (sDate.match(full_pattern) && Date.parse(sDate) != 'NaN');
}

function isValidISODate(sDate) {
    var full_pattern = /\b(\d{4})(?:(-)(\d{1,2})(?:\2(\d{1,2})))/
    return (sDate.match(full_pattern) && Date.parse(sDate) != 'NaN' && (new Date().getFullYear()) - (new Date(Date.parse(sDate)).getFullYear()) < 1000);
}

xdom.dom.getGeneratedPageURL = function (config) {
    var html = config["html"];
    var css = config["css"];
    var js = config["js"];
    const getBlobURL = (code, type) => {
        const blob = new Blob([code], { type })
        return URL.createObjectURL(blob)
    }

    const cssURL = getBlobURL(css, 'text/css')
    const jsURL = getBlobURL(js, 'text/javascript')

    const source = `
    <html>
      <head>
        ${(css || "") && `<link rel="stylesheet" type="text/css" href="${cssURL}" />`}
        ${(js || "") && `<script defer="defer" src="${jsURL}"></script>`}
      </head>
      <body>
        ${html || ''}
      </body>
    </html>
  `

    return getBlobURL(source, 'text/html')
}

Object.defineProperty(xdom.server, 'uploadFile', {
    value: function (control, target, parentFolder) {
        if (!(xdom.manifest.server["endpoints"] && xdom.manifest.server["endpoints"]["uploadFile"])) {
            throw ("Endpoint for uploadFile is not defined in the manifest");
        }
        parentFolder = (parentFolder || 'FilesRepository');
        parentFolder.replace(/\//g, '\\')
        if (control.files && control.files[0]) {
            var progress_bar = document.getElementById('_progress_bar_' + control.id);
            progress_bar.style.width = '0%';

            var that = this;
            if (xdom.dom.intervals[control.id]) delete xdom.dom.intervals[control.id];
            if (xdom.manifest.server["endpoints"] && xdom.manifest.server["endpoints"]["uploadFileManager"]) {
                xdom.dom.intervals[control.id] = setInterval(function () {
                    var upload_check = new XMLHttpRequest();
                    upload_check.open('GET', xdom.manifest.server["endpoints"]["uploadFileManager"] + '?UploadID=' + control.id);// + control.id);
                    upload_check.onreadystatechange = function (oEvent) {
                        if (upload_check.readyState === 4) {
                            var json_response = JSON.parse(upload_check.responseText);
                            var progress_bar = document.getElementById('_progress_bar_' + control.id);

                            progress_bar.className = progress_bar.className.replace(/\bprogress-bar(-\w+)*\s*/ig, '')
                            progress_bar.className = 'progress-bar progress-bar-striped progress-bar-animated ' + progress_bar.className;

                            if (String(Number.parseFloat(progress_bar.style.width)) == 'NaN') {
                                progress_bar.style.width = '0%';
                            }
                            if (json_response.percent > Number.parseFloat(progress_bar.style.width)) {
                                progress_bar.style.width = json_response.percent + '%';
                            }
                        }
                    };
                    upload_check.send();
                }, 200);
            }

            var reader = new FileReader();

            reader.onload = function (e) {
                var formData = new FormData();
                formData.append((control.name || control.id || "file"), control.files[0])

                var request = new XMLHttpRequest();
                request.open('POST', xdom.manifest.server["endpoints"]["uploadFile"] + `?UploadID=${control.id}&saveAs=${control.id}&parentFolder=${parentFolder}`);
                request.onreadystatechange = function (oEvent) {
                    if (request.readyState === 4) {
                        delete xdom.dom.intervals[control.id];
                        var progress_bar = document.getElementById('_progress_bar_' + control.id);
                        if (request.status === 200) {
                            progress_bar.style.width = '100%';
                            progress_bar.className = progress_bar.className.replace(/\bbg-\w+/ig, 'bg-success');
                            progress_bar.className = progress_bar.className.replace(/\progress-bar-\w+/ig, '');
                            if (control.sourceNode) {
                                control.sourceNode.setAttribute('@x:value', control.value);
                                control.sourceNode.setAttribute('@state:progress', '100%');
                            }
                            //console.log(request.responseText)
                        } else {
                            var message = request.statusText
                            progress_bar.style.width = '100%';
                            progress_bar.className = progress_bar.className.replace(/\bbg-\w+/ig, 'bg-danger');
                            switch (request.status) {
                                case 413:
                                    message = "El archivo es demasiado grande. Por favor suba un archivo más chico.";
                                    break;
                                default:
                                    message = request.statusText;
                            }
                            alert("Error " + request.status + ': ' + message);
                        }
                    }
                };
                request.send(formData);


                //xhr.post(formData);//e.target.result
                //xhr.post(e.target.result);
                try {
                    document.querySelector('#' + target).setAttribute('src', e.target.result);
                } catch (e) {
                    console.log(e.message)
                }
                //target.src=e.target.result;
            }
            reader.readAsDataURL(control.files[0]);
        }
    },
    writable: true, enumerable: false, configurable: false
})

function paddingDiff(col) {
    if (getStyleVal(col, 'box-sizing') == 'border-box') {
        return 0;
    }

    var padLeft = getStyleVal(col, 'padding-left');
    var padRight = getStyleVal(col, 'padding-right');
    return (parseInt(padLeft) + parseInt(padRight));
}

function getStyleVal(elm, css) {
    return (window.getComputedStyle(elm, null).getPropertyValue(css))
}

var pageX, curCol, nxtCol, nxtColWidth, nxtColWidth;
xdom.datagrid.columns.resize = {
    mouseover: function (e) {
        if (e.target.className.indexOf("hover") == -1) {
            e.target.className += " hover";
        } else {
            e.target.className = e.target.className.replace(" hover", "");
        }
    }
    , mousedown: function (e) {
        curCol = e.target.parentElement;
        nxtCol = curCol.nextElementSibling;
        pageX = e.pageX;

        var padding = paddingDiff(curCol);

        curColWidth = curCol.offsetWidth - padding;
        if (nxtCol)
            nxtColWidth = nxtCol.offsetWidth - padding;
        console.log("curColWidth: " + curColWidth);
        console.log("nxtColWidth: " + nxtColWidth);
    }
    , mousemove: function (e) {
        if (curCol) {
            var diffX = e.pageX - pageX;

            if (nxtCol) {
                nxtCol.style.width = (nxtColWidth - (diffX)) + 'px';
            }

            curCol.style.width = (curColWidth + diffX) + 'px';
            console.log("curCol: " + curCol.id + ': ' + (nxtColWidth - (diffX)) + 'px');
            console.log("nxtCol: " + nxtCol.id + ': ' + (curColWidth + diffX) + 'px');
        }
    }
    , mouseup: function (e) {
        curCol = undefined;
        nxtCol = undefined;
        pageX = undefined;
        nxtColWidth = undefined;
        curColWidth = undefined;
    }
}

xdom.data.updateScrollPosition = function (document, coordinates) {
    var target = coordinates.target;
    if (target) {
        Object.entries(coordinates).forEach(([key, value]) => {
            if (key != 'target' && target.sourceNode) {
                target.sourceNode.setAttribute(`state:${key}-position`, value);
                //var attributeRef = target.selectSingleNode(`//@state:${key}-position`);
                //if (attributeRef) {
                //    attributeRef.ownerElement.setAttributeNS(xdom.xml.namespaces["state"], `state:${key}-position`, value, false);
                //}
            }
        })
    }
}

xdom.dom.onscroll = function () {
    xdom.dom.updateScrollableElements();
    //xdom.dom.position = xdom.dom.getScrollPosition();//document.getElementsByClassName("w3-responsive")[0] || document.querySelector('main')
    //xdom.data.updateScrollPosition(xdom.data.document, xdom.dom.position);
}

//document.addEventListener('scroll', function () {
//    xdom.dom.onscroll()
//});

document.addEventListener("DOMContentLoaded", function (event) {
    document.body.addEventListener('scroll', xdom.dom.onscroll);
    //Object.values((xdom.dom.getScrollableElements() || {})).forEach(
    //    el => el.addEventListener('scroll', xdom.dom.getScrollPosition)
    //);
    xdom.init();
});

var content_type = {}
content_type["json"] = "application/json";
content_type["xml"] = "text/xml";

xdom.devTools.debug = function (enabled) {
    xdom.debug = xdom.json.merge(xdom.debug, { enabled: xdom.data.coalesce(enabled, true) })
    xdom.session.setAttribute("session:debug", xdom.debug.enabled);
    return;
}

xdom.library = new Proxy({}, {
    get: function (self, key) {
        if (self.hasOwnProperty(key)) {
            return self[key];
        }
    },
    set: function (self, key, input) {
        self[key] = input;
        return self[key];
    }
});
//xdom.library = {};

Object.defineProperty(xdom.library, 'loading', {
    value: [],
    writable: true, enumerable: false, configurable: false
});

Object.defineProperty(xdom.library, 'load', {
    value: async function (file_name_or_array) {
        let _file_name_or_array = (file_name_or_array || []);
        var library = {};
        _file_name_or_array = [...new Set([_file_name_or_array].flat())];
        //_file_name_or_array = _file_name_or_array.filter((file_name) => !(xdom.library.loading.includes(file_name) || file_name in this));
        _file_name_or_array.map((file_name) => xdom.library.loading.push(file_name));
        _file_name_or_array.map(file_name => {
            let full_url = new URL(file_name, location.origin + location.pathname);
            let url = full_url.href.replace(new RegExp(`^${location.origin}`), "").replace(new RegExp(`^${location.pathname}`), "").replace(/^\/+/, '')
            if (!this[url]) {
                this[url] = xdom.fetch.from(full_url)
                    .then(async ([data, request]) => {
                        let url = request.url.replace(new RegExp(`^${location.origin}`), "").replace(new RegExp(`^${location.pathname}`), "").replace(/^\/+/, '')
                        xdom.json.merge(xdom.xml.namespaces, xdom.xml.getNamespaces(data));
                        data.documentElement && data.documentElement.selectNodes("xsl:import|xsl:include").map(async node => {
                            let href = node.getAttribute("href");
                            if (!href.match(/^\//)) {
                                let new_href = new URL(href, data.url).pathname.replace(new RegExp(location.pathname), "");
                                node.setAttribute("href", new_href);
                            }
                        });
                        this[url] = xdom.xml.createDocument(data);
                        xdom.library.loading = xdom.library.loading.filter(item => item != url);
                        library[url] = this[url];
                        let imports = this[url].documentElement && this[url].documentElement.selectNodes("xsl:import|xsl:include").reduce((arr, item) => { arr.push(item.getAttribute("href")); return arr; }, []) || [];
                        if (imports.length) {
                            await xdom.library.load(imports);
                        }
                    }).catch(error => {
                        console.error(error);
                    })
            }
        })
        await Promise.all(_file_name_or_array.reduce((lib, stylesheet) => { lib.push(xdom.library[stylesheet]); return lib }, []));
        return library;
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.library, 'reload', {
    value: function (file_name_or_array, on_complete) {
        Object.values(xdom.data.stores).map(store => {
            (store.documentElement || document.createElement("p")).setAttribute("state:refresh", true);
            if (store.library) {
                store.library = undefined;
            }
        });
        var current_keys = xdom.library.cloneObject();
        delete current_keys[relative_path + "xdom/resources/session.xslt"];

        var file_name_or_array = (file_name_or_array || Object.keys(current_keys));
        if (typeof (file_name_or_array) == 'string') {
            file_name_or_array = [file_name_or_array];
        }
        for (var document_index = 0; document_index < file_name_or_array.length; document_index++) {
            var file_name = file_name_or_array[document_index];
            if (file_name in xdom.library) {
                xdom.library[file_name] = undefined;
            }
        }
        var storage_enabled = xdom.storage.enabled;
        if (storage_enabled) {
            xdom.storage.disable(file_name_or_array);
        }
        xdom.library.load(file_name_or_array).then(response => {
            if (((xdom.manifest.server || {}).endpoints || {}).session) {
                xdom.session.checkStatus().then(() => xdom.dom.refresh());
            }
        });
        //xdom.library.load(file_name_or_array, (on_complete || function () {
        //    xdom.session.checkStatus().then(() => xdom.dom.refresh());
        //}));
        if (storage_enabled) {
            xdom.storage.enable();
        }
    },
    writable: true, enumerable: false
});

Object.defineProperty(xdom.library, 'reset', {
    value: function (file_name_or_array) {
        var _file_name_or_array = (file_name_or_array || Object.keys(xdom.library));
        if (typeof (_file_name_or_array) == 'string') {
            _file_name_or_array = [_file_name_or_array];
        }
        _file_name_or_array.map((file_name) => {
            if (file_name in xdom.library) {
                xdom.library[file_name] = undefined;
            }
        });
    },
    writable: true, enumerable: false
});

Object.defineProperty(xdom.data.stores, "#", {
    get: function () {
        return this[xdom.manifest.sources["#"]] || xdom.data.stores['#shell'];
    }
});

Object.defineProperty(xdom.data.stores, 'find', {
    value: function (ref) {
        var return_array = [];

        var target = xdom.data.document.find(ref);
        if (target) {
            //return_array.push([target, xdom.data.document]);
            return_array.push(target);
        }
        //xdom.data.stores.filter((nombre, document) => document.selectSingleNode(`//*[@x:id="${typeof (ref) == 'string' ? ref : ref.getAttribute("x:id")}"]`))
        for (var xDocument in xdom.data.stores) {
            target = xdom.data.stores[xDocument].find(ref);
            if (target) {
                //return_array.push([target, xdom.data.stores[xDocument]]);
                return_array.push(target);
            }
        }
        return_array = [...new Set(return_array)];
        return new xdom.xml.nodeSet(return_array);
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.data.stores, 'restore', {
    value: function () {
        var self = this;
        Object.entries(sessionStorage).filter(([key]) => key.match(/^#/)).map(([hashtag, value]) => {
            console.log('Restoring document ' + hashtag);
            let restored_document = (self[hashtag] || xdom.session.getKey(hashtag))
            if (!(restored_document instanceof xdom.data.Store)) {
                restored_document = new xdom.data.Store(restored_document, { tag: hashtag });
            }
            if (!((restored_document.documentElement || {}).namespaceURI && restored_document.documentElement.namespaceURI.indexOf("http://www.w3.org") != -1)) {
                self[hashtag] = restored_document;
            }
        })
    },
    writable: false, enumerable: false, configurable: false
});


Object.defineProperty(xdom.data.stores, 'detectActive', {
    value: function () {
        //Object.values(this.getActive()).map(document => document.isActive = false);
        if (((history.state || {}).active_tags || []).includes(history.state.hash)) {
            var active_tags = [];
            [...document.querySelectorAll("[xo-source]")].filter(el => xdom.data.stores[el.getAttribute("xo-source")]).map(el => {
                active_tags.push(el.getAttribute("xo-source"));
            });
            xdom.state.update({ active_tags: active_tags });
        }
        return this.getActive()
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.data.stores, 'getActive', {
    value: function (attribute, value) {
        let active = Object.entries(xdom.data.stores).reduce((json, item) => {
            if (item[1] && item[1].isActive) {
                json[item[0]] = item[1];
            };
            return json;
        }, {});

        Object.defineProperty(active, 'getInitiators', {
            value: function (attribute, value) {
                return Object.values(active).reduce((arr, item) => {
                    if (item.initiator) {
                        arr.push(item.initiator);
                    };
                    return arr;
                }, []);
            },
            writable: false, enumerable: false, configurable: false
        });
        return active;
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.data.stores, 'getInactive', {
    value: function (attribute, value) {
        return Object.entries(xdom.data.stores).reduce((json, item) => { if (!(item[1].isActive)) { json[item[0]] = item[1]; }; return json }, {});
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.data.stores, 'clear', {
    value: function (attribute, value) {
        Object.keys(this).map(key => delete this[key]);
        sessionStorage.clear();
        return this;
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.data.stores, 'fetch', {
    value: async function (url, tag) {
        var document = await xdom.fetch.xml(url);
        if (!document) throw ("File couldn't be loaded.")
        this[tag || xdom.data.hashTagName(document)] = new xdom.data.Store(document, { tag: tag });
        return this[tag || xdom.data.hashTagName(document)];
    },
    writable: false, enumerable: false, configurable: false
});

var originalRemoveAttribute = Element.prototype.removeAttribute;
var originalRemove = Element.prototype.remove;
var replaceChild_original = Element.prototype.replaceChild
xdom.xml.nodeSet = function (nodeSet) {
    Object.defineProperty(nodeSet, 'remove', {
        value: function (refresh) {
            var stores = [];
            for (let i = nodeSet.length - 1; i >= 0; --i) {
                var target = nodeSet.pop();
                if (target.ownerDocument.store && !stores.find(store => store === target.ownerDocument.store)) {
                    stores.push(target.ownerDocument.store)
                }
                if (target.nodeType == 2/*attribute*/) {
                    var attribute_name = target.name;
                    var ownerElement = target.ownerElement;
                    if (ownerElement) {
                        if (!(attribute_name == 'state:refresh')) {
                            refresh = xdom.data.coalesce(refresh, true);
                        }
                        originalRemoveAttribute.apply(ownerElement, [attribute_name]);
                        //ownerElement.removeAttribute(attribute_name, refresh);
                    }
                } else {
                    refresh = xdom.data.coalesce(refresh, true);
                    originalRemove.apply(target)
                    //target.remove(refresh);
                    //target.parentNode.removeChild(target); //Se cambió el método por remove para que sea responsivo
                }
            }
            stores.map(store => store.render(refresh));
            //xdom.dom.refresh();
        },
        writable: false, enumerable: false, configurable: false
    });
    Object.defineProperty(nodeSet, 'setAttribute', {
        value: async function () {
            return new Promise((resolve, reject) => {
                nodeSet.map(target => {
                    if (target instanceof Element || target.nodeType == 1) {
                        target.setAttribute.apply(target, arguments).then(() => resolve(true));
                    }
                });
            })
        },
        writable: false, enumerable: false, configurable: false
    });
    Object.defineProperty(nodeSet, 'setAttributes', {
        value: async function (delay) {
            if (!isNaN(parseInt(delay))) {
                await xdom.delay(delay);
            }
            return new Promise((resolve, reject) => {
                nodeSet.map(target => {
                    if (target instanceof Element || target.nodeType == 1) {
                        target.setAttributes.apply(target, arguments).then(() => resolve(true));
                    }
                });
            });
        },
        writable: false, enumerable: false, configurable: false
    });
    Object.defineProperty(nodeSet, 'appendBefore', {
        value: function () {
            nodeSet.map(target => {
                if (target instanceof Element || target.nodeType == 1) {
                    target.appendBefore.apply(target, arguments);
                }
            });
        },
        writable: false, enumerable: false, configurable: false
    });
    Object.defineProperty(nodeSet, 'appendAfter', {
        value: function () {
            nodeSet.map(target => {
                if (target instanceof Element || target.nodeType == 1) {
                    target.appendAfter.apply(target, arguments);
                }
            });
        },
        writable: false, enumerable: false, configurable: false
    });
    Object.defineProperty(nodeSet, 'textContent', {
        value: function () {
            nodeSet.map(target => {
                if (target instanceof Element || target.nodeType == 1) {
                    target.textContent.apply(target, arguments, false);
                }
            });
        },
        writable: false, enumerable: false, configurable: false
    });
    return nodeSet;
}

xdom.xml.createFromActiveX = function () {
    if (typeof arguments.callee.activeXString != "string") {
        var versions = ["MSXML2.DOMDocument"];

        for (var i = 0, len = versions.length; i < len; i++) {
            try {
                var xmldom = new ActiveXObject(versions[i]);
                arguments.callee.activeXString = versions[i];
                return xmldom;
            } catch (ex) {
                //skip
            }
        }
    }
    return new ActiveXObject(arguments.callee.activeXString);
}

xdom.xml.getNamespaces = function () {
    var namespaces = {};
    for (var a = 0; a < arguments.length; ++a) {
        if (!arguments[a]) {
            continue;
        }
        if (arguments[a].getNamespaces) {
            namespaces = xdom.json.merge(namespaces, arguments[a].getNamespaces())
        } else if (typeof (arguments[a].selectSingleNode) != 'undefined') {
            var sXML = xdom.xml.toString((arguments[a].document || arguments[a]));
            if (sXML) {
                if (sXML.match(/\bxml:/)) {
                    namespaces["xml"] = "http://www.w3.org/XML/1998/namespace";
                }
                namespaces = xdom.json.merge(namespaces, JSON.parse('{' + (sXML.match(/(xmlns:\w+)=(["'])([^\2]+?)\2/ig) || []).join(", ").replace(/xmlns:(\w+)=(["'])([^\2]+?)\2/ig, '"$1":$2$3$2') + '}'));
            }
        }
    }
    return namespaces;
}

xdom.xml.setNamespaces = function (xml_document, namespaces) {
    Object.entries(namespaces).forEach(ns => {
        xml_document.setAttribute(ns[0], ns[1], false);
    })
    return xml_document;
}

xdom.xml.lookupNamespaceURI = function (node, namespace_uri) {
    if (!(node && typeof (node.selectSingleNode) != "undefined")) {
        return;
    }
    return node.getElementsByTagNameNS(namespace_uri, '*');
    //return node.selectSingleNode("namespace::*[.='" + namespace_uri + "']");
}
xdom.xml.createNSResolver = function () {
    var namespaces = xdom.xml.getNamespaces.apply(this, arguments);
    return function (prefix) {
        return (namespaces[prefix] || xdom.xml.namespaces[prefix]) || null;
    };
}

xdom.xml.createNamespaceDeclaration = function () {
    var namespaces = xdom.xml.getNamespaces.apply(this, arguments);
    return xdom.json.join(namespaces, { "separator": " " });
}

xdom.fetch.from = async function (request, options) {
    var url, req;
    if (request instanceof Request) {
        req = request;
    } else {
        if (request.constructor == {}.constructor) {
            url = new URL(request["url"], location.origin + location.pathname);
            params = new URLSearchParams(xdom.json.merge(request["parameters"], request["params"]));
            [...params.entries()].map(([key, value]) => url.searchParams.set(key, value));
        } else {
            url = new URL(request, location.origin + location.pathname);
        }
        let fileExtension = url.pathname.substring(url.pathname.lastIndexOf('.') + 1);
        var _options = (options || {});
        _options["headers"] = (_options["headers"] || {});
        _options["headers"]["Accept"] = (_options["headers"]["Accept"] || (xdom.mimeTypes[fileExtension] || '*/*') + ', */*')
        //_options["headers"]["X-Debugging"] = xdom.debug.enabled; //En el filtro causa problemas al conectarse con el qr. Hay que reubicarlo
        //_options["headers"]["X-Rebuild"] = (xdom.listeners.keys.altKey ? true : false);

        var _options = xdom.json.merge({
            method: 'GET'
            //, credentials: 'include'
        }
            , _options
            , {
                headers: new Headers(xdom.json.merge({
                }, _options["headers"]))
            }
        )
        req = new Request(url, _options);
    }

    let current_hash = (window.top || window).location.hash; //Guardamos el hash, para que en caso de que alguno de los pasos siguientes lo cambie, podamos restaurarlo
    var srcElement = event && event.target;
    if (srcElement instanceof HTMLElement) {
        let initiator_button = srcElement.closest('button, .btn')
        initiator_button && initiator_button.classList.add("working");
        req.initiator = event && event.target && event.target.store;
    }
    if (req.initiator) {
        req.initiator.state.busy = true;
    }
    Object.defineProperty(req, 'parameters', {
        get: function () {
            return Object.fromEntries(new URL(this.url).searchParams.entries());
        }
    })
    var original_response;
    try {
        original_response = await fetch(req.clone());
    } catch (e) {
        try {
            if (!original_response && req.method == 'POST') {
                const body = await req.clone().text();
                const { cache, credentials, headers, integrity, mode, redirect, referrer } = req;
                const init = { body, cache, credentials, headers, integrity, mode, redirect, referrer };
                original_response = await fetch(req.url, init);
            }
        } catch (e) {
            console.log(e);
            return Promise.reject([e, req, { bodyType: 'text' }]);
        }
    }
    let response = original_response.clone()
    if (req.initiator) {
        window.document.querySelectorAll(`[xo-source="${req.initiator.tag}"] .working`).forEach(el => el.classList.remove('working'));
        req.initiator.state.busy = undefined;
    }
    //if ((window.top || window).location.hash == '' && (window.top || window).location.hash != current_hash) {
    //    window.history.back();
    //}

    var document = undefined;
    let contentType = (response.headers.get('Content-Type') || '');
    var responseText;
    if (contentType.toLowerCase().indexOf("iso-8859-1") != -1) {
        await response.arrayBuffer().then(buffer => {
            let decoder = new TextDecoder("iso-8859-1");
            let text = decoder.decode(buffer);
            responseText = text;
        }).catch(error => Promise.reject(error));
    } else {
        if (contentType.toLowerCase().indexOf("manifest") != -1) {
            //await response.json().then(json => document = json);
            await response.text().then(text => document = text);
            responseText = document;
        } else if (contentType.toLowerCase().indexOf("json") != -1) {
            await response.json().then(json => document = json);
            responseText = JSON.stringify(document);
        } else {
            await response.text().then(text => document = text);
            responseText = document;
        }
    }

    Object.defineProperty(original_response, 'responseText', {
        get: function () {
            return responseText;
        }
    });

    Object.defineProperty(original_response, 'url', {
        get: function () {
            return url;
        }
    });

    Object.defineProperty(original_response, 'bodyType', {
        get: function () {
            if ((this.headers.get('Content-Type').toLowerCase().indexOf("json") != -1 || this.headers.get('Content-Type').toLowerCase().indexOf("manifest") != -1) && xdom.json.isValid(xdom.json.tryParse(this.responseText))) {
                return "json";
            } else if ((this.headers.get('Content-Type').toLowerCase().indexOf("xml") != -1 || this.headers.get('Content-Type').toLowerCase().indexOf("xsl") != -1 || contentType.toLowerCase().indexOf("<?xml ") != -1) && xdom.xml.isValid(xdom.xml.tryParse(this.responseText))) {
                return "xml"
            } else {
                return "text";
            }
        }
    });

    switch (original_response.bodyType) {
        case "xml":
            document = xdom.xml.createDocument(responseText);
            break;
        case "json":
        case "manifest":
            document = xdom.json.tryParse(responseText);
            if ((req.headers.get('Content-Type') || '').toLowerCase().indexOf("xml") != -1) {
                try {
                    document = xdom.json.toXML(document);
                    original_response.bodyType = 'xml';
                } catch (e) {
                    console.warn(e);
                }
            }
            break;
        default:
            document = responseText;
    }

    Object.defineProperty(original_response, 'document', {
        value: document
    });

    var appended = false;
    if (response.status == 401) {
        xdom.session.updateSession({ "status": "unauthorized" });
    }
    if (response.status >= 200 && response.status < 400) {
        if (response.status == 204) {
            return Promise.resolve(['El servidor terminó sin regresar resultados', req, original_response]);
        }
    } else if ([409].includes(response.status) && (req.headers.get("Accept") || "").indexOf('xml') != -1 && !(document || {}).documentElement) {
        document = xdom.xml.createDocument(`<x:message xmlns:x="http://panax.io/xdom" x:id="xhr_message_${Math.random()}" type="server_error"/>`);
    } else if (document.getStylesheets && document.getStylesheets().length == 1) { /*Por lo pronto sólo entrará para los errores y si tiene un solo stylesheet*/
        var result = xdom.xml.transform(document);
        if (result.documentElement && result.documentElement.namespaceURI.indexOf("http://www.w3.org") != -1) {
            window.document.querySelector(document.getStylesheets()[0].target || "body").appendChild(result.documentElement);
            appended = true;
        }
    } else {
        return Promise.reject([response.statusText, req, original_response]);
    }

    Object.defineProperty(original_response, 'appended', {
        get: function () {
            return appended;
        }
    });

    if (document instanceof Document) {
        Object.defineProperty(document, 'url', {
            get: function () {
                return url;
            }
        });
    }

    return Promise.resolve([document, req, original_response]);
}

xdom.fetch.xml = async function (url, options, on_success) {
    var _options = (options || {});
    _options["headers"] = (_options["headers"] || {});
    _options["headers"]["Accept"] = (_options["headers"]["Accept"] || ("text/xml" || '*/*') + ', */*')

    let [return_value, request, response] = await xdom.fetch.from(url, _options, on_success);
    if (!return_value.documentElement && response.headers.get('Content-Type').toLowerCase().indexOf("json") != -1) {
        return_value = xdom.json.toXML(return_value);
    }
    return_value.documentElement && return_value.documentElement.selectNodes("xsl:import|xsl:include").map(async node => {
        let href = node.getAttribute("href");
        if (!href.match(/^\//)) {
            let new_href = new URL(href, return_value.url).pathname.replace(new RegExp(location.pathname), "");
            node.setAttribute("href", new_href);
        }
    });
    let imports = return_value.documentElement && return_value.documentElement.selectNodes("xsl:import|xsl:include").reduce((arr, item) => { arr.push(item.getAttribute("href")); return arr; }, []) || [];
    if (imports.length) {
        await xdom.library.load(imports);
    }
    return return_value;
}

xdom.fetch.json = async function (url, options, on_success) {
    var _options = (options || {});
    _options["headers"] = (_options["headers"] || {});
    _options["headers"]["Accept"] = (_options["headers"]["Accept"] || ("application/json" || '*/*') + ', */*')
    let [return_value, request] = await xdom.fetch.from(url, _options, on_success);
    return return_value;
}

xdom.xml.fromString = function (xmlString) {
    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlString, "text/xml");
    }
    else // Internet Explorer
    {
        xmlDoc = xdom.xml.createDocument();
        xmlDoc.loadXML(xmlString);
        xmlDoc.setProperty("SelectionLanguage", "XPath");
    }
    return xmlDoc
}

xdom.xml.reseed = function (xml) {
    if (navigator.userAgent.indexOf("Safari") == -1) {
        xml = xdom.xml.transform(xml, "xdom/resources/normalize_namespaces.xslt");
    }
    xml = xdom.xml.transform(xml, "xdom/resources/prepare_data.xslt");
    return xml;
}

xdom.xml.toString = function (xml) {
    if (!xml) return '';
    if (typeof xml == "string" || typeof xml == "boolean" || typeof xml == "number") {
        return xml
    } else {
        if (xml instanceof xdom.data.Store) {
            xml = xml.document;
        }
        return (xml.xml !== undefined ? xml.xml : new XMLSerializer().serializeToString(xml)); //(xml.documentElement || xml)
    }
}

xdom.xml.normalizeNamespaces = function (xml) {
    if (!xml || xml instanceof HTMLDocument || xml instanceof HTMLElement) return xml;
    var xsl_transform = xdom.xml.createDocument(`
    <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
      <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
      <xsl:template match="@* | * | text() | processing-instruction() | comment()" priority="-1">
        <xsl:copy>
          <xsl:copy-of select="//namespace::*"/>
          <xsl:copy-of select="@*|*|text()"/>
        </xsl:copy>
      </xsl:template>
    </xsl:stylesheet>
    `, 'text/xml');
    if (navigator.userAgent.indexOf("Firefox") != -1) {
        xsl_transform.selectAll("//xsl:copy-of[contains(@select,'namespace::')]").remove();
    }
    return xdom.xml.transform(xml, xsl_transform);

}

//xdom.xml.normalizeNamespaces = function (xml) {
//    if (!xml) return '';
//    var xsl_transform = xml.getNamespaces;
//    return xdom.xml.transform(xml, xsl_transform);

//}

xdom.LoadXMLString = function (xmlString) {
    return xdom.xml.fromString(xmlString);
}

xdom.xml.transform = function (xml, xsl, target) {
    var xmlDoc;
    var result = undefined;
    if (xml && !xsl && ((arguments || {}).callee || {}).caller != xdom.xml.transform) {
        for (stylesheet of xml.getStylesheets()) {
            xml = xdom.xml.transform(xml, (stylesheet.document || stylesheet.href));
        }
    }
    if (typeof (xsl) == "string") {
        if (!(xsl in xdom.library)) {
            //xdom.library.load(xsl, function () { }, { async: false });
            if (xdom.browser.isIphone()) {
                (async () => {
                    xdom.library[xsl] = await xdom.fetch.xml(xsl);
                    xsl = xdom.library[xsl];
                })();
            } else {
                xsl = xdom.xml.createDocument(`                          
                <xsl:stylesheet version="1.0"                        
                    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
                    <xsl:import href="${xsl}" />
                </xsl:stylesheet>`);
            }
        } else {
            xsl = xdom.library[xsl];
        }
    }
    if (!(xml && xsl)) {
        return xml;//false;
    }
    var original_doc = xml;
    if (xml instanceof xdom.data.Store) {
        xml = xml.document;
    }
    if (xsl instanceof xdom.data.Store) {
        xsl = xsl.document;
    }
    if (!(typeof (xsl.selectSingleNode) != 'undefined' && xsl.selectSingleNode('xsl:*'))) {
        throw ("XSL document is empty or invalid");
        return xml;//null;
    }
    if (typeof (xml) == "string") {
        xml = xdom.xml.createDocument(xml);
    }
    if (!xml.selectFirst("self::*|*|comment()") && xml.createComment) {
        xml.appendChild(xml.createComment("empty"))
    }
    if (window.ActiveXObject || "ActiveXObject" in window) {
        var xslt = new ActiveXObject("Msxml2.XSLTemplate.3.0");
        var xslDoc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument.3.0");
        var xslProc;
        xslDoc.async = false;
        xslDoc.loadXML(xdom.xml.toString(xsl));
        xslDoc.setProperty("SelectionLanguage", "XPath");
        var namespaces = xdom.xml.createNamespaceDeclaration(xml, xsl);
        xslDoc.setProperty("SelectionNamespaces", namespaces);
        if (xslDoc.parseError.errorCode != 0) {
            var myErr = xslDoc.parseError;
            throw ("xsl: You have an error in transform: " + myErr.reason);
            return null;
        } else {
            if (target) {
                xmlDoc = target
            } else {
                xmlDoc = new ActiveXObject("Msxml2.DOMDocument.3.0");
                xmlDoc.async = false;
                xmlDoc.setProperty("SelectionLanguage", "XPath");
                xmlDoc.setProperty("SelectionNamespaces", namespaces);
            }
            if (typeof (xml.transformNodeToObject) != "undefined") {
                //xml.loadXML(xml.xml)
                //xmlDoc = xml//xdom.xml.createDocument(xml);//xml.selectSingleNode(".");
            } else {
                xmlDoc.loadXML(xdom.xml.toString(xml));
                if (xmlDoc.parseError.errorCode != 0) {
                    var myErr = xmlDoc.parseError;
                    throw ("doc: You have an error in transform: " + myErr.reason);
                    return null;
                } /*else {
                xslProc = xslt.createProcessor();
                xslProc.input = xmlDoc;
                xslProc.addParameter("param1", "Hello");
                xslProc.render();
                console.log(xslProc.output);
            }*/
            }
        }
        //result = xdom.xml.createDocument(xmlDoc.transformNode(xslDoc))
        try {
            xml.transformNodeToObject(xslDoc, xmlDoc);
        } catch (e) {
            xdom.xhr.upload(xdom.xml.toString(xml));
            xdom.xhr.upload(xdom.xml.toString(xslDoc));
            console.error("xdom.xml.transform: " + xmlDoc.parseError.reason);
            return xml;
        }
        result = xmlDoc;
    }
    else if (document.implementation && document.implementation.createDocument) {
        var xsltProcessor = new XSLTProcessor();
        //target = (target || xml.ownerDocument)
        //if (target) {
        //    result = xsltProcessor.transformToFragment(xml, xml.ownerDocument).firstElementChild;
        //} else {
        try {
            if (navigator.userAgent.indexOf("Firefox") != -1) {
                var invalid_node = xsl.selectFirst("//*[contains(@select,'namespace::')]");
                if (invalid_node) {
                    console.warn('There is an unsupported xpath in then file');
                }
            }
            if (navigator.userAgent.indexOf("iPhone") != -1 || xdom.debug["xdom.xml.consolidate"]) {
                xsl = xdom.xml.consolidate(xsl); //Corregir casos cuando tiene apply-imports
            }

            //////if (xsl.url) {
            ////xsl.documentElement.selectNodes("xsl:import|xsl:include").map(node => {
            ////    let href = node.getAttribute("href");
            ////    //if (!href.match(/^\//)) {
            ////    //let new_href = new URL(href, xsl.url);
            ////    //node.setAttribute("href", new_href.pathname);
            ////    //node.setAttribute("href", href);
            ////    if (xdom.library[href]) {
            ////        //xsltProcessor.importStylesheet(xdom.library[href]);
            ////        let fragment = document.createDocumentFragment();
            ////        fragment.append(xml.createComment(` ========== Imported from "${href}" ==========> `));
            ////        let library = xdom.library[href].cloneNode(true);
            ////        fragment.append(...library.documentElement.childNodes);
            ////        fragment.append(xml.createComment(` <========== Imported from "${href}" ========== `));
            ////        node.replace(fragment);

            ////        var xsl_remove_duplicated = xdom.xml.createDocument(`
            ////                <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
            ////                    <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
            ////                    <xsl:key name="node_by_name" use="@name" match="/*/xsl:*"/>
            ////                    <xsl:key name="node_by_name" use="@method" match="/*/xsl:output"/>
            ////                    <xsl:template match="@* | * | text() | processing-instruction() | comment()" priority="-1">
            ////                        <xsl:if test="count(key('node_by_name',concat(@name,@method))[last()]|.)&lt;=1">
            ////                            <xsl:copy-of select="."/>
            ////                        </xsl:if>
            ////                    </xsl:template>
            ////                    <xsl:template match="/*">                                
            ////                    <xsl:copy>
            ////                      <xsl:copy-of select="@*"/>
            ////                      <xsl:apply-templates/>
            ////                    </xsl:copy>
            ////                  </xsl:template>
            ////                </xsl:stylesheet>
            ////                `, 'text/xml');
            ////        xsl = xdom.xml.transform(xsl, xsl_remove_duplicated);
            ////    }
            ////    //}
            ////});
            //////}
            xsltProcessor.importStylesheet(xsl);
            xsl.selectAll(`//xsl:stylesheet/xsl:param[starts-with(@name,'js:')]`).filter(param => param.textContent).map(param => {
                try {
                    xsltProcessor.setParameter(null, param.getAttribute("name"), eval(param.textContent))
                } catch (e) {
                    //xsltProcessor.setParameter(null, param.getAttribute("name"), "")
                    console.error(e.message);
                    xsltProcessor.setParameter(null, param.getAttribute("name"), "")
                }
            });
            xsl.selectAll(`//xsl:stylesheet/xsl:param[starts-with(@name,'session:')]`).map(param => {
                try {
                    let session_value = xdom.session.getKey(param.getAttribute("name").split(/:/).pop());
                    if (session_value !== undefined) {
                        xsltProcessor.setParameter(null, param.getAttribute("name"), session_value);
                    }
                } catch (e) {
                    //xsltProcessor.setParameter(null, param.getAttribute("name"), "")
                    console.error(e.message);
                }
            });
            xsl.selectAll(`//xsl:stylesheet/xsl:param[starts-with(@name,'state:')]`).map(param => {
                try {
                    let state_value = xdom.data.document.state[param.getAttribute("name").split(/:/).pop()];
                    if (state_value !== undefined) {
                        xsltProcessor.setParameter(null, param.getAttribute("name"), state_value);
                    }
                } catch (e) {
                    //xsltProcessor.setParameter(null, param.getAttribute("name"), "")
                    console.error(e.message);
                }
            });

            ////if (!xml.documentElement) {
            ////    xml.appendChild(xdom.xml.createDocument(`<x:empty xmlns:x="http://panax.io/xdom"/>`).documentElement)
            ////}
            if (xsl.selectFirst('//xsl:param[@name="debug:timer" and text()="true"]')) {
                console.time();
            }
            if (xsl.documentElement.getAttribute("xmlns") && !(xsl.selectFirst('//xsl:output[@method="html"]')) /*xdom.browser.isIOS()*/) {// && ((result || {}).documentElement || {}).namespaceURI == "http://www.w3.org/1999/xhtml" ) {
                let transformed = xsltProcessor.transformToFragment(xml, document);
                var newDoc;
                //if (transformed.children.length && transformed.firstElementChild.namespaceURI == "http://www.w3.org/1999/xhtml") {
                //newDoc = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null);
                //} else {
                //}

                if (transformed && transformed.children.length > 1) {
                    newDoc = document.implementation.createDocument("http://www.mozilla.org/TransforMiix", "result", null);
                    [...transformed.children].map(el => newDoc.documentElement.append(el))
                } else {
                    newDoc = document.implementation.createDocument("http://www.w3.org/XML/1998/namespace", "", null);
                    if (transformed && transformed.firstElementChild) {
                        newDoc.append(transformed.firstElementChild)
                    }
                }
                result = newDoc;
            } else {
                result = xsltProcessor.transformToDocument(xml);
            }
            if (xsl.selectFirst('//xsl:param[@name="debug:timer" and text()="true"]')) {
                console.timeEnd();
            }
        } catch (e) {
            let default_document = xdom.defaults.library[(xsl.selectFirst("//xsl:import") || document.createElement('p')).getAttribute("href")];
            if (default_document && arguments.callee.caller != xdom.xml.transform) {
                result = xdom.xml.transform(xml, default_document);
            } else if (!xml.documentElement) {
                return xml;
            } else {
                console.error("xdom.xml.transform: " + (e.message || e.name)); //TODO: No está entrando en esta parte, por ejemplo cuando hay un error 404. net::ERR_ABORTED 404 (Not Found)
                return xml;
            }
        }
        //}
        if (!result) {
            if (((arguments || {}).callee || {}).caller != xdom.xml.transform && xsl.selectFirst('//xsl:import[@href="login.xslt"]')) {
                result = xdom.xml.transform(xml, xdom.defaults.library["login.xslt"]);
            } else if (((arguments || {}).callee || {}).caller != xdom.xml.transform && xsl.selectFirst('//xsl:import[@href="shell.xslt"]')) {
                result = xdom.xml.transform(xml, xdom.defaults.library["shell.xslt"]);
            } else if (!xml.documentElement) {
                return xml;
            } else {
                throw (xdom.messages.transform_exception || "There must be a problem with the transformation file. A misplaced attribute, maybe?"); //Podría ser un atributo generado en un lugar prohibido. Se puede enviar al servidor y aplicar ahí la transformación //TODO: Hacer una transformación del XSLT para identificar los problemas comúnes.
                result = xml;
            }
        }
        else if (typeof (result.selectSingleNode) == "undefined" && result.documentElement) {
            result = xdom.xml.createDocument(result.documentElement);
        }
        [...result.querySelectorAll('parsererror div')].map(message => {
            if (String(message.textContent).match(/prefix|prefijo/)) {
                var prefix = (message.textContent).match(/(?:prefix|prefijo)\s+([^\s]+\b)/).pop();
                if (!xdom.xml.namespaces[prefix]) {
                    var message = xdom.data.createMessage(message.textContent.match("(error [^:]+):(.+)").pop());
                    xml.documentElement.appendChild(message.documentElement);
                    return xml;
                }
                (xml.documentElement || xml).setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:" + prefix, xdom.xml.namespaces[prefix]);
                result = xdom.xml.transform(xml, xsl, target);
                return result;
            } else if (String(message.textContent).match(/Extra content at the end of the document/)) {
                message.remove();
            } else if (String(message.textContent).match(/Document is empty/)) {
                if (xsl.documentElement.selectAll('xsl:template').length == 1 && xsl.documentElement.selectAll('xsl:template[not(*) and text()]')) {
                    message.textContent = `Template can't return text without a wrapper`
                }
            }
        });
    }
    try {
        if (((arguments || {}).callee || {}).caller != xdom.xml.transform) {
            window.top.dispatchEvent(new CustomEvent('xmlTransformed', { detail: { original: xml, transformed: result } }));
        }
    } catch (e) { }
    return result
}

xdom.xml.consolidate = function (xsl) {
    var imports = xsl.documentElement.selectNodes("xsl:import|xsl:include");
    var processed = {};
    while (imports.length) {
        imports.map(node => {
            let href = node.getAttribute("href");
            if (xsl.selectSingleNode(`//comment()[contains(.,'=== Imported from "${href}" ===')]`)) {
                node.remove();
            } else if (xdom.library[href]) {
                //xsltProcessor.importStylesheet(xdom.library[href]);
                let fragment = document.createDocumentFragment();
                fragment.append(xsl.createComment(` === Imported from "${href}" ===>>>>>>>>>>>>>>> `));
                let library = xdom.library[href].cloneNode(true);
                Object.entries(xdom.json.difference(xdom.xml.getNamespaces(library), xdom.xml.getNamespaces(xsl))).map(([prefix, namespace]) => {
                    xsl.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', `xmlns:${prefix}`, namespace)
                });
                fragment.append(...library.documentElement.childNodes);
                fragment.append(xsl.createComment(` <<<<<<<<<<<<<<<=== Imported from "${href}" === `));

                replaceChild_original.apply(node.parentNode, [fragment, node]); //node.replace(fragment);
                xsl.documentElement.selectNodes(`xsl:import[@href="${href}"]|xsl:include[@href="${href}"]`).remove(); //Si en algún caso hay más de un nodo con el mismo href, quitamos los que quedaron (sino es posible que no se quite)
            } else {
                console.warn(`Import "${href}" not available.`)
            }
            processed[href] = true;
            //}
        });
        var xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xdom.xml.createDocument(`
            <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
                <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
                <xsl:key name="node_by_name" use="concat(name(),'::',@name)" match="/*/xsl:param"/>
                <xsl:key name="node_by_name" use="concat(name(),'::',@name)" match="/*/xsl:variable"/>
                <xsl:key name="node_by_name" use="concat(name(),'::',@name)" match="/*/xsl:template[@name]"/>
                <xsl:key name="node_by_name" use="concat(name(),'::',@href)" match="/*/xsl:include"/>
                <xsl:key name="node_by_name" use="concat(name(),'::',@href)" match="/*/xsl:import"/>
                <xsl:key name="node_by_name" use="concat(name(),'::')" match="/*/xsl:output"/>
                <xsl:template match="@* | * | text() | processing-instruction() | comment()" priority="-1">
                    <xsl:if test="count(key('node_by_name',concat(name(),'::',@name,@href))[last()]|.)&lt;=1">
                        <xsl:copy-of select="."/>
                    </xsl:if>
                </xsl:template>
                <xsl:template match="/*">                                
                <xsl:copy>
                    <xsl:copy-of select="@*"/>
                    <xsl:apply-templates/>
                </xsl:copy>
                </xsl:template>
            </xsl:stylesheet>
        `), 'text/xml');
        xsl = xsltProcessor.transformToDocument(xsl);

        imports = xsl.documentElement.selectNodes("xsl:import|xsl:include").filter(node => {
            return !(processed[node.getAttribute("href")]) || xsl.selectSingleNode(`//comment()[contains(.,'=== Imported from "${node.getAttribute("href")}" ===')]`);
        });
    }
    return xsl;
}

xdom.xml.update = function (attribute_ref, value) {
    if (typeof (attribute_ref.textContent) != "undefined") {
        attribute_ref.textContent = value;
    } else if (typeof (attribute_ref.text) != "undefined") {
        node_attribute.text = value;
    }
}

var cart = {};
cart.empty = function () {
    xdom.data.remove(xdom.dom.shell.selectSingleNode('//shell:cart'));
    xdom.dom.refresh({ forced: true });
}

Object.defineProperty(xdom.dom, 'current_hash', {
    get: function () {
        if (xdom.session.status != 'authorized') {
            return "#login"
        } else {
            return (history.state || {}).hash/* || (window.top || window).location.hash*/ || "#";
        }
    }
});

xdom.xml.createDocument = function (xml, options) {
    var options = options || {};
    var result = undefined;
    var new_namespaces = "";
    //if (xml.ownerDocument /*|| xml.documentElement*/) {
    //if (xml.ownerDocument && xml.ownerDocument.documentElement === xml) {
    //new_namespaces = xdom.json.toArray(xdom.json.difference(xdom.xml.getNamespaces(xml.ownerDocument.documentElement), xdom.xml.getNamespaces(xml.cloneNode(false)))).join(" ");
    //} else if (xml.documentElement && xml.documentElement.ownerDocument === xml) {
    //    new_namespaces = xdom.json.toArray(xdom.json.difference(xdom.xml.getNamespaces(xml.documentElement.ownerDocument.documentElement), xdom.xml.getNamespaces(xml.cloneNode(false)))).join(" ");
    //}
    //}
    var sXML = xdom.xml.toString(xml);
    //    sXML = xdom.xml.toString(sXML).replace("xmlns:", new_namespaces + " xmlns:")
    if (sXML.indexOf('<<<<<<< ') != -1) {
        throw ("Possible unresolved GIT conflict on file.");
    }
    if (window.ActiveXObject || "ActiveXObject" in window) {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        //xmlDoc = xdom.xml.createFromActiveX();
        xmlDoc.async = "false";
        xmlDoc.setProperty("SelectionLanguage", "XPath");
        var namespaces = xdom.xml.createNamespaceDeclaration(xdom.library["xdom/resources/prepare_data.xslt"], sXML);
        xmlDoc.setProperty("SelectionNamespaces", namespaces);
        if (sXML) { xmlDoc.loadXML(sXML); }
        if (xmlDoc.parseError.errorCode != 0) {
            var exception = xmlDoc.parseError;
            if (((arguments || {}).callee || {}).caller != xdom.xml.createDocument) {
                //new_namespaces = xdom.json.toArray(xdom.json.difference(xdom.xml.getNamespaces(xdom.library["xdom/resources/prepare_data.xslt"]), xdom.xml.getNamespaces(typeof (xml.cloneNode) != 'undefined' ? (xml.documentElement || xml).cloneNode(false) : sXML))).join(" ");
                new_namespaces = xdom.json.join(xdom.json.difference(xdom.xml.getNamespaces(xdom.library["xdom/resources/prepare_data.xslt"]), xdom.xml.getNamespaces(typeof (xml.cloneNode) != 'undefined' ? (xml.documentElement || xml).cloneNode(false) : sXML)));
                sXML = sXML.replace("xmlns:", new_namespaces + " xmlns:")
                return xdom.xml.createDocument(sXML);
            } else {
                if (config["notify_error"] !== false) {
                    throw ("Exception creating xml document: " + exception.reason);
                }
                return null;
            }
        }
    } else {
        result = new DOMParser();
        if (!sXML) {
            result = document.implementation.createDocument("http://www.w3.org/XML/1998/namespace", "", null);
        } else {
            if (xml.namespaceURI && xml.namespaceURI.indexOf("http://www.w3.org") == 0) {
                result = result.parseFromString(sXML, "text/html");
            } else {
                result = result.parseFromString(sXML, "text/xml");
            }
            if (sXML && result.getElementsByTagName && (result.getElementsByTagName('parsererror').length || 0) > 0) {
                [...result.querySelectorAll('parsererror div')].map(message => {
                    if (String(message.textContent).match(/prefix|prefijo/)) {
                        var prefix = (message.textContent).match(/(?:prefix|prefijo)\s+([^\s]+\b)/).pop();
                        if (!xdom.xml.namespaces[prefix]) {
                            var message = xdom.data.createMessage(message.textContent.match("(error [^:]+):(.+)").pop());
                            //xml.documentElement.appendChild(message.documentElement);
                            return message;
                        }
                        //(xml.documentElement || xml).setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:" + prefix, xdom.xml.namespaces[prefix]);
                        sXML = sXML.replace(new RegExp(`\\b${prefix}:`), `xmlns:${prefix}="${xdom.xml.namespaces[prefix]}" $&`)
                        result = xdom.xml.createDocument(sXML);
                        return result;
                    } else if (message.closest("html") && String(message.textContent).match(/Extra content at the end of the document/)) {
                        message.closest("html").remove();
                        //result = document.implementation.createDocument("http://www.w3.org/XML/1998/namespace", "", null);
                    } else {
                        var message = xdom.data.createMessage(message.textContent.match("(error [^:]+):(.+)").pop());
                        return message;
                    }
                });

                //if (((arguments || {}).callee || {}).caller != xdom.xml.createDocument && String(result.getElementsByTagName('parsererror')[0].innerHTML).match(/prefix|prefijo/)) {
                //    new_namespaces = xdom.json.join(xdom.json.difference(xdom.json.merge(xdom.xml.getNamespaces(xdom.library["xdom/resources/prepare_data.xslt"]), xdom.manifest.namespaces), xdom.xml.getNamespaces(typeof (xml.cloneNode) != 'undefined' ? (xml.documentElement || xml).cloneNode(false) : sXML)), { "separator": " " });
                //    sXML = sXML.replace("xmlns:", new_namespaces + " xmlns:");
                //    return xdom.xml.createDocument(sXML);
                //} else if (((arguments || {}).callee || {}).caller != xdom.xml.createDocument && String((result.querySelector('parsererror div') || '').textContent).match(/Attribute xmlns:[^\s]+ redefined/)) {
                //    new_namespaces = [...new Set(sXML.match(/(xmlns:\w+)=(["'])([^\2]+?)\2/ig))].join(" ");
                //    sXML = sXML.replace(/(xmlns:\w+)=(["'])([^\2]+?)\2\s*/ig, '');
                //    sXML = sXML.replace(/<\w[^\s\/]+/, `$& ${new_namespaces}`);
                //    return xdom.xml.createDocument(sXML);
                //}
                //else if (String(result.getElementsByTagName('parsererror')[0].outerText).match(/Extra content at the end of the document/)) {
                //    return result = document.implementation.createDocument("http://www.w3.org/XML/1998/namespace", "", null);
                //}
                //if (notify_error !== false) {
                //    throw ((result.querySelector('parsererror div') || '').textContent || result.getElementsByTagName('parsererror')[0].outerText || result.getElementsByTagName('parsererror')[0].innerHTML);
                //}
                //return null;
            }
        }
    }

    var _manifest_filter_xpath = function (xpath) {
        try {
            return !!result.selectSingleNode(xpath);
        } catch (e) {
            return false;
        }
    }

    if (result.documentElement && !["http://www.w3.org/1999/xhtml", "http://www.w3.org/1999/XSL/Transform"].includes(result.documentElement.namespaceURI)) {
        Object.entries((xdom.manifest.modules || {})).filter(([key, value]) => key.match(/^[^#]/) && value["transforms"] && _manifest_filter_xpath(key)).reduce((stylesheet, [key, value]) => { return value["transforms"] }, []).map(stylesheet => {
            result.addStylesheet(stylesheet);
        });
    }
    return result;
}

xdom.xml.isValid = function (input) {
    return (input instanceof XMLDocument);
}

xdom.xml.tryParse = function (input) {
    let output = xdom.xml.createDocument(input);
    return output.getElementsByTagName('parsererror').length && input || output;
}

xdom.xml.createNode = function (xml_string, notify_error) {
    let doc = xdom.xml.createDocument(xml_string, notify_error)
    return doc.documentElement;
}

xdom.xml.createElement = function (tagName) {
    return document.implementation.createDocument("http://www.w3.org/XML/1998/namespace", tagName, null).documentElement;
}

xdom.xml.clone = function (source) {
    return xdom.xml.createDocument(source);
}

xdom.xml.fromHTML = function (html) {
    let xhtml = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "", null);
    xhtml.appendChild(xhtml.importNode(html, true));
    return xhtml
}

xdom.data.createMessage = function (message_text, message_type) {
    var message = xdom.xml.createDocument('<x:message xmlns:x="http://panax.io/xdom" x:id="xhr_message_' + Math.random() + '" type="' + (message_type || "exception") + '"/>');
    message.documentElement.textContent = message_text;
    return message;
}

xdom.defaults.library["shell.xslt"] = xdom.xml.createDocument(`
<xsl:stylesheet version="1.0"                                                                           
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"                                                    
    xmlns="http://www.w3.org/1999/xhtml">                                                               
    <xsl:output method="xml" indent="no" />                                                             
    <xsl:template match="node()">                                                                       
    <main><div class="p-5 mb-4 bg-light rounded-3">
      <div class="container-fluid py-5">
        <h1 class="display-5 fw-bold">Welcome to xdom!</h1>
        <p class="col-md-8 fs-4">Please create your templates in your own transformation file.</p><p>Starting with shell.xslt is a good idea.</p>
        <button class="btn btn-primary btn-lg" type="button">Show me how!</button>
      </div>
    </div>
    </main>
    </xsl:template>                                                                                     
    <xsl:template match="text()|processing-instruction()|comment()"/>                                   
</xsl:stylesheet> `);

xdom.defaults.library["login.xslt"] = xdom.xml.createDocument(`
<xsl:stylesheet version="1.0"                                                                           
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"                                                    
    xmlns="http://www.w3.org/1999/xhtml">                                                               
    <xsl:output method="xml" indent="no" />                                                             
    <xsl:template match="node()">                                                                       
    <div class="p-5 mb-4 bg-light rounded-3">
      <div class="container-fluid py-5">
        <h1 class="display-5 fw-bold">Welcome to xdom!</h1>
        <p class="col-md-8 fs-4">It looks like login feature is enabled and requires a template.</p><p>Please create your templates in your own transformation file.</p><p>Starting with login.xslt is a good idea.</p>
        <button class="btn btn-primary btn-lg" type="button">Show me how!</button>
      </div>
    </div>
    </xsl:template>                                                                                     
    <xsl:template match="text()|processing-instruction()|comment()"/>                                   
</xsl:stylesheet> `);

xdom.defaults.library["loading.xslt"] = xdom.xml.createDocument(`
<xsl:stylesheet version="1.0"                                                                           
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"                                                    
    xmlns="http://www.w3.org/1999/xhtml">                                                               
    <xsl:output method="xml" indent="no" />                                                             
    <xsl:template match="node()">                                                                       
    <div class="loading" onclick="if (this.store.state.submitting) {{return}}; this.remove(); this.store.getStylesheets({{href:'loading.xslt'}}).remove();">
      <div class="modal_content-loading">
        <div class="modal-dialog modal-dialog-centered">
          <div class="no-freeze-spinner">
            <div id="no-freeze-spinner">
              <div>
                <i>
                  <img src="./custom/images/favicon.png" class="ring_image"/>
                </i>
                <div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </xsl:template>                                                                                     
    <xsl:template match="text()|processing-instruction()|comment()"/>                                   
</xsl:stylesheet> `);

xdom.defaults["#login"] = xdom.xml.createDocument(`<?xml-stylesheet type="text/xsl" href="login.xslt" role="login" target="body"?><x:login xmlns:x="http://panax.io/xdom"/> `);

xdom.defaults.library["message.xslt"] = xdom.xml.createDocument(`
<xsl:stylesheet version="1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:x="http://panax.io/xdom"
  xmlns="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="xsl x"
>
  <xsl:output method="xml"
     omit-xml-declaration="yes"
     indent="yes" standalone="no"/>

  <!--Mostrar mensajes en la aplicación-->
  <xsl:template match="x:message">
    <div class="{@type}">
      <div class="messages" style="z-index: 1090">
        <div class="modal-dialog" role="document" style="padding-top: 160px;">
          <div class="modal-content message-error w-100">
            <div class="modal-header alert">
              <h2 class="modal-title font-weight-bold mt-2" style="margin-left: 4rem !important;">¡Aviso!</h2>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="xdom.data.removeMessage('{@x:id}')">
                <!--<img class="gwt-Image mt-2 mr-2" src="./custom/images/circle-x.svg" width="30" height="30"/>-->
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-x-circle text-primary_messages" viewBox="0 0 24 24">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </div>
            <div class="modal-body ">
              <h4 style="margin-left: 3rem !important;">
                <xsl:value-of select="."/>
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xsl:template>
</xsl:stylesheet>`);
xdom.data.default = xdom.xml.createDocument('<?xml-stylesheet type="text/xsl" href="shell.xslt" role="shell" target="body"?><shell:shell xmlns:x="http://panax.io/xdom" xmlns:shell="http://panax.io/shell" xmlns:state="http://panax.io/state" xmlns:source="http://panax.io/xdom/binding/source" x:id="shell" x:hash=""></shell:shell>');

xdom.defaults["#shell"] = xdom.xml.createDocument('<?xml-stylesheet type="text/xsl" href="shell.xslt" role="shell" target="body"?><shell:shell xmlns:x="http://panax.io/xdom" xmlns:shell="http://panax.io/shell" xmlns:state="http://panax.io/state" xmlns:source="http://panax.io/xdom/binding/source" x:id="shell" x:hash=""></shell:shell>');

xdom.defaults["#settings"] = xdom.xml.createDocument('<?xml-stylesheet type="text/xsl" href="widget.xslt" role="settings" target="#shell #settings"?><shell:settings xmlns:shell="http://panax.io/shell"/>');
xdom.init = async function () {
    var manifest = await xdom.fetch.json('.manifest');
    xdom.manifest = new xdom.Manifest(xdom.json.merge(manifest, xdom.manifest));
    await xdom.library.load(["xdom/resources/session.xslt", "xdom/resources/prepare_data.xslt", "xdom/resources/databind.xslt", "xdom/resources/normalize_namespaces.xslt"].concat(xdom.manifest.transforms));

    var settings = (arguments[0] || {});
    if (settings && settings.constructor !== {}.constructor) {
        settings = {};
        settings["data_source"] = arguments[0];
    }
    xdom.modernize();
    xdom.data.stores.restore();
    xdom.session.cache_name = typeof (caches) != 'undefined' && (await caches.keys()).find(cache => cache.match(new RegExp(`^${location.hostname}_`))) || "";
    if (xdom.session.getKey("userId") == null) {
        xdom.session.setKey("userId", undefined)
    }
    xdom.manifest.sources = (xdom.manifest.sources || [])

    xdom.storage.enabled = xdom.storage.getKey("xdom.storage.enabled");
    if (xdom.storage.enabled == undefined) {
        xdom.storage.enable();
    }
    xdom.dom.refreshTitle();
    if (((xdom.manifest.server || {}).endpoints || {})["login"]) {
        await xdom.session.getCurrentStatus();
        var current_status = xdom.session.status;
        var current_user = xdom.session.getUserLogin();
        if (current_status == 'unauthorized' && current_user === undefined) {
            xdom.session.login();
        }
    }
    if (!xdom.data.stores[xdom.state.seed]) {
        let source = xdom.sources[xdom.state.seed];
        await source && source.fetch && source.fetch();
    }
    await xdom.dom.refresh();
    xdom.data.document.selectNodes('//*[local-name()="message" and namespace-uri()="http://panax.io/xdom"][@scope="login"]').remove();
}

xdom.db.Parameter = function (name, value, output) {
    Object.defineProperty(this, 'name', {
        value: name,
        writable: true, enumerable: false, configurable: false
    });
    Object.defineProperty(this, 'value', {
        value: value,
        writable: true, enumerable: false, configurable: false
    });
    Object.defineProperty(this, 'output', {
        value: output,
        writable: true, enumerable: false, configurable: false
    });
}

Object.defineProperty(xdom.data, 'document', {
    get: function () {
        let store = xdom.data.stores[xdom.state.active] || xdom.data.stores[xdom.state.seed] || xdom.data.stores["#"];// || xdom.data.Store(`<?xml-stylesheet type="text/xsl" href="message.xslt" role="modal" target="body" action="append"?><x:message xmlns:x="http://panax.io/xdom" x:id="xhr_message_${Math.random()}"/>`);
        return store;
        if (xdom.data.stores[(window.top || window).location.hash]) {
            hashtag = (window.top || window).location.hash;
        } else if (xdom.data.stores[xdom.state.active]) {
            if (hashtag != xdom.state.active) {
                xdom.dom.navigateTo(xdom.state.active);
            }
            hashtag = xdom.state.active;
        } else {
            hashtag = '#';
        }

        //if (!xdom.data.stores[(window.top || window).location.hash]) {
        //    hashtag = xdom.state.active;
        //}
        //xdom.data.stores[hashtag] = xdom.xml.transform((xdom.data.stores[hashtag]/*|| xdom.data.default*/), xdom.library["xdom/resources/session.xslt"]);
        return (xdom.data.stores[hashtag] && xdom.data.stores[hashtag].documentElement && xdom.data.stores[hashtag] || xdom.dom.shell || xdom.data.Store(`<x:empty xmlns:x="http://panax.io/xdom"/>`));
    }
    , set: async function (input) {
        if (input && typeof input.then == 'function') {
            input = await input;
        }
        if (!(input instanceof xdom.data.Store)) {
            input = new xdom.data.Store(input);
            //input.reseed();
        }

        if (input) {
            var hashtag = input.tag || xdom.data.hashTagName(input);
            if (hashtag == xdom.data.hashTagName()) {
                var current_position = xdom.data.getScrollPosition();
                xdom.data.updateScrollPosition(input, current_position);
            }

            xdom.data.stores[hashtag] = input;
            //if (hashtag != (history.state.seed || (window.top || window).location.hash || xdom.data.stores["#"].tag)) {//(history.state.hash || (window.top || window).location.hash)
            if (xdom.data.stores[hashtag] != xdom.data.stores[xdom.state.seed]) {
                //xdom.dom.history.push((window.top || window).location.hash);
                xdom.dom.navigateTo(hashtag);
            }
            input.isActive = true;
            input.getStylesheets({ href: "loading.xslt" }).remove();
            xdom.dom.refresh({ forced: true });
        }
    }
});

Object.defineProperty(xdom.dom, 'sitemap', {
    get: function () {
        return xdom.dom.shell.selectSingleNode('//*[namespace-uri()="http://panax.io/sitemap" and local-name()="sitemap"]');
    }
});

Object.defineProperty(xdom.dom, 'shell', {
    get: function () {
        if (xdom.data.stores["#shell"] && !(xdom.data.stores["#shell"] instanceof xdom.data.Store)) {
            xdom.data.stores["#shell"] = new xdom.data.Store(xdom.data.stores["#shell"]);
        }
        //xdom.data.stores['#shell'] = xdom.xml.transform(xdom.data.stores['#shell'] || (xdom.data.default.selectSingleNode('//*[namespace-uri()="http://panax.io/shell" and local-name()="shell"]') ? xdom.data.default : xdom.xml.createDocument('<?xml-stylesheet type="text/xsl" href="shell.xslt" role="shell" target="body"?><shell:shell xmlns:shell="http://panax.io/shell" xmlns:state="http://panax.io/state"></shell:shell>')), xdom.library["xdom/resources/session.xslt"]);
        xdom.dom.shell = (xdom.data.stores['#shell'] || ((xdom.data.default.selectSingleNode('//*[namespace-uri()="http://panax.io/shell" and local-name()="shell"]') || {}).ownerDocument || {}).store && xdom.data.default || xdom.data.Store('<?xml-stylesheet type="text/xsl" href="shell.xslt" role="shell" target="body"?><shell:shell xmlns:shell="http://panax.io/shell"/>'));
        return xdom.data.stores['#shell'];
    }
    , set: function (input) {
        if (!(input instanceof xdom.data.Store)) {
            input = new xdom.data.Store(input);
        }

        if (input) {
            if (!xdom.data.stores["#shell"]) {
                (xdom.manifest.getConfig("#sitemap", 'transforms') || []).filter(stylesheet => stylesheet.href && stylesheet.role == 'init').map(transform => transform = input.addStylesheet(transform));
            }
            xdom.data.stores["#shell"] = input;
            //xdom.dom.refresh({ forced: true });
            //xdom.data.stores["#shell"].render();
        }
    }
});

Object.defineProperty(xdom.dom, 'cart', {
    get: function () {
        var cart = xdom.dom.shell.selectSingleNode('//shell:cart');
        if (!cart) {
            xdom.dom.shell.selectSingleNode('//shell:shell').appendChild(xdom.xml.createDocument('<shell:cart xmlns:shell="http://panax.io/shell"></shell:cart>').documentElement);
        }
        return xdom.dom.shell.selectSingleNode('//shell:cart');
    }
});

Object.defineProperty(xdom.dom, 'settings', {
    get: function () {
        return xdom.data.stores.find("shell:settings")[0] || xdom.defaults["#settings"];
    }
});


xdom.data.Binding = function (node) {
    if (!(this instanceof xdom.data.Binding)) return new xdom.data.Binding();
    Object.defineProperty(this, 'id', {
        value: node.getAttribute("x:id"),
        writable: false, enumerable: false, configurable: false
    });
    Object.defineProperty(this, 'node', {
        get: function () {
            return xdom.xml.createDocument(xdom.data.document).selectSingleNode('//*[@x:id="' + this.id + '"]');
        }
    });
    Object.defineProperty(this, 'nodeName', {
        get: function () {
            return this.node.nodeName
        }
        , enumerable: false, configurable: false
    });
    Object.defineProperty(this, 'value', {
        get: function () {
            return this.node.getAttribute('x:value')
        }
        , enumerable: false, configurable: false
    });
    Object.defineProperty(this, 'text', {
        get: function () {
            return this.node.getAttribute('x:text')
        }
        , enumerable: false, configurable: false
    });
    Object.defineProperty(this, 'dependants', {
        value: {},
        writable: true, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'formulas', {
        value: {},
        writable: true, enumerable: false, configurable: false
    });
    this.updated = true;
    return this;
}

xdom.data.Dependency = function () {
    if (!(this instanceof xdom.data.Dependency)) return new xdom.data.Dependency();
    Object.defineProperty(this, 'attributes', {
        value: {},
        writable: true, enumerable: false, configurable: false
    });
    Object.defineProperty(this, 'sources', {
        value: {},
        writable: true, enumerable: false, configurable: false
    });
    this.updated = false;
    return this;
}

xdom.data.EmptyXML = function () {
    this.selectSingleNode = function () {
        return [];
    }
    this.selectNodes = function () {
        return [];
    }
    this.setAttribute = function () {
        return undefined;
    }
    this.getAttribute = function () {
        return undefined;
    }
    this.nodeValue = undefined
}
//xdom.xhr.loadDataSource = function (settings) {
//    var target = settings["target"];
//    var target_attribute = settings["target_attribute"];
//    var request = settings["request"];
//    var on_complete = settings["on_complete"];
//    var xml_document = xdom.cache[request];
//    if (xdom.cache[request]) {
//        return xdom.cache[request];
//    } else {
//        if (xdom.xhr.Requests[target.getAttribute("x:id") + '::' + request]) {
//            return false;
//        }
//        xdom.xhr.Requests[target.getAttribute("x:id") + '::' + request] = true;
//        xdom.server.request({
//            "request": request.replace(/^\w+:/, '')
//            , "xhr": xdom.json.merge({
//                "async": true
//                , "target": target
//                , "onComplete": function (Response) {
//                    if (Response.xml && Response.xml.documentElement) {
//                        xml_document = Response.xml.documentElement;
//                        xdom.cache[request] = xdom.xml.createDocument(xml_document);
//                        xdom.data.update({ "uid": target.getAttribute('x:id'), "attribute": target_attribute, "value": xml_document, "cascade": true, "action": "replace" });
//                        return xml_document;
//                    }
//                    if (on_complete && on_complete.apply) {
//                        on_complete.apply(this, arguments);
//                    };
//                    delete xdom.xhr.Requests[target.getAttribute("x:id") + '::' + request];
//                }
//            }, settings["xhr"])
//        });
//    }
//    //}
//}

//xdom.devTools.live = function () {/* OVERCHARGED:
//    xdom.devTools.live() ;                          //Refresh every document with default values
//    xdom.devTools.live(true) ;                      //Refresh every document
//    xdom.devTools.live(false);                      //Stops refreshing
//    xdom.devTools.live(5);                          //Refresh every 5 seconds every document
//    xdom.devTools.live(5, 'file.xml');              //Refresh every 5 seconds file.xml 
//    xdom.devTools.live('file.xml');                 //Refresh file.xml with default values
//    xdom.devTools.live(['file1.xml','file2.xml']);  //Refresh file1.xml and file2.xml with default values
//*/
//    var refresh_rate, document_name_or_array;
//    var a = 0;
//    if (this.Check) window.clearInterval(this.Check);
//    if (arguments.length != 0) {
//        if (typeof (arguments[a]) == 'boolean') {
//            if (arguments[a++] == false) {
//                return false;
//            }
//        }
//        if (typeof (arguments[a]) == "number") {
//            refresh_rate = arguments[a++];
//        }
//        if (typeof (arguments[a]) == "string" || typeof (arguments[a]) == "object") {
//            document_name_or_array = arguments[a++];
//        }
//    }

//    //xdom.storage.disable();
//    refresh_rate = (refresh_rate || 3);
//    refresh_rate = (refresh_rate * 1000);
//    var refresh = function () {
//        window.console.info('Checking for changes in documents...');
//        xdom.library.reload(document_name_or_array);
//    };

//    this.Check = setInterval(function () { refresh() }, refresh_rate);
//}

xdom.data.processDocument = async function (document) {
    if (!document.documentElement) {
        return;
    }
    if (!(document instanceof xdom.data.Store)) {
        document = xdom.data.Store(document);
    }
    document.reseed();
    if (document.selectSingleNode('//*[namespace-uri()="http://panax.io/shell" and local-name()="shell"]|//*[namespace-uri()="http://panax.io/sitemap" and local-name()="sitemap"]')) {
        if (!xdom.dom.shell.documentElement) {
            xdom.dom.shell = document
        } else {
            Object.entries(xdom.json.difference(xdom.xml.getNamespaces(document), xdom.xml.getNamespaces(xdom.dom.shell))).map(entry => xdom.dom.shell.documentElement.setAttribute(entry[0], entry[1]), false);
            document.selectNodes('/*/@*[name()!="x:id"]').map(attr => xdom.dom.shell.documentElement.setAttribute(attr.name, attr.value), false);
            var shell = xdom.dom.shell;
            //shell.documentElement.setAttribute("state:refresh", "true");
            if (shell.getStylesheets().length == 0) {
                var stylesheets = document.selectNodes("processing-instruction('xml-stylesheet')");
                if (stylesheets.length == 0) {
                    var pi = shell.createProcessingInstruction('xml-stylesheet', 'type="text/xsl" href="shell.xslt" role="shell" target="body"');
                    shell.insertBefore(pi, shell.firstChild);
                } else {
                    for (var s = 0; s < stylesheets.length; ++s) {
                        var pi = shell.createProcessingInstruction('xml-stylesheet', stylesheets[s].data);
                        shell.insertBefore(pi, shell.firstChild);
                    }
                }
            }

            var nodes = document.selectNodes('//*[namespace-uri()="http://panax.io/shell" and local-name()="shell"]/*');
            for (var dr in nodes) {
                var node = nodes[dr];
                xdom.data.remove(shell.selectSingleNode('//*[namespace-uri()="' + node.namespaceURI + '" and local-name()="' + node.localName + '"]'));
                shell.documentElement.appendChild(node);
            }

            var nodes = document.selectNodes('//*[namespace-uri()="http://panax.io/sitemap" and local-name()="sitemap"]');
            for (var dr in nodes) {
                var node = nodes[dr];
                xdom.data.remove(shell.selectSingleNode('//*[namespace-uri()="' + node.namespaceURI + '" and local-name()="' + node.localName + '"]'));
                shell.documentElement.appendChild(node);
            }
            xdom.dom.shell = shell;
        }
    }
    else {
        xdom.data.stores[xdom.data.hashTagName(document)] = document;
    }
}

xdom.data.load = async function (file_name_or_document, custom_on_complete) {
    let document = await xdom.data.stores.fetch(file_name_or_document)
    xdom.data.document = document;
    return xdom.data.document;

    if (!file_name_or_document) return null;
    var library = (arguments[2] || {});
    var _parent = this;
    var _parent_arguments = this;
    on_complete = async function (document, document_name, request) {
        ////var transforms = xdom.data.getTransformationFileName().split(";");
        ////var dom;
        ////var layout_transform = transforms.pop();
        ////for (var t = 0; t < transforms.length; t++) {
        ////    dom = xdom.xml.transform((dom || xdom.data.document), xdom.library[transforms[t]]);
        ////}
        ////xdom.data.document = xdom.xml.createDocument(dom || xdom.data.document);
        //for (var d in xdom.library) {
        //    if (!xdom.library[d]) {
        //        console.info("Document " + d + " not ready");
        //        return;
        //    }
        //}
        await xdom.data.processDocument(document);
        library[document_name] = document;

        if (custom_on_complete && custom_on_complete.apply) {
            custom_on_complete.apply(this, [document, request]);
        }
        else {
            if (typeof (file_name_or_document) == 'string') {
                xdom.data.document = document;
            }

            //xdom.dom.refresh({ forced: true });
            //xdom.dom.refresh(xdom.dom.target, function () {
            //    xdom.data.history.undo = [xdom.data.document];
            //    xdom.data.history.redo = [];
            //});
        }; //xdom.dom.refresh
    };
    if (typeof (file_name_or_document) == 'object') {
        var document_name_or_array = file_name_or_document;
        if (document_name_or_array.constructor === [].constructor || document_name_or_array.constructor === {}.constructor) {
            var batch_on_complete = function () {
                for (var document_index in document_name_or_array) {
                    var document_name = document_name_or_array.constructor === {}.constructor ? document_index : document_name_or_array[document_index];
                    if (!library[document_name]) {
                        return;
                    }
                }
                if (custom_on_complete && custom_on_complete.apply) {
                    custom_on_complete.apply(this, [library]);
                };
            }
            var all_loaded = true;
            for (var document_index in document_name_or_array) {
                document_name = document_name_or_array.constructor === {}.constructor ? document_index : document_name_or_array[document_index];
                if (!document_name) continue;
                library[document_name] = library[document_name];
            }
            for (var document_name in library) {
                if (!library[document_name]) {
                    all_loaded = false;
                    xdom.data.load(document_name, batch_on_complete, library);
                }
            }
            if (all_loaded) {
                batch_on_complete.apply(_parent, _parent_arguments)
            }
            return;
        }
        if (typeof (file_name_or_document.selectSingleNode) == 'undefined') return;
        xdom.data.document = file_name_or_document;
        await xdom.data.loadDependencies(xdom.data.document, on_complete);
        xdom.session.setData(xdom.xml.toString(xdom.data.document));
        if (on_complete && on_complete.apply) {
            on_complete.apply(this, arguments);
        }; //xdom.dom.refresh
    } else if (typeof (file_name_or_document) == 'function') {
        file_name_or_document.call(this)
        return;
    } else {
        file_name_or_document = (file_name_or_document || xdom.data.stores);
        //if (typeof (Storage) !== "undefined") {
        //    if (xdom.session.getKey("xdom.data")) {
        //        xdom.data.document = xdom.session.getKey("xdom.data");
        //        xdom.data.loadDependencies(xdom.data.document, on_complete);
        //        if (on_complete && on_complete.apply) {
        //            on_complete.apply(this, arguments);
        //        }; //xdom.dom.refresh(xdom.dom.target);
        //    }
        //} else {
        //    console.log('No support for client storage, go ahead with caution');
        //}
    }

    //if (!xdom.data.document) {
    if (typeof (file_name_or_document) == "string") {
        xdom.xhr.loadXMLFile(file_name_or_document, {
            onSuccess: function (Response, Request) {
                if (Response.type == "xml") {
                    xdom.data.Store(Response.responseText, function () {
                        if (on_complete && on_complete.apply) {
                            on_complete.apply(_parent, [this/*.document*/, Request.request, Request]);//_parent_arguments
                        };
                    });
                }
            }
            , onException: function (Response, Request) {
                if (Response.type == "xml") {
                    if (Response.document.documentElement.selectSingleNode('/x:message')) {
                        xdom.data.document.documentElement.appendChild(Response.document.documentElement);
                    }
                    xdom.data.Store(Response.responseText, function () {
                        if (on_complete && on_complete.apply) {
                            on_complete.apply(_parent, [this/*.document*/, Request.request, Request]);//_parent_arguments
                        };
                    });
                }
            }
            , onFail: function (Response, Request) {
                xdom.data.load('default.xml');
                xdom.data.document.reseed();
                if (Response.type == "xml") {
                    if (Response.document.documentElement.selectSingleNode('/x:message')) {
                        xdom.data.document.documentElement.appendChild(Response.document.documentElement);
                    }
                    xdom.data.Store(Response.responseText, function () {
                        if (on_complete && on_complete.apply) {
                            on_complete.apply(_parent, [this/*.document*/, Request.request, Request]);//_parent_arguments
                        };
                    });
                } else {
                    if (on_complete && on_complete.apply) {
                        on_complete.apply(_parent, [this/*.document*/]);
                    };
                }
            }
        });
    } else { //Reubicar esta llamada
        xdom.data.load('default.xml');
        xdom.data.document.reseed();
        //xdom.session.getUserId();
    }
    //} else {
    //    if (on_complete && on_complete.apply) {
    //        on_complete.apply(this, arguments);
    //    }; //xdom.dom.refresh
    //}
}

xdom.data.getStylesheets = function (xml_document, predicate) {
    var predicate = (predicate ? `[${predicate}]` : '');
    var stylesheets_nodes = (xml_document || xdom.data.document || new xdom.data.EmptyXML()).selectNodes("processing-instruction('xml-stylesheet')" + predicate);
    var stylesheets = [];
    for (var s = 0; s < stylesheets_nodes.length; ++s) {
        stylesheet = JSON.parse('{' + (stylesheets_nodes[s].data.match(/(\w+)=(["'])([^\2]+?)\2/ig) || []).join(", ").replace(/(\w+)=(["'])([^\2]+?)\2/ig, '"$1":$2$3$2') + '}');
        stylesheets.push(stylesheet);
        //if (!xdom.library[stylesheet.href] && !xdom.xhr.Requests[stylesheet.href]) {
        //    var oData = new xdom.xhr.Request(stylesheet.href);
        //    //oData.onComplete = element.onComplete;
        //    //oData.onSuccess = element.onSuccess;
        //    //oData.onException = element.onException;
        //    oData.load();
        //    return;
        //}
    }
    return stylesheets;
}

xdom.data.getTransformations = function (xml_document) {
    var xml_document = (xml_document || xdom.data.document || {});
    if (typeof (xml_document.selectSingleNode) == 'undefined') return {};
    if (!xml_document.selectSingleNode("*")) return {};
    var library = {};
    if (typeof (xml_document.setProperty) != "undefined") {
        var current_namespaces = xdom.xml.getNamespaces(xml_document.getProperty("SelectionNamespaces"));
        if (!current_namespaces["x"]) {
            current_namespaces["x"] = "http://panax.io/xdom";
            xml_document.setProperty("SelectionNamespaces", xdom.json.join(current_namespaces, { "separator": " " }));
        }
    }
    var transform_collection = xml_document.selectNodes('.//@*[local-name()="transforms" and contains(namespace-uri(), "http://panax.io/xdom") or namespace-uri()="http://panax.io/transforms"]');
    if (transform_collection.length) {
        for (var s = 0; s < transform_collection.length; ++s) {
            var transforms = transform_collection[s].value.split(/\s*;+\s*/)
            for (var t = 0; t < transforms.length; ++t) {
                if (!transforms[t]) {
                    continue;
                }
                library[transforms[t]] = undefined; //xdom.library[transforms[t]];
            }
        }
    }
    //else {
    //    var file_name = ((window.location.pathname.match(/[^\/]+$/g) || []).join('').split(/\.[^\.]+$/).join('') || "default") + ".xslt";
    //    library[file_name] = xdom.library[file_name];
    //}
    var stylesheets = xml_document.selectNodes("processing-instruction('xml-stylesheet')");
    for (var s = 0; s < stylesheets.length; ++s) {
        stylesheet = JSON.parse('{' + (stylesheets[s].data.match(/(\w+)=(["'])([^\2]+?)\2/ig) || []).join(", ").replace(/(\w+)=(["'])([^\2]+?)\2/ig, '"$1":$2$3$2') + '}');
        if ((stylesheet.type || '').indexOf('xsl') != -1) {
            library[stylesheet.href] = undefined; //xdom.library[stylesheet.href];
        }
    }
    return library;
}

xdom.data.getTransformationFileName = function (xml_document) {
    var xml_document = (xml_document || xdom.data.document || {});
    if (typeof (xml_document.selectSingleNode) == 'undefined') return '';
    //if (!xml_document.selectSingleNode("*")) return '';
    //var transform_collection = xml_document.selectNodes(".//@x:transforms|.//@*[namespace-uri()='http://panax.io/transforms']");// || window.location.pathname.match(/\w+\.\w+$/).toString().replace(/\.\w+$/, '') + ".xslt"
    var transform_collection = xml_document.selectNodes('.//@*[local-name()="transforms" and contains(namespace-uri(), "http://panax.io/xdom")]'); //xml_document.selectNodes(".//@x:transforms");// || window.location.pathname.match(/\w+\.\w+$/).toString().replace(/\.\w+$/, '') + ".xslt"
    var transforms = ''
    var stylesheets = xml_document.selectNodes("processing-instruction('xml-stylesheet')");
    if (transform_collection.length || stylesheets.length) {
        for (var s = 0; s < transform_collection.length; ++s) {
            transforms = transform_collection[s].value + ';' + transforms;
        }
        for (var s = 0; s < stylesheets.length; ++s) {
            stylesheet = JSON.parse('{' + (stylesheets[s].data.match(/(\w+)=(["'])([^\2]+?)\2/ig) || []).join(", ").replace(/(\w+)=(["'])([^\2]+?)\2/ig, '"$1":$2$3$2') + '}');
            transforms = stylesheet.href + ';' + transforms;
        }
    } /*else {
        transforms = ((window.location.pathname.match(/[^\/]+$/g) || []).join('').split(/\.[^\.]+$/).join('') || "shell") + ".xslt";
    }*/
    return transforms.replace(/\s*;+\s*/gi, ';').replace(/;\s*$/gi, '');
}

xdom.data.loadDependencies = async function (xml_document, on_complete) {
    var library = xdom.data.getTransformations(xml_document);
    await xdom.library.load(library, on_complete);
}

xdom.data.reload = function (settings) {
    /*var settings = (settings || {})
    xdom.xhr.loadXMLFile('data.xml?id=' + Math.random(), {
        onSuccess: function () {
            xdom.data.document = xdom.xml.createDocument(this.document);
            if (settings.onSuccess) { settings.onSuccess.apply(this, [this.response, this.xhr]); }
            xdom.dom.refresh(xdom.dom.target);
        }
    });*/
    xdom.data.clear();
    xdom.data.load();
}

xdom.xml.safeEntities = {
    "<": "&lt;"
}

xdom.xml.encodeEntities = function (text) {
    new_text = text;
    new_text = new_text.replace(/</g, xdom.xml.safeEntities["<"]);
    return new_text;
}

xdom.datagrid.columns.toggleVisibility = function (column_name) {
    var transforms = xdom.data.getTransformationFileName(xdom.data.document).split(";");
    var layout_transform = transforms.pop();
    var xsl = (xdom.library[layout_transform].document || xdom.library[layout_transform]);

    //var root_node = xsl.documentElement.selectSingleNode('//xsl:key[@name="hidden"][@match="/"]');
    //if (!root_node) {
    //    console.error((xdom.messages["datagrid.columns.toggleVisibility.error"] || "Error: datagrid.columns.toggleVisibility"));
    //    return false;
    //}
    if (column_name) {
        var key_node = xsl.documentElement.selectSingleNode('//xsl:key[@name="hidden"][@use="generate-id()"][@match="' + column_name + '"]');
        if (!key_node) {
            var new_key = xdom.xml.createDocument('<xsl:key xmlns:xsl="http://www.w3.org/1999/XSL/Transform" name="hidden" match="' + column_name + '" use="generate-id()"/>');
            //xdom.dom.insertAfter(new_key.documentElement, root_node);
            xsl.selectSingleNode('*').appendChild(new_key.documentElement);
        } else {
            xdom.data.remove(key_node);
        }
    }

    xdom.dom.refresh();
}

xdom.datagrid.columns.groupBy = function (column_name) {
    var transforms = xdom.data.getTransformationFileName(xdom.data.document).split(";");
    var layout_transform = transforms.pop();
    var xsl = (xdom.library[layout_transform].document || xdom.library[layout_transform]);

    //var root_node = xsl.documentElement.selectSingleNode('//xsl:key[@name="groupBy"][@match="/"]');
    //if (!root_node) {
    //    console.error((xdom.messages["datagrid.columns.groupBy.error"] || "Error: datagrid.columns.groupBy"));
    //    return false;
    //}
    if (column_name) {
        var key_node = xsl.documentElement.selectSingleNode('//xsl:key[@name="groupBy"][@use="concat(name(..),\'::\',.)"][@match="' + column_name + '/@x:value"]');
        if (!key_node) {
            var new_key = xdom.xml.createDocument('<xsl:key xmlns:xsl="http://www.w3.org/1999/XSL/Transform" name="groupBy" match="' + column_name + '/@x:value" use="concat(name(..),\'::\',.)"/>');
            //xdom.dom.insertAfter(new_key.documentElement, root_node);
            xsl.selectSingleNode('*').appendChild(new_key.documentElement);
        } else {
            xdom.data.remove(key_node);
        }
    }

    xdom.dom.refresh();
}

xdom.datagrid.columns.groupCollapse = function (column_name, value) {
    var transforms = xdom.data.getTransformationFileName(xdom.data.document).split(";");
    var layout_transform = transforms.pop();
    var xsl = (xdom.library[layout_transform].document || xdom.library[layout_transform]);

    //var root_node = xsl.documentElement.selectSingleNode('//xsl:key[@name="groupBy"][@match="/"]');
    //if (!root_node) {
    //    console.error((xdom.messages["datagrid.columns.groupCollapse.error"] || "Error: datagrid.columns.groupCollapse"));
    //    return false;
    //}
    value = value.replace(/</g, '&lt;');
    if (column_name) {
        var key_node = xsl.documentElement.selectSingleNode('//xsl:key[@name="groupCollapse"][@use="concat(name(..),\'::\',.)"][@match="' + column_name + '/@x:value[.=\'' + value + '\']"]');
        if (!key_node) {
            var new_key = xdom.xml.createDocument('<xsl:key xmlns:xsl="http://www.w3.org/1999/XSL/Transform" name="groupCollapse" match="' + column_name + '/@x:value[.=\'' + value + '\']" use="concat(name(..),\'::\',.)"/>');
            //xdom.dom.insertAfter(new_key.documentElement, root_node);
            xsl.selectSingleNode('*').appendChild(new_key.documentElement);
        } else {
            xdom.data.remove(key_node);
        }
    }

    xdom.dom.refresh();
}

xdom.data.filterBy = function (settings) {//filter_by, value, attribute, exclusive
    var coalesce = xdom.data.coalesce;
    var settings = (settings || {});
    //if (arguments.length > 0 && !(arguments.length == 1 && arguments[0].constructor === {}.constructor)) {
    //    var new_settings = {}
    //    new_settings["filter_by"] = arguments[0]
    //    new_settings["value"] = arguments[1]
    //    new_settings["attribute"] = arguments[2]
    //    new_settings["exclusive"] = arguments[3]
    //    new_settings["row_path"] = arguments[4]
    //    xdom.data.filterBy(new_settings);
    //    if (((arguments || {}).callee || {}).caller != xdom.data.filterBy) {
    //        xdom.dom.refresh();
    //    }
    //    return;
    //}
    var filter_by = arguments[0];//settings["filter_by"]
    if (filter_by && filter_by.constructor == [].constructor) {
        if (filter_by.length == 1) {
            filter_by = filter_by[0];
        } else {
            for (var a = filter_by.length - 1; a >= 0; --a) {
                xdom.data.filterBy(filter_by.pop())
            }
            if (((arguments || {}).callee || {}).caller != xdom.data.filterBy) {
                xdom.dom.refresh();
            }
            return;
        }
    }
    var xsl = xdom.data.document.library[Object.values(xdom.data.document.getStylesheets().filter(el => el.role != 'init' && el.role != 'binding')).pop().href];
    var filter_node = xsl.documentElement.selectSingleNode('//xsl:key[@name="filterBy"][starts-with(@match,"*")]');
    var row_path
    if (filter_node) {
        row_path = (settings["row_path"] || filter_node.getAttribute("match").match(/^[^\[]+/)[0])
    }
    row_path = (row_path || '*');

    var filters = {};
    if (filter_by) {
        var exclusive = (arguments[1] || {}).exclusive;
        var full_path = filter_by["match"].split(/\//ig)
        //var attribute = full_path.pop();
        var root_node = full_path.join('/');//full_path.pop()

        let { use, match, attribute = "@x:value", value } = filter_by;
        var exclusive = coalesce(exclusive, false);

        if (exclusive) {
            let alt_filter_by = filter_by.cloneObject();
            delete alt_filter_by["value"];
            xdom.data.clearFilterOption(alt_filter_by);
        }
        let query;
        let value_definition
        if (value !== undefined) {
            use = (use || 'generate-id(self::*)');
            query = `//xsl:key[@name="filterBy"][@use="${use}"][@match="${match}/${attribute}[.=&apos;${value}&apos;]"]`
        } else {
            query = `//xsl:key[@name="filterBy"][@use="${use}"][@match="${match}/${attribute}[.=.]"]`
        }
        var filter_column = xsl.documentElement.selectSingleNode(query);
        if (!filter_column) {
            let new_key;
            if (value !== undefined) {
                new_key = xdom.xml.createDocument(`<xsl:key xmlns:xsl="http://www.w3.org/1999/XSL/Transform" name="filterBy" match="${match}/${attribute}[.=&apos;${value}&apos;]" use="${use}"/>`)
            } else {
                new_key = xdom.xml.createDocument(`<xsl:key xmlns:xsl="http://www.w3.org/1999/XSL/Transform" name="filterBy" match="${match}/${attribute}[.=.]" use="${use}"/>`)
            }
            filter_column = xsl.selectSingleNode('*').appendChild(new_key.documentElement);
        }
    }

    var filter_keys = xsl.selectNodes(`//xsl:key[@name="filterBy"][contains(@use,"::',generate-id(parent::*") or contains(@use,"::") and starts-with(@use,"'")]`);
    for (var field of filter_keys) {
        let parts = field.getAttribute("match").match(/(.*)\/([^\/]+)\/([^\/]+)\[\.=?(.*)\]$/i)
        let row_path, field_name, attr, condition_value
        if (parts) {
            [, row_path, field_name, attr, condition_value = undefined] = field.getAttribute("match").match(/(.*)\/([^\/]+)\/([^\/]+)\[\.=?(.*)\]$/i)
        } else {
            row_path = field.getAttribute("match")
        }
        condition_value = (condition_value && condition_value !== '.' && condition_value || undefined);
        filters[row_path] = (filters[row_path] || {})
        if (!field_name) {
            continue
        }
        filters[row_path][field_name] = (filters[row_path][field_name] || {})

        if (field_name == '*') {
            attr = "self::*";
        }
        if (attr) {//field.getAttribute("use") == "name()") {
            filters[row_path][field_name][attr] = (filters[row_path][field_name][attr] || []);
        }
        if (!condition_value) {//field.getAttribute("use") != "generate-id()") {
            continue;
        }
        var filter_column = xsl.selectSingleNode(`//xsl:key[@name="filterBy"][@match="${row_path}/${field_name}/${attr}[.=.]"]`)
        if (!filter_column) {
            delete field;
            continue;
        }
        filters[row_path][field_name][attr] = (filters[row_path][field_name][attr] || []);
        filters[row_path][field_name][attr].push(condition_value);//field_condition.substr(field_condition.indexOf('=') + 1));
    }

    var other_filters_nodes = xsl.documentElement.selectNodes('//xsl:key[starts-with(@name,"other_filters_")]');
    xdom.data.remove(other_filters_nodes);
    for (var row in filters) {
        for (var key in filters[row]) {
            for (var attr in filters[row][key]) {
                var other_filters = filters.cloneObject();
                delete other_filters[row][key][attr];
                var other_filters_definition = xdom.data.filter.createFilters(other_filters[row]);
                //var new_key = xdom.xml.createDocument('<xsl:key xmlns:xsl="http://www.w3.org/1999/XSL/Transform" name="other_filters_' + (key + '/' + attr).replace(/[^\d\sa-zA-Z\u00C0-\u017F]/ig, '_') + '" match="' + row_path + (other_filters_definition.length ? "[" + other_filters_definition + "]" : "") + '" use="generate-id(' + (key == '*' ? '/*' : '') + ')"/>');
                let new_key = xdom.xml.createDocument(`<xsl:key xmlns:xsl="http://www.w3.org/1999/XSL/Transform" name="other_filters_${(row + '/' + key + '/' + attr).replace(/[^\d\sa-zA-Z\u00C0-\u017F]/ig, '_')}" match="${(other_filters_definition.length ? row + '[' + other_filters_definition + ']' : "*")}" use="generate-id(${(key == '*' ? '/*' : '')})"/>`);
                xsl.selectSingleNode('*').appendChild(new_key.documentElement);
            }
        }
    }

    for (var row_path in filters) {
        var new_filters = xdom.data.filter.createFilters(filters[row_path]);
        if (!filter_node) {
            var new_key = xdom.xml.createDocument('<xsl:key xmlns:xsl="http://www.w3.org/1999/XSL/Transform" name="other_filters_' + (key + '/' + attribute).replace(/[^\d\sa-zA-Z\u00C0-\u017F]/ig, '_') + '" match="' + row_path + (new_filters.length ? "[" + new_filters + "]" : "") + '" use="generate-id(' + (key == '*' ? '/*' : '') + ')"/>'); //revisar si está bien esta nodo, porque se crea con other_fields si no existe el nodo de filtros
            xsl.selectSingleNode('*').appendChild(new_key.documentElement);
        } else {
            filter_node.setAttribute("match", row_path + (new_filters.length ? "[" + new_filters + "]" : ""));
        }
    }
    if (((arguments || {}).callee || {}).caller != xdom.data.filterBy) {
        xdom.dom.refresh();
    }
}

xdom.data.filter.createFilters = function (filters) {
    var filter_definition = xdom.json.join(filters, {
        separator: " and "
        , for_each: function (element, index, array) {
            if (!(element.value && Object.keys(element.value).length)) {
                array[index] = undefined;
            } else {
                var field = element.key
                var value_definition = xdom.json.join(element.value, {
                    separator: " and "
                    , for_each: function (_element, _index, _array) {
                        if (!_element.value.length) {
                            _array[_index] = undefined;
                        } else {
                            var values = []
                            for (var e = 0; e < _element.value.length; ++e) {
                                values.push(_element.key + ' = ' + _element.value[e])
                            }
                            _array[_index] = field + "[" + values.join(" or ") + "]";
                        }
                    }
                });
                if (value_definition != '') {
                    array[index] = value_definition;
                } else {
                    array[index] = undefined;
                }
            }
        }
    });
    return filter_definition;
}

xdom.data.clearFilter = function (filter_by) {
    var filter_node;
    var xsl = xdom.data.document.library[Object.values(xdom.data.document.getStylesheets().filter(el => el.role != 'init' && el.role != 'binding')).pop().href];
    if (filter_by === undefined) {
        filter_node = xsl.documentElement.selectNodes('//xsl:key[@name="filterBy"][not(starts-with(@match,"*"))]');
    } else {
        filter_node = xsl.documentElement.selectNodes(`//xsl:key[@name="filterBy"][@use="'${filter_by}'" or @use="local-name()"]`);
    }
    xdom.data.remove(filter_node)
    xdom.data.filterBy();
}

xdom.data.clearFilterOption = function (filter_by) {
    var xsl = xdom.data.document.library[Object.values(xdom.data.document.getStylesheets().filter(el => el.role != 'init' && el.role != 'binding')).pop().href];
    let { use = 'concat(generate-id(parent::*)~', match, attribute, value } = filter_by;
    let value_definition = '', attribute_definition = ''
    if (value !== undefined) {
        value_definition = `='${value}']`
    }
    if (attribute) {
        attribute_definition = `/${attribute}[.${value_definition}`
    }
    let filter_column;
    filter_column = xsl.documentElement.selectNodes(`//xsl:key[@name="filterBy"][contains(@use,"::',generate-id(parent::*")][starts-with(@match,"${match}${attribute_definition}")]`);
    xdom.data.remove(filter_column)
    if (((arguments || {}).callee || {}).caller != xdom.data.filterBy) {
        xdom.data.filterBy();
    }
    return;
    //var attribute = (attribute || "@x:value");
    //var filter_definition = "";
    //var filter_nodes;
    //var full_path = filter_by.split(/\//ig)
    //var root_node = full_path.shift();
    //var attribute = full_path.join('/');//full_path.pop()
    //if (value !== undefined) {
    //    //filter_definition = '[@match="' + root_node + "[@x:value='" + Encoder.HTML2Numerical(Encoder.htmlEncode(value) + "']\"]";
    //    filter_definition = '[@match="' + root_node + "[" + attribute + "='" + value + "']\"]";
    //}
    //var transforms = xdom.data.getTransformationFileName(xdom.data.document).split(";");
    //var layout_transform = transforms.pop();
    //var xsl = xdom.data.document.library[Object.values(xdom.data.document.getStylesheets().filter(el => el.role != 'init' && el.role != 'binding')).pop().href];
    //filter_nodes = xsl.documentElement.selectNodes('//xsl:key[@name="filterBy"][contains(concat("^",@match,"["),"^' + root_node + '[")]' + filter_definition);
    //xdom.data.remove(filter_nodes)
    //if (((arguments || {}).callee || {}).caller != xdom.data.filterBy) {
    //    xdom.data.filterBy();
    //}
}

xdom.data.clear = function (filter_by) {
    xdom.data.document = null;
    xdom.data.binding.sources = {};
    xdom.session.setData(null);
    xdom.dom.refresh();
}

xdom.data.sortBy = function (sort_by, is_number, sort_order) {
    var sort_order = (sort_order || 'ascending')
    var start_date = new Date();
    var xsl_transform = xdom.xml.createDocument('\
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:x="http://panax.io/xdom">                 \
  <xsl:output method="xml" indent="no"/>                                                        \
  <xsl:template match="@* | node()">                                                            \
      <xsl:copy>                                                                                \
          <xsl:apply-templates select="@* | node()"/>                                           \
      </xsl:copy>                                                                               \
  </xsl:template>                                                                               \
  <xsl:template match="/*">                                                                     \
    <xsl:copy>                                                                                  \
      <xsl:copy-of select="@*"/>                                                                \
      <xsl:attribute name="sortBy">' + sort_by + '</xsl:attribute>                              \
      <xsl:attribute name="sortOrder">' + sort_order + '</xsl:attribute>                        \
        <xsl:apply-templates select="*">                                                        \
          <xsl:sort select="*[@ref=\'' + sort_by + '\']/@x:value" order="' + sort_order + '" data-type="' + (is_number ? 'number' : 'text') + '"/>\
          <xsl:sort select="*[local-name()=\'' + sort_by + '\']/@x:value" order="' + sort_order + '" data-type="' + (is_number ? 'number' : 'text') + '"/>\
        </xsl:apply-templates>                                                                   \
    </xsl:copy>                                                                                 \
  </xsl:template>                                                                               \
</xsl:stylesheet>                                                                               \
', 'text/xml');
    xdom.data.document = xdom.xml.transform(xdom.data.document, xsl_transform);
    if (xdom.debug["xdom.data.sortBy"]) {
        console.log("@sort#Transformation Time: " + (new Date().getTime() - start_date.getTime()));
    }
    var e = event;
    if (typeof e.stopPropagation != "undefined") {
        e.stopPropagation();
    } else if (typeof e.cancelBubble != "undefined") {
        e.cancelBubble = true;
    }
    xdom.dom.refresh();
}

xdom.data.getValue = function (element) {
    if (!element || !(element instanceof HTMLElement)) return undefined;
    var element_value = '';
    if ((typeof element) == 'object') {
        /*if ($(element).is('.texto, .text')) {
            element_value = trimAll(element.value !== undefined ? element.value : (element.innerText !== undefined ? element.innerText : element));
            return element_value;
        }
        else */if (element.length && element[0].nodeName.toLowerCase() == 'input' && (element[0].type == "radio" || element[0].type == "checkbox")) {
            for (s = 0; s < element.length; ++s) {
                element_value += (element(s).checked ? (element_value != '' ? ',' : '') + (element(s).value) : '')
            }
        }
        else if (element.options && element.nodeName.toLowerCase() == 'select') {
            for (s = 0; s < element.options.length; ++s) {
                element_value += (element.options[s].selected ? (element_value != '' ? ', ' : '') + (element.className == 'catalog' && (element.value.toUpperCase() == 'TODOS' || element.value.toUpperCase() == 'TODAS') ? 'all' : element.options[s].value) : '')
            }
        }
        else if (element.length) {
            return element
        }
        else if (element.nodeName.toLowerCase() == 'input' && element.type == "checkbox" && element.id != 'identifier') {
            element_value = (element.checked || element.DefaultIfUnchecked && eval(element.DefaultIfUnchecked)) ? element.value : '';
        }
        else if (element.nodeName.toLowerCase() == 'div') {
            element_value = element.innerHTML;
        }
        else {
            element_value = xdom.string.trim(element.value !== undefined ? element.value : (element.innerText !== undefined ? element.innerText : element));
        }
    }
    else {
        element_value = element;
    }
    if (element.className && element.className.match(/\bmoney\b/gi)) {
        element_value = element_value.replace(/[^\d\.-]/gi, '');
    }
    //if (isDateType(element_value)) element_value = fillDate(element_value);
    //if (isNumericOrMoney(element_value) || element_value.isPercent()) element_value = unformat_currency(element_value);
    //if (isNumber(element_value) && !esVacio(element_value)) element_value = parseFloat(element_value)

    return element_value;
}


//xdom.data.Request = function () {
//    if (!(this instanceof xdom.data.Request)) return new xdom.data.Request.apply(this, arguments);


//}

xdom.data.binding.updateSources = function () {
    return
    for (var request in xdom.data.binding.requests) {
        for (var command in xdom.data.binding.requests[request]) {
            var xhr = xdom.data.binding.requests[request][command];
            if (xhr && xhr.get) {
                xhr.get();
            }
        }
    }
}

xdom.data.binding.handleRequest = function (settings) {
    var target = settings.xhr.target;
    var target_attribute = settings["target_attribute"];
    var src = settings.xhr.src;
    var request = settings["request"]; delete settings["request"];
    var on_complete = settings["on_complete"]; delete settings["on_complete"];
    var from_cache = xdom.data.coalesce(settings["from_cache"], true); delete settings["from_cache"];
    var cache_results = xdom.data.coalesce(settings["cache_results"], true); delete settings["cache_results"];
    var xml_document;
    var result;

    var on_success = function (Response, Request) {
        var target = xdom.data.find((Request.requester || {}).ownerElement)
        if (!(target)) {
            return;
        }
        var src = target.selectSingleNode('@' + Request.requester.name);
        if (!(src && Request.request_id.split('::', 2)[1] == target.getAttribute('source:' + Request.requester.localName).replace(/^\w+\:/, ''))) {
            return;
        }
        switch (Response.type) {
            case "xml":
                var attribute_name = src.name.split(':', 2);
                var attr = attribute_name.pop();
                var prefix = attribute_name.pop();
                var new_prefix = 'source';
                var new_attribute_name = new_prefix + ':' + attr;
                xml_document = Response.document.selectSingleNode("./" + src.name);
                if (!xml_document) {
                    var xsl = xdom.xml.createDocument('\
                        <xsl:stylesheet version="1.0" \
                             xmlns:xsl="http://www.w3.org/1999/XSL/Transform"'+ ((new_prefix ? ' xmlns:' + new_prefix + '="' + xdom.xml.namespaces[new_prefix] + '"' : '')) + '>                     \
                              <xsl:output method="xml" indent="no"/>\
                            <xsl:template match="/*">              \
                                <xsl:element name="' + new_attribute_name + '">  \
                                <xsl:copy-of select="@*" />                     \
                                <xsl:attribute name="command">'+ target.getAttribute('source:' + Request.requester.localName).replace(/^\w+\:/, '').replace(/&/gi, '&amp;') + '</xsl:attribute>                     \
                                <xsl:copy-of select="*|text()" />                     \
                          </xsl:element></xsl:template>                                      \
                        </xsl:stylesheet>');
                    xml_document = xdom.xml.transform(Response.document, xsl);

                    //var children = Response.document.selectNodes("//x:response[1]/*");
                    //if (children) {
                    //    var attribute = src.name.split(':', 2);
                    //    var attr = attribute.pop();
                    //    var prefix = attribute.pop();
                    //    var attribute_node = xdom.xml.createDocument('<' + src.name + ((prefix ? ' xmlns:' + prefix + '="' + xdom.xml.namespaces[prefix] + '"' : '')) + '/>');
                    //    for (var x = 0; x < children.length; x++) {
                    //        attribute_node.documentElement.appendChild(children[x]);
                    //    }
                    //    xml_document = xdom.xml.createDocument(attribute_node);
                    //    if (xml_document.documentElement) {
                    //        xml_document.documentElement.setAttribute("command", request);
                    //    }
                    //} else {
                    //    xml_document = Response.document;
                    //}
                } else {
                    xml_document = xdom.xml.createDocument(xml_document);
                }
                //if (xml_document.selectSingleNode("./" + new_attribute_name) && xml_document.documentElement) {
                //    xml_document.documentElement.setAttribute("command", request);
                //}

                //if (xml_document) {
                //    if (cache_results) {
                //        xdom.cache[request] = xml_document;
                //    }
                //}
                //Request.unsubscribe(src)
                //xdom.data.remove(src);
                xdom.data.update({ "uid": target.getAttribute('x:id'), "attribute": new_attribute_name, "value": xml_document, "cascade": true, "action": "replace", "refresh": true });

                result = xml_document;
                if (xdom.debug["xdom.data.binding"]) {
                    console.log("\tCompleted: (" + request + ')');
                }
                break;
            case "json":
            case "script":
                var object = Response.value;
                if (object && object.recordSet) {
                    value = object.recordSet[0].Result;
                    var namespaces = xdom.xml.createNamespaceDeclaration(xdom.data.document);
                    var node = xdom.xml.createDocument('<' + src.name + ' ' + namespaces + ' for="' + request + '">' + String(value) + '</' + src.name + '>');

                    //if (cache_results) {
                    //    xdom.cache[request] = node;
                    //}
                    xdom.data.update(target.getAttribute("x:id"), src.name, node);
                    if (xdom.debug["xdom.data.binding.handleRequest"]) {
                        console.log("\tCompleted: (" + request + ') = ' + value);
                    }
                }
                break;
            default:
                console.log(Response.document)
        }

        //if (Response.status == 200 && Response.json) {
        //    if (Response.json.status) {
        //        if (Response.json.status == 'unauthorized') {
        //            console.error(Response.json.message || xdom.messages.unauthorized || "Unauthorized user")
        //            xdom.data.update(xdom.data.document.selectSingleNode("/*[1]").getAttribute("x:id"), '@session:user_id', null);
        //        } else if (Response.json.recordSet) {
        //            value = Response.json.recordSet[0].Result;
        //            var namespaces = xdom.xml.createNamespaceDeclaration(xdom.data.document);
        //            var node = xdom.xml.createDocument('<' + target_attribute + ' ' + namespaces + ' for="' + request + '">' + String(value) + '</' + target_attribute + '>');

        //            if (cache_results) {
        //                xdom.cache[request] = node;
        //            }
        //            xdom.data.update(target.getAttribute("x:id"), target_attribute, node);
        //            if (xdom.debug) {
        //                console.log("\tCompleted: (" + request + ') = ' + value);
        //            }
        //        }
        //    }
        //} else if (Response.xml !== undefined) {
        //    xml_document = Response.xml;
        //    xml_document.documentElement.setAttribute("command", request)
        //    if (xml_document) {
        //        if (cache_results) {
        //            xdom.cache[request] = xml_document;
        //        }
        //    }
        //    xdom.data.update({ "uid": target.getAttribute('x:id'), "attribute": target_attribute, "value": xml_document, "cascade": true, "action": "replace" });
        //    result = xml_document;
        //    console.log("\tCompleted: (" + request + ')');
        //}
        if (on_complete && on_complete.apply) {
            on_complete.apply(this, arguments);
        };
    }
    result = xdom.server.request(xdom.json.merge({
        "request": request.replace(/^\w+:/, '')
        , "src": src
        , "exec": false
        , "xhr": {
            "async": true
        }
        , "onSuccess": function (Response, Request) {
            on_success.apply(this.requester, arguments)
        }
    }, settings));
    return result;
}

xdom.data.update = function (target, attribute, value, refreshDOM, action, on_success, srcElement) {
    var srcElement = ((event || {}).srcElement || (xdom.data.update.caller && xdom.data.update.caller.hasOwnProperty('arguments') ? xdom.data.update.caller.arguments[0] : {}).srcElement);
    if (srcElement && srcElement.classList) {
        srcElement.classList.add("working");
    }
    if ([].constructor == (attribute || '').constructor) {
        attribute.map(attr => {
            xdom.data.update(target, attr, undefined, refreshDOM, action, on_success, srcElement);
        })
    } else if ((target || '').constructor === [].constructor) {
        target.map(el => xdom.data.update(el));
    } else if ((target || '').constructor === {}.constructor || typeof (target) === 'object' && typeof (target.selectSingleNode) == 'undefined') {
        if (target["target"] || (target["attributes"] || '').constructor == [].constructor) {
            var { target, attributes, value, refreshDOM, action } = target;
            xdom.data.update(target, attributes, value, refreshDOM, action, on_success, srcElement);
        } else if (srcElement) {
            real_target = target["target"] || ((xdom.dom.findClosestElementWithId(srcElement) || srcElement).id);
            Object.entries(target).map(([key, value]) => {
                xdom.data.update(real_target, key, value, refreshDOM, action, on_success, srcElement);
            })
        }
        else {
            throw 'Invalid target'
        }
    } else {
        target = (!target && (srcElement || {}).sourceNode || (target.ownerDocument || {}).store && target || (srcElement || {}).store && (srcElement || {}).store.find(target) || xdom.data.stores.find(target));
        attribute = xdom.data.coalesce(attribute, "@x:value");
        value = xdom.data.coalesce(value, (value === undefined && attribute == '@x:value' ? xdom.data.getValue(srcElement) : undefined));
        let targets = target; //xdom.data.stores.find(target);
        if ({}.constructor == attribute.constructor) {
            Object.entries(attribute).forEach(([attrib, value]) => {
                xdom.data.update(target, attrib, value, refreshDOM, action, on_success, srcElement);
            });
        } else if (attribute.match(/^@/)) {
            targets.setAttribute(attribute.replace(/^@/, ''), value, refreshDOM).then(() => {
                //console.log('Ready xdom.data.update');
                (srcElement instanceof Element && srcElement || document.createElement('p')).classList.remove("working");
            });
        } else if (attribute == 'text()') {
            targets.textContent(attribute, value);
        } else if (attribute == 'after()') {
            targets.appendAfter(attribute, value);
        } else if (attribute == 'before()') {
            targets.appendBefore(attribute, value);
        } else if (attribute == 'node()') {
            targets.insertBefore(attribute, value);
        } else {
            throw 'Invalid command'
        }
        //targets.map(([ref, master_document]) => {
        //    var master_document = master_document;
        //    xdom.data.updateNode(ref, attribute, value, refreshDOM, action, (srcElement instanceof HTMLElement ? srcElement : undefined), xdom.data.update.caller).then(refresh => {
        //        //if (refresh) {
        //        //    if (master_document === xdom.dom.shell) {

        //        //    //}
        //        //    //if (!xdom.data.document.find(target)) {
        //        //    //    document .render().then(() => {
        //        //    //        xdom.data.document.render();
        //        //    //    });
        //        //    //} else {
        //        //        master_document.render();
        //        //    }
        //        //}
        //        if (srcElement && srcElement.classList) {
        //            srcElement.classList.remove("working");
        //        }
        //    });
        //})
        //xdom.dom.shell.render(true);
        //xdom.dom.refresh(true);
        //});
    }
}

xdom.data.updateNode = async function (target, attribute, value, refreshDOM, action, srcElement, caller) {
    srcElement = (srcElement || event && event.srcElement);
    xdom.dom.saveState(srcElement);
    target = xdom.data.deepFind(target);
    if (!target) {
        console.error('Target may have changed');
    }
    var trigger_node = (srcElement || {}).id && xdom.data.deepFind(srcElement.id);
    value = xdom.data.coalesce(value, (attribute == '@x:value' ? xdom.data.getValue(srcElement) : undefined));
    if ((attribute || '').constructor == [].constructor) {
        attributes = attribute;
    } else {
        attributes = [];
        attributes.push(new Object().push(attribute, value));
    }
    var changed = undefined;
    for (var item = 0; item < attributes.length; ++item) {
        var attribute = Object.keys(attributes[item]).join("");
        var value = attributes[item][attribute];
        if (xdom.debug["xdom.data.update"]) {
            console.log("uid: " + uid)
            console.log("\tAttribute: " + attribute)
            console.log("\tValue: " + value)
        }
        if (attribute == '@x:value' || attribute == '@x:deleting' || attribute == '@x:checked') {
            if (caller && (caller.name || "").match(/onchange|onblur|onpropertychange/)) {
                xdom.data.history.undo.push(xdom.xml.createDocument(xdom.data.document));
                xdom.data.history.redo = [];
            }
        }
        var regex = new RegExp(xdom.string.trim(attribute) + '\\b', 'g');
        if (typeof (((target || {}).ownerDocument || {}).setProperty) != "undefined") {
            var current_namespaces = xdom.xml.getNamespaces(target.ownerDocument.getProperty("SelectionNamespaces"));
            if (!current_namespaces["x"]) {
                current_namespaces["x"] = "http://panax.io/xdom";
                target.ownerDocument.setProperty("SelectionNamespaces", xdom.json.join(current_namespaces, { "separator": " " }));
            }
        }
        //if (target.selectSingleNode('self::x:*') || target.getAttribute("x:readonly") == 'true()' || target.getAttribute("x:readonly") != 'false()' && ((target.getAttribute("x:readonly") || '').match(regex))) {
        //    //if (xdom.debug) {
        //        console.warn('Attribute ' + attribute + ' in ' + target.nodeName + ' can\'t be modified.')
        //    //}
        //    return false;
        //}
        var prefix = attribute.match(/^(@?)([^:]+)/).pop();
        /*Se quita esta sección porque ya se hace la validación del namespace en el setAttribute*//*
        if (xdom.xml.namespaces[prefix] && !xdom.xml.lookupNamespaceURI(target.ownerDocument.documentElement, xdom.xml.namespaces[prefix])) {
            target.ownerDocument.documentElement.setAttribute("xmlns:" + prefix, xdom.xml.namespaces[prefix]);
            if (typeof (target.ownerDocument.setProperty) != "undefined") {
                var xml_namespaces = xdom.xml.transform(target.ownerDocument, xdom.library["xdom/resources/normalize_namespaces.xslt"]);
                target.ownerDocument.setProperty("SelectionNamespaces", xdom.xml.createNamespaceDeclaration(xml_namespaces));
            }
        }*/

        if (attribute == 'data()') {
            if (value) {
                if (action == 'append') {
                    target.appendChild(value.documentElement);
                } else {
                    target.innerHTML = value.documentElement.outerHTML;
                }
            }
            refreshDOM = true;
        } else if (attribute == 'text()') {
            if (String(value).match(/^=/g).length > 0) {
                target.setAttribute('formula', value, false);
            }
            target.innerHTML = value;
            refreshDOM = true;
        } else if (attribute.match("^@")) {
            if (value && target.getAttribute('x:format') == 'money') {
                value = value.replace(/[^\d\.-]/gi, '');
            }
            var attribute_ref = (target.selectSingleNode(attribute) || {});
            if (attribute_ref.value == null || attribute_ref.value != (value || String(value)) || value && !String(value).match("{{") && attribute.match("^@(source):") && (!(target.selectSingleNode(attribute.replace(/^@/, ""))))) {
                if (xdom.xml.namespaces[prefix] == "http://panax.io/xdom") {
                    var attribute_base_name = attribute.match(/^(@?)([^:]+):?(.*)/).pop();
                    if (!target.selectNodes("@initial:" + attribute_base_name).length) {
                        target.setAttribute("initial:" + attribute_base_name, (target.getAttribute("initial:" + attribute_base_name) || attribute_ref.value || (attribute_base_name == 'checked' ? 'false' : '')), false);
                    }
                    //if (!target.selectNodes("@prev:" + attribute_base_name).length) {
                    //    target.setAttribute("prev:" + attribute_base_name, (attribute_ref.value || (attribute_base_name == 'checked' ? 'false' : '')));
                    //}
                }
                target.setAttribute(attribute.substring(1), (value || String(value)), false);//(value || "") //(value || "null"));
                changed = true;

                if (attribute.match("^@(source):")) {
                    //TODO: Revisar si este código aún tiene efecto o si se cubre con el binding
                    //if ((value || '').match("{{")) {
                    //    value = "";
                    //} else {
                    //    var request = value.replace(/^\w+:/, '');
                    //    value = xdom.data.binding.handleRequest({
                    //        "request": request
                    //        , "target_attribute": attribute.replace(/^@/, "")
                    //        , "xhr": {
                    //            "async": true
                    //            , "target": target
                    //            , "type": (attribute.match("^@source:") ? "table" : "scalar")
                    //        }
                    //    });
                    //}
                    //attributes.push(new Object().push(attribute.replace(/^@/, ""), value));
                } else if (attribute == ("@x:value") && attributes.find(element => element["@x:text"]) === undefined) {
                    var catalog = target.selectSingleNode(attribute.replace(/^@\w+:/, 'source:'));
                    if (catalog) {
                        attributes.push(new Object().push("@x:text", (catalog.selectSingleNode('*[normalize-space(' + attribute + ')="' + String(value).replace(/"/, '\\"') + '"]/@x:text') || {}).value || ""));
                    } else if (trigger_node && trigger_node.selectSingleNode('self::x:r')) {
                        attributes.push(new Object().push("@x:text", (trigger_node.getAttribute((trigger_node.getAttribute("x:text_field") || '').substring(1) || 'x:text') || (value || "") || "")));
                    }
                } else if (attribute == ("@x:text") && attributes.find(element => element["@x:value"]) === undefined) {
                    var catalog = target.selectSingleNode(attribute.replace(/^@\w+:/, 'source:'));
                    if (catalog) {
                        attributes.push(new Object().push("@x:value", (catalog.selectSingleNode('*[normalize-space(' + attribute + ')="' + String(value).replace(/"/, '\\"') + '"]/@x:value') || {}).value || ""));
                    } else if (trigger_node && trigger_node.selectSingleNode('self::x:r')) {
                        attributes.push(new Object().push("@x:value", (trigger_node.getAttribute((trigger_node.getAttribute("x:value_field") || '').substring(1) || 'x:value') || (value || "") || "")));
                    }
                }
                refreshDOM = refreshDOM !== undefined ? refreshDOM : undefined;
            }
        } else {
            if (action == 'append') {
                xdom.dom.insertAfter(value);
            } else {
                //if (target.selectSingleNode('@' + attribute)) {
                //    var node_exists = xdom.data.remove(target.selectSingleNode(attribute));
                //}
                if (!value && (typeof (value) != "boolean")) {
                    var node_exists = xdom.data.remove(target.selectSingleNode(attribute));
                }
                if (value != undefined && value !== '' && typeof (value.selectSingleNode) == 'undefined') {
                    var node = target.selectSingleNode(attribute);
                    if (!node) {
                        var namespaces = xdom.xml.createNamespaceDeclaration(xdom.data.document)
                        node = xdom.xml.createDocument("<" + attribute + " " + namespaces + ">" + String(value) + "</" + attribute + ">");
                    }
                    value = node;
                }
                if (value && value.documentElement) {
                    //var attrs = value.documentElement.selectNodes('@*');
                    //for (var attr in attrs) {
                    //    attrs[attr] 
                    //}
                    //xdom.data.remove(target.selectSingleNode(value.selectSingleNode("//*[1]").nodeName));
                    var for_value = value.documentElement.getAttribute("command");
                    var node_name = value.documentElement.nodeName;
                    var node = target.selectSingleNode(node_name + '[@command="' + for_value + '"]')
                    if (for_value && node) {
                        node.parentNode.replaceChild(value.documentElement, node);
                    } else {
                        xdom.dom.appendChild(target, value);
                    }
                    var source_transform = target.selectSingleNode("ancestor-or-self::*[@transforms:sources]/@transforms:sources");
                    if (source_transform && source_transform.value) {
                        await xdom.data.applyTransforms(target, [source_transform.value]);
                        target = xdom.data.document.selectSingleNode('//*[@x:id="' + uid + '"]');
                    }
                }
            }
            changed = true;
            if (attribute.match("^source:")) {
                var target_attribute = attribute.replace(/^source:/, "@x:");
                var source_record = null;
                var target_value = (src.getAttribute("x:value") || src.getAttribute("initial:value"))
                if (String(parseFloat(target_value)) != 'NaN') {
                    source_record = src.selectSingleNode(attribute + '/*[number(' + target_attribute + ')="' + parseFloat(target_value) + '"]/' + target_attribute)
                } else {
                    source_record = (src.selectSingleNode(attribute + '/*[' + target_attribute + '="' + target_value + '"]/' + target_attribute) || new xdom.data.EmptyXML());
                }
                if (source_record) {
                    attributes.push(new Object().push(target_attribute, (source_record.value || "")));
                    attributes.push(new Object().push("@x:text", (source_record.selectSingleNode("../@x:text").value || "")));
                }
            }
            refreshDOM = refreshDOM !== undefined ? refreshDOM : undefined;
        }
    }
    return !!changed;
}

xdom.data.asyncUpdate = async function (target, attribute, value, refreshDOM, action, cascade, event, caller) {
    xdom.dom.saveState();
    var srcElement = ((event || {}).srcElement || (caller && caller.hasOwnProperty('arguments') ? caller.arguments[0] : {}).srcElement);
    srcElement = ((event || {}).srcElement);
    var xdom_global_refresh_disabled = srcElement && srcElement.ownerDocument ? srcElement.ownerDocument.xdom_global_refresh_disabled : false;
    var xdom_global_refresh_enabled = (typeof (xdom_global_refresh_disabled) != "undefined" ? !xdom_global_refresh_disabled : undefined);
    if (xdom_global_refresh_enabled) xdom_global_refresh_enabled = undefined;
    var trigger = (event && caller != xdom.data.cascade ? event.srcElement : undefined);
    var settings = {}
    if (refreshDOM !== undefined) {
        settings["refresh"] = refreshDOM;
    }

    if (arguments.length == 0) {
        refreshDOM = true;
    } else if (arguments[0] && arguments[0].constructor === {}.constructor) {
        settings = xdom.json.merge(settings, arguments[0]);
        target = settings["target"];
        if (!settings.hasOwnProperty("target") && !settings.hasOwnProperty("attributes") && !settings.hasOwnProperty("uid") && !settings.hasOwnProperty("refresh")) {
            var attributes = settings;
            settings = {};
            settings["attributes"] = [attributes];
        }
    } else if (arguments.length == 1 && typeof (arguments[0]) == 'boolean') {
        refreshDOM = arguments[0];
        target = undefined;
    }

    if (value && typeof (value) == 'object' && !value.documentElement) { return false; }

    var uid = xdom.data.coalesce(settings["uid"], typeof (target) == "string" ? target : undefined);
    var attribute = xdom.data.coalesce(settings["attribute"], attribute, '@x:value');
    var value = settings.hasOwnProperty("value") ? settings["value"] : xdom.data.coalesce(value, (attribute == '@x:value' ? xdom.data.getValue(trigger) : undefined));

    var action = xdom.data.coalesce(settings["action"], action, 'replace'); //[replace | append]
    var cascade = xdom.data.coalesce(settings["cascade"], cascade, true);
    var src;
    trigger = trigger && trigger.id ? xdom.data.document.selectSingleNode("//*[@x:id='" + trigger.id + "']") : undefined;

    if (target && typeof (target.selectSingleNode) != 'undefined') {
        src = target;
        uid = target.getAttribute("x:id")
    } else if (uid) {
        src = xdom.data.document.selectSingleNode("//*[@x:id='" + uid + "']");
    } else if (event && event.srcElement) {
        uid = (xdom.dom.findClosestElementWithId(event.srcElement) || event.srcElement).id;
        src = xdom.data.document.selectSingleNode("//*[@x:id='" + uid + "']/ancestor-or-self::*[not(contains(namespace-uri(),'http://panax.io/xdom'))][1]");
    }
    if (!src) {
        console.warn("Reference to a record is needed");
        return;
    }
    //if (uid) {
    //    xdom.dom.activeElementId = uid
    //    xdom.data.document.selectSingleNode("/*").setAttribute("x:focus", uid)
    //}
    if (!uid) {
        var uid = Math.random().toString();
        if (!src.getAttribute("xmlns:x")) {
            src.setAttribute("xmlns:x", xdom.xml.namespaces["x"], false);
        }
        src.setAttribute("x:id", uid, false);
    }
    var start_date = new Date();
    if (!src) {
        console.error("Couldn't update data, the source might have changed. Trying to reload.");
        xdom.dom.refresh();
        return;
    }
    if (xdom.data.document.selectSingleNode('//*[@x:id="' + src.getAttribute("x:id") + '"]') && xdom.data.document.selectSingleNode('//*[@x:id="' + src.getAttribute("x:id") + '"]') !== src) {
        src = xdom.data.document.selectSingleNode('//*[@x:id="' + src.getAttribute("x:id") + '"]');
    }
    var $bindings = xdom.data.binding.sources;
    var dependants = {};
    var attributes;
    if (settings["attributes"]) {
        attributes = settings["attributes"];
    } else {
        attributes = [];
        attributes.push(new Object().push(attribute, value));
    }
    var changed = undefined;
    for (var item = 0; item < attributes.length; ++item) {
        attribute = Object.keys(attributes[item]).join("");
        value = attributes[item][attribute];
        if (xdom.debug["xdom.data.update"]) {
            console.log("uid: " + uid)
            console.log("\tAttribute: " + attribute)
            console.log("\tValue: " + value)
        }
        if (attribute == '@x:value' || attribute == '@x:deleting' || attribute == '@x:checked') {
            if (caller && (caller.name || "").match(/onchange|onblur|onpropertychange/)) {
                xdom.data.history.undo.push(xdom.xml.createDocument(xdom.data.document));
                xdom.data.history.redo = [];
            }
        }
        var regex = new RegExp(xdom.string.trim(attribute) + '\\b', 'g');
        if (typeof (src.ownerDocument.setProperty) != "undefined") {
            var current_namespaces = xdom.xml.getNamespaces(src.ownerDocument.getProperty("SelectionNamespaces"));
            if (!current_namespaces["x"]) {
                current_namespaces["x"] = "http://panax.io/xdom";
                src.ownerDocument.setProperty("SelectionNamespaces", xdom.json.join(current_namespaces, { "separator": " " }));
            }
        }
        //if (src.selectSingleNode('self::x:*') || src.getAttribute("x:readonly") == 'true()' || src.getAttribute("x:readonly") != 'false()' && ((src.getAttribute("x:readonly") || '').match(regex))) {
        //    //if (xdom.debug) {
        //        console.warn('Attribute ' + attribute + ' in ' + src.nodeName + ' can\'t be modified.')
        //    //}
        //    return false;
        //}
        var prefix = attribute.match(/^(@?)([^:]+)/).pop();
        if (xdom.xml.namespaces[prefix] && !xdom.xml.lookupNamespaceURI(src.ownerDocument.documentElement, xdom.xml.namespaces[prefix])) {
            src.ownerDocument.documentElement.setAttribute("xmlns:" + prefix, xdom.xml.namespaces[prefix], false);
            if (typeof (src.ownerDocument.setProperty) != "undefined") {
                var xml_namespaces = xdom.xml.transform(src.ownerDocument, xdom.library["xdom/resources/normalize_namespaces.xslt"]);
                src.ownerDocument.setProperty("SelectionNamespaces", xdom.xml.createNamespaceDeclaration(xml_namespaces));
            }
        }

        if (attribute == 'data()') {
            if (value) {
                if (action == 'append') {
                    src.appendChild(value.documentElement);
                } else {
                    src.innerHTML = value.documentElement.outerHTML;
                }
            }
            refreshDOM = true;
        } else if (attribute == 'text()') {
            if (String(value).match(/^=/g).length > 0) {
                src.setAttribute('formula', value, false);
            }
            src.innerHTML = value;
            refreshDOM = true;
        } else if (attribute.match("^@")) {
            if (value && src.getAttribute('x:format') == 'money') {
                value = value.replace(/[^\d\.-]/gi, '');
            }
            var attribute_ref = (src.selectSingleNode(attribute) || {});
            if (attribute_ref.value == null || attribute_ref.value != (value || String(value)) || value && !String(value).match("{{") && attribute.match("^@(source):") && (!(src.selectSingleNode(attribute.replace(/^@/, ""))) || !$bindings[src.getAttribute("x:id")].formulas[value].updated)) {
                dependants = xdom.json.merge(dependants, ($bindings[src.getAttribute("x:id")] || { "dependants": {} }).dependants[attribute]);
                if (xdom.xml.namespaces[prefix] == "http://panax.io/xdom") {
                    var attribute_base_name = attribute.match(/^(@?)([^:]+):?(.*)/).pop();
                    if (!src.selectNodes("@initial:" + attribute_base_name).length) {
                        src.setAttribute("initial:" + attribute_base_name, (src.getAttribute("initial:" + attribute_base_name) || attribute_ref.value || (attribute_base_name == 'checked' ? 'false' : '')), false);
                    }
                    if (!src.selectNodes("@prev:" + attribute_base_name).length) {
                        src.setAttribute("prev:" + attribute_base_name, (attribute_ref.value || (attribute_base_name == 'checked' ? 'false' : '')), false);
                    }
                }
                src.setAttribute(attribute.substring(1), (value || String(value)), false);//(value || "") //(value || "null"));
                changed = true;

                if (attribute.match("^@(source):")) {
                    //TODO: Revisar si este código aún tiene efecto o si se cubre con el binding
                    //if ((value || '').match("{{")) {
                    //    value = "";
                    //} else {
                    //    var request = value.replace(/^\w+:/, '');
                    //    value = xdom.data.binding.handleRequest({
                    //        "request": request
                    //        , "target_attribute": attribute.replace(/^@/, "")
                    //        , "xhr": {
                    //            "async": true
                    //            , "target": src
                    //            , "type": (attribute.match("^@source:") ? "table" : "scalar")
                    //        }
                    //    });
                    //}
                    //attributes.push(new Object().push(attribute.replace(/^@/, ""), value));
                } else if (attribute == ("@x:value") && attributes.find(element => element["@x:text"]) === undefined) {
                    var catalog = src.selectSingleNode(attribute.replace(/^@\w+:/, 'source:'));
                    if (catalog) {
                        attributes.push(new Object().push("@x:text", (catalog.selectSingleNode('*[normalize-space(' + attribute + ')="' + String(value).replace(/"/, '\\"') + '"]/@x:text') || {}).value || ""));
                    } else if (trigger && trigger.selectSingleNode('self::x:r')) {
                        attributes.push(new Object().push("@x:text", (trigger.getAttribute((trigger.getAttribute("x:text_field") || '').substring(1) || 'x:text') || (value || "") || "")));
                    }
                } else if (attribute == ("@x:text") && attributes.find(element => element["@x:value"]) === undefined) {
                    var catalog = src.selectSingleNode(attribute.replace(/^@\w+:/, 'source:'));
                    if (catalog) {
                        attributes.push(new Object().push("@x:value", (catalog.selectSingleNode('*[normalize-space(' + attribute + ')="' + String(value).replace(/"/, '\\"') + '"]/@x:value') || {}).value || ""));
                    } else if (trigger && trigger.selectSingleNode('self::x:r')) {
                        attributes.push(new Object().push("@x:value", (trigger.getAttribute((trigger.getAttribute("x:value_field") || '').substring(1) || 'x:value') || (value || "") || "")));
                    }
                }
                refreshDOM = refreshDOM !== undefined ? refreshDOM : undefined;
            }
        } else {
            dependants = xdom.json.merge(dependants, ($bindings[src.getAttribute("x:id")] || { "dependants": {} }).dependants[attribute]);
            if (action == 'append') {
                xdom.dom.insertAfter(value);
            } else {
                //if (src.selectSingleNode('@' + attribute)) {
                //    var node_exists = xdom.data.remove(src.selectSingleNode(attribute));
                //}
                if (!value && (typeof (value) != "boolean")) {
                    var node_exists = xdom.data.remove(src.selectSingleNode(attribute));
                }
                if (value != undefined && value !== '' && typeof (value.selectSingleNode) == 'undefined') {
                    var node = src.selectSingleNode(attribute);
                    if (!node) {
                        var namespaces = xdom.xml.createNamespaceDeclaration(xdom.data.document)
                        node = xdom.xml.createDocument("<" + attribute + " " + namespaces + ">" + String(value) + "</" + attribute + ">");
                    }
                    value = node;
                }
                if (value && value.documentElement) {
                    //var attrs = value.documentElement.selectNodes('@*');
                    //for (var attr in attrs) {
                    //    attrs[attr] 
                    //}
                    //xdom.data.remove(src.selectSingleNode(value.selectSingleNode("//*[1]").nodeName));
                    var for_value = value.documentElement.getAttribute("command");
                    var node_name = value.documentElement.nodeName;
                    var node = src.selectSingleNode(node_name + '[@command="' + for_value + '"]')
                    if (for_value && node) {
                        node.parentNode.replaceChild(value.documentElement, node);
                    } else {
                        xdom.dom.appendChild(src, value);
                    }
                    var source_transform = src.selectSingleNode("ancestor-or-self::*[@transforms:sources]/@transforms:sources");
                    if (source_transform && source_transform.value) {
                        await xdom.data.applyTransforms(src, [source_transform.value]);
                        src = xdom.data.document.selectSingleNode('//*[@x:id="' + uid + '"]');
                    }
                }
            }
            changed = true;
            if (attribute.match("^source:")) {
                var target_attribute = attribute.replace(/^source:/, "@x:");
                var source_record = null;
                var target_value = (src.getAttribute("x:value") || src.getAttribute("prev:value"))
                if (String(parseFloat(target_value)) != 'NaN') {
                    source_record = src.selectSingleNode(attribute + '/*[number(' + target_attribute + ')="' + parseFloat(target_value) + '"]/' + target_attribute)
                } else {
                    source_record = (src.selectSingleNode(attribute + '/*[' + target_attribute + '="' + target_value + '"]/' + target_attribute) || new xdom.data.EmptyXML());
                }
                if (source_record) {
                    attributes.push(new Object().push(target_attribute, (source_record.value || "")));
                    attributes.push(new Object().push("@x:text", (source_record.selectSingleNode("../@x:text").value || "")));
                }
            }
            refreshDOM = refreshDOM !== undefined ? refreshDOM : undefined;
        }
    }
    if (xdom.data.coalesce(xdom_global_refresh_enabled, refreshDOM, changed)) {
        //xdom.data.history.redo = [];
        src = xdom.data.deepFind(src);
        //if (!xdom.data.document.contains(src)) {
        //    xdom.data.document = xdom.xml.createDocument(xdom.data.document);
        //    src = xdom.data.document.selectSingleNode('//*[@x:id="' + uid + '"]');
        //}
        if (!xdom.data.document.find(src)) {
            var target = xdom.deprecated.getMasterDocument(src);
            await target.render();
        } else {
            var context = src.selectSingleNode("ancestor-or-self::*[@x:transforms]");
            xdom.data.applyTransforms(context);

            if (srcElement && srcElement.type == 'date' && caller.name.match(/onchange/)) {
                xdom.listeners.keys.tabKey = true;
            }
            xdom.data.document.reseed();
        }

        //if (xdom.data.update.caller && xdom.data.update.caller.name.match(/onchange|onblur|onpropertychange/)) {
        if (event && event.srcElement && (event.srcElement.name || "").match(/onchange|onblur|onpropertychange/)) {
            if (this.delayRefresh != undefined) {
                window.clearTimeout(this.delayRefresh); this.delayRefresh = undefined;
            }
            this.delayRefresh = setTimeout(function () {
                xdom.dom.refresh();
            }.apply(this, arguments), 5);
        } else {
            xdom.dom.refresh();
        }

    }
    if (xdom.session.live.running) xdom.session.saveSession();
    //xdom.session.setData(xdom.data.document);
}

//xdom.xml.update = function (settings) {
//    var coalesce = xdom.data.coalesce;
//    var trigger = (event && xdom.data.update.caller != xdom.data.cascade ? event.srcElement : undefined);
//    var settings = (settings || {});
//    var refreshDOM = false;
//    if (arguments.length == 0) {
//        refreshDOM = true;
//    } else if (arguments.length == 1 && arguments[0].constructor === {}.constructor) {
//    }

//    if (settings.hasOwnProperty("target")) {
//        if (typeof (settings["target"].selectSingleNode) != 'undefined') {
//            settings["target"] = settings["target"];
//        } else if (settings.hasOwnProperty("target") && typeof (settings["target"]) == 'string') {
//            settings["target"] = xdom.data.document.selectSingleNode("//*[@x:id='" + settings["target"] + "']");
//        }
//    }

//    if (trigger && trigger.id) {
//        settings["target"] = (settings["target"] || xdom.data.document.selectSingleNode("//*[@x:id='" + trigger.id + "']/ancestor-or-self::*[not(contains(namespace-uri(),'http://panax.io/xdom'))][1]"));
//        if (!settings.hasOwnProperty("attributes")) {
//            settings["attributes"] = {}
//            settings["attributes"]["@x:value"] = xdom.data.getValue(trigger);
//        }
//    }
//    var target = settings["target"];

//    var src;

//    if (target && typeof (target.selectSingleNode) != 'undefined') {
//        src = target;
//        uid = target.getAttribute("x:id")
//    } else if (uid) {
//        src = xdom.data.document.selectSingleNode("//*[@x:id='" + uid + "']");
//    } else if (event && event.srcElement) {
//        uid = event.srcElement.id;
//        src = xdom.data.document.selectSingleNode("//*[@x:id='" + uid + "']/ancestor-or-self::*[not(contains(namespace-uri(),'http://panax.io/xdom'))][1]");
//    }
//    if (!src) {
//        console.error("Reference to a record is needed");
//        return;
//    }
//    if (!uid) {
//        var uid = Math.random().toString();
//        if (!src.getAttribute("xmlns:x")) {
//            src.setAttribute("xmlns:x", xdom.xml.namespaces["x"]);
//        }
//        src.setAttribute("x:id", uid);
//    }
//    var start_date = new Date();
//    if (!src) {
//        console.error("Couldn't update data, the source might have changed. Trying to reload.");
//        xdom.dom.refresh();
//        return;
//    }
//    if (xdom.data.document.selectSingleNode('//*[@x:id="' + src.getAttribute("x:id") + '"]') && xdom.data.document.selectSingleNode('//*[@x:id="' + src.getAttribute("x:id") + '"]') !== src) {
//        src = xdom.data.document.selectSingleNode('//*[@x:id="' + src.getAttribute("x:id") + '"]');
//    }
//    var attributes = settings["attributes"]
//    var changed = false;
//    for (var item = 0; item < attributes.length; ++item) {
//        attribute = (typeof (attributes[item].selectSingleNode) != 'undefined' ? (attributes[item].nodeType == 2 ? '@' : '') + attributes[item].name : Object.keys(attributes[item]).join(""));
//        value = (typeof (attributes[item].selectSingleNode) != 'undefined' ? attributes[item].value : attributes[item][attribute]);
//        var action = "replace";
//        if (attribute == '@x:value') {
//            xdom.data.history.undo.push(xdom.data.document);
//            xdom.data.history.redo = [];
//        }
//        var regex = new RegExp(xdom.string.trim(attribute) + '\\b', 'g');
//        if (typeof (src.ownerDocument.setProperty) != "undefined") {
//            var current_namespaces = xdom.xml.getNamespaces(src.ownerDocument.getProperty("SelectionNamespaces"));
//            if (!current_namespaces["x"]) {
//                current_namespaces["x"] = "http://panax.io/xdom";
//                src.ownerDocument.setProperty("SelectionNamespaces", xdom.json.join(current_namespaces, { "separator": " " }));
//            }
//        }
//        if (src.selectSingleNode('self::x:*') || src.getAttribute("x:readonly") == 'true()' || src.getAttribute("x:readonly") != 'false()' && ((src.getAttribute("x:readonly") || '').match(regex))) {
//            if (xdom.debug["xdom.xml.update"]) {
//                console.warn('Attribute ' + attribute + ' in ' + src.nodeName + ' can\'t be modified.')
//            }
//            return false;
//        }
//        var prefix = attribute.match(/^(@?)([^:]+)/).pop();
//        if (xdom.xml.namespaces[prefix] && !xdom.xml.lookupNamespaceURI(src.ownerDocument.documentElement, xdom.xml.namespaces[prefix])) {
//            src.ownerDocument.documentElement.setAttribute("xmlns:" + prefix, xdom.xml.namespaces[prefix]);
//            if (typeof (src.ownerDocument.setProperty) != "undefined") {
//                var xml_namespaces = xdom.xml.transform(src.ownerDocument, xdom.library["xdom/resources/normalize_namespaces.xslt"]);
//                src.ownerDocument.setProperty("SelectionNamespaces", xdom.xml.createNamespaceDeclaration(xml_namespaces));
//            }
//        }

//        if (attribute == 'data()') {
//            if (value) {
//                if (action == 'append') {
//                    src.appendChild(value.documentElement);
//                } else {
//                    src.innerHTML = value.documentElement.outerHTML;
//                }
//            }
//            refreshDOM = true;
//        } else if (attribute == 'text()') {
//            if (String(value).match(/^=/g).length > 0) {
//                src.setAttribute('formula', value);
//            }
//            src.innerHTML = value;
//            refreshDOM = true;
//        } else if (attribute.match("^@")) {
//            if (value && src.getAttribute('x:format') == 'money') {
//                value = value.replace(/[^\d\.-]/gi, '');
//            }
//            var attribute_ref = (src.selectSingleNode(attribute) || {});
//            if (attribute_ref.value == null || attribute_ref.value != (value || "") || value && !value.match("{{") && attribute.match("^@(source):") && !(src.selectSingleNode(attribute.replace(/^@/, "")))) {
//                if (attribute_ref.value && attribute_ref.namespaceURI == "http://panax.io/xdom") {
//                    src.setAttribute("prev:" + (attribute_ref.baseName || attribute_ref.localName), attribute_ref.value);
//                }
//                src.setAttribute(attribute.substring(1), (value || ""));//(value || "null"));
//                changed = true;

//                if (attribute.match("^@(source):")) {
//                    if ((value || '').match("{{")) {
//                        value = "";
//                    } else {
//                        var request = value.replace(/^\w+:/, '');
//                        value = xdom.data.binding.handleRequest({
//                            "request": request
//                            , "target_attribute": attribute.replace(/^@/, "")
//                            , "xhr": {
//                                "async": true
//                                , "target": src
//                                , "type": (attribute.match("^@source:") ? "table" : "scalar")
//                            }
//                        });
//                    }
//                    attributes.push(new Object().push(attribute.replace(/^@/, ""), value));
//                } else if (attribute == ("@x:value")) {
//                    if (trigger && trigger.selectSingleNode('self::x:r')) {
//                        attributes.push(new Object().push("@x:text", (trigger.getAttribute((trigger.getAttribute("x:text_field") || '').substring(1) || 'x:text') || (value || "") || "")));
//                    }
//                }
//                refreshDOM = refreshDOM !== undefined ? refreshDOM : undefined;
//            }
//        } else {
//            if (action == 'append') {
//                xdom.dom.insertAfter(value);
//            } else {
//                //if (src.selectSingleNode('@' + attribute)) {
//                //    var node_exists = xdom.data.remove(src.selectSingleNode(attribute));
//                //}
//                if (!value && (typeof (value) != "boolean")) {
//                    var node_exists = xdom.data.remove(src.selectSingleNode(attribute));
//                }
//                if (value != undefined && value !== '' && typeof (value.selectSingleNode) == 'undefined') {
//                    var node = src.selectSingleNode(attribute);
//                    if (!node) {
//                        var namespaces = xdom.xml.createNamespaceDeclaration(xdom.data.document)
//                        node = xdom.xml.createDocument("<" + attribute + " " + namespaces + ">" + String(value) + "</" + attribute + ">");
//                    }
//                    value = node;
//                }
//                if (value && value.documentElement) {
//                    //var attrs = value.documentElement.selectNodes('@*');
//                    //for (var attr in attrs) {
//                    //    attrs[attr] 
//                    //}
//                    //xdom.data.remove(src.selectSingleNode(value.selectSingleNode("//*[1]").nodeName));
//                    var for_value = value.documentElement.getAttribute("command");
//                    var node_name = value.documentElement.nodeName;
//                    if (for_value && src.selectSingleNode(node_name + '[@command="' + for_value + '"]')) {
//                        continue;
//                    }
//                    xdom.dom.appendChild(src, value);
//                    var source_transform = src.selectSingleNode("ancestor-or-self::*[@transforms:sources]/@transforms:sources");
//                    if (source_transform && source_transform.value) {
//                        xdom.data.applyTransforms(src, [source_transform.value]);
//                        src = xdom.data.document.selectSingleNode('//*[@x:id="' + uid + '"]');
//                    }
//                }
//            }
//            changed = true;
//            if (attribute.match("^source:")) {
//                var target_attribute = attribute.replace(/^source:/, "@x:");
//                var source_record = null;
//                var target_value = (src.getAttribute("x:value") || src.getAttribute("prev:value"))
//                if (String(parseFloat(target_value)) != 'NaN') {
//                    source_record = src.selectSingleNode(attribute + '/*[number(' + target_attribute + ')="' + parseFloat(target_value) + '"]/' + target_attribute)
//                } else {
//                    source_record = (src.selectSingleNode(attribute + '/*[' + target_attribute + '="' + target_value + '"]/' + target_attribute) || new xdom.data.EmptyXML());
//                }
//                if (source_record) {
//                    attributes.push(new Object().push(target_attribute, (source_record.value || "")));
//                    attributes.push(new Object().push("@x:text", (source_record.selectSingleNode("../@x:text").value || "")));
//                }
//            }
//            refreshDOM = refreshDOM !== undefined ? refreshDOM : undefined;
//        }
//    }
//    if (settings["refresh"] !== false && (changed || refreshDOM)) {
//        xdom.data.document = xdom.xml.createDocument(xdom.data.document);
//        xdom.data.history.redo = [];
//        src = xdom.data.document.selectSingleNode('//*[@x:id="' + uid + '"]');
//        var context = src.selectSingleNode("ancestor-or-self::*[@x:transforms]");
//        context = xdom.data.applyTransforms(context);
//        xdom.dom.refresh();
//        xdom.data.binding.trigger(context);
//    }
//    //}
//    //setTimeout(function () {//uses a small delay to catch the current selected element
//    //    xdom.data.binding.trigger(context);
//    //}, 5);
//    if (xdom.session.live.running) xdom.session.saveSession();
//    //xdom.session.setData(xdom.data.document);
//}

xdom.data.applyTransforms = function (original_context, transforms) {
    var context = original_context;
    var context_transforms;
    if (context instanceof xdom.data.Store) {
        context_transforms = context.library;
    } else {
        context_transforms = xdom.library;
    }
    if (context) {
        ////context = context.selectSingleNode("ancestor-or-self::*[@x:transforms]");
        //context = (context.nodeName == "#document" ? context.documentElement : context);
        var target_id = (context.documentElement || context).getAttribute("x:id");
        if (!transforms) {
            transforms = xdom.data.getTransformationFileName(context).split(";");
            //transforms.pop();
        }

        if (transforms.length) {
            for (var t = 0; t < transforms.length; t++) {
                transforms[t] = (transforms[t] || '').replace(/;\s*$/, '');
                if (!transforms[t]) continue;
                if (!context_transforms[transforms[t]]) {
                    ////console.error("xdom.data.applyTransforms: File " + transforms[t] + " is not ready.");
                    //fetchFiles(transforms[t]);
                    if (!(xdom.browser.isIOS())) {
                        var xsl = xdom.xml.createDocument(`                                                                  
                    <xsl:stylesheet version="1.0"                                                                            
                        xmlns:xsl="http://www.w3.org/1999/XSL/Transform">                                                    
                        <xsl:import href="${transforms[t]}" />                                                             
                    </xsl:stylesheet>`);
                        context = xdom.xml.transform(context, xsl);
                    } else {
                        context = xdom.xml.transform(context, transforms[t]);
                    }
                } else {
                    context = xdom.xml.transform(context, context_transforms[transforms[t]]);//, context);
                }
            }
            if (target_id) {
                context = (context.selectSingleNode('//*[@x:id="' + target_id + '"]') || context);
                var target_node = original_context.selectSingleNode('//*[@x:id="' + target_id + '"]')
                if (target_node && target_node.parentNode && context !== target_node && context.selectSingleNode('//*[@x:id="' + target_id + '"]')) {
                    target_node.parentNode.replaceChild(context, target_node);
                    //context.reseed();
                }
            }
        }
    }
    return context;//(xdom.data.find(context) || context);
}

xdom.data.findById = function (id) {
    if (!id) { return null; }
    return xdom.data.document.selectSingleNode('//*[@x:id="' + id + '"]')
}

xdom.data.findByName = function (name) {
    var nodes = xdom.data.document.selectNodes('//*[name()="' + name + '"]');
    if (nodes && nodes.length == 1) {
        nodes = nodes[0];
    }
    return nodes;
}

xdom.data.coalesce = function () {
    for (var i in arguments) {
        if (arguments[i] !== undefined && arguments[i] !== null) {
            return arguments[i];
        }
    }
    return;
}

xdom.dom.appendFirst = function (e, i) {
    if (!(e && i)) {
        return;
    }
    e = (e.documentElement || e)
    e.insertBefore((i.documentElement || i), e.firstElementChild);
}

xdom.dom.insertAfter = function (i, e, p) {
    if (e && e.nextElementSibling) {
        e.parentNode.insertBefore(i, e.nextElementSibling);
    } else {
        (p || (e || {}).parentNode).appendChild(i);
    }
}

xdom.dom.insertBefore = function (i, e, p) {
    if (e) {
        e.parentNode.insertBefore(i, e);
    } else {
        (p || (e || {}).parentNode).appendChild(i);
    }
}

xdom.data.addRecord = function (ref_node, target_node, target_position, how_many) {
    var how_many = (how_many == undefined ? 1 : how_many)
    if (how_many <= 0) return;
    var ref_node = (ref_node || '/*/*[1]');
    var target_node = (target_node || '/*');
    var target_position = (target_position || 'first')
    var start_date = new Date();
    //xdom.data.clearSelection();
    xdom.data.history.undo.push(xdom.data.document);
    var xNew;
    try {
        xNew = xdom.data.document.selectSingleNode(ref_node).cloneNode(true)
    } catch (e) {
        xNew = xdom.data.getFirstRecord(xdom.data.document).cloneNode(true);
    }
    xNew = xdom.xml.transform(xdom.xml.toString(xNew), xdom.library["xdom/resources/reset_record.xslt"]).selectSingleNode("*");
    var timestamp = Math.random().toString();
    xNew.setAttribute("timestamp", timestamp);
    xNew.setAttribute("editing", "true");
    xNew.setAttribute("x:selected", "true");
    xNew.removeAttribute("x:deleting");
    xdom.data.removeAttribute(xNew.selectNodes('*[@x:value]'), '@x:value');
    xdom.data.removeAttribute(xNew.selectNodes('*[@prev:value]'), '@prev:value');
    //div.innerHTML = xNew.outerHTML;
    //xdom.data.document.appendChild(div.childNodes)
    ////xdom.data.document.firstElementChild.insertAdjacentHTML('beforebegin', xNew); //Este método cambia las mayúsculas por minúsculas
    try {
        //var data = xdom.xml.createDocument(xdom.data.document);
        var target = xdom.data.document.selectSingleNode(target_node);
        if (target_position == 'first') {
            target.insertBefore(xNew, target.firstElementChild);
        } else if (target_position == 'previous') {
            target = xdom.data.document.selectSingleNode(ref_node);
            xdom.dom.insertBefore(xNew, target);
        } else if (target_position == 'next') {
            target = xdom.data.document.selectSingleNode(ref_node);
            xdom.dom.insertAfter(xNew, target);
        } else {
            xdom.dom.insertAfter(xNew, target.lastElementChild, target);
        }
        ////data.selectSingleNode('/*').appendChild(xNew, data.selectSingleNode('/*/*[1]'));
        //xdom.data.document = xdom.xml.createDocument(data);
    } catch (e) {
        console.log(e.message);
        return;
    }
    if (xdom.debug["xdom.data.addRecord"]) {
        console.log("@addRecord#Transformation Time: " + (new Date().getTime() - start_date.getTime()));
    }
    var new_record_uid;
    if (--how_many > 0) {
        new_record_uid = xdom.data.addRecord(ref_node, target_node, target_position, how_many);
    }
    xdom.session.setData(xdom.data.document);
    xdom.data.history.redo = [];
    if (!new_record_uid) {
        xdom.data.document.reseed();
        var new_record = xdom.data.document.selectSingleNode('//*[@timestamp="' + timestamp + '"]')
        var new_record_uid = new_record.getAttribute("x:id");
        xdom.data.applyTransforms(new_record);
        xdom.data.binding.trigger(new_record);
        xdom.dom.refresh();
    }
    return new_record_uid;
}

xdom.data.addRecord = function (ref_node, target_node, target_position, how_many) {
    ((event || {}).srcElement || document.createElement('p')).classList.add("working");
    var ref_id = xdom.data.document.selectSingleNode(ref_node).getAttribute("x:id");
    xdom.data.history.undo.push(xdom.data.document);
    xdom.data.updateNode(xdom.data.document.find(ref_id), '@copy:after', (target_node || 'this()'), false).then(response => {
        xdom.data.document = xdom.xml.transform(xdom.data.document, "xdom/resources/commands.xslt");
        xdom.data.applyTransforms(xdom.data.document.selectSingleNode(ref_node).selectSingleNode("ancestor-or-self::*[@x:transforms]"));
        xdom.dom.refresh();
    });
    xdom.dom.getScrollableElements();
}

xdom.data.duplicateRecord = function (ref_node, target_node, target_position, how_many) {
    ((event || {}).srcElement || document.createElement('p')).classList.add("working");

    if (typeof (ref_node) == 'string') {
        ref_node = xdom.data.document.find(ref_node);
    }
    if (!ref_node) {
        return;
    }
    ref_node.setAttribute('@copy:after', (target_node || 'this()'), false);
    xdom.dom.getScrollableElements();
    xdom.data.document = xdom.xml.transform(xdom.data.document, "xdom/resources/commands.xslt");
}

xdom.data.deleteRecord = function (uid) {
    var uid = (uid || event.srcElement.id);
    target = xdom.data.findById(uid);
    xdom.dom.getScrollableElements();
    if (target.selectFirst('self::px:dataRow[@identity]')) {
        xdom.data.update(uid, '@x:deleting', 'true');
    } else {
        target.remove();
    }
}

xdom.data.removeRecord = function (uid) {
    var uid = (uid || event.srcElement.id);
    target = xdom.data.findById(uid);
    xdom.data.remove(target);
    xdom.dom.refresh();
}

xdom.data.undo = function () {
    xdom.data.document.undo();
    /*if (xdom.data.history.undo.length == 0) return;
    xdom.data.history.redo.push(xdom.data.document);
    xdom.data.document = xdom.xml.createDocument(xdom.data.history.undo.pop());
    //xdom.data.document.update = xdom.data.update;
    xdom.dom.refresh({ trigger_bindings: false }); //trigger bindings is disabled because it may modify xdom.data.history*/
}

xdom.data.redo = function () {
    xdom.data.document.redo();
    /*if (xdom.data.history.redo.length == 0) return;
    xdom.data.history.undo.push(xdom.data.document);
    xdom.data.document = xdom.xml.createDocument(xdom.data.history.redo.pop());
    //xdom.data.document.update = xdom.data.update;
    xdom.dom.refresh();*/
}

xdom.data.clearCache = function (cache_name, src) {
    var url = relative_path + xdom.manifest.server["endpoints"]["clearCache"] + "?file_name=" + cache_name.replace(/^[^:]+:/, '');
    var src = xdom.data.find((src || xdom.dom.findClosestElementWithId(event.srcElement).id.replace(/container_/i, '')));
    var oData = new xdom.xhr.Request(url);
    oData.onSuccess = function (Response, Request) {
        if (src) {
            xdom.data.remove(src.selectSingleNode('source:value'))
        }
        delete xdom.xhr.cache[Request.parameters["file_name"]];
        xdom.dom.refresh({ forced: true });
    }
    oData.onException = function (Response, Request) {
        result = Response;

    }
    oData.load();
}

xdom.data.toClipboard = function (source) {
    var dummyContent = xdom.xml.toString(source || xdom.data.document);
    var dummy = (document.createElement('input'));
    dummy.value = dummyContent;
    document.body.appendChild(dummy);
    dummy.select();
    document.execCommand('copy');
    dummy.remove();
}

xdom.dom.getRelativePath = function (element, path) {
    path = (path || [])
    if (element.id) {
        path.unshift(element.tagName + "#" + element.id);
        return path;
    } else if (element.parentElement) {
        var classes = xdom.string.trim(element.classList.toString()).replace(/\s+/ig, '.');
        path.unshift(element.tagName + (classes ? '.' + classes : ''));
        return xdom.dom.getRelativePath(element.parentElement, path);
    } else {
        path.unshift(element.tagName);
        return path;
    }
}

xdom.dom.findClosestElementWithAttribute = function (element, attribute) {
    if (!element) return element;
    if (element.getAttribute(attribute)) {
        return element;
    } else if (element.parentElement) {
        return xdom.dom.findClosestElementWithAttribute(element.parentElement, attribute);
    } else {
        return undefined;
    }
}

xdom.dom.findClosestElementWithTagName = function (element, tagName) {
    if (!element) return element;
    if ((element.tagName || "").toUpperCase() == tagName.toUpperCase()) {
        return element;
    } else if (element.parentElement) {
        return xdom.dom.findClosestElementWithTagName(element.parentElement, tagName);
    } else {
        return undefined;
    }
}

xdom.dom.findClosestElementWithClassName = function (element, className) {
    if (!element) return element;
    var regex = new RegExp('\b(' + className + ')\b', "ig");

    if (element.classList && element.classList.contains && element.classList.contains(className)) {
        return element;
    } else if (element.parentElement) {
        return xdom.dom.findClosestElementWithClassName(element.parentElement, className);
    } else {
        return undefined;
    }
}

xdom.dom.findClosestElementWithId = function (element) {
    if (!element) return element;
    if (element.id && !element.id.startsWith("_")) {
        return element;
    } else if (element.parentElement) {
        return xdom.dom.findClosestElementWithId(element.parentElement);
    } else {
        return undefined;
    }
}

xdom.dom.findClosestDataNode = function (element) {
    if (!element) return element;
    return (xdom.data.stores.find((element.id || '').replace(/^container_/i, ''))[0] || xdom.dom.findClosestDataNode(xdom.dom.findClosestElementWithId(element.parentElement)));
}

xdom.dom.saveState = function (srcElement) {
    srcElement = (srcElement || event && event.srcElement);
    targetDocument = (document.activeElement.contentDocument || document);
    if (srcElement && !(srcElement instanceof HTMLElement) || !targetDocument.querySelector('*')) {
        return
    }
    xdom.dom.updateScrollableElements();
    xdom.dom.onscroll();
    var active_element = (xdom.dom.findClosestElementWithId(targetDocument.activeElement) || targetDocument.activeElement);
    if (targetDocument.activeElement == targetDocument.querySelector('body') && event && event.srcElement) {
        xdom.dom.activeElement = event.srcElement;
        if (!xdom.dom.activeElement.id) {
            if (targetDocument.getElementById((xdom.dom.activeElement || document.createElement('p')).getAttribute("command"))) {
                xdom.dom.activeElement = targetDocument.getElementById(xdom.dom.activeElement.getAttribute("command"));
            }
        }
        xdom.dom.activeElementId = xdom.dom.activeElement.id;
        xdom.dom.activeElement.focus();
    }
    else if (targetDocument.activeElement/* && active_element.id && xdom.dom.activeElementId != targetDocument.activeElement.id*/) {
        xdom.dom.activeElement = targetDocument.activeElement//targetDocument.activeElement.id;
        xdom.dom.activeElementId = xdom.dom.getRelativePath(active_element).join(" > ")//targetDocument.activeElement.id;
        //if xdom.dom.activeElement.parentElement.id==targetDocument.getElementById(xdom.dom.activeElementId).id
        if (xdom.dom.activeElement) {
            xdom.dom.activeElementCaretPosition = xdom.dom.getCaretPosition(xdom.dom.activeElement);
        }
    }
}

xdom.dom.restoreState = function () {
    targetDocument = (document.activeElement.contentDocument || document);
    var linkEls = targetDocument.getElementsByTagName('a');
    // Attach event listeners
    for (var i = 0, l = linkEls.length; i < l; i++) {
        linkEls[i].addEventListener('click', xdom.dom.clickHandler, true);
    }

    var activeElement
    //if (xdom.dom.activeElementId && (targetDocument.querySelector(xdom.dom.activeElementId) || xdom.dom.activeElement) !== xdom.dom.activeElement) {
    //    activeElement = targetDocument.querySelector(xdom.dom.activeElementId).querySelector(xdom.dom.getRelativePath(xdom.dom.activeElement).join(" > "));
    //} else if (xdom.dom.activeElement && !xdom.dom.activeElement.id) {
    //    activeElement = targetDocument.querySelector(xdom.dom.getRelativePath(xdom.dom.activeElement).join(" > "));
    //} else {
    activeElement = xdom.dom.findActiveElement();
    //}
    //var target = xdom.dom.getScrollParent(activeElement); //targetDocument.querySelector('body');//targetDocument.getElementsByClassName("w3-responsive")[0] || targetDocument.querySelector('main')
    //xdom.dom.setScrollPosition(target, xdom.data.getScrollPosition());
    xdom.dom.setScrollPosition();
    Object.entries(xdom.dom.scrollableElements).forEach(([key, value]) => {
        let target = targetDocument.querySelector(`#${key}`);
        xdom.dom.setScrollPosition(target, value);
    })
    if (!activeElement) {
        return;
    } else {
        //console.log("xdom.dom.triggeredByTab: " + xdom.dom.triggeredByTab)
        if (xdom.dom.triggeredByTab && ((xdom.dom.activeElement || {}).tagName == "SELECT" && activeElement.id == (xdom.dom.bluredElement || {}).id)) {
            //console.log(xdom.dom.triggeredByTab);
            if (xdom.listeners.keys.shiftKey) {
                xdom.dom.activeElement = xdom.dom.getPrecedingElement(activeElement);
            } else {
                xdom.dom.activeElement = xdom.dom.getNextElement(activeElement);
            }
            xdom.dom.activeElementCaretPosition = 0;
        } else {
            xdom.dom.activeElement = activeElement;
        }
    }
    xdom.dom.triggeredByTab = undefined;
    (xdom.dom.activeElement || document.createElement('p')).focus();
    xdom.dom.setCaretPosition(xdom.dom.activeElement, xdom.dom.activeElementCaretPosition);
}

xdom.dom.findActiveElement = function (relativePath, targetDocument) {
    var relativePath = xdom.data.coalesce(relativePath, xdom.dom.activeElementId);
    if (!relativePath) {
        return (targetDocument || {}).body;
    }
    var targetDocument = (targetDocument || document.activeElement.contentDocument || document)
    return targetDocument.querySelector(relativePath) || xdom.dom.findActiveElement(relativePath.split(" > ").slice(0, -1).join(" > "), targetDocument);
}

xdom.delay = function (ms) {
    return ms ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve();
}

xdom.data.hashTagName = function (document) {
    var node = (document || xdom.data.document).selectSingleNode("/*[1]");
    if (node) {
        return '#' + xdom.data.coalesce(node.getAttribute("x:tag"), node.localName.toLowerCase(), "");
    } else {
        return '#';
    }
}

xdom.deprecated.getMasterDocument = function (src) {
    let hashtag = xdom.data.hashTagName((src.ownerDocument || src.parentNode || src));
    if (!hashtag) return undefined;
    return (xdom.data.stores[hashtag] || xdom.data.stores["#shell"]);
}

xdom.dom.setEncryption = function (dom, encryption) {
    var encryption = (encryption || "UTF-7")
    if (typeof (dom.selectSingleNode) != 'undefined') {
        var meta_encoding = dom.selectSingleNode('//*[local-name()="meta" and @http-equiv="Content-Type" and not(contains(@content,"' + encryption + '"))]');
        if (meta_encoding) {
            meta_encoding.setAttribute("content", "text/html; charset=" + encryption);
        }
    } else {
        var metas = dom.querySelectorAll('meta[http-equiv="Content-Type"]');
        if (metas.length && metas[0].content.indexOf(encryption) != -1) {
            metas[0].content.content = "text/html; charset=" + encryption
        }
    }
}

xdom.deprecated.showShell = function () {
    var current_hash = (window.top || window).location.hash;
    var target;
    if (!xdom.data.stores["#shell"]) {
        if (xdom.sources["#sitemap"] && ((arguments || {}).callee || {}).caller !== xdom.dom.showShell) {
            xdom.data.load(xdom.sources["#sitemap"], function () {
                xdom.dom.showShell();
            });
            return;
        } else {
            console.warn(xdom.messages["noSitemap"] || "There is no sitemap in memory or a source definition for xdom.sources.sitemap.")
        }
        return;
    }
    if (current_hash != '#shell' && xdom.data.stores["#shell"]) {
        xdom.data.document = xdom.data.stores["#shell"];
        xdom.dom.refresh();
        target = document.querySelector('main');
    }

    if (xdom.data.stores[current_hash]) {
        xdom.data.document = (xdom.data.stores[current_hash] || xdom.data.document || xdom.library["default.xml"]);
        xdom.dom.refresh(target);
        return;
    }
}

xdom.data.loadHash = async function (hash) {
    if (xdom.manifest.sources[hash]) return false;
    await xdom.manifest.sources[hash].fetch({ as: hash });
    if (!xdom.data.stores[hash]) {
        xdom.dom.navigateTo('#');
    }
}

xdom.dom.refresh = async function () {
    var { forced } = (arguments[0] || {});
    if (forced) {
        xdom.data.document.library.clear(true);
    }
    //if ((window.top || window).location.hash && !xdom.data.stores[(window.top || window).location.hash] && !['unauthorized', 'authorizing'].includes(xdom.session.status)) {
    //    if (xdom.data.loadHash((window.top || window).location.hash)) {
    //        return;
    //    }
    //}
    //if (!xdom.data.document) {
    //    xdom.data.document = xdom.dom.shell;
    //}
    //if ((window.top || window).location.hash && !(xdom.data.stores[(window.top || window).location.hash] === xdom.data.document) && !['unauthorized', 'authorizing'].includes(xdom.session.status)) {
    //    xdom.data.loadHash((window.top || window).location.hash);
    //}
    return xdom.data.document.render(forced);
    //return new Promise(resolve => {
    //    setTimeout(async () => {
    //        await xdom.data.document.render(forced);
    //        resolve(true);
    //    }, 100);
    //});
    ////xdom.data.document.render().then(() => Promise.resolve());
}

Object.defineProperty(xdom.dom.refresh, 'interval', {
    value: function (seconds) {
        var self = this;
        //xdom.session.live.running = live;
        var refresh_rate;
        var _seconds = seconds;
        this.seconds = _seconds;
        if (this.Interval) window.clearInterval(this.Interval);
        if (seconds == 0) {
            window.console.info('Auto refresh stopped.');
        } else {
            window.console.info(`Start refresh of ${xdom.data.document.tag} for every ${seconds} seconds.`);
        }
        if (!seconds) return;

        refresh_rate = (refresh_rate || 5);
        refresh_rate = (refresh_rate * 1000);
        var refresh = async function () {
            if (!this.seconds) {
                if (this.Interval) window.clearInterval(this.Interval);
                window.console.info('Auto refresh stopped.');
                return;
            }
            window.console.info('Checking for changes in session...');
            await xdom.dom.refresh({ forced: true });
        };

        self.Interval = setInterval(function () {
            refresh.apply(self)
        }, refresh_rate);
    },
    writable: false, enumerable: false, configurable: false
});

Object.defineProperty(xdom.dom.refresh, 'stop', {
    value: function () {
        xdom.dom.refresh.seconds = undefined;
        if (xdom.dom.refresh.Interval) {
            window.clearInterval(xdom.dom.refresh.Interval);
            xdom.dom.refresh.Interval = undefined;
        }
        window.console.info('Auto refresh stopped.');
    },
    writable: false, enumerable: false, configurable: false
});

xdom.data.getSelections = function (data_source) {
    var data_source = (data_source || xdom.data.document);
    return data_source.selectNodes('//*[@*[name()="x:selected"]]')
}

xdom.data.clearChecked = function (targetId) {
    var target = xdom.data.find(targetId);
    xdom.data.remove(target.selectNodes('*/@x:checked'));
}

xdom.data.clearSelection = function (targetId, refresh) {
    try {
        var oXML = xdom.xml.createDocument(xdom.data.document);
        var oNode = oXML.selectSingleNode('/*/*[@x:selected="true"]');
        if (!oNode) return;
        oNode.setAttribute('@x:selected', null, refresh);
    } catch (e) {
        throw (e.message);
    }

}

xdom.data.unselectRecord = function (targetId, clearSelection) {
    xdom.data.update(targetId, '@x:selected', null, true);
}

xdom.data.selectRecord = function (targetId, on_complete) {
    if (!xdom.listeners.keys.ctrlKey) {
        xdom.data.removeSelections(xdom.data.document.selectNodes('//*[@x:id="' + targetId + '"]/../*[@*[name()="x:selected"]]'));
        //xdom.data.removeSelections(xdom.data.document.selectNodes('//*[@x:id="' + targetId + '"]/../*[@x:selected]')); //This part is buggy in IE and some times in Chrome, Edge, and probably other browsers. The workaround is adding little more verbosity in the predicate.
    }
    xdom.data.update(targetId, '@x:selected', 'true', true);
    if (on_complete && on_complete.apply) {
        on_complete.apply(this, arguments);
    };
}

xdom.data.previousRecord = function () {
    var oXML = xdom.xml.createDocument(xdom.data.document);
    var oNode = oXML.selectSingleNode('/*/*[@x:selected="true"]');
    var oNodeNext = (oNode || {});

    do {
        var oNodeNext = oNodeNext.previousSibling;
    } while (oNodeNext && oNodeNext.nodeName == "#text")

    if (oNodeNext) {
        xdom.data.update(oNode.getAttribute("x:id"), '@x:selected', null, false);
        xdom.data.update(oNodeNext.getAttribute("x:id"), '@x:selected', 'true', true);
    }
}

xdom.data.nextRecord = function () {
    var oXML = xdom.xml.createDocument(xdom.data.document);
    var oNode = oXML.selectSingleNode('/*/*[@x:selected="true"]');
    var oNodeNext = (oNode || {});
    do {
        var oNodeNext = oNodeNext.nextSibling;
    } while (oNodeNext && oNodeNext.nodeName == "#text")

    if (oNodeNext) {
        xdom.data.update(oNode.getAttribute("x:id"), '@x:selected', null, false);
        xdom.data.update(oNodeNext.getAttribute("x:id"), '@x:selected', 'true', true);
    }
}

xdom.dom.appendChild = function (target, sHTML) {
    if (!sHTML) return;
    if (typeof (target) == "string") {
        target = document.querySelector(target);
    }
    try {
        target.appendChild(sHTML);
    } catch (e) {
        try {
            target.appendChild(xdom.xml.createDocument(sHTML).documentElement);
        } catch (e) {
            var div = document.createElement('div');
            div.innerHTML = xdom.xml.toString(sHTML);
            target.appendChild(div.children[0]);
        }
    }
}

xdom.dom.clear = function (target) {
    if (target === undefined) {
        target = document.querySelector('body');
    } else if (typeof (target) == "string") {
        target = document.querySelector(target);
    }
    if (!(target && target.innerHTML)) return;
    target.innerHTML = '';
}

xdom.xhr.loadXMLFile = function (sXmlFile, settings) {
    var settings = (settings || {});
    var xhttp = new xdom.xhr.Request(sXmlFile);
    xhttp.method = (settings.method || 'GET');
    xhttp.async = (settings.async == undefined ? true : settings.async);
    xhttp.onSuccess = function () {
        if (settings.onSuccess) {
            settings.onSuccess.apply(this, [this.Response, this]);
        }
    }
    xhttp.onFail = function () {
        if (settings.onFail) {
            settings.onFail.apply(this, [this.Response, this]);
        }
    }
    xhttp.onException = function () {
        if (settings.onException) {
            settings.onException.apply(this, [this.Response, this]);
        }
        if (this.xhr.status >= 500) {
            console.error('Error al descargar contenido XML ' + this.request + ':\n\n ' + this.xhr.responseText + '\n\n')
        }
    };
    xhttp.load();
    return xhttp;
}

xdom.data.getFirstRecord = function (xml) {
    var oXML = xdom.xml.createDocument(xdom.data.document);
    try {
        return oXML.selectSingleNode('/*/*[1]');
    } catch (e) {
        for (var nodeItem = oXML.childNodes.length; nodeItem > 0; --nodeItem) {
            var nodeElement = oXML.childNodes[nodeItem - 1];
            if (nodeElement.nodeType == 1) {
                return nodeElement.firstElementChild; //Equivalente a /*/*[1]
            }
        }
    }
}

xdom.xhr.Exception = function (xhr) {
    this.message = 'Exception';
}

xdom.xml.Library = function (object) {
    if (!(this instanceof xdom.xml.Library)) return new xdom.xml.Library(object);
    var _library = (object || {});
    if (!_library.hasOwnProperty('clear')) {
        Object.defineProperty(_library, 'clear', {
            value: function () {
                Object.keys(this).map((key) => {
                    _library[key] = undefined;
                });
            },
            writable: false, enumerable: false, configurable: false
        })
    }
    if (!_library.hasOwnProperty('load')) {
        Object.defineProperty(_library, 'load', {
            value: async function (list) {
                var dependencies_to_load = list || _library.filter((key, value) => !value);
                Object.keys(dependencies_to_load).map((key) => {
                    _library[key] = xdom.fetch.xml(key).then(document => _library[key] = document && document.selectFirst && document.selectFirst('xsl:stylesheet') && document);
                });
                return Promise.all(Object.values(_library));
            },
            writable: false, enumerable: false, configurable: false
        })
    }
    Object.setPrototypeOf(_library, this);
    return _library;
}


xdom.data.Store = function (xml) {
    if (!(this instanceof xdom.data.Store)) return new xdom.data.Store(xml, arguments[1]);
    var self = this;
    var _this_arguments = arguments;
    var __document = xdom.xml.createDocument(xml);
    var _undo = [];
    var _redo = [];
    var _fetch_url;
    var config = arguments[1] && arguments[1].constructor === {}.constructor && arguments[1];
    var on_complete = !config && arguments[1] && isFunction(arguments[1]) && arguments[1] || config && config["onComplete"];
    var _tag, _hash;
    var _rendering = false;
    //var _isActive = false;
    var _initiator = undefined;
    var _library = {};

    this.state = new Proxy({}, {
        get: function (target, name) {
            return target[name];
        },
        set: function (target, name, value) {
            let refresh;
            if (value && ['function'].includes(typeof (value))) {
                throw ('State value is not valid type');
            }
            if (target[name] != value && !["rendering"].includes(name)) {
                refresh = true
            }
            target[name] = value
            var return_value
            if (refresh) {
                var name = name, value = value;
                self.library.load().then(() => {
                    dependencies = self.library;
                    if (["busy"].includes(name) || Object.values(dependencies).filter(stylesheet => {
                        return !!(stylesheet || window.document.createElement('p')).selectAll(`//xsl:stylesheet/xsl:param[@name='state:${name}']`).length
                    }).length) {
                        console.log(`Rendering ${self.tag} triggered by state:${name}`);
                        self.render(true);
                    };
                });
            }
        }
    })

    this.status = "loading"

    this.onLoad = function () {
        console.log("Do nothing");
    }

    this.load = async function (input) {
        if (!input) throw ("Input is empty");
        if (typeof (input) == 'string') {
            input = xdom.xml.createDocument(input)
        }
        this.document = input;
        await this.initialize();
        this.onComplete();
    }

    this.fetch = async function (input) {
        _fetch_url = (_fetch_url || input);
        if (!_fetch_url) {
            throw ("No url initialized.")
        }
        let [data, request] = await xdom.fetch.from(_fetch_url);
        this.document = data;
        if (xdom.data.document === this) {
            this.render(true);
        }
    }

    this.onComplete = function () {
        //for (var d in this.library) {
        //    if (!xdom.library[d]) {
        //        alert("A dependency couldn't be loaded");
        //        return;
        //    }
        //}
        if (['completing', 'ready'].includes(this.status)) {
            return;
        }
        //this.updateSession();
        this.status = 'completing';
        if (on_complete && on_complete.apply) {
            on_complete.apply(self, _this_arguments);
        };
        this.status = "ready";
        this.documentElement && this.documentElement.setAttributeNS(xdom.xml.namespaces["state"], "state:refresh", "true");
        this.getStylesheets({ href: "loading.xslt" }).remove();
    }

    Object.defineProperty(this, 'library', {
        get: function () {
            _library = xdom.json.merge(xdom.data.getTransformations(this.document), _library);
            if (!_library.hasOwnProperty('clear')) {
                Object.defineProperty(_library, 'clear', {
                    value: function (forced) {
                        Object.keys(this).map((key) => {
                            _library[key] = undefined;
                            if (forced) {
                                delete xdom.library[key];
                                xdom.library.load(key);
                            }
                        });
                    },
                    writable: false, enumerable: false, configurable: false
                })
            }
            if (!_library.hasOwnProperty('load')) {
                Object.defineProperty(_library, 'load', {
                    value: async function (list) {
                        var dependencies_to_load = list || _library.filter((key, value) => !value) || [];
                        if (Object.keys(dependencies_to_load).length) {
                            await xdom.library.load(Object.keys(dependencies_to_load));
                        }
                        await Promise.all(Object.keys(_library).reduce((lib, stylesheet) => { xdom.library[stylesheet] instanceof Promise && lib.push(xdom.library[stylesheet]); return lib }, []));
                        Object.keys(dependencies_to_load).map((key) => {
                            if (key in xdom.library) {
                                _library[key] = xdom.library[key].cloneNode(true);/*(_library[key] || xdom.fetch.xml(key).then(document => {
                                _library[key] = document && document.selectFirst && document.selectFirst('xsl:stylesheet') && document;
                            }));*/
                            }
                            else if (xdom.defaults.library.hasOwnProperty(key)) {
                                return xdom.defaults.library[key].cloneNode(true);
                            }
                        });
                        const loaded_library = await Promise.all(Object.values(_library));
                        return loaded_library;
                    },
                    writable: false, enumerable: false, configurable: false
                })
            }
            if (!_library.hasOwnProperty('reload')) {
                Object.defineProperty(_library, 'reload', {
                    value: async function (list) {
                        this.clear();
                        return this.load();
                    },
                    writable: false, enumerable: false, configurable: false
                })
            }
            return _library;
        }/*, set: function (input) {
            _library = xdom.xml.Library(xdom.json.merge(xdom.data.getTransformations(this.document), _library, input));
        }*/
    })

    this.reloadDependencies = async function () {
        this.library.clear();
        await this.library.load();
        this.render(true);
    }

    Object.defineProperty(this, 'tag', {
        get: function () {
            return '#' + (_tag || xdom.data.hashTagName(__document) || __document.documentElement && (__document.documentElement.getAttribute("x:tag") || __document.documentElement.getAttribute("x:id") || __document.documentElement.localName.toLowerCase())).split(/^#/).pop();
        }
    })

    Object.defineProperty(this, 'hash', {
        get: function () {
            return '#' + xdom.data.coalesce(_hash, __document.documentElement && xdom.data.coalesce(__document.documentElement.getAttribute("x:hash"), __document.documentElement.getAttribute("x:tag"), __document.documentElement.localName.toLowerCase()), _tag).split(/^#/).pop();
        },
        set: function (input) {
            if (__document.documentElement) {
                __document.documentElement.setAttributeNS(xdom.xml.namespaces["x"], "x:hash", input);
            }
            _hash = input;
            xdom.dom.updateHash(_hash);
        }
    })

    Object.defineProperty(this, 'initiator', {
        get: function () {
            return _initiator;
        },
        set: function (input) {
            _initiator = input;
        }
    })

    Object.defineProperty(this, 'isActive', {
        get: function () {
            return this === xdom.data.document || (xdom.state.active_tags.includes(self.tag) || !!document.querySelector(`[xo-source="${this.tag}"]`)) && !((xdom.state.stores[xdom.state.active] || {})["deactivate_tags"] || []).includes(self.tag);
        },
        set: function (input) {
            if (xdom.session.status != 'authorized') {
                return;
            }
            if (!input) {
                xdom.state.update({ active_tags: (history.state.active_tags || []).filter(value => value != self.tag) });
            } else {
                xdom.state.update({ active_tags: [...new Set((history.state.active_tags || []).concat(self.tag))] });
            }
        }
    });

    Object.defineProperty(this, 'rendering', {
        get: function () {
            return _rendering;
        },
        set: function (input) {
            _rendering = input;
        }
    });

    Object.defineProperty(this, 'store', {
        get: function () {
            return this;
        }
    });

    Object.defineProperty(this, 'node', {
        get: function () {
            return __document.node
        }
    });

    Object.defineProperty(this, 'document', {
        get: function () {
            /*if (xdom.session.status != 'authorized') {
                let __login_document = xdom.defaults["#login"]
                __login_document.store = this;
                return __login_document;
            } else */if (!__document) {
                __document = (__document || xdom.xml.createDocument(""));
            }
            __document.store = this;
            return __document;
        },
        set: function (input) {
            __document = input;
            if (typeof (input) == 'string') {
                __document = xdom.xml.createDocument(input)
            }
            if (__document.documentElement) {
                __document.documentElement.setAttributeNS(xdom.xml.namespaces["x"], "x:tag", (this.tag.replace(/^#/, '') || ""));
                __document.documentElement.setAttributeNS(xdom.xml.namespaces["state"], "state:refresh", "true");
            }
            __document.store = this;
            xdom.data.stores[this.tag] = this;
            this.reseed();
            //this.rendering = false;
        }
    })

    Object.defineProperty(this, 'snapshots', {
        get: function () {
            return _undo;
        }
    });

    Object.defineProperty(this, 'findById', {
        value: function (xid) {
            return __document.selectSingleNode('//*[@x:id="' + xid + '"]')
        }
    });

    Object.defineProperty(this, 'takeSnapshot', {
        value: function () {
            _undo.push(xdom.xml.clone(__document));
            _redo = [];
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'undo', {
        value: function () {
            let snapshot = _undo.pop();
            if (snapshot) {
                _redo.unshift(xdom.xml.clone(__document));
                __document = snapshot;
                __document.store = this;
                //xdom.dom.refresh({ trigger_bindings: false })
                this.render(true);
            }
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'redo', {
        value: function () {
            let snapshot = _redo.shift();
            if (snapshot) {
                _undo.push(xdom.xml.clone(__document));
                __document = snapshot;
                __document.store = this;
                //xdom.dom.refresh({ trigger_bindings: false })
                this.render(true);
            }
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'transform', {
        value: function (stylesheet) {
            return new Promise(resolve => {
                return resolve(xdom.xml.transform(__document, stylesheet));
            })
        },
        writable: false, enumerable: false, configurable: false
    });

    //Object.defineProperty(this, 'updateSession', {
    //    value: function () {
    //        xdom.library["xdom/resources/session.xslt"].selectNodes(`//xsl:copy/xsl:attribute[starts-with(@name,"session:")]`).map(attribute => {
    //            let attribute_name = attribute.getAttribute("name");
    //            if (!__document.documentElement) {
    //                null; // do nothing
    //            } else if (!__document.documentElement.getAttribute(attribute_name)) {
    //                __document.documentElement.setAttributeNS(xdom.xml.namespaces["session"], attribute_name, attribute.textContent.replace(/[\s]+$/, ''));
    //            } else {
    //                __document.documentElement.setAttribute(attribute_name, attribute.textContent.replace(/[\s]+$/, ''));
    //            }
    //        });
    //        ((__document.documentElement || document.createElement("p")).selectAll('@session:*[not(local-name()="init" or local-name()="status")]') || []).map(attr => {
    //            xdom.session.setAttribute(attr.name, attr.value);
    //        });
    //    },
    //    writable: false, enumerable: false, configurable: false
    //});
    Object.defineProperty(this, 'triggerBindings', {
        value: async function () {
            var context = this;
            if (!(context.isActive)) {
                return;
            }
            if (!(!(((xdom.manifest.server || {}).endpoints || {}).login && !(xdom.session.status == 'authorized')) && context && typeof (context.selectSingleNode) != 'undefined' && (context.selectSingleNode('.//@source:*|.//request:*|.//source:*') || context.getStylesheets().filter(stylesheet => stylesheet.role == 'binding').length))) {
                return; //*** Revisar si en vez de salir, revisar todo el documento
            }
            //if (!context.selectSingleNode('//@source:*') || context.selectSingleNode('.//@request:*[local-name()!="init"]')) {
            //    return;
            //}
            let new_bindings = 0;
            let bindings = [].concat(
                [((context.documentElement || context).selectSingleNode("ancestor-or-self::*[@transforms:bindings]/@transforms:bindings") || {}).value],
                context.getStylesheets().filter(stylesheet => stylesheet.role == "binding").map(function (stylesheet) {
                    if ((stylesheet.document || window.document.createElement('p')).selectFirst('//xsl:copy[not(xsl:apply-templates) and not(comment()="ack:no-apply-templates")]')) {
                        console.warn('In a binding stylesheet a xsl:copy withow a xsl:apply-templates may cause an infinite loop. If missing xsl:apply-templates was intentional, please add an acknowledge comment <!--ack:no-apply-templates-->');
                    };
                    return stylesheet.href
                })
                , (xdom.manifest.getConfig(xdom.data.hashTagName(context), 'transforms') || []).filter(transform => transform.role == "binding").map(transform => transform.href)
                , ["xdom/resources/databind.xslt"]);
            bindings = [...new Set(bindings)];
            //let original = xdom.xml.clone(context); //Se obtiene el original si se quieren comparar cambios
            let cloned_document = context.document.cloneNode(true);
            cloned_document.store = context;
            let some_changed = false;
            var changed = cloned_document.selectAll("//@changed:*");

            var stylesheets = [];
            do {
                changed && changed.remove();
                for (let stylesheet of bindings) {
                    if (stylesheet) {
                        if (!stylesheets.find(doc => doc.selectSingleNode(`//xsl:import[@href="${stylesheet}"]|//xsl:import[@href="${stylesheet}"]|//comment()[contains(.,'=== Imported from "${stylesheet}" ===')]`))) {
                            let xsl_doc = context.library[stylesheet] || xdom.library[stylesheet] || stylesheet;
                            stylesheets.push(xsl_doc);
                            cloned_document = xdom.xml.transform(cloned_document, xsl_doc);
                            cloned_document.store = context;
                        }
                    }
                }
                changed = cloned_document.selectAll("//@changed:*");
                some_changed = (some_changed || !!changed.length);
            } while (context && changed.length && ++new_bindings <= 15)
            //if (some_changed) { //se quita esta validación porque los bindings podrían estar modificando el documento sin marcar un cambio con changed:*
            __document = cloned_document; // context.document = cloned_document; TODO: Revisar si es necesario hacer la asignación por medio de la propiedad .document
            //}

            //context = xdom.data.applyTransforms(context, ["xdom/resources/databind_cleanup.xslt"]);

            /* Con este código se detectan cambios. Pero es muy costoso*/
            //let differences = xdom.xml.compare(context, original, true)
            //differences.selectAll('//c:change[@c:type!="Node"]').map(change => {
            //    let changes = change ? [...context.selectFirst(`//*[@x:id="${change.getAttribute("x:id")}"]`).attributes].filter(attribute => (attribute.prefix != 'xmlns' && change.getAttribute(attribute.name) != attribute.value)) : [];
            //    changes.map(attribute => {
            //        original.store = context.store;
            //        original.selectFirst(`//*[@x:id="${attribute.ownerElement.getAttribute("x:id")}"]`).setAttribute(attribute.name, attribute.value, false);
            //    });
            //})

            if (!context) return;
            var requests = context.selectNodes('.//source:*[not(@state:disabled="true") and not(*)]|.//request:*[not(@state:disabled="true") and not(*)]');
            if (new_bindings) {
                xdom.data.history.saveState();
            }
            //if (context.documentElement) {
            //    xdom.data.document = context;
            //}
            var tag = context.store.tag;
            requests = requests.filter(req => !(xdom.data.binding.requests[tag] && xdom.data.binding.requests[tag].hasOwnProperty(req.nodeType == 1 ? req.getAttribute("command") : req.value)));
            if (requests.length) {
                for (var b = 0; b < requests.length; b++) {
                    var node = requests[b]//xdom.xml.createDocument((attribute.ownerElement || attribute).selectSingleNode('ancestor-or-self::*[not(contains(namespace-uri(), "http://panax.io/xdom"))][1]')).documentElement;
                    var node_id = node.getAttribute("x:id");
                    var attribute = node.tagName;
                    var attribute_base_name = (node.baseName || node.localName)
                    var command = node.getAttribute("command");
                    command = command.replace(/^[\s\n]+|[\s\n]+$/g, "");
                    //var request_id = node.getAttribute("x:id") + "::" + command.replace(/^\w+:/, '');
                    //node.setAttribute("requesting:" + attribute_base_name, 'true')
                    //if (command && (node && !command.match("{{") /*&& !(xdom.xhr.Requests[node.getAttribute("x:id") + "::" + command])*/ && !node.selectSingleNode(attribute.name + '[@for="' + command + '"]'))) {
                    if (!(command || '').match("{{") && !(xdom.data.binding.requests[tag] && xdom.data.binding.requests[tag][command])) {
                        console.log("Binding " + command);

                        //let [request_with_fields, ...predicate] = command.split(/=>|&filters=/);
                        //let [fields, request] = comnd.match('(?:(.*)~>)?(.+)');
                        var rest = command;
                        var [rest, predicate = ''] = rest.split("=>");
                        var [fields, request] = rest.indexOf("~>") != -1 && rest.split("~>") || ["*", rest];
                        //let [, fields, request, predicate = ''] = command.match('(?:(.*)~>|^)?((?:(?<!=>).)+)(?:=>(.+))?$');
                        xdom.data.binding.requests[tag] = (xdom.data.binding.requests[tag] || {});
                        xdom.data.binding.requests[tag][command] = (xdom.data.binding.requests[tag][command] || xdom.fetch.from(`${xdom.manifest.server.endpoints.request}?command=${escape(request)}&filters=${escape(predicate) || ''}`, {
                            method: 'GET'
                            , headers: {
                                "Cache-Response": (xdom.data.coalesce(eval(node.getAttribute("cache" + ":" + (attribute_base_name))), eval(node.parentElement.getAttribute("cache" + ":" + (attribute_base_name))), false))
                                , "Accept": content_type.xml
                                , "cache-control": 'force-cache'
                                , "pragram": 'force-cache'
                                , "x-source-tag": tag
                                , "x-original-request": command
                                , "Root-Node": node.prefix.replace(/^request$/, "source") + ":" + attribute_base_name
                                , "X-Detect-Missing-Variables": "false"
                                , "x-data-text": (node.getAttribute('source_text:' + attribute_base_name) || node.getAttribute('dataText') || "")
                                , "x-data-value": (node.getAttribute('source_value:' + attribute_base_name) || node.getAttribute('dataValue') || "")//TODO: quitar dataText y dataValue (sin namespace)
                                , "x-data-fields": (node.getAttribute('source_fields:' + attribute_base_name) || fields || "")
                                , "x-data-predicate": (node.getAttribute('source_filters:' + attribute_base_name) || predicate || "")
                            }
                        }).then(([response, request]) => {
                            var response_is_message = !!response.documentElement.selectSingleNode('self::x:message');
                            let original_request = request.headers.get("x-original-request");
                            let root_node = request.headers.get("root-node");
                            let tag = request.headers.get("x-source-tag");
                            if (!response_is_message && !response.selectSingleNode(`//${root_node}`)) {
                                let new_node = xdom.xml.createDocument(`<${root_node} xmlns:source="http://panax.io/xdom/binding/source"/>`);
                                new_node.documentElement.appendChild(response.documentElement);
                                response.appendChild(new_node.documentElement);
                            }
                            //response.documentElement.setAttribute("command", original_request)
                            response = xdom.xml.reseed(response);
                            xdom.data.stores[tag].selectNodes(`//source:*[@command="${original_request}"]`).map((targetNode, index, array) => {
                                if (response.getStylesheets && response.getStylesheets().length == 1) { /*Por lo pronto sólo entrará para los errores y si tiene un solo stylesheet*/
                                    var result = xdom.xml.transform(response);
                                    if (result.documentElement && result.documentElement.namespaceURI.indexOf("http://www.w3.org") != -1) {
                                        window.document.querySelector(response.getStylesheets()[0].target || "body").appendChild(result.documentElement);
                                    }
                                    response.getStylesheets().remove();
                                }
                                let new_node = xdom.xml.createDocument(response);
                                let fragment = document.createDocumentFragment();
                                if (response.documentElement.tagName == targetNode.tagName || ["http://www.mozilla.org/TransforMiix"].includes(response.documentElement.namespaceURI)) {
                                    fragment.append(...new_node.documentElement.childNodes);
                                } else {
                                    fragment.append(...new_node.childNodes);
                                }

                                if (response.documentElement.selectSingleNode(`x:r[@x:value="${targetNode.parentNode.getAttribute("prev:value")}"]`)) {
                                    targetNode.parentElement.setAttribute("x:value", targetNode.parentElement.getAttribute("prev:value"))
                                }
                                if (array.length > xdom.data.binding["max_subscribers"]) {
                                    targetNode.parentElement.appendChild(xdom.data.createMessage("Load truncated").documentElement);
                                    console.warn("Too many requests may create a big document. Place binding in a common place.")
                                } else if (fragment.childNodes.length) {
                                    targetNode.append(fragment);
                                    //if (response_is_message) {
                                    //    targetNode.appendChild(response.documentElement);
                                    //} else {
                                    //    let new_node = xdom.xml.createDocument(response);
                                    //    targetNode.selectNodes('@*').map(attr => {
                                    //        new_node.documentElement.setAttribute(attr.name, attr.value, false)
                                    //    });
                                    //    targetNode.parentElement.replaceChild(new_node.documentElement, targetNode);
                                    //}
                                } else {
                                    targetNode.append(xdom.data.Store(`<x:empty xmlns:x="http://panax.io/xdom"/>`).documentElement);
                                }
                            });
                            delete xdom.data.binding.requests[tag][original_request];
                            //xdom.delay(50).then(() => {
                            xdom.data.stores[tag].render(true);
                            //});
                        }).catch(error => {
                            console.log(error)
                        })
                        )
                    }
                }
                xdom.data.binding.updateSources();
            }
        },
        writable: false, enumerable: false, configurable: false
    });

    var _delay, _resolved = false, _searching_parent = false;
    Object.defineProperty(this, 'render', {
        value: async function (forced, options) {
            var _options = (options || {});
            var tag = this.tag;
            if (__document.documentElement && (forced || xdom.state.active == this.tag && !document.querySelector(`[xo-source="${this.tag}"]`))) {
                __document.documentElement.setAttributeNS(xdom.xml.namespaces["state"], "state:refresh", "true");
            }
            try {
                if (this.state.rendering && !_resolved) {
                    if (document.querySelector(`[xo-source='${tag}']`)) {
                        return true;
                    } else {
                        return this.state.rendering;
                    }
                }
                this.state.rendering = xdom.delay(xdom.data.coalesce(_options["delay"], 1)).then(async () => {
                    _format_query_selector = function (el) { return `${el.tagName}[` + [...el.attributes].filter(attr => ["href", "src"].includes(attr.name)).reduce((str, attr) => { str = `${attr.name}="${attr.value}" `; return str; }, '') + `]` }
                    _resolved = false;
                    await this.library.load();
                    this.triggerBindings(this);
                    let refresh = __document.selectAll('//@state:refresh[.="true"]')
                    if (!(this.isActive && refresh.length)) {
                        return;
                    }
                    if (xdom.debug['render']) {
                        console.log('Rendering ' + tag);
                    }
                    var dom;
                    var data = __document.cloneNode(true);
                    //if (data.selectFirst(`processing-instruction('xml-stylesheet')[contains(.,'role="login"') and contains(.,'target="body"')]`)) {
                    //    data.selectAll('//comment()').remove();
                    //    data.selectAll(`processing-instruction('xml-stylesheet')[not(contains(.,'role="login"'))]`).remove()
                    //}
                    if ("loading.xslt" in xdom.library && (self.state.submitting || self.state.busy)) {
                        data.addStylesheet({ type: "text/xsl", href: "loading.xslt", target: "#shell main", action: "append" });
                    }
                    data.selectAll('//x:r[position()>600 and @x:value!=../../@x:value]').remove();
                    var stylesheets = data.getStylesheets()
                    if (!stylesheets.length) {
                        stylesheets.push({
                            href: "shell.xslt"
                            , target: "body"
                            , role: "shell"
                        });
                    }

                    var target = undefined;
                    var stylesheet_target = undefined;
                    /*Render parent*/
                    for (let stylesheet of stylesheets.filter(stylesheet => stylesheet.role != "init" && stylesheet.role != "binding")) {
                        stylesheet_target = (stylesheet.target || stylesheet_target);
                        target = document.querySelector(stylesheet_target);
                        //if (stylesheets.filter(stylesheet => stylesheet.role == 'login').length && stylesheet.role != 'login') {
                        //    continue;
                        //}
                        let parent;
                        ((stylesheet_target || '').match(/#[^\s]+/) || []).filter(id => {
                            return id != tag && xdom.data.stores[`${id}`];
                        }).map(async id => {
                            parent = xdom.data.stores[`${id}`];
                        });
                        if (parent) {
                            if (!document.querySelector(stylesheet_target.replace(RegExp(parent.tag), `[xo-source='${parent.tag}']`)) || parent.selectFirst('//@state:refresh[.="true"]')) {
                                if (!_searching_parent) {
                                    _searching_parent = true;
                                    parent.isActive = true;
                                    await parent.render(!target && (!document.querySelector(`[xo-source='${parent.tag}']`) || document.querySelector(`[xo-source='${parent.tag}'][role='login']`)));
                                    _searching_parent = false;
                                }
                            }
                        } else if (!target && !document.querySelector(`[xo-source]`) && xdom.dom.shell !== this) {
                            xdom.dom.shell && await xdom.dom.shell.render(true);
                        }
                    }
                    if (!self.isActive) {
                        return;
                    }
                    refresh.remove();
                    xdom.dom.saveState();

                    var dependants = [];

                    for (let stylesheet of stylesheets.filter(stylesheet => stylesheet.role != "init" && stylesheet.role != "binding")) {
                        var action = (stylesheet.action || !stylesheet.target ? "append" : action);

                        stylesheet_target = (stylesheet.target || stylesheet_target);
                        if (!stylesheet.href) {
                            console.warn(`There's a missing href in a processing-instruction`)
                        }
                        dom = xdom.xml.transform(data, (this.library[stylesheet.href] || xdom.library[stylesheet.href] || !(document.querySelector(`[xo-source]`)) && (xdom.defaults.library[stylesheet.href] || xdom.defaults.library["shell.xslt"]) || xdom.defaults.library[stylesheet.href] || stylesheet.href));
                        if (!(dom && dom.documentElement)) { continue; }
                        if (((dom.documentElement || {}).namespaceURI || "").indexOf("http://www.mozilla.org/TransforMiix") != -1) {
                            data.selectAll(`processing-instruction('xml-stylesheet')`).remove();
                            if (!this.library[stylesheet.href]) {
                                dom = xdom.xml.transform(data, (xdom.library[stylesheet.href] || xdom.defaults.library[stylesheet.href] || xdom.defaults.library["shell.xslt"]));
                            } else {
                                dom = xdom.xml.transform(data, this.library[stylesheet.href]);
                            }
                        }
                        let disconnected_elements = dom.querySelectorAll('[xo-target=""]');
                        if (disconnected_elements.length) {
                            console.warn(`There are ${disconnected_elements.length} disconnected element${disconnected_elements.length > 1 ? 's' : ''}`)
                        }
                        if (!(dom.documentElement.namespaceURI && dom.documentElement.namespaceURI.indexOf("http://www.w3.org") != -1)) {
                            data = dom;
                        }
                        var styles;
                        //if (xdom.library["styles.xslt"]) {
                        //    styles = xdom.xml.transform(xdom.data.document, xdom.library["styles.xslt"]);
                        //}
                        xdom.dom.appendFirst(dom, styles);
                        target = document.querySelector(stylesheet_target);
                        //}
                        dom.documentElement.id = (dom.documentElement.id || tag.replace(/^#/, '').replace(/[^\w]/g, '_'))
                        dependants = [...document.querySelectorAll(`[xo-source="${this.tag}"] *[xo-source]`)].filter(el => {
                            return el.getAttribute("xo-source") != tag
                        });
                        let target_query = ((stylesheet_target || '').match(/[^\s]+/g) || []).reduce((new_target, el) => { new_target.push(document.querySelector(`[xo-source='${el}']`) && `[xo-source='${el}']` || el); return new_target; }, []).join(" ");
                        target = document.querySelector(target_query);
                        if (target && [target.getAttribute("xo-source") || target.id].includes(tag) && dom.documentElement.namespaceURI.indexOf("http://www.w3.org") != -1) {
                            action = 'replace';
                        }
                        var scripts_external = xdom.xml.createDocument(dom).selectNodes('//*[local-name()="script" or local-name()="link"][(@src or @href) and not(text())]');
                        dom.selectNodes(`//*[local-name()="script" or local-name()="link"][(@src or @href) and not(text())]`).remove();
                        var scripts = xdom.xml.createDocument(dom).selectNodes('//*[local-name()="script"][text()]');
                        if (!target) {
                            if (xdom.debug.enabled) {
                                if (stylesheet_target) {
                                    throw (`No existe la ubicación "${stylesheet_target}"`);
                                }
                            }
                            self.isActive = false;
                            continue;
                        } else if (dom.documentElement.tagName.toLowerCase() == "html") {
                            //dom.documentElement.namespaceURI == "http://www.w3.org/1999/xhtml"
                            //target = document.body;
                            xdom.dom.setEncryption(dom, 'UTF-7');
                            let iframe;
                            if (document.activeElement.tagName.toLowerCase() == 'iframe') {
                                iframe = document.activeElement;
                                target = document.activeElement.contentDocument.querySelector('main,table,div,span');
                                target.parentElement.replaceChild(dom.querySelector(target.tagName.toLowerCase()), target);
                                //if ((dom.documentElement || dom).selectNodes) { //(dom.documentElement instanceof XMLDocument) {
                                //    xdom.dom.applyScripts(document.activeElement.contentDocument, dom);
                                //}
                            } else {
                                xdom.dom.clear(target);
                                if (target.tagName.toLowerCase() == "iframe") {
                                    iframe = target;
                                } else {
                                    iframe = document.createElement('iframe');
                                    //iframe.width = "100%"
                                    //iframe.height = "1000"
                                    if (stylesheet.role) {
                                        iframe.setAttribute("role", stylesheet.role);
                                    }
                                    iframe.setAttribute("xo-source", tag);
                                    iframe.setAttribute("xo-stylesheet", stylesheet.href);
                                    iframe.style.backgroundColor = 'white';
                                    iframe = target.appendChild(iframe);
                                    iframe.addEventListener('focusout', xdom.listeners.dom.onfocusout);
                                    iframe.addEventListener('change', xdom.listeners.dom.onchange);
                                }
                                //var js = '';
                                //var scripts = xdom.xml.createDocument(dom).selectNodes('//*[local-name()="script"][@src and not(text())]');
                                //for (var s in scripts) {
                                //    var script = scripts[s];
                                //
                                //    var inner_script='                                                      \
                                //    var eScript = document.createElement("script");                         \
                                //    eScript.type = "text/javascript";                                       \
                                //    eScript.onload = function () {                                          \
                                //        console.log("Script is loaded");                                    \
                                //    };                                                                      \
                                //    eScript.src = "'+script.getAttribute("src")+'";                         \
                                //    try {                                                                   \
                                //        document.querySelector("head").appendChild(eScript);                \
                                //    } catch (e) {                                                           \
                                //        console.warn(e.message);                                            \
                                //    }                                                                       \
                                //    '
                                //    js = js + '; ' + inner_script
                                //}
                                //
                                //var scripts = xdom.xml.createDocument(dom).selectNodes('//*[local-name()="script"][text()]');
                                //for (var s in scripts) {
                                //    var script = scripts[s];
                                //    if (!script.getAttribute("src") && script.textContent) {
                                //        js = js + ';' + Encoder.htmlDecode(script.textContent); //Cuando el método de output es html, algunas /entidades /se pueden codificar. Si el output es xml las envía corregidas
                                //    }
                                //}

                                var url = xdom.dom.getGeneratedPageURL({
                                    html: Encoder.htmlDecode((dom.documentElement || dom).outerHTML),
                                    css: (dom.querySelector('style') || {}).innerHTML,
                                    js: `var xdom = (xdom || parent.xdom); document.xdom_global_refresh_disabled=true; let iframe=parent.document.querySelector('iframe'); iframe.height=document.querySelector('body').scrollHeight+10; iframe.width=document.querySelector('body').scrollWidth+10; xdom.modernize(iframe.contentWindow); document.querySelector('body').setAttribute("xo-source", '${tag}');` //+ js//((dom.querySelector('script') || {}).innerHTML || "")
                                    //window.top.document.querySelector('body').setAttribute("xo-source", window.top.location.hash)
                                });
                                iframe.src = url;
                            }

                        } else if (!(dom.documentElement.namespaceURI && dom.documentElement.namespaceURI.indexOf("http://www.w3.org") != -1)) {
                            //if (!xdom.library.reloaded) {
                            //    xdom.library.reload();
                            //    xdom.library.reloaded = true;
                            //} else {
                            var xsl = xdom.xml.createDocument(`
                <xsl:stylesheet version="1.0"                                                                           
                    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"                                                    
                    xmlns="http://www.w3.org/1999/xhtml">                                                               
                    <xsl:output method="xml" indent="no" />                                                             
                    <xsl:template match="node()">                                                                       
                    <div class="jumbotron">                                                                             
                        <div class= "container text-center" style="padding-top:30pt; padding-bottom:30pt;">             
                            <h2 class="text-center">Parece que la versión que usas ha cambiado o contiene errores en este módulo. Por favor actualiza tus librerías o repórtalo con el administrador.</h2>    
                            <br/><button type="button" class="btn btn-primary btn-lg text-center" onclick="xdom.data.document.library.reload()">Actualizar librerías</button>                               
                            <br/><br/><button type="button" class="btn btn-primary btn-lg text-center" onclick="xdom.session.saveSession()">Reportar</button>                                    
                        </div>                                                                                          
                    </div>                                                                                              
                    </xsl:template>                                                                                     
                    <xsl:template match="text()|processing-instruction()|comment()"/>                                   
                </xsl:stylesheet>`);
                            var dom = xdom.xml.transform(dom, xsl);
                            target = document.querySelector('main') || document.querySelector('body')
                            if (stylesheet.action == "replace") {
                                xdom.data.replace(target, dom);
                            } else {
                                xdom.dom.clear(target);
                                xdom.dom.appendChild(target, dom);
                            }
                            //}
                        } else {
                            (dom.documentElement || dom).setAttribute("xo-source", tag);
                            (dom.documentElement || dom).setAttribute("xo-stylesheet", stylesheet.href);
                            if (stylesheet.role) {
                                (dom.documentElement || dom).setAttribute("role", stylesheet.role);
                            }
                            //var children_tags = [...target.querySelectorAll(`[xo-source]`)].reduce((array, store) => { store!==self && array.push(store.getAttribute("xo-source")); return array; }, []);
                            //children_tags = history.state.deactivate_tags.concat(children_tags);
                            if (action == "replace") {
                                xdom.data.replace(target, (dom.documentElement || dom));
                            } else if (action == "append") {
                                targetElement = target.queryChildren(`[xo-source='${tag}'][xo-stylesheet='${stylesheet.href}']`)[0];
                                if (targetElement) {
                                    targetElement.replace(dom);
                                } else {
                                    target.append(dom.documentElement || dom);
                                }
                            } else {
                                xdom.dom.clear(target);
                                xdom.dom.appendChild(target, dom);
                            }

                            if (xdom.data.document == self) {
                                let children_tags = history.state.active_tags.filter((tag) => !document.querySelector(`[xo-source='${tag}']`));
                                children_tags = children_tags.filter((tag) => !target.querySelector(`[xo-source='${tag}']`));
                                xdom.state.update({ hash: self.hash, stores: new Object().push(self.tag, { deactivate_tags: children_tags }) });
                            }


                            var lines = document.querySelectorAll(".leader-line")
                            for (var l = 0; l < lines.length; ++l) {
                                lines[l].remove();
                            }
                            if ((dom.documentElement || dom).selectNodes) { //(dom.documentElement instanceof XMLDocument) {
                                xdom.dom.applyScripts(document, dom);
                            }
                        }
                    };
                    xdom.data.stores.detectActive();
                    if (!dom) {
                        [...document.querySelectorAll(`[xo-source='${tag}']`)].map(el => el.remove());
                        return;
                    } //Esta situación puede darse cuando no se encontró una transformación o esta regresa un documento inválido
                    dependants = [...dom.querySelectorAll(`[xo-source='${this.tag}'] *[xo-source]`), ...dependants];
                    distinct_dependencies = {};
                    dependants.map(function (el) {
                        distinct_dependencies[el.getAttribute("xo-source")] = el;
                    })
                    let promises = [];
                    Object.entries(distinct_dependencies).map(async ([tag, el]) => {
                        let dependant = xdom.data.stores[tag];
                        //dependant.isActive = true;
                        el.classList.add("working");
                        if (dependant) {
                            promises.push(dependant.render(true));
                        } else if (xdom.manifest.sources[tag]) {
                            xdom.manifest.sources[tag] && xdom.manifest.sources[tag].fetch().then(() => {
                                let dependant = xdom.data.stores[tag];
                                if (dependant && dependant.render) {
                                    promises.push(dependant.render(true));
                                }
                            })
                        }
                    });
                    await Promise.all(promises).then(async () => {
                        // TODO: Ver si se puede reemplazar por xdom.dom.applyScripts
                        for (var s in scripts_external) {
                            var tag = scripts_external[s];
                            var current_tag = target.ownerDocument.querySelector(_format_query_selector(tag))
                            if (current_tag && (tag.getAttributeNode("defer") || tag.getAttributeNode("async"))) { /*Cuando el nodo tenga el atributo "defer" o async se va a borrar la etiqueta y se va a volver a poner para que se vuelva a ejecutar el código. Un caso claro, es en el botón de google, que se tiene que volver a ejecutar para que se muestre el botón.*/
                                current_tag.remove();
                                current_tag = target.ownerDocument.querySelector(_format_query_selector(tag));
                            }
                            if (!current_tag) {
                                var new_element = target.ownerDocument.createElement(tag.tagName);
                                [...tag.attributes].map(attr => new_element.setAttribute(attr.name, attr.value));
                                target.ownerDocument.head.appendChild(new_element);
                            }

                        }

                        /*ejecución de scripts internos*/
                        for (var s in scripts) {
                            var script = scripts[s];
                            if (!script.getAttribute("src") && script.textContent) {
                                script.textContent = Encoder.htmlDecode(script.textContent); //Cuando el método de output es html, algunas /entidades /se pueden codificar. Si el output es xml las envía corregidas
                                if (script.hasAttribute("defer") || script.hasAttribute("async")) {
                                    target.appendChild(script);
                                } else {
                                    eval(script.textContent);
                                }
                            }
                        }
                        /*TODO: Mover este código a algún script diferido*/
                        [...(target && target.ownerDocument.querySelectorAll('[data-bs-toggle="tooltip"]') || [])].map(function (tooltipTriggerEl) {
                            return new bootstrap.Tooltip(tooltipTriggerEl)
                        })
                        //this.rendering = false;
                        xdom.dom.restoreState();
                        window.top.dispatchEvent(new CustomEvent('domLoaded', { detail: { target: dom, initiator: this } }));
                        //await xdom.listeners.dom.onLoad(this);
                        //this.rendering = false;
                        //
                    });
                    return promises;
                }).finally(() => {
                    self.state.rendering = undefined;
                    _resolved = true;
                    _searching_parent = false;
                    if (this.isActive && __document.selectFirst('//@state:refresh[.="true"]')) {
                        this.render();
                    }
                    if (this != xdom.data.document && !document.querySelector(`[xo-source='${xdom.data.document.tag}']`)) {
                        xdom.data.document.render();
                    }
                    //if (this == xdom.data.stores[history.state.hash] && document.querySelector(`[xo-source='${this.tag}']`)) {
                    //}
                    //if (xdom.session.status != 'authorized' && this != xdom.data.stores["#login"]) {
                    //    xdom.data.stores["#login"].render(true);
                    //}
                });
                return this.state.rendering;
            } catch (e) {
                return this.state.rendering;
            }
        },
        writable: true, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'submit', {
        value: async function (settings) {
            //if (!await xdom.session.checkStatus()) { /*Se deshabilita porque el chequeo actualiza session y obliga un render. Revisar si se puede hacer sin disparar esto (Probablemente no se inicializaron todas las variables de sesión con las que están en la base de datos*/
            //    return;
            //}
            self = this;
            await self.library.load();
            //if (arguments.length == 1 && arguments[0].constructor === {}.constructor) {
            //    settings = arguments[0];
            //} else if (arguments.length == 1 && typeof arguments[0] == 'string') {
            //    var uid = arguments[0];
            //    xdom.data.document = xdom.xml.transform(xdom.data.document, xdom.library["xdom/resources/normalize_namespaces.xslt"]);
            //    data = xdom.data.document.selectSingleNode('//*[@x:id="' + uid + '"]');
            //}
            //data = (data.documentElement || data);
            data = xdom.xml.createDocument(__document).documentElement;
            this.prepareData = function (data) {
                if (settings["prepareData"] && settings["prepareData"].apply) {
                    settings["prepareData"].apply(this, [data])
                };
                return data;
            }

            var settings = (settings || {});
            var xhr_settings = xdom.json.merge({ headers: { "Accept": 'text/xml', "Content-Type": 'text/xml' } }, (xhr_settings || settings["xhr"]));

            self.state.submitting = true;
            await self.render(true);
            //for (var datarow of datarows) {
            //    datarow.setAttribute("@state:submitting", "true");
            //}
            //var onsuccess = (xhr_settings["onSuccess"] || function () { });
            if (data) {
                this.prepareData(data);

                data.setAttributes({
                    "session:user_id": (data.getAttribute("session:user_id") || xdom.session.getUserId())
                    , "session:user_login": (data.getAttribute("session:user_login") || xdom.session.getUserLogin())
                    , "session:status": (xdom.session.getUserLogin() ? "authorized" : "unauthorized")
                });

                var target = data.selectSingleNode('//*[@x:reference]')
                var datarows = data.selectNodes('px:data/px:dataRow');

                if (target && data.selectSingleNode('px:data/px:dataRow[not(@identity)]')) {
                    for (var xDocument in xdom.data.stores) {
                        source = xdom.data.stores[xDocument].selectSingleNode('//*[@x:id="' + target.getAttribute('x:reference') + '"]');
                        if (!source || (window.top || window).location.hash == xDocument) { continue; }
                        for (var dr in datarows) {
                            var datarow = datarows[dr];
                            var target = xdom.data.find(datarow, source);
                            if (target) {
                                xdom.data.replace(target, datarow);
                            } else if (source.selectSingleNode('self::px:dataRow')) {
                                xdom.dom.insertAfter(datarow, source);
                            } else if (!source.selectSingleNode('px:data')) {
                                source.appendChild(datarow.parentNode);
                            }
                            else {
                                source.selectSingleNode('px:data').appendChild(datarow);
                            }
                        }
                        xdom.data.document = source.ownerDocument;
                        xdom.dom.refresh();
                        //window.history.back();
                        return
                    }
                    if (confirm("¿Desea guardar el registro en este momento?")) {
                        xdom.data.remove(target.selectSingleNode('@x:reference'));
                    } else {
                        return;
                    }
                    //xdom.dom.navigateTo("#proveedor:edit");
                }

                var submit_data;
                if (data.getAttribute("transforms:submit")) {
                    submit_data = xdom.xml.transform(data.ownerDocument, data.getAttribute("transforms:submit"));
                }
                var payload = xdom.xml.createDocument('<x:post xmlns:x="http://panax.io/xdom"><x:source>' + xdom.xml.toString(data) + '</x:source>' + (submit_data ? '<x:submit>' + xdom.xml.toString(submit_data) + '</x:submit>' : '') + '</x:post>');
                return await xdom.post.to(xdom.manifest.server["endpoints"]["post"], payload, xhr_settings).then(([document, request, response]) => {
                    let content_type = response.headers.get("content-type");

                    //var results = response.value;
                    //if (onsuccess && onsuccess.apply) {
                    //    onsuccess.apply(this, arguments);
                    //}
                    if (content_type.indexOf('json') != -1 || content_type.indexOf('javascript') != -1) {
                        results = document;
                        if (results && results.message) {
                            alert(results.message);
                        }
                        //console.log(document);
                        ////xdom.data.update(data.getAttribute("x:id"), "@x:trid", results.recordSet[0][""]);
                    }
                    else if (content_type.indexOf('xml') != -1) {
                        if (document.getStylesheets && document.getStylesheets().length == 1) { /*Por lo pronto sólo entrará para los errores y si tiene un solo stylesheet*/
                            var result = xdom.xml.transform(document);
                            if (result.documentElement && result.documentElement.namespaceURI.indexOf("http://www.w3.org") != -1) {
                                window.document.querySelector(document.getStylesheets()[0].target || "body").appendChild(result.documentElement);
                                appended = true;
                            }
                        } else if (document.selectAll("//@statusMessage").length) {
                            document.selectAll("//@statusMessage").map(message => xdom.messages.alert(message.value))
                        }
                        //else {
                        //    //for (var datarow of datarows) {
                        //    //    datarow.setAttribute("@state:submitting", undefined, false);
                        //    //}
                        //    __document.documentElement.setAttribute("state:submitted", "true");
                        //    window.history.back();
                        //}
                        ////if (document.documentElement && document.documentElement.selectSingleNode('/x:message')) {
                        ////    if (!(this.subscribers)) {
                        ////        (xdom.dom.findClosestDataNode(Request.srcElement) || xdom.data.document.documentElement).appendChild(document.documentElement);
                        ////        xdom.dom.refresh({ after: function () { return null; } });
                        ////    } else {
                        ////        var target = xdom.data.document;
                        ////        if (target) {
                        ////            target.documentElement.appendChild(document.documentElement);
                        ////        } else {
                        ////            console.warn(Response.responseXML)
                        ////        }
                        ////    }
                        ////}
                    }

                    //if (results && results.message) {
                    //    alert(results.message);
                    //}
                    ////xdom.data.update(data.getAttribute("x:id"), "@state:submitted", "true", false);
                    try {
                        window.top.dispatchEvent(new CustomEvent('submitSuccess', { detail: { srcStore: this, response: response } }));
                    } catch (e) {
                        console.warn(e)
                    }
                    return [document, request, response];
                }).catch(([document, request, response]) => {
                    if (response.status == 304) {
                        alert("No hay cambios");
                    }
                    else if (document.contentType.indexOf('xml') != -1) {
                        if (!response.appended && document.getStylesheets && document.getStylesheets().length == 1) { /*Por lo pronto sólo entrará para los errores y si tiene un solo stylesheet*/
                            var result = xdom.xml.transform(document);
                            if (result.documentElement && result.documentElement.namespaceURI.indexOf("http://www.w3.org") != -1) {
                                window.document.querySelector(document.getStylesheets()[0].target || "body").appendChild(result.documentElement);
                                appended = true;
                            }
                        }
                        //if (Response.document.documentElement.selectSingleNode('/x:message')) {
                        //    if (!(this.subscribers)) {
                        //        (xdom.dom.findClosestDataNode(Request.srcElement) || xdom.data.document.documentElement).appendChild(Response.responseXML.documentElement);
                        //        xdom.dom.refresh({ after: function () { return null; } });
                        //    } else {
                        //        var target = xdom.data.document;
                        //        if (target) {
                        //            target.documentElement.appendChild(Response.document.documentElement);
                        //        } else {
                        //            console.warn(Response.document)
                        //        }
                        //    }
                        //}
                    } else if (response.status != 401) {
                        alert("No se pudo guardar la información, intente de nuevo");
                    }
                    return [document, request, response];
                }).finally(() => {
                    self.state.submitting = undefined;
                    self.state.busy = undefined;
                    //xdom.data.update(data.getAttribute("x:id"), "@state:submitting", "false");
                    for (var datarow of datarows) {
                        datarow.setAttribute("@state:submitting", undefined, false);
                    }
                    self.render(true);
                });
            }
        },
        writable: true, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'refreshLibrary', {
        value: function (refresh_rate) {
            var a = 0;
            if (this.Check) window.clearInterval(this.Check);
            if (arguments.length != 0) {
                if (typeof (arguments[a]) == 'boolean') {
                    if (arguments[a++] == false) {
                        return false;
                    }
                }
                if (typeof (arguments[a]) == "number") {
                    refresh_rate = arguments[a++];
                }
                if (typeof (arguments[a]) == "string" || typeof (arguments[a]) == "object") {
                    document_name_or_array = arguments[a++];
                }
            }

            //xdom.storage.disable();
            refresh_rate = (refresh_rate || 3);
            refresh_rate = (refresh_rate * 1000);
            let that = this;
            var refresh = function () {
                window.console.info('Checking for changes in documents...');
                that.library = undefined;
                that.render();
            };

            this.Check = setInterval(refresh, refresh_rate);
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'find', {
        value: function (reference) {
            var ref = reference;
            if (typeof (reference) == "string") {
                ref = this.document.selectSingleNode('//*[@x:id="' + reference + '" ]')
                if (!ref) {
                    ref = this.document.selectSingleNode(reference)
                }
            }
            if (!ref) return;
            var exists = false;
            var return_value;
            if (this.document.contains(ref) || ref.nodeType == 2 && this.document.contains(ref.selectSingleNode('..'))) {
                return ref;
            }
            if (ref.nodeType == 2) {
                return this.document.selectSingleNode('//*[@x:id="' + (ref.ownerElement || document.createElement('p')).getAttribute("x:id") + '"]/@' + ref.name);
            } else {
                return (this.document.selectSingleNode('//*[@x:id="' + (ref.documentElement || ref || document.createElement('p')).getAttribute("x:id") + '"]')); // || xdom.data.document.selectSingleNode(xdom.xml.getXpath(ref))
            }
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'reseed', {
        value: function () {
            var start_date = new Date();
            let data = __document;
            let xsl = xdom.xml.createDocument(`
    <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:x="http://panax.io/xdom">
	    <xsl:key name="xid" match="*" use="@x:id" />
	    <xsl:template match="*|processing-instruction()|comment()">
		    <xsl:copy>
			    <xsl:copy-of select="@*[not(name()='x:id')]"/>
			    <xsl:apply-templates/>
		    </xsl:copy>
	    </xsl:template>
	    <xsl:template match="*[count(key('xid',@x:id)[1] | .)=1]">
		    <xsl:copy>
			    <xsl:copy-of select="@*"/>
			    <xsl:apply-templates/>
		    </xsl:copy>
	    </xsl:template>
    </xsl:stylesheet>
    `); // removes duplicate xids
            data = xdom.xml.transform(data, xsl);
            if (((arguments || {}).callee || {}).caller === this.reseed || !(data && data.selectSingleNode('/*') && data.selectSingleNode('//*[not(@x:id)]'))) {
                return data;
            }

            data = xdom.xml.reseed(data);
            __document = data;

            this.reseed();
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'toString', {
        get: function () {
            return function () {
                return xdom.xml.toString(this.document);
            };
        }
    });

    Object.defineProperty(this, 'normalizeNamespaces', {
        value: function () {
            this.document = xdom.xml.normalizeNamespaces(this.document);
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'contains', {
        value: function (ref) {
            return this.document.contains(ref);
        },
        writable: false, enumerable: false, configurable: false
    });

    Object.defineProperty(this, 'documentElement', {
        get: function () {
            return this.document.documentElement;
        }
    });

    Object.defineProperty(this, 'selectFirst', {
        get: function () {
            return this.document.selectFirst;
        }
    });

    Object.defineProperty(this, 'selectAll', {
        get: function () {
            return this.document.selectAll;
        }
    });

    Object.defineProperty(this, 'selectSingleNode', {
        get: function () {
            return this.document.selectSingleNode;
        }
    });

    Object.defineProperty(this, 'selectNodes', {
        get: function () {
            return this.document.selectNodes;
        }
    });

    Object.defineProperty(this, 'evaluate', {
        get: function () {
            return this.document.evaluate;
        }
    });

    Object.defineProperty(this, 'toClipboard', {
        get: function () {
            return this.document.toClipboard;
        }
    });

    Object.defineProperty(this, 'addStylesheet', {
        get: function () {
            return this.document.addStylesheet;
        }
    });

    Object.defineProperty(this, 'getStylesheet', {
        get: function () {
            return this.document.getStylesheet;
        }
    });

    Object.defineProperty(this, 'getStylesheets', {
        get: function () {
            return this.document.getStylesheets;
        }
    });

    Object.defineProperty(this, 'createProcessingInstruction', {
        get: function () {
            return function () {
                return this.document.createProcessingInstruction;
            };
        }
    });

    Object.defineProperty(this, 'insertBefore', {
        get: function () {
            return function () {
                return this.document.insertBefore;
            };
        }
    });

    Object.defineProperty(this, 'firstElementChild', {
        get: function () {
            return function () {
                return this.document.firstElementChild;
            };
        }
    });

    Object.defineProperty(this, 'initialize', {
        value: async function () {
            //__document.documentElement && Object.entries(xdom.manifest.modules || {}).filter(([key, value]) => !(key.match(/^#/)) && value["transforms"] && _manifest_filter_xpath(key)).reduce((stylesheet, [key, value]) => { return value["transforms"] }, []).map(stylesheet => __document.addStylesheet(stylesheet));

            (xdom.manifest.getConfig(this.tag, 'transforms') || []).reverse().filter(transform => !this.selectFirst(`comment()[.="Initialized by ${transform.href}"]`)).map(transform => {
                transform = __document.addStylesheet(transform);
            });
            let inti_stylesheets = this.getStylesheets({ role: "init" });
            //await this.library.load(inti_stylesheets.reduce((hrefs, stylesheet) => { hrefs[stylesheet.href] = undefined; return hrefs }, {}));
            await this.library.load();
            inti_stylesheets.map(stylesheet => {
                this.getStylesheet(stylesheet.href).replaceBy(__document.createComment('Initialized by ' + stylesheet.href));
                let new_document = xdom.xml.transform(__document, this.library[stylesheet.href]);
                if ((((new_document.documentElement || {}).namespaceURI || '').indexOf("http://www.w3.org") == -1)) {/*La transformación no debe regresar un html ni otro documento del estándar*/
                    this.document = xdom.xml.transform(__document, this.library[stylesheet.href]);
                } else {
                    delete stylesheet["role"];
                    __document.addStylesheet(stylesheet);
                    console.warn("Initial transformation shouldn't yield and html or any other document from the w3 standard.");
                }
            });
            window.top.dispatchEvent(new CustomEvent('storeLoaded', { detail: { store: this } }));
            //xdom.listeners.xml.onLoad(this);
        },
        writable: false, enumerable: false, configurable: false
    });
    _tag = config && config["tag"] || undefined;
    _hash = config && config["hash"] || undefined;
    this.load(__document);
    return this;
}

xdom.dom.applyScripts = function (targetDocument, dom) {
    var scripts = xdom.xml.createDocument(dom).selectNodes(`//*[local-name()="script" or local-name()="link" or local-name()="meta"][(@src and @defer or @href) and not(text())]`);
    for (var s in scripts) {
        var tag = scripts[s];
        if (!targetDocument.querySelector(_format_query_selector(tag))) {
            var new_element = targetDocument.createElement(tag.tagName);
            [...tag.attributes].map(attr => new_element.setAttribute(attr.name, attr.value));

            //Chrome,Firefox, Opera, Safari 3+
            if (new_element.tagName == "script") {
                new_element.onload = function () {
                    console.log("Script is loaded");
                };
            }
            targetDocument.head.appendChild(new_element);
        }
    }
    var scripts = xdom.xml.createDocument(dom).selectNodes('//*[local-name()="script"][text()]');
    for (var s in scripts) {
        var script = scripts[s];
        if (!script.getAttribute("src") && script.textContent) {
            script.textContent = Encoder.htmlDecode(script.textContent); //Cuando el método de output es html, algunas /entidades /se pueden codificar. Si el output es xml las envía corregidas
            if (script.hasAttribute("defer") || script.hasAttribute("async")) {
                dom.documentElement.appendChild(script);
            } else {
                eval(script.textContent);
            }
        }
    }
}

xdom.xml.getAttributeParts = function (attribute) {
    let attribute_name = attribute.split(':', 2);
    var name = attribute_name.pop();
    var prefix = attribute_name.pop();
    return { "prefix": prefix, "name": name }
}

xdom.xhr.Response = function (xhr) {
    if (!(this instanceof xdom.xhr.Response)) return new xdom.xhr.Response(xhr);
    //TODO: Que el usuario pueda activar o desactivar el "escape"
    if (xhr.responseXML && xhr.responseXML.firstElementChild.namespaceURI != 'http://www.w3.org/1999/XSL/Transform' && xhr.responseText.replace(/(\>|^)[\r\n\s]+(\<|$)/ig, "$1$2").match(/\r\n/)) { /*xhr.responseXML no escapa saltos de línea cuando vienen en atributos, por eso se reemplazan por la entidad.*/
        this.responseText = xhr.responseText.replace(/(\>|^)[\r\n\s]+(\<|$)/ig, "$1$2").replace(/\r\n/ig, "&#10;");
        this.responseXML = xdom.xml.createDocument(this.responseText);
    } else {
        this.responseText = xhr.responseText;
        this.responseXML = xhr.responseXML;
    }
    var value;
    Object.defineProperty(this, 'headers', {
        get: function get() {
            var _all_headers = xhr.getAllResponseHeaders().split(/[\r\n]+/);
            _headers = {}
            for (var h in _all_headers) {
                var header = _all_headers[h].split(/\s*:\s*/);
                if (!(header.length > 1)) {
                    continue;
                }
                _headers[header.shift().toLowerCase()] = header.join(":");
            }
            return _headers;
        }
    });
    Object.defineProperty(this, 'status', {
        get: function get() {
            return xhr.status;
        }
    });
    Object.defineProperty(this, 'document', {
        get: function get() {
            switch (this.type) {
                case "xml":
                case "html":
                    return xdom.xml.createDocument(this.responseXML || this.responseText);
                    break;
                default:
                    return this.responseText;
            }
        }
    });
    Object.defineProperty(this, 'value', {
        get: function get() {
            switch (this.type) {
                case "json":
                    var json
                    try {
                        json = JSON.parse(this.responseText);
                    } catch (e) {
                        json = eval("(" + this.responseText + ")");
                    }
                    return json
                    break;
                case "xml":
                case "html":
                    return this.document;
                    break;
                case "script":
                    try {
                        var return_value;
                        eval('return_value = new function(){' + this.responseText + '\nreturn this;}()');
                        return return_value;
                    } catch (e) {
                        return null;
                    }
                default:
            }
        }
    });
    Object.defineProperty(this, 'type', {
        get: function get() {
            if ((this.headers["content-type"] || "").indexOf("json") != -1 || xdom.tools.isJSON(this.responseText)) {
                return "json";
            } else if ((this.headers["content-type"] || "").indexOf("xml") != -1 || this.responseXML && this.responseXML.documentElement || this.responseText.indexOf("<?xml ") >= 0) {
                return "xml"
            } else {
                if (this.responseText.toUpperCase().indexOf("<HTML") != -1) {
                    return "html";
                } else {
                    return "script";
                }
            }
        }
    });
    Object.defineProperty(this, 'contentType', {
        get: function get() {
            return this.headers["content-type"].split(";")[0];
        }
    });
    Object.defineProperty(this, 'charset', {
        get: function get() {
            return this.headers["content-type"].split(";")[1];
        }
    });
    switch (this.type) {
        case "json":
            Object.defineProperty(this, 'json', {
                get: function get() {
                    var json
                    try {
                        json = JSON.parse(this.responseText);
                    } catch (e) {
                        json = eval("(" + this.responseText + ")");
                    }
                    return json;
                }
            });
            break;
        case "script":
            Object.defineProperty(this, 'object', {
                get: function get() {
                    try {
                        var return_value;
                        eval('return_value = new function(){' + this.responseText + '\nreturn this;}()');
                        return return_value;
                    } catch (e) {
                        return null;
                    }
                }
            });
        default:
    }
    return this;
}

xdom.post = {}
xdom.post.to = async function (request, data, options) {
    var url, req;
    var body = data;
    if (req instanceof Request) {
        req = request;
    } else {
        if (request.constructor == {}.constructor) {
            url = new URL(request["url"], location.origin + location.pathname);
            params = new URLSearchParams(xdom.json.merge(request["parameters"], request["params"]));
            [...params.entries()].map(([key, value]) => url.searchParams.set(key, value));
        } else {
            url = new URL(request, location.origin + location.pathname);
        }
        let fileExtension = url.pathname.substring(url.pathname.lastIndexOf('.') + 1);
        var _options = (options || {});
        _options["headers"] = (_options["headers"] || {});
        _options["headers"]["Accept"] = (_options["headers"]["Accept"] || (xdom.mimeTypes[fileExtension] || '*/*') + ', */*')

        var _options = xdom.json.merge({
            method: (_options["method"] || 'POST')
            , body: body
            , credentials: 'include'
        }
            , _options
            , {
                headers: new Headers(xdom.json.merge({
                }, _options["headers"]))
            }
        )
        req = new Request(url, _options);
    }

    let current_hash = (window.top || window).location.hash; //Guardamos el hash, para que en caso de que alguno de los pasos siguientes lo cambie, podamos restaurarlo
    var srcElement = event && event.target;
    if (srcElement instanceof HTMLElement) {
        let initiator_button = srcElement.closest('button, .btn')
        initiator_button && initiator_button.classList.add("working");
        req.initiator = event && event.target && event.target.store;
    }
    if (req.initiator) {
        req.initiator.state.busy = true;
    }
    var original_response;
    try {
        original_response = await fetch(req.clone());
    } catch (e) {
        try {
            if (!original_response) {
                const body = await req.clone().text();
                const { cache, credentials, headers, integrity, mode, redirect, referrer } = req;
                const init = { body, cache, credentials, headers, integrity, mode, redirect, referrer };
                original_response = await fetch(req.url, init);
            }
        } catch (e) {
            console.log(e);
            return Promise.reject([e, req, { bodyType: 'text' }]);
        }
    }
    let res = original_response.clone()
    if (req.initiator) {
        window.document.querySelectorAll(`[xo-source="${req.initiator.tag}"] .working`).forEach(el => el.classList.remove('working'));
        req.initiator.state.busy = undefined;
    }
    if ((window.top || window).location.hash == '' && (window.top || window).location.hash != current_hash) {
        window.history.back();
    }

    var document = undefined;
    let contentType = (res.headers.get('Content-Type') || '');
    var responseText;
    if (contentType.toLowerCase().indexOf("iso-8859-1") != -1) {
        await res.arrayBuffer().then(buffer => {
            let decoder = new TextDecoder("iso-8859-1");
            let text = decoder.decode(buffer);
            responseText = text;
            document = text;
        }).catch(error => Promise.reject(error));
    } else {
        if (contentType.toLowerCase().indexOf("manifest") != -1) {
            //await res.json().then(json => document = json);
            await res.text().then(text => document = text);
            responseText = document;
            document = eval(`(${document})`);
        } else if (contentType.toLowerCase().indexOf("json") != -1) {
            await res.json().then(json => document = json);
            responseText = JSON.stringify(document);
        } else {
            await res.text().then(text => document = text);
            responseText = document;
        }
    }

    Object.defineProperty(original_response, 'responseText', {
        get: function () {
            return responseText;
        }
    });

    Object.defineProperty(original_response, 'url', {
        get: function () {
            return _url;
        }
    });

    Object.defineProperty(original_response, 'bodyType', {
        get: function () {
            if (contentType.toLowerCase().indexOf("json") != -1 && document.constructor !== {}.constructor || xdom.tools.isJSON(document)) {
                return "json";
            } else if (contentType.toLowerCase().indexOf("xml") != -1 || contentType.toLowerCase().indexOf("xsl") != -1 || contentType.toLowerCase().indexOf("<?xml ") != -1) {
                return "xml"
            } else {
                return "text";
            }
        }
    });

    switch (original_response.bodyType) {
        case "xml":
            document = xdom.xml.createDocument(document);
            break;
        case "json":
            try {
                document = eval(`(${document})`);
            } catch (e) {
                document = eval(`(${JSON.stringify(document)})`)
            }
            if (req.headers.get('Content-Type').toLowerCase().indexOf("xml") != -1) {
                try {
                    document = xdom.json.toXML(document);
                    original_response.bodyType = 'xml';
                } catch (e) {
                    console.warn(e);
                }
            }
            break;
    }
    var appended = false;
    if (res.status == 401) {
        xdom.session.updateSession({ "status": "unauthorized" });
    }
    if (res.status >= 200 && res.status < 400) {
        if (res.status == 204) {
            return Promise.resolve('El servidor terminó sin regresar resultados');
        }
    } else if ((req.headers.get("Accept") || "").indexOf('xml') != -1 && !(document || {}).documentElement) {
        document = xdom.xml.createDocument(`<x:message xmlns:x="http://panax.io/xdom" x:id="xhr_message_${Math.random()}" type="server_error"/>`);

        switch (res.status) {
            case 0: /*Cuando se aborta una consulta regresa 0*/
                break;
            case 404:
                document.documentElement.textContent = (res.statusText || "File not found")
                //document = null;
                //throw (`{"404":"File not found"}`);
                break;
            case 401:
                document.documentElement.setAttribute("scope", "login")
                document.documentElement.textContent = (document.documentElement.textContent || res.statusText || "Por favor inicie sesión");
                //_onException.apply(element, [element.Response, element]);
                //element.onException.apply(element, [element.Response, element]);
                break;
            case 503:
            case 500:
                document.documentElement.textContent = (res.statusText || "Server error");
                //_onException.apply(element, [element.Response, element]);
                //element.onException.apply(element, [element.Response, element]);
                break;
            default:
                document.documentElement.textContent = res.statusText
                //_onException.apply(element, [element.Response, element]);
                //element.onException.apply(element, [element.Response, element]);
                break;
        }
    }
    else if (document.getStylesheets && document.getStylesheets().length == 1) { /*Por lo pronto sólo entrará para los errores y si tiene un solo stylesheet*/
        var result = xdom.xml.transform(document);
        if (result.documentElement && result.documentElement.namespaceURI.indexOf("http://www.w3.org") != -1) {
            window.document.querySelector(document.getStylesheets()[0].target || "body").appendChild(result.documentElement);
            appended = true;
        }
    }
    //let return_value = document
    //let [return_value, req] = await xdom.fetch.from(_url, _options, on_success);
    Object.defineProperty(original_response, 'appended', {
        get: function () {
            return appended;
        }
    });

    if (document instanceof Document) {
        Object.defineProperty(document, 'url', {
            get: function () {
                return _url;
            }
        });
    }

    if (res.status >= 200 && res.status < 400) {
        return Promise.resolve([document, req, original_response]);
    } else {
        return Promise.reject([document, req, original_response]);
    }

    /*Con fetch*/
    //var _options = (_options || {});
    //var body = new URLSearchParams(data);
    //var _options = xdom.json.merge({
    //    method: (_options["method"] || 'POST')
    //    , body: body
    //    , credentials: 'include' /*Estaba comentado*/
    //}
    //    , _options
    //    , {
    //        headers: new Headers(xdom.json.merge({
    //            //"Content-type": 'multipart/form-data'
    //            //"Accept": "application/json"
    //            //, "X-Detect-Output-Variables": "false"
    //        }, _options["headers"]))
    //    }
    //)

    //let [return_value, req] = await xdom.fetch.from(_url, _options, on_success);
    //return return_value;


    //let current_hash = (window.top || window).location.hash; //Guardamos el hash, para que en caso de que alguno de los pasos siguientes lo cambie, podamos restaurarlo
    //const req = new Request(_url, _options);
    //if (xdom.xhr.Requests[_url]) {
    //    return xdom.xhr.Requests[_url];
    //}
    //xdom.xhr.Requests[_url] = fetch(req);
    //xdom.xhr.Requests[_url].then(async res => {
    //    var return_value;
    //    let contentType = res.headers.get('Content-Type');
    //    if (contentType.toLowerCase().indexOf("iso-8859-1") != -1) {
    //        try {
    //            let buffer = await res.arrayBuffer();
    //            let decoder = new TextDecoder("iso-8859-1");
    //            let text = decoder.decode(buffer);
    //            return_value = text;
    //            if (contentType.toLowerCase().indexOf("json") != -1) {
    //                return_value = JSON.parse(return_value);
    //            }
    //        } catch (e) {
    //            Promise.reject(e);
    //        }
    //    } else {
    //        if (contentType.toLowerCase().indexOf("json") != -1) {
    //            await res.json().then(json => return_value = json);
    //        } else {
    //            await res.text().then(text => return_value = text);
    //        }
    //    }
    //    if ((window.top || window).location.hash == '' && (window.top || window).location.hash != current_hash) {
    //        window.history.back();
    //    }
    //    if (res.status === 404) {
    //        return Promise.reject('error 404')
    //    }
    //    delete xdom.xhr.Requests[_url];
    //    return return_value;
    //}).catch(e => new Promise.reject(e.message));
    //return xdom.xhr.Requests[url];
    ////} catch (error) {
    ////    console.error(error);
    ////}
}

xdom.fetch.Response = function (xhr) {
    if (!(this instanceof xdom.fetch.Response)) return new xdom.fetch.Response(xhr);
    //TODO: Que el usuario pueda activar o desactivar el "escape"
    if (xhr.responseXML && xhr.responseXML.firstElementChild.namespaceURI != 'http://www.w3.org/1999/XSL/Transform' && xhr.responseText.replace(/(\>|^)[\r\n\s]+(\<|$)/ig, "$1$2").match(/\r\n/)) { /*xhr.responseXML no escapa saltos de línea cuando vienen en atributos, por eso se reemplazan por la entidad.*/
        this.responseText = xhr.responseText.replace(/(\>|^)[\r\n\s]+(\<|$)/ig, "$1$2").replace(/\r\n/ig, "&#10;");
        this.responseXML = xdom.xml.createDocument(this.responseText);
    } else {
        this.responseText = xhr.responseText;
        this.responseXML = xhr.responseXML;
    }
    var value;
    Object.defineProperty(this, 'headers', {
        get: function get() {
            var _all_headers = xhr.getAllResponseHeaders().split(/[\r\n]+/);
            _headers = {}
            for (var h in _all_headers) {
                var header = _all_headers[h].split(/\s*:\s*/);
                if (!(header.length > 1)) {
                    continue;
                }
                _headers[header.shift().toLowerCase()] = header.join(":");
            }
            return _headers;
        }
    });
    Object.defineProperty(this, 'status', {
        get: function get() {
            return xhr.status;
        }
    });
    Object.defineProperty(this, 'document', {
        get: function get() {
            switch (this.type) {
                case "xml":
                case "html":
                    return xdom.xml.createDocument(this.responseXML || this.responseText);
                    break;
                default:
                    return this.responseText;
            }
        }
    });
    Object.defineProperty(this, 'value', {
        get: function get() {
            switch (this.type) {
                case "json":
                    var json
                    try {
                        json = JSON.parse(this.responseText);
                    } catch (e) {
                        json = eval("(${ this.responseText })");
                    }
                    return json
                    break;
                case "xml":
                case "html":
                    return this.document;
                    break;
                case "script":
                    try {
                        var return_value;
                        eval('return_value = new function(){' + this.responseText + '\nreturn this;}()');
                        return return_value;
                    } catch (e) {
                        return null;
                    }
                default:
            }
        }
    });
    Object.defineProperty(this, 'type', {
        get: function get() {
            if ((this.headers["content-type"] || "").indexOf("json") != -1 || xdom.tools.isJSON(this.responseText)) {
                return "json";
            } else if ((this.headers["content-type"] || "").indexOf("xml") != -1 || this.responseXML && this.responseXML.documentElement || this.responseText.indexOf("<?xml ") >= 0) {
                return "xml"
            } else {
                if (this.responseText.toUpperCase().indexOf("<HTML") != -1) {
                    return "html";
                } else {
                    return "script";
                }
            }
        }
    });
    Object.defineProperty(this, 'contentType', {
        get: function get() {
            return this.headers["content-type"].split(";")[0];
        }
    });
    Object.defineProperty(this, 'charset', {
        get: function get() {
            return this.headers["content-type"].split(";")[1];
        }
    });
    switch (this.type) {
        case "json":
            Object.defineProperty(this, 'json', {
                get: function get() {
                    var json
                    try {
                        json = JSON.parse(this.responseText);
                    } catch (e) {
                        json = eval("(" + this.responseText + ")");
                    }
                    return json;
                }
            });
            break;
        case "script":
            Object.defineProperty(this, 'object', {
                get: function get() {
                    try {
                        var return_value;
                        eval('return_value = new function(){' + this.responseText + '\nreturn this;}()');
                        return return_value;
                    } catch (e) {
                        return null;
                    }
                }
            });
        default:
    }
    return this;
}


xdom.xhr.checkStatus = function () {
    var attributes = xdom.data.document.selectNodes('//@*[namespace-uri()!="http://panax.io/xdom/xhr"]');
    if (Object.keys(xdom.xhr.Requests).length == 0) {
        xdom.data.remove(attributes);
        xdom.dom.refresh();
    }
}

xdom.xhr.Request = function (request, settings) {
    if (!(this instanceof xdom.xhr.Request)) return new xdom.xhr.Request(request, settings);
    var element = this
    var settings = (settings || {});
    this.settings = settings;
    this.xhr = null;

    var _onSuccess = function () {
        //if (this.subscribers_ARRAY.length) {
        //    for (var s = this.subscribers_ARRAY.length - 1; s >= 0; s--) {
        //        var src = this.subscribers_ARRAY.pop()
        //        this.requester = src["subscriber"]
        //        this.onSuccess.apply(this, [this.Response, this]);
        //        if (src.onSuccess && src.onSuccess.apply) {
        //            src.onSuccess.apply(src["subscriber"], [this.Response, this]);
        //        }
        //        //if (src && src.nodeType == 2 && src.namespaceURI == "http://panax.io/xdom/binding/request") {
        //        //    xdom.data.remove(src);
        //        //}
        //    }
        //} else {

        //}
        if (Object.keys((this.subscribers || {})).length) {
            for (var s in this.subscribers) {
                var src = this.subscribers[s];
                this.requester = src["subscriber"]
                this.onSuccess.apply(this, [this.Response, this]);
                if (src && src.settings && src.settings.onSuccess && src.settings.onSuccess.apply) {
                    src.settings.onSuccess.apply(src["subscriber"], [this.Response, this]);
                }
            }
        } else {
            this.onSuccess.apply(this, [this.Response, this]);
        }
    };

    var _onComplete = function () {
        delete this.srcElement.xhr;
        /*onComplete will do a final chante to perform any action with the subscriber even if it doesn't exist anymore in the current document. In such case it will be unsubscribed automatically*/
        if (Object.keys((this.subscribers || {})).length) {
            for (var s in this.subscribers) {
                var src = this.subscribers[s];
                this.requester = src["subscriber"]
                this.onComplete.apply(this, [this.Response, this]);
                if (src && src.settings && src.settings.onComplete && src.settings.onComplete.apply) {
                    src.settings.onComplete.apply(src["subscriber"], [this.Response, this]);
                }
                //if (src["subscriber"] && !(xdom.data.find(this.requester))) {
                //    this.unsubscribe(src);
                //}
            }
        } else {
            this.onComplete.apply(this, [this.Response, this.xhr]);
        }
    };

    var _onAbort = function () {
        if (Object.keys((this.subscribers || {})).length) {
            for (var s in this.subscribers) {
                var src = this.subscribers[s];
                this.requester = src["subscriber"]
                this.onAbort.apply(this, [this.Response, this]);
                if (src.onAbort && src.onAbort.apply) {
                    src.onAbort.apply(src["subscriber"], [this.Response, this]);
                }
            }
        } else {
            this.onAbort.apply(this, [this.Response, this.xhr]);
        }
    };

    var _onFail = function () {

    };

    var _onException = function () {
        if (this.xhr.status == 401) {
            //xdom.session.setUserId(null);
            xdom.session.updateSession({ "status": "unauthorized" });
            if (!xdom.session.retrying && xdom.session.getUserLogin() == "guest") {
                xdom.session.retrying = true;
                xdom.session.login(xdom.session.getUserLogin());
                this.send(this.payload);
                xdom.delay(500).then(() => {
                    xdom.session.retrying = undefined
                });
            }
            xdom.dom.refresh();
        }
        if (this.xhr.status == 304) {
            alert("No hay cambios");
        }
        console.error((this.Response.json || {}).message || this.responseStatus[1] || this.xhr.responseText);
    };

    var _Subscriber = function (subscriber, id, settings) {
        Object.defineProperty(this, 'subscriber', {
            value: subscriber,
            writable: true, enumerable: false, configurable: false
        });
        Object.defineProperty(this, 'id', {
            value: id,
            writable: true, enumerable: false, configurable: false
        });
        Object.defineProperty(this, 'settings', {
            value: settings,
            writable: true, enumerable: false, configurable: false
        });
    }

    this.srcElement = (settings["srcElement"] || (event || {}).srcElement || {});
    this.src = settings["src"];
    this.subscribers = (settings["subscribers"] || {});
    this.target = (settings["target"] || {})
    this.request = request;
    this.headers = (settings["headers"] || {})
    this.method = (settings["method"] || "GET");
    this.contentType = settings["contentType"];
    this.argumentSeparator = (settings["argumentSeparator"] || "&");
    this.url = (settings["url"] || "");
    this.urlQuery = (settings["urlQuery"] || "");
    this.encodeURIString = (settings["encodeURIString"] !== undefined ? settings["encodeURIString"] : true);
    this.parameters = (settings["parameters"] || new Object());
    this.async = (settings["async"] !== undefined ? settings["async"] : true);
    this.request_id = xdom.data.coalesce(settings["request_id"]);
    if (this.advise) element.advise.removeNode(true);
    this.advise = null;

    this.resetData = function () {
        this.url = (this.settings["url"] || "");
        this.status = 'initialized';
        this.responseStatus = new Array(2);
        this.document = undefined;
        this.Response = {};
        this.Request = this;
    };

    this.getResultType = function () { return (element.xmlDocument ? 'xml' : (element.htmlDocument ? 'html' : (element.script ? 'script' : undefined))) }

    var _onSubscribe = function (subscription) {
        if (subscription && subscription.onSubscribe && subscription.onSubscribe.apply) {
            subscription.onSubscribe.apply(subscription["subscriber"], [this.Response, this]);
        }
    };

    this.subscribe = function (subscriber, settings) {
        if (!subscriber) return false;
        var s
        if (subscriber.constructor === {}.constructor) { //is an object
            s = new _Subscriber(subscriber, subscriber.id, settings);
        } else if (typeof (subscriber.selectSingleNode) != 'undefined') { //is a node or an attribute
            if (subscriber.nodeType == 2) {
                s = new _Subscriber(subscriber, (subscriber.ownerElement || document.createElement('p')).getAttribute("x:id") + '/@' + subscriber.name, settings)
            } else {
                s = new _Subscriber(subscriber, (subscriber || document.createElement('p')).getAttribute("x:id"), settings);
            }
        }
        this.subscribers[s.id] = s;
        _onSubscribe(this.subscribers[s.id]);
        return this.subscribers[s.id];
    }

    var _onUnsubscribe = function (subscription) {
        if (subscription && subscription.onUnsubscribe && subscription.onUnsubscribe.apply) {
            subscription.onUnsubscribe.apply(subscription["subscriber"], [this.Response, this]);
        }
    };

    this.unsubscribe = function (subscription) {
        if (!subscription) return false;
        var id;
        if (subscription instanceof _Subscriber) {
            id = subscription["id"];
        } else {
            if (subscription.constructor === {}.constructor) { //is an object
                id = subscription["id"];
            } else if (typeof (subscription.selectSingleNode) != 'undefined') { //is a node or an attribute
                id = (subscription.ownerElement || document.createElement('p')).getAttribute("x:id") + '/@' + subscription.name;
            }
        }
        _onUnsubscribe(this.subscribers[id]);
        delete this.subscribers[id];
    }

    //var updateSubscribers = function () {
    //    if (Object.keys((element.subscribers || {})).length) {
    //        for (var s in element.subscribers) {
    //            var src = element.subscribers[s];
    //            var requester = xdom.data.find(src["subscriber"]);
    //            var subscriberNode = requester.ownerElement;
    //            if (subscriberNode) {
    //                subscriberNode.setAttribute(requester.prefix.replace(/^request$/, "requesting") + ":" + (requester.baseName || requester.localName),'true');
    //                xdom.dom.refresh();
    //            }
    //            //if (src["subscriber"] && !(xdom.data.find(this.requester))) {
    //            //    this.unsubscribe(src);
    //            //}
    //        }
    //    }
    //}

    this.abort = function () {
        if (this.xhr) {
            this.xhr.abort();
        }
    }

    this.onLoading = function () { };
    this.onLoaded = function () { };
    this.onInteractive = function () { };
    this.onComplete = (settings.onComplete || function () { });
    this.onAbort = (settings.onAbort || function () { });
    this.onSuccess = (settings.onSuccess || function () { });
    this.onException = (settings.onException || function () { });
    this.onFail = (settings.onFail || function () {
        console.warn('Server is not available: ' + this.request);
    });

    this.createXHR = function () {
        try {
            this.xhr = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e1) {
            try {
                this.xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e2) {
                this.xhr = null;
            }
        }

        if (!this.xhr) {
            if (typeof XMLHttpRequest != "undefined") {
                this.xhr = new XMLHttpRequest();
            } else {
                this.failed = true;
            }
        }
        var element = this;

        this.xhr.onabort = function () {
            this.status = 'aborted';
            _onAbort.apply(element, [element.Response, element]);
            _onComplete.apply(element, [element.Response, element]);
        }

        this.xhr.onreadystatechange = function () {
            switch (element.xhr.readyState) {
                case 1:
                    element.status = 'loading';
                    element.onLoading();
                    break;
                case 2:
                    element.status = 'loaded';
                    element.onLoaded();
                    break;
                case 3:
                    element.status = 'interactive';
                    element.onInteractive();
                    break;
                case 4:
                    element.status = 'complete';
                    element.document = this.payload;

                    var success = (element.xhr.status > 0 && element.xhr.status < 300);

                    element.Response = new xdom.xhr.Response(element.xhr);

                    //if (element.response.type == "xml") {
                    //    var stylesheets = element.response.document.selectNodes("processing-instruction('xml-stylesheet')");
                    //    for (var s = 0; s < stylesheets.length; ++s) {
                    //        stylesheet = JSON.parse('{' + (stylesheets[s].data.match(/(\w+)=(["'])([^\2]+?)\2/ig) || []).join(", ").replace(/(\w+)=(["'])([^\2]+?)\2/ig, '"$1":$2$3$2') + '}');
                    //        if (!xdom.library[stylesheet.href] && !xdom.xhr.Requests[stylesheet.href]) {
                    //            var oData = new xdom.xhr.Request(stylesheet.href);
                    //            oData.onComplete = element.onComplete;
                    //            oData.onSuccess = element.onSuccess;
                    //            oData.onException = element.onException;
                    //            oData.load();
                    //            return;
                    //        }
                    //    }
                    //}

                    if (success) {
                        if (element.xhr.status == 204) {
                            alert('El servidor terminó sin regresar resultados')
                        }
                        _onSuccess.apply(element, [element.Response, element]);
                    } else {
                        switch (element.xhr.status) {
                            case 0: /*Cuando se aborta una consulta regresa 0*/
                                break;
                            case 404:
                            case 503:
                                _onFail.apply(element, [element.Response, element]);
                                element.onFail.apply(element, [element.Response, element]);
                                break;
                            case 500:
                            case 401:
                                _onException.apply(element, [element.Response, element]);
                                element.onException.apply(element, [element.Response, element]);
                                break;
                            default:
                                _onException.apply(element, [element.Response, element]);
                                element.onException.apply(element, [element.Response, element]);
                                break;
                        }
                        element.createXHR(); //recreate xhr request
                    }

                    //element.url = "";
                    _onComplete.apply(element, [element.Response, element]);
                    break;
            }
        };
    };

    this.setParameter = function (name, value) {
        this.parameters[name] = value;//Array(value, false);
    };

    this.encParameter = function (name, value, returnparameters) {
        if (true == returnparameters) {
            return Array(Encoder.urlEncode(name), Encoder.urlEncode(value));
        } else {
            this.parameters[Encoder.urlEncode(name)] = Array(Encoder.urlEncode(value), true);
        }
    }

    this.processURLString = function (string, encode) {
        encoded = Encoder.urlEncode(this.argumentSeparator);
        regexp = new RegExp(this.argumentSeparator + "|" + encoded);
        parameterArray = string.split(regexp);
        for (var i = 0; i < parameterArray.length; i++) {
            urlParameters = parameterArray[i].split("=");
            if (true == encode) {
                this.encParameter(urlParameters[0], urlParameters[1]);
            } else {
                this.setParameter(urlParameters[0], urlParameters[1]);
            }
        }
    }

    this.createURLString = function (urlstring) {
        if (this.encodeURIString && this.url.length) {
            this.processURLString(this.url, true);
        }

        var originalURL = this.request
        var urlName = this.request.match(/(.*?)(?=\?)/);
        if (urlName == null) {
            this.url = originalURL;
        }
        else {
            this.url = urlName[0];
        }

        if (urlstring) {
            if (this.url.length) {
                this.url += this.argumentSeparator + urlstring;
            } else {
                this.url = urlstring;
            }
        }

        var m = (originalURL + "&").match(/(?:[&\?])(@?\w+)=(.*?)(?=&)/g);
        if (m == null) {
            //alert("No match");
        } else {
            var s = "Match at position " + m.index + ":\n";
            for (var i = 0; i < m.length; i++) {
                var parameterName = (m[i] + "&").replace(/(?:[&\?])(@?\w+)=(.*?)[\&\?]/g, '$1');
                var parameterValue = (m[i] + "&").replace(/(?:[&\?])(@?\w+)=(.*?)[\&\?]/g, '$2');
                // alert(m[i]+'\n'+parameterName+'\n'+parameterValue)
                this.setParameter(parameterName, parameterValue);
            }
        }

        // prevents caching of URLString
        this.setParameter("rndval", new Date().getTime());

        urlstringtemp = new Array();
        for (key in this.parameters) {
            if (this.parameters[key] && this.parameters[key].constructor === [].constructor) {
                //if (false == this.parameters[key][1] && true == this.encodeURIString) {
                //    encoded = this.encParameter(key, this.parameters[key][0], true);
                //    delete this.parameters[key];
                //    this.parameters[encoded[0]] = Array(encoded[1], true);
                //    key = encoded[0];
                //}
                urlstringtemp[urlstringtemp.length] = Encoder.urlEncode(key) + "=" + Encoder.urlEncode(this.parameters[key][0]);
            }
            else {
                urlstringtemp[urlstringtemp.length] = Encoder.urlEncode(key) + "=" + Encoder.urlEncode(this.parameters[key]);
            }
        }

        if (urlstring) {
            this.urlQuery += this.argumentSeparator + urlstringtemp.join(this.argumentSeparator);
        } else {
            this.urlQuery += urlstringtemp.join(this.argumentSeparator);
        }
    }

    this.send = function (payload) {
        this.payload = payload;
        this.load(payload);
    }

    this.post = function (payload) {
        this.method = "POST";
        this.send(payload);
    }

    this.get = async function (settings) {
        this.settings = xdom.json.merge(this.settings, settings);
        this.method = "GET";
        if (this.xhr && this.xhr.onreadystatechange && this.xhr.status > 0) {
            this.xhr.onreadystatechange();
        } else {
            this.send();
        }
    }

    this.load = async function (payload) {

        if (this.headers["Content-Type"] == "text/xml") {
            this.payload = xdom.xml.toString(payload || this.payload).replace(/[^<]*<\?xml\s[^>]+\?>[^<]*/ig, '').replace(/%/g, '%25'); //Revisar si hay que escapar más caracteres
        }
        this.resetData();
        this.createXHR();
        if (this.failed) {
            this.onFail();
        } else {
            //updateSubscribers();
            this.createURLString();
            /*if (this.id) {
                this.context = document.getElementById(this.id);
            }*/
            if (this.xhr) {
                var element = this;
                var url_post

                if (!this.payload) {
                    this.contentType = (this.headers["Content-Type"] || this.contentType || "application/x-www-form-urlencoded")
                } else if (xdom.tools.isJSON(this.payload)) {
                    this.contentType = (this.headers["Content-Type"] || this.contentType || "application/json")
                } else {
                    this.contentType = (this.headers["Content-Type"] || this.contentType || "text/xml")
                }

                if (this.payload) {
                    url_post = this.payload;
                    this.xhr.open("POST", this.url + '?' + this.urlQuery, this.async);
                    this.xhr.setRequestHeader("Content-Type", this.contentType)
                } else if (this.method.toUpperCase() == "POST") {
                    url_post = this.urlQuery;
                    //url_post=encodeURI(url_post)
                    this.xhr.open("POST", this.url, this.async);
                    this.xhr.setRequestHeader('Content-Type', this.contentType);
                } else {
                    url_post = null;
                    var totalurlstring = this.url + '?' + this.urlQuery;
                    this.xhr.open(this.method, totalurlstring, this.async);
                    this.xhr.setRequestHeader("Content-Type", this.contentType)
                    /*try {
                        
                    } catch (e) { }*/
                }
                if (xdom.debug.enabled) {
                    this.xhr.setRequestHeader("X-Debugging", xdom.debug.enabled);
                }
                var _request_headers = this.headers;
                for (var h in _request_headers) {
                    if (h == "Content-Type") continue;
                    this.xhr.setRequestHeader(h, _request_headers[h])
                }

                if (this.payload || this.method == "POST")
                    this.xhr.send(url_post);
                else
                    this.xhr.send(this.url);

                //this.xhr.upload.onprogress = p => {
                //    console.log(Math.round((p.loaded / p.total) * 100) + '%');
                //}
            }
        }
    };

    this.eval = function (Context) {
        var return_value;
        if (this.script) {
            try {
                eval('return_value = new function(){' + this.script + '\nreturn this;}()');
            } catch (e) {
                return null;
            }
            this.Response["json"] = return_value;
            return return_value;
        }
    }
}

xdom.tools.isNullOrEmpty = function (string_or_object) {
    var sValue = xdom.string.trim(xdom.data.getValue(string_or_object))
    return (sValue == '' || sValue == null || sValue == undefined);
}

xdom.json.toXML = function (json) {
    if (typeof (json) == "string") {
        json = json.replace(/\r\n/g, "")
    } else if (json.constructor == {}.constructor || json.constructor == [].constructor) {
        json = JSON.stringify(json);
    } else {
        throw ("Not a valid json");
    }
    let raw_xson = xdom.xml.createDocument(
        xdom.string.replace(
            xdom.string.replace(
                xdom.string.replace(
                    xdom.string.replace(
                        xdom.string.replace(
                            xdom.string.replace(
                                xdom.string.replace(
                                    xdom.string.replace(
                                        xdom.string.replace(
                                            xdom.string.replace(json, '\\(.)', '<e v="$1"/>', 1)
                                            , '[', '<l>')
                                        , ']', '</l>')
                                    , '{', '<o>')
                                , '}', '</v></o>')
                            , '"([^"]+?)"\\:', '</v><a>$1</a><v>', 1)
                        , '<([^v])></v>', '<$1>', 1)
                    , ',</v><a>', '</v><a>')
                , ',<o>', '<o>')
            , '<l>([^<]+)</l>', '<l><v>$1</v></l>', 1)
    );

    let reformated_xson = xdom.xml.transform(raw_xson, xdom.xml.createDocument('<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xi="http://www.w3.org/2001/XMLSchema-instance" xmlns="" xmlns:xson = "http://panax.io/xson"><xsl:template match="/"><xsl:apply-templates/></xsl:template ><xsl:template match="*|text()"><xsl:copy><xsl:copy-of select="@*"/><xsl:apply-templates/></xsl:copy ></xsl:template ><xsl:template match="o"><xsl:copy><xsl:copy-of select="@*"/><xsl:apply-templates select="text()|a"/></xsl:copy ></xsl:template ><xsl:template match="a"><xsl:copy><xsl:element name="n"><xsl:value-of select="text()"/></xsl:element ><xsl:copy-of select="@*" /><xsl:apply-templates select="following-sibling::*[1]/self::v" /></xsl:copy ></xsl:template ></xsl:stylesheet >'));

    let xson = xdom.xml.transform(reformated_xson, xdom.xml.createDocument('<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xi="http://www.w3.org/2001/XMLSchema-instance" xmlns="" xmlns:xson = "http://panax.io/xson"><xsl:variable name="invalidChars" select="\'$:/@ \'"></xsl:variable ><xsl:template match="/"><xsl:apply-templates mode="raw-to-xson"/></xsl:template ><xsl:template match="*" mode="raw-to-xson"><xsl:apply-templates mode="raw-to-xson"/></xsl:template ><xsl:template match="o|l" mode="raw-to-xson"><xsl:apply-templates mode="raw-to-xson"/></xsl:template ><xsl:template match="l/v" mode="raw-to-xson"><xsl:element name="xson:item"><xsl:apply-templates mode="raw-to-xson"/></xsl:element ></xsl:template ><xsl:template match="a" mode="raw-to-xson"><xsl:variable name="name"><xsl:choose><xsl:when test="number(translate(n,\'&quot;\',\'\'))=translate(n,\'&quot;\',\'\')"><xsl:value-of select="concat(\'@\',translate(n,\'&quot;\',\'\'))"/></xsl:when ><xsl:otherwise><xsl:value-of select="translate(translate(n,\'&quot;\',\'\'),$invalidChars,\'@@@@@\')"/></xsl:otherwise ></xsl:choose ></xsl:variable ><xsl:element name="{translate($name,\'@\',\'_\')}"><xsl:if test="contains($name,\'@\')"><xsl:attribute name="xson:originalName"><xsl:value-of select="translate(n,\'&quot;\',\'\')"/></xsl:attribute ></xsl:if><xsl:if test="l"><xsl:attribute name="xi:type">xson:array</xsl:attribute ></xsl:if><xsl:apply-templates select="*" mode="raw-to-xson" /></xsl:element ></xsl:template ><xsl:template match="text()" mode="raw-to-xson"><xsl:value-of select="."/></xsl:template ><xsl:template match="text()[starts-with(.,\'&quot;\')]" mode="raw-to-xson"><xsl:value-of select="substring(.,2,string-length(.)-2)"/></xsl:template ><xsl:template match="text()[.=\'null\']|*[.=\'\']" mode="raw-to-xson" /><xsl:template match="text()[.=\'null\']" mode="raw-to-xson"><xsl:attribute name="xi:nil">true</xsl:attribute ></xsl:template ><xsl:template match="n" mode="raw-to-xson"></xsl:template ><xsl:template match="a[v=\'true\' or v=\'false\']/n" mode="raw-to-xson"><xsl:attribute name="xi:type">boolean</xsl:attribute ></xsl:template ><xsl:template match="e" mode="raw-to-xson"><xsl:value-of select="@v"/></xsl:template ><xsl:template match="a[number(v)=v]/n" mode="raw-to-xson"><xsl:attribute name="xi:type">numeric</xsl:attribute ></xsl:template ><xsl:template match="a[starts-with(v,\'&quot;\')]/n" mode="raw-to-xson"><xsl:attribute name="xi:type">string</xsl:attribute ></xsl:template ><xsl:template match="a[l]/n" mode="raw-to-xson"><xsl:attribute name="xi:type">xson:array</xsl:attribute ></xsl:template ><xsl:template match="a[o]/n" mode="raw-to-xson"><xsl:attribute name="xi:type">xson:object</xsl:attribute ></xsl:template ><xsl:template match="o[not(preceding-sibling::n)]" mode="raw-to-xson"><xsl:element name="xson:object"><xsl:apply-templates mode="raw-to-xson"/></xsl:element ></xsl:template ><xsl:template match="l[not(preceding-sibling::n)]" mode="raw-to-xson"><xsl:element name="xson:array"><xsl:apply-templates mode="raw-to-xson"/></xsl:element ></xsl:template ></xsl:stylesheet >'));

    return xson;
}

xdom.xml.compare = function (document1, document2, stop_at_first_change) {
    let xsl_compare = xdom.xml.transform(document1, xdom.xml.createDocument(`<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:c="http://panax.io/xml/compare" version="1.0" id="panax_xml_compare_xsl"><xsl:output method="xml"></xsl:output><xsl:strip-space elements="*"></xsl:strip-space><xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz'"></xsl:variable><xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"></xsl:variable><xsl:template match="/"><xsl:element name="xsl:stylesheet"><xsl:copy-of select="//namespace::*"/><xsl:attribute name="version">1.0</xsl:attribute><xsl:element name="xsl:template"><xsl:attribute name="match">/</xsl:attribute><xsl:element name="results"><xsl:element name="xsl:apply-templates"></xsl:element></xsl:element></xsl:element><xsl:element name="xsl:template"><xsl:attribute name="match">*</xsl:attribute><xsl:element name="change" namespace="http://panax.io/xml/compare"><xsl:attribute name="c:position"><xsl:value-of select="'{count(preceding-sibling::*)+1}'"></xsl:value-of></xsl:attribute><xsl:attribute name="c:namespace"><xsl:value-of select="'{namespace-uri()}'"></xsl:value-of></xsl:attribute><xsl:attribute name="c:name"><xsl:value-of select="'{name()}'"></xsl:value-of></xsl:attribute><xsl:attribute name="c:type"><xsl:text>Node</xsl:text></xsl:attribute><xsl:element name="xsl:copy-of"><xsl:attribute name="select">@*</xsl:attribute></xsl:element><xsl:element name="xsl:apply-templates"></xsl:element></xsl:element></xsl:element><xsl:element name="xsl:template"><xsl:attribute name="match">text()</xsl:attribute><xsl:element name="change" namespace="http://panax.io/xml/compare"><xsl:attribute name="c:type"><xsl:text>Text</xsl:text></xsl:attribute><xsl:attribute name="c:position"><xsl:value-of select="'{count(preceding-sibling::*)}'"></xsl:value-of></xsl:attribute><xsl:attribute name="c:text"><xsl:value-of select="'{.}'"></xsl:value-of></xsl:attribute></xsl:element></xsl:element><xsl:apply-templates></xsl:apply-templates></xsl:element></xsl:template><xsl:template name="escape-xml"><xsl:param name="wrapper">&quot;</xsl:param><xsl:param name="text"></xsl:param><xsl:if test="$text != ''"><xsl:variable name="head" select="substring($text, 1, 1)"></xsl:variable><xsl:variable name="tail" select="substring($text, 2)"></xsl:variable><xsl:choose><xsl:when test="$head = '&amp;'">&amp;amp;</xsl:when><xsl:when test="$head = '&lt;'">&amp;lt;</xsl:when><xsl:when test="$head = '&gt;'">&amp;gt;</xsl:when><xsl:when test="$head = '&quot;'">&amp;quot;</xsl:when><xsl:when test="$wrapper=&quot;'&quot; and $head = &quot;'&quot;">&amp;apos;</xsl:when><xsl:otherwise><xsl:value-of select="$head"></xsl:value-of></xsl:otherwise></xsl:choose><xsl:call-template name="escape-xml"><xsl:with-param name="text" select="$tail"></xsl:with-param></xsl:call-template></xsl:if></xsl:template><xsl:template name="escape-quot"><xsl:param name="string"></xsl:param><xsl:variable name="quot">&quot;</xsl:variable><xsl:variable name="escaped-quot">&amp;quot;</xsl:variable><xsl:text>&quot;</xsl:text><xsl:choose><xsl:when test="contains($string, $quot)"><xsl:value-of select="substring-before($string, $quot)"></xsl:value-of><xsl:text>&quot;,'&quot;',</xsl:text><xsl:call-template name="escape-quot"><xsl:with-param name="string" select="substring-after($string, $quot)"></xsl:with-param></xsl:call-template><xsl:text>,&quot;</xsl:text></xsl:when><xsl:otherwise><xsl:value-of select="$string"></xsl:value-of></xsl:otherwise></xsl:choose><xsl:text>&quot;</xsl:text></xsl:template><xsl:template name="escape-apos"><xsl:param name="string"></xsl:param><xsl:choose><xsl:when test="contains($string, &quot;'&quot;)"><xsl:value-of select="substring-before($string, &quot;'&quot;)"></xsl:value-of><xsl:text>'</xsl:text><xsl:call-template name="escape-apos"><xsl:with-param name="string" select="substring-after($string, &quot;'&quot;)"></xsl:with-param></xsl:call-template></xsl:when><xsl:otherwise><xsl:value-of select="$string"></xsl:value-of></xsl:otherwise></xsl:choose></xsl:template><xsl:template match="*|text()"><xsl:apply-templates></xsl:apply-templates><xsl:element name="xsl:template"><xsl:attribute name="match"><xsl:apply-templates select="." mode="path"></xsl:apply-templates></xsl:attribute><xsl:element name="ok" namespace="http://panax.io/xml/compare"><xsl:attribute name="c:position"><xsl:value-of select="'{count(preceding-sibling::*)+1}'"></xsl:value-of></xsl:attribute><xsl:attribute name="c:name"><xsl:value-of select="'{name()}'"></xsl:value-of></xsl:attribute><xsl:copy-of select="@*"></xsl:copy-of><xsl:element name="xsl:apply-templates"></xsl:element></xsl:element></xsl:element></xsl:template><xsl:template match="*" mode="simple-path"><xsl:param name="position"><xsl:value-of select="count(preceding-sibling::*)+1"></xsl:value-of></xsl:param><xsl:apply-templates select="ancestor::*[1]" mode="simple-path"></xsl:apply-templates><xsl:text>/*</xsl:text><xsl:text>[</xsl:text><xsl:value-of select="$position"></xsl:value-of><xsl:text>]</xsl:text></xsl:template><xsl:template match="*" mode="path"><xsl:param name="position"><xsl:value-of select="count(preceding-sibling::*)+1"></xsl:value-of></xsl:param><xsl:apply-templates select="ancestor::*[1]" mode="simple-path"></xsl:apply-templates><xsl:text>/*</xsl:text><xsl:text>[</xsl:text><xsl:value-of select="$position"></xsl:value-of><xsl:text>]</xsl:text><xsl:text>[local-name()='</xsl:text><xsl:value-of select="local-name()"></xsl:value-of><xsl:text>']</xsl:text><xsl:text>[namespace-uri()='</xsl:text><xsl:value-of select="namespace-uri()"></xsl:value-of><xsl:text>']</xsl:text><xsl:text>[1=1 </xsl:text><xsl:for-each select="@*"><xsl:variable name="value"><xsl:text>concat('',</xsl:text><xsl:call-template name="escape-quot"><xsl:with-param name="string"><xsl:value-of select="." disable-output-escaping="yes"></xsl:value-of></xsl:with-param></xsl:call-template><xsl:text>)</xsl:text></xsl:variable><xsl:value-of select="concat(' and @',name(.),'=',$value)"></xsl:value-of></xsl:for-each><xsl:text>]</xsl:text></xsl:template><xsl:template match="text()" mode="path"><xsl:param name="position"><xsl:value-of select="count(preceding-sibling::*)+1"></xsl:value-of></xsl:param><xsl:apply-templates select="ancestor::*[1]" mode="simple-path"></xsl:apply-templates><xsl:text>/text()</xsl:text><xsl:text>[</xsl:text><xsl:value-of select="$position"></xsl:value-of><xsl:text>]</xsl:text><xsl:variable name="unescaped-value"><xsl:value-of select="." disable-output-escaping="yes"></xsl:value-of></xsl:variable><xsl:variable name="value"><xsl:text>concat('',</xsl:text><xsl:call-template name="escape-quot"><xsl:with-param name="string"><xsl:value-of select="." disable-output-escaping="yes"></xsl:value-of></xsl:with-param></xsl:call-template><xsl:text>)</xsl:text></xsl:variable><xsl:value-of select="concat(&quot;[.=&quot;,$value,&quot;]&quot;)"></xsl:value-of></xsl:template></xsl:stylesheet>`));
    if (stop_at_first_change) {
        xsl_compare.selectSingleNode('//c:change/xsl:apply-templates').remove();
    }

    let details = xdom.xml.transform(document2, xsl_compare)
    return details;
}

xdom.json.merge = function () {
    var response = (arguments[0] || {})
    for (var a = 1; a < arguments.length; a++) {
        var object = arguments[a]
        if (object && object.constructor == {}.constructor) {
            for (var key in object) {
                if (object[key] && object[key].constructor == {}.constructor) {
                    response[key] = xdom.json.merge(response[key], object[key]);
                } else {
                    response[key] = object[key];
                }
            }
        }
    }
    return response;
}

xdom.json.difference = function () {
    var response = (arguments[0] || {})
    for (var a = 1; a < arguments.length; a++) {
        var object = arguments[a]
        if (object && object.constructor == {}.constructor) {
            for (var key in object) {
                if (response.hasOwnProperty(key)) {
                    delete response[key];
                }
            }
        }
    }
    return response;
}

xdom.json.toArray = function (json) {
    var array = []
    for (var key in json) {
        array.push(json[key]);
    }
    return array;
}

xdom.json.join = function (json, settings) {
    if (!(json && json.constructor == {}.constructor)) {
        return json;
    }
    var result = []
    var settings = (settings || {});
    var equal_sign = (settings["equal_sign"] || '=');
    var separator = (settings["separator"] || ' ');
    var for_each = (settings["for_each"] || function (element, index, array) {
        var quote = (settings["quote"] !== undefined ? settings["quote"] : '"');
        var regex = new RegExp(quote, "ig");
        if (element.value && quote) {
            element.value = quote + String(element.value).replace(regex, "\\$&") + quote;
        }
        array[index] = element.key + equal_sign + element.value;
    })
    for (var key in json) {
        result.push({ "key": key, "value": json[key] });
        //result.push({ "key": key, "value": (json[key] || "DEFAULT") });
    }
    result.forEach(for_each)
    var filter_function = (settings["filter_function"] || function (value, index, arr) {
        return value !== undefined;
    })
    return result.filter(filter_function).join(separator);
}

Object.defineProperty(xdom.server, 'request', {
    value: function () {
        //if (event && event.srcElement && (event.srcElement.updated || event.srcElement.xhr)) return; //Revisar cómo implementar para varias solicitudes desde el mismo elemento
        var a = 0;
        var ajaxSettings = { async: false }
        var request, parameters, src;
        var exec = true;
        var settings;
        var payload;

        if (arguments.length == 1 && arguments[0].constructor === {}.constructor) {
            settings = arguments[0];
            request = settings["request"];
            src = settings["src"];
            payload = settings["payload"];
            exec = xdom.data.coalesce(settings["exec"], true);
            parameters = (settings["parameters"] || {});
            ajaxSettings = xdom.json.merge(ajaxSettings, (settings["xhr"] || {}));
            ajaxSettings["parameters"] = parameters;
            var on_success = (ajaxSettings["onSuccess"] || settings["onSuccess"]);
            var on_complete = (ajaxSettings["onComplete"] || settings["onComplete"]);
            var on_exception = (ajaxSettings["onException"] || settings["onException"]);
            var type = xdom.data.coalesce(ajaxSettings["type"], "table");
            var target = (ajaxSettings["target"] || (ajaxSettings["xhr"] || {})["target"]);
        } else {
            var sSQLQuery = String(arguments[a++]);
            var sParameters = ""
            if (arguments.length > 1) {
                sSQLQuery += '('
                for (; a < arguments.length; ++a) {
                    sParameters += ((sParameters.length > 0 ? ', ' : '') + (isObject(arguments[a]) ? arguments[a] : (isEmpty(arguments[a]) || String(arguments[a]) == 'null' || String(arguments[a]) == 'NaN' ? 'NULL' : (isNumericOrMoney(arguments[a]) ? arguments[a] : "'" + arguments[a] + "'"))))
                }
                sSQLQuery += sParameters
                sSQLQuery += ')';
            }
            if (!sSQLQuery.match(/\)$/g)) {
                request = sSQLQuery + '(' + sParameters + ')'
            }
        }
        ajaxSettings["method"] = ((payload ? "POST" : undefined) || ajaxSettings["method"] || "GET");

        var result;
        var url = relative_path + xdom.manifest.server["endpoints"]["request"] + '?command=' + request;
        if (event && event.srcElement && ((event.srcElement.nodeName || "").toString().toLowerCase() == 'button' || (event.srcElement.nodeName || "").toString().toLowerCase() == 'a' || (event.srcElement.className || "").toString().match(/\b(far|fas|fa)\b/))) {
            event.srcElement.classList.add("working");
        }
        src = (src || xdom.dom.findClosestDataNode((event || {}).srcElement) || xdom.data.find((src || ((xdom.dom.findClosestElementWithId((event || {}).srcElement) || {}).id || '').replace(/container_/i, ''))));

        var oData = (xdom.xhr.cache[request] || new xdom.xhr.Request(url, ajaxSettings));
        if (ajaxSettings && ajaxSettings.headers && ajaxSettings.headers["Cache-Response"]) {
            xdom.xhr.cache[request] = oData;
        }
        oData.subscribe(src);
        oData.onSuccess = function (Response, Request) {
            this.srcElement.updated = true;
            //for (var s = Request.subscribers.length - 1; s >= 0; s--) {
            //    //var src = xdom.data.find((this.src || xdom.dom.findClosestElementWithId(this.srcElement).id.replace(/container_/i, '')));
            //    var src = (Request.subscribers.pop() || {})["subscriber"]
            //    var src = xdom.data.find((src || xdom.dom.findClosestElementWithId(this.srcElement).id.replace(/container_/i, '')))
            //    if (src && src.nodeType == 2) xdom.data.remove(src);
            //}
            result = Response;
            //if (Response.status != 401 && !xdom.session.check()) {
            //    xdom.session.setUserId(undefined);
            //    xdom.session.updateSession("status", "unauthorized");
            //    //xdom.session.getUserLogin();
            //}
            if (Request.headers["Cache-Response"]) {
                xdom.xhr.cache[request] = this;
            }

            if (on_success) {
                on_success.apply(this, arguments);
            }
            if (Response.value && Response.value.message) {
                if (Response.value.status == 'exception') {
                    //if (target) {
                    //    //target = xdom.data.document.selectSingleNode('//*[@x:id="' + target.getAttribute('x:id') + '"]');
                    //    target.setAttribute("xhr:exception", Response.value.message)
                    //}
                    console.error(Response.value.message);//throw (response.message);
                    xdom.dom.refresh({ after: function () { return null; } });
                } else {
                    console.warn(Response.value.message);
                }
            }
            if (on_complete && on_complete.apply) {
                on_complete.apply(this, arguments)
            }
        }
        oData.onException = function (Response, Request) {
            result = Response;
            this.srcElement.updated = true;
            for (var s in this.subscribers) {
                var src = xdom.data.find(this.subscribers[s].subscriber);
                if (src.prefix == 'request') {
                    src.value = false
                }
                srcElement = xdom.data.coalesce(src.ownerElement, src);
                if (Response.type == "xml") {
                    if (srcElement && Response.value.documentElement) {
                        srcElement.appendChild(Response.value.documentElement)
                    }
                    xdom.data.document.reseed();
                    xdom.dom.refresh();
                }
            }

            if (on_exception) { on_exception.apply(this, arguments); }
            if (Response.status == 401) {
                xdom.data.document = (xdom.data.document || xdom.library["default.xml"].document || xdom.library["default.xml"]);
                //xdom.session.setUserId(null);
                xdom.session.updateSession({ "status": "unauthorized" });
                if (!xdom.data.document) {
                    alert(xdom.messages.unauthorized);
                    return
                }
                xdom.data.document.reseed();
                xdom.dom.refresh({ after: function () { return null; } });
            }
            else if (Response.type == "xml") {
                if (Response.responseXML.documentElement && Response.responseXML.documentElement.selectSingleNode('/x:message')) {
                    if (!(this.subscribers)) {
                        (xdom.dom.findClosestDataNode(Request.srcElement) || xdom.data.document.documentElement).appendChild(Response.responseXML.documentElement);
                        xdom.dom.refresh({ after: function () { return null; } });
                    } else {
                        var target = ((window.top || window).location.hash != "#shell" ? xdom.data.stores["#shell"] : xdom.data.document);
                        if (target) {
                            target.documentElement.appendChild(Response.responseXML.documentElement);
                        } else {
                            console.warn(Response.responseXML)
                        }
                    }
                }
            }
            else if (Response.type == "json") {
                if (Response.value.status == 'exception' || Response.value.status == 'unauthorized') {
                    console.error(Response.status + ' ' + Response.statusMessage + ': ' + Response.value.message);
                    xdom.dom.refresh({ after: function () { return null; } });
                } else {
                    console.warn(Response.value.message);
                }
            } else {
                console.error(Response.responseText);
            }
            if (on_complete && on_complete.apply) {
                on_complete.apply(this, arguments)
            }
        }
        oData.onComplete = function (Response, Request) {
            if (this.srcElement && this.srcElement.classList) {
                this.srcElement.classList.remove("working");
            }
            if (event && event.srcElement && ((event.srcElement.nodeName || "").toLowerCase() == 'button' || (event.srcElement.nodeName || "").toLowerCase() == 'a' || (event.srcElement.className || "").match(/\b(far|fas)\b/))) {
                event.srcElement.classList.remove("working");
            }
        }
        //if (ajaxSettings && ajaxSettings.headers && ajaxSettings.headers["Cache-Response"] && xdom.xhr.cache[request]) {
        //    oData.Response = xdom.xhr.cache[request].Response;
        //}
        //if (ajaxSettings.headers["Cache-Response"]) {
        //    xdom.xhr.cache[request] = oData;
        //}
        if (exec) {
            oData.load(payload);
        }
        return oData;
    },
    writable: true, enumerable: false, configurable: false
})

Object.defineProperty(xdom.server, 'request', {
    value: async function (Request) {
        if (!Request) return;
        var url, params, payload;
        var options = {};
        var onSuccess, onException, onComplete;
        var return_value, request, response;
        if (Request.constructor == {}.constructor) {
            params = new URLSearchParams(xdom.json.merge({ command: Request["request"] }, Request.parameters));
            onSuccess = Request["onSuccess"];
            onException = Request["onException"];
            onComplete = Request["onComplete"];
            payload = Request["payload"];
            delete Request["onSuccess"];
            delete Request["onException"];
            delete Request["onComplete"];
            delete Request["request"];
            delete Request["parameters"];
            delete Request["payload"];
            delete Request["type"];
            options = (Request["xhr"] || Request);
            delete options["type"];
            url = new URL(xdom.manifest.server["endpoints"]["request"], location.origin + location.pathname);
            [...params.entries()].map(([key, value]) => url.searchParams.set(key, value));
        } else if (xdom.manifest.sources[Request]) {
            let source = xdom.manifest.sources[Request]
            if (typeof (source) == 'string') {
                url = new URL(source, location.origin + location.pathname)
            } else if (source.url) {
                url = new URL(source.url, location.origin + location.pathname)
            } else if (source.request) {
                url = new URL(xdom.manifest.server["endpoints"]["request"], location.origin + location.pathname)
                let params = new URLSearchParams(source.request);
                [...params.entries()].map(([key, value]) => url.searchParams.set(key, value));
            }
            if (source.params) {
                let params = new URLSearchParams(source.params);
                [...params.entries()].map(([key, value]) => url.searchParams.set(key, value));
            }
        } else if (typeof (Request) == 'string') {
            url = new URL(xdom.manifest.server["endpoints"]["request"], location.origin + location.pathname)
            params = new URLSearchParams({ command: Request });
            [...params.entries()].map(([key, value]) => url.searchParams.set(key, value));
        }
        //if (!query.toString()) {
        //    console.error("No command");
        //    return;
        //}

        options["headers"] = (options["headers"] || {});
        options["headers"]["Accept"] = (options["headers"]["Accept"] || ("text/xml" || '*/*') + ', */*')
        options["headers"]["X-Debugging"] = xdom.debug.enabled;
        options["headers"]["X-Rebuild"] = (xdom.listeners.keys.altKey ? true : false);
        if (payload || String(options["method"]).toUpperCase() == 'POST') {
            var [return_value, request, response] = await xdom.post.to(url, payload, options);
        } else {
            var [return_value, request, response] = await xdom.fetch.from(url, options);
        }
        Object.defineProperty(response, 'type', {
            get: function () {
                return this.bodyType
            }
        })
        Object.defineProperty(response, 'document', {
            get: function () {
                return return_value;
            }
        })
        if (response.status >= 200 && response.status < 300) {
            if (onSuccess && onSuccess.call) {
                onSuccess.call(this, response, request);
            } else {
                return Promise.resolve([return_value, request, response]);
            }
        } else {
            if (onException && onException.call) {
                onException.call(this, response, request);
            } else {
                return Promise.reject([return_value, request, response]);
            }
        }
    },
    writable: true, enumerable: false, configurable: false
})


xdom.xml.getXpath = function (node) {
    var xpath = '';
    xpath = (node.firstElementChild || node).nodeName;
    if (node.parentElement) {
        xpath = xdom.xml.getXpath(node.parentElement) + '/' + xpath;
    }
    return xpath;
}

xdom.data.search = function (xpath, dataset) {
    var ref;
    var dataset = (dataset || xdom.data.document || xdom.data.Store().document)
    if (typeof (xpath) == "string") {
        ref = dataset.selectSingleNode(xpath)
    }
    return ref;
}

xdom.data.find = function (ref, dataset) {
    var dataset = (dataset || xdom.data.document || xdom.data.Store())
    dataset = (dataset.document || dataset);
    if (typeof (ref) == "string") {
        ref = dataset.selectSingleNode('//*[@x:id="' + ref + '" ]')
    }
    if (!ref) return;
    var exists = false;
    var return_value;
    if (dataset.contains(ref) || ref.nodeType == 2 && dataset.contains(ref.selectSingleNode('..'))) {
        return ref;
    }
    if (ref.nodeType == 2) {
        return dataset.selectSingleNode('//*[@x:id="' + (ref.ownerElement || document.createElement('p')).getAttribute("x:id") + '"]/@' + ref.name);
    } else {
        return (dataset.selectSingleNode('//*[@x:id="' + (ref.documentElement || ref || document.createElement('p')).getAttribute("x:id") + '"]') || xdom.data.document.selectSingleNode(xdom.xml.getXpath(ref)));
    }
}

xdom.data.deepFind = function (ref) {
    var target = xdom.data.document.find(ref);
    if (target) {
        return target;
    }
    //xdom.data.stores.filter((nombre, document) => document.selectSingleNode(`//*[@x:id="${typeof (ref) == 'string' ? ref : ref.getAttribute("x:id")}"]`))
    for (var xDocument in xdom.data.stores) {
        target = xdom.data.stores[xDocument].find(ref);
        if (target) {
            return target;
        }
    }
    return target;
}

xdom.dom.allowDrop = function (ev) {
    ev.preventDefault();
}

xdom.dom.drag = function (ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

xdom.dom.drop = function (ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}

xdom.data.selectNode = function (uid) {
    xdom.data.removeSelections(xdom.data.document.selectNodes('//*[@x:id="' + uid + '"]/..//*[@x:selected]'));
    xdom.data.setAttribute(xdom.data.document.selectNodes('//*[@x:id="' + uid + '"]|//*[@x:id="' + uid + '"]//*[count(preceding-sibling::*)=0 and count(following-sibling::*[@x:selected])=0]'), '@x:selected', 'true');
    xdom.data.document = xdom.xml.createDocument(xdom.data.document);
    xdom.dom.refresh();
}

xdom.data.self = {}

xdom.data.self = function () {
    var uid = event.srcElement.id;
    var _self = xdom.data.document.selectSingleNode('//*[@x:id="' + uid + '"]')
    _self.remove = function (str) {
        nodes = _self.selectNodes(str);
        xdom.data.remove(nodes);
        xdom.dom.refresh();
    }
    return _self;
}

xdom.data.getNode = function (uid) {
    return xdom.data.document.selectSingleNode("//*[@x:id='" + uid + "']/ancestor-or-self::*[namespace-uri()!='http://panax.io/xdom'][1]");
}

xdom.data.getCurrent = function () {
    var uid = event.srcElement.id;
    return xdom.data.document.selectSingleNode("//*[@x:id='" + uid + "']/ancestor-or-self::*[namespace-uri()!='http://panax.io/xdom'][1]");
}

xdom.data.replace = function (target, replace_by) {
    target.parentNode.replaceChild(replace_by, target);
}

xdom.data.remove = function (target, data_source) {
    data_source = (data_source || xdom.data.document)
    if (!target) return;
    xdom.data.history.saveState();
    if (typeof (target) == "string") {
        target = xdom.data.deepFind(target);
    }
    if (!target) {
        return undefined;
    }
    if (target.length !== undefined) {
        for (var node = 0; node < target.length; ++node) {
            xdom.data.remove(target[node]);
        }
    } else {
        if (target instanceof Element) {
            target.remove();
        } else if (target.nodeType == 2/*attribute*/) {
            var attribute_name = target.nodeName;
            var ownerElement = (target.ownerElement || target.selectSingleNode('..'))
            ownerElement.removeAttribute(attribute_name);
        } else {
            target.parentNode.removeChild(target);
        }
    }
    if (!(((arguments || {}).callee || {}).caller)) {
        xdom.dom.refresh();
    }
    return !target;
}

xdom.data.removeProcessingInstructions = function (data) {
    var xsl = xdom.xml.createDocument('                                                                                 \
                <xsl:stylesheet version="1.0"                                                                           \
                    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"                                                    \
                    xmlns="http://www.w3.org/1999/xhtml">                                                               \
                    <xsl:output method="xml" indent="no" />                                                             \
                    <xsl:template match="processing-instruction()"/>                                                    \
                    <xsl:template match="node()">                                                                       \
                    <xsl:copy-of select="."/>                                                                           \
                    </xsl:template>                                                                                     \
                </xsl:stylesheet> ');
    data = xdom.xml.transform(data, xsl);
    return data;
}

xdom.xml.appendChild = function (target, child) {
    var namespaces = xdom.xml.createNamespaceDeclaration(target.ownerDocument);
    var xsl_transform = xdom.xml.createDocument('\
<xsl:stylesheet version="1.0" \
     xmlns:xsl="http://www.w3.org/1999/XSL/Transform"\
     '+ namespaces + '>                     \
      <xsl:output method="xml" indent="no"/>\
      <xsl:template match="@* | node() | text()">\
        <xsl:copy>\
          <xsl:apply-templates select="@*"/>\
          <xsl:apply-templates select="node() | text()"/>\
        </xsl:copy>\
      </xsl:template>\
    <xsl:template match="/*">              \
        <xsl:copy >                                    \
        <xsl:apply-templates select="@*" />         '+
        xdom.xml.toString(child)
        + '    <xsl:apply-templates select="node()|text()" />\
        </xsl:copy >                                        \
  </xsl:template >                                      \
    </xsl:stylesheet>');
    return xdom.xml.transform(target, xsl_transform);
}

xdom.data.removeSelections = function (nodes) {
    /*USE FOR DEMOSTRATION*/
    //    var xsl_transform = xdom.xml.createDocument('\
    //<xsl:stylesheet version="1.0" \
    // xmlns:xsl="http://www.w3.org/1999/XSL/Transform"\
    // xmlns:x="http://panax.io/xdom">\
    //  <xsl:output method="xml" indent="no"/>\
    //  <xsl:template match="@* | node() | text()">\
    //    <xsl:copy>\
    //      <xsl:apply-templates select="@*"/>\
    //      <xsl:apply-templates select="node() | text()"/>\
    //    </xsl:copy>\
    //  </xsl:template>\
    //  <xsl:template match="@x:selected"/>\
    //</xsl:stylesheet>');
    //    xdom.updateData(xdom.xml.transform(xdom.data.document, xsl_transform));

    for (var node = 0; node < nodes.length; ++node) {
        nodes[node].removeAttribute('x:selected');
        //    //xdom.data.removeSelections(nodes[node].selectNodes('../*[@x:selected]'))
    }
}

xdom.updateData = function (xdoc) {
    if (!xdoc) {
        throw ("Data can't be set to null");
        return false;
    }
    xdom.data.document = xdoc
    return true
}

xdom.data.setAttribute = function (nodes, attribute, value) {
    for (var node = 0; node < nodes.length; ++node) {
        nodes[node].setAttribute(attribute.substring(1), value);
    }
}

xdom.data.removeAttribute = function (nodes, attribute) {
    for (var node = 0; node < nodes.length; ++node) {
        nodes[node].removeAttribute(attribute.substring(1));
    }
}

xdom.data.submit = async function (settings) { }
xdom.data.submit = async function (data, xhr_settings) {
    if (!await xdom.session.checkStatus()) {
        return;
    }
    if (arguments.length == 1 && arguments[0].constructor === {}.constructor) {
        settings = arguments[0];
    } else if (arguments.length == 1 && typeof arguments[0] == 'string') {
        var uid = arguments[0];
        xdom.data.document = xdom.xml.transform(xdom.data.document, xdom.library["xdom/resources/normalize_namespaces.xslt"]);
        data = xdom.data.document.selectSingleNode('//*[@x:id="' + uid + '"]');
    }
    var data = (data || xdom.data.document)
    data = (data.documentElement || data);
    this.prepareData = function (data) {
        if (settings["prepareData"] && settings["prepareData"].apply) {
            settings["prepareData"].apply(this, [data])
        };
        return data;
    }

    var settings = (settings || {});
    var xhr_settings = xdom.json.merge({ headers: { "Accept": 'text/xml', "Content-Type": 'text/xml' } }, (xhr_settings || settings["xhr"]));
    var onsuccess = (xhr_settings["onSuccess"] || function () { });
    if (data) {
        this.prepareData(data);

        data.setAttributes({
            "session:user_id": (data.getAttribute("session:user_id") || xdom.session.getUserId())
            , "session:user_login": (data.getAttribute("session:user_login") || xdom.session.getUserLogin())
            , "session:status": (xdom.session.getUserLogin() ? "authorized" : "unauthorized")
        });

        var target = data.selectSingleNode('//*[@x:reference]')
        var datarows = data.selectNodes('px:data/px:dataRow');

        if (target && data.selectSingleNode('px:data/px:dataRow[not(@identity)]')) {
            for (var xDocument in xdom.data.stores) {
                source = xdom.data.stores[xDocument].selectSingleNode('//*[@x:id="' + target.getAttribute('x:reference') + '"]');
                if (!source || (window.top || window).location.hash == xDocument) { continue; }
                for (var dr in datarows) {
                    var datarow = datarows[dr];
                    var target = xdom.data.find(datarow, source);
                    if (target) {
                        xdom.data.replace(target, datarow);
                    } else if (source.selectSingleNode('self::px:dataRow')) {
                        xdom.dom.insertAfter(datarow, source);
                    } else if (!source.selectSingleNode('px:data')) {
                        source.appendChild(datarow.parentNode);
                    }
                    else {
                        source.selectSingleNode('px:data').appendChild(datarow);
                    }
                }
                xdom.data.document = source.ownerDocument;
                xdom.dom.refresh();
                //window.history.back();
                return
            }
            if (confirm("¿Desea guardar el registro en este momento?")) {
                xdom.data.remove(target.selectSingleNode('@x:reference'));
            } else {
                return;
            }
            //xdom.dom.navigateTo("#proveedor:edit");
        }

        data = xdom.xml.createDocument(data).documentElement;
        var submit_data;
        if (data.getAttribute("transforms:submit")) {
            submit_data = xdom.xml.transform(data.ownerDocument, data.getAttribute("transforms:submit"));
        }
        var payload = xdom.xml.createDocument('<x:post xmlns:x="http://panax.io/xdom"><x:source>' + xdom.xml.toString(data) + '</x:source>' + (submit_data ? '<x:submit>' + xdom.xml.toString(submit_data) + '</x:submit>' : '') + '</x:post>');
        var xhr = new xdom.xhr.Request(xdom.manifest.server["endpoints"]["post"], xdom.json.merge(xhr_settings, {
            onSuccess: function (Response, Request) {
                var results = Response.value;
                if (onsuccess && onsuccess.apply) {
                    onsuccess.apply(this, arguments);
                }
                if (Response.type == 'json' || Response.type == 'script') {
                    xdom.data.update(data.getAttribute("x:id"), "@x:trid", results.recordSet[0][""]);
                }
                else if (Response.type == "xml") {
                    if (Response.responseXML.documentElement && Response.responseXML.documentElement.selectSingleNode('/x:message')) {
                        if (!(this.subscribers)) {
                            (xdom.dom.findClosestDataNode(Request.srcElement) || xdom.data.document.documentElement).appendChild(Response.responseXML.documentElement);
                            xdom.dom.refresh({ after: function () { return null; } });
                        } else {
                            var target = xdom.data.document;
                            if (target) {
                                target.documentElement.appendChild(Response.responseXML.documentElement);
                            } else {
                                console.warn(Response.responseXML)
                            }
                        }
                    }
                }

                if (results && results.message) {
                    alert(results.message);
                }
                //xdom.data.update(data.getAttribute("x:id"), "@state:submitted", "true", false);
                for (var datarow of datarows) {
                    xdom.data.update(datarow, "@state:submitted", "true", false);
                }
            }
            , onException: function (Response, Request) {
                if (Response.status == 304) {
                    alert("No hay cambios");
                }
                else if (Response.type == "xml") {
                    if (Response.document.documentElement && Response.document.documentElement.selectSingleNode('/x:message')) {
                        if (!(this.subscribers)) {
                            (xdom.dom.findClosestDataNode(Request.srcElement) || xdom.data.document.documentElement).appendChild(Response.responseXML.documentElement);
                            xdom.dom.refresh({ after: function () { return null; } });
                        } else {
                            var target = xdom.data.document;
                            if (target) {
                                target.documentElement.appendChild(Response.document.documentElement);
                            } else {
                                console.warn(Response.document)
                            }
                        }
                    }
                } else if (Response.status != 401) {
                    alert("No se pudo guardar la información, intente de nuevo");
                }
            }
            , onComplete: function (Response, Request) {
                //xdom.data.update(data.getAttribute("x:id"), "@state:submitting", "false");
                for (var datarow of datarows) {
                    xdom.data.update(datarow, "@state:submitting", "false");
                }
            }
        }));
        //var nodes = payload.selectNodes('//source:value|//@source:value');
        //xdom.data.remove(nodes);
        //xdom.data.update(data.getAttribute("x:id"), "@state:submitting", "true");
        for (var datarow of datarows) {
            xdom.data.update(datarow, "@state:submitting", "true");
        }
        xhr.send(payload);


        //xhr.upload.onprogress = p => {
        //    console.log(Math.round((p.loaded / p.total) * 100) + '%');
        //}
    }
}

xdom.xhr.upload = function (data, target_name) {
    if (!data) return
    if (data) {
        var xhr = new xdom.xhr.Request(xdom.manifest.server["endpoints"]["upload_xml"] + '?target_name=' + target_name, {
            headers: {
                "Content-Type": 'text/xml'
                , "Accept": 'text/xml'
            }
            , onSuccess: function () {
                console.log("Uploaded file");
            }
        });
        xhr.send(xdom.xml.createDocument(xdom.xml.toString(data)));
        //xhr.upload.onprogress = p => {
        //    console.log(Math.round((p.loaded / p.total) * 100) + '%');
        //}
    }
}

xdom.storage.getData = function () {
    if (typeof (Storage) !== "undefined") {
        var document = localStorage.getItem(location.pathname + "xdom.data")
        if (document) {
            xdom.data.document = xdom.xml.createDocument(document);
        }
    } else {
        console.error('Storage is not supported by your browser')
    }
}

xdom.storage.setKey = function (key, value) {
    if (typeof (Storage) !== "undefined") {
        //if (!xdom.storage.enabled) {
        //    console.warn("xdom.storage is disabled")
        //    return;
        //}
        let session_id = (xdom.session.id && `${xdom.session.id}/` || `${location.hostname}${location.pathname}`);

        key = `${session_id}${key}`;
        if (value === undefined) {
            localStorage.removeItem(key);
        } else if (value == null) {
            localStorage.setItem(key, String(value));
        } else {
            localStorage.setItem(key, value.toString());
        }
    } else {
        console.error('Storage is not supported by your browser')
    }
}

xdom.storage.getKey = function (key) {
    if (!eval(xdom.storage.enabled) && key != 'xdom.storage.enabled') return;
    if (typeof (Storage) !== "undefined") {
        let session_id = (xdom.session.id && `${xdom.session.id}/` || `${location.hostname}${location.pathname}`);
        var document = localStorage.getItem(`${session_id}${key}`);
        if (document) {
            return document;
        }
    } else {
        console.error('Storage is not supported by your browser')
    }
}

xdom.storage.syncSession = function (event) {
    if (!event) { event = window.event; } // ie suq
    if (!event.newValue) return;          // do nothing if no value to work with
    let session_id = (xdom.session.id && `${xdom.session.id}/` || `${location.hostname}${location.pathname}`);
    if (event.key.match(new RegExp(`^${session_id}`, 'i'))) {
        xdom.session[event.key.replace(new RegExp(`^${session_id}`, 'i'), '')] = event.newValue;
    }
    //if (event.key == 'getSessionStorage') {
    //    // another tab asked for the sessionStorage -> send it
    //    localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
    //    // the other tab should now have it, so we're done with it.
    //    localStorage.removeItem('sessionStorage'); // <- could do short timeout as well.
    //} else if (event.key == 'sessionStorage' && !sessionStorage.length) {
    //    // another tab sent data <- get it
    //    var data = JSON.parse(event.newValue);
    //    for (var key in data) {
    //        sessionStorage.setItem(key, data[key]);
    //    }
    //}
};

// listen for changes to localStorage
if (window.addEventListener) {
    window.addEventListener("storage", xdom.storage.syncSession, false);
} else {
    window.attachEvent("onstorage", xdom.storage.syncSession);
};


//// Ask other tabs for session storage (this is ONLY to trigger event)
//if (!sessionStorage.length) {
//    xdom.storage.setKey('getSessionStorage', 'foobar');
//    xdom.storage.setKey('getSessionStorage', undefined);
//};

xdom.storage.getDocument = function (key) {
    if (!eval(xdom.storage.enabled) && key != 'xdom.storage.enabled') return;
    if (typeof (Storage) !== "undefined") {
        var document = localStorage.getItem(location.pathname + key);
        if (document) {
            return xdom.xml.createDocument(document);
        }
    } else {
        console.error('Storage is not supported by your browser')
    }
}

xdom.storage.disable = function (document_name_or_array) {
    xdom.storage.enabled = false;
    if (document_name_or_array) {
        xdom.storage.setKey(document_name_or_array, null);
    } else {
        localStorage.clear();
        xdom.storage.setKey(location.pathname + "xdom.storage.enabled", "0");
    }

    xdom.library.reload(document_name_or_array);
}

xdom.storage.enable = function () {
    xdom.storage.enabled = true;
    xdom.storage.setKey("xdom.storage.enabled", "1");
}

xdom.storage.clearCache = function (document_name) {
    if (typeof (Storage) !== "undefined") {
        localStorage.clear();
    } else {
        console.error('Storage is not supported by your browser');
    }
}

//xdom.listeners.xml.onTransform = function (original, transformed) {
//    return;
//}

//xdom.listeners.xml.changingAttribute = function (node, attribute, value) {
//    //console.log('Changed = ' + attribute + ' = ' + value);
//}

//xdom.listeners.xml.onLoad = function (xdocument) {
//    return;
//}

//xdom.listeners.dom.onLoad = function (xdocument) {
//    return;
//}

xdom.listeners.dom.onHashChange = function (new_hash, old_hash) {
    //var new_hash = (new_hash || (window.top || window).location.hash);
    //xdom.data.document = (xdom.data.stores[new_hash] || xdom.data.document);
    return new_hash;
}

xdom.listeners.keys = function (e) {
    xdom.listeners.keys.ctrlKey = e.ctrlKey;
    xdom.listeners.keys.shiftKey = e.shiftKey;
    xdom.listeners.keys.altKey = e.altKey;
    xdom.listeners.keys.tabKey = (e.keyCode == 9);
    xdom.dom.triggeredByTab = (xdom.dom.triggeredByTab || xdom.listeners.keys.tabKey);
    xdom.listeners.keys.escKey = (e.keyCode == 27);
    if (xdom.debug["xdom.listeners.keys"]) {
        console.log(String.fromCharCode(e.keyCode) + " --> " + e.keyCode)
    }
}

xdom.listeners.keys.last_key = undefined;
xdom.listeners.keys.streak_count = 0;

xdom.listeners.keys.keydown = function (event) {
    if (event.keyCode == xdom.listeners.keys.last_key) {
        ++xdom.listeners.keys.streak_count;
    } else {
        xdom.listeners.keys.last_key = event.keyCode;
        xdom.listeners.keys.streak_count = 1;
    }
    if (xdom.debug["xdom.listeners.keys.keydown"]) {
        if (!xdom.debug["xdom.listeners.keys"]) {
            console.log("key pressed: " + event.keyCode)
        }
        console.log("xdom.listeners.keys.streak_count: " + xdom.listeners.keys.streak_count)
    }
    if (event.keyCode == 27) {
        xdom.data.removeMessage();
        return;
    }
    xdom.listeners.keys(event);
    if (xdom.listeners.keys.altKey || xdom.listeners.keys.shiftKey || xdom.listeners.keys.ctrlKey) {
        if (this.keyInterval != undefined) {
            window.clearTimeout(this.keyInterval);
            this.keyInterval = undefined;
        }
        this.keyInterval = window.setTimeout(function () {
            xdom.listeners.keys({});
            this.keyInterval = undefined;
        }, 1000);
        return;
    } //if combined with alt/shift/ctrl keys 
    // in grids, this function will allow move up and down between elements
    var srcElement = event.srcElement;
    if (event.keyCode == 40) {
        if (srcElement.nodeName.toLowerCase() == 'select' && (srcElement.size || xdom.browser.isIE() || xdom.browser.isEdge())) return;
        currentNode = xdom.data.getCurrent();
        if (!currentNode) return false;
        nextNode = currentNode.selectSingleNode('../following-sibling::*[not(@x:deleting="true")][1]/*[local-name()="' + currentNode.nodeName + '"]')
        if (nextNode) {
            document.getElementById(nextNode.getAttribute('x:id')).focus();
        }
        event.preventDefault();
    } else if (event.keyCode == 38) {
        if (srcElement.nodeName.toLowerCase() == 'select' && (srcElement.size || xdom.browser.isIE() || xdom.browser.isEdge())) return;
        currentNode = xdom.data.getCurrent();
        if (!currentNode) return false;
        nextNode = currentNode.selectSingleNode('../preceding-sibling::*[not(@x:deleting="true")][1]/*[local-name()="' + currentNode.nodeName + '"]')
        if (nextNode) {
            document.getElementById(nextNode.getAttribute('x:id')).focus();
        }
        event.preventDefault();
    }
    if (srcElement.nodeName.toLowerCase() == 'select') {//disable behaviour that changes options with arrows, preventing unwanted changes
        var key = event.which || event.keyCode;
        if (key == 37) {
            event.preventDefault();
        } else if (key === 39) {
            event.preventDefault();
        }
    }
    //if (event.keyCode == 8 &&
    //    !(event.target || event.srcElement).isContentEditable) {
    //    if (navigator.userAgent.toLowerCase().indexOf("msie") == -1) {
    //        event.stopPropagation();
    //    } else {
    //        console.info("Backspace navigation prevented");
    //        event.returnValue = false;
    //    }
    //    return false;
    //}
    if ((document.activeElement || {}).value) {
        xdom.dom.activeElementCaretPosition = parseFloat(String(xdom.dom.getCaretPosition(document.activeElement)).split(",").pop()) + 1;
    }
}

xdom.listeners.keys.keyup = function (e) {
    xdom.listeners.keys.last_key = e.keyCode;
    xdom.listeners.keys(e);
    window.setTimeout(function () { xdom.listeners.keys(e); }, 300);
}

xdom.data.removeMessage = function (xid) {
    var message = xdom.data.document.selectSingleNode('//x:message' + (xid ? `[@x:id="${xid}"]` : '[last()]'));
    var navigate_back = message && message.selectSingleNode('*');
    if (message) {
        message.remove();
        if (message.ownerDocument.documentElement) {
            xdom.data.document.render(true);
        } else {
            navigate_back = true;
        }
    }
    if (xdom.data.document && navigate_back && !xdom.data.document.selectSingleNode('//x:message[last()]')) {
        window.history.back();
        //setTimeout(() => {
        //    px.request(px.getEntityInfo());
        //}, 1000);
    }

}

document.onkeydown = xdom.listeners.keys.keydown;

document.onkeyup = xdom.listeners.keys.keyup;

var keyInterval = undefined;
xdom.dom.controls.comboBox = {}
xdom.dom.controls.comboBox.showOptions = function (input, onkeyup) {
    if (keyInterval != undefined) {
        window.clearTimeout(keyInterval); keyInterval = undefined;
    }
    keyInterval = window.setTimeout(function () {
        if (onkeyup && onkeyup.apply) {
            var current_request = (xdom.data.binding.requests[xdom.dom.findClosestElementWithId(input).id] || {})["value"];
            if (current_request && current_request.xhr) {
                current_request.xhr.abort()
            }
            onkeyup.apply(input, [input]);
        }
    }, /*sDataSourceType == 'remote' ? 500 : */300);
}

//document.addEventListener('mousemove', function checkHover() {
//    xdom.listeners.hovered = event.srcElement;
//    //console.log((xdom.listeners.hovered || {}).tagName + ': ' + (xdom.dom.findClosestElementWithTagName(xdom.listeners.hovered, "button") || xdom.dom.findClosestElementWithClassName(xdom.listeners.hovered, "btn")))
//});

xdom.dom.controls.comboBox.onBlur = function (src) {
    if (!src) return;
    var combo = document.getElementById(src.id);
    var node_id = src.id.replace(/^_\[^_]+_/, '');
    if (combo == this) { combo.style.display = 'none'; xdom.data.update({ target: node_id, attributes: [{ '@x:value': (combo[combo.selectedIndex] || {}).value }] }) }
    xdom.delay(100).then(() => {
        if ((xdom.dom.findClosestElementWithId(document.activeElement) || {}).id != node_id) {
            combo.style.display = 'none';
            xdom.data.remove(xdom.data.document.selectNodes('//@state:combo_selection'));
        }
    })

}

xdom.dom.beforeunload = function (e) {
    // check to cancel
    //xdom.data.stores[((window.top || window).location.hash || "#")] = xdom.data.document;
    xdom.data.stores.detectActive();
    for (hashtag in xdom.data.stores) {
        console.log("Saving " + hashtag)
        xdom.session.setKey(hashtag, (xdom.data.stores[hashtag].initiator || xdom.data.stores[hashtag]));
    }
    console.log("checking if we should display confirmation dialog");
    var shouldCancel = false;
    if (shouldCancel) {
        console.log("displaying confirmation dialog");
        e.preventDefault(); // this will display the confirmation dialog
        // Chrome requires returnValue to be set
        e.returnValue = false;
    }
}
var eventName = xdom.browser.isIOS() ? "pagehide" : "beforeunload";

window.addEventListener(eventName, xdom.dom.beforeunload);

xdom.dom.print = function () {
    var iframes = document.querySelectorAll('iframe');

    if (iframes) {
        for (var f = 0; f < iframes.length; ++f) {
            var iframe = iframes[f];
            if (iframe.classList.contains("non-printable")) {
                continue;
            }
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            f = iframes.length;
        }
    } else {
        window.print()
    }

}

xdom.listeners.dom.onfocusout = function (event) {
    xdom.dom.lastBluredElement = event.target;

    if (((arguments || {}).callee || {}).caller === xdom.dom.clear) {
        xdom.dom.activeElement = event.target;
    } else {
        xdom.dom.bluredElement = event.target;
        if (xdom.debug["focusout"]) {
            console.log(event.target);
        }
    }
}
window.addEventListener('focusout', xdom.listeners.dom.onfocusout);

xdom.listeners.dom.onchange = function (event) {
    xdom.dom.bluredElement = event.target;
    xdom.delay(40).then(() => {
        xdom.dom.triggeredByTab = xdom.listeners.keys.tabKey;
    })
}

xdom.listeners.dom.onclick = function (event) {
    xdom.delay(40).then(() => {
        let source_tag = (event.target.closest("[xo-source]") || document.createElement('p')).getAttribute("xo-source");
        if ((xdom.listeners.keys.ctrlKey && !xdom.listeners.keys.shiftKey && !xdom.listeners.keys.altKey && source_tag !== (window.top || window).location.hash)) {
            xdom.data.stores.detectActive();
            xdom.state.update({ active: source_tag, hash: source_tag });
        }
    })
}
window.addEventListener("change", xdom.listeners.dom.onchange);
window.addEventListener("click", xdom.listeners.dom.onchange);
window.addEventListener("click", xdom.listeners.dom.onclick);

var _Network_state = true;
function updateIndicator() {
    if (navigator.onLine) {
        console.info("online")
        _Network_state = true;
    } else {
        console.warn("offline")
        _Network_state = false;
    }
}
window.addEventListener('online', updateIndicator);
window.addEventListener('offline', updateIndicator);
updateIndicator();

//window.addEventListener("beforeprint", function (event) {
//    event.preventDefault();
//    event.returnValue = "";
//    xdom.dom.print();
//});

//if ('matchMedia' in window) {
//    window.matchMedia('print').addListener(function (media) {
//        xdom.dom.print()
//    });
//} else {
//    window.onbeforeprint = function () {
//        xdom.dom.print()
//    }
//}

/**
 * A Javascript object to encode and/or decode html characters
 * @Author R Reid
 * source: http://www.strictly-software.com/htmlencode
 * Licence: GPL
 * 
 * Revision:
 *  2011-07-14, Jacques-Yves Bleau: 
 *       - fixed conversion error with capitalized accentuated characters
 *       + converted arr1 and arr2 to object property to remove redundancy
 */

Encoder = {

    // When encoding do we convert characters into html or numerical entities
    EncodeType: "entity",  // entity OR numerical

    isEmpty: function (val) {
        if (val) {
            return ((val === null) || val.length == 0 || /^\s+$/.test(val));
        } else {
            return true;
        }
    },
    arr1: new Array('&nbsp;', '&iexcl;', '&cent;', '&pound;', '&curren;', '&yen;', '&brvbar;', '&sect;', '&uml;', '&copy;', '&ordf;', '&laquo;', '&not;', '&shy;', '&reg;', '&macr;', '&deg;', '&plusmn;', '&sup2;', '&sup3;', '&acute;', '&micro;', '&para;', '&middot;', '&cedil;', '&sup1;', '&ordm;', '&raquo;', '&frac14;', '&frac12;', '&frac34;', '&iquest;', '&Agrave;', '&Aacute;', '&Acirc;', '&Atilde;', '&Auml;', '&Aring;', '&Aelig;', '&Ccedil;', '&Egrave;', '&Eacute;', '&Ecirc;', '&Euml;', '&Igrave;', '&Iacute;', '&Icirc;', '&Iuml;', '&ETH;', '&Ntilde;', '&Ograve;', '&Oacute;', '&Ocirc;', '&Otilde;', '&Ouml;', '&times;', '&Oslash;', '&Ugrave;', '&Uacute;', '&Ucirc;', '&Uuml;', '&Yacute;', '&THORN;', '&szlig;', '&agrave;', '&aacute;', '&acirc;', '&atilde;', '&auml;', '&aring;', '&aelig;', '&ccedil;', '&egrave;', '&eacute;', '&ecirc;', '&euml;', '&igrave;', '&iacute;', '&icirc;', '&iuml;', '&eth;', '&ntilde;', '&ograve;', '&oacute;', '&ocirc;', '&otilde;', '&ouml;', '&divide;', '&Oslash;', '&ugrave;', '&uacute;', '&ucirc;', '&uuml;', '&yacute;', '&thorn;', '&yuml;', '&quot;', '&amp;', '&lt;', '&gt;', '&oelig;', '&oelig;', '&scaron;', '&scaron;', '&yuml;', '&circ;', '&tilde;', '&ensp;', '&emsp;', '&thinsp;', '&zwnj;', '&zwj;', '&lrm;', '&rlm;', '&ndash;', '&mdash;', '&lsquo;', '&rsquo;', '&sbquo;', '&ldquo;', '&rdquo;', '&bdquo;', '&dagger;', '&dagger;', '&permil;', '&lsaquo;', '&rsaquo;', '&euro;', '&fnof;', '&alpha;', '&beta;', '&gamma;', '&delta;', '&epsilon;', '&zeta;', '&eta;', '&theta;', '&iota;', '&kappa;', '&lambda;', '&mu;', '&nu;', '&xi;', '&omicron;', '&pi;', '&rho;', '&sigma;', '&tau;', '&upsilon;', '&phi;', '&chi;', '&psi;', '&omega;', '&alpha;', '&beta;', '&gamma;', '&delta;', '&epsilon;', '&zeta;', '&eta;', '&theta;', '&iota;', '&kappa;', '&lambda;', '&mu;', '&nu;', '&xi;', '&omicron;', '&pi;', '&rho;', '&sigmaf;', '&sigma;', '&tau;', '&upsilon;', '&phi;', '&chi;', '&psi;', '&omega;', '&thetasym;', '&upsih;', '&piv;', '&bull;', '&hellip;', '&prime;', '&prime;', '&oline;', '&frasl;', '&weierp;', '&image;', '&real;', '&trade;', '&alefsym;', '&larr;', '&uarr;', '&rarr;', '&darr;', '&harr;', '&crarr;', '&larr;', '&uarr;', '&rarr;', '&darr;', '&harr;', '&forall;', '&part;', '&exist;', '&empty;', '&nabla;', '&isin;', '&notin;', '&ni;', '&prod;', '&sum;', '&minus;', '&lowast;', '&radic;', '&prop;', '&infin;', '&ang;', '&and;', '&or;', '&cap;', '&cup;', '&int;', '&there4;', '&sim;', '&cong;', '&asymp;', '&ne;', '&equiv;', '&le;', '&ge;', '&sub;', '&sup;', '&nsub;', '&sube;', '&supe;', '&oplus;', '&otimes;', '&perp;', '&sdot;', '&lceil;', '&rceil;', '&lfloor;', '&rfloor;', '&lang;', '&rang;', '&loz;', '&spades;', '&clubs;', '&hearts;', '&diams;'),
    arr2: new Array('&#160;', '&#161;', '&#162;', '&#163;', '&#164;', '&#165;', '&#166;', '&#167;', '&#168;', '&#169;', '&#170;', '&#171;', '&#172;', '&#173;', '&#174;', '&#175;', '&#176;', '&#177;', '&#178;', '&#179;', '&#180;', '&#181;', '&#182;', '&#183;', '&#184;', '&#185;', '&#186;', '&#187;', '&#188;', '&#189;', '&#190;', '&#191;', '&#192;', '&#193;', '&#194;', '&#195;', '&#196;', '&#197;', '&#198;', '&#199;', '&#200;', '&#201;', '&#202;', '&#203;', '&#204;', '&#205;', '&#206;', '&#207;', '&#208;', '&#209;', '&#210;', '&#211;', '&#212;', '&#213;', '&#214;', '&#215;', '&#216;', '&#217;', '&#218;', '&#219;', '&#220;', '&#221;', '&#222;', '&#223;', '&#224;', '&#225;', '&#226;', '&#227;', '&#228;', '&#229;', '&#230;', '&#231;', '&#232;', '&#233;', '&#234;', '&#235;', '&#236;', '&#237;', '&#238;', '&#239;', '&#240;', '&#241;', '&#242;', '&#243;', '&#244;', '&#245;', '&#246;', '&#247;', '&#248;', '&#249;', '&#250;', '&#251;', '&#252;', '&#253;', '&#254;', '&#255;', '&#34;', '&#38;', '&#60;', '&#62;', '&#338;', '&#339;', '&#352;', '&#353;', '&#376;', '&#710;', '&#732;', '&#8194;', '&#8195;', '&#8201;', '&#8204;', '&#8205;', '&#8206;', '&#8207;', '&#8211;', '&#8212;', '&#8216;', '&#8217;', '&#8218;', '&#8220;', '&#8221;', '&#8222;', '&#8224;', '&#8225;', '&#8240;', '&#8249;', '&#8250;', '&#8364;', '&#402;', '&#913;', '&#914;', '&#915;', '&#916;', '&#917;', '&#918;', '&#919;', '&#920;', '&#921;', '&#922;', '&#923;', '&#924;', '&#925;', '&#926;', '&#927;', '&#928;', '&#929;', '&#931;', '&#932;', '&#933;', '&#934;', '&#935;', '&#936;', '&#937;', '&#945;', '&#946;', '&#947;', '&#948;', '&#949;', '&#950;', '&#951;', '&#952;', '&#953;', '&#954;', '&#955;', '&#956;', '&#957;', '&#958;', '&#959;', '&#960;', '&#961;', '&#962;', '&#963;', '&#964;', '&#965;', '&#966;', '&#967;', '&#968;', '&#969;', '&#977;', '&#978;', '&#982;', '&#8226;', '&#8230;', '&#8242;', '&#8243;', '&#8254;', '&#8260;', '&#8472;', '&#8465;', '&#8476;', '&#8482;', '&#8501;', '&#8592;', '&#8593;', '&#8594;', '&#8595;', '&#8596;', '&#8629;', '&#8656;', '&#8657;', '&#8658;', '&#8659;', '&#8660;', '&#8704;', '&#8706;', '&#8707;', '&#8709;', '&#8711;', '&#8712;', '&#8713;', '&#8715;', '&#8719;', '&#8721;', '&#8722;', '&#8727;', '&#8730;', '&#8733;', '&#8734;', '&#8736;', '&#8743;', '&#8744;', '&#8745;', '&#8746;', '&#8747;', '&#8756;', '&#8764;', '&#8773;', '&#8776;', '&#8800;', '&#8801;', '&#8804;', '&#8805;', '&#8834;', '&#8835;', '&#8836;', '&#8838;', '&#8839;', '&#8853;', '&#8855;', '&#8869;', '&#8901;', '&#8968;', '&#8969;', '&#8970;', '&#8971;', '&#9001;', '&#9002;', '&#9674;', '&#9824;', '&#9827;', '&#9829;', '&#9830;'),

    // Convert HTML entities into numerical entities
    HTML2Numerical: function (s) {
        return this.swapArrayVals(s, this.arr1, this.arr2);
    },

    // Convert Numerical entities into HTML entities
    NumericalToHTML: function (s) {
        return this.swapArrayVals(s, this.arr2, this.arr1);
    },


    // Numerically encodes all unicode characters
    numEncode: function (s) {

        if (this.isEmpty(s)) return "";

        var e = "";
        for (var i = 0; i < s.length; i++) {
            var c = s.charAt(i);
            if (c < " " || c > "~") {
                c = "&#" + c.charCodeAt() + ";";
            }
            e += c;
        }
        return e;
    },

    // HTML Decode numerical and HTML entities back to original values
    htmlDecode: function (s) {

        var c, m, d = s;

        if (this.isEmpty(d)) return "";

        // convert HTML entites back to numerical entites first
        d = this.HTML2Numerical(d);

        // look for numerical entities &#34;
        arr = d.match(/&#[0-9]{1,5};/g);

        // if no matches found in string then skip
        if (arr != null) {
            for (var x = 0; x < arr.length; x++) {
                m = arr[x];
                c = m.substring(2, m.length - 1); //get numeric part which is refernce to unicode character
                // if its a valid number we can decode
                if (c >= -32768 && c <= 65535) {
                    // decode every single match within string
                    d = d.replace(m, String.fromCharCode(c));
                } else {
                    d = d.replace(m, ""); //invalid so replace with nada
                }
            }
        }

        return d;
    },

    // encode an input string into either numerical or HTML entities
    htmlEncode: function (s, dbl) {

        if (this.isEmpty(s)) return "";

        // do we allow double encoding? E.g will &amp; be turned into &amp;amp;
        dbl = dbl || false; //default to prevent double encoding

        // if allowing double encoding we do ampersands first
        if (dbl) {
            if (this.EncodeType == "numerical") {
                s = s.replace(/&/g, "&#38;");
            } else {
                s = s.replace(/&/g, "&amp;");
            }
        }

        // convert the xss chars to numerical entities ' " < >
        s = this.XSSEncode(s, false);

        if (this.EncodeType == "numerical" || !dbl) {
            // Now call function that will convert any HTML entities to numerical codes
            s = this.HTML2Numerical(s);
        }

        // Now encode all chars above 127 e.g unicode
        s = this.numEncode(s);

        // now we know anything that needs to be encoded has been converted to numerical entities we
        // can encode any ampersands & that are not part of encoded entities
        // to handle the fact that I need to do a negative check and handle multiple ampersands &&&
        // I am going to use a placeholder

        // if we don't want double encoded entities we ignore the & in existing entities
        if (!dbl) {
            s = s.replace(/&#/g, "##AMPHASH##");

            if (this.EncodeType == "numerical") {
                s = s.replace(/&/g, "&#38;");
            } else {
                s = s.replace(/&/g, "&amp;");
            }

            s = s.replace(/##AMPHASH##/g, "&#");
        }

        // replace any malformed entities
        s = s.replace(/&#\d*([^\d;]|$)/g, "$1");

        if (!dbl) {
            // safety check to correct any double encoded &amp;
            s = this.correctEncoding(s);
        }

        // now do we need to convert our numerical encoded string into entities
        if (this.EncodeType == "entity") {
            s = this.NumericalToHTML(s);
        }

        return s;
    },

    // Encodes the basic 4 characters used to malform HTML in XSS hacks
    XSSEncode: function (s, en) {
        if (!this.isEmpty(s)) {
            en = en || true;
            // do we convert to numerical or html entity?
            if (en) {
                s = s.replace(/\'/g, "&#39;"); //no HTML equivalent as &apos is not cross browser supported
                s = s.replace(/"/g, "&quot;");
                s = s.replace(/</g, "&lt;");
                s = s.replace(/>/g, "&gt;");
            } else {
                s = s.replace(/\'/g, "&#39;"); //no HTML equivalent as &apos is not cross browser supported
                s = s.replace(/"/g, "&#34;");
                s = s.replace(/</g, "&#60;");
                s = s.replace(/>/g, "&#62;");
            }
            return s;
        } else {
            return "";
        }
    },

    // returns true if a string contains html or numerical encoded entities
    hasEncoded: function (s) {
        if (/&#[0-9]{1,5};/g.test(s)) {
            return true;
        } else if (/&[A-Z]{2,6};/gi.test(s)) {
            return true;
        } else {
            return false;
        }
    },

    // will remove any unicode characters
    stripUnicode: function (s) {
        return s.replace(/[^\x20-\x7E]/g, "");

    },

    // corrects any double encoded &amp; entities e.g &amp;amp;
    correctEncoding: function (s) {
        return s.replace(/(&amp;)(amp;)+/, "$1");
    },


    // Function to loop through an array swaping each item with the value from another array e.g swap HTML entities with Numericals
    swapArrayVals: function (s, arr1, arr2) {
        if (this.isEmpty(s)) return "";
        var re;
        if (arr1 && arr2) {
            //ShowDebug("in swapArrayVals arr1.length = " + arr1.length + " arr2.length = " + arr2.length)
            // array lengths must match
            if (arr1.length == arr2.length) {
                for (var x = 0, i = arr1.length; x < i; x++) {
                    re = new RegExp(arr1[x], 'g');
                    s = s.replace(re, arr2[x]); //swap arr1 item with matching item from arr2	
                }
            }
        }
        return s;
    },

    inArray: function (item, arr) {
        for (var i = 0, x = arr.length; i < x; i++) {
            if (arr[i] === item) {
                return i;
            }
        }
        return -1;
    }

    // Extended by Uriel Gómez	
    , urlEncode: function (url) {
        return Encoder.swapArrayVals(escape(url), ['\/', '\@', '\\\+'], ['%2F', '%40', '%2B'])
    }
}

xdom.data.history.saveState = function () {
    xdom.data.history.undo.push(xdom.xml.createDocument(xdom.data.document));
    xdom.data.history.redo = [];
}

xdom.tools.isJSON = function (str) {
    return xdom.json.isValid(str);
}

xdom.json.isValid = function (input) {
    try {
        return [{}.constructor].includes(JSON.parse(JSON.stringify(input)).constructor)
    } catch (e) {
        return false;
    }
    return true;
}

xdom.json.tryParse = function (input) {
    let output;
    if (xdom.json.isValid(input)) {
        return input;
    }
    try {
        output = eval(`(${input})`);
    } catch (e) {
        output = eval(`(${JSON.stringify(input)})`)
    }
    return output;
}

xdom.string = {}

Object.defineProperty(xdom.string, 'replace', {
    value: function (input, search_text, replace_text, is_regex) {
        let result;
        if (is_regex) {
            let regex = new RegExp(search_text.replace(/([\\"])/, '\\$1'), "ig");
            result = String(input).replace(regex, replace_text)
        } else if (String(input).replaceAll) {
            result = String(input).replaceAll(search_text, replace_text)
        } else {
            let regex = new RegExp(search_text.replace(/([\[\]\(\)\\"])/, '\\$1'), "ig");
            result = String(input).replace(regex, replace_text)
        }
        return result;
    },
    writable: true, enumerable: false, configurable: false
})

xdom.string.trim = function (text) {
    if (typeof (text) != "string") return text;
    return text.replace(/\s+$/, '').replace(/^\s+/, '')
}

xdom.string.toTitleCase = function (str) {
    /*Code obtained from https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript */
    var i, j, lowers, uppers;
    if (!str) return str;
    if (xdom.string.isEmail(str)) {
        return str.toLowerCase();
    } else if (xdom.string.isRFC(str) || xdom.string.isCURP(str)) {
        return str.toUpperCase();
    }

    str = str.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Certain minor words should be left lowercase unless 
    // they are the first or last words in the string
    lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
        'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With', 'A', 'De', 'Y', 'O'];
    for (i = 0, j = lowers.length; i < j; i++)
        str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
            function (txt) {
                return txt.toLowerCase();
            });

    // Certain words such as initialisms or acronyms should be left uppercase
    uppers = ['Id', 'Tv', 'RFC', 'CURP', 'Sa', 'Cv'];
    for (i = 0, j = uppers.length; i < j; i++)
        str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
            uppers[i].toUpperCase());

    return str;
}

xdom.string.isRFC = function (str) {
    if (/^([A-Z,Ñ,&]{3,4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[A-Z|\d]{3})$/.test(str)) {
        return (true)
    }
    return (false)
}

xdom.string.isEmail = function (str) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str)) {
        return (true)
    }
    return (false)
}

xdom.string.isCURP = function (str) {
    if (/^([A-Z]{4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[A-Z]{3}[0-9A-Z]\d)$/.test(str)) {
        return (true)
    }
    return (false)
}

function isNumericOrMoney(sValue) {
    var sCurrencyPath = /^(?:\$)?(?:\-)?\d{1,3}((?:\,)\d{3})*\.?\d*$/
    return (String(sValue).search(sCurrencyPath) != -1)
}

function isFunction(a) {
    return typeof a == 'function';
}

function isObject(a) {
    return (a && typeof a == 'object') || isFunction(a);
}

function isEmpty(str) {
    return (!str || /^\s*$/.test(str));
}

xdom.dom.getCaretPosition = function (elem) {
    var caret_pos = "0";
    var caret_start = "0";
    var caret_end = "0";
    if (!(elem && elem.value)) return;
    if (elem.isContentEditable || (elem.selectionStart || elem.selectionStart == 0)) {
        caret_start = elem.selectionStart;
        caret_end = elem.selectionEnd;
        if (caret_start != caret_end) {
            caret_pos = caret_start + ',' + caret_end;
        } else {
            caret_pos = caret_start;
        }
    }
    else if (document.selection) {
        elem.focus();
        var selection = document.selection.createRange();
        selection.moveStart('character', -elem.value.length);
        caret_pos = selection.text.length;
    }
    //console.log(elem.id + ': ' + caret_pos);
    return caret_pos;
}

xdom.dom.setCaretPosition = function (elem, caret_pos) {
    if (elem) {
        if (elem != null && !(elem.isContentEditable || (elem.selectionStart || elem.selectionStart == 0) || document.selection)) {
            elem.focus();
        }
        else if (typeof (elem.value) != "undefined") {
            if (elem.createTextRange) {
                var range = elem.createTextRange();
                caret_pos = (String(caret_pos) || "0");
                if (caret_pos.indexOf(",") != -1) {
                    var start = caret_pos.split(",")[0];
                    var end = caret_pos.split(",")[1];
                    if (start > end) {
                        elem.setSelectionRange(end, start, "backward");
                    } else {
                        elem.setSelectionRange(start, end);
                    }
                } else {
                    range.move('character', caret_pos);
                    range.select();
                }
            }
            else {
                if (elem.setSelectionRange && caret_pos != 0) {
                    elem.focus();
                    var start = String(caret_pos).split(",")[0];
                    var end = (String(caret_pos).split(",")[1] || start);
                    if (start > end) {
                        elem.setSelectionRange(end, start, "backward");
                    } else {
                        elem.setSelectionRange(start, end);
                    }
                }
                else
                    elem.focus();
            }
        }
    }
}

xdom.dom.elementVisible = function (el, container) {
    if (container.scrollTop > el.offsetTop || container.scrollLeft > el.offsetLeft) {
        return false;
    }
    return true;
}

xdom.data.getScrollPosition = function (target) {
    var coordinates = ((target || xdom.data.document.documentElement || document.createElement('p')).selectNodes('@state:x-position|@state:y-position') || []).reduce((json, attr) => { json[attr.localName.replace('-position', '')] = attr.value; return json; }, {});
    return coordinates;
}

xdom.dom.getScrollPosition = function (el) {
    var targetDocument = (document.activeElement.contentDocument || document);
    var el = (el || targetDocument.activeElement || targetDocument.querySelector('body'));//(el || window);
    scrollParent = (xdom.dom.getScrollParent(el) || targetDocument.querySelector('body'));
    var coordinates =
    {
        x: (scrollParent.pageXOffset !== undefined ? scrollParent.pageXOffset : scrollParent.scrollLeft),
        y: (scrollParent.pageYOffset !== undefined ? scrollParent.pageYOffset : scrollParent.scrollTop),
        target: scrollParent
    }
    return coordinates;
}


xdom.dom.setScrollPosition = function (el, coordinates) {
    el = (typeof (el) == 'string' && document.querySelector(`#${el}`) || el);
    if (el) {
        if (!(coordinates && el.scrollTo)) {
            return;
        }
        el.scrollTo(coordinates.x, coordinates.y);
    } else {
        Object.entries(xdom.dom.scrollableElements).map(([el, coordinates]) => {
            xdom.dom.setScrollPosition(el, coordinates);
        })
    }
}

xdom.dom.getScrollParent = function (el) {
    if (el == null) {
        return null;
    }
    if (el.scrollHeight > el.clientHeight && (el.scrollTop || el.scrollLeft)) {
        return el;
    } else {
        return xdom.dom.getScrollParent(el.parentNode);
    }
}

xdom.dom.scrollableElements = {};
xdom.dom.getScrollableElements = function (el) {
    var target = (el || document.activeElement.contentDocument || document);
    xdom.data.document.selectAll("//*[@state:x-position]").filter(node => {
        (node.getAttribute("state:x-position") > 0 || node.getAttribute("state:y-position") > 0)/* && document.querySelector(`#${node.getAttribute("x:id")}`)*/
    });
    return [...(el && [el] || []), ...target.querySelectorAll("*")].filter(el => el.scrollHeight > el.clientHeight && (el.scrollTop || el.scrollLeft));
}

xdom.dom.updateScrollableElements = function (el) {
    var target = (el || document.activeElement.contentDocument || document);
    let scrollable = xdom.dom.getScrollableElements(target);
    scrollable.map(el => {
        let coordinates = xdom.dom.getScrollPosition(el);
        if (el.sourceNode) {
            el.sourceNode.setAttribute(`state:x-position`, coordinates.x);
            el.sourceNode.setAttribute(`state:y-position`, coordinates.y);
        }
        if (el.id) {
            xdom.dom.scrollableElements[el.id] = {}
            xdom.dom.scrollableElements[el.id]["x"] = coordinates.x;
            xdom.dom.scrollableElements[el.id]["y"] = coordinates.y;
        }
    });
    xdom.data.document.selectAll("//*[@state:x-position]").filter(node => {
        return (node.getAttribute("state:x-position") > 0 || node.getAttribute("state:y-position") > 0)/* && document.querySelector(`#${node.getAttribute("x:id")}`)*/
    }).map(node => {
        xdom.dom.scrollableElements[node.getAttribute("x:id")] = {}
        xdom.dom.scrollableElements[node.getAttribute("x:id")]["x"] = node.getAttribute("state:x-position");
        xdom.dom.scrollableElements[node.getAttribute("x:id")]["y"] = node.getAttribute("state:y-position");
    });
}

xdom.dom.getNextElement = function (src) {
    src = (src || document.activeElement)
    context = (/*document.querySelector('main form') || */document.querySelector('main'));
    var focussableElements = 'a:not([disabled]), button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
    if (src) {
        var focussable = Array.prototype.filter.call(context.querySelectorAll(focussableElements),
            function (element) {
                //check for visibility while always include the current activeElement 
                return element.offsetWidth > 0 || element.offsetHeight > 0 || element === src
            });
        focussable = focussable.filter(el => el.tabIndex != -1);
        var index = focussable.indexOf(src);
        if (index > -1) {
            var nextElement = focussable[index + 1] || focussable[0];
            return nextElement;
        }
    }
}

xdom.dom.getPrecedingElement = function (src) {
    src = (src || document.activeElement)
    context = (/*document.querySelector('main form') || */document.querySelector('main'));
    var focussableElements = 'a:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
    if (src) {
        var focussable = Array.prototype.filter.call(context.querySelectorAll(focussableElements),
            function (element) {
                //check for visibility while always include the current activeElement 
                return element.offsetWidth > 0 || element.offsetHeight > 0 || element === src
            });
        focussable = focussable.filter(el => el.tabIndex != -1);
        var index = focussable.indexOf(src);
        if (index > -1) {
            var nextElement = focussable[index - 1] || focussable[0];
            return nextElement;
        }
    }
}

xdom.dom.focusNextElement = function () {
    var nextElement = xdom.dom.getNextElement();
    nextElement.focus();
}

xdom.debug.brokenXmlAttributes = function (node) {
    return node.selectAll(`@*`).filter(attr => (!attr.prefix && attr.name.indexOf(':') != -1))
}

xdom.modernize = function (targetWindow) {
    // mozXPath [http://km0ti0n.blunted.co.uk/mozxpath/] km0ti0n@gmail.com
    // Code licensed under Creative Commons Attribution-ShareAlike License
    // http://creativecommons.org/licenses/by-sa/2.5/

    //IXMLDOMSelection.prototype.each = function (method) {
    //    for (var a = 0; a < aResult.length; ++a) {
    //        method.call(aResult[a], a, aResult[a]) //index, element
    //    }
    //};
    var targetWindow = (targetWindow || window);
    if (targetWindow.modernized) return;
    with (targetWindow) {
        function extend(sup, base) {
            var descriptor = Object.getOwnPropertyDescriptor(
                base.prototype, "constructor"
            );
            base.prototype = Object.create(sup.prototype);
            var handler = {
                construct: function (target, args) {
                    var obj = Object.create(base.prototype);
                    this.apply(target, obj, args);
                    return obj;
                },
                apply: function (target, that, args) {
                    sup.apply(that, args);
                    base.apply(that, args);
                }
            };
            var proxy = new Proxy(base, handler);
            descriptor.value = proxy;
            Object.defineProperty(base.prototype, "constructor", descriptor);
            return proxy;
        }

        if (!Object.prototype.hasOwnProperty('push')) {
            Object.defineProperty(Object.prototype, 'push', {
                value: function (key, value) {
                    this[key] = value;
                    return this;
                },
                writable: false, enumerable: false, configurable: false
            });
        }

        if (!Object.prototype.hasOwnProperty('cloneObject')) {
            Object.defineProperty(Object.prototype, 'cloneObject', {
                value: function () {
                    return xdom.json.merge({}, this);//JSON.parse(JSON.stringify(this));
                },
                writable: false, enumerable: false, configurable: false
            });
        }

        if (!Object.prototype.hasOwnProperty('filter')) {
            Object.defineProperty(Object.prototype, 'filter', {
                get: function () {
                    return function (_filter_function) {
                        var subset = {}
                        Object.entries(this).forEach(([key, value]) => {
                            if (_filter_function && _filter_function.apply && _filter_function.apply(this, [key, value])) {
                                subset[key] = value;
                            }
                        })
                        return subset;
                    }
                }, set: function (input) {
                    return;
                }, enumerable: false, configurable: false
            });
        }

        if (!Object.prototype.hasOwnProperty('merge')) {
            Object.defineProperty(Object.prototype, 'merge', {
                value: function () {
                    return xdom.json.merge.apply(this, [this, ...arguments]);
                },
                writable: true, enumerable: false, configurable: false
            });
        }

        if (targetWindow.document.implementation.hasFeature("XPath", "3.0")) {
            if (typeof XMLDocument == "undefined") { XMLDocument = Document; }


            Document.prototype.selectNodes = function (cXPathString, xNode) {
                if (!xNode) { xNode = this; }
                if (xNode instanceof xdom.data.Store) {
                    xNode = (xNode.document || xNode);
                }
                var oNSResolver = xdom.xml.createNSResolver(this.documentElement, xdom.library["xdom/resources/prepare_data.xslt"]);
                oNSResolver.lookupNamespaceURI = oNSResolver;

                var aResult = new Array;
                try {
                    var aItems = (xNode.ownerDocument || xNode).evaluate(cXPathString, xNode, oNSResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
                    for (var i = 0; i < aItems.snapshotLength; i++) {
                        aResult[i] = aItems.snapshotItem(i);
                    }

                    //aResult.__proto__.each = function (method) {
                    //    for (var a = 0; a < aResult.length; ++a) {
                    //        method.call(aResult[a], a, aResult[a]) //index, element
                    //    }
                    //};
                } catch (e) {
                    if (e.message.match(/contains unresolvable namespaces/g) && ((arguments || {}).callee || {}).caller !== XMLDocument.prototype.selectNodes && XMLDocument.prototype.selectNodes.caller !== Element.prototype.selectNodes) {
                        var prefixes = cXPathString.match(/\w+(?=\:)/g);
                        prefixes = [...new Set(prefixes)]; //remueve duplicados
                        let target = xNode;
                        let all_namespaces = xdom.xml.normalizeNamespaces(target).getNamespaces();
                        var new_namespaces = prefixes.filter(prefix => (all_namespaces[prefix] || xdom.xml.namespaces[prefix]))

                        if (new_namespaces.length) {
                            new_namespaces.map(prefix => {
                                (target.documentElement || target).setAttributeNS('http://www.w3.org/2000/xmlns/', `xmlns:${prefix}`, (all_namespaces[prefix] || xdom.xml.namespaces[prefix]));
                            });
                            xNode.selectNodes(cXPathString);
                        } else {
                            throw (e);
                        }
                    } else {
                        throw (e);
                    }
                }

                //Object.defineProperty(aResult, 'remove', {
                //    value: function () {
                //        for (let i = aResult.length - 1; i >= 0; --i) {
                //            var target = aResult.pop();
                //            {
                //                if (target.nodeType == 2/*attribute*/) {
                //                    var attribute_name = target.nodeName;
                //                    var ownerElement = target.ownerElement;
                //                    if (ownerElement) {
                //                        ownerElement.removeAttribute(attribute_name, false);
                //                    }
                //                } else {
                //                    target.parentNode.removeChild(target);
                //                }
                //            }
                //        }
                //        //xdom.dom.refresh();
                //    },
                //    writable: false, enumerable: false, configurable: false
                //});
                //Object.defineProperty(aResult, 'setAttribute', {
                //    value: async function () {
                //        return new Promise((resolve, reject) => {
                //            let promises = []
                //            aResult.map(target => {
                //                if (target instanceof Element || target.nodeType == 1) {
                //                    promises.push(target.setAttribute.apply(target, arguments, false).then(() => {
                //                        console.log('ready individual setAttribute');
                //                        return true;
                //                    }));
                //                }
                //            });
                //            Promise.all(promises).then(() => {
                //                //console.log('all ready');
                //                resolve(true);
                //            })
                //        });
                //    },
                //    writable: false, enumerable: false, configurable: false
                //});
                return new xdom.xml.nodeSet(aResult);
            }
            XMLDocument.prototype.selectAll = XMLDocument.prototype.selectNodes

            //Array.prototype.each = function (method) {
            //    //for (var a in aResult) {
            //    //    method.call(aResult[a], a, aResult[a]) //index, element
            //    //}
            //    return;
            //};
            XMLDocument.prototype.selectSingleNode = function (cXPathString, xNode) {
                if (!xNode) { xNode = this; }
                if (xNode instanceof xdom.data.Store) {
                    xNode = (xNode.document || xNode);
                }
                if (!cXPathString) {
                    return null;
                }
                var xItems = this.selectNodes(`(${cXPathString})[1]`, xNode);
                if (xItems.length > 0) { return xItems[0]; }
                else { return null; }
            }
            XMLDocument.prototype.selectFirst = XMLDocument.prototype.selectSingleNode

            XMLDocument.prototype.toClipboard = function () {
                return xdom.data.toClipboard(this);
            }

            XMLDocument.prototype.getNamespaces = function () {
                return this.documentElement && this.documentElement.getNamespaces() || {};
            }

            HTMLDocument.prototype.getNamespaces = function () {
                return this.documentElement && this.documentElement.getNamespaces() || {};
            }

            Object.defineProperty(Document.prototype, 'node',
                {
                    get: function () {
                        if (this instanceof XMLDocument) {
                            var nodes = {};
                            [...this.children].map(el => {
                                nodes[el.nodeName] = nodes[el.nodeName] || el;
                            });
                            return nodes;
                        }
                    }
                }
            );

            Node.prototype.getStylesheets = function (predicate) {
                var document = (this.document || this.ownerDocument || this);
                if (this instanceof xdom.data.Store) {
                    document.store = this
                }
                if (predicate && predicate.constructor === {}.constructor) {
                    predicate = Object.entries(predicate).reduce((result, [key, value]) => { result += `[contains(.,'${key}="${value}"')]`; return result }, '')
                } else {
                    predicate = (predicate ? `[${predicate}]` : '');
                }
                //let login_stylesheet = xdom.xml.transform((document.documentElement || window.document.createElement('p')).cloneNode(), xdom.library["xdom/resources/session.xslt"]).selectFirst(`processing-instruction('xml-stylesheet')[contains(.,'role="login"') and contains(.,'target="body"')]${predicate}`);
                //var stylesheets_nodes;
                //if (login_stylesheet) {
                //    stylesheets_nodes = [login_stylesheet];
                //}
                //else {
                stylesheets_nodes = document.selectNodes("//processing-instruction('xml-stylesheet')" + predicate);
                //}
                _stylesheets = [];
                for (var s = 0; s < stylesheets_nodes.length; ++s) {
                    let stylesheet = JSON.parse('{' + (stylesheets_nodes[s].data.match(/(\w+)=(["'])([^\2]+?)\2/ig) || []).join(", ").replace(/(\w+)=(["'])([^\2]+?)\2/ig, '"$1":$2$3$2') + '}');
                    Object.defineProperty(stylesheet, 'ownerDocument', {
                        value: document
                    });
                    Object.defineProperty(stylesheet, 'document', {
                        get: function () {
                            return ((this.ownerDocument.store || {}).library || {})[this.href] || xdom.library[this.href]
                        }
                    });

                    _stylesheets.push(stylesheet);
                }
                Object.defineProperty(_stylesheets, 'ownerDocument', {
                    get: function () {
                        return document;
                    }
                });
                Object.defineProperty(_stylesheets, 'remove', {
                    value: function () {
                        for (let stylesheet of this) {
                            var target = this.ownerDocument.getStylesheet({ href: stylesheet.href });
                            if (target) target.remove();
                        }
                        //xdom.dom.refresh();
                    },
                    writable: false, enumerable: false, configurable: false
                });
                Object.defineProperty(_stylesheets, 'getDocuments', {
                    value: async function () {
                        let docs = []
                        for (let stylesheet of this) {
                            docs.push(this.ownerDocument.store.library[stylesheet.href] || xdom.library[stylesheet.href])
                        }
                        return Promise.all(docs);
                    },
                    writable: false, enumerable: false, configurable: false
                });
                return _stylesheets;
            }

            XMLDocument.prototype.getStylesheet = function (predicate) {
                let document = (this.document || this);

                if (predicate && predicate.constructor === {}.constructor) {
                    predicate = Object.entries(predicate).reduce((result, [key, value]) => { result += `[contains(.,'${key}="${value}"')]`; return result }, '')
                } else {
                    predicate = (predicate ? `[contains(.,'href="${predicate}"')]` : '');
                }
                return document.selectSingleNode(`//processing-instruction('xml-stylesheet')${predicate}`);
            }

            XMLDocument.prototype.addStylesheet = function (definition, target) {
                let style_definition;
                let document = (this.document || this);
                if (definition.constructor === {}.constructor) {
                    definition = xdom.json.merge({ type: 'text/xsl' }, definition);
                    style_definition = xdom.json.join(definition);
                } else {
                    style_definition = definition
                }
                if (!this.getStylesheet(definition.href)) {
                    var pi = document.createProcessingInstruction('xml-stylesheet', style_definition);
                    if (this.store) {
                        this.store.render(true);
                    }
                    document.insertBefore(pi, target || document.selectSingleNode(`(processing-instruction('xml-stylesheet')${definition.role == 'init' ? '' : definition.role == 'binding' ? `[not(contains(.,'role="init"') or contains(.,'role="binding"'))]` : '[1=0]'} | *[1])[1]`));
                    return pi;
                }
            }

            XMLDocument.prototype.toString = function () {
                return xdom.xml.toString(this);
            }

            var toString_original = Element.prototype.toString;
            Element.prototype.toString = function () {
                if (!this.ownerDocument.selectSingleNode) {
                    return toString_original
                } else {
                    return xdom.xml.toString(this);
                }
            }

            if (!Element.prototype.hasOwnProperty('sourceNode')) {
                Object.defineProperty(Element.prototype, 'sourceNode', { /*Estaba con HTMLElement, pero los SVG los ignoraba. Se deja abierto para cualquier elemento*/
                    get: function () {
                        let store = this.store;
                        if (!store) {
                            return null;
                        } else {
                            let node = store.find(this.getAttribute("xo-target")) || store.find(this.name) || store.find(this.id);
                            //let attribute = (node || store.documentElement || this).getAttribute(`@${this.getAttribute("xo-attribute")}`);
                            //return attribute || node || store;
                            return node;
                        }
                    }
                });
            }

            if (!HTMLElement.prototype.hasOwnProperty('queryChildren')) {
                Object.defineProperty(HTMLElement.prototype, 'queryChildren', {
                    value: function (selector) {
                        return [...this.children].filter((child) => child.matches(selector))
                    },
                    writable: false, enumerable: false, configurable: false
                });
            }

            if (!Element.prototype.hasOwnProperty('store')) {
                Object.defineProperty(Element.prototype, 'store', {
                    get: function () {
                        let store = this.closest("[xo-source]") && xdom.data.stores[this.closest("[xo-source]").getAttribute("xo-source")];
                        return store;
                    }
                });
            }

            XMLDocument.prototype.normalizeNamespaces = function () {
                return xdom.xml.normalizeNamespaces(this);
            }

            Element.prototype.remove = function () {
                let parent = this.parentElement;
                //this.ownerDocument.store = (this.ownerDocument.store || xdom.data.stores[xdom.data.hashTagName(this.ownerDocument)]) /*Se comenta para que quede el antecedente de que puede traer problemas de desempeño este enfoque. Nada grave*/
                if (this.ownerDocument.store) { /*Asumimos que el store es administrador correctamente por la misma clase. Garantizar que se mantenga la referencia*/
                    this.ownerDocument.store.takeSnapshot();
                }
                originalRemove.apply(this, arguments);
                if (this.ownerDocument.selectSingleNode && this.ownerDocument.store) {
                    //let refresh = !parent.selectFirst('//@state:refresh');
                    //if (refresh) {
                    //this.ownerDocument.store = (this.ownerDocument.store || xdom.data.stores[xdom.data.hashTagName(this.ownerDocument)])
                    if (parent && this.ownerDocument.store) {
                        parent.setAttributeNS(xdom.xml.namespaces["state"], "state:refresh", "true");
                        xdom.callStack.add({ src: this, method: arguments.callee });
                        //parent = (parent.ownerDocument.store.find(parent) || parent); //Se quita para que la operación de borrado sólo ocurra en el documento actual
                        xdom.dom.refresh()
                        xdom.callStack.remove({ src: this, method: arguments.callee });
                    }
                    //}
                    //parent.setAttribute("state:refresh", "true");
                    //parent.ownerDocument.store = (parent.ownerDocument.store || xdom.data.stores[xdom.data.hashTagName(parent.ownerDocument)]);
                    //parent.setAttributeNS(xdom.xml.namespaces["state"], "state:refresh", "true");
                    //return new Promise(resolve => {
                    //    setTimeout(() => {
                    //        xdom.data.document.render();
                    //        resolve(true);
                    //    }, 50);
                    //});
                }
            }

            Element.prototype.setAttributes = async function (attributes, refresh, delay) {
                if (!attributes) return;
                if (!isNaN(parseInt(delay))) {
                    await xdom.delay(delay);
                }
                self = this
                var responses = [];
                !(attributes.length) && Object.entries(attributes).forEach(([attribute, value]) => {
                    if (self.setAttribute) {
                        responses.push(self.setAttribute(attribute, value, refresh));
                    }
                });
                return responses;
            }

            var original_textContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
            Object.defineProperty(Node.prototype, 'textContent',
                // Passing innerText or innerText.get directly does not work,
                // wrapper function is required.
                {
                    get: function () {
                        return original_textContent.get.call(this);
                    },
                    set: function (value) {
                        if (this.textContent != value) {
                            original_textContent.set.call(this, value);
                            if (this.namespaceURI && this.namespaceURI.indexOf('www.w3.org') != -1 && this.selectSingleNode(`//xsl:comment/text()[contains(.,'Session stylesheet')]`)) {
                                xdom.data.document.documentElement && xdom.data.document.documentElement.setAttributeNS(xdom.xml.namespaces["state"], "state:refresh", "true");
                            } else if (this.ownerDocument && this.ownerDocument.selectSingleNode && this.ownerDocument.store) {
                                this.setAttributeNS(xdom.xml.namespaces["state"], "state:refresh", "true");
                                this.ownerDocument.store.render();
                            }
                            return original_textContent.set.call(this, value);
                        } else {
                            return original_textContent.set.call(this, value);
                        }
                    }
                }
            );

            Object.defineProperty(Node.prototype, 'node',
                {
                    get: function () {
                        if (this.ownerDocument instanceof XMLDocument) {
                            var nodes = {};
                            [...this.children].map(el => {
                                nodes[el.nodeName] = el;
                            });
                            return nodes;
                        }
                    }
                }
            );

            Object.defineProperty(Node.prototype, 'nodes',
                {
                    get: function () {
                        if (this.ownerDocument instanceof XMLDocument) {
                            var nodes = {};
                            [...this.children].map(el => {
                                nodes[el.nodeName] = (nodes[el.nodeName] || []);
                                nodes[el.nodeName].push(el);
                            });
                            return nodes;
                        }
                    }
                }
            );

            var element_proxy = new Proxy(Node, {
                get: function (target, name) {
                    return target[name];
                },
                set: async function (target, name, value) {
                    let refresh;
                    if (value && ['object', 'function'].includes(typeof (value))) {
                        throw ('State value is not valid type');
                    }
                    if (target[name] != value) {
                        refresh = true
                    }
                    target[name] = value
                    var return_value
                    if (refresh) {
                        var name = name, value = value;
                        await self.library.load();
                        if ([...Object.values(self.library || {})].filter(stylesheet => {
                            return !!(stylesheet || window.document.createElement('p')).selectFirst(`//xsl:stylesheet/xsl:param[@name='state:${name}']`)
                        }).length) {
                            console.log(`Rendering ${document.tag} triggered by state:${name}`);
                            self.render(true);
                        };
                    }
                }
            })

            var setAttributeNS_original = Element.prototype.setAttributeNS;
            Element.prototype.setAttributeNS = function (namespaceURI, attribute, value) {
                let { prefix, name: attribute_name } = xdom.xml.getAttributeParts(attribute);
                if (this.getNamespaces()[prefix] && this.getAttribute("xmlns:" + prefix)) {
                    this.removeAttribute("xmlns:" + prefix, false);
                }
                namespaceURI = (namespaceURI || this.getNamespaces()[prefix] || xdom.xml.normalizeNamespaces(this.ownerDocument).getNamespaces()[prefix] || xdom.xml.namespaces[prefix]);
                setAttributeNS_original.call(this, namespaceURI, attribute, value);

            }

            var getAttribute_original = Element.prototype.getAttribute;
            Element.prototype.getAttribute = function (attribute) {
                if (this.ownerDocument && this.ownerDocument.store) {
                    attribute = attribute.replace(/^@/, "");
                }
                return getAttribute_original.call(this, attribute);
            }

            var setAttribute_original = Element.prototype.setAttribute;
            Element.prototype.setAttribute = async function (attribute, value, refresh, delay) {
                if (this.ownerDocument && this.ownerDocument.store) {
                    attribute = attribute.replace(/^@/, "");
                }
                attribute = attribute.replace(/^@/, "");

                let target = (this.ownerDocument && this.ownerDocument.store && this.ownerDocument.store.find(this) || this);
                var oldValue = target.getAttribute(attribute);

                let { prefix, name: attribute_name } = xdom.xml.getAttributeParts(attribute);
                let namespaceURI = (prefix && (xdom.xml.normalizeNamespaces(target.ownerDocument).getNamespaces()[prefix] || xdom.xml.namespaces[prefix]));
                //let namespaceURI = (prefix && (xdom.xml.normalizeNamespaces(target.ownerDocument).getNamespaces()[prefix] || xdom.xml.namespaces[prefix]));

                //if (this.ownerDocument && this.ownerDocument.store && value == undefined) {
                //    this.removeAttribute(attribute);
                //}
                if (namespaceURI) {
                    this.setAttributeNS(namespaceURI, attribute, value);
                } else {
                    setAttribute_original.call(target, attribute, value);
                }
                if (!target.ownerDocument.store || (target.namespaceURI || '').indexOf('http://www.w3.org') != -1) {
                    return;
                }
                if (((xdom.manifest.server || {}).endpoints || {}).login && !(xdom.session.status == 'authorized')) {
                    if (namespaceURI) {
                        setAttributeNS_original.call(target, namespaceURI, attribute, oldValue);
                    } else {
                        setAttribute_original.call(target, namespaceURI, attribute, oldValue);
                    }
                    return;
                }

                //await xdom.session.checkStatus();
                if (["x:value", "x:deleting", "x:checked"].includes(attribute)) {
                    this.ownerDocument.store.takeSnapshot()
                    if (target.getAttribute("initial:" + attribute_name) === undefined) {
                        target.setAttributeNS(xdom.xml.namespaces["initial"], "initial:" + attribute_name, oldValue, refresh);
                    }
                }
                var refresh = xdom.data.coalesce(refresh, true);
                if (oldValue != value) { //se compara contra "this" para que se haga referencia al nodo que disparó el cambio. Este valor puede ser diferente al del "target"
                    //xdom.callStack.add({ src: this, method: arguments.callee });
                    if (value === undefined) {
                        target.removeAttribute(attribute, refresh);
                        this.removeAttribute(attribute, refresh);
                        if (refresh) {
                            target.setAttributeNS(xdom.xml.namespaces["state"], "state:refresh", "true", refresh);
                        }
                    } else {
                        if (!(["xml", "xmlns"].includes(prefix))) {
                            let trigger_attribute_change = true;
                            target.setAttributeNS(undefined, attribute, value, refresh);

                            if (["init"].includes(attribute_name) && xdom.xml.namespaces[prefix].indexOf("http://panax.io") != -1 || ["prev"].includes(prefix)) {
                                trigger_attribute_change = false;
                                refresh = false;
                            }
                            else {
                                if (refresh === false || target.ownerDocument.store.state.rendering) {
                                    refresh = false;
                                } else {
                                    target.setAttributeNS(xdom.xml.namespaces["state"], "state:refresh", "true", refresh);
                                }
                                target.setAttributeNS(xdom.xml.namespaces["state"], "state:changed", "true", refresh);
                            }
                            if (trigger_attribute_change) {
                                //xdom.listeners.xml.changingAttribute(target, attribute, value);
                                window.top.dispatchEvent(new CustomEvent('attributeChanged', { detail: { node: target, attribute: attribute, value: value, oldValue: oldValue } }));
                            }
                        } else {
                            setAttribute_original.call(target, attribute, value);
                            if (["xmlns"].includes(prefix)) {
                                refresh = false;
                            }
                        }

                        if ((["x:value", "x:text"].includes(attribute))) {
                            target.setAttributeNS(xdom.xml.namespaces["prev"], "prev:" + attribute_name, (oldValue || ""));
                        }
                    }

                    if (refresh) return this.ownerDocument.store.render();
                }
            }

            Element.prototype.removeAttribute = function (attribute, refresh) {
                if (this.ownerDocument.selectSingleNode && this.ownerDocument.store) {
                    if (attribute != 'state:refresh' && ((xdom.manifest.server || {}).endpoints || {}).login && !(xdom.session.status == 'authorized')) {
                        return;
                    }
                    let { prefix, name: attribute_name } = xdom.xml.getAttributeParts(attribute);
                    xdom.callStack.add({ src: this, method: arguments.callee });
                    var refresh = xdom.data.coalesce(refresh, !(["xml", "xmlns"].includes(prefix) || attribute == 'state:refresh'));
                    originalRemoveAttribute.apply(this, arguments);
                    if (refresh) {
                        this.ownerDocument.store.render(refresh);
                    }
                    xdom.callStack.remove({ src: this, method: arguments.callee });
                } else {
                    originalRemoveAttribute.apply(this, arguments);
                }
            }

            Attr.prototype.selectSingleNode = function (cXPathString) {
                if (this.ownerDocument.selectSingleNode) {
                    return this.ownerDocument.selectSingleNode(cXPathString, this);
                }
                else {
                    throw "For XML Elements Only";
                }
            }

            let original_ProcessingInstruction_remove = ProcessingInstruction.prototype.remove;
            ProcessingInstruction.prototype.remove = function (refresh) {
                original_ProcessingInstruction_remove.apply(this, arguments);
                if (this.ownerDocument && this.ownerDocument.store) {
                    this.ownerDocument.store.render(xdom.data.coalesce(refresh, true));
                }
            }

            ProcessingInstruction.prototype.replaceBy = function (new_element) {
                this.parentNode.insertBefore(new_element, this);
                original_ProcessingInstruction_remove.apply(this, arguments);
                //if (this.ownerDocument && this.ownerDocument.store) { //TODO: Revisar si es necesario renderear
                //    this.ownerDocument.store.render(xdom.data.coalesce(refresh, false));
                //}
            }

            Attr.prototype.remove = function (refresh) {
                var refresh = xdom.data.coalesce(refresh, true);
                if (this.ownerDocument.selectSingleNode) {
                    let ownerElement = this.ownerElement;
                    if (ownerElement) {
                        return ownerElement.removeAttribute(this.name, refresh);
                    }
                }
                else {
                    throw "For XML Attributes Only";
                }
            }

            Element.prototype.getNamespaces = function () {
                if (this instanceof HTMLElement) {
                    return {};
                } else {
                    var xsltProcessor = new XSLTProcessor();
                    xsltProcessor.importStylesheet(xdom.xml.createDocument(`
                <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:source="http://panax.io/xdom/binding/source">
                  <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
                  <xsl:template match="*" priority="-1">
                    <output>
                        <xsl:for-each select="current()/namespace::*">
                            <xsl:variable name="current-namespace" select="."/>
                            <xsl:variable name="prefix" select="name(.)"/>
                            <xsl:if test=".!='http://www.w3.org/XML/1998/namespace'">
                              <xsl:value-of select="concat(' ','xmlns')"/>
                              <xsl:if test="name(.)!=''">
                                <xsl:value-of select="concat(':',name(.))"/>
                              </xsl:if>
                              <xsl:text>="</xsl:text>
                              <xsl:value-of select="." disable-output-escaping="yes"/>
                              <xsl:text>"</xsl:text>
                            </xsl:if>
                        </xsl:for-each>
                    </output>
                  </xsl:template>
                </xsl:stylesheet>
                `));
                    try {
                        return JSON.parse('{' + xsltProcessor.transformToDocument(this).documentElement.textContent.replace(/(xmlns)=(["'])([^\2]+?)\2/ig, '').replace(/xmlns:(\w+)=(["'])([^\2]+?)\2/ig, ',"$1":$2$3$2').replace(/^[\s,]+/, '') + '}');
                    } catch (e) {
                        return {}
                    }

                }
            }

            Element.prototype.selectNodes = function (cXPathString) {
                if (this.ownerDocument.selectNodes) { return this.ownerDocument.selectNodes(cXPathString, this); }
                //else {
                //    throw "For XML Elements Only";
                //}
            }



            Element.prototype.selectAll = Element.prototype.selectNodes

            Element.prototype.selectSingleNode = function (cXPathString) {
                if (this.ownerDocument.selectSingleNode) {
                    return this.ownerDocument.selectSingleNode(cXPathString, this);
                }
                //else {
                //    throw "For XML Elements Only";
                //}
            }
            Element.prototype.selectFirst = Element.prototype.selectSingleNode
            Element.prototype.select = Element.prototype.selectSingleNode

            var insertBefore = Element.prototype.insertBefore
            Element.prototype.insertBefore = function (new_node, target) {
                if (this.ownerDocument.selectSingleNode) {
                    if (((xdom.manifest.server || {}).endpoints || {}).login && !(xdom.session.status == 'authorized')) {
                        return;
                    }
                    xdom.callStack.add({ src: this, method: arguments.callee });
                    insertBefore.apply(this, arguments);
                    if (this.selectSingleNode(`//xsl:comment/text()[contains(.,'Session stylesheet')]`)) {
                        /*Update of session variables*/
                        let attribute = new_node;
                        Object.values(xdom.data.stores).map(store => {
                            (store.documentElement || document.createElement("p")).setAttribute(attribute.getAttribute("name"), attribute.textContent.replace(/[\s]+$/, ''));
                        });
                    }
                    xdom.callStack.remove({ src: this, method: arguments.callee });
                } else {
                    insertBefore.apply(this, arguments);
                }
            }

            Element.prototype.replaceChild = function (new_node, target, refresh) {
                if (this.ownerDocument.selectSingleNode) {
                    if (((xdom.manifest.server || {}).endpoints || {}).login && !(xdom.session.status == 'authorized')) {
                        return;
                    }
                    //var refresh = (refresh ?? !!xdom.data.stores.getActive()[this.ownerDocument.store.tag]);
                    this.ownerDocument.documentElement.setAttributeNS(xdom.xml.namespaces["state"], 'state:refresh', 'true', refresh);
                    //xdom.callStack.add({ src: this, method: arguments.callee });
                    replaceChild_original.apply(this, arguments);
                    if (this.selectSingleNode(`//xsl:comment/text()[contains(.,'Session stylesheet')]`)) {
                        /*Update of session variables*/
                        let attribute = new_node;
                        Object.values(xdom.data.stores).map(store => {
                            (store.documentElement || document.createElement("p")).setAttribute(attribute.getAttribute("name"), attribute.textContent.replace(/[\s]+$/, ''));
                        });
                    }
                    //xdom.callStack.remove({ src: this, method: arguments.callee });
                } else {
                    replaceChild_original.apply(this, arguments);
                }
            }

            Element.prototype.replace = function (new_node) {
                this.parentNode.replaceChild(new_node, this);
            }

            Element.prototype.appendAfter = function (new_node) {
                if (typeof (new_node.selectSingleNode) != 'undefined' && this.ownerDocument.selectSingleNode) {
                    xdom.callStack.add({ src: this, method: arguments.callee });
                    this.parentNode.insertBefore((new_node.documentElement || new_node), this.nextElementSibling);
                    xdom.callStack.remove({ src: this, method: arguments.callee });
                }
                else {
                    throw "For XML Elements Only";
                }
            }

            Element.prototype.appendBefore = function (new_node) {
                if (this.ownerDocument.selectSingleNode) {
                    xdom.callStack.add({ src: this, method: arguments.callee });
                    this.parentNode.insertBefore((new_node.documentElement || new_node), this);
                    xdom.callStack.remove({ src: this, method: arguments.callee });
                }
                else {
                    throw "For XML Elements Only";
                }
            }

            var appendChild_original = Element.prototype.appendChild
            Element.prototype.appendChild = function (new_node, refresh) {
                let self = (this.ownerDocument && this.ownerDocument.store && this.ownerDocument.store.find(this) || this);
                if (!self.ownerDocument.selectSingleNode) {
                    return appendChild_original.apply(self, arguments);
                }
                refresh = xdom.data.coalesce(refresh, true);
                if (refresh && new_node && self.ownerDocument.store /*self.ownerDocument.documentElement.selectFirst('//@x:id')*/) {
                    new_node = xdom.xml.reseed(new_node).documentElement;
                    var refresh = xdom.data.coalesce(refresh, true);
                    //if (refresh && !(self.namespaceURI && self.namespaceURI.indexOf('www.w3.org') != -1)) {
                    //    self.ownerDocument.documentElement.setAttributeNS(xdom.xml.namespaces["state"], 'state:refresh', 'true');
                    //}
                    appendChild_original.apply(self, [new_node]);
                    //xdom.delay(50).then(() => {
                    self.ownerDocument.store.render(refresh);
                    //});
                } else {
                    return appendChild_original.apply(self, arguments);
                }
            }

            Date.prototype.toISOString = function () {/*Current method ignores z-time offset*/
                var tzo = -this.getTimezoneOffset(),
                    dif = tzo >= 0 ? '+' : '-',
                    pad = function (num) {
                        var norm = Math.floor(Math.abs(num));
                        return (norm < 10 ? '0' : '') + norm;
                    };

                return this.getFullYear() +
                    '-' + pad(this.getMonth() + 1) +
                    '-' + pad(this.getDate()) +
                    'T' + pad(this.getHours()) +
                    ':' + pad(this.getMinutes()) +
                    ':' + pad(this.getSeconds()) +
                    '.' + pad(this.getMilliseconds()) +
                    'Z';
            }
        }

        // Production steps of ECMA-262, Edition 5, 15.4.4.18
        // Reference: http://es5.github.com/#x15.4.4.18
        if (!Array.prototype.forEach) {
            Array.prototype.forEach = function forEach(callback, thisArg) {
                'use strict';
                var T, k;

                if (this == null) {
                    throw new TypeError("this is null or not defined");
                }

                var kValue,
                    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
                    O = Object(this),

                    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
                    // 3. Let len be ToUint32(lenValue).
                    len = O.length >>> 0; // Hack to convert O.length to a UInt32

                // 4. If IsCallable(callback) is false, throw a TypeError exception.
                // See: http://es5.github.com/#x9.11
                if ({}.toString.call(callback) !== "[object Function]") {
                    throw new TypeError(callback + " is not a function");
                }

                // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length >= 2) {
                    T = thisArg;
                }

                // 6. Let k be 0
                k = 0;

                // 7. Repeat, while k < len
                while (k < len) {

                    // a. Let Pk be ToString(k).
                    //   This is implicit for LHS operands of the in operator
                    // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                    //   This step can be combined with c
                    // c. If kPresent is true, then
                    if (k in O) {

                        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                        kValue = O[k];

                        // ii. Call the Call internal method of callback with T as the this value and
                        // argument list containing kValue, k, and O.
                        callback.call(T, kValue, k, O);
                    }
                    // d. Increase k by 1.
                    k++;
                }
                // 8. return undefined
            };
        }
        targetWindow.modernized = true;
    }
}


//sessionStorage = (sessionStorage || {});

//var tabID = sessionStorage.tabID && sessionStorage.closedLastTab !== '2' ? sessionStorage.tabID : sessionStorage.tabID = Math.random();
//sessionStorage.closedLastTab = '2';
//$(window).on('unload beforeunload', function () {
//    sessionStorage.closedLastTab = '1';
//});

xdom.modernize();

//xdom.dom.validateHash = function (new_hash) {
//    if (xdom.data.stores[new_hash]) {
//        return true;
//    }
//    return false;
//}

function hashHandler() { //Source https://stackoverflow.com/questions/6390341/how-to-detect-url-change-in-javascript
    this.oldHash = (window.top || window).location.hash;
    this.Check;

    var that = this;
    var detect = function () {
        //if (that.oldHash != (window.top || window).location.hash && (window.top || window).location.hash == '' && window.location.href.match(/#$/)) {
        //    that.oldHash = (window.top || window).location.hash;
        //    window.history.back();
        //}
        if (that.oldHash != (window.top || window).location.hash) {
            var force_refresh = true
            xdom.data.stores.detectActive();
            xdom.listeners.dom.onHashChange((window.top || window).location.hash, that.oldHash);
            console.info("navigated to: " + (window.top || window).location.hash);

            if (!xdom.data.stores[(window.top || window).location.hash]) {
                location.replace(window.location.href.replace(/#.*$/g, '') + (xdom.state.active || "#"));
                console.info("Regresando a " + (xdom.state.active || "#"));
                force_refresh = true
            }
            if (xdom.data.stores[(window.top || window).location.hash] && xdom.dom.history[xdom.dom.history.length - 1] != (window.top || window).location.hash) {
                xdom.dom.history.push((window.top || window).location.hash);
            }
            if (xdom.data.document && xdom.data.document.documentElement) {
                eval((xdom.data.document || document.createElement('p')).documentElement.getAttribute('x:onunload') || function () { })();
            }
            //if (xdom.dom.validateHash((window.top || window).location.hash)) {
            that.oldHash = (window.top || window).location.hash;
            xdom.dom.refresh({ forced: force_refresh });
            //}
            //else {
            //    xdom.dom.navigateTo(that.oldHash)
            //}
            //window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
        }
    };
    this.Check = setInterval(function () {
        if (xdom.debug.enabled) { clearInterval(that.Check) }
        detect()
    }, 100);
    detect();
}

//var hashDetection = new hashHandler();

xdom.dom.updateHash = function (public_hashtag) {
    var current_hash = (window.top || window).location.hash;
    if (current_hash == public_hashtag) {
        return;
    }
    history.replaceState((history.state || {}), ((event || {}).target || {}).textContent, public_hashtag);
}

xdom.dom.navigateTo = function (hashtag, public_hashtag) {
    if (xdom.session.status != 'authorized') {
        return;
    }
    hashtag = (hashtag || "").replace(/^([^#])/, '#$1');
    xdom.state.update({ next: hashtag });

    public_hashtag = xdom.data.coalesce(public_hashtag || hashtag)
    var prev = (history.state["prev"] || [])
    prev.unshift(history.state.active)
    history.pushState({
        seed: hashtag
        , active: hashtag
        , prev: prev
    }, ((event || {}).target || {}).textContent, public_hashtag);
    xdom.data.document.render(true);
    //window.location = window.location.href.replace(/#.*$/g, '') + xdom.state.active;
}

xdom.dom.clickHandler = function (event) {
    var srcElement = xdom.dom.findClosestElementWithAttribute(event.target, "href");
    var hashtag = (srcElement ? srcElement.getAttribute("href") : "");

    if (!hashtag.match(/^#/)) {
        return;
    }
    if (hashtag !== undefined && hashtag != (window.top || window).location.hash) {
        hashtag = xdom.listeners.dom.onHashChange(hashtag, (window.top || window).location.hash);
    }
    if (xdom.data.stores[hashtag]) {
        xdom.dom.navigateTo(hashtag);
    } else {
        return event.preventDefault();
    }
}

xdom.dom.toExcel = (function () {
    //from https://stackoverflow.com/questions/17142427/javascript-to-export-html-table-to-excel
    var uri = 'data:application/vnd.ms-excel;base64,'
        , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
        , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
        , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
    return function (table, name) {
        if (!table.nodeType) table = document.getElementById(table)
        table = table.cloneNode(true);
        [...table.querySelectorAll('.non_printable')].forEach(el => el.remove())
        var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
        window.location.href = uri + base64(format(template, ctx))
    }
})();

window.addEventListener('popstate', async function (event) {
    if (this.popping) {
        this.popping().cancel();
        //let current_hash = xdom.data.hashTagName();
        //history.replaceState({
        //    hash: current_hash
        //    , prev: ((history.state || {}).prev || [])
        //}, event.target.textContent, current_hash);
        this.popping = undefined;
    }
    function popstate() {
        let finished = false;
        let cancel = () => finished = true;
        xdom.session.database_id = xdom.session.database_id;
        const promise = new Promise((resolve, reject) => {
            setTimeout(async () => {
                var referencee, referencer, datarows;
                //xdom.state.active = history.state.hash;
                if (history.state && history.state.next && xdom.data.stores[history.state.next]) {
                    referencee = xdom.data.stores[history.state.next].selectSingleNode("//*[@x:reference and //@state:submitted='true']");
                }
                if (referencee) {
                    datarows = referencee.selectNodes('px:data/px:dataRow');
                    referencer = xdom.data.find(referencee.getAttribute('x:reference'));
                }
                if (referencee && referencer && datarows) {
                    for (var datarow of datarows) {
                        //var target = xdom.data.find(datarow, referencer);
                        //if (target) {
                        xdom.data.replace(referencer, datarow);
                        //} else if (referencer.selectSingleNode('self::px:dataRow')) {
                        //    xdom.dom.insertAfter(datarow, referencer);
                        //} else if (!referencer.selectSingleNode('px:data')) {
                        //    referencer.appendChild(datarow.parentNode);
                        //}
                        //else {
                        //    referencer.selectSingleNode('px:data').appendChild(datarow);
                        //}
                    }
                }
                let hashtag = ((window.top || window).location.hash || '#')
                if (history.state && history.state.data) {
                    xdom.data.document = xdom.xml.createDocument(history.state.data)
                    //await xdom.dom.refresh(); //Cuando se asigna a xdom.data.document, se hace automáticamente un refresh
                } else if (xdom.data.stores[hashtag]) {
                    xdom.data.document = xdom.data.stores[hashtag];
                    console.log("Navigated to " + hashtag);
                } else if (xdom.manifest.sources[hashtag]) {
                    await xdom.manifest.sources[hashtag].fetch({ as: hashtag });
                    console.log("Navigated to " + hashtag);
                } else {
                    let current_hash = xdom.data.hashTagName();
                    history.replaceState({
                        hash: current_hash
                        , prev: ((history.state || {}).prev || [])
                    }, ((event || {}).target || {}).textContent, current_hash);
                }
                resolve();
            }, 500);
            // When consumer calls `cancel`:
            cancel = () => {
                // In case the promise has already resolved/rejected, don't run cancel behavior!
                if (finished) {
                    return;
                }
                reject();
            };

            // If was cancelled before promise was launched, trigger cancel logic
            if (finished) {
                // (to avoid duplication, just calling `cancel`)
                cancel();
            }
        }).then((resolvedValue) => {
            this.popping = undefined;
            finished = true;
            return resolvedValue;
        }).catch((err) => {
            finished = true;
            return err;
        });
        return { promise, cancel }
    }
    this.popping = popstate;
    this.popping();

});
//history.replaceState({
//    hash: (window.top || window).location.hash
//}, document.title, document.location.href);

//(async () => await xdom.fetch.json('.manifest').then(json => xdom.manifest = (json || {})))();

xdom.listeners.events.add('submitSuccess', async function (event) {
    console.log("from xdom " + xdom.listeners.events['submitSuccess'].length)
})

//window.addEventListener('submitSuccess', async function (event) {
//    console.log("from xdom")
//})