/**
 * Client recap — sent to the person who filled the intake form.
 * White page + black rounded card ("Atelier Noir" identity), transparent blob
 * mascot. Warm but premium, no clutter.
 */
export const leadClientMjml = `<mjml>
  <mj-head>
    <mj-title>Merci {{prenom}} — votre demande est bien arrivée</mj-title>
    <mj-preview>On a tout ce qu'il faut. On revient vers vous très vite.</mj-preview>
    <mj-font name="Bricolage Grotesque" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap" />
    <mj-font name="Space Grotesk" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" />
    <mj-font name="Space Mono" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" />
    <mj-attributes>
      <mj-all font-family="'Space Grotesk', 'Helvetica Neue', Arial, sans-serif" />
      <mj-text font-size="16px" color="#fcfcfb" line-height="1.7" />
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

      <!-- Headline -->
      <mj-section padding="26px 30px 0">
        <mj-column>
          <mj-text mj-class="label" color="#fcfcfb">Bien reçu</mj-text>
          <mj-text mj-class="display" font-size="36px" font-weight="800" letter-spacing="-1.2px" line-height="1.08" padding-top="14px">Merci {{prenom}}.<br />Votre projet est bien arrivé.</mj-text>
          <mj-text color="#b9b5ad" font-size="17px" padding-top="16px">On a tout ce qu'il faut pour vous préparer une proposition sur-mesure. Notre équipe revient vers vous très vite.</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="26px 30px 0"><mj-column><mj-divider border-width="1px" border-color="rgba(252,252,251,0.13)" padding="0" /></mj-column></mj-section>

      <!-- Recap -->
      <mj-section padding="24px 30px 0">
        <mj-column>
          <mj-text mj-class="label" color="#fcfcfb">Récapitulatif de votre projet</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="16px 30px 0">
        <mj-column width="50%">
          <mj-text mj-class="label">Type de projet</mj-text>
          <mj-text mj-class="value" padding-top="6px">{{typeLabel}}</mj-text>
        </mj-column>
        <mj-column width="50%">
          <mj-text mj-class="label">Secteur</mj-text>
          <mj-text mj-class="value" padding-top="6px">{{secteur}}</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="18px 30px 0">
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
          <mj-text mj-class="label">Palette</mj-text>
          <mj-text padding-top="11px">{{colorsHtml}}</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="26px 30px 0"><mj-column><mj-divider border-width="1px" border-color="rgba(252,252,251,0.13)" padding="0" /></mj-column></mj-section>

      <!-- Next steps -->
      <mj-section padding="24px 30px 0">
        <mj-column>
          <mj-text mj-class="label" color="#fcfcfb">Et maintenant ?</mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="14px 30px 0">
        <mj-column width="13%"><mj-text mj-class="display" font-size="22px" color="#fcfcfb">1</mj-text></mj-column>
        <mj-column width="87%"><mj-text color="#b9b5ad" padding-top="2px">On étudie votre demande en détail.</mj-text></mj-column>
      </mj-section>
      <mj-section padding="8px 30px 0">
        <mj-column width="13%"><mj-text mj-class="display" font-size="22px" color="#fcfcfb">2</mj-text></mj-column>
        <mj-column width="87%"><mj-text color="#b9b5ad" padding-top="2px">On revient vers vous sous 48&nbsp;h avec une première proposition.</mj-text></mj-column>
      </mj-section>
      <mj-section padding="8px 30px 0">
        <mj-column width="13%"><mj-text mj-class="display" font-size="22px" color="#fcfcfb">3</mj-text></mj-column>
        <mj-column width="87%"><mj-text color="#b9b5ad" padding-top="2px">On affine ensemble, jusqu'au site parfait.</mj-text></mj-column>
      </mj-section>

      <!-- Sign-off -->
      <mj-section padding="30px 30px 0">
        <mj-column>
          <mj-text color="#b9b5ad">Une précision à ajouter&nbsp;? Répondez simplement à cet e-mail, on lit tout.</mj-text>
          <mj-text mj-class="value" padding-top="16px">À très vite,<br />L'équipe JUNO</mj-text>
        </mj-column>
      </mj-section>

      <!-- Footer -->
      <mj-section padding="22px 30px 34px">
        <mj-column>
          <mj-divider border-width="1px" border-color="rgba(252,252,251,0.07)" padding="0 0 16px" />
          <mj-text align="center" mj-class="label" color="#6f6a63" line-height="1.7">JUNO — Agence web · agency-juno.com<br />Cet e-mail confirme la réception de votre demande.</mj-text>
        </mj-column>
      </mj-section>
    </mj-wrapper>

    <mj-section background-color="#ffffff" padding="0 0 28px"><mj-column><mj-spacer height="1px" /></mj-column></mj-section>
  </mj-body>
</mjml>`;
