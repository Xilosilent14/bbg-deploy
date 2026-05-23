// ===== TYPE CHART RENDERER =====
// Static visual reference of the type matchup grid (Ember > Terra > Spark > Tidal > Ember; Shadow neutral).
// Renders into #type-chart-content. Accessible: text + emoji + position carries
// information (not color alone).
const TypeChart = (() => {
    const ORDER = ['ember', 'tidal', 'terra', 'spark', 'shadow'];
    const LABEL = {
        win:     { sym: 'STRONG', emoji: '✨', cls: 'tc-win',     text: 'beats' },
        lose:    { sym: 'WEAK',   emoji: '⚠️', cls: 'tc-lose',    text: 'loses to' },
        neutral: { sym: 'EVEN',   emoji: '×',  cls: 'tc-neutral', text: 'even with' }
    };

    function _matchup(attacker, defender) {
        const adv = (typeof CreatureData !== 'undefined' && CreatureData.getTypeAdvantage)
            ? CreatureData.getTypeAdvantage(attacker, defender) : 1.0;
        if (adv > 1) return LABEL.win;
        if (adv < 1) return LABEL.lose;
        return LABEL.neutral;
    }

    function render(containerId) {
        const el = document.getElementById(containerId || 'type-chart-content');
        if (!el || typeof CreatureData === 'undefined') return;
        const TYPES = CreatureData.TYPES;

        // Build "ring of types" + matchup grid
        const intro = `
            <div class="type-chart-intro">
                <p>Picking the right type makes attacks <strong>1.5x</strong> stronger.
                Picking the wrong type makes them <strong>0.75x</strong> weaker.</p>
                <p class="type-chart-rule">Ember &raquo; Terra &raquo; Spark &raquo; Tidal &raquo; Ember.
                Shadow is even against everyone.</p>
            </div>
        `;

        const header = '<th scope="col"><span aria-hidden="true">vs</span><span class="sr-only">attacker vs defender</span></th>' + ORDER.map(t => {
            const td = TYPES[t];
            return `<th scope="col" style="color:${td.color}"><span aria-hidden="true">${td.icon}</span> ${td.name}</th>`;
        }).join('');

        const rows = ORDER.map(att => {
            const ad = TYPES[att];
            const cells = ORDER.map(def => {
                const m = _matchup(att, def);
                const dd = TYPES[def];
                return `<td class="${m.cls}" data-att="${att}" data-def="${def}"
                              role="cell"
                              aria-label="${ad.name} ${m.text} ${dd.name}">
                    <span class="tc-sym" aria-hidden="true">${m.emoji}</span>
                    <span class="tc-text">${m.sym}</span>
                </td>`;
            }).join('');
            return `<tr>
                <th scope="row" style="color:${ad.color}"><span aria-hidden="true">${ad.icon}</span> ${ad.name}</th>
                ${cells}
            </tr>`;
        }).join('');

        el.innerHTML = `
            ${intro}
            <div class="type-chart-table-wrap">
                <table class="type-chart-table" aria-label="Type matchup chart">
                    <thead><tr>${header}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div class="type-chart-legend" aria-label="Legend">
                <span class="tc-legend-item tc-win"><span aria-hidden="true">✨</span> Strong (1.5x damage)</span>
                <span class="tc-legend-item tc-lose"><span aria-hidden="true">⚠️</span> Weak (0.75x damage)</span>
                <span class="tc-legend-item tc-neutral"><span aria-hidden="true">×</span> Even (1x damage)</span>
            </div>
        `;
    }

    return { render };
})();
