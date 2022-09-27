console.log('Client-side code running'); 

//Este codigo es JS normal, es para conectarlo con el codigo del servidor (App)

/*Lo siguiente es una funcion que es usada para obtener el nombre del usuario logueado
  Puede ser usada en un futuro, no tiene sentido por ahora*/

const button = document.getElementById('myButton');

function viewClubs() {
    
    const categories = ["Artes","Ciencias Naturales", "Ciencias Sociales", "Culturales",
    "Deportivas", "Humanidades", "Idiomas", "Laboratorios", "Matemáticas", "Música", "Otra"];

    //Hacer For Loop

    for (var i = 0; i<categories.length; i++) {
        fetch('/getClubs', {method: 'POST', body: JSON.stringify({category: categories[i]}), headers: {'Content-Type': 'application/json'}})
        .then(function(response) {
            if (response.ok) return response.json();
            throw new Error('Request failed');
        })
        .then(function(data) {
            const container = document.getElementById('clubsContainer');
            for (var j=0; j < data.length; j++) {
                isInterested(data[j], container);
            }
        }) 
    }
}

function isInterested(clubName, container) {
    fetch('/isInterested', {method: 'POST', body: JSON.stringify({clubName: clubName}), headers: {'Content-Type': 'application/json'}})
    .then(function(response) {
        if (response.ok) return response.json();
        throw new Error('Request failed');
    })
    .then(function(data) {
        if (data == true) {
            console.log(data)
            writeCategory(clubName, true, container)
        } else {
            writeCategory(clubName, false, container)
        }
    })
}

function writeCategory(clubName, isInterested, container) {
    fetch('/getClubCategory', {method: 'POST', body: JSON.stringify({clubName: clubName}), headers: {'Content-Type': 'application/json'}})
    .then(function(response) {
        if (response.ok) return response.json();
        throw new Error('Request failed');
    })
    .then(function(data) {

        const form = document.createElement("form");
        form.action = "/registerClub";
        form.method = "POST";

        const inputName = document.createElement("input");
        inputName.type = "text";
        inputName.value = clubName;
        inputName.name = "clubName";
        inputName.id = "clubName";
        inputName.readOnly = true;
        inputName.style="width:30%; border-radius: 10px; background: white; color: #5c8ad0; margin-right: 5px;";

        const inputCategory = document.createElement("input");
        inputCategory.type = "text";
        inputCategory.value = data['clubCategory'];
        inputCategory.name = "category";
        inputCategory.id = "category";
        inputCategory.readOnly = true;
        inputCategory.style = "width:30%; border-radius: 10px; background: white; color: #5c8ad0; margin-right: 5px;"

        const formButton = document.createElement("input");
        formButton.className = "registerbtn";
        formButton.type = "submit";
        formButton.style = "width:30%; border-radius: 10px; background: #5c8ad0; color: #ffffff; font-weight: bold; margin-right: 5px;";

        if (isInterested) {
            formButton.value = "✓ Me interesa";
            formButton.disabled = true;
        } else {
            formButton.value = "- Presione para registrar interés -";
            formButton.disabled = false;
        }

        form.appendChild(inputName);
        form.appendChild(inputCategory);
        form.appendChild(formButton)

        container.appendChild(form);
    })
}

function getPopularCategories() {
    fetch('/getPopularCategories', {method: 'POST'})
    .then(function(response) {
        if (response.ok) return response.json();
        throw new Error('Request failed');
    })
    .then(function(data) {
        var alerta = 'Las categorías con más clubes son: \n\n';
        for (var i=0; i < 3; i++) {
            alerta = alerta + data[i]["_id"][0] + ": " + data[i]["count"] + "\n";
        }
        alert(alerta);
    })
}

function usersWithMostClubs() {
    fetch('/usersWithMostClubs', {method: 'POST'})
    .then(function(response) {
        if (response.ok) return response.json();
        throw new Error('Request failed');
    })
    .then(function(data) {
        var alerta = 'Los usuarios con más sugerencias son: \n\n';
        for (var i=0; i < 3; i++) {
            alerta = alerta + data[i]['nombre'][0]['fullname'] + ': ' + data[i]["count"] + "\n";
        }
        alert(alerta);
    })
}

function mostSuggestedClubs() {
    fetch('/mostSuggestedClubs', {method: 'POST'})
    .then(function(response) {
        if (response.ok) return response.json();
        throw new Error('Request failed');
    })
    .then(function(data) {
        var alerta = 'Los clubs más sugeridos son: \n\n';
        for (var i=0; i < data.length; i++) {
            alerta = alerta + data[i]['_id'][1] + ' - ' + data[i]["_id"][0] + ": " + data[i]["cantidad"] + "\n";;
        }
        alert(alerta);
    })
}

function lessSuggestedClubs() {
    fetch('/lessSuggestedClubs', {method: 'POST'})
    .then(function(response) {
        if (response.ok) return response.json();
        throw new Error('Request failed');
    })
    .then(function(data) {
        var alerta = 'Los clubs menos sugeridos son: \n\n';
        for (var i=0; i < data.length; i++) {
            alerta = alerta + data[i]['_id'][1] + ' - ' + data[i]["_id"][0] + ": " + data[i]["cantidad"] + "\n";;
        }
        alert(alerta);
    })
}
