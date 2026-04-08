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

		caseStartBtn.textContent = "Started";
		caseStartBtn.disabled = true;
	});
}

