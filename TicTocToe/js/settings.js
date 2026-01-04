const audioSettingName = "game-audio";
const CPUDifficultyName = "cpu-difficulty";
const difficultyOptions = {
    Easy: "Easy",
    Medium: "Medium",
    Hard: "Hard",
    Impossible: "Impossible"
};
const playerLetterName = "player-letter";
const allowUndoSettingName = "allow-undo";
const allowAnimationsName = "allow-animations";

defaultSetting(audioSettingName, "80");
defaultSetting(CPUDifficultyName, difficultyOptions.Medium);
defaultSetting(playerLetterName, "X");
defaultSetting(allowUndoSettingName, "false");
defaultSetting(allowAnimationsName, "true");

function updateAudioSetting(value) { updateSetting(audioSettingName, value); }
function getAudioSettings() { return getSetting(audioSettingName); }

function getDifficultyOptions() { return difficultyOptions; }
function updateCPUDifficultySetting(value) { updateSetting(CPUDifficultyName, value) }
function getCPUDifficultySetting() { return getSetting(CPUDifficultyName); }

function updatePlayerLetterSetting(value) { updateSetting(playerLetterName, value) }
function getPlayerLetterSetting() { return getSetting(playerLetterName); }

function updateAllowUndoSetting(value) { updateSetting(allowUndoSettingName, value); }
function getAllowUndoSettings() { return getSetting(allowUndoSettingName) == "true"; }

function updateAllowAnimationsSetting(value) { updateSetting(allowAnimationsName, value); }
function getAllowAnimationsSettings() { return getSetting(allowAnimationsName) == "true"; }

function updateSetting(key, value) { localStorage.setItem(key, value); }
function getSetting(key) { return localStorage.getItem(key); }
function defaultSetting(key, defaultValue) { if (!localStorage.getItem(key)) localStorage.setItem(key, defaultValue); }