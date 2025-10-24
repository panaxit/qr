<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns="http://www.w3.org/1999/xhtml"
xmlns:x="http://panax.io/xdom"
xmlns:js="http://panax.io/xdom/javascript"
xmlns:state="http://panax.io/state"
xmlns:custom="http://panax.io/custom"
exclude-result-prefixes="#default"
>
  <xsl:param name="js:tag"><![CDATA[location.hash.split('#').pop()]]></xsl:param>
  <xsl:param name="js:secure"><![CDATA[location.protocol.indexOf('https')!=-1 || location.hostname=='localhost']]></xsl:param>
  <xsl:template match="*">
    <div class="text-center">
      <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css"/>
      <script src="https://accounts.google.com/gsi/client" async="" defer=""></script>
      <style type="text/css">
        <![CDATA[
    .signup_button {
      display: inline-block;
      background: white;
      color: #444;
      border-radius: 5px;
      border: thin solid #888;
      box-shadow: 1px 1px 1px grey;
      white-space: nowrap;
    }
    .signup_button:hover {
      cursor: pointer;
    }
    span.label {
      font-family: serif;
      font-weight: normal;
    }
    span.icon {
      background: url('https://developers-dot-devsite-v2-prod.appspot.com/identity/sign-in/g-normal.png') transparent 5px 50% no-repeat;
      display: inline-block;
      vertical-align: middle;
      width: 42px;
      height: 42px;
    }
    
    span.icon-app {
      background: url('./custom/images/favicon.png') transparent 5px 50% no-repeat;
      display: inline-block;
      vertical-align: middle;
      width: 52px;
      height: 42px;
    }
    .buttonText {
      display: inline-block;
      vertical-align: middle;
      padding-right: 42px;
      font-size: 14px;
      font-weight: bold;
      /* Use the Roboto font that is loaded in the <head> */
      font-family: 'Roboto', sans-serif;
    }
]]>
      </style>
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
          max-width: 330px;
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
      <main class="form-signin">
        <xsl:if test="$js:secure='true'">
          <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css"/>
          <script src="https://accounts.google.com/gsi/client" async="" defer=""></script>
        </xsl:if>
        <form>
          <img class="mb-4" src="assets/minerva.png" alt="" width="72" onerror="this.src='assets/panax.png'"/>
          <h1 class="h3 mb-3 fw-normal">Filtro de Acceso</h1>

          <!--<div class="form-floating">
            <input type="text" class="form-control" id="floatingEmail" placeholder="name@example.com" width=""/>
            <label for="floatingEmail">Correo autorizado</label>
          </div>
          <br/>
          <div class="form-floating">
            <input type="password" class="form-control" id="floatingPassword" placeholder="Password"/>
            <label for="floatingPassword">Password</label>
          </div>-->

          <!--<div class="checkbox mb-3">
            <label>
              <input type="checkbox" value="remember-me"/> Remember me
            </label>
          </div>-->
          <xsl:choose>
            <xsl:when test="$js:secure='true'">
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
              <br/>
              <kbd>Ingrese con su cuenta institucional</kbd>
            </xsl:when>
            <xsl:otherwise>
              <kbd><a style="color:white; font-size:14pt;" href="https://filtro.panax.io/">https://filtro.panax.io/</a></kbd>
              <!--<button class="w-100 btn btn-lg btn-primary" type="submit" xo-target="{@x:id}" onclick="xdom.session.login(undefined, undefined, location.hash.split('#').pop())">Continuar</button>-->
            </xsl:otherwise>
          </xsl:choose>
          <p class="mt-5 mb-3 text-muted">&#169; 2021</p>
        </form>
      </main>
    </div>
  </xsl:template>
</xsl:stylesheet>
