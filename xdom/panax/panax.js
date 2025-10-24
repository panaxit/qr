var px = {};
px.data = {};
px.dom = {};
xdom.xml.namespaces["px"] = "http://panax.io";
px.data.hashTagName = function (document) {
    var data = (document || xdom.data.document).selectSingleNode("/*[1]");
    var entity = px.getEntityInfo(data);
    if (entity != undefined && data) {
        return '#' + (entity["schema"] + '/' + entity["mode"] || 'view').toLowerCase() + ':' + data.localName.toLowerCase();
    } else if (data) {
        return '#' + xdom.data.coalesce(data.getAttribute("x:tag"), data.getAttribute("x:id"), data.localName.toLowerCase());
    } else {
        return '#';
    }
}
xdom.data.hashTagName = px.data.hashTagName;

px.data.checkAll = function (id, checked) {
    var data_rows = xdom.data.find(id).selectNodes('px:data/px:dataRow');
    xdom.data.setAttribute(data_rows, "@x:checked", String(checked))
    xdom.dom.refresh()
}
xdom.data.checkAll = px.data.checkAll;

px.dom.onHashChange = function (new_hash, old_hash) {
    var new_hash = (new_hash || window.location.hash);
    var page = (new_hash.match(/#(\d+)$/) || [])[1]
    if (page) {
        var data = xdom.data.document.selectSingleNode("/*[1]");
        var request = px.getEntityInfo(data);
        request["pageIndex"] = page;
        px.request(request);
    }
    //xdom.data.document = (xdom.data.stores[new_hash] || xdom.data.document);
}

xdom.listeners.dom.onHashChange = px.dom.onHashChange;

xdom.listeners.events.add('attributeChanged', function (event) {
    let { node, attribute, value } = event.detail;
    if (["mode", "pageSize", "pageIndex", "filters"].includes(attribute) && xdom.data.document.document.contains(node) && node.ownerDocument.documentElement.getAttribute("mode") && node.ownerDocument.documentElement.getAttribute("Name")) {
        px.request(px.getEntityInfo(node.ownerDocument));
    }
})

px.getEntityInfo = function (input_document) {
    var current_document = (input_document || xdom.data.stores[(window.location.hash || "#")]);
    if (!current_document) return undefined;
    var entity;
    current_document = (current_document.documentElement || current_document)
    if (current_document && current_document.getAttribute && current_document.getAttribute("mode") && current_document.getAttribute("Name")) {
        entity = {}
        entity["schema"] = current_document.getAttribute("Schema");
        entity["name"] = current_document.getAttribute("Name");
        entity["mode"] = current_document.getAttribute("mode");
        entity["pageIndex"] = current_document.getAttribute("pageIndex");
        entity["pageSize"] = current_document.getAttribute("pageSize");
        entity["filters"] = (current_document.getAttribute("filters") || ''); //Se reemplazan las comillas simples por dobles comillas simples. Revisar si esto se puede hacer en px.request
    }
    return entity;
}

px.removeRecord = function (ref) {
    var row = xdom.data.find(ref);
    if (!row.getAttribute('identity')) {
        xdom.data.remove(row);
        xdom.dom.refresh();
    } else {
        row.setAttribute('x:deleting', 'true');
    }
}


xdom.listeners.events.add('xmlTransformed', function (event) {
    let { original, transformed } = event.detail;
    if (!(original && transformed)) { return; }
    let px_original = px.getEntityInfo(original);
    let px_transformed = px.getEntityInfo(transformed);
    if (px_original && px_transformed && px_transformed["filters"] != px_original["filters"]) {
        xdom.delay(50).then(() => px.request(px_transformed));
    }
})

Object.defineProperty(xdom.manifest, 'getConfig', {
    value: function (entity_name, property_name) {
        if (entity_name.match(/#(.+)\/(.+):(.+)/)) {
            const [, schema, mode, name] = entity_name.match(/#(.+)\/(.+):(.+)/);
            return (Object.values(xdom.manifest.modules.filter((key, value) => {
                return key.match(new RegExp(`#(${schema})\/(.*[\[\|]${mode}\\b.*\]|${mode}):(${name})`, 'gi')) && (value || {})[property_name]
            }))[0] || Object.values(xdom.manifest.modules.filter((key, value) => {
                return key.match(new RegExp(`#(${schema})\/\\*:(${name})`, 'gi')) && (value || {})[property_name]
            }))[0] || {})[property_name]
        } else {
            return ((xdom.manifest.modules || {})[entity_name] || {})[property_name];
        }
    },
    writable: true, enumerable: false, configurable: false
});

px.requestRoutine = async function (name, parameters, tag) {
    let document = await xdom.fetch.xml(xdom.manifest.server.endpoints.request + `?command=${name}${parameters ? "&parameters=" + parameters : ""}`);
    if (document && document.documentElement) {
        xdocument = new xdom.data.Store(document, { tag: document.documentElement.getAttribute("x:tag") || tag || name.replace(/[\s:~/\\;\?\$&%@^=\*\(\)\'"`\{\}\[\]><]/gm, '') });

        if (!xdocument.getStylesheets().length) {
            xdocument.addStylesheet({ href: 'datagridview.xslt', target: '#shell main' });
        }
        xdom.data.document = xdocument;
    } else {
        alert("No hay resultados")
    }
}

px.request = async function (request_or_entity_name, mode, filters, ref) {
    if (!request_or_entity_name) {
        return null;
    }
    if (!(xdom.manifest.server["endpoints"] && xdom.manifest.server["endpoints"]["request"])) {
        throw ("Endpoint for request is not defined in the manifest");
    }
    var schema, entity_name;
    var page_index, page_size;
    var on_success = function (xml_document) { xdom.data.document = xml_document; };
    if (typeof (request_or_entity_name) == 'string') {
        try {
            [, schema, mode, entity_name] = request_or_entity_name.match(/#(.+)\/(.+):(.+)/);
        } catch (e) {
            [, schema, entity_name] = request_or_entity_name.match(/\[?([^\]]+)\]?\.\[?([^\]]+)\]?/);
        }
        mode = (mode || "view");
        if (request_or_entity_name == "[Historico].[Tendencias]") {
            page_size = "5000"
        }
    }
    if (request_or_entity_name.constructor === {}.constructor) {
        ({ schema, name: entity_name } = request_or_entity_name);
        //schema = request_or_entity_name["schema"]
        //entity_name = (schema ? "[" + schema + "]." : "") + request_or_entity_name["name"];
        if (!schema) {
            let full_name = entity_name;
            [, schema, entity_name] = String(full_name).match(/^\s*\[([^\]]+)\]\.\[(.+)\]\s*$/i);
        }
        mode = (mode || request_or_entity_name["mode"] || "view");
        page_index = request_or_entity_name["pageIndex"];
        filters = (request_or_entity_name["filters"] || filters);
        on_success = (request_or_entity_name["on_success"] || on_success);
    }
    filters = (filters || xdom.manifest.getConfig(`#${schema}/${mode}:${entity_name}`, "filters") || "").replace(/'/g, "''");

    page_size = (page_size || xdom.manifest.getConfig(`#${schema}/${mode}:${entity_name}`, "pageSize"));
    page_index = (page_index || xdom.manifest.getConfig(`#${schema}/${mode}:${entity_name}`, "pageIndex"));
    var ref = ref;
    //var current_location = window.location.hash.match(/#(\w+):(\w+)/);
    var rebuild = (!xdom.listeners.keys.altKey ? 'DEFAULT' : '1');
    xdom.data.document.state.busy = true;
    let [Response, Request] = await xdom.fetch.from(`${xdom.manifest.server.endpoints["request"]}?command=[$Ver:Beta_12].getXmlData @@user_id='-1', @full_path='', @table_name='[${schema}].[${entity_name}]', @mode=${(!mode ? 'DEFAULT' : `'${mode}'`)}, @page_index=${(page_index || 'DEFAULT')}, @page_size=${(page_size || 'DEFAULT')}, @max_records=DEFAULT, @control_type=DEFAULT, @Filters=${(!filters ? 'DEFAULT' : `'${Encoder.urlEncode(filters)}'`)}, @sorters=DEFAULT, @parameters=DEFAULT, @lang=es, @get_data=1, @get_structure=1, @rebuild=${rebuild}, @column_list=DEFAULT, @output=HTML`, {
        headers: {
            "Content-Type": 'text/xml'
            , "Accept": 'text/xml'
            , "X-Detect-Input-Variables": false
            , "X-Detect-Output-Variables": false
            , "X-Debugging": xdom.debug.enabled
        }
    })
    Request.requester = ref;

    if (Response && Response.documentElement) {
        var manifest_stylesheets = (xdom.manifest.getConfig(xdom.data.hashTagName(Response.documentElement), 'transforms') || []).filter(t => !(t.role == 'init' || t.role == "binding"));
        var stylesheets = manifest_stylesheets.concat([{ href: (Response.documentElement.getAttribute('controlType') || "shell").toLowerCase() + '.xslt' }].filter(() => (manifest_stylesheets.length == 0))).reduce((stylesheets, transform) => { stylesheets.push({ "href": transform.href, target: (transform.target || '#shell main'), role: transform.role }); return stylesheets; }, []);
        stylesheets.map(stylesheet => Response.addStylesheet(stylesheet));
        new xdom.data.Store(Response, function () {
            var caller = xdom.data.stores.find(Request.requester)[0];
            xml_document = this;
            //if (xml_document) {
            //    xdom.xhr.cache[request];
            //    if (cache_results) {
            //        xdom.cache[request] = xml_document;
            //    }
            //}
            xml_document.reseed();
            if (caller && caller.selectSingleNode('self::px:dataRow')) {
                var new_datarow = xml_document.document.selectSingleNode('*/px:data/px:dataRow')
                if (new_datarow) {
                    new_datarow.setAttribute('x:id', caller.getAttribute('x:id'))
                }
            }
            if (caller && caller.selectSingleNode('(ancestor-or-self::*[@Name and @Schema][1])[@foreignReference]')) {
                xml_document.document.documentElement.setAttribute('x:reference', caller.getAttribute('x:id'))
                var foreignReference = caller.selectSingleNode('ancestor-or-self::*[@foreignReference]');
                if (foreignReference) {
                    xml_document.documentElement.selectAll('//px:layout//px:field[@fieldName="' + foreignReference.getAttribute('foreignReference') + '"]').remove();
                }
            }
            var transforms = (xdom.manifest.getConfig(xdom.data.hashTagName(xml_document.document), 'transforms') || []).filter(stylesheet => stylesheet.role == 'init').map(stylesheet => stylesheet.href);
            transforms.push('xdom/panax/panax_bindings.xslt');
            for (transform of transforms) {
                xml_document.document = xdom.xml.transform(xml_document.document, transform);
            }
            if (on_success) {
                on_success.apply(this, [xml_document]);
            }
            //xdom.delay(50).then(() => {
            this.render(true);
            //});
        }, Response, Request);
    }
}

let original_loadHash = xdom.data.loadHash;
xdom.data.loadHash = async function (hash) {
    await xdom.manifest.sources[hash] && xdom.manifest.sources[hash].fetch({ as: hash }) || await px.request(hash);
    if (!xdom.data.stores[hash]) {
        xdom.dom.navigateTo('#');
    }
}

px.modifyInlineRecord = function (original_request) {
    var request = original_request.cloneObject();
    var ref_record = xdom.data.findById(request["ref"])
    delete request["ref"];

    request["on_success"] = function (xDocument) {
        var node = xDocument.document.selectSingleNode('*/px:data/px:dataRow');
        ref_record = xdom.xml.createDocument(ref_record);
        if (ref_record.selectSingleNode('.//*[@initial:value!=@x:value]')) {
            node.parentNode.replaceChild(ref_record.documentElement, node);
        }
        xdom.data.document = xDocument;
    }
    px.request(request, undefined, undefined, ref_record);//.selectSingleNode('ancestor::*[@Schema and @Name][1]'));
}

xdom.listeners.events.add('submitSuccess', function (event) {
    let store = event.detail.srcStore;
    let entity = px.getEntityInfo(store);
    if (entity) {
        switch (entity.mode) {
            case 'add':
            case 'edit':
                store.documentElement.setAttribute("state:submitted", "true");
                if (((history.state || {}).prev || []).length) {
                    history.back();
                    window.top.dispatchEvent(new CustomEvent('navigatedBack', { bubbles: false, detail: { srcStore: store } }));
                }
                break;
            default:
        }
    }
})

xdom.listeners.events.add('navigatedBack', function (event) {
    if (xdom.state.next) {
        let changes = xdom.data.stores[xdom.state.next].selectNodes("//*[@state:submitted='true']");
        if (changes.length) {
            px.request(px.getEntityInfo());
        }
    }
})