/**
 * Client recap — sent to the person who filled the intake form.
 * Warm, reassuring, and a clean summary of what we received.
 */
export const leadClientMjml = `<mjml>
  <mj-head>
    <mj-title>Merci {{prenom}} — on a bien reçu votre demande</mj-title>
    <mj-preview>Voici le récapitulatif de votre projet et la suite.</mj-preview>
    <mj-attributes>
      <mj-all font-family="Helvetica, Arial, sans-serif" />
      <mj-text font-size="16px" color="#1f2937" line-height="1.7" />
    </mj-attributes>
    <mj-style>
      .chip { display:inline-block; padding:4px 10px; margin:0 6px 6px 0; border-radius:999px; background:#f1f5f9; color:#0f172a; font-size:13px; }
      .swatch { display:inline-block; width:14px; height:14px; border-radius:4px; margin-right:6px; vertical-align:middle; border:1px solid rgba(0,0,0,.1); }
      .rlabel { font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:#64748b; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#eef2f7">
    <mj-section padding="24px 0 0">
      <mj-column>
        <mj-text align="center" font-size="22px" font-weight="700" color="#0f172a" letter-spacing="2px">JUNO</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#0f172a" border-radius="14px 14px 0 0" padding="34px 30px">
      <mj-column>
        <mj-text color="#ffffff" font-size="26px" font-weight="700" line-height="1.35">Merci {{prenom}},<br />votre demande est bien arrivée 🎉</mj-text>
        <mj-text color="#cbd5e1" font-size="16px" padding-top="10px">On a tout ce qu'il faut pour vous préparer une proposition. Notre équipe revient vers vous très vite.</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="30px 30px 8px">
      <mj-column>
        <mj-text font-size="14px" font-weight="700" color="#0f172a" text-transform="uppercase" letter-spacing=".06em">Récapitulatif de votre projet</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="6px 30px 4px">
      <mj-column width="50%">
        <mj-text><span class="rlabel">Type de projet</span></mj-text>
        <mj-text padding-top="4px" font-weight="600">{{typeLabel}}</mj-text>
      </mj-column>
      <mj-column width="50%">
        <mj-text><span class="rlabel">Secteur</span></mj-text>
        <mj-text padding-top="4px" font-weight="600">{{secteur}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="8px 30px 4px">
      <mj-column>
        <mj-text><span class="rlabel">Pages souhaitées</span></mj-text>
        <mj-text padding-top="6px">{{pagesHtml}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="4px 30px 4px">
      <mj-column>
        <mj-text><span class="rlabel">Styles</span></mj-text>
        <mj-text padding-top="6px">{{stylesHtml}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="4px 30px 18px">
      <mj-column>
        <mj-text><span class="rlabel">Palette</span></mj-text>
        <mj-text padding-top="6px">{{colorsHtml}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#f8fafc" padding="24px 30px">
      <mj-column>
        <mj-text font-size="14px" font-weight="700" color="#0f172a" text-transform="uppercase" letter-spacing=".06em">Et maintenant ?</mj-text>
        <mj-text padding-top="10px" color="#334155">1. On étudie votre demande en détail.</mj-text>
        <mj-text color="#334155">2. On revient vers vous sous 48h avec une première proposition.</mj-text>
        <mj-text color="#334155">3. On affine ensemble jusqu'au projet parfait.</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" border-radius="0 0 14px 14px" padding="26px 30px 30px">
      <mj-column>
        <mj-text color="#334155">Une précision à ajouter&nbsp;? Répondez simplement à cet e-mail, on lit tout.</mj-text>
        <mj-text padding-top="14px" color="#0f172a" font-weight="600">À très vite,<br />L'équipe JUNO</mj-text>
        <mj-divider border-width="1px" border-color="#e2e8f0" padding="20px 0 14px" />
        <mj-text align="center" color="#94a3b8" font-size="12px">JUNO · juno.studio — cet e-mail confirme la réception de votre demande.</mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="10px 0 30px"><mj-column></mj-column></mj-section>
  </mj-body>
</mjml>`;
