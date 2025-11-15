// FFXIVCharacter.js - Server Version
const { Gender, Race, Affiliation, Job } = require('./CharacterEnums');

class FFXIVCharacter {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.image = config.image;
        this.gender = config.gender;
        this.race = config.race;
        this.affiliation = config.affiliation;
        this.jobs = config.jobs || [];
        this.cityState = config.cityState;
        this.expansion = config.expansion;
        this.isScion = config.isScion || false;
        this.traits = config.traits || [];
    }

    hasTrait(trait) {
        return this.traits.includes(trait);
    }

    hasJob(job) {
        return this.jobs.includes(job);
    }

    isFromExpansion(expansion) {
        return this.expansion === expansion;
    }

    isFromCity(city) {
        return this.cityState === city;
    }
}

module.exports = FFXIVCharacter;