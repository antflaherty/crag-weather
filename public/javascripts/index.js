fetch('/weather/fake/data')
  .then(response => response.json())
  .then(insertCragsIntoList);


function insertCragsIntoList(crags) {
    const list = document.getElementById('crags-list');
    console.log(crags[0]);
    crags.forEach(crag => {
        list.innerHTML += `<li>${crag.name}<img src="${crag.forecast.current.condition.icon}"/></li>`;
    })
}