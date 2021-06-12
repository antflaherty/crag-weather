fetch('/weather/fake/data')
  .then(response => response.json())
  .then(insertCragsIntoList);


function insertCragsIntoList(crags) {
    const list = document.getElementById('crags-list');
    crags.forEach(crag => {
        list.innerHTML += `<li>${crag.name}</li>`;
    })
}
