// ===== STORY MODE — MICHIGAN ROAD TRIP (CORVETTE EDITION) V40 =====
const StoryMode = {
    // 5 chapters across Michigan, 3 races each, starting from Macomb Township
    chapters: [
        {
            id: 'hometown-heroes',
            name: 'Hometown Heroes',
            icon: '🏠',
            landmark: 'Corvette Birthplace',
            landmarkIcon: '🏎️',
            desc: 'Start in Macomb Township and explore nearby cities!',
            gradeHint: 'Pre-K',
            races: [
                {
                    trackIndex: 0, // Hometown Speedway
                    intro: "Your Michigan road trip starts! First stop: Rochester! Did you know Meadow Brook Hall has 110 rooms? That's almost twice as big as the White House!",
                    introIcon: '🦕',
                    subject: 'math',
                    stopName: 'Rochester'
                },
                {
                    trackIndex: 8, // Motor City Drive
                    intro: "Welcome to Detroit — the Motor City! This city had the very first traffic light AND there's a giant salt mine hidden under the streets!",
                    introIcon: '🏙️',
                    subject: 'reading',
                    stopName: 'Detroit'
                },
                {
                    trackIndex: 0, // Hometown Speedway
                    intro: "Guess what? The very FIRST Corvette was built right here in Flint in 1953! Your car's great-great-grandpa was born here! Only 300 were made — all white with red inside!",
                    introIcon: '🏎️',
                    subject: 'math',
                    stopName: 'Flint'
                }
            ],
            outro: "Amazing! You found where the first Corvette was built! Your car's great-great-grandpa was born right here in Flint!",
            outroIcon: '🏎️'
        },
        {
            id: 'college-cruise',
            name: 'College Town Cruise',
            icon: '🎓',
            landmark: 'Dutch Windmill',
            landmarkIcon: '🌷',
            desc: 'Cruise through southern Michigan\'s coolest towns!',
            gradeHint: 'Kindergarten',
            races: [
                {
                    trackIndex: 4, // City Circuit
                    intro: "Welcome to Ann Arbor! The Big House stadium can hold 107,000 people — that's like fitting a whole city inside! Go Wolverines!",
                    introIcon: '🏟️',
                    subject: 'reading',
                    stopName: 'Ann Arbor'
                },
                {
                    trackIndex: 0, // Hometown Speedway
                    intro: "Say it with me: Ka-la-ma-ZOO! It's the funniest city name ever! Believe it or not, Kalamazoo was once the celery capital of the whole world!",
                    introIcon: '🎪',
                    subject: 'math',
                    stopName: 'Kalamazoo'
                },
                {
                    trackIndex: 1, // Beach Boulevard
                    intro: "Holland has a REAL windmill from the Netherlands called De Zwaan! It was taken apart brick by brick and shipped across the ocean. It still grinds flour today!",
                    introIcon: '🌷',
                    subject: 'reading',
                    stopName: 'Holland'
                }
            ],
            outro: "You visited a real windmill from the Netherlands! It was taken apart and shipped across the ocean piece by piece!",
            outroIcon: '🌷'
        },
        {
            id: 'lakeshore-run',
            name: 'Lakeshore Run',
            icon: '🌊',
            landmark: 'Cherry Capital',
            landmarkIcon: '🍒',
            desc: 'Race up the beautiful Lake Michigan coast!',
            gradeHint: '1st Grade',
            races: [
                {
                    trackIndex: 4, // City Circuit
                    intro: "Grand Rapids has a building with 7,000 butterflies flying around inside! And this is where President Gerald Ford grew up!",
                    introIcon: '🦋',
                    subject: 'math',
                    stopName: 'Grand Rapids'
                },
                {
                    trackIndex: 9, // Cherry Orchard Run
                    intro: "Traverse City is the Cherry Capital of the World! One cherry tree grows 7,000 cherries — enough to bake 28 pies! That's a LOT of pie!",
                    introIcon: '🍒',
                    subject: 'reading',
                    stopName: 'Traverse City'
                },
                {
                    trackIndex: 10, // Lakeshore Dunes
                    intro: "Sleeping Bear Dunes has sand hills 460 feet tall! A legend says a mama bear is sleeping under the dunes, waiting for her two cubs who turned into islands!",
                    introIcon: '🏖️',
                    subject: 'math',
                    stopName: 'Sleeping Bear Dunes'
                }
            ],
            outro: "You're in Cherry Country! One cherry tree grows enough cherries to bake 28 pies! Can you imagine eating all of them?",
            outroIcon: '🍒'
        },
        {
            id: 'bridge-up',
            name: 'Bridge to the U.P.',
            icon: '🌉',
            landmark: 'Mighty Mac',
            landmarkIcon: '🌉',
            desc: 'Cross the famous bridge into the Upper Peninsula!',
            gradeHint: '1st Grade',
            races: [
                {
                    trackIndex: 11, // Mighty Mac Bridge
                    intro: "The Mackinac Bridge is almost 5 miles long! It takes 7 years to paint the whole thing, and then they have to start all over again!",
                    introIcon: '🌉',
                    subject: 'reading',
                    stopName: 'Mackinac Bridge'
                },
                {
                    trackIndex: 1, // Beach Boulevard
                    intro: "Mackinac Island has ZERO cars! No stop signs, no gas stations! Everyone rides horses or bikes. Your Corvette has to wait on the shore!",
                    introIcon: '🐴',
                    subject: 'math',
                    stopName: 'Mackinac Island'
                },
                {
                    trackIndex: 2, // Mountain Pass
                    intro: "The Soo Locks are like a giant elevator for ships! They lift huge boats up and down using only water and gravity — no motors! 10,000 ships go through every year!",
                    introIcon: '⚓',
                    subject: 'reading',
                    stopName: 'Sault Ste. Marie'
                }
            ],
            outro: "You crossed the Mighty Mac! It's 5 miles long and takes 7 years to paint the whole thing! What a bridge!",
            outroIcon: '🌉'
        },
        {
            id: 'up-championship',
            name: 'U.P. Championship',
            icon: '🏆',
            landmark: 'State Capitol',
            landmarkIcon: '🏛️',
            desc: 'Explore the wild Upper Peninsula and race home!',
            gradeHint: '2nd Grade',
            races: [
                {
                    trackIndex: 12, // U.P. Wilderness
                    intro: "Tahquamenon Falls is called Root Beer Falls because the water is brown and foamy like root beer! The color comes from tree bark soaking in the river!",
                    introIcon: '🌊',
                    subject: 'math',
                    stopName: 'Tahquamenon Falls'
                },
                {
                    trackIndex: 3, // Desert Highway (sunset on cliffs)
                    intro: "Pictured Rocks has cliffs 200 feet tall painted by nature! Iron makes them red, copper makes them green, and other minerals make purple and black!",
                    introIcon: '🎨',
                    subject: 'reading',
                    stopName: 'Pictured Rocks'
                },
                {
                    trackIndex: 6, // Championship Finale
                    intro: "Final stop: Lansing, our state capital! The Capitol floor has fossils of sea snails from 475 million years ago hidden in the tiles! Race home to Macomb Township!",
                    introIcon: '🏛️',
                    subject: 'math',
                    stopName: 'Lansing'
                }
            ],
            outro: "YOU DID IT! You drove your Corvette all around Michigan and back home to Macomb Township! What an amazing road trip, racer!",
            outroIcon: '🏆'
        }
    ],

    // --- Landmark SVG illustrations (shown in collection row and chapter completion) ---
    landmarkSvgs: {
        '🏎️': `<svg viewBox="0 0 48 28" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="lm-car-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ff4444"/><stop offset="100%" stop-color="#cc0000"/>
                </linearGradient>
            </defs>
            <path d="M8,18 Q6,18 4,16 L2,14 Q1,13 2,12 L8,10 Q12,6 18,5 L32,5 Q38,5 42,8 L46,12 Q47,13 46,14 L44,16 Q42,18 40,18 Z" fill="url(#lm-car-grad)" stroke="#990000" stroke-width="0.5"/>
            <path d="M14,8 Q16,5.5 22,5 L30,5 Q34,5 36,7 L32,7 Q28,7 24,8 Z" fill="rgba(150,210,255,0.7)" stroke="rgba(100,160,220,0.5)" stroke-width="0.3"/>
            <circle cx="12" cy="20" r="3.5" fill="#222" stroke="#444" stroke-width="0.5"/>
            <circle cx="12" cy="20" r="1.5" fill="#888"/>
            <circle cx="36" cy="20" r="3.5" fill="#222" stroke="#444" stroke-width="0.5"/>
            <circle cx="36" cy="20" r="1.5" fill="#888"/>
            <path d="M4,13 L8,11 L10,13 Z" fill="#ffcc00" opacity="0.8"/>
            <line x1="18" y1="12" x2="34" y2="12" stroke="rgba(255,255,255,0.15)" stroke-width="0.8"/>
        </svg>`,

        '🌷': `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="lm-tulip-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ff6b8a"/><stop offset="100%" stop-color="#cc2255"/>
                </linearGradient>
            </defs>
            <line x1="20" y1="22" x2="20" y2="38" stroke="#2d8c2d" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M20,36 Q14,32 12,28" fill="none" stroke="#2d8c2d" stroke-width="1.5" stroke-linecap="round"/>
            <ellipse cx="12" cy="27" rx="3" ry="1.5" fill="#3da63d" transform="rotate(-20,12,27)"/>
            <path d="M20,22 Q22,14 28,10 Q24,8 20,4 Q16,8 12,10 Q18,14 20,22 Z" fill="url(#lm-tulip-grad)"/>
            <path d="M20,4 Q17,9 15,12" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/>
            <path d="M20,4 Q23,9 25,12" fill="none" stroke="rgba(255,100,150,0.3)" stroke-width="0.8"/>
            <path d="M24,16 L28,6 L32,12 L28,10 Z" fill="#888" opacity="0.25" transform="rotate(15,28,10)"/>
        </svg>`,

        '🍒': `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="lm-cherry-grad" cx="0.35" cy="0.35">
                    <stop offset="0%" stop-color="#ff5555"/><stop offset="60%" stop-color="#cc0022"/><stop offset="100%" stop-color="#880015"/>
                </radialGradient>
            </defs>
            <path d="M20,4 Q20,14 14,22" fill="none" stroke="#2d6e2d" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M20,4 Q22,14 28,20" fill="none" stroke="#2d6e2d" stroke-width="1.5" stroke-linecap="round"/>
            <ellipse cx="18" cy="4" rx="5" ry="2.5" fill="#3da63d" transform="rotate(-10,18,4)"/>
            <circle cx="13" cy="26" r="7" fill="url(#lm-cherry-grad)"/>
            <circle cx="10" cy="23" r="2" fill="rgba(255,255,255,0.25)"/>
            <circle cx="29" cy="24" r="7" fill="url(#lm-cherry-grad)"/>
            <circle cx="26" cy="21" r="2" fill="rgba(255,255,255,0.25)"/>
        </svg>`,

        '🌉': `<svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="lm-bridge-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#88cc88"/><stop offset="100%" stop-color="#447744"/>
                </linearGradient>
            </defs>
            <rect x="2" y="22" width="44" height="3" rx="1" fill="#667" stroke="#555" stroke-width="0.3"/>
            <rect x="14" y="6" width="3" height="16" fill="url(#lm-bridge-grad)" stroke="#336633" stroke-width="0.3"/>
            <rect x="31" y="6" width="3" height="16" fill="url(#lm-bridge-grad)" stroke="#336633" stroke-width="0.3"/>
            <path d="M15.5,6 Q24,2 32.5,6" fill="none" stroke="#99bb99" stroke-width="1.5"/>
            <line x1="15.5" y1="7" x2="18" y2="12" stroke="#99bb99" stroke-width="0.6"/>
            <line x1="15.5" y1="7" x2="21" y2="14" stroke="#99bb99" stroke-width="0.6"/>
            <line x1="32.5" y1="7" x2="30" y2="12" stroke="#99bb99" stroke-width="0.6"/>
            <line x1="32.5" y1="7" x2="27" y2="14" stroke="#99bb99" stroke-width="0.6"/>
            <rect x="0" y="25" width="48" height="7" fill="#2255aa" opacity="0.4"/>
        </svg>`,

        '🏛️': `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="lm-cap-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#e8e0d0"/><stop offset="100%" stop-color="#b8a890"/>
                </linearGradient>
            </defs>
            <path d="M20,2 Q22,2 23,6 L24,10 L16,10 L17,6 Q18,2 20,2 Z" fill="#d4ccc0" stroke="#998877" stroke-width="0.3"/>
            <ellipse cx="20" cy="10" rx="7" ry="3" fill="url(#lm-cap-grad)" stroke="#998877" stroke-width="0.3"/>
            <rect x="8" y="13" width="24" height="3" fill="url(#lm-cap-grad)" stroke="#998877" stroke-width="0.3"/>
            <rect x="10" y="16" width="2.5" height="14" fill="url(#lm-cap-grad)" stroke="#998877" stroke-width="0.3"/>
            <rect x="15" y="16" width="2.5" height="14" fill="url(#lm-cap-grad)" stroke="#998877" stroke-width="0.3"/>
            <rect x="22.5" y="16" width="2.5" height="14" fill="url(#lm-cap-grad)" stroke="#998877" stroke-width="0.3"/>
            <rect x="27.5" y="16" width="2.5" height="14" fill="url(#lm-cap-grad)" stroke="#998877" stroke-width="0.3"/>
            <rect x="6" y="30" width="28" height="3" fill="url(#lm-cap-grad)" stroke="#998877" stroke-width="0.3"/>
            <rect x="4" y="33" width="32" height="3" rx="1" fill="#b8a890" stroke="#998877" stroke-width="0.3"/>
            <circle cx="20" cy="5" r="1" fill="#ffd700"/>
        </svg>`
    },

    // Get SVG string for a chapter's landmark icon
    getLandmarkSvg(landmarkIcon) {
        return this.landmarkSvgs[landmarkIcon] || null;
    },

    // Michigan state outline SVG (for background watermark)
    michiganOutlineSvg: `<svg viewBox="0 0 300 350" xmlns="http://www.w3.org/2000/svg" class="michigan-outline">
        <defs>
            <linearGradient id="mi-outline-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#e94560"/><stop offset="100%" stop-color="#ffd700"/>
            </linearGradient>
        </defs>
        <!-- Upper Peninsula -->
        <path d="M30,80 Q40,70 60,68 Q80,65 100,60 Q120,55 140,58 Q160,62 175,55 Q190,48 200,52 Q210,56 220,50 Q230,48 235,55 Q238,62 230,68 Q222,72 215,78 Q210,82 200,80 Q190,78 180,82 Q170,88 160,85 L155,90"
              fill="url(#mi-outline-grad)" opacity="0.08" stroke="url(#mi-outline-grad)" stroke-width="1" stroke-opacity="0.12"/>
        <!-- Lower Peninsula -->
        <path d="M155,90 Q148,95 140,100 Q135,108 138,120 Q140,135 145,150 Q148,165 155,180 Q160,195 158,210 Q155,225 150,240 Q145,255 135,265 Q125,275 118,280 Q115,275 120,265 Q125,250 128,235 Q130,220 125,205 Q120,190 115,175 Q110,160 105,150 Q100,140 95,135 Q88,130 80,128 Q72,130 68,138 Q65,148 68,160 Q72,175 78,188 Q82,200 85,215 Q87,230 85,245 Q82,260 78,270 Q75,278 80,285 Q88,290 100,288 Q108,285 115,282 L118,280"
              fill="url(#mi-outline-grad)" opacity="0.08" stroke="url(#mi-outline-grad)" stroke-width="1" stroke-opacity="0.12"/>
    </svg>`,

    // Corvette silhouette SVG for story cards
    corvetteSvg: `<svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg" class="story-corvette">
        <defs>
            <linearGradient id="sc-car-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#cc0000"/><stop offset="50%" stop-color="#ff2222"/><stop offset="100%" stop-color="#cc0000"/>
            </linearGradient>
        </defs>
        <path d="M10,16 Q8,16 5,14 L3,12 Q1,11 3,10 L10,8 Q15,4 22,3 L40,3 Q48,3 53,7 L57,11 Q58,12 57,13 L54,15 Q52,16 50,16 Z" fill="url(#sc-car-grad)" stroke="#990000" stroke-width="0.4"/>
        <path d="M18,6 Q20,3.5 28,3 L38,3 Q42,3 44,5.5 L40,5.5 Q34,5.5 28,6.5 Z" fill="rgba(150,210,255,0.6)"/>
        <circle cx="14" cy="18" r="3" fill="#222" stroke="#444" stroke-width="0.4"/>
        <circle cx="14" cy="18" r="1.2" fill="#777"/>
        <circle cx="46" cy="18" r="3" fill="#222" stroke="#444" stroke-width="0.4"/>
        <circle cx="46" cy="18" r="1.2" fill="#777"/>
        <path d="M5,11 L9,9 L11,11 Z" fill="#ffcc00" opacity="0.7"/>
        <line x1="22" y1="10" x2="42" y2="10" stroke="rgba(255,255,255,0.12)" stroke-width="0.6"/>
    </svg>`,

    // Get current story state from Progress
    getProgress() {
        if (!Progress.data.storyProgress) {
            Progress.data.storyProgress = {
                currentChapter: 0,
                currentRace: 0,
                chaptersCompleted: [],
                landmarks: []
            };
        }
        // V40: Migrate old US road trip save data to Michigan
        const sp = Progress.data.storyProgress;
        const validIds = this.chapters.map(ch => ch.id);
        if (sp.chaptersCompleted.length > 0 && !validIds.includes(sp.chaptersCompleted[0])) {
            // Old save data detected — reset for new Michigan road trip
            Progress.data.storyProgress = {
                currentChapter: 0,
                currentRace: 0,
                chaptersCompleted: [],
                landmarks: []
            };
            Progress.save();
        }
        return Progress.data.storyProgress;
    },

    // Get the current chapter object
    getCurrentChapter() {
        const progress = this.getProgress();
        return this.chapters[progress.currentChapter] || null;
    },

    // Get the current race within the current chapter
    getCurrentRace() {
        const progress = this.getProgress();
        const chapter = this.chapters[progress.currentChapter];
        if (!chapter) return null;
        return chapter.races[progress.currentRace] || null;
    },

    // Check if story is complete (all chapters done)
    isComplete() {
        const progress = this.getProgress();
        return progress.chaptersCompleted.length >= this.chapters.length;
    },

    // Check if a chapter is unlocked (sequential — must complete previous)
    isChapterUnlocked(chapterIndex) {
        if (chapterIndex === 0) return true;
        const progress = this.getProgress();
        return progress.chaptersCompleted.includes(this.chapters[chapterIndex - 1].id);
    },

    // Called after a story race finishes with results
    completeRace(results) {
        const progress = this.getProgress();
        const chapter = this.chapters[progress.currentChapter];
        if (!chapter) return null;

        // Need at least 1 star (any score) to advance
        if (results.stars >= 1 || results.gameMode === 'free-drive') {
            progress.currentRace++;

            // Check if chapter is complete
            if (progress.currentRace >= chapter.races.length) {
                // Chapter done!
                if (!progress.chaptersCompleted.includes(chapter.id)) {
                    progress.chaptersCompleted.push(chapter.id);
                }
                if (!progress.landmarks.includes(chapter.landmarkIcon)) {
                    progress.landmarks.push(chapter.landmarkIcon);
                }

                // Move to next chapter
                const nextChapter = progress.currentChapter + 1;
                if (nextChapter < this.chapters.length) {
                    progress.currentChapter = nextChapter;
                    progress.currentRace = 0;
                }
                // else: story complete, keep at last chapter

                Progress.save();
                return { chapterComplete: true, chapter };
            }

            Progress.save();
            return { chapterComplete: false, race: chapter.races[progress.currentRace] };
        }

        // Didn't pass — retry same race
        return { retry: true };
    },

    // Reset story progress (for replay)
    reset() {
        Progress.data.storyProgress = {
            currentChapter: 0,
            currentRace: 0,
            chaptersCompleted: [],
            landmarks: []
        };
        Progress.save();
    },

    // Get summary for map/overview display
    getSummary() {
        const progress = this.getProgress();
        return {
            currentChapter: progress.currentChapter,
            currentRace: progress.currentRace,
            totalChapters: this.chapters.length,
            totalRaces: this.chapters.reduce((sum, ch) => sum + ch.races.length, 0),
            racesCompleted: this._countCompletedRaces(),
            chaptersCompleted: progress.chaptersCompleted.length,
            landmarks: progress.landmarks || [],
            isComplete: this.isComplete()
        };
    },

    _countCompletedRaces() {
        const progress = this.getProgress();
        let count = 0;
        for (let i = 0; i < progress.currentChapter; i++) {
            count += this.chapters[i].races.length;
        }
        count += progress.currentRace;
        return count;
    }
};
