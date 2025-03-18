let searchInput, dropdown, optionsList, guessInput, filteredOptions, activeIndex = -1;
let guesses = 0;
const characters = {};
let gameover = false;
window.onload = e => {
    characterData.forEach(c => {
        characters[c.name.replace("&#039;", "'")] = c;
    });
    const characterNames = Object.keys(characters);

    let target;

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

    // Generate a random index based on the current date
    const date = new Date();
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate(); // YYYYMMDD format
    const randomIndex = Math.abs(Math.sin(seed) * 10000) % characterData.length; // Deterministic random value
    target = characterData[Math.floor(randomIndex)];

    const randomizedNames = shuffleArray(characterNames.slice(0));
    document.querySelector("#randomize-button").onclick = e => {
        document.querySelector('#guess-results').children[0].innerHTML = `<tr><td><img src="https://gbf.wiki/thumb.php?f=Unknown_square.jpg&w=75"></td></tr><tr>
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
        let num = Math.floor(Math.random() * characterData.length);
        target = characters[randomizedNames[num]];
        document.querySelector("#title").textContent = "Random: " + num;
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
    }

    activeIndex = options.length > 0 ? 0 : -1; // Set the first option as active, or reset if no options
    updateActiveOption(); // Highlight the active option

    function updateActiveOption() {
        const items = optionsList.querySelectorAll('li');
        items.forEach((item, index) => {
            item.classList.toggle('active', index === activeIndex);
        });
    }

    function guess(userGuess, reveal = false) {
        userGuess = characters[userGuess];
        guesses++;
        searchInput.value = '';
        optionsList.innerHTML = '';

        let guessRow;
        if (reveal) {
            guessRow = document.querySelector('#guess-results').children[0].children[0];
        } else {
            guessRow = document.querySelector('#guess-results').children[0].children[guesses + 1];
        }
        guessRow.innerHTML = `
            <td><img src="https://gbf.wiki/thumb.php?f=Npc_s_${userGuess.id}_01.jpg&w=75"></td>
            <td ${compareGuess(userGuess, "element")}><img src="https://gbf.wiki/thumb.php?f=Label_Element_${userGuess.element}.png&w=70"></td>
            <td ${compareGuess(userGuess, "race")}><img src="https://gbf.wiki/thumb.php?f=Label_Race_${userGuess.race}.png&w=120"></td>
            <td ${compareGuess(userGuess, "type")}><img src="https://gbf.wiki/thumb.php?f=Label_Type_${userGuess.type}.png&w=120"></td>
            <td ${compareGuess(userGuess, "weapon", 0)}><img src="https://gbf.wiki/thumb.php?f=Label_Weapon_${userGuess.weapon[0]}.png&w=80"></td>
            <td ${compareGuess(userGuess, "weapon", 1)}>${userGuess.weapon[1] ? `<img src="https://gbf.wiki/thumb.php?f=Label_Weapon_${userGuess.weapon[1]}.png&w=80">` : ""}</td>
    `
        if (!gameover && (userGuess == target || guesses == 5)) {
            gameover = true;
            searchInput.disabled = true;
            guess(target.name, true);
        }
    }

    function compareGuess(guess, field, extra = null) {
        let correct = guess[field] === target[field] ? "green" : "red";
        if (field == "weapon") {
            if (guess[field][extra] == target[field][extra]) {
                correct = "green"
            } else if (guess[field][extra] == target[field][1 - extra]) {
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

}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

//https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
var seed = 3040130000;
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}