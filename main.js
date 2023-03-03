
document.querySelector('form').addEventListener('submit', getBooks)

function getBooks(e, start = 0, max = 10){
    e ? e.preventDefault() : ''
    let input = document.querySelector('#search').value
    if(input === ''){return document.querySelector('#error').innerText = 'Please type a query into search field.'}
    let filter = document.querySelector('#choice').value
    filter === 'isbn' ? input : input = `"${input}"`
    if(filter.includes('-')){
        let both = input.split(',')
        filter = 'author'
        input = both[0] + '"+intitle:"' + both[1].trim()
    }
    //console.log(input, ',', filter, ',', start)
    document.querySelector('#my-lists').value = 'my-lists'
    document.querySelectorAll('li').forEach(el => el.remove())
    document.querySelectorAll('a').forEach(el => el.remove())
    document.querySelector('#error').innerText = ''
    let fetching = `https://www.googleapis.com/books/v1/volumes?q=${filter}:${input.includes(' ') ? input.split(' ').join('%20'):input}&startIndex=${start}&maxResults=${max}&key=AIzaSyB8KFJLCXfinVWzxfnxcmyiT7f-XsmXd2Q`
    console.log(fetching)
    fetch(fetching)
        .then(res => res.json())
        .then(data => {
            let total = data.totalItems
            console.log(data)
            if(total === 0 || total === undefined) return document.querySelector('#error').innerText = data.error ? `Error code: ${data.error.code} Message: ${data.error.message}`:'No Results Found'
            data.items.forEach((obj,i)=> {
                // console.log('title: ', obj.volumeInfo.title, ',\n',//added
                //             'subtitle: ', obj.volumeInfo?.subtitle, ',\n',//added
                //             'authors: ',obj.volumeInfo.authors?.join(', '), ',\n',//added
                //             'categories: ',obj.volumeInfo.categories?.join(', '), ',\n',//added
                //             'description: ', obj.volumeInfo.description || obj.searchInfo?.textSnippet || 'No description available', ',\n',
                //             'google book listing: ',`https://books.google.com/books?id=${obj.id}`, ',\n',
                //             'pages: ', obj.volumeInfo?.pageCount, ',\n',
                //              obj.volumeInfo)
                let local = document.createElement('span')
                let read = document.createElement('span')
                let tbr = document.createElement('span')
                let trash = document.createElement('span')
                let link = document.createElement('a')
                let img = document.createElement('img')
                let li = document.createElement('li')
                let art = document.createElement('article')
                let title = document.createElement('span')
                let author = document.createElement('span')
                let genre = document.createElement('span')
                let description = document.createElement('span')
                let pages = document.createElement('span')
                if(i==0){
                    li.classList.add('counter')
                    li.value = start+1
                }
                let readClasses = `id${obj.id}` + ' read fa-regular fa-heart'
                let tbrClasses = `id${obj.id}` + ' tbr fa-regular fa-bookmark'
                let trashClasses = `id${obj.id}` + ' delete fa-regular fa-trash-can'
                readClasses.split(' ').forEach(el => read.classList.add(el))
                tbrClasses.split(' ').forEach(el => tbr.classList.add(el))
                trashClasses.split(' ').forEach(el => trash.classList.add(el))
                li.classList.add(`id${obj.id}`)
                console.log(`id${obj.id}`)
                // title.classList.add(obj.id)
                local.appendChild(read)
                local.appendChild(tbr)
                local.appendChild(trash)
                li.appendChild(local)
                link.href = `https://books.google.com/books?id=${obj.id}`
                link.target = '_blank'
                art.classList.add('information')
                img.classList.add('thumbnail')
                img.src = obj.volumeInfo.imageLinks?.thumbnail ||  obj.volumeInfo.imageLinks?.smallThumbnail ||'NoBookCover.png'
                link.appendChild(img)
                li.appendChild(link)
                title.innerText = `Title: ${obj.volumeInfo.title || 'None provided'}${obj.volumeInfo.subtitle ? `: ${obj.volumeInfo.subtitle}` : ''}`
                author.innerText = `Author(s): ${obj.volumeInfo.authors?.join(', ') || 'None provided'}`
                genre.innerText = `Genre(s): ${obj.volumeInfo.categories?.join(', ') || 'None provided'}`
                description.innerText = `Description: ${obj.volumeInfo.description || obj.searchInfo?.textSnippet || 'None available'}`
                pages.innerText = `Pagecount: ${obj.volumeInfo?.pageCount || 'Not available'}`
                art.appendChild(title)
                art.appendChild(author)
                art.appendChild(genre)
                art.appendChild(pages)
                art.appendChild(description)
                for(let child of art.children){
                    child.classList.add('descriptor')
                }
                li.appendChild(art)
                document.querySelector('ol').appendChild(li)
            })
                ////event listener to each heart that gets the entire li element, changes it to string, parses it back and puts into error element
            document.querySelectorAll('.read').forEach(li => li.addEventListener('click',() => {
                let first  = li.attributes[0].value.split(' ')
                let string = document.querySelector(`li.${first[0]}`).outerHTML
                console.log(string)
                let storage = localStorage.getItem('read') ? JSON.parse(localStorage.getItem('read')) : []
                storage.push(string)
                localStorage.setItem('read', JSON.stringify(storage))
            }))
            document.querySelectorAll('.tbr').forEach(li => li.addEventListener('click',() => {
                let first  = li.attributes[0].value.split(' ')
                let string = document.querySelector(`li.${first[0]}`).outerHTML
                console.log(string)
                let storage = localStorage.getItem('tbr') ? JSON.parse(localStorage.getItem('tbr')) : []
                storage.push(string)
                localStorage.setItem('tbr', JSON.stringify(storage))
            }))
            let pageLinks = 1
            for(i=0;i<total;i+=10){
                let a = document.createElement('a')
                a.href = `javascript:getBooks(${null}, ${i})`
                a.innerText = `${pageLinks}`
                pageLinks++
                document.querySelector('#pages').appendChild(a)
            }
        })
        .catch(err => console.log(`Error: ${err}`))
}

document.querySelector('#next').addEventListener('click',next)
function next(e){
    e ? e.preventDefault : ''
    let start = +document.querySelector('.counter').value
    return getBooks(null, start+9)
}

document.querySelector('#prev').addEventListener('click',previous)
function previous(e){
    e ? e.preventDefault : ''
    let start = +document.querySelector('.counter').value
    return getBooks(null, start-11)
}

document.querySelector('#my-lists').addEventListener('input', () =>{
    document.querySelectorAll('li').forEach(el => el.remove())
    document.querySelectorAll('a').forEach(el => el.remove())
    document.querySelector('#error').innerText = ''
    let value = document.querySelector('#my-lists').value
    let storage = JSON.parse(localStorage.getItem(`${value}`))
    if(!storage){
        return document.querySelector('#error').innerHTML = "You haven't saved any books yet!"
    }
    console.log(storage)
    storage.forEach(book => {
        let spans = [...book.matchAll('delete')]
        let entry = book.slice(0, spans[0].index) + 'listDelete' + book.slice(spans[0].index+6)
        console.log(book.slice(0, spans[0].index) + 'listDelete' + book.slice(spans[0].index+6))
        let books = document.querySelector('.books')
        books.innerHTML ? books.innerHTML += entry : books.innerHTML=entry
    })
})