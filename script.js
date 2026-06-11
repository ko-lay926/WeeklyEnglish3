const QUIZ_URL = "https://ko-lay926.github.io/WeeklyEnglish2/www/quizzes.json";

let quizData = {};
let currentLevel = "level1";
let currentIndex = 0;
let score = 0;

let username = localStorage.getItem("username");

if (!username) {
    username = prompt("Enter your name") || "Student";
    localStorage.setItem("username", username);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("welcome").innerHTML = "👤 " + username;
    loadQuiz();
});

async function loadQuiz() {
    try {
        const response = await fetch(QUIZ_URL);
        quizData = await response.json();

        createLevelButtons();
        changeLevel("level1");

    } catch (error) {
        document.getElementById("question").innerText =
            "Failed to load quiz!";
        console.error(error);
    }
}

function createLevelButtons() {

    const levels = document.getElementById("levels");
    levels.innerHTML = "";

    for (let i = 1; i <= 10; i++) {

        const btn = document.createElement("button");
        const level = "level" + i;

        let locked = false;

        if (i > 1) {
            locked =
                localStorage.getItem(
                    "level" + (i - 1) + "_passed"
                ) !== "true";
        }

        btn.disabled = locked;

        btn.innerHTML = locked
            ? `🔒<br>${i}`
            : `⭐<br>${i}`;

        btn.onclick = () => changeLevel(level);

        levels.appendChild(btn);
    }
}

function changeLevel(level){

    document.getElementById("levelScreen").style.display =
    "none";

    document.getElementById("quizScreen").style.display =
    "block";

    currentLevel = level;
    currentIndex = 0;
    score = 0;

    document.getElementById("result").innerHTML = "";

    showQuestion();
}

function showLevelScreen(){

    document.getElementById("quizScreen").style.display =
    "none";

    document.getElementById("levelScreen").style.display =
    "block";
}

function showQuestion() {

    const q =
        quizData[currentLevel].questions[currentIndex];

    document.getElementById("question").innerText =
        q.q;

    const options =
        document.getElementById("options");

    options.innerHTML = "";

    q.options.forEach((option, index) => {

        const btn =
            document.createElement("button");

        btn.className = "option";
        btn.innerText = option;

        btn.onclick = () =>
            checkAnswer(index);

        options.appendChild(btn);
    });
}

function checkAnswer(selected) {

    const q =
        quizData[currentLevel].questions[currentIndex];

    if (selected === q.answer) {

        score++;

        document.getElementById("result").innerHTML =
            "✅ Correct";

    } else {

        document.getElementById("result").innerHTML =
            "❌ Wrong";
    }

    currentIndex++;

    setTimeout(() => {

        if (
            currentIndex <
            quizData[currentLevel].questions.length
        ) {

            showQuestion();

        } else {

            finishLevel();
        }

    }, 500);
}

function finishLevel() {

    const total =
        quizData[currentLevel].questions.length;

    const percent =
        Math.round((score / total) * 100);

    const now = new Date();

    const record = {
        user: username,
        level: currentLevel,
        score: score,
        total: total,
        percent: percent,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
    };

    let history =
        JSON.parse(
            localStorage.getItem("quizHistory")
            || "[]"
        );

    history.push(record);

    localStorage.setItem(
        "quizHistory",
        JSON.stringify(history)
    );

    document.getElementById("question").innerHTML =
`
🎉 Level Completed!

<br><br>

Score: ${score}/${total}

<br>

${percent}%
`;

document.getElementById("options").innerHTML =
`
<button onclick="showLevelScreen()">
🏠 Back to Levels
</button>
`;
    document.getElementById("result").innerHTML =
        `
        Score: ${score}/${total}<br>
        ${percent}%<br>
        ${record.date}<br>
        ${record.time}
        `;

    if (score === total) {

        localStorage.setItem(
            currentLevel + "_passed",
            "true"
        );

        createLevelButtons();

        document.getElementById("result").innerHTML +=
            "<br>🏆 Next Level Unlocked";
    }
}

function showHistory() {

    const history =
        JSON.parse(
            localStorage.getItem("quizHistory")
            || "[]"
        );

    let html = "<h3>Quiz History</h3>";

    [...history]
        .reverse()
        .forEach(r => {

            html += `
            <div>
            <b>${r.user}</b><br>
            ${r.level}<br>
            ${r.score}/${r.total}
            (${r.percent}%)<br>
            ${r.date} ${r.time}
            <hr>
            </div>
            `;
        });

    document.getElementById("history")
        .innerHTML = html;
}

function shareResult() {

    const text =
`📘 WeeklyEnglish Quiz

Name: ${username}
Level: ${currentLevel}
Score: ${score}

Keep learning English!`;

    if (navigator.share) {

        navigator.share({
            title: "WeeklyEnglish Quiz",
            text: text
        });

    } else {

        window.open(
            "https://t.me/share/url?text=" +
            encodeURIComponent(text),
            "_blank"
        );
    }
}

function resetProgress() {

    if (
        confirm(
            "Reset all progress and history?"
        )
    ) {

        localStorage.clear();

        location.reload();
    }
                     }
