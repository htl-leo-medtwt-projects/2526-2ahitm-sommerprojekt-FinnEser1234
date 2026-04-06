const settingsNavBtn = document.getElementById("settingsNavBtn");
const settingsPage = document.getElementById("settingsPage");

if (settingsNavBtn && settingsPage) {
	settingsNavBtn.addEventListener("click", () => {
		settingsPage.scrollIntoView({ behavior: "smooth", block: "start" });
	});
}
