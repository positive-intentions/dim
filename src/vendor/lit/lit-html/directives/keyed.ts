/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {nothing, Part} from '../lit-html.ts';
import {directive, Directive} from '../directive.ts';

/**
 * Associates a renderable value with a unique key. When the key changes, the
 * previous DOM is cleared and recreated rather than reused/updated in place.
 *
 * This forces fresh element identity per key, which is essential for view
 * transitions: each transition state owns its own DOM node instead of having an
 * existing node mutated underneath an in-flight animation.
 */
const setCommittedValue = (part: Part, value: unknown = nothing) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((part as any)._$committedValue = value);

class Keyed extends Directive {
  key: unknown = nothing;

  render(k: unknown, v: unknown) {
    this.key = k;
    return v;
  }

  update(part: Part, [k, v]: Array<unknown>) {
    if (k !== this.key) {
      // Clear the part's committed value so the next render treats the value
      // as new and creates fresh DOM instead of updating the existing nodes.
      setCommittedValue(part);
      this.key = k;
    }
    return v;
  }
}

export const keyed = directive(Keyed);
