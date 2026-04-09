// ===== CAR DATA — Definitions, Categories, Bonus Colors =====
// Extracted from cars.js for modularity. Loaded before cars.js.
const CarData = {
    // ===== CATEGORIES =====
    categories: {
        corvettes: { name: 'Corvettes', icon: '🏁', cars: ['c1','c2','c3','c4','c5','c6','c7','c8'] },
        legends: { name: 'Legends', icon: '🏛️', cars: ['beetle','mustang','delorean','hotrod','porsche911','countach','ferrari'] },
        modern: { name: 'Modern', icon: '🔧', cars: ['cybertruck','bronco','wrangler','bronco2023','grandam','focus'] },
        emergency: { name: 'Emergency', icon: '🚨', cars: ['policecar','ambulance','firetruck','towtruck'] },
        wild: { name: 'Wild Cards', icon: '🎪', cars: ['batmobile','monstertruck','schoolbus','wienermobile','gokart','limo','tank','zamboni','tractor','icecreamtruck'] },
        // V16: New categories
        construction: { name: 'Construction Crew', icon: '🚧', cars: ['dumptruck','cementmixer','bulldozer'] },
        racers: { name: 'Racers', icon: '🏎️', cars: ['f1car','nascar','rocketcar'] },
        neighborhood: { name: 'Neighborhood', icon: '🏘️', cars: ['tacotruck','pizzacar','garbagetruck','mailtruck','taxi'] },
        roadwarriors: { name: 'Road Warriors', icon: '🛣️', cars: ['hummerh1','vwbus','minicooper','fordf150'] }
    },

    // ===== 22 CAR DEFINITIONS =====
    // Body paths: normalized 0-1 coords, 0.5 = vertical center
    // Cars face RIGHT: front/nose is at high X, rear/tail at low X
    // Key: each car must have DRAMATICALLY different roofline & proportions
    generations: {

        // ==================== CORVETTES ====================

        c1: {
            // C1 1953 Corvette Roadster: TWO tall round fender humps, deep valley, wraparound windshield
            name: "C1 Classic '53", icon: '🏛️', unlockLevel: 1,
            desc: "Chrome Beauty", category: 'corvettes',
            paintEffect: 'classic', heightRatio: 1.05,
            body: [
                ['M', 0.00, 0.56],
                // Rear chrome bumper bar — extends past body
                ['L', -0.03, 0.56], ['L', -0.03, 0.44], ['L', -0.01, 0.42],
                // Rear quarter curves up
                ['C', 0.02, 0.36, 0.05, 0.28, 0.08, 0.22],
                // Rear fender hump — prominent round peak
                ['C', 0.10, 0.16, 0.12, 0.12, 0.15, 0.10],
                ['C', 0.17, 0.09, 0.19, 0.09, 0.21, 0.12],
                ['C', 0.23, 0.16, 0.24, 0.20, 0.26, 0.26],
                // DEEP body valley — roadster scoop dips down
                ['C', 0.28, 0.32, 0.30, 0.36, 0.33, 0.38],
                ['L', 0.37, 0.38],
                // Rises to windshield
                ['C', 0.39, 0.36, 0.41, 0.32, 0.43, 0.26],
                // Wraparound windshield — tall curved
                ['C', 0.45, 0.22, 0.47, 0.18, 0.49, 0.15],
                ['L', 0.52, 0.14],
                // Long hood with gentle crown
                ['C', 0.55, 0.16, 0.60, 0.18, 0.66, 0.19],
                ['C', 0.72, 0.19, 0.76, 0.18, 0.80, 0.16],
                ['C', 0.82, 0.14, 0.84, 0.12, 0.86, 0.09],
                // Front fender hump — TALLER than rear
                ['C', 0.88, 0.06, 0.90, 0.05, 0.92, 0.06],
                ['C', 0.93, 0.07, 0.95, 0.12, 0.96, 0.18],
                // Nose curves down to rounded stone-guard grille
                ['C', 0.97, 0.24, 0.98, 0.30, 0.99, 0.36],
                ['L', 1.00, 0.40],
                // Front chrome bumper
                ['L', 1.03, 0.40], ['L', 1.03, 0.52], ['L', 1.00, 0.52],
                // Front wheel arch — proper semi-circle
                ['C', 0.99, 0.58, 0.97, 0.64, 0.94, 0.70],
                ['C', 0.91, 0.76, 0.88, 0.78, 0.84, 0.78],
                ['C', 0.80, 0.78, 0.77, 0.76, 0.74, 0.70],
                // Rocker panel / running board
                ['L', 0.30, 0.70],
                // Rear wheel arch
                ['C', 0.28, 0.76, 0.24, 0.78, 0.20, 0.78],
                ['C', 0.16, 0.78, 0.12, 0.76, 0.10, 0.70],
                ['C', 0.06, 0.64, 0.03, 0.60, 0.02, 0.56],
                ['L', 0.00, 0.56],
                ['Z']
            ],
            bodyLines: [
                // Belt line along body side
                ['M', 0.06, 0.42],
                ['C', 0.14, 0.28, 0.28, 0.36, 0.40, 0.32],
                ['C', 0.55, 0.24, 0.75, 0.26, 0.94, 0.30],
            ],
            window: [
                ['M', 0.44, 0.28],
                ['C', 0.46, 0.22, 0.48, 0.18, 0.50, 0.16],
                ['L', 0.54, 0.16],
                ['L', 0.54, 0.28],
                ['Z']
            ],
            wheels: { front: 0.84, rear: 0.20, radius: 0.13, y: 0.78 },
            headlights: [{ x: 0.97, y: 0.36 }],
            taillights: [{ x: 0.02, y: 0.46 }],
            features: { chromeBumpers: true, roundedFenders: true, chromeGrille: true }
        },

        c2: {
            // C2 1963 Stingray: EXTREMELY long hood (63%), graceful fastback, muscular haunches
            name: "C2 Stingray '63", icon: '🦈', unlockLevel: 3,
            desc: "Split-Window", category: 'corvettes',
            paintEffect: 'classic', heightRatio: 1.0,
            body: [
                ['M', 0.00, 0.52],
                // Rear tapers up from bumper
                ['L', 0.02, 0.44],
                ['C', 0.03, 0.38, 0.05, 0.32, 0.07, 0.26],
                // Rear haunch — muscular bulge
                ['C', 0.09, 0.20, 0.12, 0.14, 0.16, 0.10],
                ['C', 0.18, 0.08, 0.20, 0.06, 0.24, 0.04],
                // Fastback roofline — smooth arc peaking ~0.32
                ['C', 0.28, 0.02, 0.32, 0.01, 0.36, 0.01],
                // Roof peak
                ['C', 0.38, 0.01, 0.40, 0.02, 0.42, 0.04],
                // Windshield rakes forward steeply
                ['C', 0.44, 0.08, 0.46, 0.14, 0.48, 0.20],
                // VERY long hood — 63% of car, flat and low
                ['L', 0.52, 0.24],
                ['C', 0.56, 0.26, 0.62, 0.27, 0.68, 0.28],
                ['L', 0.74, 0.28],
                ['C', 0.80, 0.28, 0.86, 0.29, 0.90, 0.30],
                // Pointed nose drops elegantly
                ['C', 0.93, 0.32, 0.96, 0.35, 0.98, 0.40],
                ['L', 1.00, 0.46],
                ['L', 1.00, 0.54],
                // Front wheel arch
                ['C', 0.98, 0.62, 0.95, 0.70, 0.92, 0.76],
                ['C', 0.89, 0.80, 0.86, 0.82, 0.83, 0.82],
                ['C', 0.80, 0.82, 0.77, 0.80, 0.74, 0.76],
                ['C', 0.72, 0.72, 0.71, 0.70, 0.70, 0.68],
                // Rocker panel
                ['L', 0.30, 0.68],
                // Rear wheel arch
                ['C', 0.28, 0.72, 0.25, 0.78, 0.22, 0.80],
                ['C', 0.19, 0.82, 0.16, 0.82, 0.14, 0.80],
                ['C', 0.11, 0.78, 0.08, 0.72, 0.06, 0.66],
                ['C', 0.04, 0.62, 0.02, 0.58, 0.01, 0.54],
                ['L', 0.00, 0.52],
                ['Z']
            ],
            bodyLines: [
                // Shoulder line
                ['M', 0.08, 0.36],
                ['C', 0.20, 0.24, 0.40, 0.22, 0.60, 0.30],
                ['L', 0.92, 0.36],
            ],
            window: [
                ['M', 0.20, 0.08],
                ['C', 0.26, 0.04, 0.32, 0.02, 0.36, 0.02],
                ['C', 0.39, 0.02, 0.41, 0.03, 0.43, 0.06],
                ['L', 0.48, 0.20],
                ['L', 0.18, 0.20],
                ['Q', 0.18, 0.14, 0.20, 0.08],
                ['Z']
            ],
            wheels: { front: 0.83, rear: 0.18, radius: 0.12, y: 0.82 },
            headlights: [{ x: 0.97, y: 0.38 }],
            taillights: [{ x: 0.02, y: 0.46 }],
            features: { splitWindow: true, longHood: true, peakedFenders: true }
        },

        c3: {
            // C3 1968 Shark: COKE-BOTTLE body — visible waist pinch, flared fenders
            name: "C3 Shark '68", icon: '🌊', unlockLevel: 5,
            desc: "Coke Bottle", category: 'corvettes',
            paintEffect: 'classic', heightRatio: 1.0,
            body: [
                ['M', 0.00, 0.52],
                // Rear — Kamm tail
                ['L', 0.01, 0.38],
                ['L', 0.03, 0.30],
                // Flying buttress rear rises
                ['C', 0.05, 0.22, 0.08, 0.16, 0.12, 0.12],
                // Rear fender FLARES OUT
                ['C', 0.14, 0.10, 0.16, 0.08, 0.20, 0.06],
                // Roof peak
                ['C', 0.26, 0.03, 0.32, 0.02, 0.38, 0.02],
                ['C', 0.42, 0.02, 0.44, 0.04, 0.46, 0.08],
                // Windshield rakes forward
                ['C', 0.48, 0.12, 0.50, 0.18, 0.52, 0.24],
                // COKE-BOTTLE WAIST PINCH — body narrows here!
                ['C', 0.54, 0.28, 0.55, 0.32, 0.56, 0.36],
                ['L', 0.58, 0.38],
                // Then FLARES back out for front fender
                ['C', 0.60, 0.36, 0.62, 0.32, 0.64, 0.28],
                ['C', 0.66, 0.24, 0.70, 0.20, 0.74, 0.18],
                // Front fender peak — WIDE flare
                ['C', 0.78, 0.16, 0.82, 0.14, 0.86, 0.14],
                ['C', 0.90, 0.15, 0.92, 0.18, 0.94, 0.22],
                // Nose drops
                ['C', 0.96, 0.28, 0.98, 0.34, 0.99, 0.40],
                ['L', 1.02, 0.40], ['L', 1.02, 0.54], ['L', 1.00, 0.54],
                // Front wheel arch
                ['C', 0.98, 0.62, 0.95, 0.70, 0.92, 0.76],
                ['C', 0.89, 0.80, 0.85, 0.82, 0.82, 0.82],
                ['C', 0.79, 0.82, 0.76, 0.80, 0.73, 0.76],
                // Rocker
                ['L', 0.28, 0.76],
                // Rear wheel arch
                ['C', 0.25, 0.80, 0.22, 0.82, 0.18, 0.82],
                ['C', 0.14, 0.82, 0.10, 0.80, 0.08, 0.76],
                ['C', 0.04, 0.66, 0.02, 0.58, 0.01, 0.54],
                ['L', 0.00, 0.52],
                ['Z']
            ],
            bodyLines: [
                // Coke-bottle waist crease
                ['M', 0.08, 0.38],
                ['C', 0.16, 0.30, 0.30, 0.28, 0.48, 0.30],
                ['C', 0.56, 0.36, 0.60, 0.34, 0.68, 0.28],
                ['L', 0.92, 0.28],
            ],
            window: [
                ['M', 0.16, 0.10],
                ['C', 0.22, 0.05, 0.30, 0.03, 0.36, 0.03],
                ['C', 0.40, 0.03, 0.43, 0.05, 0.46, 0.10],
                ['L', 0.50, 0.22],
                ['L', 0.14, 0.22],
                ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.12, y: 0.82 },
            headlights: [{ x: 0.98, y: 0.38 }],
            taillights: [{ x: 0.02, y: 0.42 }],
            features: { chromeBumpers: true, cokeBottle: true, flyingButtress: true, longHood: true }
        },

        c4: {
            // C4 1984: ANGULAR WEDGE — ALL straight lines, flat flat profile, pop-up headlight bumps
            name: "C4 Wedge '84", icon: '📐', unlockLevel: 7,
            desc: "Pop-Up Lights", category: 'corvettes',
            paintEffect: 'metallic', heightRatio: 0.85,
            body: [
                ['M', 0.00, 0.52],
                // Rear — sharp angular cutoff
                ['L', 0.01, 0.36],
                ['L', 0.03, 0.26],
                // Rear hatch — angular slope
                ['L', 0.06, 0.18],
                ['L', 0.10, 0.12],
                ['L', 0.16, 0.08],
                // Roof — very flat, very low
                ['L', 0.24, 0.06],
                ['L', 0.36, 0.04],
                ['L', 0.42, 0.04],
                // Windshield — sharp rake, one straight line
                ['L', 0.50, 0.14],
                ['L', 0.54, 0.24],
                // Hood — PERFECTLY FLAT, long
                ['L', 0.58, 0.28],
                ['L', 0.62, 0.30],
                // Pop-up headlight bumps
                ['L', 0.66, 0.30],
                ['L', 0.67, 0.26],
                ['L', 0.72, 0.26],
                ['L', 0.73, 0.30],
                // Hood continues flat
                ['L', 0.78, 0.30],
                ['L', 0.84, 0.30],
                ['L', 0.90, 0.30],
                // Nose — sharp angular drop
                ['L', 0.96, 0.34],
                ['L', 1.00, 0.40],
                ['L', 1.00, 0.56],
                // Front wheel arch
                ['L', 0.96, 0.56],
                ['Q', 0.94, 0.68, 0.90, 0.78],
                ['Q', 0.86, 0.84, 0.82, 0.84],
                ['Q', 0.78, 0.84, 0.74, 0.78],
                ['L', 0.72, 0.72],
                // Rocker
                ['L', 0.28, 0.72],
                // Rear wheel arch
                ['Q', 0.24, 0.84, 0.18, 0.84],
                ['Q', 0.12, 0.84, 0.08, 0.78],
                ['L', 0.04, 0.66],
                ['L', 0.02, 0.58],
                ['L', 0.00, 0.52],
                ['Z']
            ],
            bodyLines: [
                // Sharp body crease line
                ['M', 0.04, 0.42],
                ['L', 0.30, 0.36],
                ['L', 0.55, 0.32],
                ['L', 0.94, 0.36],
            ],
            window: [
                ['M', 0.16, 0.10],
                ['L', 0.24, 0.07],
                ['L', 0.36, 0.05],
                ['L', 0.42, 0.05],
                ['L', 0.49, 0.14],
                ['L', 0.54, 0.26],
                ['L', 0.14, 0.26],
                ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.11, y: 0.84 },
            headlights: [{ x: 0.70, y: 0.28 }],
            taillights: [{ x: 0.03, y: 0.42 }],
            features: { popUpHeadlights: true, wedgeProfile: true, angularBody: true }
        },

        c5: {
            // C5 1997: Smooth flowing curves, fixed headlights, clean modern proportions
            name: "C5 Smooth '97", icon: '💨', unlockLevel: 9,
            desc: "Modern Classic", category: 'corvettes',
            paintEffect: 'metallic', heightRatio: 0.95,
            body: [
                ['M', 0.00, 0.54],
                // Rear — smooth curve up
                ['C', 0.02, 0.44, 0.04, 0.34, 0.07, 0.26],
                ['C', 0.10, 0.20, 0.14, 0.14, 0.18, 0.10],
                // Smooth roofline — gentle arc
                ['C', 0.22, 0.06, 0.28, 0.04, 0.34, 0.03],
                ['C', 0.38, 0.02, 0.42, 0.02, 0.46, 0.04],
                // Windshield — moderate smooth rake
                ['C', 0.48, 0.06, 0.50, 0.10, 0.52, 0.16],
                ['C', 0.54, 0.22, 0.55, 0.24, 0.56, 0.26],
                // Subtle power dome on hood
                ['C', 0.58, 0.28, 0.62, 0.29, 0.66, 0.30],
                ['C', 0.68, 0.29, 0.70, 0.28, 0.72, 0.28],
                // Long smooth hood continues
                ['C', 0.76, 0.28, 0.82, 0.29, 0.88, 0.30],
                ['C', 0.92, 0.32, 0.95, 0.34, 0.97, 0.38],
                // Low smooth nose
                ['C', 0.98, 0.40, 0.99, 0.44, 1.00, 0.48],
                ['L', 1.00, 0.56],
                // Front wheel arch
                ['C', 0.98, 0.64, 0.95, 0.72, 0.92, 0.78],
                ['C', 0.89, 0.82, 0.86, 0.84, 0.82, 0.84],
                ['C', 0.78, 0.84, 0.75, 0.82, 0.72, 0.78],
                // Rocker
                ['L', 0.28, 0.78],
                // Rear wheel arch
                ['C', 0.25, 0.82, 0.22, 0.84, 0.18, 0.84],
                ['C', 0.14, 0.84, 0.10, 0.82, 0.08, 0.78],
                ['C', 0.04, 0.68, 0.02, 0.60, 0.01, 0.56],
                ['L', 0.00, 0.54],
                ['Z']
            ],
            bodyLines: [
                // Flowing body crease
                ['M', 0.06, 0.40],
                ['C', 0.20, 0.28, 0.40, 0.26, 0.60, 0.32],
                ['C', 0.75, 0.34, 0.88, 0.36, 0.96, 0.42],
            ],
            window: [
                ['M', 0.20, 0.10],
                ['C', 0.26, 0.06, 0.34, 0.04, 0.40, 0.03],
                ['C', 0.44, 0.03, 0.47, 0.05, 0.50, 0.10],
                ['L', 0.55, 0.26],
                ['L', 0.18, 0.26],
                ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.12, y: 0.84 },
            headlights: [{ x: 0.97, y: 0.40 }],
            taillights: [{ x: 0.03, y: 0.44 }],
            features: { smoothBody: true, fenderGills: true }
        },

        c6: {
            // C6 2005: Aggressive, exposed headlights, prominent hood scoop, muscular
            name: "C6 Grand Sport '05", icon: '🏅', unlockLevel: 11,
            desc: "Refined Power", category: 'corvettes',
            paintEffect: 'metallic', heightRatio: 0.95,
            body: [
                ['M', 0.00, 0.52],
                // Rear rises aggressively
                ['C', 0.02, 0.40, 0.04, 0.30, 0.07, 0.22],
                ['C', 0.10, 0.16, 0.14, 0.10, 0.18, 0.08],
                // Tight aggressive roof
                ['C', 0.22, 0.04, 0.28, 0.02, 0.34, 0.01],
                ['C', 0.38, 0.01, 0.42, 0.02, 0.46, 0.06],
                // Steep windshield rake
                ['C', 0.48, 0.10, 0.50, 0.16, 0.52, 0.22],
                ['L', 0.55, 0.28],
                // PROMINENT hood scoop — rises then dips
                ['L', 0.58, 0.28],
                ['C', 0.60, 0.24, 0.62, 0.22, 0.64, 0.20],
                ['C', 0.66, 0.18, 0.68, 0.18, 0.70, 0.20],
                ['C', 0.72, 0.22, 0.74, 0.24, 0.76, 0.26],
                // Hood continues
                ['L', 0.82, 0.28],
                ['C', 0.86, 0.30, 0.90, 0.32, 0.94, 0.34],
                // Aggressive low nose
                ['C', 0.96, 0.36, 0.98, 0.40, 1.00, 0.46],
                ['L', 1.00, 0.56],
                // Front wheel arch
                ['C', 0.98, 0.64, 0.95, 0.72, 0.92, 0.78],
                ['C', 0.89, 0.82, 0.86, 0.84, 0.82, 0.84],
                ['C', 0.78, 0.84, 0.75, 0.82, 0.72, 0.78],
                // Rocker
                ['L', 0.28, 0.78],
                // Rear wheel arch
                ['C', 0.25, 0.82, 0.22, 0.84, 0.18, 0.84],
                ['C', 0.14, 0.84, 0.10, 0.82, 0.08, 0.78],
                ['C', 0.04, 0.66, 0.02, 0.58, 0.01, 0.54],
                ['L', 0.00, 0.52],
                ['Z']
            ],
            bodyLines: [
                // Aggressive body crease
                ['M', 0.06, 0.38],
                ['C', 0.20, 0.26, 0.40, 0.28, 0.56, 0.32],
                ['L', 0.92, 0.38],
            ],
            window: [
                ['M', 0.20, 0.08],
                ['C', 0.26, 0.04, 0.32, 0.02, 0.38, 0.02],
                ['C', 0.42, 0.02, 0.45, 0.04, 0.48, 0.08],
                ['L', 0.54, 0.26],
                ['L', 0.18, 0.26],
                ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.12, y: 0.84 },
            headlights: [{ x: 0.96, y: 0.36 }, { x: 0.96, y: 0.46 }],
            taillights: [{ x: 0.03, y: 0.42 }, { x: 0.03, y: 0.50 }],
            features: { hoodScoop: true, exposedHeadlights: true, wideStance: true }
        },

        c7: {
            // C7 2014: SHARP angular creases, prominent side vent notch, all edges
            name: "C7 Stingray '14", icon: '⚡', unlockLevel: 14,
            desc: "Sharp Edge", category: 'corvettes',
            paintEffect: 'modern', heightRatio: 0.90,
            body: [
                ['M', 0.00, 0.50],
                // Rear — sharp angular rise
                ['L', 0.02, 0.38],
                ['L', 0.04, 0.26],
                ['L', 0.07, 0.18],
                // Angular rear deck
                ['L', 0.12, 0.10],
                ['L', 0.18, 0.06],
                // Roof — angular peak
                ['L', 0.24, 0.03],
                ['L', 0.32, 0.01],
                ['L', 0.40, 0.01],
                // Windshield — steep sharp line
                ['L', 0.46, 0.03],
                ['L', 0.52, 0.14],
                // DRAMATIC side vent notch — deep cut
                ['L', 0.56, 0.20],
                ['L', 0.58, 0.24],
                ['L', 0.59, 0.20],
                ['L', 0.62, 0.16],
                ['L', 0.65, 0.18],
                // Angular hood — sharp lines
                ['L', 0.70, 0.20],
                ['L', 0.78, 0.22],
                ['L', 0.86, 0.24],
                ['L', 0.92, 0.28],
                // Sharp nose
                ['L', 0.96, 0.32],
                ['L', 1.00, 0.38],
                ['L', 1.00, 0.56],
                // Front wheel arch
                ['L', 0.96, 0.56],
                ['Q', 0.94, 0.68, 0.90, 0.78],
                ['Q', 0.86, 0.84, 0.82, 0.84],
                ['Q', 0.78, 0.84, 0.74, 0.78],
                ['L', 0.72, 0.72],
                // Rocker
                ['L', 0.28, 0.72],
                // Rear wheel arch
                ['Q', 0.24, 0.84, 0.18, 0.84],
                ['Q', 0.12, 0.84, 0.08, 0.78],
                ['L', 0.04, 0.66],
                ['L', 0.02, 0.56],
                ['L', 0.00, 0.50],
                ['Z']
            ],
            bodyLines: [
                // Sharp body crease
                ['M', 0.06, 0.38],
                ['L', 0.20, 0.26],
                ['L', 0.50, 0.22],
                ['L', 0.58, 0.26],
                ['L', 0.92, 0.30],
            ],
            window: [
                ['M', 0.16, 0.08],
                ['L', 0.24, 0.04],
                ['L', 0.32, 0.02],
                ['L', 0.40, 0.02],
                ['L', 0.45, 0.04],
                ['L', 0.51, 0.15],
                ['L', 0.14, 0.15],
                ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.12, y: 0.84 },
            headlights: [{ x: 0.97, y: 0.34 }],
            taillights: [{ x: 0.03, y: 0.40 }],
            features: { sideVents: true, angularBody: true, sharpCreases: true, rearSpoiler: true }
        },

        c8: {
            // C8 2020: MID-ENGINE — cabin pushed FAR forward, raised engine section behind, exotic
            name: "C8 Mid-Engine '20", icon: '👑', unlockLevel: 17,
            desc: "Exotic Beast", category: 'corvettes',
            paintEffect: 'exotic', heightRatio: 0.95,
            body: [
                ['M', -0.01, 0.50],
                // Rear — engine cover rises dramatically
                ['L', 0.01, 0.36],
                ['L', 0.03, 0.24],
                ['L', 0.06, 0.16],
                // Raised rear engine cover — flat section
                ['L', 0.10, 0.10],
                ['L', 0.22, 0.08],
                ['L', 0.28, 0.08],
                // DRAMATIC step down — visible intake gap
                ['L', 0.30, 0.12],
                ['L', 0.31, 0.18],
                ['L', 0.33, 0.20],
                // Step back up to cabin roof
                ['L', 0.34, 0.14],
                // Cabin pushed FAR FORWARD — roof starts at ~0.36
                ['C', 0.36, 0.06, 0.42, 0.01, 0.50, 0.01],
                ['C', 0.56, 0.01, 0.60, 0.04, 0.63, 0.10],
                // Short front section — very short overhang
                ['L', 0.66, 0.18],
                ['L', 0.70, 0.24],
                ['L', 0.76, 0.28],
                ['L', 0.84, 0.30],
                ['L', 0.92, 0.32],
                ['L', 0.97, 0.36],
                ['L', 1.00, 0.42],
                ['L', 1.00, 0.56],
                // Front wheel arch
                ['C', 0.98, 0.64, 0.95, 0.72, 0.92, 0.78],
                ['C', 0.89, 0.82, 0.86, 0.84, 0.82, 0.84],
                ['C', 0.78, 0.84, 0.75, 0.82, 0.72, 0.78],
                // Rocker
                ['L', 0.28, 0.78],
                // Rear wheel arch
                ['C', 0.25, 0.82, 0.22, 0.84, 0.18, 0.84],
                ['C', 0.14, 0.84, 0.10, 0.82, 0.08, 0.78],
                ['C', 0.04, 0.68, 0.02, 0.58, 0.00, 0.52],
                ['L', -0.01, 0.50],
                ['Z']
            ],
            bodyLines: [
                // Engine cover detail line
                ['M', 0.10, 0.18],
                ['L', 0.28, 0.16],
                // Side intake line
                ['M', 0.33, 0.22],
                ['L', 0.33, 0.38],
            ],
            engineCover: [
                ['M', 0.10, 0.11],
                ['L', 0.22, 0.09],
                ['L', 0.28, 0.09],
                ['L', 0.29, 0.24],
                ['L', 0.10, 0.24],
                ['Z']
            ],
            window: [
                ['M', 0.36, 0.12],
                ['C', 0.38, 0.06, 0.44, 0.02, 0.50, 0.02],
                ['C', 0.55, 0.02, 0.58, 0.04, 0.62, 0.10],
                ['L', 0.65, 0.20],
                ['L', 0.38, 0.20],
                ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.12, y: 0.84 },
            headlights: [{ x: 0.97, y: 0.36 }],
            taillights: [{ x: 0.02, y: 0.38 }],
            features: { midEngine: true, engineCover: true, exoticProfile: true, shortFrontHood: true, rearSpoiler: true, sideIntakes: true }
        },

        // ==================== LEGENDS ====================

        beetle: {
            // VW Beetle: Near-PERFECT dome roof, very round, pronounced round fenders, rear engine
            name: "VW Beetle", icon: '🐞', unlockLevel: 2,
            desc: "Love Bug", category: 'legends',
            paintEffect: 'classic', heightRatio: 1.3,
            body: [
                ['M', 0.00, 0.52],
                // Rear bumper
                ['L', -0.02, 0.52], ['L', -0.02, 0.44],
                // Rear engine cover slopes up gently
                ['C', 0.00, 0.40, 0.03, 0.34, 0.06, 0.28],
                ['C', 0.09, 0.22, 0.12, 0.18, 0.16, 0.14],
                // THE DOME — near-circular arc using multiple beziers
                ['C', 0.20, 0.10, 0.24, 0.06, 0.28, 0.04],
                ['C', 0.32, 0.02, 0.36, 0.01, 0.40, 0.01],
                ['C', 0.44, 0.01, 0.48, 0.02, 0.52, 0.04],
                ['C', 0.56, 0.06, 0.58, 0.10, 0.60, 0.16],
                // Front windshield — steep, almost vertical on Beetle
                ['C', 0.61, 0.20, 0.62, 0.24, 0.63, 0.28],
                // Front hood slopes down (front trunk)
                ['C', 0.64, 0.30, 0.66, 0.34, 0.68, 0.36],
                ['C', 0.70, 0.38, 0.72, 0.38, 0.74, 0.36],
                // Front fender — round hump
                ['C', 0.76, 0.32, 0.79, 0.26, 0.82, 0.22],
                ['C', 0.85, 0.20, 0.87, 0.20, 0.89, 0.22],
                ['C', 0.91, 0.26, 0.93, 0.30, 0.94, 0.36],
                // Nose drops to front bumper
                ['C', 0.96, 0.40, 0.97, 0.44, 0.98, 0.46],
                // Front bumper
                ['L', 1.01, 0.46], ['L', 1.01, 0.54], ['L', 0.98, 0.54],
                // Front wheel arch
                ['C', 0.97, 0.58, 0.95, 0.62, 0.92, 0.66],
                ['C', 0.89, 0.72, 0.86, 0.74, 0.82, 0.74],
                ['C', 0.78, 0.74, 0.75, 0.72, 0.72, 0.66],
                // Floor between wheel arches
                ['L', 0.36, 0.66],
                // Rear wheel arch
                ['C', 0.34, 0.72, 0.30, 0.74, 0.26, 0.74],
                ['C', 0.22, 0.74, 0.18, 0.72, 0.16, 0.66],
                ['C', 0.12, 0.62, 0.06, 0.58, 0.02, 0.54],
                ['L', 0.00, 0.52],
                ['Z']
            ],
            bodyLines: [
                // Belt line / body crease
                ['M', 0.10, 0.38],
                ['C', 0.20, 0.28, 0.40, 0.22, 0.60, 0.28],
                ['C', 0.72, 0.36, 0.80, 0.34, 0.92, 0.38],
            ],
            window: [
                ['M', 0.20, 0.12],
                ['C', 0.26, 0.06, 0.34, 0.03, 0.40, 0.02],
                ['C', 0.46, 0.02, 0.52, 0.04, 0.56, 0.08],
                ['L', 0.60, 0.22],
                ['L', 0.22, 0.22],
                ['Q', 0.20, 0.18, 0.20, 0.12],
                ['Z']
            ],
            wheels: { front: 0.82, rear: 0.26, radius: 0.10, y: 0.74 },
            headlights: [{ x: 0.96, y: 0.38 }],
            taillights: [{ x: 0.03, y: 0.40 }],
            features: { runningBoard: true, roundedFenders: true, rearEngine: true }
        },

        mustang: {
            // '69 Mustang Fastback: LONG hood (62%), aggressive fastback slope, muscular stance
            name: "'69 Mustang", icon: '🐎', unlockLevel: 4,
            desc: "Fastback Muscle", category: 'legends',
            paintEffect: 'metallic', heightRatio: 1.05,
            body: [
                ['M', 0.00, 0.46],
                // Rear bumper
                ['L', -0.01, 0.46], ['L', -0.01, 0.36],
                // Rear deck rises
                ['L', 0.03, 0.28],
                // AGGRESSIVE fastback slope — steep and straight
                ['L', 0.08, 0.20],
                ['L', 0.14, 0.14],
                ['L', 0.20, 0.10],
                // Roof — short and chopped
                ['L', 0.26, 0.08],
                ['L', 0.34, 0.06],
                ['L', 0.38, 0.06],
                // Steep A-pillar windshield
                ['L', 0.42, 0.14],
                ['L', 0.46, 0.24],
                // VERY LONG HOOD — 62% of car
                ['L', 0.50, 0.28],
                ['L', 0.54, 0.30],
                // Subtle power bulge
                ['C', 0.58, 0.28, 0.62, 0.26, 0.66, 0.26],
                ['L', 0.72, 0.26],
                ['L', 0.78, 0.28],
                ['L', 0.84, 0.30],
                // Boxy muscle car front grille
                ['L', 0.88, 0.32],
                ['L', 0.92, 0.34],
                ['L', 0.96, 0.38],
                // Front bumper — boxy
                ['L', 0.98, 0.42],
                ['L', 1.00, 0.46],
                ['L', 1.00, 0.58],
                // Front wheel arch
                ['C', 0.98, 0.64, 0.95, 0.70, 0.92, 0.74],
                ['C', 0.89, 0.78, 0.86, 0.80, 0.83, 0.80],
                ['C', 0.80, 0.80, 0.77, 0.78, 0.74, 0.74],
                // Floor
                ['L', 0.30, 0.74],
                // Rear wheel arch
                ['C', 0.27, 0.78, 0.24, 0.80, 0.20, 0.80],
                ['C', 0.16, 0.80, 0.12, 0.78, 0.10, 0.74],
                ['C', 0.06, 0.66, 0.03, 0.56, 0.01, 0.48],
                ['L', 0.00, 0.46],
                ['Z']
            ],
            bodyLines: [
                // Shoulder line crease
                ['M', 0.06, 0.38],
                ['L', 0.18, 0.26],
                ['L', 0.44, 0.28],
                ['L', 0.90, 0.36],
                // C-scoop line on rear quarter
                ['M', 0.18, 0.42],
                ['C', 0.22, 0.36, 0.26, 0.34, 0.30, 0.36],
            ],
            window: [
                ['M', 0.22, 0.12],
                ['L', 0.32, 0.08],
                ['L', 0.38, 0.08],
                ['L', 0.44, 0.22],
                ['L', 0.24, 0.22],
                ['L', 0.20, 0.16],
                ['Z']
            ],
            wheels: { front: 0.83, rear: 0.20, radius: 0.12, y: 0.80 },
            headlights: [{ x: 0.97, y: 0.40 }, { x: 0.97, y: 0.48 }],
            taillights: [{ x: 0.02, y: 0.36 }, { x: 0.02, y: 0.42 }],
            features: { longHood: true, fastback: true, muscleStance: true, sideScoop: true }
        },

        delorean: {
            // DeLorean DMC-12: Angular wedge, gullwing door line, Kamm tail, stainless body
            name: "DeLorean DMC-12", icon: '⏰', unlockLevel: 6,
            desc: "Time Machine", category: 'legends',
            paintEffect: 'chrome', heightRatio: 0.95,
            body: [
                ['M', 0.00, 0.46],
                // Kamm tail — FLAT vertical rear (signature)
                ['L', -0.01, 0.46], ['L', -0.01, 0.20],
                // Rear louver area
                ['L', 0.02, 0.18],
                ['L', 0.06, 0.16],
                ['L', 0.10, 0.14],
                // Rear deck
                ['L', 0.18, 0.12],
                // Roof — angular and flat
                ['L', 0.26, 0.10],
                ['L', 0.36, 0.08],
                ['L', 0.44, 0.08],
                // Windshield — steep angular rake
                ['L', 0.50, 0.18],
                ['L', 0.54, 0.26],
                // Hood — angular wedge, slopes down
                ['L', 0.58, 0.30],
                ['L', 0.64, 0.32],
                ['L', 0.72, 0.34],
                ['L', 0.80, 0.36],
                // Angular wedge nose
                ['L', 0.86, 0.38],
                ['L', 0.92, 0.42],
                ['L', 0.96, 0.46],
                // Front bumper
                ['L', 1.00, 0.50],
                ['L', 1.00, 0.60],
                // Front wheel arch
                ['Q', 0.97, 0.68, 0.92, 0.76],
                ['Q', 0.88, 0.82, 0.84, 0.82],
                ['Q', 0.80, 0.82, 0.76, 0.76],
                // Floor
                ['L', 0.30, 0.76],
                // Rear wheel arch
                ['Q', 0.26, 0.82, 0.20, 0.82],
                ['Q', 0.14, 0.82, 0.10, 0.76],
                ['Q', 0.05, 0.66, 0.02, 0.56],
                ['L', 0.00, 0.46],
                ['Z']
            ],
            bodyLines: [
                // Gullwing door cut line
                ['M', 0.28, 0.12],
                ['C', 0.32, 0.10, 0.38, 0.12, 0.44, 0.16],
                ['L', 0.50, 0.26],
            ],
            window: [
                ['M', 0.26, 0.12],
                ['L', 0.36, 0.10],
                ['L', 0.44, 0.10],
                ['L', 0.48, 0.18],
                ['L', 0.52, 0.26],
                ['L', 0.28, 0.26],
                ['Z']
            ],
            wheels: { front: 0.84, rear: 0.20, radius: 0.11, y: 0.82 },
            headlights: [{ x: 0.96, y: 0.46 }],
            taillights: [{ x: 0.00, y: 0.30 }],
            features: { gullwingLine: true, wedgeProfile: true, kammTail: true, rearLouvers: true }
        },

        hotrod: {
            // '32 Ford Hot Rod: Short cab, EXPOSED ENGINE rising above body, extreme raked stance
            name: "'32 Ford Hot Rod", icon: '🔥', unlockLevel: 8,
            desc: "Street Machine", category: 'legends',
            paintEffect: 'classic', heightRatio: 1.2,
            body: [
                ['M', 0.02, 0.54],
                // Rear — short chopped
                ['L', 0.02, 0.24],
                ['L', 0.06, 0.16],
                // Chopped cab — tall narrow box set far back
                ['L', 0.10, 0.10],
                ['L', 0.14, 0.06],
                ['L', 0.18, 0.04],
                ['L', 0.30, 0.04],
                ['L', 0.34, 0.06],
                // Windshield — nearly vertical
                ['L', 0.38, 0.16],
                // Cowl drops down to hood level
                ['L', 0.42, 0.26],
                ['L', 0.46, 0.32],
                // EXPOSED ENGINE — towers above body!
                ['L', 0.50, 0.26],
                ['L', 0.52, 0.16],
                ['L', 0.54, 0.06],  // Engine top — highest point!
                ['L', 0.62, 0.06],
                ['L', 0.64, 0.14],
                ['L', 0.66, 0.24],
                // Short frame rails to grille
                ['L', 0.70, 0.30],
                ['L', 0.76, 0.34],
                // Tall narrow radiator/grille
                ['L', 0.80, 0.36],
                ['L', 0.84, 0.40],
                ['L', 0.86, 0.48],
                ['L', 0.86, 0.58],
                // Front underside — exposed frame
                ['L', 0.82, 0.58],
                ['C', 0.80, 0.66, 0.78, 0.72, 0.74, 0.76],
                ['C', 0.70, 0.80, 0.66, 0.82, 0.62, 0.82],
                ['C', 0.58, 0.82, 0.54, 0.80, 0.52, 0.76],
                // Floor — exposed frame rails
                ['L', 0.40, 0.70],
                // Rear wheel — BIGGER than front
                ['C', 0.36, 0.76, 0.32, 0.82, 0.26, 0.84],
                ['C', 0.20, 0.86, 0.14, 0.84, 0.10, 0.78],
                ['C', 0.07, 0.72, 0.04, 0.64, 0.02, 0.54],
                ['Z']
            ],
            bodyLines: [
                // Frame rail line
                ['M', 0.40, 0.48],
                ['L', 0.74, 0.42],
            ],
            window: [
                ['M', 0.16, 0.08],
                ['L', 0.28, 0.06],
                ['L', 0.32, 0.08],
                ['L', 0.36, 0.18],
                ['L', 0.18, 0.18],
                ['Z']
            ],
            wheels: { front: 0.68, rear: 0.26, radius: 0.14, y: 0.82, frontRadius: 0.10 },
            headlights: [{ x: 0.84, y: 0.42 }],
            taillights: [{ x: 0.04, y: 0.40 }],
            features: { exposedEngine: true, verticalGrille: true, rakedStance: true, hotRodFlames: true }
        },

        porsche911: {
            // Porsche 911: THE continuous rear slope — no trunk step, low nose, wide rear
            name: "Porsche 911", icon: '🏎️', unlockLevel: 10,
            desc: "Timeless Icon", category: 'legends',
            paintEffect: 'modern', heightRatio: 0.95,
            body: [
                ['M', 0.00, 0.44],
                // Rear bumper
                ['L', -0.02, 0.44], ['L', -0.02, 0.34],
                // THE SIGNATURE: one continuous flowing slope from tail to roof
                // Multiple bezier curves for smooth continuous sweep
                ['C', 0.00, 0.30, 0.03, 0.24, 0.06, 0.20],
                ['C', 0.09, 0.16, 0.12, 0.12, 0.16, 0.10],
                ['C', 0.20, 0.07, 0.24, 0.05, 0.30, 0.04],
                ['C', 0.34, 0.03, 0.38, 0.02, 0.42, 0.02],
                // Roof peak — smooth and subtle
                ['C', 0.46, 0.02, 0.48, 0.02, 0.50, 0.03],
                // Windshield flows smoothly into hood
                ['C', 0.52, 0.05, 0.54, 0.10, 0.56, 0.16],
                // Long sloping hood — curves DOWN to very low nose
                ['C', 0.58, 0.20, 0.62, 0.26, 0.66, 0.32],
                ['C', 0.70, 0.36, 0.74, 0.40, 0.78, 0.42],
                ['C', 0.82, 0.44, 0.86, 0.46, 0.90, 0.48],
                // VERY LOW nose — 911 signature flat front
                ['C', 0.94, 0.50, 0.97, 0.50, 1.00, 0.50],
                // Front bumper
                ['L', 1.02, 0.50], ['L', 1.02, 0.58], ['L', 1.00, 0.58],
                // Front wheel arch
                ['C', 0.98, 0.62, 0.95, 0.68, 0.92, 0.72],
                ['C', 0.89, 0.76, 0.86, 0.78, 0.83, 0.78],
                ['C', 0.80, 0.78, 0.77, 0.76, 0.74, 0.72],
                // Floor
                ['L', 0.30, 0.72],
                // Rear wheel arch — wider rear (rear engine)
                ['C', 0.28, 0.76, 0.24, 0.78, 0.20, 0.78],
                ['C', 0.16, 0.78, 0.12, 0.76, 0.10, 0.72],
                ['C', 0.06, 0.62, 0.03, 0.54, 0.01, 0.48],
                ['L', 0.00, 0.44],
                ['Z']
            ],
            bodyLines: [
                // Body side crease
                ['M', 0.06, 0.42],
                ['C', 0.14, 0.32, 0.30, 0.26, 0.52, 0.22],
                ['C', 0.66, 0.34, 0.80, 0.44, 0.96, 0.52],
            ],
            window: [
                ['M', 0.22, 0.08],
                ['C', 0.28, 0.04, 0.36, 0.03, 0.42, 0.03],
                ['C', 0.46, 0.03, 0.49, 0.04, 0.52, 0.08],
                ['L', 0.56, 0.20],
                ['L', 0.26, 0.20],
                ['C', 0.24, 0.14, 0.22, 0.12, 0.22, 0.08],
                ['Z']
            ],
            wheels: { front: 0.83, rear: 0.20, radius: 0.12, y: 0.78 },
            headlights: [{ x: 0.98, y: 0.50 }],
            taillights: [{ x: 0.02, y: 0.38 }],
            features: { rearEngine: true, slopeNose: true, roundHeadlights: true }
        },

        countach: {
            // Countach: EXTREME wedge — nose almost touches ground, massive wing, angular
            name: "Lamborghini Countach", icon: '🏆', unlockLevel: 18,
            desc: "Bedroom Poster", category: 'legends',
            paintEffect: 'exotic', heightRatio: 0.80,
            body: [
                ['M', 0.00, 0.40],
                // Rear — tall engine cover
                ['L', -0.01, 0.40], ['L', -0.01, 0.12],
                // Wing support/engine vent
                ['L', 0.02, 0.10],
                ['L', 0.06, 0.08],
                // Engine cover — flat top
                ['L', 0.12, 0.10],
                ['L', 0.22, 0.12],
                ['L', 0.28, 0.12],
                // Roof — very low, very short
                ['L', 0.34, 0.14],
                ['L', 0.40, 0.14],
                // EXTREME windshield rake — nearly horizontal!
                ['L', 0.48, 0.28],
                ['L', 0.52, 0.36],
                // Hood slopes to near-FLAT nose — extreme wedge
                ['L', 0.56, 0.40],
                ['L', 0.62, 0.44],
                ['L', 0.68, 0.48],
                ['L', 0.74, 0.52],
                ['L', 0.80, 0.56],
                ['L', 0.86, 0.58],
                // Nearly POINTED nose — paper thin at front
                ['L', 0.92, 0.60],
                ['L', 0.96, 0.62],
                ['L', 1.00, 0.64],
                // Bottom — very thin at front
                ['L', 1.00, 0.70],
                // Front wheel arch
                ['Q', 0.96, 0.78, 0.92, 0.84],
                ['Q', 0.88, 0.88, 0.84, 0.88],
                ['Q', 0.80, 0.88, 0.76, 0.84],
                // Floor
                ['L', 0.30, 0.84],
                // Rear wheel arch
                ['Q', 0.26, 0.88, 0.20, 0.88],
                ['Q', 0.14, 0.88, 0.10, 0.84],
                ['Q', 0.05, 0.70, 0.02, 0.56],
                ['L', 0.00, 0.40],
                ['Z']
            ],
            bodyLines: [
                // Side NACA duct outline
                ['M', 0.20, 0.36],
                ['L', 0.28, 0.28],
                ['L', 0.28, 0.50],
                ['L', 0.20, 0.48],
                ['Z'],
            ],
            window: [
                // Tiny slit window — extreme rake
                ['M', 0.34, 0.16],
                ['L', 0.40, 0.15],
                ['L', 0.46, 0.28],
                ['L', 0.50, 0.36],
                ['L', 0.36, 0.36],
                ['Z']
            ],
            wheels: { front: 0.84, rear: 0.20, radius: 0.13, y: 0.88 },
            headlights: [{ x: 0.98, y: 0.64 }],
            taillights: [{ x: 0.00, y: 0.24 }],
            features: { extremeWedge: true, bigWing: true, sideIntakes: true, popUpHeadlights: true }
        },

        // ==================== MODERN ====================

        cybertruck: {
            // Cybertruck: ALL straight lines, ZERO curves — pure triangle/trapezoid
            name: "Cybertruck", icon: '🔺', unlockLevel: 12,
            desc: "All Angles", category: 'modern',
            paintEffect: 'chrome', heightRatio: 1.35,
            body: [
                ['M', 0.00, 0.56],
                // Rear tailgate — vertical
                ['L', 0.00, 0.14],
                // Truck bed
                ['L', 0.08, 0.14],
                ['L', 0.18, 0.14],
                // Cab rear wall
                ['L', 0.24, 0.14],
                // Roof — one continuous slope = TRIANGLE signature
                ['L', 0.38, 0.02],
                ['L', 0.50, 0.02],
                // Windshield — single steep line
                ['L', 0.62, 0.22],
                // Hood
                ['L', 0.68, 0.28],
                ['L', 0.76, 0.32],
                // Front face
                ['L', 0.84, 0.34],
                ['L', 0.92, 0.36],
                ['L', 0.98, 0.40],
                ['L', 1.00, 0.44],
                ['L', 1.00, 0.56],
                // Angular front wheel arch
                ['L', 0.96, 0.56],
                ['L', 0.96, 0.62],
                ['L', 0.92, 0.70],
                ['L', 0.88, 0.74],
                ['L', 0.82, 0.74],
                ['L', 0.78, 0.70],
                ['L', 0.76, 0.62],
                ['L', 0.76, 0.56],
                // Floor
                ['L', 0.28, 0.56],
                // Angular rear wheel arch
                ['L', 0.28, 0.62],
                ['L', 0.24, 0.70],
                ['L', 0.20, 0.74],
                ['L', 0.14, 0.74],
                ['L', 0.10, 0.70],
                ['L', 0.08, 0.62],
                ['L', 0.08, 0.56],
                ['L', 0.00, 0.56],
                ['Z']
            ],
            bodyLines: [
                // Angular body crease
                ['M', 0.02, 0.36],
                ['L', 0.50, 0.12],
                ['L', 0.64, 0.28],
            ],
            window: [
                ['M', 0.40, 0.04],
                ['L', 0.50, 0.04],
                ['L', 0.60, 0.22],
                ['L', 0.44, 0.22],
                ['Z']
            ],
            wheels: { front: 0.85, rear: 0.18, radius: 0.12, y: 0.74 },
            headlights: [{ x: 0.98, y: 0.42 }],
            taillights: [{ x: 0.01, y: 0.28 }],
            features: { allAngular: true, lightBar: true, vaultBed: true }
        },

        bronco: {
            // Ford Bronco: Boxy SUV, flat roof, modern rounded edges, high clearance
            name: "Ford Bronco", icon: '🐴', unlockLevel: 15,
            desc: "Trail Boss", category: 'modern',
            paintEffect: 'matte', heightRatio: 1.4,
            body: [
                ['M', 0.00, 0.58],
                // Rear — nearly vertical, squared off
                ['L', 0.00, 0.12],
                ['Q', 0.02, 0.08, 0.06, 0.06],
                // Roof rack area — FLAT
                ['L', 0.14, 0.06],
                ['L', 0.32, 0.06],
                // Rear pillar
                ['L', 0.38, 0.06],
                // Roof continues flat
                ['L', 0.46, 0.06],
                // Windshield — moderately raked
                ['L', 0.50, 0.06],
                ['Q', 0.54, 0.08, 0.58, 0.16],
                ['L', 0.64, 0.28],
                // Hood — short, slightly sloped
                ['L', 0.70, 0.30],
                ['L', 0.78, 0.32],
                // Modern rounded front
                ['Q', 0.84, 0.34, 0.88, 0.36],
                ['Q', 0.92, 0.40, 0.96, 0.44],
                // Front bumper
                ['L', 0.98, 0.48],
                ['L', 1.00, 0.58],
                // Front wheel arch
                ['C', 0.98, 0.64, 0.95, 0.70, 0.92, 0.74],
                ['C', 0.89, 0.78, 0.86, 0.80, 0.83, 0.80],
                ['C', 0.80, 0.80, 0.77, 0.78, 0.74, 0.74],
                // Floor
                ['L', 0.30, 0.74],
                // Rear wheel arch
                ['C', 0.27, 0.78, 0.24, 0.80, 0.20, 0.80],
                ['C', 0.16, 0.80, 0.12, 0.78, 0.10, 0.74],
                ['C', 0.06, 0.68, 0.02, 0.64, 0.00, 0.58],
                ['Z']
            ],
            bodyLines: [
                // Body side crease
                ['M', 0.04, 0.32],
                ['L', 0.50, 0.20],
                ['L', 0.70, 0.34],
                ['L', 0.94, 0.42],
            ],
            window: [
                ['M', 0.06, 0.10],
                ['L', 0.46, 0.10],
                ['Q', 0.52, 0.10, 0.56, 0.18],
                ['L', 0.62, 0.28],
                ['L', 0.08, 0.28],
                ['L', 0.06, 0.10],
                ['Z']
            ],
            wheels: { front: 0.83, rear: 0.20, radius: 0.13, y: 0.80 },
            headlights: [{ x: 0.97, y: 0.42 }],
            taillights: [{ x: 0.02, y: 0.28 }],
            features: { roofRack: true, boxBody: true, highClearance: true }
        },

        wrangler: {
            // Jeep Wrangler: MOST boxy vehicle, near-vertical everything, spare tire on back
            name: "Jeep Wrangler", icon: '⛰️', unlockLevel: 13,
            desc: "Rock Crawler", category: 'modern',
            paintEffect: 'matte', heightRatio: 1.45,
            body: [
                ['M', -0.06, 0.56],
                // Spare tire — extends past body
                ['C', -0.06, 0.40, -0.04, 0.26, -0.02, 0.18],
                ['C', 0.00, 0.12, 0.02, 0.10, 0.06, 0.10],
                // Rear — vertical
                ['L', 0.06, 0.06],
                // Roof — PERFECTLY flat
                ['L', 0.14, 0.06],
                ['L', 0.28, 0.06],
                ['L', 0.42, 0.06],
                // Windshield — NEARLY VERTICAL (Jeep signature!)
                ['L', 0.46, 0.06],
                ['L', 0.48, 0.06],
                ['L', 0.50, 0.08],
                ['L', 0.54, 0.18],
                ['L', 0.58, 0.26],
                // Hood — flat and short
                ['L', 0.62, 0.28],
                ['L', 0.70, 0.28],
                ['L', 0.78, 0.28],
                // Front — very flat/vertical (7-slot grille area)
                ['L', 0.84, 0.28],
                ['L', 0.90, 0.30],
                ['L', 0.94, 0.34],
                ['L', 0.96, 0.40],
                ['L', 0.98, 0.48],
                ['L', 1.00, 0.58],
                // Front wheel arch
                ['C', 0.97, 0.66, 0.94, 0.72, 0.90, 0.76],
                ['C', 0.87, 0.80, 0.84, 0.80, 0.82, 0.80],
                ['C', 0.79, 0.80, 0.76, 0.76, 0.74, 0.72],
                // Floor
                ['L', 0.30, 0.72],
                // Rear wheel arch
                ['C', 0.27, 0.76, 0.24, 0.80, 0.20, 0.80],
                ['C', 0.16, 0.80, 0.12, 0.76, 0.10, 0.72],
                ['C', 0.06, 0.66, 0.02, 0.62, -0.02, 0.60],
                ['Q', -0.04, 0.58, -0.06, 0.56],
                ['Z']
            ],
            bodyLines: [
                // Door cut line
                ['M', 0.32, 0.10],
                ['L', 0.32, 0.48],
            ],
            window: [
                ['M', 0.10, 0.10],
                ['L', 0.42, 0.10],
                ['L', 0.46, 0.10],
                ['L', 0.52, 0.20],
                ['L', 0.56, 0.26],
                ['L', 0.12, 0.26],
                ['L', 0.10, 0.10],
                ['Z']
            ],
            wheels: { front: 0.82, rear: 0.20, radius: 0.13, y: 0.80 },
            headlights: [{ x: 0.97, y: 0.38 }],
            taillights: [{ x: -0.02, y: 0.34 }],
            features: { spareTire: true, boxBody: true, highClearance: true, foldWindshield: true }
        },

        // ==================== WILD CARDS ====================

        batmobile: {
            // Batmobile '89: LONG sleek jet-car, dramatic TALL bat fins, bubble cockpit
            name: "Batmobile '89", icon: '🦇', unlockLevel: 16,
            desc: "Dark Knight", category: 'wild',
            paintEffect: 'exotic', heightRatio: 0.75,
            body: [
                ['M', -0.04, 0.50],
                // Jet exhaust nozzle
                ['L', -0.04, 0.42],
                // BAT FIN — rises DRAMATICALLY
                ['L', 0.00, 0.38],
                ['L', 0.02, 0.18],
                ['L', 0.04, 0.04],  // Fin peak — towering!
                ['L', 0.06, 0.02],  // Fin tip
                ['L', 0.08, 0.06],
                ['L', 0.10, 0.16],
                ['L', 0.12, 0.26],
                // Sleek body — long and low
                ['C', 0.16, 0.30, 0.22, 0.32, 0.28, 0.30],
                ['C', 0.34, 0.26, 0.38, 0.22, 0.42, 0.18],
                // Bubble cockpit canopy
                ['C', 0.45, 0.14, 0.48, 0.12, 0.52, 0.12],
                ['C', 0.56, 0.12, 0.58, 0.14, 0.62, 0.18],
                // Long sleek nose — jet-like
                ['C', 0.66, 0.22, 0.72, 0.28, 0.78, 0.34],
                ['C', 0.84, 0.38, 0.90, 0.42, 0.96, 0.46],
                // Pointed nose tip
                ['L', 1.02, 0.48],
                ['L', 1.04, 0.50],
                ['L', 1.02, 0.54],
                ['L', 1.00, 0.56],
                // Front wheel arch
                ['C', 0.97, 0.62, 0.94, 0.68, 0.90, 0.72],
                ['C', 0.87, 0.76, 0.84, 0.78, 0.82, 0.78],
                ['C', 0.79, 0.78, 0.76, 0.76, 0.74, 0.72],
                // Floor
                ['L', 0.26, 0.72],
                // Rear wheel arch
                ['C', 0.23, 0.76, 0.20, 0.78, 0.16, 0.78],
                ['C', 0.12, 0.78, 0.08, 0.76, 0.06, 0.72],
                ['C', 0.02, 0.64, -0.02, 0.56, -0.04, 0.50],
                ['Z']
            ],
            bodyLines: [
                // Cockpit canopy seam
                ['M', 0.44, 0.16],
                ['C', 0.48, 0.13, 0.54, 0.13, 0.58, 0.16],
            ],
            window: [
                ['M', 0.44, 0.16],
                ['C', 0.48, 0.13, 0.52, 0.13, 0.56, 0.14],
                ['C', 0.58, 0.16, 0.60, 0.18, 0.62, 0.22],
                ['L', 0.64, 0.28],
                ['L', 0.44, 0.28],
                ['Z']
            ],
            wheels: { front: 0.84, rear: 0.16, radius: 0.10, y: 0.78 },
            headlights: [{ x: 1.00, y: 0.48 }],
            taillights: [{ x: -0.02, y: 0.44 }],
            features: { batFins: true, jetExhaust: true, cockpitCanopy: true }
        },

        monstertruck: {
            // Monster Truck: Small pickup body LIFTED HIGH above MASSIVE wheels
            name: "Monster Truck", icon: '💪', unlockLevel: 19,
            desc: "Grave Crusher", category: 'wild',
            paintEffect: 'metallic', heightRatio: 1.7,
            body: [
                ['M', 0.04, 0.40],
                // Rear of truck bed
                ['L', 0.04, 0.14],
                ['L', 0.08, 0.10],
                // Truck bed
                ['L', 0.14, 0.08],
                ['L', 0.28, 0.08],
                // Cab rear wall
                ['L', 0.30, 0.06],
                // Cab roof
                ['L', 0.36, 0.02],
                ['L', 0.44, 0.02],
                // Windshield
                ['L', 0.48, 0.06],
                ['L', 0.52, 0.12],
                // Hood — angled down
                ['L', 0.56, 0.18],
                ['L', 0.62, 0.22],
                ['L', 0.70, 0.26],
                // Front bumper area
                ['L', 0.78, 0.28],
                ['L', 0.84, 0.30],
                ['L', 0.90, 0.34],
                ['L', 0.94, 0.38],
                // Body bottom — FLAT and HIGH (lifted!)
                ['L', 0.94, 0.42],
                ['L', 0.04, 0.42],
                ['L', 0.04, 0.40],
                ['Z']
            ],
            bodyLines: [
                // Bed side panel line
                ['M', 0.10, 0.24],
                ['L', 0.28, 0.24],
            ],
            window: [
                ['M', 0.34, 0.04],
                ['L', 0.38, 0.03],
                ['L', 0.44, 0.03],
                ['L', 0.46, 0.07],
                ['L', 0.50, 0.13],
                ['L', 0.36, 0.13],
                ['Z']
            ],
            wheels: { front: 0.80, rear: 0.18, radius: 0.24, y: 0.78 },
            headlights: [{ x: 0.92, y: 0.36 }],
            taillights: [{ x: 0.06, y: 0.24 }],
            features: { monsterWheels: true, lightBar: true, rollCage: true, liftedBody: true }
        },

        schoolbus: {
            // School Bus: Long rectangular box, short hood STEPS DOWN, flat roof, rows of windows
            name: "School Bus", icon: '📚', unlockLevel: 20,
            desc: "Magic Ride", category: 'wild',
            paintEffect: 'flat', heightRatio: 1.55,
            body: [
                ['M', 0.02, 0.62],
                // Rear — flat vertical
                ['L', 0.02, 0.08],
                ['Q', 0.03, 0.05, 0.06, 0.04],
                // Roof — perfectly flat, very long
                ['L', 0.14, 0.04],
                ['L', 0.36, 0.04],
                ['L', 0.56, 0.04],
                // STEP DOWN to hood section — distinct from passenger box
                ['L', 0.60, 0.04],
                ['L', 0.60, 0.10],
                // Short hood section — LOWER than passenger box
                ['L', 0.64, 0.12],
                ['L', 0.68, 0.16],
                // Windshield
                ['L', 0.74, 0.24],
                // Hood
                ['L', 0.78, 0.28],
                ['L', 0.84, 0.32],
                // Front grille
                ['L', 0.90, 0.36],
                ['L', 0.95, 0.40],
                // Front bumper
                ['L', 0.98, 0.46],
                ['L', 1.00, 0.54],
                ['L', 1.00, 0.60],
                // Front wheel arch
                ['Q', 0.97, 0.66, 0.93, 0.72],
                ['Q', 0.89, 0.78, 0.85, 0.78],
                ['Q', 0.81, 0.78, 0.77, 0.72],
                // Floor
                ['L', 0.28, 0.72],
                // Rear wheel arch
                ['Q', 0.24, 0.78, 0.18, 0.78],
                ['Q', 0.12, 0.78, 0.08, 0.72],
                ['Q', 0.05, 0.68, 0.02, 0.62],
                ['Z']
            ],
            bodyLines: [
                // Window bottom line
                ['M', 0.06, 0.28],
                ['L', 0.56, 0.28],
            ],
            window: [
                ['M', 0.06, 0.10],
                ['L', 0.56, 0.10],
                ['L', 0.56, 0.26],
                ['L', 0.06, 0.26],
                ['Z']
            ],
            wheels: { front: 0.85, rear: 0.18, radius: 0.12, y: 0.78 },
            headlights: [{ x: 0.98, y: 0.44 }],
            taillights: [{ x: 0.03, y: 0.26 }],
            features: { busWindows: true, stopSign: true, flatRoof: true }
        },

        firetruck: {
            // Fire Truck: Distinct cab + equipment body with step between, ladder rack on top
            name: "Fire Truck", icon: '🚒', unlockLevel: 21,
            desc: "Hero Engine", category: 'emergency',
            paintEffect: 'metallic', heightRatio: 1.55,
            body: [
                ['M', 0.02, 0.62],
                // Rear — vertical
                ['L', 0.02, 0.14],
                // Equipment body with ladder rack
                ['L', 0.04, 0.04],
                ['L', 0.14, 0.02],
                ['L', 0.46, 0.02],
                ['L', 0.50, 0.04],
                // STEP between equipment body and cab — visible gap
                ['L', 0.52, 0.12],
                ['L', 0.54, 0.12],
                // Cab rises back up
                ['L', 0.56, 0.04],
                ['L', 0.64, 0.02],
                // Cab roof
                ['L', 0.70, 0.04],
                // Windshield
                ['L', 0.74, 0.14],
                ['L', 0.78, 0.24],
                // Hood
                ['L', 0.82, 0.28],
                ['L', 0.88, 0.32],
                // Front grille
                ['L', 0.92, 0.36],
                ['L', 0.96, 0.42],
                // Front bumper
                ['L', 0.98, 0.48],
                ['L', 1.00, 0.56],
                ['L', 1.00, 0.60],
                // Front wheel arch
                ['Q', 0.97, 0.66, 0.93, 0.72],
                ['Q', 0.89, 0.78, 0.85, 0.78],
                ['Q', 0.81, 0.78, 0.77, 0.72],
                // Floor
                ['L', 0.28, 0.72],
                // Rear wheel arch
                ['Q', 0.24, 0.78, 0.18, 0.78],
                ['Q', 0.12, 0.78, 0.08, 0.72],
                ['Q', 0.05, 0.68, 0.02, 0.62],
                ['Z']
            ],
            bodyLines: [
                // Equipment compartment doors
                ['M', 0.14, 0.30],
                ['L', 0.14, 0.56],
                ['M', 0.28, 0.30],
                ['L', 0.28, 0.56],
                ['M', 0.42, 0.30],
                ['L', 0.42, 0.56],
            ],
            window: [
                ['M', 0.58, 0.06],
                ['L', 0.66, 0.04],
                ['L', 0.68, 0.06],
                ['L', 0.72, 0.16],
                ['L', 0.76, 0.24],
                ['L', 0.60, 0.24],
                ['Z']
            ],
            wheels: { front: 0.85, rear: 0.18, radius: 0.12, y: 0.78 },
            headlights: [{ x: 0.98, y: 0.44 }],
            taillights: [{ x: 0.03, y: 0.28 }],
            features: { fireLadder: true, lightBar: true, equipmentBody: true }
        },

        wienermobile: {
            // Wienermobile: Hot dog in a bun — elongated oval, ALL curves, no straight lines
            name: "Wienermobile", icon: '🌭', unlockLevel: 22,
            desc: "Hot Dogger", category: 'wild',
            paintEffect: 'classic', heightRatio: 1.15,
            body: [
                ['M', 0.00, 0.50],
                // Rear bun end — smooth rounded
                ['C', -0.06, 0.38, -0.04, 0.22, 0.02, 0.14],
                ['C', 0.06, 0.08, 0.12, 0.04, 0.20, 0.02],
                // Top of bun — gentle smooth arc
                ['C', 0.28, 0.00, 0.38, -0.01, 0.48, 0.00],
                ['C', 0.58, 0.02, 0.66, 0.04, 0.74, 0.08],
                // Front bun end — smooth rounded
                ['C', 0.80, 0.12, 0.86, 0.18, 0.92, 0.28],
                ['C', 0.96, 0.36, 1.00, 0.44, 1.02, 0.52],
                // Bottom front curves under
                ['C', 1.02, 0.58, 1.00, 0.62, 0.96, 0.66],
                // Bottom of bun
                ['C', 0.90, 0.72, 0.84, 0.76, 0.76, 0.78],
                ['C', 0.68, 0.80, 0.58, 0.80, 0.48, 0.80],
                ['C', 0.38, 0.80, 0.28, 0.78, 0.20, 0.74],
                // Rear bottom curves up
                ['C', 0.12, 0.70, 0.06, 0.64, 0.02, 0.58],
                ['C', -0.02, 0.54, -0.02, 0.52, 0.00, 0.50],
                ['Z']
            ],
            bodyLines: [
                // Bun split line
                ['M', 0.08, 0.44],
                ['C', 0.24, 0.38, 0.48, 0.36, 0.72, 0.40],
                ['C', 0.84, 0.42, 0.92, 0.48, 0.98, 0.52],
            ],
            window: [
                ['M', 0.56, 0.08],
                ['C', 0.64, 0.06, 0.72, 0.10, 0.78, 0.16],
                ['L', 0.84, 0.26],
                ['L', 0.62, 0.26],
                ['L', 0.56, 0.08],
                ['Z']
            ],
            wheels: { front: 0.80, rear: 0.22, radius: 0.10, y: 0.80 },
            headlights: [{ x: 0.96, y: 0.40 }],
            taillights: [{ x: 0.02, y: 0.42 }],
            features: { hotdogBody: true, bunTexture: true, roundedEverything: true }
        },

        // ===== EMERGENCY VEHICLES =====
        policecar: {
            name: "Police Cruiser", icon: '🚔', unlockLevel: 23,
            desc: "To Protect & Serve", category: 'emergency',
            paintEffect: 'classic', heightRatio: 1.0,
            body: [
                ['M', 0.05, 0.55], ['L', 0.05, 0.35], ['C', 0.10, 0.25, 0.20, 0.20, 0.30, 0.18],
                ['L', 0.45, 0.12], ['C', 0.55, 0.10, 0.65, 0.10, 0.75, 0.15],
                ['L', 0.90, 0.25], ['C', 0.95, 0.30, 0.98, 0.38, 0.98, 0.45],
                ['L', 0.98, 0.65], ['L', 0.05, 0.65], ['Z']
            ],
            bodyLines: [['M', 0.10, 0.45], ['L', 0.90, 0.45]],
            window: [
                ['M', 0.35, 0.20], ['L', 0.45, 0.14], ['L', 0.70, 0.14],
                ['L', 0.80, 0.22], ['L', 0.35, 0.22], ['Z']
            ],
            wheels: { front: 0.80, rear: 0.22, radius: 0.12, y: 0.72 },
            headlights: [{ x: 0.97, y: 0.40 }],
            taillights: [{ x: 0.03, y: 0.42 }],
            features: { lightBar: true, policeStripe: true }
        },

        ambulance: {
            name: "Ambulance", icon: '🚑', unlockLevel: 24,
            desc: "First Responder", category: 'emergency',
            paintEffect: 'classic', heightRatio: 1.1,
            body: [
                ['M', 0.05, 0.60], ['L', 0.05, 0.20], ['L', 0.55, 0.20],
                ['L', 0.55, 0.15], ['C', 0.60, 0.10, 0.70, 0.08, 0.80, 0.10],
                ['L', 0.95, 0.20], ['L', 0.98, 0.35], ['L', 0.98, 0.65],
                ['L', 0.05, 0.65], ['Z']
            ],
            bodyLines: [['M', 0.55, 0.20], ['L', 0.55, 0.65]],
            window: [
                ['M', 0.60, 0.12], ['L', 0.78, 0.12], ['L', 0.92, 0.22],
                ['L', 0.60, 0.22], ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.12, y: 0.72 },
            headlights: [{ x: 0.97, y: 0.35 }],
            taillights: [{ x: 0.03, y: 0.40 }],
            features: { redCross: true, lightBar: true }
        },

        towtruck: {
            name: "Tow Truck", icon: '🚗', unlockLevel: 25,
            desc: "Hook & Haul", category: 'emergency',
            paintEffect: 'classic', heightRatio: 1.1,
            body: [
                ['M', 0.05, 0.60], ['L', 0.05, 0.25], ['L', 0.40, 0.25],
                ['L', 0.40, 0.15], ['C', 0.45, 0.10, 0.55, 0.08, 0.65, 0.10],
                ['L', 0.80, 0.18], ['L', 0.95, 0.30], ['L', 0.98, 0.65],
                ['L', 0.05, 0.65], ['Z']
            ],
            bodyLines: [['M', 0.40, 0.25], ['L', 0.40, 0.65]],
            window: [
                ['M', 0.45, 0.12], ['L', 0.62, 0.12], ['L', 0.75, 0.20],
                ['L', 0.45, 0.20], ['Z']
            ],
            wheels: { front: 0.80, rear: 0.20, radius: 0.13, y: 0.72 },
            headlights: [{ x: 0.97, y: 0.32 }],
            taillights: [{ x: 0.03, y: 0.40 }],
            features: { towHook: true, flatbed: true }
        },

        // ===== FUN RIDES =====
        icecreamtruck: {
            name: "Ice Cream Truck", icon: '🍦', unlockLevel: 26,
            desc: "Sweet Treats!", category: 'wild',
            paintEffect: 'classic', heightRatio: 1.15,
            body: [
                ['M', 0.05, 0.60], ['L', 0.05, 0.15], ['L', 0.55, 0.15],
                ['L', 0.55, 0.12], ['C', 0.60, 0.08, 0.70, 0.06, 0.80, 0.08],
                ['L', 0.95, 0.18], ['L', 0.98, 0.30], ['L', 0.98, 0.65],
                ['L', 0.05, 0.65], ['Z']
            ],
            bodyLines: [['M', 0.55, 0.15], ['L', 0.55, 0.65]],
            window: [
                ['M', 0.10, 0.18], ['L', 0.50, 0.18], ['L', 0.50, 0.35],
                ['L', 0.10, 0.35], ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.12, y: 0.72 },
            headlights: [{ x: 0.97, y: 0.30 }],
            taillights: [{ x: 0.03, y: 0.35 }],
            features: { iceCreamCone: true, servingWindow: true }
        },

        gokart: {
            name: "Go-Kart", icon: '🏎️', unlockLevel: 27,
            desc: "Tiny Racer", category: 'wild',
            paintEffect: 'metallic', heightRatio: 0.85,
            body: [
                ['M', 0.10, 0.55], ['L', 0.10, 0.40], ['C', 0.15, 0.32, 0.25, 0.28, 0.35, 0.28],
                ['L', 0.65, 0.28], ['C', 0.75, 0.28, 0.85, 0.32, 0.90, 0.40],
                ['L', 0.90, 0.55], ['L', 0.90, 0.65], ['L', 0.10, 0.65], ['Z']
            ],
            bodyLines: [['M', 0.15, 0.50], ['L', 0.85, 0.50]],
            window: [],
            wheels: { front: 0.82, rear: 0.18, radius: 0.12, y: 0.68 },
            headlights: [{ x: 0.92, y: 0.42 }],
            taillights: [{ x: 0.08, y: 0.42 }],
            features: { openCockpit: true, rollBar: true }
        },

        limo: {
            name: "Stretch Limo", icon: '🎩', unlockLevel: 28,
            desc: "VIP Ride", category: 'wild',
            paintEffect: 'metallic', heightRatio: 0.95,
            body: [
                ['M', 0.02, 0.55], ['L', 0.02, 0.35], ['C', 0.06, 0.25, 0.12, 0.20, 0.20, 0.18],
                ['L', 0.40, 0.12], ['C', 0.50, 0.10, 0.60, 0.10, 0.70, 0.12],
                ['L', 0.88, 0.20], ['C', 0.94, 0.25, 0.98, 0.33, 0.98, 0.42],
                ['L', 0.98, 0.65], ['L', 0.02, 0.65], ['Z']
            ],
            bodyLines: [['M', 0.08, 0.45], ['L', 0.92, 0.45]],
            window: [
                ['M', 0.25, 0.20], ['L', 0.40, 0.14], ['L', 0.68, 0.14],
                ['L', 0.82, 0.22], ['L', 0.25, 0.22], ['Z']
            ],
            wheels: { front: 0.85, rear: 0.15, radius: 0.11, y: 0.72 },
            headlights: [{ x: 0.97, y: 0.38 }],
            taillights: [{ x: 0.02, y: 0.42 }],
            features: { tintedWindows: true, chromeAccents: true }
        },

        tank: {
            name: "Military Tank", icon: '🪖', unlockLevel: 29,
            desc: "Heavy Armor", category: 'wild',
            paintEffect: 'classic', heightRatio: 1.2,
            body: [
                ['M', 0.08, 0.55], ['L', 0.08, 0.35], ['L', 0.30, 0.35],
                ['L', 0.30, 0.20], ['L', 0.70, 0.20], ['L', 0.70, 0.35],
                ['L', 0.92, 0.35], ['L', 0.92, 0.55],
                ['L', 0.95, 0.60], ['L', 0.95, 0.72], ['L', 0.05, 0.72],
                ['L', 0.05, 0.60], ['L', 0.08, 0.55], ['Z']
            ],
            bodyLines: [
                ['M', 0.55, 0.10], ['L', 0.95, 0.28],
                ['M', 0.30, 0.35], ['L', 0.70, 0.35]
            ],
            window: [],
            wheels: { front: 0.85, rear: 0.15, radius: 0.10, y: 0.75 },
            headlights: [{ x: 0.94, y: 0.38 }],
            taillights: [{ x: 0.06, y: 0.38 }],
            features: { turret: true, treads: true }
        },

        zamboni: {
            name: "Zamboni", icon: '🧊', unlockLevel: 30,
            desc: "Ice Resurfacer", category: 'wild',
            paintEffect: 'classic', heightRatio: 1.15,
            body: [
                ['M', 0.05, 0.60], ['L', 0.05, 0.25], ['L', 0.60, 0.25],
                ['L', 0.60, 0.18], ['C', 0.65, 0.12, 0.75, 0.10, 0.85, 0.15],
                ['L', 0.95, 0.25], ['L', 0.98, 0.40], ['L', 0.98, 0.65],
                ['L', 0.05, 0.65], ['Z']
            ],
            bodyLines: [['M', 0.60, 0.25], ['L', 0.60, 0.65]],
            window: [
                ['M', 0.65, 0.15], ['L', 0.82, 0.15], ['L', 0.90, 0.25],
                ['L', 0.65, 0.25], ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.11, y: 0.72 },
            headlights: [{ x: 0.96, y: 0.32 }],
            taillights: [{ x: 0.04, y: 0.40 }],
            features: { iceBlade: true, waterTank: true }
        },

        tractor: {
            name: "Farm Tractor", icon: '🚜', unlockLevel: 31,
            desc: "Barn Burner", category: 'wild',
            paintEffect: 'classic', heightRatio: 1.2,
            body: [
                ['M', 0.15, 0.55], ['L', 0.15, 0.25], ['L', 0.50, 0.25],
                ['L', 0.50, 0.15], ['C', 0.55, 0.10, 0.65, 0.08, 0.75, 0.12],
                ['L', 0.85, 0.22], ['L', 0.90, 0.35], ['L', 0.90, 0.65],
                ['L', 0.15, 0.65], ['Z']
            ],
            bodyLines: [['M', 0.50, 0.25], ['L', 0.50, 0.65]],
            window: [
                ['M', 0.55, 0.12], ['L', 0.72, 0.12], ['L', 0.80, 0.22],
                ['L', 0.55, 0.22], ['Z']
            ],
            wheels: { front: 0.78, rear: 0.25, radius: 0.18, y: 0.72, frontRadius: 0.11 },
            headlights: [{ x: 0.92, y: 0.30 }],
            taillights: [{ x: 0.12, y: 0.35 }],
            features: { exhaust: true, bigRearWheels: true }
        },

        // ===== DAILY DRIVERS =====
        grandam: {
            name: "'99 Grand Am GT", icon: '🚗', unlockLevel: 32,
            desc: "Sport Tuner", category: 'modern',
            paintEffect: 'metallic', heightRatio: 1.0,
            body: [
                ['M', 0.05, 0.55], ['L', 0.05, 0.35], ['C', 0.10, 0.25, 0.18, 0.20, 0.25, 0.18],
                ['L', 0.42, 0.12], ['C', 0.50, 0.10, 0.60, 0.10, 0.70, 0.14],
                ['L', 0.88, 0.24], ['C', 0.93, 0.30, 0.97, 0.38, 0.97, 0.45],
                ['L', 0.97, 0.65], ['L', 0.05, 0.65], ['Z']
            ],
            bodyLines: [['M', 0.10, 0.42], ['L', 0.92, 0.42]],
            window: [
                ['M', 0.32, 0.20], ['L', 0.42, 0.14], ['L', 0.68, 0.14],
                ['L', 0.80, 0.22], ['L', 0.32, 0.22], ['Z']
            ],
            wheels: { front: 0.80, rear: 0.22, radius: 0.12, y: 0.72 },
            headlights: [{ x: 0.97, y: 0.38 }],
            taillights: [{ x: 0.03, y: 0.40 }],
            features: { spoiler: true }
        },

        focus: {
            name: "'05 Ford Focus", icon: '🚙', unlockLevel: 33,
            desc: "Compact Fun", category: 'modern',
            paintEffect: 'metallic', heightRatio: 1.0,
            body: [
                ['M', 0.05, 0.55], ['L', 0.05, 0.32], ['C', 0.10, 0.22, 0.18, 0.18, 0.28, 0.16],
                ['L', 0.45, 0.10], ['C', 0.55, 0.08, 0.65, 0.08, 0.75, 0.12],
                ['L', 0.90, 0.22], ['C', 0.95, 0.28, 0.97, 0.36, 0.97, 0.44],
                ['L', 0.97, 0.65], ['L', 0.05, 0.65], ['Z']
            ],
            bodyLines: [['M', 0.10, 0.42], ['L', 0.92, 0.42]],
            window: [
                ['M', 0.33, 0.18], ['L', 0.45, 0.12], ['L', 0.72, 0.12],
                ['L', 0.82, 0.20], ['L', 0.33, 0.20], ['Z']
            ],
            wheels: { front: 0.80, rear: 0.22, radius: 0.12, y: 0.72 },
            headlights: [{ x: 0.97, y: 0.36 }],
            taillights: [{ x: 0.03, y: 0.38 }],
            features: { hatchback: true }
        },

        bronco2023: {
            name: "'23 Ford Bronco", icon: '🏔️', unlockLevel: 34,
            desc: "Off-Road Beast", category: 'modern',
            paintEffect: 'metallic', heightRatio: 1.15,
            body: [
                ['M', 0.05, 0.58], ['L', 0.05, 0.20], ['L', 0.60, 0.20],
                ['L', 0.60, 0.14], ['C', 0.65, 0.10, 0.75, 0.08, 0.85, 0.12],
                ['L', 0.95, 0.22], ['L', 0.98, 0.35], ['L', 0.98, 0.68],
                ['L', 0.05, 0.68], ['Z']
            ],
            bodyLines: [['M', 0.60, 0.20], ['L', 0.60, 0.68]],
            window: [
                ['M', 0.10, 0.22], ['L', 0.55, 0.22], ['L', 0.55, 0.38],
                ['L', 0.10, 0.38], ['Z']
            ],
            wheels: { front: 0.82, rear: 0.20, radius: 0.14, y: 0.75 },
            headlights: [{ x: 0.97, y: 0.30 }],
            taillights: [{ x: 0.03, y: 0.35 }],
            features: { roofRack: true, offRoadTires: true }
        },

        ferrari: {
            name: "Ferrari F40", icon: '🏎️', unlockLevel: 35,
            desc: "Italian Legend", category: 'legends',
            paintEffect: 'modern', heightRatio: 0.95,
            body: [
                ['M', 0.05, 0.52], ['L', 0.05, 0.38], ['C', 0.10, 0.28, 0.18, 0.22, 0.28, 0.20],
                ['L', 0.50, 0.12], ['C', 0.60, 0.10, 0.70, 0.10, 0.80, 0.15],
                ['L', 0.92, 0.28], ['C', 0.96, 0.34, 0.98, 0.40, 0.98, 0.48],
                ['L', 0.98, 0.62], ['L', 0.05, 0.62], ['Z']
            ],
            bodyLines: [['M', 0.10, 0.44], ['L', 0.90, 0.44]],
            window: [
                ['M', 0.38, 0.22], ['L', 0.50, 0.14], ['L', 0.68, 0.14],
                ['L', 0.75, 0.22], ['L', 0.38, 0.22], ['Z']
            ],
            wheels: { front: 0.82, rear: 0.20, radius: 0.12, y: 0.68 },
            headlights: [{ x: 0.97, y: 0.38 }],
            taillights: [{ x: 0.03, y: 0.38 }],
            features: { rearWing: true, popUpLights: true }
        },

        // ==================== V16: CONSTRUCTION CREW ====================

        dumptruck: {
            name: "Dump Truck", icon: '🚧', unlockLevel: 26,
            desc: "Heavy Hauler", category: 'construction',
            paintEffect: 'flat', heightRatio: 1.5,
            body: [
                ['M', 0.05, 0.58], ['L', 0.05, 0.12], ['L', 0.45, 0.08],
                ['L', 0.50, 0.20], ['L', 0.55, 0.22], ['L', 0.60, 0.20],
                ['L', 0.70, 0.22], ['L', 0.78, 0.28], ['L', 0.82, 0.34],
                ['L', 0.95, 0.38], ['L', 0.98, 0.58], ['L', 0.05, 0.58], ['Z']
            ],
            bodyLines: [['M', 0.50, 0.20], ['L', 0.50, 0.58]],
            window: [
                ['M', 0.58, 0.24], ['L', 0.68, 0.24], ['L', 0.72, 0.34],
                ['L', 0.58, 0.34], ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.14, y: 0.74 },
            headlights: [{ x: 0.96, y: 0.42 }],
            taillights: [{ x: 0.03, y: 0.30 }],
            features: { dumpBed: true }
        },

        cementmixer: {
            name: "Cement Mixer", icon: '🏗️', unlockLevel: 30,
            desc: "Mix Master", category: 'construction',
            paintEffect: 'flat', heightRatio: 1.55,
            body: [
                ['M', 0.05, 0.60], ['L', 0.05, 0.30], ['L', 0.15, 0.10],
                ['C', 0.25, 0.02, 0.40, 0.02, 0.50, 0.10],
                ['L', 0.55, 0.20], ['L', 0.60, 0.22], ['L', 0.70, 0.24],
                ['L', 0.80, 0.30], ['L', 0.90, 0.36], ['L', 0.98, 0.44],
                ['L', 0.98, 0.60], ['L', 0.05, 0.60], ['Z']
            ],
            bodyLines: [['M', 0.55, 0.22], ['L', 0.55, 0.60]],
            window: [
                ['M', 0.62, 0.26], ['L', 0.74, 0.28], ['L', 0.76, 0.36],
                ['L', 0.62, 0.36], ['Z']
            ],
            wheels: { front: 0.84, rear: 0.16, radius: 0.13, y: 0.76 },
            headlights: [{ x: 0.96, y: 0.42 }],
            taillights: [{ x: 0.04, y: 0.34 }],
            features: { drum: true }
        },

        bulldozer: {
            name: "Bulldozer", icon: '🚜', unlockLevel: 34,
            desc: "Earth Mover", category: 'construction',
            paintEffect: 'flat', heightRatio: 1.45,
            body: [
                ['M', 0.10, 0.56], ['L', 0.10, 0.20], ['L', 0.18, 0.12],
                ['L', 0.50, 0.08], ['L', 0.55, 0.14], ['L', 0.60, 0.18],
                ['L', 0.68, 0.22], ['L', 0.78, 0.28], ['L', 0.85, 0.36],
                ['L', 0.92, 0.42], ['L', 0.98, 0.52], ['L', 0.98, 0.62],
                ['L', 0.10, 0.62], ['Z']
            ],
            bodyLines: [['M', 0.15, 0.36], ['L', 0.85, 0.36]],
            window: [
                ['M', 0.22, 0.14], ['L', 0.45, 0.10], ['L', 0.48, 0.22],
                ['L', 0.22, 0.22], ['Z']
            ],
            wheels: { front: 0.80, rear: 0.22, radius: 0.16, y: 0.74 },
            headlights: [{ x: 0.95, y: 0.44 }],
            taillights: [{ x: 0.08, y: 0.38 }],
            features: { blade: true, tracks: true }
        },

        // ==================== V16: RACERS ====================

        f1car: {
            name: "F1 Race Car", icon: '🏎️', unlockLevel: 28,
            desc: "Speed Demon", category: 'racers',
            paintEffect: 'modern', heightRatio: 0.85,
            body: [
                ['M', 0.02, 0.52], ['L', 0.02, 0.38], ['L', 0.10, 0.36],
                ['L', 0.16, 0.14], ['L', 0.20, 0.10], ['L', 0.24, 0.14],
                ['L', 0.30, 0.36], ['L', 0.42, 0.32], ['L', 0.50, 0.26],
                ['L', 0.62, 0.22], ['L', 0.74, 0.26], ['L', 0.82, 0.34],
                ['L', 0.92, 0.38], ['L', 0.98, 0.42], ['L', 0.98, 0.56],
                ['L', 0.02, 0.56], ['Z']
            ],
            bodyLines: [['M', 0.30, 0.40], ['L', 0.90, 0.40]],
            window: [
                ['M', 0.48, 0.28], ['L', 0.60, 0.24], ['L', 0.70, 0.28],
                ['L', 0.68, 0.36], ['L', 0.50, 0.36], ['Z']
            ],
            wheels: { front: 0.86, rear: 0.14, radius: 0.14, y: 0.64 },
            headlights: [{ x: 0.97, y: 0.44 }],
            taillights: [{ x: 0.03, y: 0.42 }],
            features: { rearWing: true, frontWing: true, openWheel: true }
        },

        nascar: {
            name: "NASCAR Stock Car", icon: '🏁', unlockLevel: 33,
            desc: "Oval Thunder", category: 'racers',
            paintEffect: 'modern', heightRatio: 1.0,
            body: [
                ['M', 0.05, 0.56], ['L', 0.05, 0.32], ['C', 0.12, 0.22, 0.22, 0.16, 0.34, 0.14],
                ['L', 0.52, 0.12], ['C', 0.62, 0.12, 0.72, 0.14, 0.82, 0.20],
                ['L', 0.92, 0.30], ['L', 0.97, 0.38], ['L', 0.98, 0.56],
                ['L', 0.05, 0.56], ['Z']
            ],
            bodyLines: [['M', 0.10, 0.40], ['L', 0.90, 0.40]],
            window: [
                ['M', 0.38, 0.16], ['L', 0.50, 0.14], ['L', 0.66, 0.16],
                ['L', 0.72, 0.24], ['L', 0.36, 0.24], ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.13, y: 0.66 },
            headlights: [{ x: 0.97, y: 0.40 }],
            taillights: [{ x: 0.04, y: 0.38 }],
            features: { spoiler: true, numberDecal: true }
        },

        rocketcar: {
            name: "Rocket Car", icon: '🚀', unlockLevel: 40,
            desc: "Ultimate Machine", category: 'racers',
            paintEffect: 'modern', heightRatio: 0.9,
            body: [
                ['M', 0.02, 0.50], ['L', 0.02, 0.32], ['C', 0.06, 0.18, 0.12, 0.10, 0.22, 0.08],
                ['C', 0.40, 0.04, 0.60, 0.04, 0.80, 0.12],
                ['L', 0.92, 0.22], ['L', 0.98, 0.34], ['L', 1.00, 0.44],
                ['L', 1.00, 0.56], ['L', 0.02, 0.56], ['Z']
            ],
            bodyLines: [['M', 0.08, 0.38], ['L', 0.92, 0.38]],
            window: [
                ['M', 0.50, 0.10], ['L', 0.68, 0.14], ['L', 0.76, 0.24],
                ['L', 0.52, 0.24], ['Z']
            ],
            wheels: { front: 0.84, rear: 0.16, radius: 0.12, y: 0.64 },
            headlights: [{ x: 0.98, y: 0.38 }],
            taillights: [{ x: 0.03, y: 0.36 }],
            features: { rocketBooster: true, fins: true }
        },

        // ==================== V16: NEIGHBORHOOD ====================

        tacotruck: {
            name: "Taco Truck", icon: '🌮', unlockLevel: 27,
            desc: "Street Eats", category: 'neighborhood',
            paintEffect: 'flat', heightRatio: 1.45,
            body: [
                ['M', 0.05, 0.60], ['L', 0.05, 0.10], ['Q', 0.06, 0.06, 0.10, 0.05],
                ['L', 0.55, 0.05], ['L', 0.60, 0.08], ['L', 0.65, 0.14],
                ['L', 0.72, 0.22], ['L', 0.80, 0.30], ['L', 0.90, 0.38],
                ['L', 0.98, 0.48], ['L', 0.98, 0.60], ['L', 0.05, 0.60], ['Z']
            ],
            bodyLines: [['M', 0.10, 0.32], ['L', 0.55, 0.32]],
            window: [
                ['M', 0.62, 0.16], ['L', 0.74, 0.24], ['L', 0.76, 0.34],
                ['L', 0.62, 0.34], ['Z']
            ],
            wheels: { front: 0.84, rear: 0.16, radius: 0.12, y: 0.76 },
            headlights: [{ x: 0.97, y: 0.44 }],
            taillights: [{ x: 0.04, y: 0.28 }],
            features: { servingWindow: true }
        },

        pizzacar: {
            name: "Pizza Delivery Car", icon: '🍕', unlockLevel: 29,
            desc: "Hot & Fresh", category: 'neighborhood',
            paintEffect: 'flat', heightRatio: 1.1,
            body: [
                ['M', 0.05, 0.56], ['L', 0.05, 0.28], ['C', 0.12, 0.18, 0.22, 0.14, 0.34, 0.12],
                ['L', 0.50, 0.08], ['C', 0.58, 0.08, 0.68, 0.12, 0.78, 0.20],
                ['L', 0.90, 0.30], ['L', 0.96, 0.40], ['L', 0.98, 0.56],
                ['L', 0.05, 0.56], ['Z']
            ],
            bodyLines: [['M', 0.10, 0.40], ['L', 0.90, 0.40]],
            window: [
                ['M', 0.36, 0.14], ['L', 0.52, 0.10], ['L', 0.64, 0.16],
                ['L', 0.66, 0.28], ['L', 0.36, 0.28], ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.12, y: 0.68 },
            headlights: [{ x: 0.97, y: 0.42 }],
            taillights: [{ x: 0.04, y: 0.36 }],
            features: { roofSign: true }
        },

        garbagetruck: {
            name: "Garbage Truck", icon: '♻️', unlockLevel: 31,
            desc: "Green Machine", category: 'neighborhood',
            paintEffect: 'flat', heightRatio: 1.55,
            body: [
                ['M', 0.05, 0.60], ['L', 0.05, 0.08], ['L', 0.50, 0.06],
                ['L', 0.52, 0.14], ['L', 0.56, 0.18], ['L', 0.62, 0.20],
                ['L', 0.72, 0.24], ['L', 0.82, 0.32], ['L', 0.92, 0.40],
                ['L', 0.98, 0.50], ['L', 0.98, 0.60], ['L', 0.05, 0.60], ['Z']
            ],
            bodyLines: [['M', 0.52, 0.18], ['L', 0.52, 0.60]],
            window: [
                ['M', 0.60, 0.22], ['L', 0.72, 0.26], ['L', 0.74, 0.36],
                ['L', 0.60, 0.36], ['Z']
            ],
            wheels: { front: 0.84, rear: 0.16, radius: 0.13, y: 0.76 },
            headlights: [{ x: 0.96, y: 0.44 }],
            taillights: [{ x: 0.04, y: 0.30 }],
            features: { compactor: true }
        },

        mailtruck: {
            name: "Mail Truck", icon: '📬', unlockLevel: 36,
            desc: "Special Delivery", category: 'neighborhood',
            paintEffect: 'flat', heightRatio: 1.35,
            body: [
                ['M', 0.08, 0.58], ['L', 0.08, 0.08], ['Q', 0.10, 0.04, 0.14, 0.04],
                ['L', 0.75, 0.04], ['L', 0.80, 0.10], ['L', 0.85, 0.20],
                ['L', 0.92, 0.32], ['L', 0.96, 0.42], ['L', 0.98, 0.58],
                ['L', 0.08, 0.58], ['Z']
            ],
            bodyLines: [['M', 0.12, 0.30], ['L', 0.75, 0.30]],
            window: [
                ['M', 0.76, 0.10], ['L', 0.84, 0.22], ['L', 0.86, 0.34],
                ['L', 0.76, 0.34], ['Z']
            ],
            wheels: { front: 0.84, rear: 0.20, radius: 0.12, y: 0.74 },
            headlights: [{ x: 0.96, y: 0.44 }],
            taillights: [{ x: 0.06, y: 0.28 }],
            features: { mailbox: true }
        },

        taxi: {
            name: "Yellow Taxi", icon: '🚕', unlockLevel: 37,
            desc: "City Cruiser", category: 'neighborhood',
            paintEffect: 'classic', heightRatio: 1.1,
            body: [
                ['M', 0.05, 0.56], ['L', 0.05, 0.30], ['C', 0.10, 0.22, 0.18, 0.16, 0.28, 0.14],
                ['L', 0.44, 0.10], ['C', 0.52, 0.10, 0.62, 0.12, 0.72, 0.18],
                ['L', 0.84, 0.26], ['L', 0.92, 0.34], ['L', 0.98, 0.44],
                ['L', 0.98, 0.56], ['L', 0.05, 0.56], ['Z']
            ],
            bodyLines: [['M', 0.10, 0.38], ['L', 0.92, 0.38]],
            window: [
                ['M', 0.30, 0.16], ['L', 0.48, 0.12], ['L', 0.66, 0.16],
                ['L', 0.70, 0.26], ['L', 0.30, 0.26], ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.12, y: 0.68 },
            headlights: [{ x: 0.97, y: 0.40 }],
            taillights: [{ x: 0.04, y: 0.38 }],
            features: { taxiSign: true, checkerStripe: true }
        },

        // ==================== V16: ROAD WARRIORS ====================

        hummerh1: {
            name: "Hummer H1", icon: '💪', unlockLevel: 32,
            desc: "Off-Road Beast", category: 'roadwarriors',
            paintEffect: 'flat', heightRatio: 1.35,
            body: [
                ['M', 0.04, 0.58], ['L', 0.04, 0.14], ['L', 0.08, 0.08],
                ['L', 0.80, 0.08], ['L', 0.84, 0.14], ['L', 0.88, 0.22],
                ['L', 0.94, 0.32], ['L', 0.98, 0.44], ['L', 0.98, 0.58],
                ['L', 0.04, 0.58], ['Z']
            ],
            bodyLines: [['M', 0.08, 0.36], ['L', 0.92, 0.36]],
            window: [
                ['M', 0.22, 0.12], ['L', 0.75, 0.12], ['L', 0.78, 0.24],
                ['L', 0.22, 0.24], ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.15, y: 0.76 },
            headlights: [{ x: 0.96, y: 0.36 }],
            taillights: [{ x: 0.04, y: 0.28 }],
            features: { boxy: true, snorkel: true }
        },

        vwbus: {
            name: "VW Bus", icon: '✌️', unlockLevel: 35,
            desc: "Peace & Love", category: 'roadwarriors',
            paintEffect: 'classic', heightRatio: 1.5,
            body: [
                ['M', 0.05, 0.60], ['L', 0.05, 0.10], ['Q', 0.06, 0.05, 0.12, 0.04],
                ['L', 0.70, 0.04], ['L', 0.78, 0.08], ['L', 0.84, 0.16],
                ['L', 0.90, 0.28], ['L', 0.94, 0.38], ['L', 0.98, 0.50],
                ['L', 0.98, 0.60], ['L', 0.05, 0.60], ['Z']
            ],
            bodyLines: [['M', 0.10, 0.34], ['L', 0.70, 0.34]],
            window: [
                ['M', 0.72, 0.08], ['L', 0.82, 0.18], ['L', 0.86, 0.30],
                ['L', 0.72, 0.30], ['Z']
            ],
            wheels: { front: 0.84, rear: 0.16, radius: 0.13, y: 0.76 },
            headlights: [{ x: 0.96, y: 0.42 }],
            taillights: [{ x: 0.04, y: 0.30 }],
            features: { splitWindshield: true, vwLogo: true }
        },

        minicooper: {
            name: "Mini Cooper", icon: '🇬🇧', unlockLevel: 38,
            desc: "Pocket Rocket", category: 'roadwarriors',
            paintEffect: 'classic', heightRatio: 1.0,
            body: [
                ['M', 0.08, 0.56], ['L', 0.08, 0.30], ['C', 0.14, 0.22, 0.22, 0.16, 0.32, 0.14],
                ['L', 0.52, 0.10], ['C', 0.62, 0.10, 0.72, 0.14, 0.80, 0.22],
                ['L', 0.88, 0.30], ['L', 0.94, 0.40], ['L', 0.96, 0.56],
                ['L', 0.08, 0.56], ['Z']
            ],
            bodyLines: [['M', 0.14, 0.38], ['L', 0.90, 0.38]],
            window: [
                ['M', 0.34, 0.16], ['L', 0.52, 0.12], ['L', 0.68, 0.18],
                ['L', 0.72, 0.28], ['L', 0.34, 0.28], ['Z']
            ],
            wheels: { front: 0.80, rear: 0.20, radius: 0.12, y: 0.66 },
            headlights: [{ x: 0.95, y: 0.42 }],
            taillights: [{ x: 0.06, y: 0.38 }],
            features: { rallyStripes: true }
        },

        fordf150: {
            name: "Ford F-150", icon: '🛻', unlockLevel: 39,
            desc: "Built Tough", category: 'roadwarriors',
            paintEffect: 'modern', heightRatio: 1.35,
            body: [
                ['M', 0.05, 0.58], ['L', 0.05, 0.14], ['L', 0.08, 0.10],
                ['L', 0.50, 0.08], ['L', 0.54, 0.12], ['L', 0.58, 0.16],
                ['L', 0.70, 0.18], ['L', 0.80, 0.24], ['L', 0.90, 0.32],
                ['L', 0.96, 0.42], ['L', 0.98, 0.58], ['L', 0.05, 0.58], ['Z']
            ],
            bodyLines: [['M', 0.52, 0.14], ['L', 0.52, 0.58]],
            window: [
                ['M', 0.56, 0.18], ['L', 0.68, 0.20], ['L', 0.74, 0.28],
                ['L', 0.56, 0.28], ['Z']
            ],
            wheels: { front: 0.82, rear: 0.18, radius: 0.14, y: 0.76 },
            headlights: [{ x: 0.96, y: 0.40 }],
            taillights: [{ x: 0.04, y: 0.30 }],
            features: { truckBed: true, grilleBars: true }
        }
    },

    // ===== BONUS ERA COLORS =====
    bonusColors: {
        c1_polo_white:    { gen: 'c1', name: 'Polo White',       hex: '#f5f0e8', winsNeeded: 1 },
        c1_venetian_red:  { gen: 'c1', name: 'Venetian Red',     hex: '#8b2500', winsNeeded: 5 },
        c2_nassau_blue:   { gen: 'c2', name: 'Nassau Blue',      hex: '#1a4b7a', winsNeeded: 1 },
        c2_rally_red:     { gen: 'c2', name: 'Rally Red',        hex: '#cc2233', winsNeeded: 5 },
        c3_lemans_blue:   { gen: 'c3', name: 'LeMans Blue',      hex: '#1e3f6f', winsNeeded: 1 },
        c3_ontario_orange: { gen: 'c3', name: 'Ontario Orange',  hex: '#e8601c', winsNeeded: 5 },
        c4_bright_red:    { gen: 'c4', name: 'Bright Red',       hex: '#e52020', winsNeeded: 1 },
        c4_arctic_white:  { gen: 'c4', name: 'Arctic White',     hex: '#f0ede6', winsNeeded: 5 },
        c5_magnetic_red:  { gen: 'c5', name: 'Magnetic Red',     hex: '#7a1e2e', winsNeeded: 1 },
        c5_millennium_yellow: { gen: 'c5', name: 'Millennium Yellow', hex: '#e8c820', winsNeeded: 5 },
        c6_velocity_yellow: { gen: 'c6', name: 'Velocity Yellow', hex: '#e8c810', winsNeeded: 1 },
        c6_cyber_gray:    { gen: 'c6', name: 'Cyber Gray',       hex: '#7a7d82', winsNeeded: 5 },
        c7_laguna_blue:   { gen: 'c7', name: 'Laguna Blue',      hex: '#2a5f9e', winsNeeded: 1 },
        c7_torch_red:     { gen: 'c7', name: 'Torch Red',        hex: '#cc1122', winsNeeded: 5 },
        c8_rapid_blue:    { gen: 'c8', name: 'Rapid Blue',       hex: '#1a6fdf', winsNeeded: 1 },
        c8_amplify_orange: { gen: 'c8', name: 'Amplify Orange',  hex: '#e85d10', winsNeeded: 5 },
        beetle_sea_blue:  { gen: 'beetle', name: 'Sea Blue',     hex: '#5B8FAF', winsNeeded: 1 },
        mustang_highland: { gen: 'mustang', name: 'Highland Green', hex: '#2D4F35', winsNeeded: 1 },
        delorean_steel:   { gen: 'delorean', name: 'Stainless',  hex: '#C8C8C8', winsNeeded: 1 },
        porsche911_guards: { gen: 'porsche911', name: 'Guards Red', hex: '#CC2020', winsNeeded: 1 },
        countach_rosso:   { gen: 'countach', name: 'Rosso Mars', hex: '#CC2020', winsNeeded: 1 },
        cybertruck_steel: { gen: 'cybertruck', name: 'Bare Steel', hex: '#D0D0D0', winsNeeded: 1 },
        bronco_cactus:    { gen: 'bronco', name: 'Cactus Gray',  hex: '#8A9A7E', winsNeeded: 1 },
        wrangler_bikini:  { gen: 'wrangler', name: 'Bikini Pearl', hex: '#4AA8B0', winsNeeded: 1 },
        batmobile_noir:   { gen: 'batmobile', name: 'Gotham Black', hex: '#0A0A0A', winsNeeded: 1 },
        // Emergency
        policecar_blue:   { gen: 'policecar', name: 'NYPD Blue',    hex: '#1C3A6E', winsNeeded: 1 },
        ambulance_red:    { gen: 'ambulance', name: 'Fire Red',     hex: '#CC2020', winsNeeded: 1 },
        towtruck_yellow:  { gen: 'towtruck', name: 'Caution Yellow', hex: '#E8C820', winsNeeded: 1 },
        // Fun Rides
        icecream_pink:    { gen: 'icecreamtruck', name: 'Bubblegum', hex: '#FF69B4', winsNeeded: 1 },
        gokart_red:       { gen: 'gokart', name: 'Racing Red',     hex: '#CC2020', winsNeeded: 1 },
        limo_black:       { gen: 'limo', name: 'Midnight Black',   hex: '#1A1A1A', winsNeeded: 1 },
        tank_olive:       { gen: 'tank', name: 'Army Olive',       hex: '#4B5320', winsNeeded: 1 },
        zamboni_blue:     { gen: 'zamboni', name: 'Ice Blue',      hex: '#5B8FAF', winsNeeded: 1 },
        tractor_green:    { gen: 'tractor', name: 'John Deere',    hex: '#367C2B', winsNeeded: 1 },
        // Daily Drivers
        grandam_maroon:   { gen: 'grandam', name: 'Dark Cherry',   hex: '#5C1A1A', winsNeeded: 1 },
        focus_blue:       { gen: 'focus', name: 'Sonic Blue',      hex: '#2E5FAF', winsNeeded: 1 },
        bronco23_orange:  { gen: 'bronco2023', name: 'Cyber Orange', hex: '#E87020', winsNeeded: 1 },
        ferrari_rosso:    { gen: 'ferrari', name: 'Rosso Corsa',   hex: '#D40000', winsNeeded: 1 }
    },

};
