function locationSubmitListener(event) {
    const location = document.querySelector('input').value;
    fetch(`/weather/local?location=${location}`).then(console.log);
}

document.querySelector('button').addEventListener('click', locationSubmitListener);