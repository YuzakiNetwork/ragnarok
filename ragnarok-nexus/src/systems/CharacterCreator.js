// Character Creation System - Origin System

const BLOODLINES = [
    'Human', 'Elf Twilight', 'Dwarf Runeborn', 'Oni Half-Blood',
    'Celestial Fallen', 'Void-Touched', 'Automaton Soul', 
    'Sea Leviathan', 'Dragonkin', 'Shadow Wraith', 
    'Divine Beast', 'Primordial Human'
];

const AWAKENINGS = [
    'Fire', 'Water', 'Earth', 'Wind', 'Lightning',
    'Ice', 'Light', 'Dark', 'Nature', 'Metal',
    'Void', 'Time', 'Space', 'Blood', 'Soul', 'Dream'
];

const ARCHETYPES = [
    'Warrior', 'Mage', 'Rogue', 'Support',
    'Tank', 'Marksman', 'Assassin', 'Summoner'
];

// Psychological questions to determine character origin
const ORIGIN_QUESTIONS = [
    {
        id: 1,
        question: "Dalam situasi berbahaya, apa reaksi pertamamu?",
        options: [
            { text: "Hadapi langsung!", result: { archetype: 'Warrior', bloodlineBoost: ['Human', 'Oni Half-Blood'] } },
            { text: "Analisis kelemahan musuh", result: { archetype: 'Mage', bloodlineBoost: ['Elf Twilight', 'Void-Touched'] } },
            { text: "Cari jalan keluar alternatif", result: { archetype: 'Rogue', bloodlineBoost: ['Shadow Wraith', 'Human'] } },
            { text: "Lindungi yang lemah", result: { archetype: 'Support', bloodlineBoost: ['Celestial Fallen', 'Divine Beast'] } }
        ]
    },
    {
        id: 2,
        question: "Kekuatan apa yang paling kamu inginkan?",
        options: [
            { text: "Kekuatan fisik tak terbatas", result: { stat: 'str', bloodlineBoost: ['Dwarf Runeborn', 'Dragonkin'] } },
            { text: "Sihir yang mengubah realitas", result: { stat: 'int', bloodlineBoost: ['Void-Touched', 'Elf Twilight'] } },
            { text: "Kecepatan dan kelincahan", result: { stat: 'agi', bloodlineBoost: ['Shadow Wraith', 'Human'] } },
            { text: "Kemampuan menyembuhkan", result: { stat: 'wis', bloodlineBoost: ['Celestial Fallen', 'Divine Beast'] } }
        ]
    },
    {
        id: 3,
        question: "Apa motivasi utamamu berpetualang?",
        options: [
            { text: "Mencari kekuatan", result: { archetype: 'Warrior', fateMark: 'Power Seeker' } },
            { text: "Menyelamatkan dunia", result: { archetype: 'Support', fateMark: 'Hero\'s Destiny' } },
            { text: "Mengungkap misteri", result: { archetype: 'Mage', fateMark: 'Truth Finder' } },
            { text: "Kebebasan tanpa batas", result: { archetype: 'Rogue', fateMark: 'Free Spirit' } }
        ]
    },
    {
        id: 4,
        question: "Elemen mana yang paling menarik bagimu?",
        options: [
            { text: "🔥 Api yang menghancurkan", result: { awakening: 'Fire' } },
            { text: "💧 Air yang mengalir", result: { awakening: 'Water' } },
            { text: "⚡ Petir yang cepat", result: { awakening: 'Lightning' } },
            { text: "🌑 Kegelapan misterius", result: { awakening: 'Dark' } },
            { text: "✨ Cahaya suci", result: { awakening: 'Light' } },
            { text: "🌌 Void yang tak terbatas", result: { awakening: 'Void' } }
        ]
    },
    {
        id: 5,
        question: "Bagaimana caramu menghadapi masalah?",
        options: [
            { text: "Konfrontasi langsung", result: { stat: 'vit', archetype: 'Tank' } },
            { text: "Strategi dan perencanaan", result: { stat: 'wis', archetype: 'Mage' } },
            { text: "Adaptasi cepat", result: { stat: 'agi', archetype: 'Rogue' } },
            { text: "Bekerja sama dengan orang lain", result: { stat: 'cha', archetype: 'Support' } }
        ]
    },
    {
        id: 6,
        question: "Pilih sebuah simbol:",
        options: [
            { text: "⚔️ Pedang", result: { bloodlineBoost: ['Human', 'Celestial Fallen'] } },
            { text: "🔮 Bola kristal", result: { bloodlineBoost: ['Elf Twilight', 'Void-Touched'] } },
            { text: "🗡️ Belati", result: { bloodlineBoost: ['Shadow Wraith', 'Oni Half-Blood'] } },
            { text: "🛡️ Perisai", result: { bloodlineBoost: ['Dwarf Runeborn', 'Divine Beast'] } }
        ]
    },
    {
        id: 7,
        question: "Akhir cerita seperti apa yang kamu harapkan?",
        options: [
            { text: "Menjadi legenda abadi", result: { fateMark: 'Eternal Legend' } },
            { text: "Mengorbankan diri untuk kebaikan", result: { fateMark: 'Sacred Sacrifice' } },
            { text: "Menghilang dalam misteri", result: { fateMark: 'Shadow Walker' } },
            { text: "Memulai kehidupan baru", result: { fateMark: 'Reincarnated Soul' } }
        ]
    }
];

class CharacterCreator {
    constructor() {
        this.sessions = new Map(); // Store user sessions
    }

    // Start character creation for a user
    startCreation(userId) {
        this.sessions.set(userId, {
            step: 0,
            answers: [],
            results: {
                bloodline: null,
                awakening: null,
                archetype: null,
                fateMark: null,
                statBonuses: {}
            }
        });
        
        return this.getQuestion(userId);
    }

    // Get current question
    getQuestion(userId) {
        const session = this.sessions.get(userId);
        if (!session) return null;

        if (session.step >= ORIGIN_QUESTIONS.length) {
            return this.finalizeCharacter(userId);
        }

        const question = ORIGIN_QUESTIONS[session.step];
        return {
            step: session.step + 1,
            total: ORIGIN_QUESTIONS.length,
            question: question.question,
            options: question.options.map((opt, idx) => ({
                id: idx + 1,
                text: opt.text
            }))
        };
    }

    // Submit answer
    submitAnswer(userId, optionIndex) {
        const session = this.sessions.get(userId);
        if (!session || session.step >= ORIGIN_QUESTIONS.length) {
            return { error: 'No active session or completed' };
        }

        const question = ORIGIN_QUESTIONS[session.step];
        const selectedOption = question.options[optionIndex - 1];
        
        if (!selectedOption) {
            return { error: 'Invalid option' };
        }

        // Store answer
        session.answers.push(selectedOption);
        
        // Apply results
        this.applyResults(session, selectedOption.result);

        session.step++;
        
        return {
            success: true,
            nextStep: session.step < ORIGIN_QUESTIONS.length,
            applied: selectedOption.result
        };
    }

    // Apply results from answer
    applyResults(session, result) {
        if (result.archetype && !session.results.archetype) {
            session.results.archetype = result.archetype;
        }
        
        if (result.awakening && !session.results.awakening) {
            session.results.awakening = result.awakening;
        }
        
        if (result.fateMark && !session.results.fateMark) {
            session.results.fateMark = result.fateMark;
        }
        
        if (result.stat) {
            session.results.statBonuses[result.stat] = (session.results.statBonuses[result.stat] || 0) + 1;
        }
        
        if (result.bloodlineBoost) {
            session.results.bloodlineBoost = session.results.bloodlineBoost || [];
            result.bloodlineBoost.forEach(b => {
                if (!session.results.bloodlineBoost.includes(b)) {
                    session.results.bloodlineBoost.push(b);
                }
            });
        }
    }

    // Finalize character based on answers
    finalizeCharacter(userId) {
        const session = this.sessions.get(userId);
        if (!session) return null;

        // Determine bloodline
        let bloodline = 'Human'; // Default
        if (session.results.bloodlineBoost && session.results.bloodlineBoost.length > 0) {
            // Pick most frequent or random from boosted
            const boosts = session.results.bloodlineBoost;
            bloodline = boosts[Math.floor(Math.random() * boosts.length)];
        } else {
            // Random from all bloodlines
            bloodline = BLOODLINES[Math.floor(Math.random() * BLOODLINES.length)];
        }

        // Determine awakening
        let awakening = session.results.awakening;
        if (!awakening) {
            awakening = AWAKENINGS[Math.floor(Math.random() * AWAKENINGS.length)];
        }

        // Determine archetype
        let archetype = session.results.archetype;
        if (!archetype) {
            archetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
        }

        // Determine fate mark
        let fateMark = session.results.fateMark;
        if (!fateMark) {
            const fateMarks = [
                'Lucky Star', 'Battle Scars', 'Merchant\'s Blessing',
                'Shadow Friend', 'Elemental Affinity', 'Beast Tamer',
                'Ancient Bloodline', 'Chosen One', 'Wanderer', 'Guardian'
            ];
            fateMark = fateMarks[Math.floor(Math.random() * fateMarks.length)];
        }

        // Calculate stat bonuses from answers
        const stats = {
            vit: 5, str: 5, agi: 5, int: 5, wis: 5, cha: 5, lck: 5
        };
        
        Object.entries(session.results.statBonuses || {}).forEach(([stat, bonus]) => {
            stats[stat] += bonus;
        });

        // Generate character name (user can customize later)
        const characterName = `Traveler_${userId.substring(0, 8)}`;

        const characterData = {
            characterName,
            bloodline,
            awakening,
            archetype,
            fateMark,
            stats
        };

        // Clean up session
        this.sessions.delete(userId);

        return characterData;
    }

    // Get all bloodlines
    getBloodlines() {
        return BLOODLINES;
    }

    // Get all awakenings
    getAwakenings() {
        return AWAKENINGS;
    }

    // Get all archetypes
    getArchetypes() {
        return ARCHETYPES;
    }
}

module.exports = new CharacterCreator();
