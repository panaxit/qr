<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:x="http://panax.io/xdom"
xmlns:xdom="http://panax.io/xdom"
xmlns:xhr="http://panax.io/xdom/xhr"
xmlns:router="http://panax.io/xdom/router"
xmlns:initial="http://panax.io/xdom/values/initial"
>
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
  <xsl:key name="changed" match="*[@x:value!=@initial:value]" use="generate-id(..)"/>
  <!--<xsl:key name="changed" match="*[@x:value!=@initial:value]" use="generate-id()"/>-->
  <xsl:key name="changed" match="Operacion/*|Detalle/*" use="generate-id()"/>

  <xsl:template match="text()|node()|@*"/>
  <xsl:template match="*[contains(namespace-uri(),'http://panax.io/xdom')]" priority="3"/>

  <xsl:template mode="field_attributes" match="IdOperacionDetalle">
    <xsl:attribute name="isPK">true</xsl:attribute>
  </xsl:template>

  <!-- mode="complete_data" -->
  <xsl:template match="Detalles/Detalle[not(IdOperacion)]/*[not(preceding-sibling::*[namespace-uri()=''])]" mode="complete_data">
    <fkey name="IdOperacion" maps="IdOperacion"/>
  </xsl:template>

  <xsl:template match="Operacion[not(IdOperacion)]/*[not(preceding-sibling::*[namespace-uri()=''])]" mode="complete_data">
    <fkey name="IdOperacion" maps="IdOperacion"/>
  </xsl:template>
  <!-- mode="complete_data" -->

  <xsl:template match="Operacion/*[key('changed',generate-id())]|Detalles/Detalle/*[key('changed',generate-id())]">
    <xsl:apply-templates select="." mode="complete_data"/>
    <field name="{local-name()}">
      <xsl:apply-templates mode="field_attributes" select="."/>
      <xsl:choose>
        <xsl:when test="@x:value=''">
          <xsl:text>NULL</xsl:text>
        </xsl:when>
        <xsl:when test="@x:format='money' or number(@x:value)=@x:value">
          <xsl:value-of select="@x:value"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:text>'</xsl:text>
          <xsl:value-of select="@x:value"/>
          <xsl:text>'</xsl:text>
        </xsl:otherwise>
      </xsl:choose>
    </field>
  </xsl:template>

  <xsl:template match="Operacion/Detalles">
    <dataTable name="OperacionesFinancieras.OperacionDetalle" identityKey="IdOperacionDetalle">
      <xsl:apply-templates/>
    </dataTable>
  </xsl:template>

  <xsl:template match="Operacion[IdOperacion[string(@x:value)!='0']][key('changed',generate-id())]|Detalles/Detalle[IdOperacionDetalle[string(@x:value)!='0']][key('changed',generate-id())]">
    <updateRow>
      <xsl:apply-templates/>
    </updateRow>
  </xsl:template>

  <xsl:template match="Operacion[not(IdOperacion[string(@x:value)!='0'])][key('changed',generate-id())]|Detalles/Detalle[not(IdOperacionDetalle[string(@x:value)!='0'])][key('changed',generate-id())]">
    <insertRow>
      <xsl:apply-templates/>
    </insertRow>
  </xsl:template>

  <xsl:template match="/">
    <dataTable name="OperacionesFinancieras.Operacion" disableFeedback="0" identityKey="IdOperacion">
      <xsl:apply-templates/>
    </dataTable>
  </xsl:template>

  <xsl:template match="Cantidad_Con_Letra|Fecha_Operacion|NombreSocioNegocios|Monto_Operacion|Monto_Aplicado_Documentos|Moneda|Instrumento_Monetario|Pais_origen|CuentaBancariaFilial|Monto_Total|TotalDetalle|NumeroOrden|IdPago" priority="5"/>
</xsl:stylesheet>