//fetch results from API with search button or enter key press
document.querySelector('form').addEventListener('submit', getBooks)
//get books and create display cards
function getBooks(e, start = 0, max=+document.querySelector('#maxPerPage').value){
    e ? e.preventDefault() : ''
    console.log(e)
    //search term
    let input = searchTerm = document.querySelector('#search').value
    let alternate = document.querySelector('.search-power').innerText.split('"')[1]
    console.log(alternate)
    //if nothing, don't ping the API!
    if((e?.submitter && input === '')||(e.type !== 'submit' && alternate === undefined))return document.querySelector('#error').innerText = 'Please type a query into search field.'
    //unless you're just changing pages, then use this as input
    if(input === '') input = searchTerm = alternate
    //when switching pages, way to get search filter info (from previously loaded page display string)
    let altFilter = document.querySelector('.search-power').innerText.split(' ')[5]
    //what want to search within, author, title etc (depending what page or point of the search user is in it will pull from select input value or display string, it'll also slightly change depending on what filter was selected)
    let filter = filterDisplay = e.submitter ? document.querySelector('#choice').value : altFilter !== 'subject' ? 'in'+altFilter : altFilter
    //isbn search slightly different than precise othe searches
    filter === 'isbn' ? input : input = `"${input}"`
    //concatenate fetch for a search of both author and title
    if(filter.includes('-')){
        //get input and split at comma
        let both = input.split(',')
        //if someone doesn't use proper format to search this filter, display this message
        if(both.length<2)return document.querySelector('#error').innerText = 'Please type a valid query into search field.'
        //setting values to put into template literal for search url
        filter = 'author'
        input = `"${both[1].trim()}intitle:${both[0].trim()}"`
    }
    //resetting values before delivering search results
    document.querySelector('#my-lists').value = 'my-lists'
    document.querySelectorAll('li').forEach(el => el.remove())
    document.querySelectorAll('.page-links')?.forEach(el => el.remove())
    document.querySelector('#error').innerText = ''
    document.querySelector('.total').innerText = ''
    document.querySelector('.search-power').innerText = ''
    //adding padding on bottom for absolutely positioned footer
    document.querySelector('body').style.paddingBottom = '9rem'
    //smooth window scroll to top
    window.scroll({
        top: 0, 
        left: 0, 
        behavior: 'smooth' 
    })
    //putting string of fetch site together
    let fetching = `https://www.googleapis.com/books/v1/volumes?q=${filter}:${input.includes(' ') ? input.split(' ').join('%20'):input}&startIndex=${start}&maxResults=${max}&key=AIzaSyB8KFJLCXfinVWzxfnxcmyiT7f-XsmXd2Q`
    //this fetch string indicates specific info to send back, lowering data use
    // let fetching = `https://www.googleapis.com/books/v1/volumes?q=${filter}:${input.includes(' ') ? input.split(' ').join('%20'):input}&startIndex=${start}&maxResults=${max}&fields=totalItems,items(id,searchInfo(textSnippet),selfLink,volumeInfo(authors,categories,description,imageLinks,industryIdentifiers,pageCount,subtitle,title))&key=AIzaSyB8KFJLCXfinVWzxfnxcmyiT7f-XsmXd2Q`
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
            //error display for no results found
            if(total === 0 || total === undefined){
                //set padding to none since no items in body
                document.querySelector('body').style.paddingBottom = '0'
                return document.querySelector('#error').innerText = data.error ? `Error code: ${data.error.code} Message: ${data.error.message}`:'No Results Found'
            }
            //displaying total in DOM
            document.querySelector('.total').innerText = total
            //displaying a string with what was searched in what filter
            document.querySelector('.search-power').innerText = `Google Books search result${total===1 ? '' : 's'} in ${filterDisplay !== 'isbn' &&filterDisplay!=='subject' ? filterDisplay.slice(2) : filterDisplay} for "${searchTerm}": `
            //create 'cards' to display books matching search
            data.items.forEach((obj,i)=> {
                //declare/create elements to make book card
                let div = document.createElement('div')
                let local = document.createElement('span')
                let read = document.createElement('span')
                let tbr = document.createElement('span')
                let link = document.createElement('a')
                let img = document.createElement('img')
                let li = document.createElement('li')
                let art = document.createElement('article')
                let titleD = document.createElement('span')
                let authorD = document.createElement('span')
                let genreD = document.createElement('span')
                let descriptionD = document.createElement('span')
                let title = document.createElement('span')
                let author = document.createElement('span')
                let genre = document.createElement('span')
                let description = document.createElement('p')
                let pages = document.createElement('span')
                let isbn = document.createElement('span')
                //let [local, read, tbr,title,author,genre,pages,isbn].forEach(el=>document.createElement())
                //saving volume specific identifiers by iterating thru object
                let texts = obj.volumeInfo.industryIdentifiers?.map(el => `${el.type}: ${el.identifier}`)
                //link to JSON data for book = obj.selfLink
                //link to buy ebook or google books information = obj.volumeInfo.canonicalVolumeLink, obj.volumeInfo.infoLink
                //link to preview or google books info = obj.volumeInfo.previewLink
                    //if true, link goes to preview book page, if false goes to general book page
                console.log('preview',obj.volumeInfo?.previewLink, obj.volumeInfo?.previewLink.indexOf('printsec')>-1)
                    //if true, can purchase on play store, link to that, if false, general book page
                console.log('buy/info',obj.volumeInfo?.canonicalVolumeLink,obj.volumeInfo?.canonicalVolumeLink.indexOf('play.google')>-1)
                    //same as above, but has source in url that it's from google books api
                console.log('buy/info',obj.volumeInfo?.infoLink)
                    //JSON data for specific book
                console.log(obj.selfLink)
                //concatenating identifiers into single line to save/display
                isbn.innerText = texts?.join(', ')
                //declaring and adding classes to heart icon for read list and bookmark icon for tbr list
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
                //adding classes to elements
                art.classList.add('information')
                img.classList.add('thumbnail')
                description.classList.add('desc-short')
                //adding src to thumbnail image
                img.src = obj.volumeInfo.imageLinks?.thumbnail ||  obj.volumeInfo.imageLinks?.smallThumbnail ||'NoBookCover.png'
                //appending image and link elements to bigger book container
                link.appendChild(img)
                div.appendChild(link)
                //setting title/author/genre/discription/pages innertext with what's provide, or none available
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
                //reverse with less click && description.innerText.length > 350
                if(description.innerText.length > 400 || (title.innerText.length > 85 && description.innerText.length > 375)){
                    //console.log('long description', description.innerText.length, 'title length', title.innerText.length)
                    //create more/less link element
                    let more = document.createElement('a')
                    //set innerText
                    more.innerText = '...more'
                    //add classes for styling
                    more.classList.add(`id${obj.id}`)
                    more.classList.add('more-less')
                    //append to book card
                    art.appendChild(more)
                }                
                //append text holding container to bigger book container and then that to the li and then to the ol, also sets start attribute to ol so results are numbered correctly!
                div.appendChild(art)
                li.appendChild(div)
                document.querySelector('ol').setAttribute('start', `${start+1}`)
                document.querySelector('ol').appendChild(li)
            })
            //adding event listener to read icons for click event
            document.querySelectorAll('.read').forEach(li => li.addEventListener('click',() => {
                //get classes of list element holding icon
                let first  = li.attributes[0].value.split(' ')
                //getting entire li element and all it's HTML
                let string = document.querySelector(`li#${first[0]}`).outerHTML
                //add read class done for styling
                li.classList.add('done')
                //change style of heart from regular(outline) to solid
                li.classList.remove('fa-regular')
                li.classList.add('fa-solid')
                //making array of indices of spans in html string
                let spans = [...string.matchAll('span')]
                //creating a class variable to add to delete icon being added to read elements
                let trashClasses = `${first[0]}` + ' delete fa-solid fa-trash-can'
                //editing html string to have delete icon
                string = string.slice(0, spans[1].index-1)+`<span class="${trashClasses}"></span>`+string.slice(spans[4].index+5)
                //getting or setting local storage to save book in read list
                let storage = localStorage.getItem('read') ? JSON.parse(localStorage.getItem('read')) : []
                //adding book to string taken from local storage
                storage.push(string)
                //setting localstorage with new book added to read list
                localStorage.setItem('read', JSON.stringify(storage))
            }))
            //add event listener to bookmark icon to add tbr list on click
            document.querySelectorAll('.tbr').forEach(li => li.addEventListener('click',() => {
                //get classes of list element holding icon
                let first  = li.attributes[0].value.split(' ')
                //get entire lie element html that has the icon
                let string = document.querySelector(`li#${first[0]}`).outerHTML
                //add tbr class want for styling
                li.classList.add('want')
                //change style of bookmark from regular(outline) to solid
                li.classList.remove('fa-regular')
                li.classList.add('fa-solid')
                //making array of indices of spans in html string
                let spans = [...string.matchAll('span')]
                //creating a class variable to add to delete icon being added to tbr elements
                let trashClasses = `${first[0]}` + ' delete fa-regular fa-trash-can'
                //editing html string to have delete icon
                string = string.slice(0, spans[3].index-1)+`<span class="${trashClasses}"></span>`+string.slice(spans[4].index+5)
                //getting or setting local storage to save book in tbr list
                let storage = localStorage.getItem('tbr') ? JSON.parse(localStorage.getItem('tbr')) : []
                //adding book to string taken from local storage
                storage.push(string)
                //setting localstorage with new book added to tbr list
                localStorage.setItem('tbr', JSON.stringify(storage))
            }))
            //adding event listener to each more-less link created with long descriptions
            document.querySelectorAll('.more-less').forEach(link => link.addEventListener('click', () => {
                //getting classes from list element with link
                let first  = link.attributes[0].value.split(' ')
                //grabbing the description paragraph, whichi is sibling to link
                let el = link.previousSibling
                //checking if link has been clicked or not, is open or not, first check is if it has not been opened
                if(link.innerText === '...more'){
                    //add class to style to display all text
                    el.classList.add('desc-long')
                    //adding href for target id to keep focus on book
                    link.setAttribute('href',`#${first[0]}`)
                    //remove class for styling purposes
                    el.classList.remove('desc-short')
                    //change innertext to change back to short display
                    link.innerText = 'less'
                }else{
                    //add class for styling short display
                    el.classList.add('desc-short')
                    //remove class to style for long display
                    el.classList.remove('desc-long')
                    //change innertext back to more so folks know there's longer description
                    link.innerText = '...more'
                }
            }))
            //clears the text inside the input field
            document.querySelector('form').reset()
            //starts counter for pages to link to at bottom of page
            let pageLinks = 1
            //for loop to create page links, initializing at 0, while i is less than total results, and i increments by max (which is results shown per page)
            for(i=0;i<total;i+=+max){
                //create an anchor element
                let a = document.createElement('a')
                //set href to access this function again with click
                a.href = `javascript:getBooks('', ${i}, ${+max})`
                //set innertext to be the page number of results
                a.innerText = `${pageLinks}`
                //if page number corresponds to current page displaying, add class for styling
                console.log(i, start)
                if(i === start){
                    a.classList.add('current-page')
                }
                //add class for styling all pages links
                a.classList.add('page-links')
                //increment pageLinks variable
                pageLinks++
                //add element to pages container element
                document.querySelector('#pages').appendChild(a)
            }
        })
        //catch for errors
        .catch(err => {
            //clear padding bottom on body since no results to display
            document.querySelector('body').style.paddingBottom = '0'
            //display error on page and in console
            document.querySelector('#error').innerText = `Error: ${err}`
            console.log(`Error: ${err}`)})
}

//add event listener to display different amounts per page
document.querySelector('#maxPerPage').addEventListener('input', updatePageResults)
//function to run on results per page change
function updatePageResults(e){
    e?.preventDefault
    console.log(e)
    //get select input value to know how many results to display
    let count = document.querySelector('#maxPerPage').value
    let start = +document.querySelector('ol').getAttribute('start')
    //if start is not divisible by new count....need to reload current page including current start, but recounting, so basically need new start, but how to decide what new start should be based on current start...
    //if start is less than count => change start to 0
    //if start is greater than count => divide start by count, round up => that's the new page it would appear on, but actually ROUND DOWN so you can multiply count by that number, that is new start number
    start < count ? start = 0 : start = Math.floor(start/count)*count
    if(document.querySelector('#my-lists').value !== 'my-lists'){
        console.log('listing lots in a list!')
        return getList(e,start,count)
    }else{
        console.log('show more in a page!!')
        return getBooks(e,start,count)
    }
}

//add event listener on prev button for results display page progression
document.querySelector('#prev').addEventListener('click',previous)
//function to run on prev button press
function previous(e){
    //prevent default behaviour
    e?.preventDefault
    //get total display results, either from total element or string when in lists (since an empty string is falsy, if total doesn't have anything it'll automatically jump to get the search-power element innertext)
    let total = document.querySelector('.total').innerText || document.querySelector('.search-power').innerText.split(' ')[0]
    let max = +document.querySelector('#maxPerPage').value
    //pulls value of start attribute from ol element, allows numbering of items to happen seamlessly
    let start = +document.querySelector('ol').getAttribute('start')
    //if you hit prev at beginning of list jumps to last page and end of results
    //need to divide total results by results to display per page, round down and multiply that by per page, that is start
    //from first page if hit prev
    // if(start === 0) start = Math.floor(total/max)*max
    //if you are in lists, since we aren't querying the api, run getList function and scroll to top of window
    if(document.querySelector('#my-lists').value !== 'my-lists'){
        //return getList function
        return getList(e, start === 1 ? start = Math.floor(total/max)*max : start=start-max-1,max)
    }else{
        //if not in lists, return getBooks function
        return getBooks(e, start === 1 ? start = Math.floor(total/max)*max : start=start-max-1,max)}
}

//add event listener on next button for results display page progression
document.querySelector('#next').addEventListener('click',next)
//function to run on next button press
function next(e){
    //prevent default behaviour
    e?.preventDefault
    //get total display results, either from total element or string when in lists (since an empty string is falsy, if total doesn't have anything it'll automatically jump to get the search-power element innertext)
    let total = document.querySelector('.total').innerText || document.querySelector('.search-power').innerText.split(' ')[0]
    //pulls value of start attribute from ol element, allows numbering of items to happen seamlessly
    let start = +document.querySelector('ol').getAttribute('start')
    let max = +document.querySelector('#maxPerPage').value
    //if you hit next at the end of the list, math allows you to jump to first page
    // if(start+max-1 >= +total) start = 0-max+1
    //if you are in lists, since we aren't querying the api, run getList function and scroll to top of window
    if(document.querySelector('#my-lists').value !== 'my-lists'){
        //return getList function
        return getList(e, start+max >= +total? start = 0 : start=start+max-1, max)
    }else{
        //if not in lists, return getBooks function
        return getBooks(e, start+max >= +total? start = 0 : start=start+max-1, max)}
}

//add event listener on list select element for saved read and tbr lists from localstorage, activated when input in select element is changed
document.querySelector('#my-lists').addEventListener('input', getList)
//function to run on select element change
function getList(e,start=0,max=+document.querySelector('#maxPerPage').value){
    //prevent default behaviour
    e?.preventDefault
    //remove any current search results/list results/errors from page
    document.querySelector('.total').innerText = ''
    document.querySelectorAll('li').forEach(el => el.remove())
    document.querySelectorAll('.page-links').forEach(el => el.remove())
    document.querySelector('#error').innerText = ''
    //get select input value to know which list to pull from localstorage
    let value = document.querySelector('#my-lists').value
    //get string from storage and parse into array of objects
    let storage = JSON.parse(localStorage.getItem(`${value}`))
    //get length of storage(total items to display)
    let total = storage.length
    //if no books have been saved to selected list
    if(!storage || storage.length === 0){
        //remove padding needed for footer since no results displaying
        document.querySelector('body').style.paddingBottom = '0'
        //let user know they have no books saved
        return document.querySelector('#error').innerHTML = "You haven't saved any books yet!"
    }
    //since we know we have books, add that padding to the bottom for the footer
    document.querySelector('body').style.paddingBottom = '9rem'
    console.log(storage)
    //set page of list displays set to desired display results number from start number
    let pageDisplay = storage.slice(start, start+max)
    //from number of results sliced out of storage array, for each creating book 'card'
    pageDisplay.forEach((book,i) => {
        //create variable for element to put results from localstorage books into
        let books = document.querySelector('.books')
        //if it's already started, concatenate it, otherwise start it
        books.innerHTML ? books.innerHTML += book : books.innerHTML=book
    })
    //add event listeners to all delete icons for either list type
    document.querySelectorAll('.delete').forEach(li => li.addEventListener('click',() => {
        //get list of classes from li elements and split by space into array
        let first  = li.attributes[0].value.split(' ')
        //get html of li with that class of id just taken
        let string = document.querySelector(`li#${first[0]}`).outerHTML
        console.log(string)
        //get from select element which list you are in
        let value = document.querySelector('#my-lists').value
        //get storage of proper list from given value
        let storage = JSON.parse(localStorage.getItem(`${value}`))
        console.log(storage.indexOf(string))
        //using splice to delete the book from the storage string, deletes in place
        storage.splice(storage.indexOf(string),1)
        console.log(storage)
        //setting new localstorage with book deleted
        localStorage.setItem(`${value}`, JSON.stringify(storage))
        //call this function again to reload list
        getList(e,start)
    }))
    //adding event listeners to all read icons if they exist(thus the ?.)
    document.querySelectorAll('.read')?.forEach(li => li.addEventListener('click',() => {
        //get classes of list element holding icon
        let first  = li.attributes[0].value.split(' ')
        //getting entire li element and all it's HTML
        let string = document.querySelector(`li#${first[0]}`).outerHTML
        //get from select element which list you are in
        let value = document.querySelector('#my-lists').value
        //get storage of proper list from given value
        let storage = JSON.parse(localStorage.getItem(`${value}`))
        console.log(storage.indexOf(string))
        ////using splice to delete the book from the storage string, deletes in place, but places removed item into newStore variable
        let newStore = storage.splice(storage.indexOf(string),1)
        console.log(storage)
        //setting new localstorage with book deleted
        localStorage.setItem(`${value}`, JSON.stringify(storage))
        //checking if read list already exists or creating it if it doesn't
        let otherStore = localStorage.getItem('read') ? JSON.parse(localStorage.getItem('read')) : []
        //making array of span element indices
        let spans = [...newStore[0].matchAll('span')]
        //removing from newStore item the heart icon, since it'll be in the read list already
        newStore = newStore[0].slice(0, spans[1].index-1)+newStore[0].slice(spans[2].index+5)
        //adding book from tbr to read localstorage string
        otherStore.push(newStore)
        //setting new read list storage with new book added
        localStorage.setItem(`read`, JSON.stringify(otherStore))
        getList(e, start)
    }))
    //adding event listener to each more-less link created with long descriptions
    document.querySelectorAll('.more-less').forEach(link => link.addEventListener('click', () => {
        //getting classes from list element with link
        let first  = link.attributes[0].value.split(' ')
        //grabbing the description paragraph, which is sibling to link
        let el = link.previousSibling
        //checking if link has been clicked or not, is open or not, first check is if it has not been opened
        if(link.innerText === '...more'){
            //add class to style to display all text
            el.classList.add('desc-long')
            //remove class for styling purposes
            el.classList.remove('desc-short')
            //adding href for target id to keep focus on book
            link.setAttribute('href',`#${first[0]}`)
            //change innertext to change back to short display
            link.innerText = 'less'
        }else{
            //add class for styling short display
            el.classList.add('desc-short')
            //remove class to style for long display
            el.classList.remove('desc-long')
            //change innertext back to more so folks know there's longer description
            link.innerText = '...more'
        }
    }))
    //displaying a string with what was searched in what filter
    document.querySelector('.search-power').innerText = `${total} Google Books saved result${total===1 ? '' : 's'} from your ${value==='read'?'Read':'TBR'} list`
    //starts counter for pages to link to at bottom of page
    let pageLinks = 1
    //for loop to create page links, initializing at 0, while i is less than number in storage(storage.length), and i increments by max (which is results shown per page)
    for(i=0;i<storage.length;i+=+max){
        //create an anchor element
        let a = document.createElement('a')
        //set href to access this function again with click
        a.href = `javascript:getList('', ${i},${+max})`
        //set innertext to be the page number of results
        a.innerText = `${pageLinks}`
        //if page number corresponds to current page displaying, add class for styling
        console.log(i, start)
        if(i === start){
            a.classList.add('current-page')
        }
        //add class for styling all pages links
        a.classList.add('page-links')
        //increment pageLinks variable
        pageLinks++
        //add element to pages container element
        document.querySelector('#pages').appendChild(a)
    }
    //smooth window scroll to top
    window.scroll({
        top: 0, 
        left: 0, 
        behavior: 'smooth' 
        })
    //sets start attribute to ol so results are numbered correctly
    document.querySelector('ol').setAttribute('start', `${start+1}`)
}