<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl xs"
    xmlns="http://www.w3.org/1999/xhtml" xmlns:xs="http://www.uif.shcp.gob.mx/recepcion/inm">


  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Bootstrap Example</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"/>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
      </head>
      <body>
        <xsl:apply-templates select=".//xs:archivo"/>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="xs:informe">
    <table border="1" style="table-layout: fixed; width: 100%" class="table table-sm">
      <thead>
        <tr>
          <td bgcolor="#0066cc" style="color:#ffffff; text-align: center;" width="100%" colspan="8">
            <h3>Datos Generales</h3>
          </td>
        </tr>
        <tr>
          <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
            Mes Reportado
          </td>
          <td colspan="3">
            <xsl:if test="not(.//xs:mes_reportado/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:mes_reportado"/>
            </label>
          </td>
          <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
            Referencia del aviso
          </td>
          <td colspan="3">
            <xsl:if test="not(.//xs:aviso/xs:referencia_aviso/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:aviso/xs:referencia_aviso"/>
            </label>
          </td>
        </tr>
        <tr>
          <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
            Referencia
          </td>
          <td colspan="3">
            <xsl:if test="not(.//xs:sujeto_obligado/xs:clave_sujeto_obligado/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:sujeto_obligado/xs:clave_sujeto_obligado"/>
            </label>
          </td>
          <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
            <label>Prioridad</label>
          </td>
          <td colspan="3">
            <xsl:if test="not(.//xs:aviso/xs:prioridad/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:aviso/xs:prioridad"/> - Normal
            </label>
          </td>
        </tr>
        <tr>
          <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
            <label>Clave de la Actividad</label>
          </td>
          <td colspan="3">
            <xsl:if test="not(.//xs:sujeto_obligado/xs:clave_actividad/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:sujeto_obligado/xs:clave_actividad"/>
            </label>
          </td>
          <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
            <label>Tipo de Alerta</label>
          </td>
          <td colspan="3">
            <xsl:if test="not(.//xs:alerta/xs:tipo_alerta/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:alerta/xs:tipo_alerta"/> - Sin Alerta
            </label>
          </td>
        </tr>
        <br/>
      </thead>
      <tbody>
        <tr>
          <td bgcolor="#0066cc" style="color:#ffffff; text-align: center;" width="100%" colspan="8">
            <h3>Persona Objeto del Aviso</h3>
          </td>
        </tr>
        <xsl:apply-templates select=".//xs:persona_aviso/xs:tipo_persona">
        </xsl:apply-templates>

        <!--DOMICILIO-->
        <tr>
          <td bgcolor="#0066cc" style="color:#ffffff; text-align: center;" width="100%" colspan="8">
            <h3>Domicilio de la persona objeto del aviso</h3>
          </td>
        </tr>
        <!--NACIONAL-->
        <xsl:apply-templates select=".//xs:persona_aviso/xs:tipo_domicilio">
        </xsl:apply-templates>



        <!--TELEFONOS-->
        <tr>
          <xsl:apply-templates mode="campo" select=".//xs:persona_aviso/xs:telefono/xs:clave_pais"/>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Telefono</label>
          </td>
          <td>
            <xsl:if test="not(.//xs:persona_aviso/xs:telefono/xs:numero_telefono/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:persona_aviso/xs:telefono/xs:numero_telefono"/>
            </label>
          </td>
        </tr>
        <!--OPERACIONES-->
        <tr>
          <td bgcolor="#0066cc" style="color:#ffffff; text-align: center;" width="100%" colspan="8">
            <h3>Acto u Operacion</h3>
          </td>
        </tr>
        <tr>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Fecha de Operacion</label>
          </td>
          <td>
            <label>
              <xsl:if test="not(.//xs:detalle_operaciones/xs:datos_operacion/xs:fecha_operacion/text())">
                <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
              </xsl:if>
              <xsl:call-template name="formatoFecha">
                <xsl:with-param name="fecha" select=".//xs:detalle_operaciones/xs:datos_operacion/xs:fecha_operacion" />
              </xsl:call-template>
            </label>
          </td>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Tipo de Operacion</label>
          </td>
          <td>
            <label>
              501 - Compra Venta de Inmuebles
              <!--<xsl:value-of select=".//xs:detalle_operaciones/xs:datos_operacion/xs:tipo_operacion"/>-->
            </label>
          </td>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Figura del cliente reportado</label>
          </td>
          <td>
            <xsl:if test="not(.//xs:detalle_operaciones/xs:datos_operacion/xs:figura_cliente/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:detalle_operaciones/xs:datos_operacion/xs:figura_cliente"/> -
              <xsl:value-of select="ancestor::LeyDeLavado/catalogos/figuraCliente/descripcion"/>
            </label>
          </td>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Figura de la persona que realiza la actividad</label>
          </td>
          <td>
            <xsl:if test="not(.//xs:detalle_operaciones/xs:datos_operacion/xs:figura_so/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:detalle_operaciones/xs:datos_operacion/xs:figura_so"/> -
              <xsl:value-of select="ancestor::LeyDeLavado/catalogos/figuraVendedor/descripcion"/>
            </label>
          </td>
        </tr>
        <tr>
          <td bgcolor="#66b3ff" style="text-align: center;" width="100%" colspan="8">
            <h4>Caracteristicas del inmueble</h4>
          </td>
        </tr>
        <xsl:for-each select=".//xs:detalle_operaciones/xs:datos_operacion/xs:caracteristicas_inmueble">
          <tr>
            <xsl:apply-templates mode="campo" select="xs:tipo_inmueble|xs:valor_pactado">
              <xsl:with-param name="titulo">Valor Pactado del inmueble</xsl:with-param>
            </xsl:apply-templates>
          </tr>
          <tr>
            <xsl:apply-templates mode="campo" select="xs:colonia|current()[not(xs:colonia)]">
              <xsl:with-param name="titulo">Colonia</xsl:with-param>
            </xsl:apply-templates>
            <xsl:apply-templates mode="campo" select="xs:calle"/>
          </tr>
          <tr>
            <xsl:apply-templates mode="campo" select="xs:numero_exterior"/>
            <xsl:apply-templates mode="campo" select="xs:codigo_postal"/>
          </tr>
          <tr>
            <xsl:apply-templates mode="campo" select="xs:dimension_terreno"/>
            <xsl:apply-templates mode="campo" select="xs:dimension_construido">
              <xsl:with-param name="titulo">Dimensiones del inmueble</xsl:with-param>
            </xsl:apply-templates>
          </tr>
          <tr>
            <xsl:apply-templates mode="campo" select="xs:folio_real">
              <xsl:with-param name="titulo">Folio real</xsl:with-param>
            </xsl:apply-templates>
          </tr>
        </xsl:for-each>

        <!--INSTRUMENTO PUBLICO-->
        <tr>
          <td bgcolor="#66b3ff" style="text-align: center;" width="100%" colspan="8">
            <h4>Instrumento Publico o contrato privado</h4>
          </td>
        </tr>
        <tr>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Numero instrumento publico</label>
          </td>
          <td>
            <xsl:if test="not(.//xs:detalle_operaciones/xs:datos_operacion/xs:contrato_instrumento_publico/xs:datos_instrumento_publico/xs:numero_instrumento_publico/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:detalle_operaciones/xs:datos_operacion/xs:contrato_instrumento_publico/xs:datos_instrumento_publico/xs:numero_instrumento_publico"/>
            </label>
          </td>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Fecha instrumento publico</label>
          </td>
          <td>
            <xsl:if test="not(.//xs:detalle_operaciones/xs:datos_operacion/xs:contrato_instrumento_publico/xs:datos_instrumento_publico/xs:fecha_instrumento_publico/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:call-template name="formatoFecha">
                <xsl:with-param name="fecha" select=".//xs:detalle_operaciones/xs:datos_operacion/xs:contrato_instrumento_publico/xs:datos_instrumento_publico/xs:fecha_instrumento_publico" />
              </xsl:call-template>
            </label>
          </td>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Numero Notario</label>
          </td>
          <td>
            <xsl:if test="not(.//xs:detalle_operaciones/xs:datos_operacion/xs:contrato_instrumento_publico/xs:datos_instrumento_publico/xs:notario_instrumento_publico/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:detalle_operaciones/xs:datos_operacion/xs:contrato_instrumento_publico/xs:datos_instrumento_publico/xs:notario_instrumento_publico"/>
            </label>
          </td>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Entidad del Notario</label>
          </td>
          <td>
            <xsl:if test="not(.//xs:detalle_operaciones/xs:datos_operacion/xs:contrato_instrumento_publico/xs:datos_instrumento_publico/xs:entidad_instrumento_publico/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:detalle_operaciones/xs:datos_operacion/xs:contrato_instrumento_publico/xs:datos_instrumento_publico/xs:entidad_instrumento_publico"/> -
              <xsl:value-of select="ancestor::LeyDeLavado/catalogos/entidadNotario/descripcion"/>
            </label>
          </td>
        </tr>
        <tr>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Valor Avaluo o catastral</label>
          </td>
          <td>
            <xsl:if test="not(.//xs:detalle_operaciones/xs:datos_operacion/xs:contrato_instrumento_publico/xs:datos_instrumento_publico/xs:valor_avaluo_catastral/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select='format-number(.//xs:detalle_operaciones/xs:datos_operacion/xs:contrato_instrumento_publico/xs:datos_instrumento_publico/xs:valor_avaluo_catastral, "$###,###.00")'/>

              <!--<xsl:value-of select=".//xs:detalle_operaciones/xs:datos_operacion/xs:contrato_instrumento_publico/xs:datos_instrumento_publico/xs:valor_avaluo_catastral"/>-->
            </label>
          </td>
        </tr>
        <tr>
          <td bgcolor="#66b3ff" style="text-align: center;" width="100%" colspan="8">
            <h4>Datos de liquidacion</h4>
          </td>
        </tr>
        <tr>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Fecha de Pago</label>
          </td>
          <td colspan="3">
            <xsl:if test="not(.//xs:detalle_operaciones/xs:datos_operacion/xs:datos_liquidacion/xs:fecha_pago/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:call-template name="formatoFecha">
                <xsl:with-param name="fecha" select=".//xs:detalle_operaciones/xs:datos_operacion/xs:datos_liquidacion/xs:fecha_pago" />
              </xsl:call-template>
            </label>
          </td>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Forma de Pago</label>
          </td>
          <td colspan="3">
            <xsl:if test="not(.//xs:detalle_operaciones/xs:datos_operacion/xs:datos_liquidacion/xs:forma_pago/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:detalle_operaciones/xs:datos_operacion/xs:datos_liquidacion/xs:forma_pago"/> - <xsl:value-of select="ancestor::LeyDeLavado/catalogos/formaPago/descripcion"/>
            </label>
          </td>

        </tr>
        <tr>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Instrumento Monetario</label>
          </td>
          <td colspan="3">
            <xsl:if test="not(.//xs:detalle_operaciones/xs:datos_operacion/xs:datos_liquidacion/xs:instrumento_monetario/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:detalle_operaciones/xs:datos_operacion/xs:datos_liquidacion/xs:instrumento_monetario"/>
            </label>
          </td>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Moneda</label>
          </td>
          <td colspan="3">
            <xsl:if test="not(.//xs:detalle_operaciones/xs:datos_operacion/xs:datos_liquidacion/xs:moneda/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select=".//xs:detalle_operaciones/xs:datos_operacion/xs:datos_liquidacion/xs:moneda"/> - <xsl:value-of select="ancestor::LeyDeLavado/catalogos/moneda/descripcion"/>
            </label>
          </td>
        </tr>
        <tr>
          <td bgcolor="#002C5D" style="color:#ffffff;">
            <label>Monto de Operacion</label>
          </td>
          <td>
            <xsl:if test="not(.//xs:detalle_operaciones/xs:datos_operacion/xs:datos_liquidacion/xs:monto_operacion/text())">
              <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
            </xsl:if>
            <label>
              <xsl:value-of select='format-number(.//xs:detalle_operaciones/xs:datos_operacion/xs:datos_liquidacion/xs:monto_operacion, "$###,###.00")'/>
            </label>
          </td>
        </tr>

      </tbody>
    </table>
    <br/>
    <br/>
  </xsl:template>

  <xsl:template match="xs:persona_fisica|xs:representante_apoderado">
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Nombre</label>
      </td>
      <td colspan="6">
        <xsl:if test="not(xs:nombre/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:nombre"/>
        </label>
      </td>
    </tr>
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Apellido Paterno</label>
      </td>
      <td colspan="6">
        <xsl:if test="not(xs:apellido_paterno/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:apellido_paterno"/>
        </label>
      </td>
    </tr>
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Apellido Materno</label>
      </td>
      <td colspan="6">
        <xsl:if test="not(xs:apellido_materno/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:apellido_materno"/>
        </label>
      </td>
    </tr>
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Fecha de Nacimiento</label>
      </td>
      <td colspan="2">
        <xsl:if test="not(xs:fecha_nacimiento/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:call-template name="formatoFecha">
            <xsl:with-param name="fecha" select="xs:fecha_nacimiento" />
          </xsl:call-template>
          <!--<xsl:value-of select="xs:fecha_nacimiento"/>-->
        </label>
      </td>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Curp</label>
      </td>
      <td colspan="4">
        <xsl:if test="not(xs:curp/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:curp"/>
        </label>
      </td>
    </tr>
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Pais de Nacionalidad</label>
      </td>
      <td colspan="2">
        <xsl:if test="not(xs:pais_nacionalidad/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:pais_nacionalidad"/> - <xsl:value-of select="ancestor::LeyDeLavado/catalogos/pais/descripcion"/>
        </label>
      </td>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Actividad Economica</label>
      </td>
      <td colspan="4">
        <xsl:if test="not(xs:actividad_economica/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:actividad_economica"/> -
          <xsl:value-of select="ancestor::LeyDeLavado/catalogos/actividadEconomica/descripcion"/>
        </label>
      </td>
    </tr>
  </xsl:template>

  <xsl:template match="xs:persona_moral">
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Denominacion o Razon Social</label>
      </td>
      <td colspan="7">
        <xsl:if test="not(xs:denominacion_razon/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:denominacion_razon"/>
        </label>
      </td>
    </tr>
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Fecha de Constitucion</label>
      </td>
      <td>
        <xsl:if test="not(xs:fecha_constitucion/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:call-template name="formatoFecha">
            <xsl:with-param name="fecha" select="xs:fecha_constitucion" />
          </xsl:call-template>
        </label>
      </td>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>RFC</label>
      </td>
      <td colspan="2">
        <xsl:if test="not(xs:rfc/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:rfc"/>
        </label>
      </td>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Pais Nacionalidad</label>
      </td>
      <td colspan="2">
        <xsl:if test="not(xs:pais_nacionalidad/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:pais_nacionalidad"/>
        </label>
      </td>
    </tr>
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Giro Mercantil</label>
      </td>
      <td colspan="4">
        <xsl:if test="not(xs:giro_mercantil/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:giro_mercantil"/>
        </label>
      </td>
    </tr>
    <tr>
      <xsl:apply-templates select=".//xs:persona_aviso/xs:tipo_persona/xs:persona_moral/xs:representante_apoderado">
      </xsl:apply-templates>
    </tr>
  </xsl:template>

  <!--<xsl:template match="xs:representante_apoderado">
    <tr>
      <td bgcolor="#ccffff" style="text-align: center;" width="100%" colspan="8">
        <h4>Representante Apoderado</h4>
      </td>
    </tr>
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Nombre</label>
      </td>
      <td colspan="7">
        <xsl:if test="not(xs:nombre/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:nombre"/>
        </label>
      </td>
    </tr>
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Apellido paterno</label>
      </td>
      <td colspan="7">
        <xsl:if test="not(xs:apellido_paterno/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:apellido_paterno"/>
        </label>
      </td>
    </tr>
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Apellido materno</label>
      </td>
      <td colspan="7">
        <xsl:if test="not(xs:apellido_materno/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:apellido_materno"/>
        </label>
      </td>
    </tr>
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>Fecha nacimiento</label>
      </td>
      <td>
        <xsl:if test="not(xs:fecha_nacimiento/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:call-template name="formatoFecha">
            <xsl:with-param name="fecha" select="xs:fecha_nacimiento" />
          </xsl:call-template>
        </label>
      </td>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>RFC</label>
      </td>
      <td colspan="2">
        <xsl:if test="not(xs:rfc/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:rfc"/>
        </label>
      </td>
      <td bgcolor="#002C5D" style="color:#ffffff;" width="20%">
        <label>CURP</label>
      </td>
      <td colspan="2">
        <xsl:if test="not(xs:curp/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:curp"/>
        </label>
      </td>
    </tr>
  </xsl:template>-->

  <!--<xsl:template match="xs:nacional">
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;">
        <label>Colonia</label>
      </td>
      <td colspan="3">
        <xsl:if test="not(xs:colonia/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:colonia"/>
        </label>
      </td>
      <td bgcolor="#002C5D" style="color:#ffffff;">
        <label>Calle</label>
      </td>
      <td colspan="3">
        <xsl:if test="not(xs:calle/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:calle"/>
        </label>
      </td>
    </tr>
    <tr>
      <td bgcolor="#002C5D" style="color:#ffffff;">
        <label>Numero Exterior</label>
      </td>
      <td>
        <xsl:if test="not(xs:numero_exterior/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:numero_exterior"/>
        </label>
      </td>
      <td bgcolor="#002C5D" style="color:#ffffff;">
        <label>Numero interior</label>
      </td>
      <td>
        <xsl:if test="not(xs:numero_interior/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:numero_interior"/>
        </label>
      </td>
      <td bgcolor="#002C5D" style="color:#ffffff;">
        <label>Codigo Postal</label>
      </td>
      <td>
        <xsl:if test="not(xs:codigo_postal/text())">
          <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
        </xsl:if>
        <label>
          <xsl:value-of select="xs:codigo_postal"/>
        </label>
      </td>
    </tr>
  </xsl:template>-->

  <xsl:template match="xs:extranjero|xs:nacional">
    <xsl:if test="self::xs:nacional">
      <tr>
        <xsl:apply-templates mode="campo" select="xs:pais"/>
        <xsl:apply-templates mode="campo" select="xs:estado_provincia"/>
      </tr>
    </xsl:if>
    <tr>
      <xsl:apply-templates mode="campo" select="xs:ciudad_poblacion"/>
      <xsl:apply-templates mode="campo" select="xs:colonia"/>
    </tr>
    <tr>
      <xsl:apply-templates mode="campo" select="xs:calle"/>
      <xsl:apply-templates mode="campo" select="xs:numero_exterior"/>
      <xsl:apply-templates mode="campo" select="xs:numero_interior"/>
    </tr>
    <tr>
      <xsl:apply-templates mode="campo" select="xs:codigo_postal"/>
    </tr>
  </xsl:template>

  <xsl:template match="text()" mode="uppercase"/>

  <xsl:template match="*" mode="titulo">
    <xsl:variable name="titulo" select="translate(local-name(),'_',' ')"/>
    <xsl:value-of select="translate(substring($titulo, 1, 1), 'abcdefghijklmnñopqrstuvwxyz','ABCDEFGHIJKLMNÑOPQRSTUVWXYZ')"/>
    <xsl:value-of select="substring($titulo, 2)"/>
  </xsl:template>

  <xsl:template mode="titulo" match="xs:numero_exterior">
    <xsl:text>Número Exterior</xsl:text>
  </xsl:template>

  <xsl:template mode="campo" match="*">
    <xsl:param name="titulo">
      <xsl:apply-templates mode="titulo" select="."/>
    </xsl:param>
    <th bgcolor="#FF0000" style="color:#ffffff;">
      <label>
        <xsl:value-of select="$titulo"/>
      </label>
    </th>
    
    <td colspan="3" bgcolor="green;">
      <xsl:if test="not(text())">
        <xsl:attribute name="bgcolor">#ffff00</xsl:attribute>
      </xsl:if>
      <label>
        <xsl:apply-templates select="." mode="value"/>
      </label>
    </td>
  </xsl:template>

  <xsl:template mode="value" match="text()">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template mode="value" match="xs:*[contains(local-name(),'valor')]/text()">
    <xsl:value-of select="format-number(.,'$###,##0.00')"/>    
  </xsl:template>

  <xsl:template name="formatoFecha" mode="value" match="xs:*[contains(local-name(),'fecha')]/text()">
    <xsl:param name="fecha" select="."/>
    <xsl:variable name="año" select="substring($fecha,1,4)" />
    <xsl:variable name="mes" select="substring($fecha,5,2)" />
    <xsl:variable name="dia" select="substring($fecha, 7,2)" />
    <xsl:value-of select="concat($dia,'/',$mes, '/', $año)" />
  </xsl:template>

</xsl:stylesheet>

