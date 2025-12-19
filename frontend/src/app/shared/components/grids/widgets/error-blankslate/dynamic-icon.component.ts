//-- copyright
// OpenProject is an open source project management software.
// Copyright (C) the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See COPYRIGHT and LICENSE files for more details.
//++

/* eslint-disable @angular-eslint/component-selector */

import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { closestNaturalHeight, sizeMap, SVGData, SVGSize } from '@openproject/octicons-angular';

@Component({
  selector: 'svg[dynamic-icon]',
  template: `
    @if (title()) {
      <title>{{title()}}</title>
    }

    @for (path of paths(); track path) {
      <svg:path [attr.d]="path"></svg:path>
    }
  `,
  host: {
    '[attr.role]': 'role()',
    '[attr.fill]': 'fill()',
    '[attr.id]': 'id()',
    '[attr.aria-label]': 'ariaLabelAttr()',
    '[attr.aria-labelledby]': 'ariaLabelledByAttr()',
    '[attr.aria-hidden]': 'ariaHidden()',
    '[attr.tabindex]': 'tabIndex()',
    '[attr.viewBox]': 'viewBox()',
    '[class.octicon]': 'baseClassName',
    '[style]': 'style()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicIconComponent {
  protected sanitizer = inject(DomSanitizer);

  readonly data = input<SVGData>();
  readonly size = input<SVGSize>('medium');
  readonly verticalAlign = input('text-bottom');
  readonly title = input<string>();
  readonly tabIndex = input<number>();
  readonly fill = input('currentColor');
  readonly id = input<string>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });

  readonly baseClassName = true;

  /**
   * role="img" should only be set when the icon has an accessible label.
   * Setting both role="img" and aria-hidden="true" is an accessibility error.
   */
  readonly role = computed(() => {
    return (this.ariaLabel() || this.ariaLabelledby()) ? 'img' : null;
  });

  /**
   * aria-hidden is true when neither aria-label nor aria-labelledby is provided
   */
  readonly ariaHidden = computed(() => !this.ariaLabel() && !this.ariaLabelledby());

  /**
   * aria-labelledby takes precedence over aria-label when both are provided.
   * This follows the ARIA specification where aria-labelledby overrides all other naming sources.
   * Neither is set when aria-hidden is true (no accessible label provided).
   */
  readonly ariaLabelAttr = computed(() => {
    // Don't set aria-label when aria-labelledby is set (mutual exclusivity)
    if (this.ariaLabelledby()) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return this.ariaLabel() || null;
  });

  readonly ariaLabelledByAttr = computed(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return this.ariaLabelledby() || null;
  });

  readonly style = computed(() => ({
    display: 'inline-block',
    'user-select': 'none',
    'vertical-align': this.verticalAlign(),
    overflow: 'visible',
    height: `${this.height()}px`,
    width: `${this.width()}px`,
  }));

  readonly viewBox = computed(() =>
    `0 0 ${this.naturalWidth()} ${this.naturalHeight()}`
  );

  readonly naturalHeight = computed(() =>
    closestNaturalHeight(Object.keys(this.data()!), this.height())
  );

  readonly height = computed(() =>
    sizeMap[this.size()]
  );

  readonly naturalWidth = computed(() =>
    this.data()![this.naturalHeight()].width
  );

  readonly width = computed(() =>
    this.height() * (this.naturalWidth() / this.naturalHeight())
  );

  readonly paths = computed(() =>
    this.data()![this.naturalHeight()].paths
  );
}
