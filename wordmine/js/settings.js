/* ============================================
   SETTINGS — Audio & Accessibility Controls
   ============================================ */
const Settings = (() => {
    function init() {
        const s = Progress.get().settings;

        // Initialize toggle states
        setToggle('toggle-sound', s.sound);
        setToggle('toggle-music', s.music);
        setToggle('toggle-voice', s.voice);
        setToggle('toggle-contrast', s.highContrast);

        // Toggle event listeners — always read fresh from Progress to avoid stale refs after reset
        document.getElementById('toggle-sound').addEventListener('click', () => {
            const st = Progress.get().settings;
            st.sound = !st.sound;
            setToggle('toggle-sound', st.sound);
            Audio.setSoundOn(st.sound);
            Progress.save();
        });

        document.getElementById('toggle-music').addEventListener('click', () => {
            const st = Progress.get().settings;
            st.music = !st.music;
            setToggle('toggle-music', st.music);
            Audio.setMusicOn(st.music);
            Progress.save();
        });

        document.getElementById('toggle-voice').addEventListener('click', () => {
            const st = Progress.get().settings;
            st.voice = !st.voice;
            setToggle('toggle-voice', st.voice);
            Audio.setVoiceOn(st.voice);
            Progress.save();
        });

        document.getElementById('toggle-contrast').addEventListener('click', () => {
            const st = Progress.get().settings;
            st.highContrast = !st.highContrast;
            setToggle('toggle-contrast', st.highContrast);
            document.body.classList.toggle('high-contrast', st.highContrast);
            Progress.save();
        });

        // Grade buttons in settings
        document.querySelectorAll('.settings-grade .grade-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.settings-grade .grade-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                Progress.setGrade(btn.dataset.grade);
            });
        });

        // Apply saved high contrast
        if (s.highContrast) {
            document.body.classList.add('high-contrast');
        }

        // Set saved grade button
        const d = Progress.get();
        const gradeBtn = document.querySelector(`.settings-grade .grade-btn[data-grade="${d.grade}"]`);
        if (gradeBtn) {
            document.querySelectorAll('.settings-grade .grade-btn').forEach(b => b.classList.remove('selected'));
            gradeBtn.classList.add('selected');
        }
    }

    function setToggle(id, on) {
        const btn = document.getElementById(id);
        btn.dataset.on = on ? 'true' : 'false';
        btn.textContent = on ? 'ON' : 'OFF';
        btn.classList.toggle('active', on);
    }

    function show() {
        // Refresh toggle states when showing
        const s = Progress.get().settings;
        setToggle('toggle-sound', s.sound);
        setToggle('toggle-music', s.music);
        setToggle('toggle-voice', s.voice);
        setToggle('toggle-contrast', s.highContrast);
    }

    return { init, show };
})();
