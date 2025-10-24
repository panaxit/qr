filtro = {};
filtro.getConnectionId = function () {
    return (location.hash.split("#").pop() || "main");
}

goHTTPS = function () {
    var url = new URL(location.href);
    url.protocol = 'https:';
    location.href = url.toString();
}

onGoogleLogin = async function (response) {
    let domain = location.hash.split("#").pop();
    const responsePayload = xdom.cryptography.decodeJwt(response.credential);
    xdom.session.email = responsePayload.email;
    if (responsePayload.email.indexOf('@colegiominerva.edu.mx') != -1) {
        xdom.dom.navigateTo("#minerva");
    }
    xdom.data.document.documentElement.setAttribute("custom:email", xdom.session.email);
    xdom.session.login(undefined, undefined, location.hash.split('#').pop());
    //if (xdom.state.seed = '#') {
    //    if (responsePayload.email.indexOf('@colegiominerva.edu.mx')!=-1) {
    //        await xdom.sources["#minerva"].fetch();
    //    }
    //}
}

xdom.listeners.events.add('loggedOut', function (event) {
    if (location.hash) {
        xdom.session.login(undefined, undefined, location.hash.split('#').pop());
    } else {
        xdom.session.user_login = null;
    }
});

xdom.listeners.events.add('storeLoaded', async function (event) {
    let store = event.detail.store;
    if (xdom.session.email) {
        store.documentElement.setAttribute("custom:email", xdom.session.email);
    }
});

cuestionario = {}
cuestionario.getAnswers = function () {
    return xdom.data.document.selectAll('//sintomatologia').map(rubro => rubro.nodeName + '=' + rubro.selectAll('*').reduce((output, o) => output += o.getAttribute("state:checked"), ""));
}

cuestionario.getQR = function () {
    let respuestas = cuestionario.getAnswers();
    let email = xdom.data.document.documentElement.getAttribute("custom:email");
    xdom.fetch.xml(`http://qr.filtro.panax.io/QrGeneratorService.svc/EncodeFiltro/email=${email}&datos=${respuestas}`).then(document => {
        respuesta = document.documentElement.textContent;
        if (respuesta.length == 32) {
            xdom.data.document.documentElement.setAttribute("custom:code", (respuesta || ""), true);
        } else {
            console.log(respuesta)
        }
    }).catch(() => {
        cuestionario.getGoogleCode(respuestas, email)
    });
}

cuestionario.getGoogleCode = function (respuestas, email) {
    let vencimiento = toIsoString(new Date().addHours(13))
    var ciphertext = CryptoJS.AES.encrypt(`{d:"${respuestas}",u:"${email}",e:"${vencimiento.substr(11, 8).replace(/[^\dT]/g, '')}",i:"A001"}`, vencimiento.substr(0, 10).replace(/[^\dT]/g, '') + location.hash);
    //let url = new URL(`https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=L|1`)
    let url = new URL(`https://quickchart.io/qr`)
    url.searchParams.append("text", ciphertext)
    xdom.data.document.documentElement.setAttribute("custom:code", (url.toString() || ""), true);
}

cuestionario.recoverCode = async function (target, retries) {
    var retries = (retries || 0)
    if (retries > 3) {
        cuestionario.getGoogleCode(cuestionario.getAnswers(), xdom.data.document.documentElement.getAttribute("custom:email"))
        //target.parentNode.appendChild(document.createTextNode('Hubo un problema al recuperar el código. Actualice la página.'));
        //target.classList.add('broken');
    } else {
        try {
            await xdom.delay(1000);
            file = await fetch(target.src);
            if (file && file.status != 200) {
                throw ("Error retrieving file");
            }
            target.src = target.src;
        } catch (e) {
            cuestionario.recoverCode(target, ++retries);
        }
    }
}

cuestionario.load = async function () {
    let codigo = location.search.replace(/^\?uid=/, '');
    if (codigo) {
        xdom.session.loadSession(codigo);
        xdom.post.to(`${xdom.manifest.server.endpoints["request"]}?command=FiltroSalud.RegistrarEscaneo&@Codigo=${location.search.replace(/^\?uid=/, '')}`);
    } else {
        xdom.fetch.xml(`${xdom.manifest.server.endpoints["request"]}?command=FiltroSalud.obtenerFormato&@Codigo=${location.search.replace(/^\?uid=/, '')}`).then(document => {
            let formato = xdom.xml.createDocument(document.selectSingleNode('x:response/formato/preguntas'));
            if (formato.documentElement) {
                formato.selectAll("//opcion[position()>6]").remove()
                document.getStylesheets().map(stylesheet => {
                    formato.addStylesheet(stylesheet);
                })
                formato.documentElement.setAttribute("x:tag", "minerva");
                xdom.data.document = formato;
            }
        });
    }
}

cuestionario.updateNode = function (value) {
    xdom.data.document.selectSingleNode(`//opcion[${getCurrentSlide()}]`).setAttribute('state:checked', value, false);
}

cuestionario.closeSession = function () {
    xdom.data.document.selectAll('//@state:checked').remove();
    xdom.data.document.selectAll('//@custom:code').remove();
    xdom.data.document.selectAll('//preguntas/*/@state:active').remove();
    xdom.data.document.documentElement.setAttribute('custom:email', undefined);
}

function getCurrentSlide() {
    return parseInt(document.querySelector('#myCarousel .carousel-indicators .active').getAttribute('data-bs-slide-to')) + 1
}

function toIsoString(date) {
    var tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function (num) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };

    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        'Z' + pad(tzo / 60) +
        ':' + pad(tzo % 60);
}

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}
