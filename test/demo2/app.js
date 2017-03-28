var h1 = document.querySelector('h1');
var nameInput = document.getElementById('nameInput');

nameInput.oninput = function() {
	h1.textContent = 'Hello ' + nameInput.value;
};