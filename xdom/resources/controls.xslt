<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:msxsl="urn:schemas-microsoft-com:xslt"
  xmlns:x="http://panax.io/xdom"
  xmlns:px="http://panax.io"
  xmlns:debug="http://panax.io/debug"
  xmlns:state="http://panax.io/state"
  xmlns:xhr="http://panax.io/xdom/xhr"
  xmlns:source="http://panax.io/xdom/binding/source"
  xmlns:initial="http://panax.io/xdom/values/initial"
  xmlns:confirmed="http://panax.io/xdom/values/confirmed"
  xmlns:request="http://panax.io/xdom/binding/request"
  xmlns:requesting="http://panax.io/xdom/binding/requesting"
  exclude-result-prefixes="msxsl x px state xhr source request requesting confirmed initial debug"
  xmlns="http://www.w3.org/1999/xhtml"
>
  <xsl:import href="functions.xslt"/>
  <xsl:import href="keys.xslt"/>
  <xsl:import href="format_values.xslt"/>

  <xsl:key name="visible" match="x:dummy" use="generate-id()"/>
  <xsl:key name="hidden" match="x:dummy" use="generate-id()"/>

  <xsl:output method="xml" indent="no" />

  <xsl:template mode="control.attributes" match="@*" priority="-1"/>
  <xsl:template mode="control.attributes" match="*" priority="-1">
    <xsl:apply-templates mode="control.attributes" select="@*"/>
  </xsl:template>
  <xsl:template mode="control.attributes.class" match="*" priority="-1"/>
  <xsl:template mode="control.attributes.onchange" match="*" priority="-1"/>

  <xsl:template mode="control" match="*" priority="-10">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>

    <xsl:variable name="maxlength" select="@length"/>

    <xsl:variable name="length">
      <xsl:choose>
        <xsl:when test="$field/@length&gt;25">25</xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="@length"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <style>
      .money::before {
        content:"$";
      }
    </style>
    <xsl:for-each select="$data_field">
      <xsl:variable name="value"><xsl:apply-templates select="@x:value"/></xsl:variable>
      <input id="{@x:id}" type="text" size="{$length}" maxlength="{$maxlength}" class="form-control" onchange="this.sourceNode.setAttribute('@x:value', this.value);" value="{$value}">
        <xsl:choose>
          <xsl:when test="key('controls.password',@fieldId)">
            <xsl:attribute name="type">password</xsl:attribute>
            <xsl:attribute name="onchange">
              this.value=(this.value.length==0 || this.value.length==32 ?this.value:calcMD5(this.value).toUpperCase()); this.sourceNode.setAttribute('@x:value', this.value, false); if ('<xsl:value-of select="@confirmed:value"/>'!=this.value) { this.sourceNode.setAttribute('@confirmed:value','',true); }
            </xsl:attribute>
          </xsl:when>
          <xsl:when test="key('controls.money',@fieldId)">
            <xsl:attribute name="type">number</xsl:attribute>
            <xsl:attribute name="min">1</xsl:attribute>
            <xsl:attribute name="step">any</xsl:attribute>
            <xsl:attribute name="value">
              <xsl:value-of select="translate(@x:value,'$','')"/>
            </xsl:attribute>
            <xsl:attribute name="class">form-control money</xsl:attribute>
          </xsl:when>
        </xsl:choose>
        <xsl:if test="key('required',generate-id($field))">
          <xsl:attribute name="class">
            <xsl:text/>form-control <xsl:if test="key('required',generate-id($field))">
              required <xsl:if test="key('empty',generate-id())"> is-invalid</xsl:if>
            </xsl:if><xsl:text/>
          </xsl:attribute>
        </xsl:if>
        <xsl:apply-templates mode="control.attributes" select="."/>
      </input>
      <xsl:if test="key('controls.password',@fieldId)">
        <div class="modal fade" id="staticBackdrop" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <xsl:choose>
            <xsl:when test="@confirmed:value!=@x:value">
              <xsl:attribute name="class">modal fade show</xsl:attribute>
              <xsl:attribute name="style">display: block;</xsl:attribute>
              <xsl:attribute name="aria-modal">true</xsl:attribute>
            </xsl:when>
            <xsl:otherwise>
              <xsl:attribute name="aria-hidden">true</xsl:attribute>
            </xsl:otherwise>
          </xsl:choose>
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">Confirma el dato</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" xo-target="{@x:id}">
                  <xsl:attribute name="onclick">
                    this.sourceNode.setAttributes({'@x:value':'<xsl:value-of select="@initial:value"/>', '@confirmed:value':'<xsl:value-of select="@initial:value"/>'});
                  </xsl:attribute>
                  <span aria-hidden="true">&#215;</span>
                </button>
              </div>
              <div class="modal-body">
                <input id="{@x:id}_confirm" type="text" value="{@confirmed:value}" size="{$length}" maxlength="{$maxlength}" class="form-control" xo-target="{@x:id}" onchange="this.sourceNode.setAttribute('@confirmed:value', this.value)">
                  <xsl:choose>
                    <xsl:when test="key('controls.password',@fieldId)">
                      <xsl:attribute name="type">password</xsl:attribute>
                      <xsl:attribute name="onchange">
                        this.value=(this.value.length==32?this.value:calcMD5(this.value).toUpperCase()); if ('<xsl:value-of select="@x:value"/>'!=this.value) {alert('No coincide el valor capturado.'); this.value=''}; this.sourceNode.setAttribute('@confirmed:value', this.value)
                      </xsl:attribute>
                    </xsl:when>
                    <xsl:when test="key('controls.money',@fieldId)">
                      <xsl:attribute name="type">number</xsl:attribute>
                      <xsl:attribute name="min">1</xsl:attribute>
                      <xsl:attribute name="step">any</xsl:attribute>
                      <xsl:attribute name="class">form-control money</xsl:attribute>
                    </xsl:when>
                  </xsl:choose>
                  <xsl:if test="key('required',generate-id($field))">
                    <xsl:attribute name="class">
                      <xsl:text/>form-control <xsl:if test="key('required',generate-id($field))">
                        required <xsl:if test="key('empty',generate-id())"> is-invalid</xsl:if>
                      </xsl:if><xsl:text/>
                    </xsl:attribute>
                  </xsl:if>
                  <xsl:apply-templates mode="control.attributes" select="."/>
                </input>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal" xo-target="{@x:id}">
                  <xsl:attribute name="onclick">
                    this.sourceNode.setAttributes({'@x:value':'<xsl:value-of select="@initial:value"/>', '@confirmed:value':'<xsl:value-of select="@initial:value"/>'});
                  </xsl:attribute>
                  Cancel
                </button>
                <button type="button" class="btn btn-success" >Confirm</button>
              </div>
            </div>
          </div>
        </div>
      </xsl:if>
      <xsl:if test="key('required',generate-id($field))">
        <span class="invalid-feedback" style="margin-left:5pt;">Campo requerido</span>
      </xsl:if>
    </xsl:for-each>
  </xsl:template>

  <xsl:template mode="control" match="*[key('controls.date',generate-id())]" priority="-10">
    <xsl:param name="data_field" select="."/>
    <xsl:param name="field" select="."/>
    <xsl:variable name="length">
      <xsl:choose>
        <xsl:when test="$field/@length&gt;25">25</xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="@length"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="display_value">
      <xsl:apply-templates select="$data_field/@x:value"/>
    </xsl:variable>
    <input id="{$data_field/@x:id}" type="date" onchange="if (isValidISODate(this.value)) {{this.sourceNode.setAttribute('@x:value', this.value)}}">
      <xsl:attribute name="value">
        <xsl:value-of select="$display_value"/>
      </xsl:attribute>
      <xsl:attribute name="class">
        <xsl:text/>form-control <xsl:if test="key('required',generate-id($field))">
          required <xsl:if test="key('empty',generate-id($data_field))"> is-invalid</xsl:if>
        </xsl:if><xsl:text/>
      </xsl:attribute>
      <xsl:apply-templates mode="control.attributes" select="$data_field"/>
    </input>
  </xsl:template>

  <xsl:template mode="control" match="*[key('controls.yesno',generate-id())]" priority="-10">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>

    <div class="btn-group" role="group" aria-label="Basic example" style="position:relative;">
      <xsl:if test="key('required',generate-id()) and $data_field/@x:value=''">
        <span style="position:absolute; left:0px; z-index:-1; white-space:nowrap; display: inline-flex;">
          <input type="text" style="width:90px; background-color: transparent; border-color: transparent;" class="form-control is-invalid"/>
          <span class="invalid-feedback" style="margin-left:5pt;">Campo requerido</span>
        </span>
      </xsl:if>
      <button type="button" class="btn btn-outline-success" xo-target="{$data_field/@x:id}" onclick="this.sourceNode.setAttribute('@x:value',1)">
        <xsl:if test="$data_field/@x:value=1">
          <xsl:attribute name="onclick">
            this.sourceNode.setAttribute('@x:value','')
          </xsl:attribute>
          <xsl:apply-templates mode="control.attributes" select="$data_field"/>
          <xsl:attribute name="class">btn btn-success</xsl:attribute>
        </xsl:if>
        <xsl:text>Sí</xsl:text>
      </button>
      <button type="button" class="btn btn-outline-danger" xo-target="{$data_field/@x:id}" onclick="this.sourceNode.setAttribute('@x:value',0)">
        <xsl:if test="$data_field/@x:value=0">
          <xsl:attribute name="onclick">
            this.sourceNode.setAttribute('@x:value','')
          </xsl:attribute>
          <xsl:apply-templates mode="control.attributes" select="$data_field"/>
          <xsl:attribute name="class">btn btn-danger</xsl:attribute>
        </xsl:if>
        <xsl:text>No</xsl:text>
      </button>
    </div>
  </xsl:template>

  <xsl:template match="*" mode="control.file.buttons.append" priority="-10">
  </xsl:template>

  <xsl:template match="*" mode="control.file.buttons.prepend" priority="-10">
  </xsl:template>

  <xsl:template mode="control" match="*[key('controls.file',generate-id())]" name="controls.file" priority="-10">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <xsl:param name="type"/>

    <xsl:variable name="file_extension">
      <xsl:call-template name="substring-after-last">
        <xsl:with-param name="string" select="$data_field/@x:value" />
        <xsl:with-param name="delimiter" select="'.'" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="display_name">
      <xsl:call-template name="substring-after-last">
        <xsl:with-param name="string" select="$data_field/@x:value" />
        <xsl:with-param name="delimiter" select="'\'" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="file_name">
      <xsl:choose>
        <xsl:when test="contains($data_field/@x:value,'fakepath\')">
          <xsl:value-of select="concat($data_field/@x:id,'.',$file_extension)"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$display_name"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="full_path">
      <xsl:call-template name="substring-before-last">
        <xsl:with-param name="string" select="$data_field/@x:value" />
        <xsl:with-param name="delimiter" select="'\'" />
      </xsl:call-template>
    </xsl:variable>
    <style>
      <![CDATA[
      .datagrid .file_control .custom-file {display:none;}
      .datagrid .file_control .input-group-append {display:none;}
      .datagrid .file_control .progress {display:none;}
      .datagrid .file_control .validar_documento {background-color: silver;}
      .datagrid td {white-space:unset;}
    ]]>
    </style>
    <div class="input-group mb-2 file_control">
      <xsl:choose>
        <xsl:when test="$data_field/@x:value!=''">
          <div class="input-group-prepend">
            <button class="btn btn-outline-info" type="button" onclick="window.open('xdom/server/open_file.asp?rfc={translate($data_field/ancestor::px:dataRow[last()]/RFC/@x:value,'\','/')}&amp;full_path={translate($full_path,'\','/')}{$file_name}','_blank');">
              <i class="fas fa-external-link-alt" style="cursor:pointer;"></i>
            </button>
            <button class="btn btn-outline-info" type="button" onclick="window.open('xdom/server/download_file.asp?rfc={translate($data_field/ancestor::px:dataRow[last()]/RFC/@x:value,'\','/')}&amp;full_path={translate($full_path,'\','/')}{$file_name}');">
              <i class="fas fa-download" style="cursor:pointer;"></i>
            </button>
            <xsl:if test="$data_field[self::RFC]">
              <!-- CIF -->
              <button class="btn btn-outline-info" type="button" onclick="var id_CIF = prompt('IdCIF',''); if (!id_CIF) return; window.open('https://siat.sat.gob.mx/app/qr/faces/pages/mobile/validadorqr.jsf?D1=10&amp;D2=1&amp;D3='+id_CIF+'_{translate($data_field/ancestor::px:dataRow[last()]/RFC/@x:value,'\','/')}','_blank');">
                <i class="fas fa-globe" style="cursor:pointer;"></i>
              </button>
            </xsl:if>
            <xsl:if test="$data_field[self::OpinionCumplimiento]">
              <!-- OPINION -->
              <button class="btn btn-outline-info" type="button" onclick="window.open('https://siat.sat.gob.mx/app/qr/faces/pages/mobile/validadorqr.jsf?D1=1&amp;D2=1&amp;D3='+prompt('Folio','')+'_{translate($data_field/ancestor::px:dataRow[last()]/RFC/@x:value,'\','/')}_'+prompt('Fecha dd-mm-aaaa','')+'_P','_blank');">
                <i class="fas fa-globe" style="cursor:pointer;"></i>
              </button>
            </xsl:if>
            <xsl:apply-templates mode="control.file.buttons.prepend" select="$data_field"/>
          </div>
        </xsl:when>
      </xsl:choose>
      <xsl:variable name="parent_folder">
        <xsl:choose>
          <xsl:when test="$type='picture'">app/custom/images</xsl:when>
        </xsl:choose>
      </xsl:variable>
      <div class="custom-file">
        <input type="file" readonly="readonly" class="custom-file-input" id="{$data_field/@x:id}" name="{$data_field/@x:id}" onchange="xdom.server.uploadFile(this, '{$data_field/@x:id}', '{$parent_folder}');">
          <xsl:if test="$data_field/@x:value!=''">
            <!--<xsl:attribute name="type">text</xsl:attribute>-->
            <xsl:attribute name="style">cursor:pointer;</xsl:attribute>
          </xsl:if>
        </input>
        <label for="{$data_field/@x:id}">
          <xsl:choose>
            <xsl:when test="$data_field/@x:value!=''">
              <xsl:attribute name="class">custom-file-label</xsl:attribute>
              <xsl:value-of select="$display_name"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:attribute name="class">custom-file-label text-black-50</xsl:attribute>
              Buscar archivo...
            </xsl:otherwise>
          </xsl:choose>
        </label>
        <div class="invalid-feedback">Example invalid custom file feedback</div>
        <!--<img id="{@x:id}" src="#" alt="your image" style="height:100px;" />-->
      </div>
      <xsl:choose>
        <xsl:when test="$data_field/@x:value!=''">
          <div class="input-group-append">
            <button class="btn btn-outline-danger" type="button" xo-target="{$data_field/@x:id}" onclick="this.sourceNode.setAttribute('@x:value','')">
              <xsl:apply-templates mode="control.attributes" select="$data_field"/>
              <i class="far fa-trash-alt" style="cursor:pointer;"></i>
            </button>
          </div>
        </xsl:when>
      </xsl:choose>
      <div class="progress" style="height: 5px; width:100%">
        <div id="_progress_bar_{$data_field/@x:id}" class="progress-bar bg-success" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
          <xsl:if test="$data_field/@x:value!=''">
            <xsl:attribute name="style">
              width: <xsl:value-of select="$data_field/@state:progress"/>
            </xsl:attribute>
          </xsl:if>
        </div>
      </div>
    </div>
    <!--<input type="file" class="form-control">
      <xsl:attribute name="value">
        <xsl:apply-templates select="$data_field/@x:value"/>
      </xsl:attribute>
    </input>-->
  </xsl:template>

  <xsl:template mode="combobox.options.prepend" match="*" priority="-10">
  </xsl:template>

  <xsl:template mode="combobox.options.append" match="*" priority="-10">
  </xsl:template>

  <xsl:template mode="combobox.options" match="x:r" priority="-10">
    <xsl:param name="data_field" select="px:dummy"/>
    <option value="{@x:value}">
      <xsl:if test="@x:value=$data_field/@x:value and @x:value!=''">
        <xsl:attribute name="selected">selected</xsl:attribute>
      </xsl:if>
      <xsl:apply-templates select="@x:value"/>
    </option>
  </xsl:template>

  <!-- Texto para poder escribir -->
  <!--<xsl:template mode="combobox.options" match="x:r" priority="-10">
    <xsl:param name="data_field" select="px:dummy"/>
    <option value="{@x:text}">
    </option>
  </xsl:template>-->

  <xsl:template mode="combobox.options" match="@*" priority="-10">
    <option value="{.}">
      <xsl:attribute name="selected">selected</xsl:attribute>
      <xsl:apply-templates select="."/>
    </option>
  </xsl:template>

  <xsl:template mode="control.select.first_options" match="*" priority="-10">
    <option value="" selected="selected">
      <xsl:text/>Selecciona <xsl:value-of select="@headerText"/><xsl:text/>
    </option>
  </xsl:template>

  <xsl:template mode="control" match="*[@source:value]" priority="-10">
    <xsl:param name="data_field" select="."/>
    <xsl:param name="field" select="."/>
    <xsl:variable name="catalog" select="$data_field"/>
    <xsl:variable name="data_catalog" select="($field/px:data|$catalog/source:value|$data_field[not($catalog/@source:value)]/@x:value)[last()]"/>
    <xsl:variable name="control.attributes.onchange">
      <xsl:apply-templates mode="control.attributes.onchange" select="$data_field"/>
    </xsl:variable>
    <div class="input-group">
      <select id="{$data_field/@x:id}" class="form-select" onchange="this.sourceNode.setAttributes({{'@x:value':this.value,'@x:text':this[this.selectedIndex].text}}); {$control.attributes.onchange}">
        <xsl:if test="not($data_catalog/x:r)">
          <xsl:attribute name="disabled">disabled</xsl:attribute>
        </xsl:if>
        <xsl:attribute name="class">
          <xsl:text/>form-select <xsl:if test="key('required',generate-id($field))">
            <xsl:text/>required <xsl:if test="key('empty',generate-id($data_field))"> is-invalid</xsl:if>
          </xsl:if><xsl:text/>
          <xsl:choose>
            <xsl:when test="key('empty',generate-id($data_field))">
              <xsl:text> text-black-50 </xsl:text>
            </xsl:when>
            <xsl:otherwise> text-black </xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
        <xsl:apply-templates mode="control.attributes" select="$data_field"/>
        <xsl:if test="$data_catalog[self::* and x:r]">
          <xsl:apply-templates mode="control.select.first_options" select="."/>
        </xsl:if>
        <xsl:apply-templates mode="combobox.options.prepend" select="$data_field"/>
        <xsl:apply-templates select="$data_catalog" mode="combobox.options">
          <xsl:with-param name="data_field" select="$data_field" />
        </xsl:apply-templates>
        <xsl:apply-templates mode="combobox.options.append" select="$data_field"/>
      </select>
    </div>
  </xsl:template>

  <xsl:template mode="control" match="*[key('foreignKey',@fieldId)]//*[not(@fieldId and @dataType)]" priority="-10">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:variable name="field" select="key('field',$data_field/@x:fieldId)"/>
    <xsl:variable name="catalog" select="($data_field/descendant-or-self::*[@Schema and @Name and @primaryKey])[1]"/>
    <xsl:variable name="data_catalog" select="($field/px:data|$catalog/source:value|$data_field[not($catalog/@source:value)]/@x:value)[last()]"/>

    <div class="input-group">
      <select id="{$data_field/@x:id}" class="form-select" onchange="this.sourceNode.setAttributes({{'@x:value':this.value,'@x:text':this[this.selectedIndex].text}})">
        <xsl:if test="not($data_catalog/x:r)">
          <xsl:attribute name="disabled">disabled</xsl:attribute>
        </xsl:if>
        <xsl:attribute name="class">
          <xsl:text/>form-select <xsl:if test="key('required',generate-id($field))">
            <xsl:text/>required <xsl:if test="key('empty',generate-id($data_field))"> is-invalid</xsl:if>
          </xsl:if><xsl:text/>
          <xsl:choose>
            <xsl:when test="key('empty',generate-id($data_field))">
              <xsl:text> text-black-50 </xsl:text>
            </xsl:when>
            <xsl:otherwise> text-black </xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
        <xsl:apply-templates mode="control.attributes" select="$data_field"/>
        <xsl:if test="$data_catalog[self::* and x:r]">
          <option value="" selected="selected">
            <xsl:text/>Selecciona <xsl:value-of select="$field/@headerText"/><xsl:text/>
          </option>
        </xsl:if>
        <xsl:apply-templates mode="combobox.options.prepend" select="$data_field"/>
        <xsl:apply-templates select="$data_catalog" mode="combobox.options">
          <xsl:with-param name="data_field" select="$data_field" />
        </xsl:apply-templates>
        <xsl:apply-templates mode="combobox.options.append" select="$data_field"/>
      </select>
      <div class="input-group-append">
        <!--<xsl:choose>
          <xsl:when test="@xhr:exception">
            <span class="fa fa-chain-broken" style="color:red" title="{@xhr:exception}"></span>
          </xsl:when>
          <xsl:when test="@request:value">
            <div class="w3-dropdown-hover" style="right:5px; position: absolute; padding: 3px 0px; color:black;">
              <span class="fas fa-cloud-download-alt" style="color:cornflowerblue; position:absolute; right:0; padding: 0px 0px;">
                <div class="w3-dropdown-content w3-bar-block w3-card-4 xdom-popover">
                  <a href="#" class="w3-bar-item w3-button" style="text-decoration:none; white-space:nowrap;">
                    <span class="fa fa-times-circle" style="color:red;"/>
                    <span style="cursor:pointer;">
                      <xsl:attribute name="onmouseover">
                        <xsl:text/>xdom.xhr.checkStatus()<xsl:text/>
                      </xsl:attribute>
                      <xsl:attribute name="onclick">
                        xdom.xhr.cancelRequest('<xsl:value-of select="@x:id"/>')
                      </xsl:attribute>
                      <xsl:text>Cancelar solcitud al servidor</xsl:text>
                    </span>
                  </a>
                </div>
              </span>
            </div>
          </xsl:when>
          <xsl:otherwise>
            -->
        <!--<xsl:choose>-->
        <!--
            <xsl:if test="@cache:value='true'">
              <xsl:variable name="escaped_apos">
                <xsl:call-template name="string-replace-all">
                  <xsl:with-param name="text" select="@source:value" />
                  <xsl:with-param name="replace">'</xsl:with-param>
                  <xsl:with-param name="by">\'</xsl:with-param>
                </xsl:call-template>
              </xsl:variable>-->
        <xsl:if test="$data_field/@source:value or $data_field/*/@source:value">
          <div class="w3-dropdown-hover input-group-append" style="color:black;">
            <xsl:variable name="message" select="($data_field|$data_field/*)/source:value/x:message"/>
            <!-- Agregar aquí input-group-append hace que al navegar encima, aparezca cubriendo el botón -->
            <xsl:choose>
              <xsl:when test="$message">
                <button class="btn btn-outline-warning" type="button" onclick="" tabindex="-1">
                  <i class="fas fa-exclamation-triangle"></i>
                </button>
              </xsl:when>
              <xsl:when test="($data_field|$data_field/*)/source:value[not(*)]">
                <button class="btn btn-outline-info" type="button" onclick="" tabindex="-1">
                  <i class="fas fa-sync-alt working"/>
                </button>
              </xsl:when>
              <xsl:otherwise>
                <button class="btn btn-outline-info w3-dropdown-hover" type="button" onclick="" tabindex="-1">
                  <i class="fas fa-cog" style="color:black;"></i>
                </button>
              </xsl:otherwise>
            </xsl:choose>
            <div class="w3-dropdown-content w3-bar-block w3-card-4 xdom-popover" style="font-family: Verdana,sans-serif;
    font-size: 9pt;">
              <xsl:choose>
                <xsl:when test="$message">
                  <a href="#" class="w3-bar-item w3-button" style="text-decoration:none">
                    <span class="fas fa-exclamation-triangle" style="color:orange;"/>
                    <span style="cursor:pointer;">
                      <xsl:value-of select="$message"/>
                    </span>
                  </a>
                </xsl:when>
                <xsl:otherwise>
                  <a href="#" class="w3-bar-item w3-button" style="text-decoration:none">
                    <span class="fas fa-sync-alt" style="color:blue;"/>
                    <span style="cursor:pointer;">
                      <xsl:attribute name="onclick">
                        <xsl:text/>var src = xdom.data.findById('<xsl:value-of select="$data_field/@x:id"/>').selectSingleNode('.//source:value'); if (!src) {return}; xdom.data.document.selectNodes('//source:value[@command="'+src.getAttribute("command")+'"]'); xdom.data.remove(src); xdom.dom.refresh();<xsl:text/>
                        <!--<xsl:text/>var src = xdom.data.findById('<xsl:value-of select="$data_field/@x:id"/>'); xdom.data.remove(src.selectSingleNode('.//source:value')); xdom.dom.refresh();<xsl:text/>-->
                      </xsl:attribute>
                      Actualizar
                    </span>
                  </a>
                  <xsl:if test="not(key('disable_insert',@fieldId))">
                    <a href="#" class="w3-bar-item w3-button" style="text-decoration:none">
                      <span class="fas fa-plus-circle" style="color:green;"/>
                      <span style="cursor:pointer;">
                        <xsl:attribute name="onclick">
                          <xsl:text/>px.request('[<xsl:value-of select="$catalog/@Schema"/>].[<xsl:value-of select="$catalog/@Name"/>]','add');<xsl:text/>
                        </xsl:attribute>
                        <xsl:text/>Crear Nuevo<xsl:text/>
                      </span>
                    </a>
                  </xsl:if>
                </xsl:otherwise>
              </xsl:choose>
              <!--<xsl:choose>
                      <xsl:when test="@cache:value='true'">
                        <a href="#" class="w3-bar-item w3-button" style="text-decoration:none">
                          <span class="fas fa-sync-alt" style="color:green;"/>
                          <span style="cursor:pointer;">
                            <xsl:attribute name="onclick">
                              xdom.data.clearCache('<xsl:value-of select="$escaped_apos"/>')
                            </xsl:attribute>
                            Actualizar
                          </span>
                        </a>
                      </xsl:when>
                      <xsl:otherwise>-->
              <!--</xsl:otherwise>
                    </xsl:choose>-->
            </div>
          </div>
        </xsl:if>
        <!--</xsl:if>
          </xsl:otherwise>
        </xsl:choose>-->
      </div>
    </div>
  </xsl:template>

  <!-- Texto para poder escribir -->
  <!--<xsl:template mode="control" match="*[key('foreignKey',@fieldId)]//*[not(@fieldId and @dataType)]" priority="-10">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <xsl:variable name="catalog" select="($data_field/descendant-or-self::*[@Schema and @Name and @primaryKey])[1]"/>
    <xsl:variable name="data_catalog" select="($field/px:data|$catalog/source:value|$data_field[not($catalog/@source:value)]/@x:value)[last()]"/>

    <div class="input-group">
      <input id="{@x:id}" type="text" value="{@x:value}" size="50" maxlength="50" class="form-control" onchange="this.sourceNode.setAttribute('@x:text', this.value);" list="browsers_{@x:id}">
        <xsl:apply-templates mode="control.attributes" select="$data_field"/>
      </input>
      <datalist id="browsers_{@x:id}">
        <xsl:apply-templates select="$data_catalog" mode="combobox.options">
          <xsl:with-param name="data_field" select="$data_field" />
        </xsl:apply-templates>
      </datalist>
    </div>
  </xsl:template>-->

  <xsl:template mode="control" match="*[key('controls.radiogroup',generate-id())]/*" priority="-1">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <xsl:param name="data_catalog" select="key('data_set',generate-id(($data_field/descendant-or-self::*[@Schema and @Name and @primaryKey])[1]))"/>
    <xsl:for-each select="$data_catalog[@x:value!='']">
      <div class="custom-control custom-radio custom-control-inline">
        <input type="radio" id="{@x:id}" name="{$data_field/@x:id}" class="custom-control-input" xo-target="{$data_field/@x:id}" onclick="this.sourceNode.setAttribute('@x:value',this.value)" value="{@x:value}">
          <xsl:if test="$data_field/@x:value=current()/@x:value">
            <xsl:attribute name="onclick">
              <xsl:text/>this.sourceNode.setAttribute('@x:value','')<xsl:text/>
            </xsl:attribute>
            <xsl:attribute name="checked">
              <xsl:text/>checked<xsl:text/>
            </xsl:attribute>
          </xsl:if>
          <xsl:apply-templates mode="control.attributes" select="$data_field"/>
        </input>
        <label class="custom-control-label" for="{@x:id}" xo-target="{$data_field/@x:id}" onclick="this.sourceNode.setAttribute('@x:value','{@x:value}')">
          <xsl:if test="$data_field/@x:value=current()/@x:value">
            <xsl:attribute name="onclick">
              <xsl:text/>this.sourceNode.setAttribute('@x:value','')<xsl:text/>
            </xsl:attribute>
          </xsl:if>
          <xsl:apply-templates select="@x:value"/>
        </label>
      </div>
    </xsl:for-each>
  </xsl:template>

  <xsl:template mode="control" match="*[key('controls.percentage',@fieldId)]" priority="-1">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <xsl:param name="data_catalog" select="key('data_set',generate-id(($data_field/descendant-or-self::*[@Schema and @Name and @primaryKey])[1]))"/>
    <xsl:for-each select="$data_field">
      <div class="input-group flex-nowrap">
        <div class="input-group-prepend">
          <span id="_label_{@x:id}" class="input-group-text" style="margin-right:10pt;">
            <xsl:apply-templates select="@x:value"/>
          </span>
        </div>
        <input id="{@x:id}" name="{$field/@x:id}" type="range" class="form-control-range" step="5" value="0{@x:value}" list="datalist_{generate-id()}" oninput="document.getElementById('_label_{@x:id}').innerHTML=this.value+'%';">
          <xsl:attribute name="onchange">
            <xsl:text/>this.sourceNode.setAttribute('@x:value',this.value)<xsl:text/>
          </xsl:attribute>
        </input>

        <datalist id="datalist_{generate-id()}">
          <option value="0" label="0%"/>
          <option value="10"/>
          <option value="20"/>
          <option value="30"/>
          <option value="40"/>
          <option value="50" label="50%"/>
          <option value="60"/>
          <option value="70"/>
          <option value="80"/>
          <option value="90"/>
          <option value="100" label="100%"/>
        </datalist>
        <!--<div class="input-group-append">
        <span class="input-group-text" style="margin-left:10pt;">100%</span>
      </div>-->
      </div>
    </xsl:for-each>
  </xsl:template>

  <xsl:template mode="checkbox.label" match="*" priority="1"/>

  <xsl:template mode="control" match="*[key('controls.checkbox',generate-id())]" priority="1">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <div class="custom-control custom-switch">
      <input type="checkbox" class="custom-control-input" id="{generate-id()}" xo-target="{@x:id}" value="1" onclick="this.sourceNode.setAttribute('@x:value',this.checked)">
        <xsl:if test="$data_field/@x:value='true' or $data_field/@x:value='1'">
          <xsl:attribute name="checked">checked</xsl:attribute>
        </xsl:if>
      </input>
      <label class="custom-control-label" for="{generate-id()}">
        <xsl:apply-templates mode="checkbox.label" select="."/>
      </label>
    </div>

    <!--<xsl:for-each select="../px:data/*[@x:value!='']">
      <div class="custom-control custom-switch">
        <input type="checkbox" class="custom-control-input" id="customSwitch1"/>
          <label class="custom-control-label" for="customSwitch1">Toggle this switch element</label>
        </div>
      <div class="custom-control custom-radio custom-control-inline">
        <input type="radio" id="{@x:id}" name="{$field/@x:id}" class="custom-control-input" onclick="xdom.data.update('{$data_field/@x:id}','@x:value',this.value)" value="{@x:value}">
          <xsl:if test="$data_field/@x:value=current()/@x:value">
            <xsl:attribute name="checked">
              <xsl:text/>checked<xsl:text/>
            </xsl:attribute>
          </xsl:if>
        </input>
        <label class="custom-control-label" for="{@x:id}">
          <xsl:value-of select="@x:text"/>
        </label>
      </div>
    </xsl:for-each>-->
  </xsl:template>

  <xsl:template mode="control" match="*[@length&gt;255 or @length='-1']" priority="-10">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <xsl:variable name="class">
      <xsl:if test="key('required',generate-id($field))">
        required <xsl:if test="key('empty',generate-id($data_field))"> is-invalid</xsl:if>
      </xsl:if>
      <xsl:apply-templates mode="control.attributes.class" select="."/>
    </xsl:variable>
    <textarea id="{$data_field/@x:id}" class="form-control {$class}" onchange="this.sourceNode.setAttribute('@x:value', this.value)" style="min-height: 29.19px;">
      <xsl:apply-templates mode="control.attributes" select="$data_field"/>
      <xsl:value-of select="$data_field/@x:value"/>
    </textarea>
  </xsl:template>

  <xsl:template mode="control" match="*[@dataType='junctionTable']/*/px:fields/*[@isPrimaryKey='1']" priority="-1">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <xsl:apply-templates select="$data_field/@x:value"/>
  </xsl:template>

  <xsl:template mode="control" match="*[key('controls.email',generate-id())]" priority="-10">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>

    <xsl:variable name="length">
      <xsl:choose>
        <xsl:when test="$field/@length&gt;25">25</xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="@length"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <input id="{$data_field/@x:id}" type="email" value="{$data_field/@x:value}" size="{$length}" maxlength="255" class="form-control" onchange="this.sourceNode.setAttribute('@x:value','')" placeholder="correo@dominio.com">
      <xsl:attribute name="class">
        <xsl:text/>form-control <xsl:if test="key('required',generate-id($field))">
          required <xsl:if test="key('empty',generate-id($data_field))"> is-invalid</xsl:if>
        </xsl:if><xsl:text/>
      </xsl:attribute>
      <xsl:apply-templates mode="control.attributes" select="$data_field"/>
    </input>
    <xsl:if test="key('required',generate-id($field))">
      <span class="invalid-feedback" style="margin-left:5pt;">Campo requerido</span>
    </xsl:if>
  </xsl:template>

  <!--<xsl:template mode="control" match="*[not(key('foreignTable',@fieldId)) and key('blocked',true())] | *[key('blocked',@fieldId)]" priority="10">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <label>
      <xsl:apply-templates select="$data_field/@x:value"/>
  </label>
  </xsl:template>-->

  <xsl:template mode="control" match="*[key('blocked',generate-id())]//*[not(key('foreignTable',@fieldId))] | *[key('blocked',@fieldId)][not(key('foreignTable',@fieldId))] | *[key('blocked',true())][not(key('foreignTable',@fieldId))]" priority="5">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <label>
      <!--<xsl:value-of select="name()"/>
      <xsl:text>:</xsl:text>
      <xsl:value-of select="@x:id"/>
      <xsl:text> = </xsl:text>-->
      <xsl:apply-templates select="$data_field/@x:value"/>
    </label>
  </xsl:template>

  <xsl:template mode="control" match="*[key('readonly',generate-id())[not(key('editable',generate-id()))]]|*[key('readonly',@fieldId)[not(key('editable',generate-id()))]]" priority="5">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <div class="custom-file">
      <input type="text" readonly="readonly" class="form-control-plaintext">
        <xsl:attribute name="value">
          <xsl:apply-templates select="$data_field/@x:value"/>
        </xsl:attribute>
      </input>
    </div>
  </xsl:template>

  <xsl:template mode="control" match="*[key('controls.xml',@fieldId)]" priority="5">
    <xsl:param name="data_field" select="."/>
    <xsl:param name="field" select="."/>
    <label>
      <xsl:apply-templates select="$data_field"/>
    </label>
  </xsl:template>

  <xsl:template mode="control" match="*[key('controls.picture',@fieldId)]" name="controls.picture" priority="7">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <xsl:for-each select="$data_field|self::*[parent::px:dataRow]">
      <xsl:variable name="file_extension">
        <xsl:call-template name="substring-after-last">
          <xsl:with-param name="string" select="@x:value" />
          <xsl:with-param name="delimiter" select="'.'" />
        </xsl:call-template>
      </xsl:variable>
      <xsl:variable name="display_name">
        <xsl:call-template name="substring-after-last">
          <xsl:with-param name="string" select="@x:value" />
          <xsl:with-param name="delimiter" select="'\'" />
        </xsl:call-template>
      </xsl:variable>
      <xsl:variable name="file_name">
        <xsl:choose>
          <xsl:when test="contains(@x:value,'fakepath\')">
            <xsl:value-of select="concat(@x:id,'.',$file_extension)"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$display_name"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="full_path">
        <xsl:call-template name="substring-before-last">
          <xsl:with-param name="string" select="@x:value" />
          <xsl:with-param name="delimiter" select="'\'" />
        </xsl:call-template>
      </xsl:variable>
      <div class="input-group file_control">
        <xsl:choose>
          <xsl:when test="@x:value!=''">
            <div class="input-group-prepend">
              <img id="{@x:id}" src="custom/images/{$file_name}" alt="" style="width:140px;" />
            </div>
            <div class="input-group-append">
              <button class="btn btn-outline-danger" type="button" xo-target="{@x:id}" onclick="this.sourceNode.setAttribute('@x:value','')">
                <xsl:apply-templates mode="control.attributes" select="$data_field"/>
                <i class="far fa-trash-alt" style="cursor:pointer;"></i>
              </button>
            </div>
          </xsl:when>
          <xsl:otherwise>
            <img id="{@x:id}" src="./images/filesystem/no_photo.png" alt="Sin imagen disponible" style="width:100px;" />
            <div class="input-group-append">
              <xsl:call-template name="controls.file">
                <xsl:with-param name="data_field" select="$data_field"/>
                <xsl:with-param name="field" select="$field"/>
                <xsl:with-param name="type">picture</xsl:with-param>
              </xsl:call-template>
            </div>
          </xsl:otherwise>
        </xsl:choose>
      </div>
    </xsl:for-each>
  </xsl:template>

  <!--<xsl:template mode="control" match="*[key('readonly',generate-id())][*[@Schema]]|*[key('readonly',@fieldId)][*[@Schema]]" priority="5">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <xsl:apply-templates select="$data_field">
      <xsl:with-param name="data_field" select="$data_field"/>
      <xsl:with-param name="field" select="$field"/>
    </xsl:apply-templates>
  </xsl:template>-->

  <xsl:template mode="control" match="*[@dataType='foreignTable' or @dataType='junctionTable']" priority="5">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <div>
      <xsl:if test="@dataType='junctionTable'">
        <xsl:attribute name="class">junctionTable</xsl:attribute>
      </xsl:if>
      <xsl:apply-templates mode="datagrid" select="*">
        <xsl:with-param name="parent_record" select="$data_field/*"/>
        <xsl:with-param name="data_row" select="$data_field/*/px:data/px:dataRow"/>
      </xsl:apply-templates>
    </div>
  </xsl:template>

  <xsl:template mode="control" match="*[@controlType='datagridView']/px:fields/*[@dataType='foreignTable' or @dataType='junctionTable']" priority="5">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>
    <ul class="list-group list-group-flush">
      <xsl:for-each select="$data_field/*/px:data/px:dataRow">
        <xsl:variable name="data_row" select="."/>
        <li class="list-group-item">
          <xsl:for-each select="$field/*/px:layout/*">
            <xsl:variable name="fieldId" select="@fieldId"/>
            <xsl:if test="position()&gt;1"> | </xsl:if>
            <xsl:for-each select="$data_row/*[@fieldId=$fieldId]">
              <xsl:choose>
                <xsl:when test="key('controls.picture',@fieldId)">
                  <xsl:apply-templates mode="control" select="."/>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:apply-templates select="@x:value"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:for-each>
          </xsl:for-each>
        </li>
      </xsl:for-each>
    </ul>
  </xsl:template>

  <xsl:template mode="control" match="*[@dataType='foreignTable' and @relationshipType='hasOne']" priority="5">
    <xsl:param name="data_field" select="px:dummy"/>
    <xsl:param name="field" select="."/>

    <xsl:apply-templates select="$data_field/*/px:data/px:dataRow"/>
    <!--<label>
      <xsl:value-of select="count(key('foreignTable',@fieldId)"/>
    </label>-->
  </xsl:template>

  <xsl:template mode="control" match="*[key('hidden',generate-id()) and not(key('visible',generate-id()))]" priority="6"></xsl:template>
</xsl:stylesheet>
