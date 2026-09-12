/**
 * The grey verification badge observed in user-supplied X HTML (2026-09-12).
 * X documents this badge for government/multilateral accounts and individuals:
 * https://help.x.com/en/using-x/grey-checkmark
 *
 * Deliberately a rendered-badge detector, not a classification from account text
 * or an undocumented API field. Unknown badge variants do not match.
 */
import { SELECTORS } from '../shared/constants.js';

export const VERIFIED_BADGE_SELECTOR = 'svg[data-testid="icon-verified"]';

/** Keep the lookup inside this author's header, not the enclosing tweet. */
export function hasGovernmentBadge(element) {
    if (!element?.matches) return false;
    const ownHeader = element.matches(SELECTORS.USERNAME) ? element
        : element.closest(SELECTORS.USERNAME) ||
            (element.matches(SELECTORS.USER_CELL) ? element.querySelector(SELECTORS.USERNAME) : null);
    if (!ownHeader) return false;

    for (const badge of ownHeader.querySelectorAll(VERIFIED_BADGE_SELECTOR)) {
        if (badge.closest(SELECTORS.USERNAME) !== ownHeader) continue;
        let parent = badge.parentElement;
        let nested = false;
        while (parent && parent !== ownHeader) {
            // Affiliation badges and extension content aren't the author's own
            // verification, even when they happen to sit next to the name.
            if (parent.matches('div[role="link"][tabindex="0"], .x-info-badge, [data-testid="tweetText"], [data-testid="Tweet-User-Avatar"]')) {
                nested = true;
                break;
            }
            parent = parent.parentElement;
        }
        if (nested || parent !== ownHeader) continue;
        for (const path of badge.querySelectorAll('path[fill]')) {
            if (path.closest('svg') !== badge) continue;
            if ((path.getAttribute('fill') || '').trim().toLowerCase() === '#829aab') return true;
        }
    }
    return false;
}
