/**
 * Streak UI — visible streak chip + grace-period helpers.
 *
 * Renders a flame-icon chip showing the current daily streak. Tier scales
 * with streak length so the visual reward grows.
 *
 *   0 days   -> hidden
 *   1-2      -> base flame (small)
 *   3-6      -> "hot" tier
 *   7-13     -> "blaze" tier
 *   14+      -> "legend" tier (rainbow)
 *
 * Also exposes a grace-period helper. Default Progress logic resets the
 * streak the moment a day is skipped. We keep the underlying value but
 * report a "grace" state for any user that returns within ~36 hours.
 */
const StreakUI = (() => {
    'use strict';

    const GRACE_MS = 36 * 60 * 60 * 1000; // 36 hours

    function _tierFor(days) {
        if (days >= 14) return 'legend';
        if (days >= 7) return 'blaze';
        if (days >= 3) return 'hot';
        return 'base';
    }

    function _daysSinceLastPlay() {
        try {
            const d = Progress.data;
            if (!d || !d.lastPlayDate) return null;
            const last = new Date(d.lastPlayDate + 'T00:00:00');
            const ms = Date.now() - last.getTime();
            return ms / (24 * 60 * 60 * 1000);
        } catch (_) { return null; }
    }

    /** True if a streak break is within the soft 36-hour grace window. */
    function inGracePeriod() {
        const since = _daysSinceLastPlay();
        if (since == null) return false;
        if (since <= 1) return true; // played today or yesterday
        const ms = since * 24 * 60 * 60 * 1000;
        return ms < GRACE_MS;
    }

    function render(hostEl) {
        if (!hostEl) return;
        const streak = (typeof Progress !== 'undefined') ? Progress.getStreak() : 0;
        let existing = hostEl.querySelector('.title-streak-chip');
        if (streak <= 0) {
            if (existing) existing.remove();
            return;
        }
        const tier = _tierFor(streak);
        const label = streak === 1 ? 'day streak' : 'day streak';
        const html = `<span class="streak-flame" aria-hidden="true">🔥</span><span class="streak-num">${streak}</span> ${label}`;
        if (existing) {
            existing.setAttribute('data-tier', tier);
            existing.innerHTML = html;
            existing.setAttribute('aria-label', streak + ' day streak');
            return;
        }
        const chip = document.createElement('div');
        chip.className = 'title-streak-chip';
        chip.setAttribute('data-tier', tier);
        chip.setAttribute('role', 'status');
        chip.setAttribute('aria-label', streak + ' day streak');
        chip.innerHTML = html;
        // Insert right after the subtitle if present, otherwise append
        const subtitle = hostEl.querySelector('.title-subtitle');
        if (subtitle && subtitle.parentNode === hostEl) {
            subtitle.insertAdjacentElement('afterend', chip);
        } else {
            hostEl.appendChild(chip);
        }
    }

    return { render, inGracePeriod, GRACE_MS };
})();
