// Get data from Local Storage

let tournaments =
    JSON.parse(localStorage.getItem("tournaments")) || [];

let players =
    JSON.parse(localStorage.getItem("players")) || [];

let registrations =
    JSON.parse(localStorage.getItem("registrations")) || [];

let accounts =
    JSON.parse(localStorage.getItem("gameArenaAccounts")) || [];

let currentUser =
    JSON.parse(localStorage.getItem("gameArenaCurrentUser")) || null;


// HTML elements

const tournamentList =
    document.getElementById("tournamentList");

const tournamentForm =
    document.getElementById("tournamentForm");

const playerForm =
    document.getElementById("playerForm");

const searchTournament =
    document.getElementById("searchTournament");

const authModal = document.getElementById("authModal");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authMessage = document.getElementById("authMessage");
const authSubmitButton = document.getElementById("authSubmitButton");
const authSwitchButton = document.getElementById("authSwitchButton");
const nameField = document.getElementById("nameField");
const accountName = document.getElementById("accountName");
const accountEmail = document.getElementById("accountEmail");
const accountPassword = document.getElementById("accountPassword");
const appShell = document.getElementById("appShell");

let authMode = "login";


// LOCAL ACCOUNT AUTHENTICATION

function openAuthModal(mode) {

    authMode = mode;
    authForm.reset();
    nameField.hidden = mode === "login";
    accountName.required = mode === "create";
    authTitle.textContent = mode === "login" ? "Log in" : "Create account";
    authMessage.textContent = mode === "login"
        ? "Use your saved GameArena account."
        : "Your account stays on this device in local storage.";
    authSubmitButton.textContent = mode === "login" ? "Log in" : "Create account";
    authSwitchButton.textContent = mode === "login"
        ? "Need an account? Create one"
        : "Already have an account? Log in";
    authModal.hidden = false;
    accountEmail.focus();

}

function closeAuthModal() {
    authModal.hidden = true;
}

function updateAppVisibility() {
    appShell.hidden = !currentUser;
    authModal.hidden = Boolean(currentUser);
}

function updateAuthArea() {

    const authArea = document.getElementById("authArea");

    if (!currentUser) {
        authArea.innerHTML = `
            <button id="loginButton" class="auth-button" type="button">Log in</button>
            <button id="createAccountButton" class="auth-button secondary" type="button">Create account</button>
        `;
        document.getElementById("loginButton").addEventListener("click", function() {
            openAuthModal("login");
        });
        document.getElementById("createAccountButton").addEventListener("click", function() {
            openAuthModal("create");
        });
        updateAppVisibility();
        return;
    }

    authArea.innerHTML = `
        <span class="welcome-user">Hi, ${currentUser.name}</span>
        <button id="logoutButton" class="auth-button secondary" type="button">Log out</button>
    `;
    document.getElementById("logoutButton").addEventListener("click", function() {
        currentUser = null;
        localStorage.removeItem("gameArenaCurrentUser");
        updateAuthArea();
        openAuthModal("login");
    });

    updateAppVisibility();

}

document.getElementById("closeAuthButton").addEventListener("click", closeAuthModal);

authModal.addEventListener("click", function(event) {
    if (event.target === authModal) {
        closeAuthModal();
    }
});

authSwitchButton.addEventListener("click", function() {
    openAuthModal(authMode === "login" ? "create" : "login");
});

authForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const email = accountEmail.value.trim().toLowerCase();
    const password = accountPassword.value;

    if (authMode === "create") {
        const name = accountName.value.trim();

        if (!name) {
            authMessage.textContent = "Please enter your name.";
            return;
        }

        if (accounts.some(function(account) { return account.email === email; })) {
            authMessage.textContent = "An account with that email already exists. Try logging in.";
            return;
        }

        const account = {
            name: name,
            email: email,
            password: password
        };

        accounts.push(account);
        localStorage.setItem("gameArenaAccounts", JSON.stringify(accounts));
        currentUser = { name: account.name, email: account.email };
        localStorage.setItem("gameArenaCurrentUser", JSON.stringify(currentUser));
        closeAuthModal();
        updateAuthArea();
        alert("Account created successfully!");
        return;
    }

    const account = accounts.find(function(savedAccount) {
        return savedAccount.email === email && savedAccount.password === password;
    });

    if (!account) {
        authMessage.textContent = "Email or password is incorrect.";
        return;
    }

    currentUser = { name: account.name, email: account.email };
    localStorage.setItem("gameArenaCurrentUser", JSON.stringify(currentUser));
    closeAuthModal();
    updateAuthArea();
    alert("Logged in successfully!");

});


// CREATE TOURNAMENT

tournamentForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const name =
            document.getElementById("tournamentName")
            .value;

        const game =
            document.getElementById("game")
            .value;

        const date =
            document.getElementById("date")
            .value;

        const maxPlayers =
            document.getElementById("maxPlayers")
            .value;

        const prize =
            document.getElementById("prize")
            .value;


        const tournament = {

            id: Date.now(),

            name: name,

            game: game,

            date: date,

            maxPlayers:
                Number(maxPlayers),

            prize:
                Number(prize),

            registeredPlayers: 0

        };


        tournaments.push(tournament);


        localStorage.setItem(
            "tournaments",
            JSON.stringify(tournaments)
        );


        tournamentForm.reset();


        alert(
            "Tournament created successfully!"
        );


        displayTournaments();

        updateDashboard();

    }
);


// DISPLAY TOURNAMENTS

function displayTournaments(data = tournaments) {

    tournamentList.innerHTML = "";


    if (data.length === 0) {

        tournamentList.innerHTML =
            "<p>No tournaments found.</p>";

        return;

    }


    data.forEach(function(tournament) {

        const card =
            document.createElement("div");

        card.className =
            "tournament-card";


        card.innerHTML = `

            <h3>
                🎮 ${tournament.name}
            </h3>

            <p>
                <strong>Game:</strong>
                ${tournament.game}
            </p>

            <p>
                <strong>Date:</strong>
                ${tournament.date}
            </p>

            <p>
                <strong>Players:</strong>
                ${tournament.registeredPlayers}
                /
                ${tournament.maxPlayers}
            </p>

            <p>
                <strong>Prize:</strong>
                ₹${tournament.prize}
            </p>

            <button
                onclick="registerTournament(${tournament.id})">
                Register
            </button>

            <button
                class="delete"
                onclick="deleteTournament(${tournament.id})">
                Delete
            </button>

        `;


        tournamentList.appendChild(card);

    });

}


// PLAYER REGISTRATION

playerForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            document.getElementById("playerName")
            .value;

        const email =
            document.getElementById("playerEmail")
            .value;

        const gameId =
            document.getElementById("gameId")
            .value;


        const player = {

            id: Date.now(),

            name: name,

            email: email,

            gameId: gameId

        };


        players.push(player);


        localStorage.setItem(
            "players",
            JSON.stringify(players)
        );


        playerForm.reset();


        alert(
            "Player registered successfully!"
        );


        updateDashboard();

    }
);


// TOURNAMENT REGISTRATION

function registerTournament(id) {

    const tournament =
        tournaments.find(
            function(t) {

                return t.id === id;

            }
        );


    if (!tournament) {
        return;
    }


    if (
        tournament.registeredPlayers
        >=
        tournament.maxPlayers
    ) {

        alert(
            "Tournament is full!"
        );

        return;

    }


    tournament.registeredPlayers++;


    registrations.push({

        id: Date.now(),

        tournamentId: id

    });


    localStorage.setItem(
        "tournaments",
        JSON.stringify(tournaments)
    );


    localStorage.setItem(
        "registrations",
        JSON.stringify(registrations)
    );


    alert(
        "Successfully registered for tournament!"
    );


    displayTournaments();

    updateDashboard();

}


// DELETE TOURNAMENT

function deleteTournament(id) {

    const confirmation =
        confirm(
            "Are you sure you want to delete this tournament?"
        );


    if (!confirmation) {
        return;
    }


    tournaments =
        tournaments.filter(
            function(tournament) {

                return tournament.id !== id;

            }
        );


    localStorage.setItem(
        "tournaments",
        JSON.stringify(tournaments)
    );


    displayTournaments();

    updateDashboard();

}


// SEARCH

searchTournament.addEventListener(
    "input",
    function() {

        const searchText =
            searchTournament.value
            .toLowerCase();


        const filtered =
            tournaments.filter(
                function(tournament) {

                    return (

                        tournament.name
                            .toLowerCase()
                            .includes(searchText)

                        ||

                        tournament.game
                            .toLowerCase()
                            .includes(searchText)

                    );

                }
            );


        displayTournaments(filtered);

    }
);


// DASHBOARD

function updateDashboard() {

    document.getElementById(
        "totalTournaments"
    ).textContent =
        tournaments.length;


    document.getElementById(
        "totalPlayers"
    ).textContent =
        players.length;


    document.getElementById(
        "totalRegistrations"
    ).textContent =
        registrations.length;

}


// INITIAL LOAD

updateAuthArea();
if (!currentUser) {
    openAuthModal("login");
}
displayTournaments();

updateDashboard();