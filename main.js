


document.querySelector('form').addEventListener('submit', getBooks)
    

function getBooks(e, start = 0){
    e ? e.preventDefault() : null
    let input = document.querySelector('#search').value
    let filter = document.querySelector('#choice').value 
    console.log(input, ',', filter, ',', start)
    document.querySelectorAll('li').forEach(el => el.remove())
    fetch(`https://www.googleapis.com/books/v1/volumes?q=in${filter}:${input}&startIndex=${start}&maxResults=10&key=AIzaSyB8KFJLCXfinVWzxfnxcmyiT7f-XsmXd2Q`)
        .then(res => res.json())
        .then(data => {
            let total = data.totalItems
            console.log(data, total)
            data.items.forEach((obj,i)=> {
                let img = document.createElement('img')
                let li = document.createElement('li')
                if(i==0){
                    li.classList.add('counter')
                    li.value = start+1
                }
                img.classList.add('thumbnail')
                img.src= obj.volumeInfo.imageLinks?.smallThumbnail || obj.volumeInfo.imageLinks?.thumbnail || null
                li.innerText = obj.volumeInfo.title
                li.appendChild(img)
                document.querySelector('ol').appendChild(li)})
            for(i=0;i<total;i+=10){
                let li = document.createElement('li')
                let a = document.createElement('a')
                a.href = `javascript:getBooks(${null}, ${i})`
                a.innerText = `${i}`
                li.appendChild(a)
                document.querySelector('#pages').appendChild(a)
            }
        })
        .catch(err => console.log(`Error: ${err}`))
}

document.querySelector('#next').addEventListener('click',next)
function next(e){
    e ? e.preventDefault() : null
    let start = +document.querySelector('.counter').value
    return getBooks(null, start+9)
}
document.querySelector('#prev').addEventListener('click',previous)
function previous(e){
    e ? e.preventDefault() : null
    let start = +document.querySelector('.counter').value
    return getBooks(null, start-11)
}