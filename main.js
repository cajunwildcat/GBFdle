let searchInput, dropdown, optionsList, guessInput, filteredOptions, activeIndex = -1;
let guesses = 0;
const characters = {};
let target;
window.onload = e => {
    characterData.forEach(c => {
        characters[c.name] = c;
    });
    const characterNames = characterData.map(c => c.name);

    dropdown = document.getElementById('dropdown');
    searchInput = document.getElementById('searchInput');
    optionsList = document.getElementById('optionsList');

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        filteredOptions = characterNames.filter(option =>
            option.toLowerCase().includes(searchTerm)
        );
        renderOptions(filteredOptions);
        activeIndex = 0; // Reset active index
    });

    searchInput.addEventListener('keydown', (e) => {
        const items = optionsList.querySelectorAll('li');
        if (e.key === 'Escape') {
            searchInput.value = '';
            renderOptions(filteredOptions);
            activeIndex = -1; // Reset active index
        } else if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % items.length;
            updateActiveOption();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + items.length) % items.length;
            updateActiveOption();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex === -1 && items.length > 0) {
                activeIndex = 0; // Default to the top option if none is selected
                updateActiveOption();
            }
            if (activeIndex >= 0) {
                const selectedOption = characterNames[characterNames.indexOf(filteredOptions[activeIndex])];
                guess(selectedOption);
            }
        }
    });

    document.onclick = e => {
        if (e.target == document.body) {
            optionsList.innerHTML = '';
        }
    }

    //take the date and generate a random index from characterData
    const date = new Date();
    const index = date.getDate() % characterData.length;
    target = characterData[index];
    
    document.querySelector("#randomize-button").onclick = e => {
        document.querySelector('#guess-results').children[0].innerHTML = `<tr>
            <td>Character</td>
            <td>Element</td>
            <td>Race</td>
            <td>Style</td>
            <td>Weapon Prof #1</td>
            <td>Weapon Prof #2</td>
        </tr>
        <tr></tr>
        <tr></tr>
        <tr></tr>
        <tr></tr>
        <tr></tr>`;
        guesses = 0;
        searchInput.disabled = false;
        searchInput.value = '';
        optionsList.innerHTML = '';
        target = characterData[Math.floor(Math.random() * characterData.length)];
        document.querySelector("#title").textContent = "Random: " + Math.floor(Math.random() * (999) + 1);
    }
}

function renderOptions(options) {
    optionsList.innerHTML = '';
    options.forEach((option, index) => {
        const li = document.createElement('li');
        li.textContent = option;
        li.setAttribute('data-index', index);
        li.addEventListener('click', () => {
            guess(option);
        });
        optionsList.appendChild(li);
    });

    activeIndex = options.length > 0 ? 0 : -1; // Set the first option as active, or reset if no options
    updateActiveOption(); // Highlight the active option
}

function updateActiveOption() {
    const items = optionsList.querySelectorAll('li');
    items.forEach((item, index) => {
        item.classList.toggle('active', index === activeIndex);
    });
}

function guess(guess) {
    guess = characters[guess];
    console.log(guess);
    guesses++;
    searchInput.value = '';
    optionsList.innerHTML = '';

    const guessRow = document.querySelector('#guess-results').children[0].children[guesses];
    guessRow.innerHTML = `
        <td><img src="https://gbf.wiki/thumb.php?f=Npc_s_${guess.id}_01.jpg&w=75"></td>
        <td ${compareGuess(guess, "element")}><img src="https://gbf.wiki/thumb.php?f=Label_Element_${guess.element}.png&w=70"></td>
        <td ${compareGuess(guess, "race")}><img src="https://gbf.wiki/thumb.php?f=Label_Race_${guess.race}.png&w=120"></td>
        <td ${compareGuess(guess, "type")}><img src="https://gbf.wiki/thumb.php?f=Label_Type_${guess.type}.png&w=120"></td>
        <td ${compareGuess(guess, "weapon", 0)}><img src="https://gbf.wiki/thumb.php?f=Label_Weapon_${guess.weapon[0]}.png&w=80"></td>
        <td ${compareGuess(guess, "weapon", 1)}>${guess.weapon[1]? `<img src="https://gbf.wiki/thumb.php?f=Label_Weapon_${guess.weapon[1]}.png&w=80">` : ""}</td>
`
    if (guess == target) {
        alert(`You won in ${guesses} guesses!`);
        searchInput.disabled = true;
    }
    else if (guesses == 5) {
        alert(`You lost! The correct character was ${target.name}`);
        searchInput.disabled = true;
    }
}

function compareGuess(guess, field, extra = null) {
    let correct = guess[field] === target[field]? "green" : "red";
    if (field == "weapon") {
        if (guess[field][extra] == target[field][extra]) {
            correct = "green"
        } else if (guess[field][extra] == target[field][1-extra]) {
            correct = "yellow"
        } else {
            correct = "red"
        }
    }
    else if (field == "race") {
        if (guess[field][0] == target[field][0] && guess[field][1] == target[field][1]) {
            correct = "green"
        } else if (guess[field][0] == target[field][0] && guess[field][1] != target[field][1] || 
                (guess[field][1] && target[field][1] && guess[field][0] != target[field][0] && guess[field][1] == target[field][1])) {
            correct = "yellow"
        } else {
            correct = "red"
        }
    }
    return `style="background-color: ${correct}"`;
}