let startBtn = document.querySelector('#btnGrid a[href*="game.html"]');
if (startBtn) {
	startBtn.addEventListener("click", function (e) {
		e.preventDefault();
		document.body.classList.add("zoomFade");

		setTimeout(function () {
			window.location.href = startBtn.href;
		}, 900);
	});
}

let gameSetupModal = document.getElementById("gameSetupModal");
let gameSetupForm = document.getElementById("gameSetupForm");
let detectiveNameInput = document.getElementById("detectiveName");
let caseStartBtn = document.getElementById("caseStartBtn");
let detectiveGreeting = document.getElementById("detectiveGreeting");
let setupError = document.getElementById("setupError");
let gameShell = document.querySelector(".gameShell");
let levelOne = document.getElementById("levelOne");
let storyIntroModal = document.getElementById("storyIntroModal");
let startFirstRoomBtn = document.getElementById("startFirstRoomBtn");
let storyAfterFirstLevelModal = document.getElementById("storyAfterFirstLevelModal");
let startSecondRoomBtn = document.getElementById("startSecondRoomBtn");

let roomScene = document.getElementById("roomScene");
let roomSwitchBtn = document.getElementById("roomSwitchBtn");
let showSuspectsBtn = document.getElementById("showSuspectsBtn");
let pinboardFocusBtn = document.getElementById("pinboardFocusBtn");
let deskLetterBtn = document.getElementById("deskLetterBtn");
let windowInspectBtn = document.getElementById("windowInspectBtn");
let finalClueBtn = document.getElementById("finalClueBtn");
let mapPieceButtons = [
	document.getElementById("mapPieceBtn1"),
	document.getElementById("mapPieceBtn2"),
	document.getElementById("mapPieceBtn3"),
	document.getElementById("mapPieceBtn4")
];

let pinboardOverlay = document.getElementById("pinboardOverlay");
let pinboardCloseBtn = document.getElementById("pinboardCloseBtn");
let windowOverlay = document.getElementById("windowOverlay");
let windowCloseBtn = document.getElementById("windowCloseBtn");
let mapOverlay = document.getElementById("mapOverlay");
let mapCloseBtn = document.getElementById("mapCloseBtn");
let mapVossBtn = document.getElementById("mapVossBtn");
let mapBlackwoodBtn = document.getElementById("mapBlackwoodBtn");
let letterNoteCard = document.getElementById("letterNoteCard");
let letterNoteText = document.getElementById("letterNoteText");
let closeLetterNote = document.getElementById("closeLetterNote");

let hintCard = document.getElementById("hintCard");
let hintText = document.getElementById("hintText");
let closeHint = document.getElementById("closeHint");
let finalRevealCard = document.getElementById("finalRevealCard");
let finalRevealText = document.getElementById("finalRevealText");
let finalRevealAccuseBtn = document.getElementById("finalRevealAccuseBtn");
let closeFinalReveal = document.getElementById("closeFinalReveal");
let cipherGrid = document.getElementById("cipherGrid");
let cipherProgress = document.getElementById("cipherProgress");
let cipherFeedback = document.getElementById("cipherFeedback");
let resetCipher = document.getElementById("resetCipher");

let encryptionMachineBtn = document.getElementById("encryptionMachineBtn");

let roomsModal = document.getElementById("roomsModal");
let roomsGrid = document.getElementById("roomsGrid");
let closeRoomsBtn = document.getElementById("closeRoomsBtn");

let suspectsModal = document.getElementById("suspectsModal");
let closeSuspectsBtn = document.getElementById("closeSuspectsBtn");
let suspectPickButtons = document.querySelectorAll(".suspectPickBtn");

let inventoryToggle = document.getElementById("inventoryToggle");
let inventoryPanel = document.getElementById("inventoryPanel");
let inventoryEmptyText = document.getElementById("inventoryEmptyText");
let inventoryFoundList = document.getElementById("inventoryFoundList");
let resultModal = document.getElementById('resultModal');
let resultTitle = document.getElementById('resultTitle');
let resultText = document.getElementById('resultText');
let resultTimeText = document.getElementById('resultTimeText');
let resultSuspectText = document.getElementById('resultSuspectText');
let resultDetailText = document.getElementById('resultDetailText');
let resultBadge = document.getElementById('resultBadge');

let currentRoomIndex = 0;
let foundItems = [];
let selectedSuspect = null;
let firstLevelTransitionShown = false;
let detectiveName = "Unbekannt";
let roomInteractionFlags = {};
let vossRevealShown = false;

let cipherTarget = "BLACKWOOD";
let cipherLetters = ["B", "A", "R", "L", "M", "Q", "A", "C", "K", "T", "W", "Y", "O", "O", "D", "N", "E", "S"];
let cipherCurrentIndex = 0;
let cipherSolved = false;
let rooms = window.rooms || [];

// Game state: stopwatch and case flow
let timerSeconds = 0;
let timerInterval = null;
let finalAccuseMode = false;
const guiltySuspect = "Elias Blackwood";

let audioElements = {};
let audioSystemReady = false;

function cacheAudioElements() {
	audioElements = {
		uiClickSfx: document.getElementById("uiClickSfx"),
			uiClickSfx2: document.getElementById("uiClickSfx2"),
		menuMusic: document.getElementById("menuMusic"),
		gameMusic: document.getElementById("gameMusic"),
		foundItemSfx: document.getElementById("foundItemSfx"),
		foundClueSfx: document.getElementById("foundClueSfx"),
			backpackSfx: document.getElementById("backpackSfx"),
		modalOpenSfx: document.getElementById("modalOpenSfx"),
		modalCloseSfx: document.getElementById("modalCloseSfx"),
		transitionSfx: document.getElementById("transitionSfx"),
		successSfx: document.getElementById("successSfx"),
		failureSfx: document.getElementById("failureSfx"),
		inspectSfx: document.getElementById("inspectSfx"),
		accuseSfx: document.getElementById("accuseSfx"),
		cipherSolveSfx: document.getElementById("cipherSolveSfx")
	};
}

function getAudioVolumeFromStorage(key, fallbackValue) {
	try {
		let storedValue = localStorage.getItem(key);
		if (storedValue === null) {
			return fallbackValue;
		}
		let numericValue = Number(storedValue);
		return isNaN(numericValue) ? fallbackValue : numericValue;
	} catch (e) {
		return fallbackValue;
	}
}

function writeAudioVolumeToStorage(key, value) {
	try {
		localStorage.setItem(key, String(value));
	} catch (e) { }
}

function getVolumeFromSlider(sliderId, storageKey, fallbackValue) {
	let slider = document.getElementById(sliderId);
	if (slider) {
		let sliderValue = Number(slider.value);
		return isNaN(sliderValue) ? fallbackValue : sliderValue;
	}
	return getAudioVolumeFromStorage(storageKey, fallbackValue);
}

function applyAudioVolumes() {
	let masterVolume = Math.max(0, Math.min(100, getVolumeFromSlider("allRange", "audioMasterVolume", 35))) / 100;
	let musicVolume = Math.max(0, Math.min(100, getVolumeFromSlider("musicRange", "audioMusicVolume", 84))) / 100;
	let sfxVolume = Math.max(0, Math.min(100, getVolumeFromSlider("sfxRange", "audioSfxVolume", 72))) / 100;
	let speechVolume = Math.max(0, Math.min(100, getVolumeFromSlider("speechRange", "audioSpeechVolume", 23))) / 100;

	if (audioElements.menuMusic) audioElements.menuMusic.volume = masterVolume * musicVolume;
	if (audioElements.gameMusic) audioElements.gameMusic.volume = masterVolume * musicVolume;
	if (audioElements.uiClickSfx) audioElements.uiClickSfx.volume = masterVolume * sfxVolume;
	if (audioElements.uiClickSfx2) audioElements.uiClickSfx2.volume = masterVolume * sfxVolume;
	if (audioElements.foundItemSfx) audioElements.foundItemSfx.volume = masterVolume * sfxVolume;
	if (audioElements.foundClueSfx) audioElements.foundClueSfx.volume = masterVolume * sfxVolume;
	if (audioElements.modalOpenSfx) audioElements.modalOpenSfx.volume = masterVolume * sfxVolume;
	if (audioElements.modalCloseSfx) audioElements.modalCloseSfx.volume = masterVolume * sfxVolume;
	if (audioElements.transitionSfx) audioElements.transitionSfx.volume = masterVolume * sfxVolume;
	if (audioElements.backpackSfx) audioElements.backpackSfx.volume = masterVolume * sfxVolume;
	if (audioElements.successSfx) audioElements.successSfx.volume = masterVolume * sfxVolume;
	if (audioElements.failureSfx) audioElements.failureSfx.volume = masterVolume * sfxVolume;
	if (audioElements.inspectSfx) audioElements.inspectSfx.volume = masterVolume * sfxVolume;
	if (audioElements.accuseSfx) audioElements.accuseSfx.volume = masterVolume * sfxVolume;
	if (audioElements.cipherSolveSfx) audioElements.cipherSolveSfx.volume = masterVolume * sfxVolume;

	writeAudioVolumeToStorage("audioMasterVolume", masterVolume * 100);
	writeAudioVolumeToStorage("audioMusicVolume", musicVolume * 100);
	writeAudioVolumeToStorage("audioSfxVolume", sfxVolume * 100);
	writeAudioVolumeToStorage("audioSpeechVolume", speechVolume * 100);
}

function playAudio(audioId) {
	let audio = audioElements[audioId] || document.getElementById(audioId);
	if (!audio) {
		return;
	}

	try {
		audio.currentTime = 0;
		let playPromise = audio.play();
		if (playPromise && typeof playPromise.catch === "function") {
			playPromise.catch(function () { });
		}
	} catch (e) { }
}

function pauseAudio(audioId) {
	let audio = audioElements[audioId] || document.getElementById(audioId);
	if (!audio) {
		return;
	}

	try {
		audio.pause();
	} catch (e) { }
}

function startBackgroundMusic(audioId) {
	let audio = audioElements[audioId] || document.getElementById(audioId);
	if (!audio) {
		return;
	}

	["menuMusic", "gameMusic"].forEach(function (otherAudioId) {
		if (otherAudioId !== audioId) {
			pauseAudio(otherAudioId);
		}
	});

	audio.loop = true;
	try {
		let playPromise = audio.play();
		if (playPromise && typeof playPromise.catch === "function") {
			playPromise.catch(function () { });
		}
	} catch (e) { }
}

function bindAudioSettings() {
	let masterSlider = document.getElementById("allRange");
	let musicSlider = document.getElementById("musicRange");
	let sfxSlider = document.getElementById("sfxRange");
	let speechSlider = document.getElementById("speechRange");

	function handleAudioSettingsChange() {
		applyAudioVolumes();
	}

	if (masterSlider) {
		masterSlider.value = getAudioVolumeFromStorage("audioMasterVolume", Number(masterSlider.value || 35));
		masterSlider.addEventListener("input", handleAudioSettingsChange);
	}
	if (musicSlider) {
		musicSlider.value = getAudioVolumeFromStorage("audioMusicVolume", Number(musicSlider.value || 84));
		musicSlider.addEventListener("input", handleAudioSettingsChange);
	}
	if (sfxSlider) {
		sfxSlider.value = getAudioVolumeFromStorage("audioSfxVolume", Number(sfxSlider.value || 72));
		sfxSlider.addEventListener("input", handleAudioSettingsChange);
	}
	if (speechSlider) {
		speechSlider.value = getAudioVolumeFromStorage("audioSpeechVolume", Number(speechSlider.value || 23));
		speechSlider.addEventListener("input", handleAudioSettingsChange);
	}

	applyAudioVolumes();
}

function initAudioSystem() {
	if (audioSystemReady) {
		return;
	}

	cacheAudioElements();
	bindAudioSettings();

	function tryUnlockAudio() {
		try {
			let audios = document.querySelectorAll('audio');
			audios.forEach(function (a) {
				try {
					let p = a.play();
					if (p && typeof p.then === 'function') {
						p.then(function () { a.pause(); a.currentTime = 0; }).catch(function () { });
					} else {
						a.pause();
						a.currentTime = 0;
					}
				} catch (e) { }
			});
		} catch (e) { }

		try {
			var C = window.AudioContext || window.webkitAudioContext;
			if (C) {
				window.__gameAudioContext = window.__gameAudioContext || new C();
				if (window.__gameAudioContext.state === 'suspended') {
					window.__gameAudioContext.resume().catch(function () { });
				}
			}
		} catch (e) { }
	}

	if (document.body && document.body.id === "gameBody") {
		document.addEventListener("pointerdown", function () {
			tryUnlockAudio();
			if (!pageMusicStarted) {
				pageMusicStarted = true;
				startBackgroundMusic("gameMusic");
			}
		}, { once: true });
	} else if (document.getElementById("mainBox") || document.body.id === 'settingsPage') {
		let audioGateOverlay = document.getElementById("audioGateOverlay");
		let audioGateBtn = document.getElementById("audioGateBtn");

		function hideAudioGateOverlay() {
			if (audioGateOverlay) {
				audioGateOverlay.style.display = "none";
			}
		}

		function startMenuAudioGate() {
			tryUnlockAudio();
			if (!pageMusicStarted) {
				pageMusicStarted = true;
				startBackgroundMusic("menuMusic");
			}
			hideAudioGateOverlay();
		}

		if (audioGateBtn) {
			audioGateBtn.addEventListener("pointerdown", function (event) {
				event.preventDefault();
				event.stopPropagation();
				startMenuAudioGate();
			}, { once: true });
		}

		document.addEventListener("pointerdown", function () {
			tryUnlockAudio();
			if (!pageMusicStarted) {
				pageMusicStarted = true;
				startBackgroundMusic("menuMusic");
			}
			hideAudioGateOverlay();
		}, { once: true });
	}

	document.addEventListener("click", function (event) {
		// If an element defines a specific sound via data-sound, play it.
		let soundTarget = event.target.closest('[data-sound]');
		if (soundTarget) {
			let soundId = soundTarget.getAttribute('data-sound');
			if (soundId) playAudio(soundId);
			return;
		}

		// If the element (or an ancestor) explicitly requests no sound, skip SFX.
		// Use attribute `data-no-sound` or common hotspot classes to exclude.
		let noSfxTarget = event.target.closest('[data-no-sound], .mapPieceBtn, .suspectPickBtn, #deskLetterBtn, .pinboardOverlay');
		if (noSfxTarget) {
			return;
		}

		// Fallback: play the default UI click for buttons/links/controls
		let interactiveTarget = event.target.closest("button, a, input[type='range'], [role='button']");
		if (interactiveTarget) {
			playAudio("uiClickSfx");
		}
	}, true);

	audioSystemReady = true;
}

function roomInteractionKey(roomIndex, interactionKey) {
	return roomIndex + ":" + interactionKey;
}

function markRoomInteraction(roomIndex, interactionKey) {
	let alreadyMarked = hasRoomInteraction(roomIndex, interactionKey);
	roomInteractionFlags[roomInteractionKey(roomIndex, interactionKey)] = true;
	if (!alreadyMarked) {
		playAudio("foundClueSfx");
	}
	if (roomIndex === 0 && isRoomFullyExplored(0) && !firstLevelTransitionShown) {
		firstLevelTransitionShown = true;
		showTransitionStory();
	}
	checkAllLevelsCompleted();
}

function hasRoomInteraction(roomIndex, interactionKey) {
	return !!roomInteractionFlags[roomInteractionKey(roomIndex, interactionKey)];
}

function roomZeroFullyExplored() {
	return hasRoomInteraction(0, "pinboard") && hasRoomInteraction(0, "letter") && hasRoomInteraction(0, "encryption") && hasRoomInteraction(0, "window");
}

function formatTime(sec) {
	let m = Math.floor(sec / 60);
	let s = sec % 60;
	return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

function updateHUD() {
	let timerDisplay = document.getElementById('timerDisplay');
	if (timerDisplay) timerDisplay.textContent = 'Stoppuhr: ' + formatTime(timerSeconds);
}

function startTimer() {
	stopTimer();
	timerInterval = setInterval(function () {
		timerSeconds += 1;
		updateHUD();
	}, 1000);
}

function stopTimer() {
	if (timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
	}
}

function addScore(amount) {
}

function loseLife(amount) {
}

function handleTimeOut() {
	handleGameOver(false, 'Die Zeit ist abgelaufen. Der Fall bleibt ungelöst.');
}

function handleGameOver(won, message) {
	stopTimer();
	finalAccuseMode = false;
	playAudio(won ? "successSfx" : "failureSfx");
	let elapsedSeconds = Math.max(0, timerSeconds);
	let suspectText = selectedSuspect || 'Keine Spur gewählt';
	if (resultModal) {
		resultModal.classList.remove('resultModalWon', 'resultModalLost');
		resultModal.classList.add(won ? 'resultModalWon' : 'resultModalLost');
	}
	if (resultBadge) resultBadge.textContent = won ? 'Fall gelöst' : 'Ermittlung beendet';
	if (resultTitle) resultTitle.textContent = won ? 'Du hast gewonnen!' : 'Fall gescheitert';
	if (resultText) resultText.textContent = message || (won ? 'Du hast den wahren Täter gefunden.' : 'Leider falsch.');
	if (resultTimeText) resultTimeText.textContent = formatTime(elapsedSeconds);
	if (resultSuspectText) resultSuspectText.textContent = suspectText;
	if (resultDetailText) resultDetailText.textContent = won ? 'Deine Arbeit wird in den Ermittlungsakten vermerkt. Die gesammelten Hinweise haben sich ausgezahlt.' : 'Die Akte bleibt offen. Ein klarer Abschluss fehlt noch, aber deine bisherigen Spuren bleiben gespeichert.';
	if (resultModal) {
		resultModal.classList.remove('gameModalHidden');
		updateBodyModalState();
	}

	// save only elapsed stopwatch time
	try {
		let runs = JSON.parse(localStorage.getItem('gameRuns') || '[]');
		runs.push({
			name: detectiveName || 'Unbekannt',
			elapsedSeconds: elapsedSeconds
		});
		localStorage.setItem('gameRuns', JSON.stringify(runs));
	} catch (e) { }
}

function checkAllLevelsCompleted() {
	if (!Array.isArray(rooms) || rooms.length === 0) return false;
	let allFound = rooms.every(function (r) { return !!r.found; });
	if (allFound && roomZeroFullyExplored()) {
		// prompt final accusation
		finalAccuseMode = true;
		openSuspectsModal();
	}
	return allFound;
}

function formatElapsedSeconds(totalSeconds) {
	let minutes = Math.floor(totalSeconds / 60);
	let seconds = totalSeconds % 60;
	return (minutes < 10 ? '0' + minutes : String(minutes)) + ':' + (seconds < 10 ? '0' + seconds : String(seconds));
}

function renderSavedRuns() {
	let savesTable = document.getElementById('savesTable');
	if (!savesTable) {
		return;
	}

	let runs = [];
	try {
		runs = JSON.parse(localStorage.getItem('gameRuns') || '[]');
	} catch (e) {
		runs = [];
	}

	runs = runs.map(function (run) {
		if (typeof run === 'number') {
			return { name: 'Unbekannt', elapsedSeconds: run };
		}
		if (run && typeof run.elapsedSeconds === 'number') {
			return {
				name: run.name || run.playerName || 'Unbekannt',
				elapsedSeconds: run.elapsedSeconds
			};
		}
		return null;
	}).filter(function (run) {
		return run && typeof run.elapsedSeconds === 'number' && !isNaN(run.elapsedSeconds);
	}).sort(function (a, b) {
		return a.elapsedSeconds - b.elapsedSeconds;
	});

	savesTable.innerHTML = '';

	if (runs.length === 0) {
		let empty = document.createElement('div');
		empty.className = 'saveRowEmpty';
		empty.textContent = 'Noch keine Speicherstände vorhanden.';
		savesTable.appendChild(empty);
		return;
	}

	runs.forEach(function (run, index) {
		let row = document.createElement('div');
		row.className = 'saveRow' + (index === 0 ? ' active' : '');

		let timeText = formatElapsedSeconds(run.elapsedSeconds);

		let nameSpan = document.createElement('span');
		nameSpan.textContent = run.name || 'Unbekannt';

		let timeSpan = document.createElement('span');
		timeSpan.textContent = timeText;

		row.appendChild(nameSpan);
		row.appendChild(timeSpan);
		savesTable.appendChild(row);
	});
}

function initSettingsPage() {
	if (document.body && document.body.id === 'settingsPage') {
		renderSavedRuns();
	}
}

async function loadRoomsData() {
	if (Array.isArray(rooms) && rooms.length > 0) {
		return true;
	}

	if (Array.isArray(window.rooms) && window.rooms.length > 0) {
		rooms = window.rooms;
		return true;
	}

	if (roomSwitchBtn) {
		roomSwitchBtn.textContent = "Raumstatus: keine Daten";
	}
	if (setupError) {
		setupError.textContent = "Raumdaten konnten nicht geladen werden.";
	}
	return false;
}

function getRequiredRoomInteractions(roomIndex) {
	if (roomIndex === 0) {
		return ["pinboard", "letter", "encryption", "window"];
	}
	return [];
}

function isRoomFullyExplored(roomIndex) {
	let requiredInteractions = getRequiredRoomInteractions(roomIndex);
	if (requiredInteractions.length === 0) {
		return true;
	}
	return requiredInteractions.every(function (interactionKey) {
		return hasRoomInteraction(roomIndex, interactionKey);
	});
}

function roomHasBothFinds(roomIndex) {
	let hasLetter = foundItems.some(function (item) { return item.key === "letter_" + roomIndex; });
	let hasPinboard = foundItems.some(function (item) { return item.key === "pinboard_" + roomIndex; });
	return hasLetter && hasPinboard;
}

function setHotspot(button, position) {
	if (!button || !position) {
		return;
	}

	button.style.top = position.top;
	button.style.left = position.left;
	button.style.width = position.width;
	button.style.height = position.height;
}

function updateBodyModalState() {
	let hasOpenModal = false;

	if (gameSetupModal && !gameSetupModal.classList.contains("gameModalHidden")) {
		hasOpenModal = true;
	}
	if (pinboardOverlay && !pinboardOverlay.classList.contains("pinboardOverlayHidden")) {
		hasOpenModal = true;
	}
	if (roomsModal && !roomsModal.classList.contains("gameModalHidden")) {
		hasOpenModal = true;
	}
	if (suspectsModal && !suspectsModal.classList.contains("gameModalHidden")) {
		hasOpenModal = true;
	}
	if (windowOverlay && !windowOverlay.classList.contains("windowOverlayHidden")) {
		hasOpenModal = true;
	}
	if (storyIntroModal && !storyIntroModal.classList.contains("gameModalHidden")) {
		hasOpenModal = true;
	}
	if (storyAfterFirstLevelModal && !storyAfterFirstLevelModal.classList.contains("gameModalHidden")) {
		hasOpenModal = true;
	}
	if (finalRevealCard && !finalRevealCard.classList.contains("letterNoteHidden")) {
		hasOpenModal = true;
	}
	if (resultModal && !resultModal.classList.contains("gameModalHidden")) {
		hasOpenModal = true;
	}

	document.body.classList.toggle("modalOpen", hasOpenModal);
}

function startFirstRoom() {
	if (!gameShell || !levelOne) {
		return;
	}

	startBackgroundMusic("gameMusic");

	if (storyIntroModal) {
		storyIntroModal.classList.add("gameModalHidden");
	}

	gameShell.classList.add("levelHidden");
	levelOne.classList.remove("levelHidden");
	currentRoomIndex = 0;
	roomInteractionFlags = {};
	firstLevelTransitionShown = false;
	vossRevealShown = false;
	applyRoom();
	renderInventory();
	renderRoomsGrid();

	// persist progress (basic)
	try {
		localStorage.setItem('foundItems', JSON.stringify(foundItems));
		localStorage.setItem('roomsState', JSON.stringify(rooms.map(function (r) { return { name: r.name, unlocked: !!r.unlocked, found: !!r.found }; })));
	} catch (e) { }
	updateBodyModalState();

	// initialize game stopwatch
	timerSeconds = 0;
	updateHUD();
	startTimer();
}

function applyRoom() {
	if (!roomScene || !roomSwitchBtn || rooms.length === 0) {
		return;
	}

	let room = rooms[currentRoomIndex];
	if (currentRoomIndex > 1) {
		room.found = true;
	}
	roomScene.style.backgroundImage = room.background;
	roomSwitchBtn.textContent = "Raumstatus: " + room.name;

	if (pinboardFocusBtn) {
		if (currentRoomIndex === 0) {
			setHotspot(pinboardFocusBtn, room.pinboard);
		}
		pinboardFocusBtn.style.display = currentRoomIndex === 0 ? "block" : "none";
		pinboardFocusBtn.style.pointerEvents = currentRoomIndex === 0 ? "auto" : "none";
	}
	if (deskLetterBtn) {
		if (currentRoomIndex === 0) {
			setHotspot(deskLetterBtn, room.letter);
		}
		deskLetterBtn.style.display = currentRoomIndex === 0 ? "block" : "none";
		deskLetterBtn.style.pointerEvents = currentRoomIndex === 0 ? "auto" : "none";
	}
	if (encryptionMachineBtn) {
		if (currentRoomIndex === 0) {
			setHotspot(encryptionMachineBtn, room.encryption);
		}
		encryptionMachineBtn.style.display = currentRoomIndex === 0 ? "block" : "none";
		encryptionMachineBtn.style.pointerEvents = currentRoomIndex === 0 ? "auto" : "none";
	}

	if (mapPieceButtons.length > 0) {
		mapPieceButtons.forEach(function (button) {
			if (button) {
				button.style.display = "none";
				button.style.pointerEvents = "none";
				button.classList.remove("mapPieceBoxVisible");
			}
		});
	}

	if (currentRoomIndex === 1 && Array.isArray(room.mapPieces)) {
		room.mapPieces.forEach(function (position, index) {
			let button = mapPieceButtons[index];
			if (!button) {
				return;
			}

			setHotspot(button, position);
			button.classList.add("mapPieceBoxVisible");
			button.style.display = "block";
			button.style.pointerEvents = "auto";
		});
	}

	if (windowInspectBtn) {
		if (currentRoomIndex === 0) {
			setHotspot(windowInspectBtn, {
				top: "22%",
				left: "4%",
				width: "30%",
				height: "40%"
			});
			windowInspectBtn.style.display = "block";
			windowInspectBtn.style.pointerEvents = "auto";
		} else {
			windowInspectBtn.style.display = "none";
			windowInspectBtn.style.pointerEvents = "none";
		}
	}

	if (finalClueBtn) {
		if (currentRoomIndex >= 2 && room.finalClue) {
			setHotspot(finalClueBtn, room.finalClue);
			finalClueBtn.style.display = "block";
			finalClueBtn.style.pointerEvents = "auto";
			finalClueBtn.classList.add('finalClueBoxVisible');
		} else {
			finalClueBtn.style.display = "none";
			finalClueBtn.style.pointerEvents = "none";
			finalClueBtn.classList.remove('finalClueBoxVisible');
		}
	}
}

function hideTransitionStory() {
	if (storyAfterFirstLevelModal) {
		storyAfterFirstLevelModal.classList.add("gameModalHidden");
	}
	updateBodyModalState();
}

function showTransitionStory() {
	if (!storyAfterFirstLevelModal) {
		return;
	}

	playAudio("transitionSfx");
	storyAfterFirstLevelModal.classList.remove("gameModalHidden");
	updateBodyModalState();
}

function startSecondRoom() {
	hideTransitionStory();
	playAudio("modalCloseSfx");
	currentRoomIndex = 1;
	applyRoom();
	renderInventory();
	renderRoomsGrid();
	updateBodyModalState();
}

function showLetterText(text) {
	if (!letterNoteCard || !letterNoteText) {
		return;
	}

	playAudio("inspectSfx");
	letterNoteText.textContent = text;
	letterNoteCard.classList.remove("letterNoteHidden");
	playAudio("modalOpenSfx");
}

function closeLetterText() {
	if (letterNoteCard) {
		letterNoteCard.classList.add("letterNoteHidden");
		playAudio("modalCloseSfx");
	}
}

function showHint(text) {
	if (!hintCard || !hintText) {
		return;
	}

	playAudio("inspectSfx");
	if (text) {
		hintText.textContent = text;
	}
	hintCard.classList.remove("letterNoteHidden");
	playAudio("modalOpenSfx");
}

function closeHintText() {
	if (hintCard) {
		hintCard.classList.add("letterNoteHidden");
		playAudio("modalCloseSfx");
	}
}

function showFinalReveal() {
	if (!finalRevealCard || !finalRevealText) {
		return;
	}

	playAudio("inspectSfx");
	let room = rooms[currentRoomIndex];
	let revealText = "Die letzte Spur ist eindeutig: Elias Blackwood hat den Fall inszeniert.";
	let accuseLabel = "Blackwood beschuldigen";
	if (room && room.name) {
		if (currentRoomIndex === 2) {
			revealText = "Im Blackwood Apartment liegt der Beweis offen vor dir. Alles führt zu Elias Blackwood.";
			selectedSuspect = guiltySuspect;
			accuseLabel = "Blackwood beschuldigen";
		} else if (currentRoomIndex === 3) {
			revealText = "Voss' Raum zeigt dir die Täuschung: eigentlich führt alles zu Elias Blackwood, aber deine Spur bleibt bei Mara Voss. Du kannst nur sie festnehmen.";
			selectedSuspect = "Mara Voss";
			accuseLabel = "Mara Voss festnehmen";
		}
	}

	updateSuspectSelectionUi();
	finalAccuseMode = true;
	finalRevealText.textContent = revealText;
	if (finalRevealAccuseBtn) {
		finalRevealAccuseBtn.textContent = accuseLabel;
		// hide accuse button in specific final rooms (Blackwood and Voss)
		if (currentRoomIndex === 2 || currentRoomIndex === 3) {
			finalRevealAccuseBtn.style.display = 'none';
		} else {
			finalRevealAccuseBtn.style.display = '';
		}
	}
	finalRevealCard.classList.remove("letterNoteHidden");
	playAudio("modalOpenSfx");
	updateBodyModalState();
}

function closeFinalRevealCard() {
	if (finalRevealCard) {
		finalRevealCard.classList.add("letterNoteHidden");
		playAudio("modalCloseSfx");
		updateBodyModalState();
	}
}

function showMap() {
	if (!mapOverlay) {
		return;
	}

	playAudio("inspectSfx");
	mapOverlay.classList.remove("mapOverlayHidden");
	playAudio("modalOpenSfx");
	updateBodyModalState();
}

function closeMapText() {
	if (mapOverlay) {
		mapOverlay.classList.add("mapOverlayHidden");
		playAudio("modalCloseSfx");
		updateBodyModalState();
	}
}

function getCipherMaskedProgress() {
	let solvedPart = cipherTarget.slice(0, cipherCurrentIndex).split("");
	let hiddenPart = new Array(cipherTarget.length - cipherCurrentIndex).fill("_");
	return solvedPart.concat(hiddenPart).join(" ");
}

function updateCipherProgressText() {
	if (!cipherProgress) {
		return;
	}

	cipherProgress.textContent = "Fortschritt: " + getCipherMaskedProgress();
}

function resetCipherPuzzle(message) {
	cipherCurrentIndex = 0;
	cipherSolved = false;
	playAudio("modalCloseSfx");

	if (cipherGrid) {
		let buttons = cipherGrid.querySelectorAll(".cipherLetterBtn");
		buttons.forEach(function (button) {
			button.disabled = false;
			button.classList.remove("cipherLetterUsed");
		});
	}

	updateCipherProgressText();
	if (cipherFeedback) {
		cipherFeedback.textContent = message || "Zu viele Zeichen. Achte auf ein bekanntes Muster.";
	}
}

function solveCipherPuzzle() {
	cipherSolved = true;
	playAudio("cipherSolveSfx");
	if (cipherFeedback) {
		cipherFeedback.textContent = "Die Maschine formt den Namen BLACKWOOD. Das wirkt fast zu sauber - vielleicht hat Voss diese Spur gelegt.";
	}
	if (cipherGrid) {
		let buttons = cipherGrid.querySelectorAll(".cipherLetterBtn");
		buttons.forEach(function (button) {
			button.disabled = true;
		});
	}

	// reward solving the cipher
	addScore(200);
}

function handleCipherLetterClick(button) {
	if (!button || cipherSolved) {
		return;
	}

	let letter = button.getAttribute("data-letter");
	let expected = cipherTarget.charAt(cipherCurrentIndex);

	if (letter !== expected) {
		resetCipherPuzzle("Falsche Reihenfolge. Vielleicht soll dich genau das verwirren.");
		return;
	}

	button.disabled = true;
	button.classList.add("cipherLetterUsed");
	cipherCurrentIndex += 1;
	updateCipherProgressText();

	if (cipherCurrentIndex >= cipherTarget.length) {
		solveCipherPuzzle();
	} else if (cipherFeedback) {
		cipherFeedback.textContent = "Weiter so. Die Reihenfolge entscheidet.";
	}
}

function renderCipherGrid() {
	if (!cipherGrid) {
		return;
	}

	cipherGrid.innerHTML = "";
	cipherLetters.forEach(function (letter) {
		let button = document.createElement("button");
		button.type = "button";
		button.className = "cipherLetterBtn";
		button.textContent = letter;
		button.setAttribute("data-letter", letter);
		button.addEventListener("click", function () {
			handleCipherLetterClick(button);
		});
		cipherGrid.appendChild(button);
	});

	updateCipherProgressText();
}

function updateSuspectSelectionUi() {
	if (suspectPickButtons.length === 0) {
		return;
	}

	suspectPickButtons.forEach(function (button) {
		let suspectName = button.getAttribute("data-suspect");
		button.classList.toggle("suspectSelected", suspectName === selectedSuspect);
	});
}

function chooseSuspect(suspectName) {
	if (!suspectName) return;
	selectedSuspect = suspectName;

	// find suspect apartment indices
	var blackIndex = rooms.findIndex(function (r) { return r.name && r.name.toLowerCase().includes('blackwood'); });
	var vossIndex = rooms.findIndex(function (r) { return r.name && r.name.toLowerCase().includes('voss'); });

	// If Blackwood chosen, ensure Voss locked; if Voss chosen, ensure Blackwood locked
	if (suspectName.toLowerCase().includes('blackwood')) {
		if (blackIndex !== -1) rooms[blackIndex].unlocked = true;
		if (vossIndex !== -1) rooms[vossIndex].unlocked = false;
	} else if (suspectName.toLowerCase().includes('voss')) {
		if (vossIndex !== -1) rooms[vossIndex].unlocked = true;
		if (blackIndex !== -1) rooms[blackIndex].unlocked = false;
	}

	updateSuspectSelectionUi();
	renderRoomsGrid();
}

function countMapPiecesFound() {
	return foundItems.filter(function (item) {
		return item.key.indexOf("map_piece_") === 0;
	}).length;
}

function getInventoryItemType(itemKey) {
	if (typeof itemKey !== "string") {
		return "";
	}

	if (itemKey.indexOf("map_piece_") === 0) {
		return "map_piece";
	}
	if (itemKey.indexOf("letter_") === 0) {
		return "letter";
	}
	if (itemKey.indexOf("pinboard_") === 0) {
		return "pinboard";
	}

	return "";
}

function getInventoryItemActionLabel(item) {
	let itemType = item ? getInventoryItemType(item.key) : "";

	if (itemType === "map_piece") {
		return countMapPiecesFound() >= mapPieceButtons.filter(Boolean).length ? "Karte öffnen" : "Fundort ansehen";
	}
	if (itemType === "letter") {
		return "Brief lesen";
	}
	if (itemType === "pinboard") {
		return "Pinnwand öffnen";
	}

	return "Benutzen";
}

function focusInventorySourceRoom(item) {
	if (!item || typeof item.sourceRoomIndex !== "number" || !rooms[item.sourceRoomIndex]) {
		return false;
	}

	currentRoomIndex = item.sourceRoomIndex;
	applyRoom();
	renderRoomsGrid();
	return true;
}

function useInventoryItem(item) {
	if (!item) {
		return;
	}

	let itemType = getInventoryItemType(item.key);
	focusInventorySourceRoom(item);

	if (inventoryPanel) {
		inventoryPanel.classList.add("inventoryHidden");
	}

	if (itemType === "letter") {
		markRoomInteraction(item.sourceRoomIndex, "letter");
		selectedSuspect = "Mara Voss";
		updateSuspectSelectionUi();
		showLetterText("Mara Voss wurde in Thorns Labor gesehen. Sie muss etwas mit dem Verschwinden zu tun haben.");
	} else if (itemType === "pinboard") {
		markRoomInteraction(item.sourceRoomIndex, "pinboard");
		if (pinboardOverlay) {
			pinboardOverlay.classList.remove("pinboardOverlayHidden");
			playAudio("modalOpenSfx");
		}
	} else if (itemType === "map_piece") {
		let totalPieces = mapPieceButtons.filter(Boolean).length;
		if (countMapPiecesFound() >= totalPieces) {
			showMap();
		} else {
			showHint("Du hast " + countMapPiecesFound() + " von " + totalPieces + " Kartenteilen gefunden. Mehr fehlt noch.");
		}
	}

	updateBodyModalState();
	renderInventory();
}

function addFoundItem(itemKey, title, sourceRoomIndex, shouldMarkRoomFound) {
	if (!rooms[sourceRoomIndex]) {
		return;
	}

	if (foundItems.some(function (item) { return item.key === itemKey; })) {
		return;
	}

	foundItems.push({
		key: itemKey,
		title: title,
		roomName: rooms[sourceRoomIndex].name,
		sourceRoomIndex: sourceRoomIndex,
		itemType: getInventoryItemType(itemKey)
	});

	playAudio("foundItemSfx");
	// play backpacking sound for items that go into the inventory
	playAudio("backpackSfx");

	// reward points for finding a new item
	addScore(100);

	if (shouldMarkRoomFound !== false) {
		rooms[sourceRoomIndex].found = true;
	}
	if (roomHasBothFinds(sourceRoomIndex) && sourceRoomIndex < rooms.length - 1) {
		rooms[sourceRoomIndex + 1].unlocked = true;
	}

	if (sourceRoomIndex === 0 && isRoomFullyExplored(0) && !firstLevelTransitionShown) {
		firstLevelTransitionShown = true;
		showTransitionStory();
	}

	renderInventory();
	renderRoomsGrid();

	// check if all levels are completed -> allow final accusation
	checkAllLevelsCompleted();
}

function renderInventory() {
	if (!inventoryFoundList || !inventoryEmptyText) {
		return;
	}

	inventoryFoundList.innerHTML = "";
	inventoryEmptyText.style.display = foundItems.length === 0 ? "block" : "none";

	foundItems.forEach(function (item) {
		let row = document.createElement("div");
		row.className = "inventoryFoundItem";

		let textWrap = document.createElement("div");
		textWrap.className = "inventoryFoundItemText";

		let titleLine = document.createElement("strong");
		titleLine.textContent = item.title;

		let roomLine = document.createElement("span");
		roomLine.textContent = item.roomName;

		textWrap.appendChild(titleLine);
		textWrap.appendChild(roomLine);

		let useButton = document.createElement("button");
		useButton.type = "button";
		useButton.className = "inventoryItemUseBtn";
		useButton.textContent = getInventoryItemActionLabel(item);
		useButton.addEventListener("click", function () {
			useInventoryItem(item);
		});

		row.appendChild(textWrap);
		row.appendChild(useButton);
		inventoryFoundList.appendChild(row);
	});
}

function renderRoomsGrid() {
	if (!roomsGrid) {
		return;
	}

	roomsGrid.innerHTML = "";
	if (rooms.length === 0) {
		let info = document.createElement("p");
		info.className = "roomGridState";
		info.textContent = "Keine Raumdaten vorhanden.";
		roomsGrid.appendChild(info);
		return;
	}

	rooms.forEach(function (room, index) {
		let cell = document.createElement("div");
		cell.className = "roomGridItem";

		let stateText = "Gesperrt";
		if (room.unlocked) {
			stateText = room.found ? "Gefunden" : "Untersuchen";
		}

		if (!room.unlocked) {
			cell.classList.add("roomGridLocked");
		} else {
			cell.classList.add("roomGridEnterable");
			cell.setAttribute("role", "button");
			cell.setAttribute("tabindex", "0");
			cell.addEventListener("click", function () {
				currentRoomIndex = index;
				applyRoom();
				closeRoomsModal();
			});
			cell.addEventListener("keydown", function (event) {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					currentRoomIndex = index;
					applyRoom();
					closeRoomsModal();
				}
			});
		}
		if (room.found) {
			cell.classList.add("roomGridFound");
		}
		if (index === currentRoomIndex) {
			cell.classList.add("roomGridCurrent");
		}

		let title = document.createElement("p");
		title.className = "roomGridTitle";
		title.textContent = room.name;

		let state = document.createElement("p");
		state.className = "roomGridState";
		state.textContent = stateText;

		cell.appendChild(title);
		cell.appendChild(state);
		roomsGrid.appendChild(cell);
	});
}

function openRoomsModal() {
	if (!roomsModal) {
		return;
	}

	renderRoomsGrid();
	roomsModal.classList.remove("gameModalHidden");
	playAudio("modalOpenSfx");
	updateBodyModalState();
}

function closeRoomsModal() {
	if (!roomsModal) {
		return;
	}

	roomsModal.classList.add("gameModalHidden");
	playAudio("modalCloseSfx");
	updateBodyModalState();
}

function openSuspectsModal() {
	if (!suspectsModal) {
		return;
	}

	updateSuspectSelectionUi();
	suspectsModal.classList.remove("gameModalHidden");
	playAudio("modalOpenSfx");
	updateBodyModalState();
}

function closeSuspectsModal() {
	if (!suspectsModal) {
		return;
	}

	suspectsModal.classList.add("gameModalHidden");
	playAudio("modalCloseSfx");
	updateBodyModalState();
}

if (gameSetupModal && gameSetupForm && detectiveNameInput && caseStartBtn && detectiveGreeting && setupError) {
	gameSetupModal.classList.remove("gameModalHidden");
	updateBodyModalState();

	gameSetupForm.addEventListener("submit", function (event) {
		event.preventDefault();

		let playerName = detectiveNameInput.value.trim();
		if (!playerName) {
			setupError.textContent = "Gib deinen Namen ein";
			return;
		}

		setupError.textContent = "";
		detectiveName = playerName;
		detectiveGreeting.textContent = "Willkommen, " + playerName + ". Dein Fall wartet.";
		caseStartBtn.disabled = false;
		gameSetupModal.classList.add("gameModalHidden");
		updateBodyModalState();
	});

	caseStartBtn.addEventListener("click", async function () {
		if (caseStartBtn.disabled) {
			return;
		}

		caseStartBtn.textContent = "Abschnitt 1 gestartet";
		caseStartBtn.disabled = true;

		let roomsLoaded = await loadRoomsData();
		if (!roomsLoaded) {
			caseStartBtn.textContent = "Fall starten";
			caseStartBtn.disabled = false;
			return;
		}

		if (storyIntroModal) {
			storyIntroModal.classList.remove("gameModalHidden");
			updateBodyModalState();
		} else {
			startFirstRoom();
		}
	});
}

if (startFirstRoomBtn) {
	startFirstRoomBtn.addEventListener("click", function () {
		startFirstRoom();
	});
}

if (startSecondRoomBtn) {
	startSecondRoomBtn.addEventListener("click", function () {
		startSecondRoom();
	});
}

if (roomSwitchBtn) {
	roomSwitchBtn.addEventListener("click", function () {
		openRoomsModal();
	});
}

if (showSuspectsBtn) {
	showSuspectsBtn.addEventListener("click", function () {
		openSuspectsModal();
	});
}

if (closeRoomsBtn) {
	closeRoomsBtn.addEventListener("click", function () {
		closeRoomsModal();
	});
}

if (pinboardFocusBtn) {
	pinboardFocusBtn.addEventListener("click", function () {
		if (!pinboardOverlay) {
			return;
		}

		markRoomInteraction(currentRoomIndex, 'pinboard');
		pinboardOverlay.classList.remove("pinboardOverlayHidden");
		addFoundItem("pinboard_" + currentRoomIndex, "Pinnwand untersucht", currentRoomIndex);
		updateBodyModalState();
	});
}

if (pinboardCloseBtn && pinboardOverlay) {
	pinboardCloseBtn.addEventListener("click", function () {
		pinboardOverlay.classList.add("pinboardOverlayHidden");
		updateBodyModalState();
	});
}

if (windowInspectBtn) {
	windowInspectBtn.addEventListener("click", function () {
		if (currentRoomIndex !== 0 || !windowOverlay) {
			return;
		}

		markRoomInteraction(0, 'window');
		windowOverlay.classList.remove("windowOverlayHidden");
		updateBodyModalState();
	});
}

mapPieceButtons.forEach(function (button, index) {
	if (!button) {
		return;
	}

	button.addEventListener("click", function () {
		let itemKey = "map_piece_" + index;
		addFoundItem(itemKey, "Kartenteil " + (index + 1), currentRoomIndex, false);
		button.style.display = "none";
		button.style.pointerEvents = "none";
		button.classList.remove("mapPieceBoxVisible");
		if (countMapPiecesFound() === mapPieceButtons.filter(Boolean).length) {
			if (rooms[currentRoomIndex]) {
				rooms[currentRoomIndex].found = true;
			}
			renderRoomsGrid();
			// Only show map in Level 2 (Apartment), not in other rooms
			if (currentRoomIndex === 1) {
				showMap();
			} else {
				showHint("Die Karte nimmt Form an. Etwas daran passt nicht zusammen.");
			}
		}
	});
});

if (windowCloseBtn && windowOverlay) {
	windowCloseBtn.addEventListener("click", function () {
		windowOverlay.classList.add("windowOverlayHidden");
		updateBodyModalState();
	});
}

if (mapCloseBtn && mapOverlay) {
	mapCloseBtn.addEventListener("click", function () {
		closeMapText();
	});
}

if (deskLetterBtn) {
	deskLetterBtn.addEventListener("click", function () {
		if (!rooms[currentRoomIndex]) {
			return;
		}

		markRoomInteraction(currentRoomIndex, 'letter');
		selectedSuspect = "Mara Voss";
		updateSuspectSelectionUi();
		showLetterText("Mara Voss wurde in Thorns Labor gesehen. Sie muss etwas mit dem Verschwinden zu tun haben.");
		addFoundItem("letter_" + currentRoomIndex, "Brief (falsche Fährte: Mara Voss)", currentRoomIndex);
	});
}

if (closeLetterNote) {
	closeLetterNote.addEventListener("click", function () {
		closeLetterText();
	});
}

if (closeSuspectsBtn) {
	closeSuspectsBtn.addEventListener("click", function () {
		closeSuspectsModal();
	});
}

if (suspectPickButtons.length > 0) {
	suspectPickButtons.forEach(function (button) {
		button.addEventListener("click", function () {
			var suspect = button.getAttribute("data-suspect");
			chooseSuspect(suspect);
			if (!finalAccuseMode) {
				closeSuspectsModal();
			}
		});
	});
}

if (inventoryToggle && inventoryPanel) {
	inventoryToggle.addEventListener("click", function () {
		inventoryPanel.classList.toggle("inventoryHidden");
	});
}

if (encryptionMachineBtn) {
	encryptionMachineBtn.addEventListener("click", function () {
		markRoomInteraction(0, 'encryption');
		showHint();
	});
}

if (closeHint) {
	closeHint.addEventListener("click", function () {
		closeHintText();
	});
}

if (finalClueBtn) {
	finalClueBtn.addEventListener("click", function () {
		showFinalReveal();
	});
}

if (finalRevealAccuseBtn) {
	finalRevealAccuseBtn.addEventListener("click", function () {
		if (currentRoomIndex === 3) {
			selectedSuspect = "Mara Voss";
		} else {
			selectedSuspect = guiltySuspect;
		}
		updateSuspectSelectionUi();
		closeFinalRevealCard();
		finalizeAccusation();
	});
}

if (closeFinalReveal) {
	closeFinalReveal.addEventListener("click", function () {
		closeFinalRevealCard();
	});
}

if (resetCipher) {
	resetCipher.addEventListener("click", function () {
		resetCipherPuzzle("Neu gestartet. Suche einen Nachnamen unter den Verdaechtigen.");
	});
}

if (mapVossBtn) {
	mapVossBtn.addEventListener("click", function () {
		closeMapText();
		// Upper box: navigate to Voss' apartment
		chooseSuspect("Mara Voss");
		var vossIndex = rooms.findIndex(function (r) { return r.name && r.name.toLowerCase().includes('voss'); });
		if (vossIndex === -1) {
			if (suspectsModal) {
				suspectsModal.classList.remove('gameModalHidden');
				updateBodyModalState();
			}
			return;
		}
		currentRoomIndex = vossIndex;
		applyRoom();
		renderInventory();
		renderRoomsGrid();
		updateBodyModalState();
	});
}

if (mapBlackwoodBtn) {
	mapBlackwoodBtn.addEventListener("click", function () {
		closeMapText();
		// Lower box: navigate to Blackwood's apartment
		chooseSuspect("Elias Blackwood");
		var blackIndex = rooms.findIndex(function (r) { return r.name && r.name.toLowerCase().includes('blackwood'); });
		if (blackIndex === -1) {
			if (suspectsModal) {
				suspectsModal.classList.remove('gameModalHidden');
				updateBodyModalState();
			}
			return;
		}
		currentRoomIndex = blackIndex;
		applyRoom();
		renderInventory();
		renderRoomsGrid();
		updateBodyModalState();
	});
}

// Map trace button hover tooltips
let mapTooltip = document.getElementById("mapTooltip");

if (mapVossBtn && mapTooltip) {
	mapVossBtn.addEventListener("mouseenter", function () {
		mapTooltip.textContent = "Voss";
		mapTooltip.classList.add("visible");
	});
	mapVossBtn.addEventListener("mouseleave", function () {
		mapTooltip.classList.remove("visible");
	});
	mapVossBtn.addEventListener("mousemove", function (e) {
		mapTooltip.style.left = (e.clientX + 15) + "px";
		mapTooltip.style.top = (e.clientY + 15) + "px";
	});
}

if (mapBlackwoodBtn && mapTooltip) {
	mapBlackwoodBtn.addEventListener("mouseenter", function () {
		mapTooltip.textContent = "Blackwood";
		mapTooltip.classList.add("visible");
	});
	mapBlackwoodBtn.addEventListener("mouseleave", function () {
		mapTooltip.classList.remove("visible");
	});
	mapBlackwoodBtn.addEventListener("mousemove", function (e) {
		mapTooltip.style.left = (e.clientX + 15) + "px";
		mapTooltip.style.top = (e.clientY + 15) + "px";
	});
}

renderCipherGrid();

// HUD initial update
updateHUD();
initSettingsPage();
if (document.readyState !== 'loading') {
	initSettingsPage();
}
window.addEventListener('DOMContentLoaded', initSettingsPage);
window.addEventListener('pageshow', initSettingsPage);

function finalizeAccusation() {
	if (!selectedSuspect) {
		showHint('Wähle zuerst einen Verdächtigen.');
		return;
	}

	playAudio("accuseSfx");
	closeSuspectsModal();
	if (selectedSuspect === guiltySuspect) {
		handleGameOver(true, 'Deine Anklage war korrekt! Der wahre Täter wurde gestellt.');
	} else {
		handleGameOver(false, 'Falsche Beschuldigung: ' + selectedSuspect + '. Der Fall bleibt ungelöst.');
	}
}

// HUD accuse button removed: feature disabled per design

// Finalize accusation button in suspects modal
let finalizeAccuseBtnEl = document.getElementById('finalizeAccuseBtn');
if (finalizeAccuseBtnEl) {
	finalizeAccuseBtnEl.addEventListener('click', function () {
		finalizeAccusation();
	});
}

// Restart button handler
let restartBtn = document.getElementById('restartBtn');
if (restartBtn) {
	restartBtn.addEventListener('click', function () {
		try { location.reload(); } catch (e) { window.location.href = window.location.href; }
	});
}

// Ensure audio system is initialized on pages with audio (initialized later)

// -- Start Menu: anime.js animations (entry, hover, click, title loop)
function initMenuWithAnime() {
	if (!window.anime) {
		console.warn('anime.js not found. Menu animations skipped.');
		return;
	}

	var title = document.getElementById('mainTitle');
	var btns = Array.prototype.slice.call(document.querySelectorAll('#btnGrid a'));
	var arrow = document.querySelector('#scrollArrow img');

	if (!title || btns.length === 0) return;

	// Timeline: first title, then buttons (staggered)
	var tl = anime.timeline({
		autoplay: true,
		easing: 'easeInOutQuad'
	});

	// Title entry: from below (translateY positive -> up), fade in
	tl.add({
		targets: title,
		translateY: [60, 0],
		opacity: [0, 1],
		duration: 700,
		easing: 'easeInOutQuad'
	})

	// Buttons: staggered slide up + fade
	.add({
		targets: btns,
		translateY: [40, 0],
		opacity: [0, 1],
		duration: 600,
		delay: anime.stagger(120), // stagger
		easing: 'easeInOutQuad'
	}, '-=250')

	// arrow appear
	.add({ targets: arrow, translateY: [20,0], opacity: [0,1], duration: 500, easing: 'easeInOutQuad' }, '-=350');

	// Title subtle pulse + tiny rotation loop
	anime({
		targets: title,
		scale: [1, 1.03],
		rotate: [-0.5, 0.5],
		direction: 'alternate',
		loop: true,
		duration: 2400,
		easing: 'easeInOutQuad',
		delay: 1200
	});

	// Button hover: scale up slightly (smooth easing)
	btns.forEach(function (btn) {
		btn.style.transformOrigin = 'center center';
		btn.addEventListener('mouseenter', function () {
			anime.remove(btn);
			anime({ targets: btn, scale: 1.05, duration: 220, easing: 'easeOutQuad' });
		});
		btn.addEventListener('mouseleave', function () {
			anime.remove(btn);
			anime({ targets: btn, scale: 1, duration: 260, easing: 'easeOutQuad' });
		});

		// Click: short bounce using easeOutElastic
		btn.addEventListener('mousedown', function (ev) {
			anime.remove(btn);
			anime({ targets: btn, scale: 0.92, duration: 120, easing: 'easeOutQuad' });
		});
		btn.addEventListener('mouseup', function (ev) {
			anime.remove(btn);
			anime({ targets: btn, scale: 1.08, duration: 450, easing: 'easeOutElastic(1, .6)' });
			// return to normal size after bounce
			setTimeout(function () {
				anime({ targets: btn, scale: 1, duration: 320, easing: 'easeOutQuad' });
			}, 420);
		});
	});
}

// Initialize menu animations when on index (mainBox exists)
if (document.getElementById('mainBox')) {
	function ensureAnimeAndInit() {
		if (window.anime) { initMenuWithAnime(); return; }
		var s = document.createElement('script');
		s.src = 'https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js';
		s.onload = function () { initMenuWithAnime(); };
		s.onerror = function () { console.warn('anime.js failed to load from CDN'); };
		document.head.appendChild(s);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', ensureAnimeAndInit);
	} else {
		ensureAnimeAndInit();
	}
}

// Universal button animations for game pages
function initGameButtonAnimations() {
	if (!window.anime) return;
	
	var buttonSelectors = [
		'.caseStartButton',
		'.roomSwitchBtn',
		'.suspectPickBtn',
		'.pinboardCloseBtn',
		'.mapTraceBtn',
		'.finalClueBtn',
		'.languageButton',
		'.saveRow',
		'.inventoryToggle'
	];
	
	buttonSelectors.forEach(function (selector) {
		var buttons = document.querySelectorAll(selector);
		buttons.forEach(function (btn) {
			btn.style.transformOrigin = 'center center';
			
			// Hover: scale up
			btn.addEventListener('mouseenter', function () {
				anime.remove(btn);
				anime({
					targets: btn,
					scale: 1.08,
					duration: 280,
					easing: 'easeOutQuad'
				});
			});
			
			// Hover out: back to normal
			btn.addEventListener('mouseleave', function () {
				anime.remove(btn);
				anime({
					targets: btn,
					scale: 1,
					duration: 300,
					easing: 'easeOutQuad'
				});
			});
			
			// Click: bounce effect (easeOutElastic)
			btn.addEventListener('mousedown', function () {
				anime.remove(btn);
				anime({
					targets: btn,
					scale: 0.88,
					duration: 100,
					easing: 'easeOutQuad'
				});
			});
			
			btn.addEventListener('mouseup', function () {
				anime.remove(btn);
				anime({
					targets: btn,
					scale: 1.12,
					duration: 400,
					easing: 'easeOutElastic(1, .65)'
				});
				setTimeout(function () {
					anime({
						targets: btn,
						scale: 1,
						duration: 300,
						easing: 'easeOutQuad'
					});
				}, 380);
			});
		});
	});
}

// Initialize game button animations on game pages
if (document.getElementById('gameBody') || document.body.id === 'rulesCompactPage' || document.body.id === 'settingsPage') {
	function ensureAnimeForGameButtons() {
		if (window.anime) { initGameButtonAnimations(); return; }
		var s = document.createElement('script');
		s.src = 'https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js';
		s.onload = function () { initGameButtonAnimations(); };
		s.onerror = function () { console.warn('anime.js failed to load'); };
		document.head.appendChild(s);
	}
	
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', ensureAnimeForGameButtons);
	} else {
		ensureAnimeForGameButtons();
	}
}

initAudioSystem();

