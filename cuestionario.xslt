<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns="http://www.w3.org/1999/xhtml"
xmlns:x="http://panax.io/xdom"
xmlns:js="http://panax.io/xdom/javascript"
xmlns:state="http://panax.io/state"
xmlns:session="http://panax.io/session"
xmlns:custom="http://panax.io/custom"
exclude-result-prefixes="#default x js state custom"
>
  <xsl:import href="xdom/resources/modal.xslt"/>
  <xsl:param name="js:secure"><![CDATA[location.protocol.indexOf('https')!=-1 || location.hostname=='localhost']]></xsl:param>
  <xsl:param name="session:email"/>
  <xsl:template match="/">
    <span>
      <xsl:apply-templates select="*"/>
    </span>
  </xsl:template>

  <!-- MODAL: Start -->
  <xsl:template match="*" mode="control.modal.header.title.label">
    Código QR
  </xsl:template>

  <xsl:template match="*" mode="control.modal.body">
    <xsl:apply-templates mode="preguntas.image" select="."/>
  </xsl:template>

  <xsl:template match="*" mode="control.modal.footer">
    <button type="button" class="btn btn_outline_information__data" data-dismiss="modal" xo-target="{@x:id}" onclick="this.sourceNode.setAttribute('state:showModal','false')">
      Cerrar
    </button>
  </xsl:template>
  <!-- MODAL: End -->

  <xsl:key name="isGeneric" match="*[@custom:code='FD87F7733D4FBDCDF58A0D46545D7E82']" use="@custom:code"/>

  <xsl:key name="valid_email" match="cuestionario[contains(@custom:email, '@gmail.com')]" use="true()"/>
  <xsl:key name="valid_email" match="preguntas[contains(@custom:email, '@gmail.com')]" use="true()"/>
  <xsl:key name="missing" match="preguntas/sintomatologia/opcion[not(@state:checked)]" use="generate-id(../..)"/>
  <xsl:key name="rechazado" match="@custom:result[.='Positivo']" use="generate-id(/*)" />
  <xsl:key name="autorizado" match="@custom:result[.='Positivo']" use="generate-id(/*)" />
  <xsl:key name="expirado" match="@custom:date[.='Positivo']" use="generate-id(/*)" />

  <xsl:param name="js:fecha_actual"><![CDATA[toIsoString(new Date()).replace(/[^\d]/gi,'').substr(0,14)]]></xsl:param>
  <xsl:param name="js:tag"><![CDATA[xdom.data.document.tag.split('#').pop()]]></xsl:param>
  <xsl:template match="preguntas">
    <div class="container">
      <main>
        <div class="py-5 text-center">
          <!--<img class="d-block mx-auto mb-4" src="../assets/brand/bootstrap-logo.svg" alt="" width="72" height="57"/>-->
          <h2>Filtro de Acceso</h2>
          <p class="lead">Formato para llenar antes de visitar las instalaciones de la institución. Agradecemos su veracidad.</p>
        </div>

        <div class="row g-5">
          <div class="col-12">
            <h4 class="mb-3 text-center">
              <xsl:value-of select="@custom:email"/>
            </h4>
            <form class="needs-validation" novalidate="">
              <div class="my-3">
                <xsl:apply-templates select="sintomatologia"/>
              </div>

              <hr class="my-4"/>
              <xsl:choose>
                <xsl:when test="@custom:code">
                  <xsl:apply-templates mode="preguntas.image" select="."/>
                  <br/>
                  <div class="alert alert-danger text-center" role="alert">Este código tiene una vigencia de 12 horas</div>
                  <xsl:if test="@state:showModal='true'">
                    <xsl:apply-templates mode="control.modal" select="."/>
                  </xsl:if>
                  <button class="w-100 btn btn-primary btn-lg btn-danger" type="button">
                    <xsl:attribute name="onclick">xdom.session.logout({ auto_reload: false });</xsl:attribute>
                    <xsl:text/>Cerrar sesión<xsl:text/>
                  </button>
                </xsl:when>
                <xsl:otherwise>
                  <button class="w-100 btn btn-primary btn-lg" type="button">
                    <xsl:choose>
                      <xsl:when test="key('missing',generate-id())">
                        <xsl:attribute name="disabled">disabled</xsl:attribute>
                      </xsl:when>
                      <xsl:otherwise>
                        <xsl:attribute name="onclick">cuestionario.getQR()</xsl:attribute>
                      </xsl:otherwise>
                    </xsl:choose>
                    <xsl:text/>Generar código QR<xsl:text/>
                  </button>
                  <br/>
                  <br/>
                  <button class="w-100 btn btn-primary btn-lg btn-danger" type="button">
                    <xsl:attribute name="onclick">xdom.session.logout({ auto_reload: false });</xsl:attribute>
                    <xsl:text/>Cerrar sesión<xsl:text/>
                  </button>
                </xsl:otherwise>
              </xsl:choose>
            </form>
          </div>
        </div>
      </main>

      <footer class="my-5 pt-5 text-muted text-center text-small">
        <p class="mb-1"> 2021 &#169; Panax</p>
        <ul class="list-inline">
          <li class="list-inline-item">
            <a href="#">Privacidad</a>
          </li>
        </ul>
      </footer>
    </div>
  </xsl:template>

  <xsl:template match="*" mode="preguntas.image">
    <xsl:choose>
      <xsl:when test="*/*[@state:checked='1']">
        <div class="alert alert-danger text-center" role="alert">
          Favor de quedarse en casa.
        </div>
      </xsl:when>
      <xsl:otherwise>
        <style>
          <![CDATA[img.broken {
    content: url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'70'%20height%3D'70'%20fill%3D'currentColor'%20class%3D'bi%20bi-exclamation-triangle-fill%20text-danger'%20viewBox%3D'0%200%2016%2016'%3E%3Cpath%20d%3D'M8.982%201.566a1.13%201.13%200%200%200-1.96%200L.165%2013.233c-.457.778.091%201.767.98%201.767h13.713c.889%200%201.438-.99.98-1.767L8.982%201.566zM8%205c.535%200%20.954.462.9.995l-.35%203.507a.552.552%200%200%201-1.1%200L7.1%205.995A.905.905%200%200%201%208%205zm.002%206a1%201%200%201%201%200%202%201%201%200%200%201%200-2z'%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
    display: block;
    margin: 10px 5px 0 10px;
}
.modal-dialog { max-width: 700px }
.modal img.clickable { width:100% }
img.clickable {cursor:pointer}
                      ]]>
        </style>
        <div class="text-center">
          <div class="text-center" role="alert">
            <img src="{@custom:code}" class="img-fluid clickable" xo-target="{@x:id}">
              <xsl:if test="string-length(@custom:code)=32">
                <xsl:attribute name="src">
                  <xsl:text/>qr/<xsl:value-of select="substring-after(@custom:email,'@')"/>/<xsl:value-of select="@custom:code"/>.png<xsl:text/>
                </xsl:attribute>
              </xsl:if>
              <xsl:attribute name="onclick">
                <xsl:text/>this.sourceNode.setAttribute('state:showModal',<xsl:choose>
                  <xsl:when test="@state:showModal='true'">'false'</xsl:when>
                  <xsl:otherwise>'true'</xsl:otherwise>
                </xsl:choose>)<xsl:text/>
              </xsl:attribute>
              <xsl:attribute name="onerror">cuestionario.recoverCode(this);</xsl:attribute>
            </img>
          </div>
        </div>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="@custom:result[.='Positivo']">Autorizado</xsl:template>
  <xsl:template match="@custom:result[.='Negativo']">Se sugiere quedarse en casa</xsl:template>
  <xsl:template match="@custom:date">
    <xsl:value-of select="substring(.,7,2)"/>
    <xsl:text>/</xsl:text>
    <xsl:value-of select="substring(.,5,2)"/>
    <xsl:text>/</xsl:text>
    <xsl:value-of select="substring(.,1,4)"/>
    <xsl:text> </xsl:text>
    <xsl:value-of select="substring(.,9,2)"/>
    <xsl:text>:</xsl:text>
    <xsl:value-of select="substring(.,11,2)"/>
    <xsl:text>:</xsl:text>
    <xsl:value-of select="substring(.,13,2)"/>
    <xsl:text> Hrs.</xsl:text>
    <!--<xsl:choose>
      <xsl:when test="substring(.,9,2)&gt;=12"> P.M.</xsl:when>
      <xsl:otherwise> A.M.</xsl:otherwise>
    </xsl:choose>-->
  </xsl:template>

  <xsl:template match="preguntas[@custom:result]">
    <xsl:variable name="caducado">
      <xsl:choose>
        <xsl:when test="translate(@custom:fecha_vigencia,'/-: ','') = number(translate(@custom:fecha_vigencia,'/-: ',''))">
          <xsl:if test="$js:fecha_actual - translate(@custom:fecha_vigencia,'/-: ','') &gt; 0">1</xsl:if>
        </xsl:when>
        <xsl:otherwise>
          <xsl:if test="$js:fecha_actual - translate(@custom:date,'/-: ','') &gt; 880000">1</xsl:if>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="caducidad">
      <xsl:if test="$caducado=1">text-danger</xsl:if>
    </xsl:variable>
    <div class="container">
      <main>
        <div class="py-5 text-center">
          <!--<img class="d-block mx-auto mb-4" src="../assets/brand/bootstrap-logo.svg" alt="" width="72" height="57"/>-->
          <h2>Filtro de Acceso</h2>
        </div>

        <div class="row g-5">
          <div class="col-12">
            <xsl:choose>
              <xsl:when test="key('isGeneric', @custom:code)">
                <h1 class="mb-3 text-center">Código válido únicamente hasta el 14 de Junio</h1>
              </xsl:when>
              <xsl:otherwise>
                <h1 class="mb-3 text-center">
                  <xsl:value-of select="@custom:email"/>
                </h1>
                <h1 class="mb-3 text-center text-primary {$caducidad}">
                  <xsl:apply-templates select="@custom:date"/>
                </h1>
                <h2 class="mb-3 text-center {$caducidad}">
                  <xsl:choose>
                    <xsl:when test="$caducado=1">
                      El código ha caducado
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:apply-templates select="@custom:result"/>
                    </xsl:otherwise>
                  </xsl:choose>
                </h2>
              </xsl:otherwise>
            </xsl:choose>
            <div class="row text-center">
              <div class="col-4"/>
              <div class="col-4">
                <xsl:choose>
                  <xsl:when test="$caducado=1"></xsl:when>
                  <xsl:when test="@custom:result='Positivo'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" fill="currentColor" class="bi bi-check-circle text-success  {$caducidad}" viewBox="0 0 16 16" aria-hidden="true" style="margin-left: 2em; margin-top: 1em; cursor: pointer;" xo-target="{@x:id}" id="{@x:id}_no">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                    </svg>
                  </xsl:when>
                  <xsl:otherwise>
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" fill="currentColor" class="bi bi-x-circle text-danger" viewBox="0 0 16 16" aria-hidden="true" style="margin-right: 2em; margin-top: 1em; cursor: pointer;" xo-target="{@x:id}" id="{@x:id}_yes">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </xsl:otherwise>
                </xsl:choose>
              </div>
              <div class="col-4"/>
            </div>
          </div>
        </div>
      </main>

      <footer class="my-5 pt-5 text-muted text-center text-small">
        <p class="mb-1"> 2021 &#169; Panax</p>
        <ul class="list-inline">
          <li class="list-inline-item">
            <a href="#">Privacidad</a>
          </li>
        </ul>
      </footer>
    </div>
  </xsl:template>

  <xsl:template match="preguntas[not(key('valid_email',true()))]">
    <div class="text-center">
      <xsl:if test="$js:secure='true'">
        <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css"/>
        <script src="https://accounts.google.com/gsi/client" async="" defer=""></script>
      </xsl:if>
      <style>
        <![CDATA[
        html,
        body {
          height: 100%;
        }

        body > div {
          display: flex;
          align-items: center;
          padding-top: 40px;
          padding-bottom: 40px;
          background-color: #f5f5f5;
        }

        .form-signin {
          width: 100%;
          max-width: 400px;
          padding: 15px;
          margin: auto;
        }

        .form-signin .checkbox {
          font-weight: 400;
        }

        .form-signin .form-floating:focus-within {
          z-index: 2;
        }

        .form-signin input[type="email"] {
          margin-bottom: -1px;
          border-bottom-right-radius: 0;
          border-bottom-left-radius: 0;
        }

        .form-signin input[type="password"] {
          margin-bottom: 10px;
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        }

        .bd-placeholder-img {
          font-size: 1.125rem;
          text-anchor: middle;
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }

        @media (min-width: 768px) {
          .bd-placeholder-img-lg {
            font-size: 3.5rem;
          }
        }]]>
      </style>
      <script>console.log('inicializando')</script>
      <main class="form-signin">
        <form class="needs-validation" novalidate="">
          <img class="mb-4" src="assets/{$js:tag}.png" alt="" width="72"/>
          <h1 class="h3 mb-3 fw-normal">Filtro de Acceso</h1>

          <xsl:variable name="invalid-email">
            <xsl:if test="string(@custom:email)!=''">is-invalid</xsl:if>
          </xsl:variable>
          <div class="form-floating">
            <input type="email" class="form-control {$invalid-email}" id="floatingEmail" placeholder="name@example.com" value="{@custom:email}" width="" xo-target="{@x:id}" onfocus="this.value=''"/>
            <xsl:if test="string(@custom:email)!=''">
              <div class="invalid-feedback">
                Por favor introduzca un nombre de usuario válido.
              </div>
            </xsl:if>
            <label for="floatingEmail">Correo institucional</label>
          </div>
          <br/>
          <!--<div class="form-floating">
            <input type="password" class="form-control" id="floatingPassword" placeholder="Password"/>
            <label for="floatingPassword">Password</label>
          </div>-->

          <!--<div class="checkbox mb-3">
            <label>
              <input type="checkbox" value="remember-me"/> Remember me
            </label>
          </div>-->
          <button class="w-100 btn btn-lg btn-primary" type="button" xo-target="{@x:id}" onclick="let email=document.querySelector('#floatingEmail'); xdom.delay(100).then(_=&gt;{{this.sourceNode.setAttribute('custom:email',[...email.value &amp;&amp; email.value.match(/[^@]+/g), email.value &amp;&amp; 'gmail.com'].filter((el,i)=&gt;i&lt;2).join('@'), true)}}); xdom.data.stores['#{$js:tag}']">
            Continuar
          </button>
          <xsl:if test="$js:secure!='true' and 1=0">
            <br/>
            <button class="w-100 btn btn-lg btn-primary" type="button" xo-target="{@x:id}" onclick="goHTTPS();">
              Continuar con cuenta de google
            </button>
          </xsl:if>
          <br/>
          <xsl:if test="$js:secure='true'">
            <div id="g_id_onload"
              data-client_id="22537666043-58rr4djm4s2un5p37fg3tjn56db3e5m3.apps.googleusercontent.com"
              data-callback="onGoogleLogin"
              data-auto_prompt="false">
            </div>
            <div class="g_id_signin signup_button text-center"
                 data-type="standard"
                 data-size="large"
                 data-theme="outline"
                 data-text="sign_in_with"
                 data-shape="rectangular"
                 data-logo_alignment="left">
            </div>
          </xsl:if>
          <p class="mt-5 mb-3 text-muted">2021 &#169; Panax</p>
        </form>
      </main>
    </div>
  </xsl:template>

  <xsl:template match="preguntas/*">
    <div class="container">
      <div class="row">
        <div class="col-8 align-self-start">
          <h3 class="mb-3">
            <xsl:value-of select="@title"/>
          </h3>
        </div>
        <div class="col-2 align-self-end">
          <h5>NO</h5>
        </div>
        <div class="col-2 align-self-end">
          <h5>SÍ</h5>
        </div>
      </div>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="opcion">
    <div class="row">
      <div class="col-8 align-self-start">
        <label class="form-check-label" for="credit">
          <xsl:value-of select="text()"/>
        </label>
      </div>
      <div class="col-2 align-self-end">
        <input id="{@x:id}_no" name="{@x:id}" type="radio" class="form-check-input" required="" onclick="this.store.documentElement.removeAttribute('custom:code'); this.sourceNode.setAttribute('@state:checked', 0)">
          <xsl:if test="@state:checked=0">
            <xsl:attribute name="checked"/>
            <xsl:attribute name="onclick">
              <xsl:text/>this.store.documentElement.removeAttribute('custom:code'); this.sourceNode.parentNode.setAttribute('@state:active', <xsl:value-of select="position()"/>, false); this.sourceNode.setAttribute('@state:checked',undefined)<xsl:text/>
            </xsl:attribute>
          </xsl:if>
        </input>
      </div>
      <div class="col-2 align-self-center">
        <input id="{@x:id}_yes" name="{@x:id}" type="radio" class="form-check-input" required="" onclick="this.store.documentElement.removeAttribute('custom:code'); this.sourceNode.parentNode.setAttribute('@state:active', {position()}, false); this.sourceNode.setAttribute('@state:checked', 1)">
          <xsl:if test="@state:checked=1">
            <xsl:attribute name="checked"/>
            <xsl:attribute name="onclick">
              <xsl:text/>this.store.documentElement.removeAttribute('custom:code'); this.sourceNode.parentNode.setAttribute('@state:active', <xsl:value-of select="position()"/>, false); this.sourceNode.setAttribute('@state:checked', undefined)<xsl:text/>
            </xsl:attribute>
          </xsl:if>
        </input>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="opcion" mode="indicator">
    <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="{position()-1}" aria-label="Slide {position()}" xo-target="{../@x:id}" onclick="this.sourceNode.setAttribute('@state:active', {position()}, false)">
      <xsl:if test="position()=../@state:active or position()=1 and not(../@state:active)">
        <xsl:attribute name="class">active</xsl:attribute>
        <xsl:attribute name="aria-current">true</xsl:attribute>
      </xsl:if>
    </button>
  </xsl:template>

  <xsl:template match="preguntas/*[opcion[not(@state:checked)]]/opcion">
    <xsl:variable name="active">
      <xsl:choose>
        <xsl:when test="../@state:active">
          <xsl:value-of select="../@state:active"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="position()"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <div class="carousel-item" style="background-color: #140c5b">
      <xsl:if test="position()=../@state:active or position()=1 and not(../@state:active)">
        <xsl:attribute name="class">carousel-item active</xsl:attribute>
        <xsl:attribute name="aria-current">true</xsl:attribute>
      </xsl:if>
      <xsl:variable name="total_opciones" select="count(../opcion)"/>
      <div class="row flex-nowrap">
        <div class="col"></div>
        <div class="col-5 text-end">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16" aria-hidden="true" style="margin-right: 2em; margin-top: 1em; cursor: pointer;" xo-target="{@x:id}" id="{@x:id}_yes" onclick="[...document.querySelectorAll('#{@x:id}_no')].map(el => el.classList.remove('text-danger')); this.classList.toggle('text-success'); xdom.delay(500).then(_=&gt;{{this.store.documentElement.removeAttribute('custom:code'); this.sourceNode.setAttribute('@state:checked', '0'); this.sourceNode.parentNode.setAttribute('@state:active', {(position() mod $total_opciones)+1}, !{(position() mod $total_opciones)}, true);}})" data-bs-target="#myCarousel">
            <xsl:if test="not(position()=last())">
              <xsl:attribute name="data-bs-slide">next</xsl:attribute>
            </xsl:if>
            <xsl:if test="@state:checked='0'">
              <xsl:attribute name="class">bi bi-x-circle text-success</xsl:attribute>
            </xsl:if>
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </div>
        <div class="col-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16" aria-hidden="true" style="margin-left: 2em; margin-top: 1em; cursor: pointer;" xo-target="{@x:id}" id="{@x:id}_no" onclick="[...document.querySelectorAll('#{@x:id}_yes')].map(el => el.classList.remove('text-success')); this.classList.toggle('text-danger'); xdom.delay(500).then(_=&gt;{{this.store.documentElement.removeAttribute('custom:code'); this.sourceNode.setAttribute('@state:checked', 1); this.sourceNode.parentNode.setAttribute('@state:active', {($active mod $total_opciones)+1}, true);}})" data-bs-target="#myCarousel">
            <xsl:if test="not(position()=last())">
              <xsl:attribute name="data-bs-slide">next</xsl:attribute>
            </xsl:if>
            <xsl:if test="@state:checked='1'">
              <xsl:attribute name="class">bi bi-x-circle text-danger</xsl:attribute>
            </xsl:if>
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
          </svg>
        </div>
        <div class="col"></div>
      </div>

      <div class="container">
        <div class="carousel-caption">
          <h1>
            <xsl:value-of select="text()"/>
          </h1>
        </div>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="preguntas/*[opcion[not(@state:checked)]]">
    <xsl:variable name="active">
      <xsl:choose>
        <xsl:when test="@state:active">
          <xsl:value-of select="@state:active"/>
        </xsl:when>
        <xsl:otherwise>1</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <div id="myCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-interval="false">
      <style>
        <![CDATA[/* GLOBAL STYLES
-------------------------------------------------- */
/* Padding below the footer and lighter body text */

body {
  padding-top: 3rem;
  padding-bottom: 3rem;
  color: #5a5a5a;
}

.carousel-control-next-icon, .carousel-control-prev-icon {
  margin-bottom: 2em;
}

/* CUSTOMIZE THE CAROUSEL
-------------------------------------------------- */

/* Carousel base class */
.carousel {
  margin-bottom: 4rem;
}
/* Since positioning the image, we need to help out the caption */
.carousel-caption {
  bottom: 3rem;
  z-index: 10;
}

/* Declare heights because of positioning of img element */
.carousel-item {
  height: 32rem;
}
.carousel-item > img {
  position: absolute;
  top: 0;
  left: 0;
  min-width: 100%;
  height: 32rem;
}


/* MARKETING CONTENT
-------------------------------------------------- */

/* Center align the text within the three columns below the carousel */
.marketing .col-lg-4 {
  margin-bottom: 1.5rem;
  text-align: center;
}
.marketing h2 {
  font-weight: 400;
}
/* rtl:begin:ignore */
.marketing .col-lg-4 p {
  margin-right: .75rem;
  margin-left: .75rem;
}
/* rtl:end:ignore */


/* Featurettes
------------------------- */

.featurette-divider {
  margin: 5rem 0; /* Space out the Bootstrap <hr> more */
}

/* Thin out the marketing headings */
.featurette-heading {
  font-weight: 300;
  line-height: 1;
  /* rtl:remove */
  letter-spacing: -.05rem;
}

.carousel-control-next, .carousel-control-prev {
  align-items: flex-end;
}

/* RESPONSIVE CSS
-------------------------------------------------- */

@media (min-width: 40em) {
  /* Bump up size of carousel content */
  .carousel-caption p {
    margin-bottom: 1.25rem;
    font-size: 1.25rem;
    line-height: 1.4;
  }

  .featurette-heading {
    font-size: 50px;
  }
}

@media (min-width: 62em) {
  .featurette-heading {
    margin-top: 7rem;
  }
}
]]>
      </style>
      <div class="carousel-indicators">
        <xsl:apply-templates select="opcion" mode="indicator"/>
        <!--<button type="button" data-bs-target="#myCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
        <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
        <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>-->
      </div>
      <div class="carousel-inner">
        <xsl:apply-templates select="opcion"/>
      </div>
      <xsl:variable name="total_opciones" select="count(opcion)"/>
      <button class="carousel-control-prev" type="button" data-bs-target="#myCarousel" data-bs-slide="prev" xo-target="{@x:id}" onclick="xdom.delay(500).then(_=&gt;{{this.sourceNode.setAttribute('@state:active', eval({translate(string(($active mod $total_opciones)-1),'-0','  ')}) || 1)}})">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">No</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#myCarousel" data-bs-slide="next" xo-target="{@x:id}" onclick="xdom.delay(500).then(_=&gt;{{this.sourceNode.setAttribute('@state:active', {($active mod $total_opciones)+1})}})">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Sí</span>
      </button>
    </div>
  </xsl:template>

</xsl:stylesheet>
