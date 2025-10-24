<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns="http://www.w3.org/1999/xhtml"
xmlns:shell="http://panax.io/shell"
exclude-result-prefixes="#default shell"
>
  <xsl:output method="xml"
     omit-xml-declaration="yes"
     indent="yes"/>

  <xsl:template priority="-1" match="*" mode="shell.sections.left">Lefts</xsl:template>
  <xsl:template priority="-1" match="*" mode="shell.sections.right">Rigth</xsl:template>
  <xsl:template priority="-1" match="*" mode="shell.sections.header">Header</xsl:template>
  <xsl:template priority="-1" match="*" mode="shell.sections.footer"></xsl:template>
  <xsl:template priority="-1" match="*" mode="shell.sections.nav">Nav</xsl:template>

  <xsl:template match="*" mode="shell.styles">
    <style>
      <![CDATA[
    html, body
    {
        overflow: hidden;
    }

    body > *
    {
      height: 100vh;
      width: 100vw;
    }

    .wrapper {
      width:100%; height:100%;
    }
    
    .shell {
      height: 100vh;
      width: 100vw;
    }

    .horizontal-layout {
      height: 100%;
      width: 100%;
      display: grid;
      grid-template-columns: minmax(150px, 150px) 1fr;
    }

    .vertical-layout {
      display: grid;
      grid-template-rows: auto 1fr auto;
      grid-template-columns: 1fr;
    }
    
    .coral {
      background-color: var(--coral);
      border: 1px solid var(--coral--b);
    }

    .pink {
      background-color: var(--pink);
      border: 1px solid var(--pink--b);
    }

    .yellow {
      background-color: var(--yellow);
      border: 1px solid var(--yellow--b);
    }

    .green {
      background-color: var(--green);
      border: 1px solid var(--green--b);
    }

    .blue {
      background-color: var(--blue);
      border: 1px solid var(--blue--b);
    }

    .purple {
      background-color: var(--purple);
      border: 1px solid var(--purple--b)
    }

    .white {
      background-color: white;
    }]]>
    </style>
  </xsl:template>

  <xsl:template match="shell:shell" mode="shell">
    <span class="shell">
      <xsl:apply-templates mode="shell.styles" select="."/>
      <span class="horizontal-layout">
        <span class="left-bar yellow section">
          <xsl:apply-templates select="." mode="shell.sections.left"/>
        </span>
        <span class="vertical-layout">
          <header>
            <xsl:apply-templates select="." mode="shell.sections.header"/>
          </header>
          <main>
            <xsl:apply-templates select="." mode="shell.sections.main"/>
          </main>
          <footer>
            <xsl:apply-templates select="." mode="shell.sections.footer"/>
          </footer>
        </span>
      </span>
    </span>
  </xsl:template>

</xsl:stylesheet>