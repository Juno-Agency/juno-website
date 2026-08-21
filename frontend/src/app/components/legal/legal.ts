import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GrainVignetteComponent } from '../grain-vignette/grain-vignette';
import { LEGAL_DOCS, LegalDoc } from '../../models/legal.data';

/** Renders a static legal document chosen by the route's `data.doc`. */
@Component({
  selector: 'app-legal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GrainVignetteComponent],
  templateUrl: './legal.html',
  styleUrl: './legal.scss',
})
export class LegalComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly doc: LegalDoc =
    LEGAL_DOCS[this.route.snapshot.data['doc'] as string] ?? LEGAL_DOCS['mentions'];
}
