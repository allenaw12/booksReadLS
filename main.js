


document.querySelector('form').addEventListener('submit', getBooks)
    

function getBooks(e, start = 0, max = 10){
    e ? e.preventDefault() : ''
    let input = document.querySelector('#search').value
    let filter = document.querySelector('#choice').value
    filter === 'isbn' ? input : input = `"${input}"`
    if(filter.includes('-')){
        let both = input.split(',')
        filter = 'author'
        input = both[0] + '"+intitle:"' + both[1].trim()
    }
    //console.log(input, ',', filter, ',', start)
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
            if(total === 0 || total === undefined) return document.querySelector('#error').innerText = data.error ? `Error code: ${data.error.code} Message: ${data.error.message}`: 'No Results Found'
            data.items.forEach((obj,i)=> {
                // console.log('title: ', obj.volumeInfo.title, ',\n',//added
                //             'subtitle: ', obj.volumeInfo?.subtitle, ',\n',//added
                //             'authors: ',obj.volumeInfo.authors?.join(', '), ',\n',//added
                //             'categories: ',obj.volumeInfo.categories?.join(', '), ',\n',//added
                //             'description: ', obj.volumeInfo.description || obj.searchInfo?.textSnippet || 'No description available', ',\n',
                //             'google book listing: ',`https://books.google.com/books?id=${obj.id}`, ',\n',
                //             'pages: ', obj.volumeInfo?.pageCount, ',\n',
                //              obj.volumeInfo)
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
                document.querySelector('ol').appendChild(li)})
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