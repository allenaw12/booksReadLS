
fetch('https://www.googleapis.com/books/v1/volumes?q=intitle:jurassic%20park%20survivor&startIndex=0&maxResults=20')
    .then(res => res.json())
    .then(data => {
        console.log(data)
        console.log(data.items)
        data.items.forEach(obj => {
            let li = document.createElement('li')
            li.innerText = obj.volumeInfo.title
            document.querySelector('ul').appendChild(li)})
    })