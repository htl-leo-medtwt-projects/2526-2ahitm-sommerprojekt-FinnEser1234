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

let currentRoomIndex = 0;
let foundItems = [];
let selectedSuspect = null;
let firstLevelTransitionShown = false;

let cipherTarget = "BLACKWOOD";
let cipherLetters = ["B", "A", "R", "L", "M", "Q", "A", "C", "K", "T", "W", "Y", "O", "O", "D", "N", "E", "S"];
let cipherCurrentIndex = 0;
let cipherSolved = false;
let rooms = window.rooms || [];

// Game state: score, timer, lives
let score = 0;
let timerSeconds = 300; // default 5 minutes
let timerInterval = null;
let lives = 3;
let finalAccuseMode = false;
const guiltySuspect = "Elias Blackwood";

function formatTime(sec) {
	let m = Math.floor(sec / 60);
	let s = sec % 60;
	return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

function updateHUD() {
	let scoreDisplay = document.getElementById('scoreDisplay');
	let timerDisplay = document.getElementById('timerDisplay');
	let livesDisplay = document.getElementById('livesDisplay');
	if (scoreDisplay) scoreDisplay.textContent = 'Punkte: ' + score;
	if (timerDisplay) timerDisplay.textContent = 'Zeit: ' + formatTime(timerSeconds);
	if (livesDisplay) livesDisplay.textContent = 'Lives: ' + lives;
}

function startTimer() {
	stopTimer();
	timerInterval = setInterval(function () {
		timerSeconds -= 1;
		updateHUD();
		if (timerSeconds <= 0) {
			stopTimer();
			handleTimeOut();
		}
	}, 1000);
}

function stopTimer() {
	if (timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
	}
}

function addScore(amount) {
	score += amount;
	updateHUD();
}

function loseLife(amount) {
	lives -= (amount || 1);
	if (lives < 0) lives = 0;
	updateHUD();
	if (lives <= 0) {
		handleGameOver(false, 'Du hast alle Lives verloren.');
	}
}

function handleTimeOut() {
	handleGameOver(false, 'Die Zeit ist abgelaufen. Der Fall bleibt ungelöst.');
}

function handleGameOver(won, message) {
	stopTimer();
	finalAccuseMode = false;
	let resultModal = document.getElementById('resultModal');
	let resultTitle = document.getElementById('resultTitle');
	let resultText = document.getElementById('resultText');
	let resultScoreText = document.getElementById('resultScoreText');
	if (resultTitle) resultTitle.textContent = won ? 'Du hast gewonnen!' : 'Fall gescheitert';
	if (resultText) resultText.textContent = message || (won ? 'Du hast den wahren Täter gefunden.' : 'Leider falsch.');
	if (resultScoreText) resultScoreText.textContent = 'Punkte: ' + score;
	if (resultModal) {
		resultModal.classList.remove('gameModalHidden');
		updateBodyModalState();
	}

	// save highscore
	try {
		let best = parseInt(localStorage.getItem('bestScore') || '0', 10);
		if (score > best) {
			localStorage.setItem('bestScore', String(score));
		}
		localStorage.setItem('lastResult', JSON.stringify({ won: won, score: score, suspect: selectedSuspect || null, time: Date.now() }));
	} catch (e) { }
}

function checkAllLevelsCompleted() {
	if (!Array.isArray(rooms) || rooms.length === 0) return false;
	let allFound = rooms.every(function (r) { return !!r.found; });
	if (allFound) {
		// prompt final accusation
		finalAccuseMode = true;
		openSuspectsModal();
	}
	return allFound;
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

	document.body.classList.toggle("modalOpen", hasOpenModal);
}

function startFirstRoom() {
	if (!gameShell || !levelOne) {
		return;
	}

	if (storyIntroModal) {
		storyIntroModal.classList.add("gameModalHidden");
	}

	gameShell.classList.add("levelHidden");
	levelOne.classList.remove("levelHidden");
	currentRoomIndex = 0;
	applyRoom();
	renderInventory();
	renderRoomsGrid();

	// persist progress (basic)
	try {
		localStorage.setItem('foundItems', JSON.stringify(foundItems));
		localStorage.setItem('roomsState', JSON.stringify(rooms.map(function (r) { return { name: r.name, unlocked: !!r.unlocked, found: !!r.found }; })));
	} catch (e) { }
	updateBodyModalState();

	// initialize game state (score, timer, lives)
	score = 0;
	timerSeconds = 300;
	lives = 3;
	updateHUD();
	startTimer();
}

function applyRoom() {
	if (!roomScene || !roomSwitchBtn || rooms.length === 0) {
		return;
	}

	let room = rooms[currentRoomIndex];
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

	storyAfterFirstLevelModal.classList.remove("gameModalHidden");
	updateBodyModalState();
}

function startSecondRoom() {
	hideTransitionStory();
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

	letterNoteText.textContent = text;
	letterNoteCard.classList.remove("letterNoteHidden");
}

function closeLetterText() {
	if (letterNoteCard) {
		letterNoteCard.classList.add("letterNoteHidden");
	}
}

function showHint(text) {
	if (!hintCard || !hintText) {
		return;
	}

	if (text) {
		hintText.textContent = text;
	}
	hintCard.classList.remove("letterNoteHidden");
}

function closeHintText() {
	if (hintCard) {
		hintCard.classList.add("letterNoteHidden");
	}
}

function showMap() {
	if (!mapOverlay) {
		return;
	}
	mapOverlay.classList.remove("mapOverlayHidden");
	updateBodyModalState();
}

function closeMapText() {
	if (mapOverlay) {
		mapOverlay.classList.add("mapOverlayHidden");
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
		roomName: rooms[sourceRoomIndex].name
	});

	// reward points for finding a new item
	addScore(100);

	if (shouldMarkRoomFound !== false) {
		rooms[sourceRoomIndex].found = true;
	}
	if (roomHasBothFinds(sourceRoomIndex) && sourceRoomIndex < rooms.length - 1) {
		rooms[sourceRoomIndex + 1].unlocked = true;
	}

	if (sourceRoomIndex === 0 && roomHasBothFinds(0) && !firstLevelTransitionShown) {
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
		row.textContent = item.title + " - " + item.roomName;
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
	updateBodyModalState();
}

function closeRoomsModal() {
	if (!roomsModal) {
		return;
	}

	roomsModal.classList.add("gameModalHidden");
	updateBodyModalState();
}

function openSuspectsModal() {
	if (!suspectsModal) {
		return;
	}

	updateSuspectSelectionUi();
	suspectsModal.classList.remove("gameModalHidden");
	updateBodyModalState();
}

function closeSuspectsModal() {
	if (!suspectsModal) {
		return;
	}

	suspectsModal.classList.add("gameModalHidden");
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
			closeSuspectsModal();
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
		showHint();
	});
}

if (closeHint) {
	closeHint.addEventListener("click", function () {
		closeHintText();
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
		// Upper box: navigate to Blackwood's apartment (per user request)
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

if (mapBlackwoodBtn) {
	mapBlackwoodBtn.addEventListener("click", function () {
		closeMapText();
		// Lower box: navigate to Voss's apartment (per user request)
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

renderCipherGrid();

// HUD initial update
updateHUD();

function finalizeAccusation() {
	if (!selectedSuspect) {
		showHint('Wähle zuerst einen Verdächtigen.');
		return;
	}
	closeSuspectsModal();
	if (selectedSuspect === guiltySuspect) {
		handleGameOver(true, 'Deine Anklage war korrekt! Der wahre Täter wurde gestellt.');
	} else {
		handleGameOver(false, 'Falsche Beschuldigung: ' + selectedSuspect + '. Der Fall bleibt ungelöst.');
	}
}

// Button: accuse from HUD
let accuseBtnEl = document.getElementById('accuseBtn');
if (accuseBtnEl) {
	accuseBtnEl.addEventListener('click', function () {
		finalAccuseMode = true;
		openSuspectsModal();
	});
}

let finalizeAccuseBtnEl = document.getElementById('finalizeAccuseBtn');
if (finalizeAccuseBtnEl) {
	finalizeAccuseBtnEl.addEventListener('click', function () {
		finalizeAccusation();
	});
}

let restartBtnEl = document.getElementById('restartBtn');
if (restartBtnEl) {
	restartBtnEl.addEventListener('click', function () {
		// simple restart: reload the page
		window.location.reload();
	});
}

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

