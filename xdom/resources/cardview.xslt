<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:debug="http://panax.io/debug"
  xmlns:msxsl="urn:schemas-microsoft-com:xslt"
  xmlns:x="http://panax.io/xdom"
  xmlns:state="http://panax.io/state"
  xmlns:session="http://panax.io/session"
  xmlns:filters="http://panax.io/filters"
  xmlns:custom="http://panax.io/custom"
  xmlns:datagrid="http://panax.io/widgets/datagrid"
  xmlns:source="http://panax.io/xdom/binding/source"
  xmlns:px="http://panax.io"
  exclude-result-prefixes="debug msxsl x state session filters custom datagrid px source"
  xmlns="http://www.w3.org/1999/xhtml"
>
  <xsl:import href="format_values.xslt"/>
  <xsl:import href="controls.xslt"/>
  <xsl:include href="keys.xslt"/>
  <xsl:output method="xml" indent="yes" />

  <!-- TEMPLATES -->
  <!--[*[key('data_row',generate-id())]]-->
  <xsl:template match="px:data" mode="cardview" priority="-1">
    <xsl:param name="data_rows" select="*[key('data_row',generate-id())]|self::px:data[not(px:dataRow)]"/>
    <div class="card-deck" id="{../@x:id}">
      <xsl:apply-templates mode="cardview.attributes" select="."/>
      <xsl:apply-templates mode="cardview.card" select="$data_rows"/>
    </div>
  </xsl:template>

  <xsl:template mode="cardview.card" match="*" priority="-1">
    <div class="card shadow" id="container_{@x:id}">
      <xsl:apply-templates mode="cardview.card.attributes" select="."/>
      <xsl:apply-templates mode="cardview.card.image" select="."/>
      <div class="card-body">
        <xsl:apply-templates mode="cardview.card.body" select="."/>
      </div>
      <div class="card-footer">
        <xsl:apply-templates mode="cardview.card.footer" select="."/>
      </div>
    </div>
  </xsl:template>

  <xsl:template mode="cardview.card" match="*[@x:deleting='true']" priority="-1">
    <div class="card shadow" id="container_{@x:id}" style="width:15px; background-color:red; flex: 0 1%;"></div>
  </xsl:template>

  <xsl:template mode="cardview.card.body" match="*" priority="-1">
    <xsl:apply-templates mode="cardview.card.body.header" select="."/>
    <xsl:apply-templates mode="cardview.card.body.description" select="."/>
    <!--<xsl:apply-templates mode="cardview.card.body.footer" select="."/>-->
  </xsl:template>

  <xsl:template mode="cardview.card.image" match="*" priority="-1">
    <xsl:param name="image">
      <xsl:apply-templates mode="cardview.card.image.src" select="."/>
    </xsl:param>
    <img class="card-img-top" src="{$image}" alt="Imagen"/>
  </xsl:template>

  <xsl:template mode="cardview.card.body.header" match="*" priority="-1">
    <h5 class="card-title">
      <xsl:apply-templates mode="cardview.card.header" select="."/>
    </h5>
  </xsl:template>

  <xsl:template mode="cardview.card.body.description" match="*" priority="-1">
    <p class="card-text">
      <xsl:apply-templates mode="cardview.card.description" select="."/>
    </p>
  </xsl:template>

  <xsl:template mode="cardview.card.body.footer" match="*" priority="-1">
    <p class="card-text">
      <small class="text-muted">
        <xsl:apply-templates mode="cardview.card.footer" select="."/>
      </small>
    </p>
  </xsl:template>

  <!-- ATTRIBUTES -->
  <xsl:template mode="cardview.attributes" match="*">
    <xsl:attribute name="class">
      <xsl:apply-templates mode="cardview.attributes.class" select="."/>
    </xsl:attribute>
    <xsl:attribute name="onclick">
      <xsl:apply-templates mode="cardview.attributes.onclick" select="."/>
    </xsl:attribute>
  </xsl:template>

  <xsl:template mode="cardview.card.attributes" match="*">
    <xsl:variable name="class">
      <xsl:apply-templates mode="cardview.card.attributes.class" select="."/>
    </xsl:variable>
  </xsl:template>

  <xsl:template mode="cardview.attributes.class" match="*" priority="-1">card-deck</xsl:template>
  <xsl:template mode="cardview.attributes.onclick" match="*" priority="-1"/>

  <xsl:template mode="cardview.card.attributes.class" match="*" priority="-1"></xsl:template>
  <xsl:template mode="cardview.card.attributes.onclick" match="*" priority="-1"></xsl:template>

  <!-- VALUES -->
  <xsl:template mode="cardview.card.image.src" match="*" priority="-1">images/FileSystem/Image-placeholder.jpg</xsl:template>

  <xsl:template mode="cardview.card.header" match="text()" priority="-1"></xsl:template>
  <xsl:template mode="cardview.card.description" match="text()" priority="-1"></xsl:template>
  <xsl:template mode="cardview.card.footer" match="text()" priority="-1"></xsl:template>

</xsl:stylesheet>
