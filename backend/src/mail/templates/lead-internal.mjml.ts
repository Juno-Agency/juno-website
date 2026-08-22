/**
 * Internal "new lead" notification — sent to the JUNO team.
 * Placeholders ({{key}}) are substituted after MJML compilation. Scalar values
 * are HTML-escaped at build time; *Html values already contain safe markup.
 */
export const leadInternalMjml = `<mjml>
  <mj-head>
    <mj-title>Nouvelle demande — {{nom}}</mj-title>
    <mj-preview>{{secteur}} · {{typeLabel}} · {{budget}}</mj-preview>
    <mj-attributes>
      <mj-all font-family="Helvetica, Arial, sans-serif" />
      <mj-text font-size="15px" color="#1f2937" line-height="1.6" />
    </mj-attributes>
    <mj-style>
      .chip { display:inline-block; padding:4px 10px; margin:0 6px 6px 0; border-radius:999px; background:#f1f5f9; color:#0f172a; font-size:13px; }
      .swatch { display:inline-block; width:14px; height:14px; border-radius:4px; margin-right:6px; vertical-align:middle; border:1px solid rgba(0,0,0,.1); }
      .label { font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:#64748b; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#eef2f7">
    <mj-section padding="24px 0 0">
      <mj-column>
        <mj-text align="center" font-size="22px" font-weight="700" color="#0f172a" letter-spacing="2px">JUNO</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#0f172a" border-radius="14px 14px 0 0" padding="28px 28px 22px">
      <mj-column>
        <mj-text color="#8cc63f" font-size="13px" font-weight="700" text-transform="uppercase" letter-spacing=".08em">Nouvelle demande</mj-text>
        <mj-text color="#ffffff" font-size="24px" font-weight="700" padding-top="4px">{{nom}}</mj-text>
        <mj-text color="#94a3b8" font-size="14px" padding-top="2px">{{createdAt}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="26px 28px 6px">
      <mj-column>
        <mj-text><span class="label">Contact</span></mj-text>
        <mj-text padding-top="4px"><a href="mailto:{{email}}" style="color:#0f172a; font-weight:600; text-decoration:none;">{{email}}</a> &nbsp;·&nbsp; {{tel}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="10px 28px 6px">
      <mj-column width="50%">
        <mj-text><span class="label">Secteur</span></mj-text>
        <mj-text padding-top="4px" font-weight="600">{{secteur}}</mj-text>
      </mj-column>
      <mj-column width="50%">
        <mj-text><span class="label">Type de projet</span></mj-text>
        <mj-text padding-top="4px" font-weight="600">{{typeLabel}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="10px 28px 6px">
      <mj-column width="50%">
        <mj-text><span class="label">Site existant</span></mj-text>
        <mj-text padding-top="4px" font-weight="600">{{existantLabel}}</mj-text>
      </mj-column>
      <mj-column width="50%">
        <mj-text><span class="label">Budget</span></mj-text>
        <mj-text padding-top="4px" font-weight="600">{{budget}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="10px 28px 6px">
      <mj-column>
        <mj-text><span class="label">Échéance</span></mj-text>
        <mj-text padding-top="4px" font-weight="600">{{echeance}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="12px 28px 6px">
      <mj-column>
        <mj-text><span class="label">Pages souhaitées</span></mj-text>
        <mj-text padding-top="6px">{{pagesHtml}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="6px 28px 6px">
      <mj-column>
        <mj-text><span class="label">Styles</span></mj-text>
        <mj-text padding-top="6px">{{stylesHtml}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="6px 28px 6px">
      <mj-column>
        <mj-text><span class="label">Couleurs</span></mj-text>
        <mj-text padding-top="6px">{{colorsHtml}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="12px 28px 6px">
      <mj-column>
        <mj-text><span class="label">Références</span></mj-text>
        <mj-text padding-top="6px" color="#334155">{{refs}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="12px 28px 20px">
      <mj-column>
        <mj-text><span class="label">Message</span></mj-text>
        <mj-text padding-top="6px" color="#334155">{{message}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="6px 28px 20px">
      <mj-column>
        <mj-text align="center">{{ctaHtml}}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" border-radius="0 0 14px 14px" padding="18px 28px 26px">
      <mj-column>
        <mj-divider border-width="1px" border-color="#e2e8f0" padding="0 0 16px" />
        <mj-text align="center" color="#94a3b8" font-size="12px">Demande reçue via le formulaire juno.studio — répondez directement à {{email}}.</mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="10px 0 30px"><mj-column></mj-column></mj-section>
  </mj-body>
</mjml>`;
