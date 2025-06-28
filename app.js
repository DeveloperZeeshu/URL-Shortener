const responseDiv = document.querySelector('#responseDiv');

const fetchShortUrl = async () => {
    const response = await fetch('/links');
    const links = await response.json();

    for (const [shortCode, url] of Object.entries(links)) {
        const li = document.createElement('li');
        const truncatedUrl = url.length >= 50 ? `${url.slice(0,50)}...` : url;
        li.innerHTML = `<a style='color: #168fbeff; font-weight: 500' href='/${shortCode}' target='_blank'>${window.location.origin}/${shortCode}</a> - ${truncatedUrl}`;

        responseDiv.appendChild(li);
    }
}

document.querySelector('#shorten-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const shortCode = formData.get('customUrl');

    try {
        const response = await fetch('/shorten', {
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, shortCode })
        });

        if (response.ok) {
            fetchShortUrl();
            window.location.reload();
        }
        else {
            const errorMessage = await response.text();
            alert(errorMessage);
        }
        e.target.reset();

    } catch (err) {
        console.log(err);
    }
})

fetchShortUrl();

