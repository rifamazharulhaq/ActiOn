/* Line Ray */
const teamCountSelect = document.getElementById('team-count');
const teamInputsDiv = document.getElementById('team-inputs');
const btnGenerate = document.getElementById('btn-generate');

let bracketData = [];

function generateTeamInputs(count) {
    teamInputsDiv.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Tim ${i}`;
        input.id = `team-${i}`;
        teamInputsDiv.appendChild(input);
    }
}

teamCountSelect.addEventListener('change', function () {
    generateTeamInputs(parseInt(this.value));
});

generateTeamInputs(parseInt(teamCountSelect.value));

/* Line Rifa */