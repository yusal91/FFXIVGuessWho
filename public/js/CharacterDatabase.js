// CharacterDatabase.js - Server Version
const FFXIVCharacter = require('./FFXIVCharacter');
const { Gender, Race, Affiliation, Job } = require('./CharacterEnums');

// CharacterDatabase.js - Browser Version
class CharacterDatabase {
    constructor() 
    {
        this.characters = this.initializeCharacters();
    }

    initializeCharacters() 
    {
        return [
            new FFXIVCharacter({
                id: 1,
                name: "Alphinaud",
                image: "/images/Alphinaud.png",
                gender: Gender.MALE,
                race: Race.ELEZEN,
                affiliation: Affiliation.SCIONS,
                jobs: [Job.SCHOLAR, Job.ACADEMIC],
                cityState: "Sharlayan",
                expansion: "ARR",
                isScion: true,
                traits: ['young', 'white_hair', 'blue_eyes', 'scholar', 'diplomat', 'elezen']
            }),

            new FFXIVCharacter({
                id: 2,
                name: "Alisaie",
                image: "/images/Alisaie.png",
                gender: Gender.FEMALE,
                race: Race.ELEZEN,
                affiliation: Affiliation.SCIONS,
                jobs: [Job.RED_MAGE],
                cityState: "Sharlayan",
                expansion: "ARR",
                isScion: true,
                traits: ['young', 'white_hair', 'red_eyes', 'red_mage', 'determined', 'elezen']
            }),

            new FFXIVCharacter({
                id: 3,
                name: "Y'shtola",
                image: "/images/Yshtola.png",
                gender: Gender.FEMALE,
                race: Race.MIQOTE,
                affiliation: Affiliation.SCIONS,
                jobs: [Job.BLACK_MAGE, Job.WHITE_MAGE, Job.SAGE],
                cityState: "Gridania",
                expansion: "ARR",
                isScion: true,
                traits: ['wise', 'white_hair', 'yellow_eyes', 'mage', 'mysterious', 'miqote']
            }),

            new FFXIVCharacter({
                id: 4,
                name: "Thancred",
                image: "/images/Thancred.png",
                gender: Gender.MALE,
                race: Race.HYUR,
                affiliation: Affiliation.SCIONS,
                jobs: [Job.GUNBREAKER, Job.ROGUE],
                cityState: "Ul'dah",
                expansion: "ARR",
                isScion: true,
                traits: ['brown_hair', 'gunbreaker', 'charming', 'protector', 'hyur']
            }),

            new FFXIVCharacter({
                id: 5,
                name: "Urianger",
                image: "/images/Urianger.png",
                gender: Gender.MALE,
                race: Race.ELEZEN,
                affiliation: Affiliation.SCIONS,
                jobs: [Job.ASTROLOGIAN, Job.SCHOLAR],
                cityState: "Sharlayan",
                expansion: "ARR",
                isScion: true,
                traits: ['wise', 'blonde_hair', 'glasses', 'scholar', 'mysterious', 'elezen']
            }),

            new FFXIVCharacter({
                id: 6,
                name: "Tataru",
                image: "/images/Tataru.png",
                gender: Gender.FEMALE,
                race: Race.LALAFELL,
                affiliation: Affiliation.SCIONS,
                jobs: [Job.ACADEMIC],
                cityState: "Ul'dah",
                expansion: "ARR",
                isScion: true,
                traits: ['lalafell', 'pink_hair', 'secretary', 'cheerful', 'crafty']
            }),

            new FFXIVCharacter({
                id: 7,
                name: "Estinien",
                image: "/images/Estinien.png",
                gender: Gender.MALE,
                race: Race.ELEZEN,
                affiliation: Affiliation.SCIONS,
                jobs: [Job.DRAGOON],
                cityState: "Ishgard",
                expansion: "HW",
                isScion: true,
                traits: ['white_hair', 'dragoon', 'serious', 'lone_wolf', 'elezen']
            }),

            new FFXIVCharacter({
                id: 8,
                name: "Aymeric",
                image: "/images/Aymeric.png",
                gender: Gender.MALE,
                race: Race.ELEZEN,
                affiliation: Affiliation.GRAND_COMPANY,
                jobs: [Job.PALADIN],
                cityState: "Ishgard",
                expansion: "HW",
                isScion: false,
                traits: ['black_hair', 'leader', 'noble', 'paladin', 'elezen']
            }),

            new FFXIVCharacter({
                id: 9,
                name: "Haurchefant",
                image: "/images/Haurchefant.png",
                gender: Gender.MALE,
                race: Race.ELEZEN,
                affiliation: Affiliation.GRAND_COMPANY,
                jobs: [Job.PALADIN],
                cityState: "Ishgard",
                expansion: "HW",
                isScion: false,
                traits: ['blonde_hair', 'cheerful', 'protective', 'paladin', 'elezen']
            }),

            new FFXIVCharacter({
                id: 10,
                name: "Lyse",
                image: "/images/Lyse.png",
                gender: Gender.FEMALE,
                race: Race.HYUR,
                affiliation: Affiliation.GRAND_COMPANY,
                jobs: [Job.MONK],
                cityState: "Ala Mhigo",
                expansion: "SB",
                isScion: false,
                traits: ['blonde_hair', 'monk', 'revolutionary', 'determined', 'hyur']
            }),

            new FFXIVCharacter({
                id: 11,
                name: "Raubahn",
                image: "/images/Raubahn.png",
                gender: Gender.MALE,
                race: Race.HYUR,
                affiliation: Affiliation.GRAND_COMPANY,
                jobs: [Job.WARRIOR],
                cityState: "Ul'dah",
                expansion: "ARR",
                isScion: false,
                traits: ['beard', 'warrior', 'leader', 'general', 'hyur']
            }),

            new FFXIVCharacter({
                id: 12,
                name: "Hien",
                image: "/images/Hien.png",
                gender: Gender.MALE,
                race: Race.HYUR,
                affiliation: Affiliation.GRAND_COMPANY,
                jobs: [Job.SAMURAI],
                cityState: "Doma",
                expansion: "SB",
                isScion: false,
                traits: ['black_hair', 'samurai', 'prince', 'leader', 'hyur']
            }),

            new FFXIVCharacter({
                id: 13,
                name: "G'raha Tia",
                image: "/images/GrahaTia.png",
                gender: Gender.MALE,
                race: Race.MIQOTE,
                affiliation: Affiliation.SCIONS,
                jobs: [Job.RED_MAGE, Job.ARCHER],
                cityState: "Sharlayan",
                expansion: "SHB",
                isScion: true,
                traits: ['red_hair', 'red_mage', 'scholar', 'crystal_exarch', 'miqote']
            }),

            new FFXIVCharacter({
                id: 14,
                name: "Emet-Selch",
                image: "/images/Emet-Selch.png",
                gender: Gender.MALE,
                race: Race.UNKNOWN,
                affiliation: Affiliation.GARLEAN,
                jobs: [Job.BLACK_MAGE],
                cityState: "Garlemald",
                expansion: "SHB",
                isScion: false,
                traits: ['white_hair', 'villain', 'ancient', 'mysterious', 'ascian']
            }),

            new FFXIVCharacter({
                id: 15,
                name: "Crystal Exarch",
                image: "/images/Crystal Exarch.png",
                gender: Gender.MALE,
                race: Race.MIQOTE,
                affiliation: Affiliation.NEUTRAL,
                jobs: [Job.RED_MAGE],
                cityState: "The Crystarium",
                expansion: "SHB",
                isScion: false,
                traits: ['hooded', 'mysterious', 'leader', 'crystal', 'miqote']
            }),

            new FFXIVCharacter({
                id: 16,
                name: "Ryne",
                image: "/images/Ryne.png",
                gender: Gender.FEMALE,
                race: Race.HYUR,
                affiliation: Affiliation.SCIONS,
                jobs: [Job.PALADIN],
                cityState: "Norvrandt",
                expansion: "SHB",
                isScion: true,
                traits: ['blonde_hair', 'young', 'warrior_of_light', 'determined', 'hyur']
            }),

            new FFXIVCharacter({
                id: 17,
                name: "Zenos",
                image: "/images/Zenos.png",
                gender: Gender.MALE,
                race: Race.GARLEAN,
                affiliation: Affiliation.GARLEAN,
                jobs: [Job.SAMURAI, Job.REAPER],
                cityState: "Garlemald",
                expansion: "SB",
                isScion: false,
                traits: ['blonde_hair', 'villain', 'samurai', 'obsessive', 'garlean']
            }),

            new FFXIVCharacter({
                id: 18,
                name: "Fordola",
                image: "/images/Fordola.png",
                gender: Gender.FEMALE,
                race: Race.HYUR,
                affiliation: Affiliation.GARLEAN,
                jobs: [Job.GUNBREAKER],
                cityState: "Ala Mhigo",
                expansion: "SB",
                isScion: false,
                traits: ['red_hair', 'soldier', 'scarred', 'determined', 'hyur']
            }),

            new FFXIVCharacter({
                id: 19,
                name: "Minfilia",
                image: "/images/Minfilia.png",
                gender: Gender.FEMALE,
                race: Race.HYUR,
                affiliation: Affiliation.SCIONS,
                jobs: [Job.ACADEMIC],
                cityState: "Ul'dah",
                expansion: "ARR",
                isScion: true,
                traits: ['blonde_hair', 'leader', 'oracle', 'wise', 'hyur']
            }),

            new FFXIVCharacter({
                id: 20,
                name: "Papalymo",
                image: "/images/Papalymo.png",
                gender: Gender.MALE,
                race: Race.LALAFELL,
                affiliation: Affiliation.SCIONS,
                jobs: [Job.BLACK_MAGE],
                cityState: "Gridania",
                expansion: "ARR",
                isScion: true,
                traits: ['lalafell', 'black_mage', 'wise', 'serious', 'glasses']
            }),

            new FFXIVCharacter({
                id: 21,
                name: "Yda",
                image: "/images/Yda.png",
                gender: Gender.FEMALE,
                race: Race.HYUR,
                affiliation: Affiliation.SCIONS,
                jobs: [Job.MONK],
                cityState: "Gridania",
                expansion: "ARR",
                isScion: true,
                traits: ['blonde_hair', 'monk', 'energetic', 'mask', 'hyur']
            }),

            new FFXIVCharacter({
                id: 22,
                name: "Cid",
                image: "/images/Cid.png",
                gender: Gender.MALE,
                race: Race.HYUR,
                affiliation: Affiliation.NEUTRAL,
                jobs: [Job.ENGINEER],
                cityState: "Garlemald",
                expansion: "ARR",
                isScion: false,
                traits: ['brown_hair', 'engineer', 'inventor', 'goggles', 'hyur']
            }),

            new FFXIVCharacter({
                id: 23,
                name: "Nero",
                image: "/images/Nero.png",
                gender: Gender.MALE,
                race: Race.HYUR,
                affiliation: Affiliation.GARLEAN,
                jobs: [Job.ENGINEER],
                cityState: "Garlemald",
                expansion: "ARR",
                isScion: false,
                traits: ['black_hair', 'engineer', 'rival', 'arrogant', 'hyur']
            }),

            new FFXIVCharacter({
                id: 24,
                name: "Gaius",
                image: "/images/Gaius.png",
                gender: Gender.MALE,
                race: Race.GARLEAN,
                affiliation: Affiliation.GARLEAN,
                jobs: [Job.WARRIOR],
                cityState: "Garlemald",
                expansion: "ARR",
                isScion: false,
                traits: ['armor', 'villain', 'general', 'warrior', 'garlean']
            })
        ];
    }

    getCharactersByGender(gender) 
    {
        return this.characters.filter(char => char.gender === gender);
    }

    getCharactersByRace(race) 
    {
        return this.characters.filter(char => char.race === race);
    }

    getScions() 
    {
        return this.characters.filter(char => char.isScion);
    }

    getCharactersWithTrait(trait) 
    {
        return this.characters.filter(char => char.hasTrait(trait));
    }

    getCharacterById(id) 
    {
        return this.characters.find(char => char.id === id);
    }

    getAllCharacters() 
    {
        return this.characters;
    }
}
module.exports = CharacterDatabase;