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

let roomScene = document.getElementById("roomScene");
let roomSwitchBtn = document.getElementById("roomSwitchBtn");
let showSuspectsBtn = document.getElementById("showSuspectsBtn");
let pinboardFocusBtn = document.getElementById("pinboardFocusBtn");
let deskLetterBtn = document.getElementById("deskLetterBtn");

let pinboardOverlay = document.getElementById("pinboardOverlay");
let pinboardCloseBtn = document.getElementById("pinboardCloseBtn");
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

let rooms = [];
let roomsDataPath = "../data/rooms.json";

let currentRoomIndex = 0;
let foundItems = [];
let selectedSuspect = null;

let cipherTarget = "BLACKWOOD";
let cipherLetters = ["B", "A", "R", "L", "M", "Q", "A", "C", "K", "T", "W", "Y", "O", "O", "D", "N", "E", "S"];
let cipherCurrentIndex = 0;
let cipherSolved = false;

async function loadRoomsData() {
	if (rooms.length > 0) {
		return true;
	}

	try {
		let response = await fetch(roomsDataPath);
		if (!response.ok) {
			throw new Error("Raumdaten konnten nicht geladen werden.");
		}

		let parsedRooms = await response.json();
		if (!Array.isArray(parsedRooms) || parsedRooms.length === 0) {
			throw new Error("Raumdaten sind leer oder ungueltig.");
		}

		rooms = parsedRooms;
		return true;
	} catch (error) {
		rooms = [];
		if (roomSwitchBtn) {
			roomSwitchBtn.textContent = "Raumstatus: keine Daten";
		}
		if (setupError) {
			setupError.textContent = "Raumdaten konnten nicht geladen werden.";
		}
		return false;
	}
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

	document.body.classList.toggle("modalOpen", hasOpenModal);
}

function applyRoom() {
	if (!roomScene || !roomSwitchBtn || rooms.length === 0) {
		return;
	}

	let room = rooms[currentRoomIndex];
	roomScene.style.backgroundImage = room.background;
	roomSwitchBtn.textContent = "Raumstatus: " + room.name;

	setHotspot(pinboardFocusBtn, room.pinboard);
	setHotspot(deskLetterBtn, room.letter);
	setHotspot(encryptionMachineBtn, room.encryption);
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

function addFoundItem(itemKey, title, sourceRoomIndex) {
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

	rooms[sourceRoomIndex].found = true;
	if (roomHasBothFinds(sourceRoomIndex) && sourceRoomIndex < rooms.length - 1) {
		rooms[sourceRoomIndex + 1].unlocked = true;
	}
	renderInventory();
	renderRoomsGrid();
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

		if (gameShell && levelOne) {
			let roomsLoaded = await loadRoomsData();
			if (!roomsLoaded) {
				return;
			}

			gameShell.classList.add("levelHidden");
			levelOne.classList.remove("levelHidden");
			currentRoomIndex = 0;
			applyRoom();
			renderInventory();
			renderRoomsGrid();
		}
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
			selectedSuspect = button.getAttribute("data-suspect");
			updateSuspectSelectionUi();
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

renderCipherGrid();
