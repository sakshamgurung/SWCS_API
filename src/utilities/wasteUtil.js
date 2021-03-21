const _ = require("lodash");

function calCurrentAmtInKg(currentAmount, amountUnit, amount){
    if(amountUnit == "kg" || amountUnit == "litre"){
        currentAmount += amount;
    }else if(wd.amountUnit == "bora"){
        currentAmount = currentAmount + ( amount * 15);//conversion from bora to 15 kg
    }
    return currentAmount;
}

function calWasteCondition(currentAmount, wasteLimit){
    let wasteCondition = "none";
    if(_.inRange(currentAmount, 1, wasteLimit/3)){
        wasteCondition = "low";
    }else if(_.inRange(currentAmount, wasteLimit/3, (wasteLimit/3)*2 )){
        wasteCondition = "medium";
    }else if(currentAmount >= wasteLimit){
        wasteCondition = "high";
    }
    return wasteCondition;
}

module.exports = {
    calCurrentAmtInKg,
    calWasteCondition
}