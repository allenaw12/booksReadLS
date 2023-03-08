//fetch results from API with search button or enter key press
document.querySelector('form').addEventListener('submit', getBooks)
//get books and create display cards
function getBooks(e, start = 0, max = 10){
    e ? e.preventDefault() : ''
    //search term
    let input = document.querySelector('#search').value
    //if nothing, don't ping the API!
    if(input === ''){return document.querySelector('#error').innerText = 'Please type a query into search field.'}
    //what want to search within, author, title etc
    let filter = document.querySelector('#choice').value
    //isbn search slightly different than precise othe searches
    filter === 'isbn' ? input : input = `"${input}"`
    //concatenate fetch for a search of both author and title
    if(filter.includes('-')){
        let both = input.split(',')
        filter = 'author'
        input = `"${both[1].trim()}intitle:${both[0].trim()}"`
    }
    //resetting values before delivering search results
    document.querySelector('#my-lists').value = 'my-lists'
    document.querySelectorAll('li').forEach(el => el.remove())
    document.querySelectorAll('a').forEach(el => el.remove())
    document.querySelector('#error').innerText = ''
    //putting string of fetch site together
    let fetching = `https://www.googleapis.com/books/v1/volumes?q=${filter}:${input.includes(' ') ? input.split(' ').join('%20'):input}&startIndex=${start}&maxResults=${max}&key=AIzaSyB8KFJLCXfinVWzxfnxcmyiT7f-XsmXd2Q`
    console.log(fetching)
    //fetch from API
    fetch(fetching)
        //get response into JSON data
        .then(res => res.json())
        //use that data!
        .then(data => {
            //total items found matching search
            let total = data.totalItems
            console.log(data)
            //displaying total in DOM
            document.querySelector('.total').innerText = total
            //error display for no results found
            if(total === 0 || total === undefined) return document.querySelector('#error').innerText = data.error ? `Error code: ${data.error.code} Message: ${data.error.message}`:'No Results Found'
            //create 'cards' to display books matching search
            data.items.forEach((obj,i)=> {
                //declare/create elements to make card
                let div = document.createElement('div')
                let local = document.createElement('span')
                let read = document.createElement('span')
                let tbr = document.createElement('span')
                let link = document.createElement('a')
                let img = document.createElement('img')
                let li = document.createElement('li')
                let art = document.createElement('article')
                let title = document.createElement('span')
                let author = document.createElement('span')
                let genre = document.createElement('span')
                let description = document.createElement('p')
                let pages = document.createElement('span')
                let isbn = document.createElement('span')
                //setting counter so results list can be numerated
                if(i==0){
                    li.classList.add('counter')
                    li.value = start+1
                }
                //saving volume specific identifiers by iterating thru object
                let texts = obj.volumeInfo.industryIdentifiers.map(el => `${el.type}: ${el.identifier}`)
                //link to JSON data for book = obj.selfLink
                //link to buy ebook or google books information = obj.volumeInfo.canonicalVolumeLink, obj.volumeInfo.infoLink
                //link to preview or google books info = obj.volumeInfo.previewLink
                console.log(obj.selfLink)
                //concatenating identifiers into single line to save/display
                isbn.innerText = texts.join(', ')
                //declareing and adding classes to heart icon for read list and bookmark icon for tbr list
                let readClasses = `id${obj.id}` + ' read fa-regular fa-heart'
                let tbrClasses = `id${obj.id}` + ' tbr fa-regular fa-bookmark'
                readClasses.split(' ').forEach(el => read.classList.add(el))
                tbrClasses.split(' ').forEach(el => tbr.classList.add(el))
                //adding a class to the outer div element
                div.classList.add('container')
                //adding id to list element to differeniate from other li elements
                li.setAttribute('id',`id${obj.id}`)
                //appending icons to holding element
                local.appendChild(read)
                local.appendChild(tbr)
                //appending icons holder to bigger book container
                div.appendChild(local)
                //creating link to book listing in API
                link.href = `https://books.google.com/books?id=${obj.id}`
                //open link in separate window
                link.target = '_blank'
                //adding classes
                art.classList.add('information')
                img.classList.add('thumbnail')
                description.classList.add('desc-short')
                //adding src to thumbnail image
                img.src = obj.volumeInfo.imageLinks?.thumbnail ||  obj.volumeInfo.imageLinks?.smallThumbnail ||'NoBookCover.png'
                //appending image and link elements to bigger book container
                link.appendChild(img)
                div.appendChild(link)
                //setting title/author/genre/discription/pages display with what's provide, or none available
                title.innerText = `Title: ${obj.volumeInfo.title || 'None provided'}${obj.volumeInfo.subtitle ? `: ${obj.volumeInfo.subtitle}` : ''}`
                author.innerText = `Author(s): ${obj.volumeInfo.authors?.join(', ') || 'None provided'}`
                genre.innerText = `Genre(s): ${obj.volumeInfo.categories?.join(', ') || 'None provided'}`
                description.innerText = `Description: ${obj.volumeInfo.description || obj.searchInfo?.textSnippet || 'None available'}`
                pages.innerText = `Pagecount: ${obj.volumeInfo?.pageCount || 'Not available'}`
                //appending all elements in order desired to text container
                art.appendChild(title)
                art.appendChild(author)
                art.appendChild(genre)
                art.appendChild(pages)
                art.appendChild(description)
                //display partial description if over a certain length and not between a certain lengths(in case it's barely over)
                //get length, put set height on box and overflow hidden, add more link element
                //click event listener on more link, onclick change to less link, overflow visable and no set height
                //reverse with less click   && description.innerText.length > 350
                if(description.innerText.length > 400 || (title.innerText.length > 85 && description.innerText.length > 375)){
                    console.log('long description', description.innerText.length, 'title length', title.innerText.length)
                    let more = document.createElement('a')
                    more.innerText = '...more'
                    more.classList.add(`id${obj.id}`)
                    more.classList.add('more-less')
                    art.appendChild(more)
                }
                //wanted to style first word to be bold, but it takes whole line, need to change-------------------
                for(let child of art.children){
                    child.classList.add('descriptor')
                }
                //append text holding container to bigger book container and then that to the li and then to the ol!
                div.appendChild(art)
                li.appendChild(div)
                document.querySelector('ol').appendChild(li)
            })
            //adding event listener to read icons for click event
            document.querySelectorAll('.read').forEach(li => li.addEventListener('click',() => {
                //get classes of list element holding icon
                let first  = li.attributes[0].value.split(' ')
                //getting entire li element and all it's HTML
                let string = document.querySelector(`li#${first[0]}`).outerHTML
                //editing html if class counter is detected, and removing that class
                if(string.indexOf('class="counter"') > -1){
                    console.log('counter in element')
                    let end = string.indexOf('id')
                    string = string.slice(0,4) + string.slice(end)
                }
                //making array of indices of spans in html string
                let spans = [...string.matchAll('span')]
                //creating a class variable to add to delete icon being added to read and tbr elements
                let trashClasses = `${first[0]}` + ' delete fa-regular fa-trash-can'
                //editing html string to have delete icon
                string = string.slice(0, spans[1].index-1)+`<span class="${trashClasses}"></span>`+string.slice(spans[4].index+5)
                //getting or setting local storage to save book in read list
                let storage = localStorage.getItem('read') ? JSON.parse(localStorage.getItem('read')) : []
                //adding book to string gotten from local storage
                storage.push(string)
                //setting localstorage with new book added to read list
                localStorage.setItem('read', JSON.stringify(storage))
            }))
            //add event listener to bookmark icon to add tbr list on click
            document.querySelectorAll('.tbr').forEach(li => li.addEventListener('click',() => {
                let first  = li.attributes[0].value.split(' ')
                let string = document.querySelector(`li#${first[0]}`).outerHTML
                if(string.indexOf('class="counter"') > -1){
                    console.log('counter in element')
                    let end = string.indexOf('id')
                    string = string.slice(0,4) + string.slice(end)
                }
                let spans = [...string.matchAll('span')]
                let trashClasses = `${first[0]}` + ' delete fa-regular fa-trash-can'
                // console.log(string.slice(0, spans[3].index-1)+`<span class="${trashClasses}"></span>`+string.slice(spans[4].index+5))
                string = string.slice(0, spans[3].index-1)+`<span class="${trashClasses}"></span>`+string.slice(spans[4].index+5)
                //console.log(string)
                let storage = localStorage.getItem('tbr') ? JSON.parse(localStorage.getItem('tbr')) : []
                storage.push(string)
                localStorage.setItem('tbr', JSON.stringify(storage))
            }))
            document.querySelectorAll('.more-less').forEach(link => link.addEventListener('click', () => {
                let first  = link.attributes[0].value.split(' ')
                let el = link.previousSibling
                if(link.innerText === '...more'){
                    el.classList.add('desc-long')
                    el.classList.remove('desc-short')
                    link.innerText = 'less'
                }else{
                    el.classList.add('desc-short')
                    el.classList.remove('desc-long')
                    link.innerText = '...more'
                }
            }))
            let pageLinks = 1
            for(i=0;i<total;i+=max){
                let a = document.createElement('a')
                a.href = `javascript:getBooks(${null}, ${i})`
                a.innerText = `${pageLinks}`
                if(i === start){
                    a.classList.add('current-page')
                }
                pageLinks++
                document.querySelector('#pages').appendChild(a)
            }
        })
        .catch(err => console.log(`Error: ${err}`))
}

document.querySelector('#next').addEventListener('click',next)
function next(e){
    e ? e.preventDefault : ''
    let total = document.querySelector('.total').innerText
    let start = +document.querySelector('.counter').value
    //if you hit next at the end of the list, jumps to first page
    if(start+9 >= +total) start = 0-9
    if(document.querySelector('#my-lists').value !== 'my-lists'){
        window.scroll({
            top: 0, 
            left: 0, 
            behavior: 'smooth' 
           })
        return getList(null, start+9)
    }else{
        return getBooks(null, start+9)}
}

document.querySelector('#prev').addEventListener('click',previous)
function previous(e){
    e ? e.preventDefault : ''
    let total = document.querySelector('.total').innerText
    let start = +document.querySelector('.counter').value
    //total divided by number per page(10) rounded down, times number per page(10)
    //from first page if hit prev
    if(start-11 < 0) start = (Math.floor(total/10)*10)+11
    if(document.querySelector('#my-lists').value !== 'my-lists'){
        window.scroll({
            top: 0, 
            left: 0, 
            behavior: 'smooth' 
           })
        return getList(null, start-11)
    }else{
        return getBooks(null, start-11)}
}

document.querySelector('#my-lists').addEventListener('input', getList)
function getList(e,start=0,max=10){
    e ? e.preventDefault : ''
    document.querySelectorAll('li').forEach(el => el.remove())
    document.querySelectorAll('a').forEach(el => el.remove())
    document.querySelector('#error').innerText = ''
    let total = document.querySelector('.total')
    let value = document.querySelector('#my-lists').value
    let storage = JSON.parse(localStorage.getItem(`${value}`))
    if(!storage || storage.length === 0){
        return document.querySelector('#error').innerHTML = "You haven't saved any books yet!"
    }
    console.log(storage)
    let pageDisplay = storage.slice(start, start+max)
    pageDisplay.forEach((book,i) => {
        // if(book.indexOf('class="counter"') > -1){
        //     console.log('counter in element')
        //     let end = book.indexOf('id')
            
        //     console.log(book = book.slice(0,4) + book.slice(end))
        // }else
        if(i===0){
            console.log('add counter for list')
            let classCounter = ` class="counter" value="${start+1}" `
            //console.log(book.slice(0, 3) + classCounter + book.slice(4))
            book = book.slice(0, 3) + classCounter + book.slice(4)
        }
        //let spans = [...book.matchAll('delete')]
        //let entry = book.slice(0, spans[0].index) + 'listDelete' + book.slice(spans[0].index+6)
        //console.log(book.slice(0, spans[0].index) + 'listDelete' + book.slice(spans[0].index+6))
        let books = document.querySelector('.books')
        // books.innerHTML ? books.innerHTML += entry : books.innerHTML=entry
        books.innerHTML ? books.innerHTML += book : books.innerHTML=book
    })
    document.querySelectorAll('.delete').forEach(li => li.addEventListener('click',() => {
        //console.log('I hear you want to delete')
        let first  = li.attributes[0].value.split(' ')
        let string = document.querySelector(`li#${first[0]}`).outerHTML
        console.log(string)
        let value = document.querySelector('#my-lists').value
        // let first = li.attributes[0].value.split(' ')
        // let string = document.querySelector(`li.${first[0]}`).outerHTML
        // console.log(value, first, string)
        //let storage = localStorage.getItem(`${value}`) ? JSON.parse(localStorage.getItem('tbr')) : []
        let storage = JSON.parse(localStorage.getItem(`${value}`))
        console.log(storage.indexOf(string))
        let newStore = storage.splice(storage.indexOf(string),1)
        console.log(storage)
        localStorage.setItem(`${value}`, JSON.stringify(storage))
        window.scroll({
            top: 0, 
            left: 0, 
            behavior: 'smooth' 
           })
        getList()
    }))
    document.querySelectorAll('.read')?.forEach(li => li.addEventListener('click',() => {
        //console.log('you want to move to read!')
        // let first  = li.attributes[0].value.split(' ')
        // let string = document.querySelector(`li.${first[0]}`).outerHTML
        // let spans = [...string.matchAll('span')]
        // let trashClasses = `${first[0]}` + ' delete fa-regular fa-trash-can'
        // console.log(string.slice(0, spans[1].index-1)+`<span class="${trashClasses}"></span>`+string.slice(spans[4].index+5))
        // string = string.slice(0, spans[1].index-1)+`<span class="${trashClasses}"></span>`+string.slice(spans[4].index+5)
        // let storage = localStorage.getItem('read') ? JSON.parse(localStorage.getItem('read')) : []
        // storage.push(string)
        // localStorage.setItem('read', JSON.stringify(storage))
        let first  = li.attributes[0].value.split(' ')
        let string = document.querySelector(`li#${first[0]}`).outerHTML
        //console.log(string)
        let value = document.querySelector('#my-lists').value
        // let first = li.attributes[0].value.split(' ')
        // let string = document.querySelector(`li.${first[0]}`).outerHTML
        // console.log(value, first, string)
        //let storage = localStorage.getItem(`${value}`) ? JSON.parse(localStorage.getItem('tbr')) : []
        let storage = JSON.parse(localStorage.getItem(`${value}`))
        console.log(storage.indexOf(string))
        let newStore = storage.splice(storage.indexOf(string),1)
        console.log(storage)
        localStorage.setItem(`${value}`, JSON.stringify(storage))
        let otherStore = localStorage.getItem('read') ? JSON.parse(localStorage.getItem('read')) : []
        let spans = [...newStore[0].matchAll('span')]
        console.log(newStore[0].slice(0, spans[1].index-1)+ 'DONDE' +newStore[0].slice(spans[2].index+5))
        newStore = newStore[0].slice(0, spans[1].index-1)+newStore[0].slice(spans[2].index+5)
        otherStore.push(newStore)
        localStorage.setItem(`read`, JSON.stringify(otherStore))
        window.scroll({
            top: 0, 
            left: 0, 
            behavior: 'smooth' 
           })
        getList()
    }))
    document.querySelectorAll('.more-less').forEach(link => link.addEventListener('click', () => {
        let first  = link.attributes[0].value.split(' ')
        let el = link.previousSibling
        if(link.innerText === '...more'){
            el.classList.add('desc-long')
            el.classList.remove('desc-short')
            link.innerText = 'less'
        }else{
            el.classList.add('desc-short')
            el.classList.remove('desc-long')
            link.innerText = '...more'
        }
    }))
    total.innerText = storage.length
    let pageLinks = 1
    for(i=0;i<storage.length;i+=max){
        let a = document.createElement('a')
        a.href = `javascript:getList(${null}, ${i})`
        a.innerText = `${pageLinks}`
        if(i === start){
            a.classList.add('current-page')
        }
        pageLinks++
        document.querySelector('#pages').appendChild(a)
    }
}