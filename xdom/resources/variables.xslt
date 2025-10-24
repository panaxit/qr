<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
>
  <xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyzáàâäéèêëíìîïóòôöúùûü'" />
  <xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀÂÄÉÈÊËÍÌÎÏÓÒÔÖÚÙÛÜ'" />
  <xsl:variable name="accented" select="'ÁÀÂÄÉÈÊËÍÌÎÏÓÒÔÖÚÙÛÜ'" />
  <xsl:variable name="accented-less" select="'AAAAEEEEIIIIOOOOUUUU'" />

  <xsl:variable name="space"> </xsl:variable>
  <xsl:variable name="nbsp">&#160;</xsl:variable>
  <xsl:variable name="cr">&lt;br /&gt;</xsl:variable>
  <xsl:variable name="calendarPath"></xsl:variable>
  <xsl:variable name="apostrophe">'</xsl:variable>
</xsl:stylesheet>
