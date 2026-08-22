/**
 * Internal "new lead" notification — sent to the JUNO team.
 * White page + black rounded card ("Atelier Noir" identity): cream editorial
 * type, warm-gray secondary, hairline dividers, mono uppercase micro-labels,
 * cream CTA, transparent blob mascot. Placeholders ({{key}}) are substituted
 * after MJML compilation; scalars are HTML-escaped, *Html values are pre-built
 * safe markup.
 */
export const leadInternalMjml = `<mjml>
  <mj-head>
    <mj-title>Nouvelle demande — {{nom}}</mj-title>
    <mj-preview>{{secteur}} · {{typeLabel}} · {{budget}}</mj-preview>
    <mj-font name="Bricolage Grotesque" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap" />
    <mj-font name="Space Grotesk" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" />
    <mj-font name="Space Mono" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" />
    <mj-attributes>
      <mj-all font-family="'Space Grotesk', 'Helvetica Neue', Arial, sans-serif" />
      <mj-text font-size="16px" color="#fcfcfb" line-height="1.65" />
      <mj-section background-color="#141414" />
      <mj-class name="label" font-family="'Space Mono', Menlo, Consolas, monospace" color="#b9b5ad" font-size="11px" letter-spacing="2px" line-height="1.2" text-transform="uppercase" />
      <mj-class name="value" font-size="16px" color="#fcfcfb" font-weight="500" />
      <mj-class name="display" font-family="'Bricolage Grotesque', 'Arial Black', Helvetica, sans-serif" color="#fcfcfb" font-weight="700" />
    </mj-attributes>
    <mj-style>a { color:#fcfcfb; }</mj-style>
  </mj-head>

  <mj-body background-color="#ffffff">
    <mj-section background-color="#ffffff" padding="24px 0 0"><mj-column><mj-spacer height="1px" /></mj-column></mj-section>

    <mj-wrapper background-color="#141414" border="1px solid rgba(252,252,251,0.13)" border-radius="16px" padding="0" css-class="card">
      <!-- Brand -->
      <mj-section padding="34px 30px 4px">
        <mj-column>
          <mj-image src="cid:juno-blob" alt="JUNO" width="58px" height="58px" padding="0" />
          <mj-text align="center" mj-class="display" font-size="24px" font-weight="800" letter-spacing="1px" padding-top="12px">JUNO</mj-text>
          <mj-text align="center" mj-class="label" color="#6f6a63" padding-top="7px">Agence web</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="22px 30px 0"><mj-column><mj-divider border-width="1px" border-color="rgba(252,252,251,0.13)" padding="0" /></mj-column></mj-section>

      <!-- Header -->
      <mj-section padding="24px 30px 0">
        <mj-column>
          <mj-text mj-class="label" color="#fcfcfb">Nouvelle demande</mj-text>
          <mj-text mj-class="display" font-size="34px" font-weight="800" letter-spacing="-1px" line-height="1.05" padding-top="12px">{{nom}}</mj-text>
          <mj-text mj-class="label" color="#6f6a63" padding-top="12px">{{createdAt}}</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="22px 30px 0"><mj-column><mj-divider border-width="1px" border-color="rgba(252,252,251,0.13)" padding="0" /></mj-column></mj-section>

      <!-- Contact -->
      <mj-section padding="22px 30px 0">
        <mj-column>
          <mj-text mj-class="label">Contact</mj-text>
          <mj-text padding-top="7px"><a href="mailto:{{email}}" style="color:#fcfcfb; font-weight:600; text-decoration:none;">{{email}}</a></mj-text>
          <mj-text mj-class="label" color="#6f6a63" padding-top="4px">{{tel}}</mj-text>
        </mj-column>
      </mj-section>

      <!-- Grid -->
      <mj-section padding="20px 30px 0">
        <mj-column width="50%">
          <mj-text mj-class="label">Secteur</mj-text>
          <mj-text mj-class="value" padding-top="6px">{{secteur}}</mj-text>
        </mj-column>
        <mj-column width="50%">
          <mj-text mj-class="label">Type de projet</mj-text>
          <mj-text mj-class="value" padding-top="6px">{{typeLabel}}</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="18px 30px 0">
        <mj-column width="50%">
          <mj-text mj-class="label">Site existant</mj-text>
          <mj-text mj-class="value" padding-top="6px">{{existantLabel}}</mj-text>
        </mj-column>
        <mj-column width="50%">
          <mj-text mj-class="label">Budget</mj-text>
          <mj-text mj-class="value" padding-top="6px">{{budget}}</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="18px 30px 0">
        <mj-column>
          <mj-text mj-class="label">Échéance</mj-text>
          <mj-text mj-class="value" padding-top="6px">{{echeance}}</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="26px 30px 0"><mj-column><mj-divider border-width="1px" border-color="rgba(252,252,251,0.13)" padding="0" /></mj-column></mj-section>

      <!-- Preferences -->
      <mj-section padding="22px 30px 0">
        <mj-column>
          <mj-text mj-class="label">Pages souhaitées</mj-text>
          <mj-text padding-top="11px">{{pagesHtml}}</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="14px 30px 0">
        <mj-column>
          <mj-text mj-class="label">Styles</mj-text>
          <mj-text padding-top="11px">{{stylesHtml}}</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="14px 30px 0">
        <mj-column>
          <mj-text mj-class="label">Couleurs</mj-text>
          <mj-text padding-top="11px">{{colorsHtml}}</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="20px 30px 0">
        <mj-column>
          <mj-text mj-class="label">Références</mj-text>
          <mj-text padding-top="8px" color="#b9b5ad">{{refs}}</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="16px 30px 0">
        <mj-column>
          <mj-text mj-class="label">Message</mj-text>
          <mj-text padding-top="8px" color="#b9b5ad">{{message}}</mj-text>
        </mj-column>
      </mj-section>

      <!-- CTA -->
      <mj-section padding="30px 30px 8px">
        <mj-column>
          <mj-text align="center">{{ctaHtml}}</mj-text>
        </mj-column>
      </mj-section>

      <!-- Footer -->
      <mj-section padding="18px 30px 34px">
        <mj-column>
          <mj-divider border-width="1px" border-color="rgba(252,252,251,0.07)" padding="0 0 16px" />
          <mj-text align="center" mj-class="label" color="#6f6a63" line-height="1.7">Reçu via le formulaire agency-juno.com — répondez directement à {{email}}</mj-text>
        </mj-column>
      </mj-section>
    </mj-wrapper>

    <mj-section background-color="#ffffff" padding="0 0 28px"><mj-column><mj-spacer height="1px" /></mj-column></mj-section>
  </mj-body>
</mjml>`;
