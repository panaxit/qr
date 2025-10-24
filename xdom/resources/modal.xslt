<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:x="http://panax.io/xdom"
  xmlns:source="http://panax.io/xdom/binding/source"
  xmlns:state="http://panax.io/state"
  xmlns:px="http://panax.io"
  exclude-result-prefixes="px state x source"
  xmlns="http://www.w3.org/1999/xhtml"
>
  <xsl:template match="/" priority="-1">
    <span>
      <xsl:apply-templates select="." mode="control.modal"/>
    </span>
  </xsl:template>

  <xsl:template match="text()" mode="control.modal"/>
  <xsl:template match="text()" mode="control.modal.header"/>
  <xsl:template match="text()" mode="control.modal.header.title.label"/>
  <xsl:template match="text()" mode="control.modal.body"/>
  <xsl:template match="text()" mode="control.modal.footer"/>

  <xsl:template match="*" mode="control.modal.attributes.class" priority="-1">
    <xsl:text/>modal-dialog-centered<xsl:text/>
  </xsl:template>

  <xsl:template match="*" mode="control.modal" priority="-1">
    <div>
      <div class="modal fade" id="modal_{@x:id}" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel_{@x:id}" aria-hidden="true">
        <!--data-bs-backdrop="static" data-bs-keyboard="false" -->
        <xsl:attribute name="class">modal fade show</xsl:attribute>
        <xsl:attribute name="style">display: block;</xsl:attribute>
        <xsl:attribute name="aria-modal">true</xsl:attribute>
        <xsl:variable name="class">
          <xsl:apply-templates mode="control.modal.attributes.class" select="."/>
        </xsl:variable>
        <div class="modal-dialog {$class}">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel_{@x:id}">
                <xsl:apply-templates mode="control.modal.header.title.label" select="."/>
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" data-bs-target="#modal_{@x:id}">
                <xsl:apply-templates mode="control.modal.buttons.close.attributes" select="."/>
                <span aria-hidden="true">&#215;</span>
              </button>
            </div>
            <div class="modal-body">
              <xsl:apply-templates mode="control.modal.body" select="."/>
            </div>
            <div class="modal-footer">
              <xsl:apply-templates mode="control.modal.footer" select="."/>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </div>
  </xsl:template>

  <xsl:template match="*" mode="control.modal.buttons.close.attributes.onclick" priority="-10">
    <xsl:text/>xdom.data.document.getStylesheets({role:"modal"}).remove(); [this.closest(".modal")].map(el => el.parentNode.remove())<xsl:text/>
  </xsl:template>

  <xsl:template match="*" mode="control.modal.buttons.close.attributes" priority="-10">
    <xsl:attribute name="onclick">
      <xsl:apply-templates mode="control.modal.buttons.close.attributes.onclick" select="."/>
    </xsl:attribute>
  </xsl:template>
  <xsl:template match="*[not(descendant::*)]" mode="control.modal.header.title.label" priority="-10">control.modal.header.title.label</xsl:template>          
  <xsl:template match="*[not(descendant::*)]" mode="control.modal.body" priority="-10">control.modal.body</xsl:template>
  <xsl:template match="*[not(descendant::*)]" mode="control.modal.footer" priority="-10">control.modal.footer</xsl:template>
  
</xsl:stylesheet>