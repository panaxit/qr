<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns="http://www.w3.org/1999/xhtml"
xmlns:x="http://panax.io/xdom"
xmlns:state="http://panax.io/state"
xmlns:custom="http://panax.io/custom"
exclude-result-prefixes="#default"
>
  <xsl:template match="pricing">
    <main>
      <style>
          <![CDATA[
        body {
          background-image: linear-gradient(180deg, #eee, #fff 100px, #fff);
        }

        .container {
          max-width: 960px;
        }

        .pricing-header {
          max-width: 700px;
        }

        .mailto{
          display:block;
          width:100px;
          color:white;
        }
      ]]></style>

      <div class="container py-3">
        <header>
          <div class="pricing-header p-3 pb-md-4 mx-auto text-center">
            <h1 class="display-4 fw-normal">Precios</h1>
            <p class="fs-5 text-muted">Los siguientes precios son por la prestación del servicio y tienen una vigencia de un mes a partir de esta fecha. Precios no incluyen impuestos.</p>
          </div>
        </header>

        <main>
          <div class="row row-cols-1 row-cols-md-3 mb-3 text-center">
            <div class="col">
              <div class="card mb-4 rounded-3 shadow-sm">
                <div class="card-header py-3">
                  <h4 class="my-0 fw-normal">Mensual</h4>
                </div>
                <div class="card-body">
                  <h1 class="card-title pricing-card-title">
                    $3.00 <small class="text-muted fw-light">MXN/correo</small>
                  </h1>
                  <ul class="list-unstyled mt-3 mb-4">
                    <li>Notificaciones en telegram</li>
                    <li>Reporte de registros</li>
                    <li>Soporte por correo electrónico</li>
                  </ul>
                  <button type="button" class="w-100 btn btn-lg btn-primary" disabled="disabled">
                    <a class="mailto w-100 btn btn-lg btn-primary" href="mailto:uriel@panax.io">Disponible Julio 2021</a>
                  </button>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="card mb-4 rounded-3 shadow-sm">
                <div class="card-header py-3">
                  <h4 class="my-0 fw-normal">Anual</h4>
                </div>
                <div class="card-body">
                  <h1 class="card-title pricing-card-title">
                    $25.00 <small class="text-muted fw-light">MXN/correo</small>
                  </h1>
                  <ul class="list-unstyled mt-3 mb-4">
                    <li>Notificaciones en telegram</li>
                    <li>Reporte de registros</li>
                    <li>Soporte por correo electrónico</li>
                  </ul>
                  <button type="button" class="w-100 btn btn-lg btn-primary" disabled="disabled">
                    <a class="mailto w-100 btn btn-lg btn-primary" href="mailto:uriel@panax.io">Disponible Julio 2021</a>
                  </button>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="card mb-4 rounded-3 shadow-sm border-primary">
                <div class="card-header py-3 text-white bg-primary border-primary">
                  <h4 class="my-0 fw-normal">Preventa</h4>
                </div>
                <div class="card-body">
                  <h1 class="card-title pricing-card-title">
                    $12,000.00 <small class="text-muted fw-light">MXN/dominio</small>
                  </h1>
                  <ul class="list-unstyled mt-3 mb-4">
                    <li>Notificaciones en telegram</li>
                    <li>Reporte de registros</li>
                    <li>Soporte por email por un año.</li>
                  </ul>
                  <button type="button" class="w-100 btn btn-lg btn-primary">
                    <a class="mailto w-100 btn btn-lg btn-primary" href="mailto:uriel@panax.io">Contacto</a>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </main>
  </xsl:template>

</xsl:stylesheet>
