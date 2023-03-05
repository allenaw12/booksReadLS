//suggestion to change string from outerhtml into local storage into a js object and then parse back out...so like take what's in the innertext and put in local and then use to display when lists are requested...
//could use fetch function to build, just check if need a fetch or not...need to refactor whole function for it, but it can be done!


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
        input = `"${both[1].trim()}intitle:${both[0].trim()}"`
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
            document.querySelector('.total').innerText = total
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
                let div = document.createElement('div')
                let local = document.createElement('span')
                let read = document.createElement('span')
                let tbr = document.createElement('span')
                //let trash = document.createElement('span')
                let link = document.createElement('a')
                let img = document.createElement('img')
                let li = document.createElement('li')
                let art = document.createElement('article')
                let title = document.createElement('span')
                let author = document.createElement('span')
                let genre = document.createElement('span')
                let description = document.createElement('p')
                let pages = document.createElement('span')
                if(i==0){
                    li.classList.add('counter')
                    li.value = start+1
                }
                let readClasses = `id${obj.id}` + ' read fa-regular fa-heart'
                let tbrClasses = `id${obj.id}` + ' tbr fa-regular fa-bookmark'
                //let trashClasses = `id${obj.id}` + ' delete fa-regular fa-trash-can'
                readClasses.split(' ').forEach(el => read.classList.add(el))
                tbrClasses.split(' ').forEach(el => tbr.classList.add(el))
                //trashClasses.split(' ').forEach(el => trash.classList.add(el))
                div.classList.add('container')
                // li.classList.add(`id${obj.id}`)
                li.setAttribute('id',`id${obj.id}`)
                console.log(`id${obj.id}`)
                // title.classList.add(obj.id)
                local.appendChild(read)
                local.appendChild(tbr)
                // local.appendChild(trash)
                div.appendChild(local)
                // li.appendChild(local)
                link.href = `https://books.google.com/books?id=${obj.id}`
                link.target = '_blank'
                art.classList.add('information')
                img.classList.add('thumbnail')
                description.classList.add('desc-short')
                img.src = obj.volumeInfo.imageLinks?.thumbnail ||  obj.volumeInfo.imageLinks?.smallThumbnail ||'NoBookCover.png'
                link.appendChild(img)
                div.appendChild(link)
                // li.appendChild(link)
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
                //display partial description if over a certain length and not between a certain lengths(in case it's barely over)
                //get length, put set height on box and overflow hidden, add more link element
                //click event listener on more link, onclick change to less link, overflow visable and no set height
                //reverse with less click   && description.innerText.length > 350
                if(description.innerText.length > 400 || (title.innerText.length > 85 && description.innerText.length > 375)){
                    console.log('long description', description.innerText.length, 'title length', title.innerText.length)
                    let more = document.createElement('a')
                    //more.href = `#id${obj.id}`
                    more.innerText = '...more'
                    more.classList.add(`id${obj.id}`)
                    more.classList.add('more-less')
                    art.appendChild(more)
                }
                //wanted to style first word to be bold, but it takes whole line, need to change-------------------
                for(let child of art.children){
                    child.classList.add('descriptor')
                }
                div.appendChild(art)
                li.appendChild(div)
                // li.appendChild(art)
                document.querySelector('ol').appendChild(li)
            })
                ////event listener to each heart that gets the entire li element, changes it to string, parses it back and puts into error element
            document.querySelectorAll('.read').forEach(li => li.addEventListener('click',() => {
                let first  = li.attributes[0].value.split(' ')
                let string = document.querySelector(`li#${first[0]}`).outerHTML
                if(string.indexOf('class="counter"') > -1){
                    console.log('counter in element')
                    let end = string.indexOf('id')
                    string = string.slice(0,4) + string.slice(end)
                }
                let spans = [...string.matchAll('span')]
                let trashClasses = `${first[0]}` + ' delete fa-regular fa-trash-can'
                // console.log(string.slice(0, spans[1].index-1)+`<span class="${trashClasses}"></span>`+string.slice(spans[4].index+5))
                string = string.slice(0, spans[1].index-1)+`<span class="${trashClasses}"></span>`+string.slice(spans[4].index+5)
                console.log(string)
                let storage = localStorage.getItem('read') ? JSON.parse(localStorage.getItem('read')) : []
                storage.push(string)
                localStorage.setItem('read', JSON.stringify(storage))
            }))
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
                console.log(string)
                let storage = localStorage.getItem('tbr') ? JSON.parse(localStorage.getItem('tbr')) : []
                storage.push(string)
                localStorage.setItem('tbr', JSON.stringify(storage))
            }))
            // document.querySelectorAll('.delete').forEach(li => li.addEventListener('click',() => {
            //     console.log('I hear you')
                // let value = document.querySelector('#my-lists').value
                // let first = li.attributes[0].value.split(' ')
                // let string = document.querySelector(`li.${first[0]}`).outerHTML
                // console.log(value, first, string)
                //let storage = localStorage.getItem(`${value}`) ? JSON.parse(localStorage.getItem('tbr')) : []
                //storage.push(string)
                //localStorage.setItem('tbr', JSON.stringify(storage))
            // }))
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
    e?e.preventDefault:''
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
            console.log(book.slice(0, 3) + classCounter + book.slice(4))
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
        console.log('I hear you want to delete')
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
        console.log('you want to move to read!')
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