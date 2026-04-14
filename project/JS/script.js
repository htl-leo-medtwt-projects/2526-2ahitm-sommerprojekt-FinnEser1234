let settingsNavBtn = document.getElementById("settingsNavBtn");
let settingsPage = document.getElementById("settingsPage");

if (settingsNavBtn && settingsPage) {
	settingsNavBtn.addEventListener("click", function () {
		settingsPage.scrollIntoView({ behavior: "smooth", block: "start" });
	});
}

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
let pinboardFocusBtn = document.getElementById("pinboardFocusBtn");
let deskLetterBtn = document.getElementById("deskLetterBtn");
let pinboardOverlay = document.getElementById("pinboardOverlay");
let pinboardCloseBtn = document.getElementById("pinboardCloseBtn");
let letterNoteCard = document.getElementById("letterNoteCard");
let letterNoteText = document.getElementById("letterNoteText");
let closeLetterNote = document.getElementById("closeLetterNote");
let inventoryToggle = document.getElementById("inventoryToggle");
let inventoryPanel = document.getElementById("inventoryPanel");
let pinboardItem = document.getElementById("pinboardItem");
let letterItem = document.getElementById("letterItem");

let inventoryStorageKey = "tlc_level1_inventory";
let levelOneInventory = {
	pinboard: false,
	letter: false
};

function loadInventoryState() {
	let rawState = localStorage.getItem(inventoryStorageKey);
	if (!rawState) {
		return;
	}

	try {
		let parsedState = JSON.parse(rawState);
		if (typeof parsedState.pinboard === "boolean") {
			levelOneInventory.pinboard = parsedState.pinboard;
		}
		if (typeof parsedState.letter === "boolean") {
			levelOneInventory.letter = parsedState.letter;
		}
	} catch (error) {
		levelOneInventory = {
			pinboard: false,
			letter: false
		};
	}
}

function saveInventoryState() {
	localStorage.setItem(inventoryStorageKey, JSON.stringify(levelOneInventory));
}

function updateInventoryUi() {
	if (pinboardItem) {
		let pinboardMeta = pinboardItem.querySelector(".inventoryItemMeta");
		pinboardItem.classList.toggle("inventoryItemFound", levelOneInventory.pinboard);
		pinboardItem.classList.toggle("inventoryItemLocked", !levelOneInventory.pinboard);
		if (pinboardMeta) {
			pinboardMeta.textContent = levelOneInventory.pinboard ? "Gefunden" : "Noch nicht gefunden";
		}
	}

	if (letterItem) {
		let letterMeta = letterItem.querySelector(".inventoryItemMeta");
		letterItem.classList.toggle("inventoryItemFound", levelOneInventory.letter);
		letterItem.classList.toggle("inventoryItemLocked", !levelOneInventory.letter);
		if (letterMeta) {
			letterMeta.textContent = levelOneInventory.letter ? "Gefunden" : "Noch nicht gefunden";
		}
	}
}

loadInventoryState();
updateInventoryUi();

if (gameSetupModal && gameSetupForm && detectiveNameInput && caseStartBtn && detectiveGreeting && setupError) {
	document.body.classList.add("modalOpen");
	gameSetupModal.classList.remove("gameModalHidden");

	gameSetupForm.addEventListener("submit", function (event) {
		event.preventDefault();

		let playerName = detectiveNameInput.value.trim();
		if (!playerName) {
			setupError.textContent = "Enter your name";
		}

		// LOCAL-STORAGE kommt hier dann

		setupError.textContent = "";
		detectiveGreeting.textContent = "Welcome, " + playerName + ". your Case is waiting.";
		caseStartBtn.disabled = false;
		gameSetupModal.classList.add("gameModalHidden");
		document.body.classList.remove("modalOpen");
	});

	caseStartBtn.addEventListener("click", function () {
		if (caseStartBtn.disabled) {
			return;
		}

		caseStartBtn.textContent = "Level 1 started";
		caseStartBtn.disabled = true;

		if (gameShell && levelOne) {
			gameShell.classList.add("levelHidden");
			levelOne.classList.remove("levelHidden");
		}
	});
}

if (pinboardFocusBtn && pinboardOverlay && pinboardCloseBtn) {
	pinboardFocusBtn.addEventListener("click", function () {
		pinboardOverlay.classList.remove("pinboardOverlayHidden");
		document.body.classList.add("modalOpen");

		if (!levelOneInventory.pinboard) {
			levelOneInventory.pinboard = true;
			saveInventoryState();
			updateInventoryUi();
		}
	});

	pinboardCloseBtn.addEventListener("click", function () {
		pinboardOverlay.classList.add("pinboardOverlayHidden");
		document.body.classList.remove("modalOpen");

		if (letterNoteCard) {
			letterNoteCard.classList.add("letterNoteHidden");
		}
	});
}

if (deskLetterBtn && letterNoteCard && letterNoteText) {
	deskLetterBtn.addEventListener("click", function () {
		letterNoteText.textContent = "Dr. Thorn wurde nicht durch Zeitreise verschluckt. Der Silberfuchs nutzt den Mythos nur als Tarnung fuer eine Entfuehrung.";
		letterNoteCard.classList.remove("letterNoteHidden");

		if (!levelOneInventory.letter) {
			levelOneInventory.letter = true;
			saveInventoryState();
			updateInventoryUi();
		}
	});
}

if (closeLetterNote && letterNoteCard) {
	closeLetterNote.addEventListener("click", function () {
		letterNoteCard.classList.add("letterNoteHidden");
	});
}

if (inventoryToggle && inventoryPanel) {
	inventoryToggle.addEventListener("click", function () {
		inventoryPanel.classList.toggle("inventoryHidden");
	});
}

