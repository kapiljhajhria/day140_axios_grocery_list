const axios = require('axios').default;


async function getTotalPriceInBaseCurrency(groceryList, currency, date) {
    // console.log(groceryList)
    let groceryItemPattern = RegExp(/(.*)\w+/gm);
    groceryList = groceryList.replace("$", "USD").replace("€", "EUR").replace("₹", "INR").replace("£", "GBP").replace(",", "").match(groceryItemPattern)
    console.log(groceryList)
    let currencyPattern = RegExp(/([A-Z]{3} ?)\d?\w+/gm) //group0 selects currency only
    let detailedGroceryList = [];
    for (gr of groceryList) {
        let currency = gr.match(currencyPattern)[0].substring(0, 3);
        let itemName = gr.split(currency)[0].trim()
        let itemPrice = gr.split(currency)[1].trim()
        detailedGroceryList.push({"name": itemName, "price": itemPrice.replace(RegExp(/,/g),""), "currency": currency})
    }
    //convert all prices to USD first
    //step 1 get exchange rates of that particular day
    const getExchangeRates = async () => {
        try {
            return await axios.get('https://openexchangerates.org/api/historical/' + date + '.json?app_id=5d1771dbf67949858b81f864d40d9764')
        } catch (error) {
            console.error(error)
        }
    }
    let exchangeRates;
    await getExchangeRates().then((res) => exchangeRates = res.data.rates);
    // console.log(exchangeRates)
    let totalPrice=0;
    for (item of detailedGroceryList) {
        item.usdPrice=(item.price/exchangeRates[`${item.currency}`]);
        item.convertedPrice=item.usdPrice*exchangeRates[`${currency}`]
        totalPrice =totalPrice+item.convertedPrice;
    }
    // console.log(totalPrice)
    // console.log(detailedGroceryList)
    return totalPrice.toFixed(2)
}

// Replace $ with USD, € with EUR, ₹ with INR and £ with GBP
getTotalPriceInBaseCurrency(`apples $16.00
orange juice €4
rice packets ₹700
Washing machine AUD1,286.22
cashew nuts CHF48
4 motorcycles IDR 2,600,000`, "AUD", '2020-02-16').then((v)=>console.log(v))

// should return 1403.99 as a float
