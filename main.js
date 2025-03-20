let searchInput, dropdown, optionsList, guessInput, filteredOptions, targetDisplay, shareButton;
window.onload = e => {
    let gameover = false;
    const characters = {};
    let maxGuesses = 6;
    let guesses = 0;
    let daily;
    let target;
    let date = new Date();
    let shareResults = [];

    dropdown = document.querySelector('#dropdown');
    searchInput = document.querySelector('#searchInput');
    optionsList = document.querySelector('#optionsList');
    targetDisplay = document.querySelector('#target-display');
    guessResults = document.querySelector('#guess-results');
    shareButton = document.querySelector("#share-button");

    const characterNames = [];
    characterData.forEach(c => {
        let name = c.name.replace("&#039;", "'")
        characters[name] = c;
        let metas = [c.id.toString(), c.jpname]
        if (c.series && c.series.toLowerCase().includes("grand")) {
            metas.push(`G.${name.substring(0,name.indexOf("("))}`)
        }
        if (c.series && c.series.toLowerCase().includes("summer")) {
            metas.push(`S.${name.substring(0,name.indexOf("("))}`)
        }
        if (c.series && c.series.toLowerCase().includes("halloween")) {
            metas.push(`H.${name.substring(0,name.indexOf("("))}`)
        }
        if (c.series && c.series.toLowerCase().includes("holiday")) {
            metas.push(`C.${name.substring(0,name.indexOf("("))}`)
        }
        if (c.series && c.series.toLowerCase().includes("yukata")) {
            metas.push(`Y.${name.substring(0,name.indexOf("("))}`)
        }
        if (c.series && c.series.toLowerCase().includes("valentine")) {
            metas.push(`V.${name.substring(0,name.indexOf("("))}`)
        }
        characterNames.push({label: name, metatags: metas});
    });
    const randomizedNames = shuffleArray(characterNames.slice(0).map(n=>n.label));
    startGame(true);

    document.querySelector("#randomize-button").onclick = e => startGame(false);
    function startGame(isDaily) {
        guessResults.children[0].innerHTML = `<tr><tr>
            <td>Character</td>
            <td>Element</td>
            <td>Race</td>
            <td>Style</td>
            <td>Weapon Prof #1</td>
            <td>Weapon Prof #2</td>
        </tr>`;
        for (let i = 0; i < maxGuesses; i++) {
            guessResults.children[0].innerHTML += `<tr></tr>`;
        }
        setTargetUnknowns();
        shareResults = [];
        guesses = 0;
        gameover = false;
        setGuessesLeft();
        searchInput.disabled = false;
        searchInput.value = '';
        optionsList.innerHTML = '';
        if (isDaily) {
            const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate(); // YYYYMMDD format
            const randomIndex = Math.abs(Math.sin(seed) * 10000) % characterData.length; // Deterministic random value
            target = characterData[Math.floor(randomIndex)];

            getDailyGuesses().forEach(g => {
                guess(g.replace("&#039;", "'"), false, true);
            });
        }
        else {
            var num = Math.floor(Math.random() * characterData.length);
            target = characters[randomizedNames[num]];
        }
        document.querySelector("#title").textContent = isDaily ? "Daily" : "Random: " + num;
        daily = isDaily;
    }

    function guess(userGuess, reveal = false, fromStorage = false) {
        userGuess = characters[userGuess];
        searchInput.value = '';
        optionsList.innerHTML = '';

        let guessResults = ["name", "element", "race", "type", "weapon:0", "weapon:1"].map(field => compareGuess(userGuess, field.split(":")[0], field.split(":")[1]))
        let guessRow;
        if (reveal) {
            guessRow = document.querySelector('#guess-results').children[0].children[0];
        } else {
            guesses++;
            guessRow = document.querySelector('#guess-results').children[0].children[guesses + 1];
            setGuessesLeft();
        }
        guessRow.innerHTML = `
            <td style="background-color:${guessResults[0]}"><img src="https://prd-game-a-granbluefantasy.akamaized.net/assets_en/img/sp/assets/npc/s/${userGuess.id}_01.jpg"></td>
            <td style="background-color:${guessResults[1]}"><img src="https://gbf.wiki/thumb.php?f=Label_Element_${userGuess.element}.png&w=70"></td>
            <td style="background-color:${guessResults[2]}"><img src="https://gbf.wiki/thumb.php?f=Label_Race_${userGuess.race}.png&w=120"></td>
            <td style="background-color:${guessResults[3]}"><img src="https://gbf.wiki/thumb.php?f=Label_Type_${userGuess.type}.png&w=120"></td>
            <td style="background-color:${guessResults[4]}"><img src="https://gbf.wiki/thumb.php?f=Label_Weapon_${userGuess.weapon[0]}.png&w=80"></td>
            <td style="background-color:${guessResults[5]}">${userGuess.weapon[1] ? `<img src="https://gbf.wiki/thumb.php?f=Label_Weapon_${userGuess.weapon[1]}.png&w=80">` : ""}</td>
    `
        if (userGuess == target && !reveal) {
            shareResults.push([...guessResults.map(r => mapShareSquares(r))])
        } else if (!reveal) {
            shareResults.push([...guessResults.map(r => mapShareSquares(r))])
        }
        if (!fromStorage && !reveal && daily) {
            let dailyGuesses = getDailyGuesses();
            dailyGuesses.push(userGuess.name);
            setDailyGuesses(dailyGuesses);
        }
        if (!gameover && (userGuess == target || guesses == maxGuesses)) {
            gameover = true;
            searchInput.disabled = true;
            guess(target.name, true, fromStorage);
            shareButton.disabled = false;
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
        return correct;
    }

    function getDailyGuesses() {
        let guesses = localStorage.getItem('dailyGuesses');
        if (!guesses) {
            guesses = {};
            localStorage.setItem('dailyGuesses', JSON.stringify(guesses));
            return [];
        }
        guesses = JSON.parse(guesses);
        let dateIndex = `${date.getMonth()}${date.getDate()}`;
        if (!guesses[dateIndex]) guesses[dateIndex] = [];
        return guesses[dateIndex];
    }

    function setDailyGuesses(guesses) {
        let guessStorage = localStorage.getItem('dailyGuesses');
        if (!guessStorage) {
            guessStorage = {};
        }
        guessStorage = JSON.parse(guessStorage);
        let dateIndex = `${date.getMonth()}${date.getDate()}`;
        if (!guessStorage[dateIndex]) guessStorage[dateIndex] = [];
        guessStorage[dateIndex] = guesses;
        localStorage.setItem('dailyGuesses', JSON.stringify(guessStorage));
    }

    function setGuessesLeft() {
        document.querySelector("#guess-count").innerHTML = `Guesses: ${maxGuesses - guesses}/${maxGuesses}`;
    }

    function mapShareSquares(guessResult) {
        switch (guessResult) {
            case "green": return "🟩";
            case "yellow": return "🟨";
            case "red": return "⬛";
        }
    }

    ///input handling
    {
        shareButton.onclick = e => {
            const oneDay = 86400000;
            const firstDay = new Date(2025, 2, 20);
            let day = Math.round((((new Date(date.getFullYear(), date.getMonth(), date.getDate())).getTime() - firstDay.getTime()) / oneDay) + 1).toFixed();
            let results = `GBFdle ${daily ? `Daily #${day}` : document.querySelector("#title").innerHTML.replace(": ", " #")}  ${guesses}/${maxGuesses}

${shareResults.map(r => r.join("")).join("\n")}`;
            (function (text) {
                var textarea = document.createElement("textarea");
                textarea.textContent = text;
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                try {
                    document.execCommand("copy");
                    document.body.removeChild(textarea);
                    alert("Copied data to clipboard");
                }
                catch (e) {
                    document.body.removeChild(textarea);
                }
            }(results))
        }

        let activeIndex = 0;

        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            filteredOptions = characterNames.filter(option =>
                option.label.toLowerCase().includes(searchTerm) ||
                option.metatags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
            activeIndex = 0; // Reset active index
            renderOptions(filteredOptions);
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
                    guess(selectedOption.label);
                }
            }
        });

        document.onclick = e => {
            if (e.target == document.body) {
                optionsList.innerHTML = '';
            }
        }

        function renderOptions(options) {
            optionsList.innerHTML = '';
            options.forEach((option, index) => {
                const li = document.createElement('li');
                li.textContent = option.label;
                li.setAttribute('data-index', index);
                li.addEventListener('click', () => {
                    guess(option.label);
                });
                optionsList.appendChild(li);
            });
            updateActiveOption();
        }

        function updateActiveOption() {
            const items = optionsList.querySelectorAll('li');
            items.forEach((item, index) => {
                item.classList.toggle('active', index === activeIndex);
            });
        }
    }
}

function setTargetUnknowns() {
    targetDisplay.innerHTML = `
<td><img src="https://gbf.wiki/thumb.php?f=Unknown_square.jpg&w=75"></td>`
    /*`<td><img id="#target-element" style="width:70px;" src="https://gbf.wiki/images/archive/a/a2/20200113072357%21Label_Race_Unknown.png"></td>
    <td><img id="#target-race" style="width:120px;" src="https://gbf.wiki/images/archive/a/a2/20200113072357%21Label_Race_Unknown.png"></td>
    <td><img id="#target-style" style="width:120px;" src="https://gbf.wiki/images/archive/a/a2/20200113072357%21Label_Race_Unknown.png"></td>
    <td><img id="#target-weapon1" style="width:80px;" src="https://gbf.wiki/images/archive/a/a2/20200113072357%21Label_Race_Unknown.png"></td>
    <td><img id="#target-weapon2" style="width:80px;" src="https://gbf.wiki/images/archive/a/a2/20200113072357%21Label_Race_Unknown.png"></td>`*/
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