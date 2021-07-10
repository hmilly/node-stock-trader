const socket = io();
const select = (item) => document.querySelector(`.${item}`)
const stockMain = select("stock-main")
const usersMain = select("users-main")

const errorMsg = (msg) => {
    const h4Exists = select("h4")
    if (!h4Exists) {
        const h1 = select("head")
        const h4 = document.createElement("h4")
        h4.classList = "h4"
        h4.innerText = msg
        h1.append(h4);
        setTimeout(() => h4.remove(), 5000
        )
    }
}

socket.on("updateStock", (stockData) => {
    stockData.map((stock, i) => {
        const stockNum = select(`stock${i + 1}`)
        stockNum.innerText =
            `${stock.currentPrice ? stock.currentPrice : stock.lastPrice}`
    })
})

socket.once("closedMarkets", msg => {
    const stockHeader = select("head")
    const h4 = document.createElement("h4")
    h4.innerText = msg
    stockHeader.prepend(h4);
})

let currentUser
socket.once("printUsers", (userData) => {
    userData.map((user, i) => {
        select("user-balance").innerHTML += `
            ${user.balance}`
        select("user-total").innerHTML += `
            ${user.balance}`
        userData[i].transactions.map(data => {
            select(`user-stocks`).innerHTML += `
        <span>
            <h4 class="company-name">${data.shareName}:</h4>
            <h4 class="quantity">${data.quantity}</h4>
        </span>`
        })
    })

    const userbutton = document.querySelectorAll(".user-btn")
    userbutton.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            // removes prev user
            userbutton.forEach(b => {
                b.parentElement.classList.remove("active")
                b.innerText = "Select user"
            })
            const userDiv = e.path[1]
            //sets current user
            userDiv.classList.add('active')
            btn.innerText = "Current User"

            let shareObj = []
            const userShares = userDiv.querySelectorAll(".shares-div")
            userShares.forEach(s => {
                const companyName = s.querySelector(".company-name").innerText
                const quantity = s.querySelector(".quantity").innerText
                shareObj.push({ companyName, quantity })
            })

            currentUser = {
                userDiv: userDiv,
                name: userDiv.querySelector(".username").innerText,
                balance: parseInt(userDiv.querySelector(".user-balance").innerText),
                shares: shareObj
            }
        })
    })
})

const addBtns = document.querySelectorAll(".add1")
const minusBtns = document.querySelectorAll(".minus1")

addBtns.forEach(btn => btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.path[1].querySelector(".quantity").value++
}))
minusBtns.forEach(btn => btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (e.path[1].querySelector(".quantity").value > 0) {
        e.path[1].querySelector(".quantity").value--
    }
}))

const buyBtns = document.querySelectorAll(".buy-btn")
const sellBtn = document.querySelectorAll(".sell-btn")

const buySell = (bs) => bs.forEach(btn => btn.addEventListener("click", (e) => {
    e.preventDefault();
    const stockName = btn.parentElement.querySelector(".stock-name").innerText
    const buttonName = e.path[0].className
    //reset form to 0 after selection
    let inputVal = e.path[1].querySelector(".quantity").value
    inputVal = Number(inputVal)
    let currentPrice = e.path[1].querySelector(".stock-price").innerText
    currentPrice = Number(currentPrice)
    e.path[1].querySelector(".quantity").value = 0

    let usersStock
    const equation = inputVal * currentPrice
    const selectedUser = document.querySelector(".active")
    !selectedUser
        ? errorMsg("No user selected, please make a selection")
        : usersStock = selectedUser.querySelectorAll(".shares-div")

    const updateShares = (sign) =>
        usersStock.forEach(div => {
            if (div.firstElementChild.innerText.includes(stockName)) {
                let num = Number(div.lastElementChild.innerText)
                //console.log(num, inputVal, num - inputVal)
                if (sign === "m" && num - inputVal >= 0) {
                    currentUser.balance += equation
                    num -= inputVal
                    div.lastElementChild.innerText = num
                } else if (sign === "p") {
                    currentUser.balance -= equation
                    num += inputVal
                    div.lastElementChild.innerText = num
                } else {
                    errorMsg("User does not own any of this stock! Please make another selection")
                }
                selectedUser.querySelector("p").innerText = (currentUser.balance).toFixed(2)
            }
        })

    if (inputVal > 0 && buttonName === "buy-btn") {
        equation <= currentUser.balance
            ? updateShares("p")
            : errorMsg("Balance too low to purchase stock! Please make another selection")
    } else if (inputVal > 0 && buttonName === "sell-btn") {
        updateShares("m")
    }
}))
buySell(buyBtns)
buySell(sellBtn)