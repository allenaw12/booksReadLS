


document.querySelector('form').addEventListener('submit', getBooks)
    

function getBooks(e, start = 0, max = 10){
    e ? e.preventDefault() : ''
    let input = document.querySelector('#search').value
    let filter = document.querySelector('#choice').value
    if(filter.includes('-')){
        let both = input.split(', ')
        filter = 'author'
        input = both[0] + '"+intitle:"' + both[1]
    }
    //console.log(input, ',', filter, ',', start)
    document.querySelectorAll('li').forEach(el => el.remove())
    document.querySelectorAll('a').forEach(el => el.remove())
    // document.querySelector('#pages').innerText = ''
    let fetching = `https://www.googleapis.com/books/v1/volumes?q=in${filter}:"${input.includes(' ') ? input.split(' ').join('%20'):input}"&startIndex=${start}&maxResults=${max}&key=AIzaSyB8KFJLCXfinVWzxfnxcmyiT7f-XsmXd2Q`
    console.log(fetching)
    fetch(fetching)
        .then(res => res.json())
        .then(data => {
            let total = data.totalItems
            console.log(data)
            data.items.forEach((obj,i)=> {
                // console.log('title: ', obj.volumeInfo.title, ',\n',//
                //             'subtitle: ', obj.volumeInfo?.subtitle, ',\n',//
                //             'authors: ',obj.volumeInfo.authors?.join(', '), ',\n',
                //             'categories: ',obj.volumeInfo.categories?.join(', '), ',\n',
                //             'description: ', obj.volumeInfo.description || obj.searchInfo?.textSnippet || 'No description available', ',\n',
                //             'google book listing: ',`https://books.google.com/books?id=${obj.id}`, ',\n',
                //             'pages: ', obj.volumeInfo?.pageCount, ',\n',
                //              obj.volumeInfo)
                let img = document.createElement('img')
                let li = document.createElement('li')
                let title = document.createElement('span')
                if(i==0){
                    li.classList.add('counter')
                    li.value = start+1
                }
                title.classList.add('descriptor')
                img.classList.add('thumbnail')
                img.src= obj.volumeInfo.imageLinks?.smallThumbnail || obj.volumeInfo.imageLinks?.thumbnail || 'NoBookCover.png'
                li.appendChild(img)
                title.innerText = `Title: ${obj.volumeInfo.title}${obj.volumeInfo.subtitle ? `: ${obj.volumeInfo.subtitle}` : ''}`
                li.appendChild(title)
                document.querySelector('ol').appendChild(li)})
            let pageLinks = 1
            for(i=0;i<total;i+=10){
                // if(i===0 && pageLinks>1){
                //     console.log('pages greater than 1', pageLinks)
                //     pageLinks = 1}
                let a = document.createElement('a')
                a.href = `javascript:getBooks(${null}, ${i})`
                a.innerText = `${pageLinks}`
                pageLinks++
                console.log(pageLinks)
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